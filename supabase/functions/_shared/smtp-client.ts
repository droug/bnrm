// Client SMTP partagé pour l'envoi d'emails via nodemailer
// IMPORTANT: Ce module utilise la configuration SMTP définie dans les secrets Supabase
// (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM)

import nodemailer from "npm:nodemailer@6.9.12";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: string; // Base64 encoded content
  }>;
}

export interface EmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
  method?: 'smtp' | 'resend';
}

/**
 * Envoie un email via SMTP (configuration admin) avec fallback vers Resend
 * 
 * Configuration requise (secrets Supabase):
 * - SMTP_HOST: Serveur SMTP (ex: smtp.gmail.com)
 * - SMTP_PORT: Port SMTP (587 pour STARTTLS, 465 pour SSL)
 * - SMTP_USER: Nom d'utilisateur SMTP
 * - SMTP_PASSWORD: Mot de passe SMTP (mot de passe d'application pour Gmail)
 * - SMTP_FROM: Adresse d'expédition (optionnel, utilise SMTP_USER si non défini)
 * - RESEND_API_KEY: Clé API Resend (fallback optionnel)
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const SMTP_HOST = Deno.env.get("SMTP_HOST");
  const SMTP_PORT = Deno.env.get("SMTP_PORT");
  const SMTP_USER = Deno.env.get("SMTP_USER");
  const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD");
  const SMTP_FROM = Deno.env.get("SMTP_FROM");

  // Vérifier si la configuration SMTP est complète
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASSWORD) {
    try {
      const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;
      console.log(`[SMTP-CLIENT] Sending email via SMTP to: ${recipients}`);
      console.log(`[SMTP-CLIENT] SMTP Config - Host: ${SMTP_HOST}, Port: ${SMTP_PORT}`);

      const port = parseInt(SMTP_PORT, 10);
      // Gmail: port 465 = secure (SSL), port 587 = STARTTLS
      const isSecure = port === 465;

      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: port,
        secure: isSecure,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD,
        },
      });

      // Utiliser l'email d'authentification comme expéditeur si SMTP_FROM est invalide
      const fromAddress = SMTP_FROM && SMTP_FROM.includes('@') ? SMTP_FROM : SMTP_USER;

      const mailOptions: any = {
        from: options.from || fromAddress,
        to: Array.isArray(options.to) ? options.to : options.to,
        subject: options.subject,
        html: options.html,
      };

      // Ajouter les pièces jointes si présentes
      if (options.attachments && options.attachments.length > 0) {
        mailOptions.attachments = options.attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          encoding: 'base64',
        }));
      }

      const info = await transporter.sendMail(mailOptions);

      console.log(`[SMTP-CLIENT] Email sent successfully via SMTP, messageId: ${info.messageId}`);
      return { 
        success: true, 
        messageId: info.messageId,
        method: 'smtp'
      };
    } catch (error: any) {
      console.error("[SMTP-CLIENT] SMTP error:", error.message || error);
      console.log("[SMTP-CLIENT] Attempting fallback to Resend...");
      // Continuer vers Resend si SMTP échoue
    }
  } else {
    console.warn("[SMTP-CLIENT] SMTP not fully configured, trying Resend fallback...");
  }

  // Fallback vers Resend
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (RESEND_API_KEY) {
    return await sendViaResend(options, RESEND_API_KEY);
  }

  return { 
    success: false, 
    error: "No email service configured (SMTP or Resend). Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD in Supabase secrets." 
  };
}

/**
 * Fallback: Envoie un email via Resend API
 */
async function sendViaResend(options: EmailOptions, apiKey: string): Promise<EmailResult> {
  try {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    console.log(`[SMTP-CLIENT] Fallback: Sending email via Resend to: ${recipients.join(', ')}`);
    
    const body: any = {
      from: options.from || "BNRM - Bibliothèque Nationale <onboarding@resend.dev>",
      to: recipients,
      subject: options.subject,
      html: options.html,
    };

    // Ajouter les pièces jointes si présentes
    if (options.attachments && options.attachments.length > 0) {
      body.attachments = options.attachments.map(att => ({
        filename: att.filename,
        content: att.content,
      }));
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[SMTP-CLIENT] Resend error:", errorData);
      return { 
        success: false, 
        error: `Resend error: ${errorData.message || 'Unknown error'}` 
      };
    }

    const data = await response.json();
    console.log("[SMTP-CLIENT] Email sent successfully via Resend (fallback)");
    return { 
      success: true, 
      messageId: data.id,
      method: 'resend'
    };
  } catch (error: any) {
    console.error("[SMTP-CLIENT] Resend fallback error:", error);
    return { 
      success: false, 
      error: `Resend error: ${error.message}` 
    };
  }
}
