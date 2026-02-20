import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { sendEmail } from "../_shared/smtp-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = (Deno.env.get("SITE_URL") || "https://bnrm-dev.digiup.ma").replace(/\/$/, "");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const now = new Date().toISOString();
    const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // ── 1. Expirer les abonnements dépassés ──────────────────────────────────
    const { data: expiredSubs, error: expireError } = await supabase
      .from('service_registrations')
      .update({ status: 'expired', updated_at: now })
      .eq('status', 'active')
      .not('expires_at', 'is', null)
      .lt('expires_at', now)
      .select(`
        id, user_id, service_id, expires_at,
        registration_data,
        bnrm_services (nom_service, categorie)
      `);

    if (expireError) {
      console.error('[EXPIRY] Error expiring subscriptions:', expireError);
    } else {
      console.log(`[EXPIRY] Expired ${expiredSubs?.length ?? 0} subscription(s)`);

      // Notifier les abonnés expirés
      for (const sub of expiredSubs || []) {
        const email = sub.registration_data?.email;
        const firstName = sub.registration_data?.firstName || '';
        const lastName = sub.registration_data?.lastName || '';
        const serviceName = (sub.bnrm_services as any)?.nom_service || 'votre service';

        if (email) {
          try {
            await sendEmail({
              to: email,
              subject: `Votre abonnement BNRM a expiré – ${serviceName}`,
              html: buildExpiredEmail(firstName, lastName, serviceName),
            });

            // Notification in-app
            await supabase.from('notifications').insert({
              user_id: sub.user_id,
              type: 'subscription',
              title: 'Abonnement expiré',
              message: `Votre abonnement "${serviceName}" a expiré. Renouvelez-le pour continuer à accéder aux services BNRM.`,
              is_read: false,
              link: '/abonnements',
              related_url: '/abonnements',
              priority: 5,
              category: 'subscription',
              module: 'bnrm',
            });
          } catch (emailErr) {
            console.error(`[EXPIRY] Could not notify expired user ${email}:`, emailErr);
          }
        }
      }
    }

    // ── 2. Envoyer rappels J-7 ───────────────────────────────────────────────
    const { data: reminders, error: reminderError } = await supabase
      .from('service_registrations')
      .select(`
        id, user_id, service_id, expires_at,
        registration_data,
        bnrm_services (nom_service, categorie)
      `)
      .eq('status', 'active')
      .eq('renewal_reminder_sent', false)
      .not('expires_at', 'is', null)
      .gte('expires_at', now)
      .lte('expires_at', sevenDaysLater);

    if (reminderError) {
      console.error('[REMINDER] Error fetching reminders:', reminderError);
    } else {
      console.log(`[REMINDER] Found ${reminders?.length ?? 0} reminder(s) to send`);

      for (const sub of reminders || []) {
        const email = sub.registration_data?.email;
        const firstName = sub.registration_data?.firstName || '';
        const lastName = sub.registration_data?.lastName || '';
        const serviceName = (sub.bnrm_services as any)?.nom_service || 'votre service';
        const expiresAt = new Date(sub.expires_at!);
        const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const expiryFormatted = expiresAt.toLocaleDateString('fr-MA', {
          day: '2-digit', month: 'long', year: 'numeric',
        });

        if (email) {
          try {
            await sendEmail({
              to: email,
              subject: `Rappel : votre abonnement BNRM expire dans ${daysLeft} jour(s)`,
              html: buildRenewalReminderEmail(firstName, lastName, serviceName, daysLeft, expiryFormatted),
            });

            // Marquer le rappel comme envoyé
            await supabase
              .from('service_registrations')
              .update({ renewal_reminder_sent: true })
              .eq('id', sub.id);

            // Notification in-app
            await supabase.from('notifications').insert({
              user_id: sub.user_id,
              type: 'subscription',
              title: `Abonnement expire dans ${daysLeft} jour(s)`,
              message: `Votre abonnement "${serviceName}" expire le ${expiryFormatted}. Renouvelez-le dès maintenant.`,
              is_read: false,
              link: '/abonnements',
              related_url: '/abonnements',
              priority: 4,
              category: 'subscription',
              module: 'bnrm',
            });

            console.log(`[REMINDER] Sent renewal reminder to ${email} (${daysLeft} days left)`);
          } catch (emailErr) {
            console.error(`[REMINDER] Could not send reminder to ${email}:`, emailErr);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        expired: expiredSubs?.length ?? 0,
        reminders_sent: reminders?.length ?? 0,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[CHECK-SUBSCRIPTION-EXPIRY] Unexpected error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ── Templates HTML ─────────────────────────────────────────────────────────

function buildRenewalReminderEmail(
  firstName: string,
  lastName: string,
  serviceName: string,
  daysLeft: number,
  expiryFormatted: string
): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Rappel renouvellement BNRM</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1a4f8a;padding:24px 32px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">BNRM</h1>
              <p style="color:#c8ddf5;margin:4px 0 0 0;font-size:13px;">Bibliothèque Nationale du Royaume du Maroc</p>
            </td>
          </tr>
          <!-- Alert banner -->
          <tr>
            <td style="background:#fff3cd;border-left:4px solid #f59e0b;padding:14px 32px;">
              <p style="margin:0;color:#92400e;font-weight:600;font-size:14px;">
                ⚠️ Votre abonnement expire dans <strong>${daysLeft} jour${daysLeft > 1 ? 's' : ''}</strong>
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="color:#374151;font-size:15px;margin:0 0 16px 0;">
                Bonjour <strong>${firstName} ${lastName}</strong>,
              </p>
              <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px 0;">
                Nous vous informons que votre abonnement au service <strong>« ${serviceName} »</strong>
                de la Bibliothèque Nationale du Royaume du Maroc arrivera à échéance
                le <strong>${expiryFormatted}</strong>.
              </p>
              <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 24px 0;">
                Pour continuer à bénéficier de nos services sans interruption, nous vous invitons
                à renouveler votre abonnement dès maintenant.
              </p>
              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px auto;">
                <tr>
                  <td style="border-radius:6px;background:#1a4f8a;">
                    <a href="${SITE_URL}/abonnements"
                       style="display:inline-block;padding:14px 32px;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;border-radius:6px;">
                      Renouveler mon abonnement
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#6b7280;font-size:12px;text-align:center;margin:0;">
                Si vous avez des questions, contactez-nous à
                <a href="mailto:contact@bnrm.ma" style="color:#1a4f8a;">contact@bnrm.ma</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
              <p style="color:#9ca3af;font-size:11px;margin:0;">
                BNRM – Avenue Ibn Khaldoun, Rabat – Maroc<br/>
                Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildExpiredEmail(
  firstName: string,
  lastName: string,
  serviceName: string
): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Abonnement expiré – BNRM</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1a4f8a;padding:24px 32px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">BNRM</h1>
              <p style="color:#c8ddf5;margin:4px 0 0 0;font-size:13px;">Bibliothèque Nationale du Royaume du Maroc</p>
            </td>
          </tr>
          <!-- Alert banner -->
          <tr>
            <td style="background:#fee2e2;border-left:4px solid #ef4444;padding:14px 32px;">
              <p style="margin:0;color:#991b1b;font-weight:600;font-size:14px;">
                ❌ Votre abonnement a expiré
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="color:#374151;font-size:15px;margin:0 0 16px 0;">
                Bonjour <strong>${firstName} ${lastName}</strong>,
              </p>
              <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px 0;">
                Votre abonnement au service <strong>« ${serviceName} »</strong>
                de la Bibliothèque Nationale du Royaume du Maroc a expiré.
              </p>
              <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 24px 0;">
                Vous pouvez renouveler votre abonnement à tout moment pour continuer
                à bénéficier de l'ensemble de nos services.
              </p>
              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px auto;">
                <tr>
                  <td style="border-radius:6px;background:#1a4f8a;">
                    <a href="${SITE_URL}/abonnements"
                       style="display:inline-block;padding:14px 32px;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;border-radius:6px;">
                      Renouveler mon abonnement
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#6b7280;font-size:12px;text-align:center;margin:0;">
                Si vous avez des questions, contactez-nous à
                <a href="mailto:contact@bnrm.ma" style="color:#1a4f8a;">contact@bnrm.ma</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
              <p style="color:#9ca3af;font-size:11px;margin:0;">
                BNRM – Avenue Ibn Khaldoun, Rabat – Maroc<br/>
                Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
