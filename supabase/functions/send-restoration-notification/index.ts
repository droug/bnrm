import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { sendEmail } from "../_shared/smtp-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  requestId: string;
  recipientEmail: string;
  recipientId: string;
  notificationType: string;
  requestNumber: string;
  manuscriptTitle: string;
  quoteAmount?: number;
  estimatedDuration?: number;
  additionalInfo?: string;
  rejectionReason?: string;
  paymentUrl?: string;
}

const SITE_URL = Deno.env.get("SITE_URL") || "https://bnrm-dev.digiup.ma";

const getEmailStyles = () => `
  <style>
    .email-container { font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #2c5aa0 0%, #1e3d6f 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .header .subtitle { margin-top: 8px; opacity: 0.9; font-size: 14px; }
    .content { padding: 30px; }
    .info-box { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #6c757d; font-size: 14px; }
    .info-value { color: #212529; font-weight: 600; font-size: 14px; }
    .highlight-box { background-color: #e8f4fd; border-left: 4px solid #2c5aa0; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .warning-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .success-box { background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .error-box { background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #2c5aa0 0%, #1e3d6f 100%); color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .amount { font-size: 28px; color: #2c5aa0; font-weight: 700; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; border-top: 1px solid #e9ecef; }
    .footer a { color: #2c5aa0; text-decoration: none; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; }
  </style>
`;

const getEmailHeader = (title: string, subtitle?: string) => `
  <div class="header">
    <h1>🏛️ BNRM - Service de Restauration</h1>
    ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
  </div>
`;

const getEmailFooter = () => `
  <div class="footer">
    <p><strong>Bibliothèque Nationale du Royaume du Maroc</strong></p>
    <p>Service de Restauration et Conservation</p>
    <p>📍 Avenue Ibn Khaldoun, Agdal, Rabat</p>
    <p>📞 +212 5 37 77 18 60 | ✉️ <a href="mailto:restauration@bnrm.ma">restauration@bnrm.ma</a></p>
    <p style="margin-top: 15px;"><a href="${SITE_URL}">Accéder au portail BNRM</a></p>
  </div>
`;

const getEmailContent = (n: NotificationRequest) => {
  const { notificationType, requestNumber, manuscriptTitle, quoteAmount, estimatedDuration, additionalInfo, rejectionReason } = n;
  const styles = getEmailStyles();
  const trackingUrl = `${SITE_URL}/my-space`;
  
  switch (notificationType) {
    case 'request_received':
      return { 
        subject: `✅ Demande de restauration enregistrée - ${requestNumber}`, 
        html: `<!DOCTYPE html><html><head>${styles}</head><body>
          <div class="email-container">
            ${getEmailHeader('Demande enregistrée', 'Votre demande a bien été reçue')}
            <div class="content">
              <p>Madame, Monsieur,</p>
              <p>Nous accusons réception de votre demande de restauration. Celle-ci sera examinée par notre équipe dans les plus brefs délais.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Numéro de demande</span>
                  <span class="info-value">${requestNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Œuvre concernée</span>
                  <span class="info-value">${manuscriptTitle || 'Non spécifiée'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Statut actuel</span>
                  <span class="info-value">En attente d'examen</span>
                </div>
              </div>

              <div class="highlight-box">
                <h3 style="margin-top: 0; color: #2c5aa0;">📋 Prochaines étapes</h3>
                <ol style="margin-bottom: 0;">
                  <li>Examen de votre demande par la Direction</li>
                  <li>Notification de la décision (autorisation ou demande d'informations complémentaires)</li>
                  <li>Si autorisée, invitation à déposer l'œuvre</li>
                </ol>
              </div>

              <p>Vous pouvez suivre l'état de votre demande à tout moment depuis votre espace personnel.</p>
              
              <div style="text-align: center;">
                <a href="${trackingUrl}" class="cta-button">Suivre ma demande</a>
              </div>
            </div>
            ${getEmailFooter()}
          </div>
        </body></html>` 
      };

    case 'authorized':
      return { 
        subject: `🎉 Demande de restauration AUTORISÉE - ${requestNumber}`, 
        html: `<!DOCTYPE html><html><head>${styles}</head><body>
          <div class="email-container">
            ${getEmailHeader('Demande autorisée', 'Votre demande a été approuvée')}
            <div class="content">
              <p>Madame, Monsieur,</p>
              <p>Nous avons le plaisir de vous informer que votre demande de restauration a été <strong>autorisée</strong> par la Direction.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Numéro de demande</span>
                  <span class="info-value">${requestNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Œuvre concernée</span>
                  <span class="info-value">${manuscriptTitle || 'Non spécifiée'}</span>
                </div>
              </div>

              <div class="success-box">
                <h3 style="margin-top: 0; color: #155724;">✅ Action requise</h3>
                <p style="margin-bottom: 0;"><strong>Veuillez vous présenter au Service de Restauration de la BNRM</strong> afin de déposer votre œuvre pour diagnostic et établissement du devis.</p>
              </div>

              <div class="warning-box">
                <h3 style="margin-top: 0; color: #856404;">⚠️ Informations importantes</h3>
                <ul style="margin-bottom: 0;">
                  <li>Munissez-vous du numéro de demande: <strong>${requestNumber}</strong></li>
                  <li>Apportez une pièce d'identité valide (CIN ou passeport)</li>
                  <li>L'œuvre doit être correctement protégée pour le transport</li>
                  <li>Horaires d'accueil: Lundi au Vendredi, 9h00 - 16h00</li>
                </ul>
              </div>

              <div style="text-align: center;">
                <a href="${trackingUrl}" class="cta-button">Accéder à mon espace</a>
              </div>
            </div>
            ${getEmailFooter()}
          </div>
        </body></html>` 
      };

    case 'request_rejected':
      return { 
        subject: `❌ Demande de restauration non retenue - ${requestNumber}`, 
        html: `<!DOCTYPE html><html><head>${styles}</head><body>
          <div class="email-container">
            ${getEmailHeader('Demande non retenue', 'Information concernant votre demande')}
            <div class="content">
              <p>Madame, Monsieur,</p>
              <p>Nous regrettons de vous informer que votre demande de restauration n'a pas pu être retenue.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Numéro de demande</span>
                  <span class="info-value">${requestNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Œuvre concernée</span>
                  <span class="info-value">${manuscriptTitle || 'Non spécifiée'}</span>
                </div>
              </div>

              ${rejectionReason ? `
              <div class="error-box">
                <h3 style="margin-top: 0; color: #721c24;">📝 Motif</h3>
                <p style="margin-bottom: 0;">${rejectionReason}</p>
              </div>
              ` : ''}

              <p>Si vous souhaitez obtenir des informations complémentaires ou soumettre une nouvelle demande, n'hésitez pas à nous contacter.</p>
              
              <div style="text-align: center;">
                <a href="${SITE_URL}/demande-restauration" class="cta-button">Soumettre une nouvelle demande</a>
              </div>
            </div>
            ${getEmailFooter()}
          </div>
        </body></html>` 
      };

    case 'artwork_received':
      return { 
        subject: `📦 Œuvre réceptionnée - ${requestNumber}`, 
        html: `<!DOCTYPE html><html><head>${styles}</head><body>
          <div class="email-container">
            ${getEmailHeader('Œuvre réceptionnée', 'Diagnostic en cours')}
            <div class="content">
              <p>Madame, Monsieur,</p>
              <p>Nous vous confirmons la bonne réception de votre œuvre au Service de Restauration de la BNRM.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Numéro de demande</span>
                  <span class="info-value">${requestNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Œuvre</span>
                  <span class="info-value">${manuscriptTitle || 'Non spécifiée'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Statut</span>
                  <span class="info-value">Diagnostic en cours</span>
                </div>
              </div>

              <div class="highlight-box">
                <h3 style="margin-top: 0; color: #2c5aa0;">🔍 Prochaine étape</h3>
                <p style="margin-bottom: 0;">Notre équipe de restaurateurs procède actuellement à l'examen détaillé de votre œuvre. Un devis vous sera transmis dans les prochains jours.</p>
              </div>

              <div style="text-align: center;">
                <a href="${trackingUrl}" class="cta-button">Suivre ma demande</a>
              </div>
            </div>
            ${getEmailFooter()}
          </div>
        </body></html>` 
      };

    case 'quote_sent':
      return { 
        subject: `💰 Devis de restauration disponible - ${requestNumber}`, 
        html: `<!DOCTYPE html><html><head>${styles}</head><body>
          <div class="email-container">
            ${getEmailHeader('Devis disponible', 'Veuillez consulter notre proposition')}
            <div class="content">
              <p>Madame, Monsieur,</p>
              <p>Suite au diagnostic de votre œuvre, nous avons le plaisir de vous transmettre notre devis de restauration.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Numéro de demande</span>
                  <span class="info-value">${requestNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Œuvre</span>
                  <span class="info-value">${manuscriptTitle || 'Non spécifiée'}</span>
                </div>
              </div>

              <div style="text-align: center; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 30px; border-radius: 12px; margin: 25px 0;">
                <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">Montant du devis</p>
                <p class="amount" style="margin: 0;">${quoteAmount ? `${quoteAmount.toLocaleString('fr-MA')} DH` : 'À consulter'}</p>
                ${estimatedDuration ? `<p style="margin: 15px 0 0 0; color: #6c757d; font-size: 14px;">Durée estimée: <strong>${estimatedDuration} jour(s)</strong></p>` : ''}
              </div>

              <div class="warning-box">
                <h3 style="margin-top: 0; color: #856404;">📋 Ce devis comprend</h3>
                <ul style="margin-bottom: 0;">
                  <li>Diagnostic complet de l'état de conservation</li>
                  <li>Travaux de restauration et conservation</li>
                  <li>Matériaux et fournitures spécialisés</li>
                  <li>Rapport détaillé des interventions</li>
                  <li>Recommandations de conservation</li>
                </ul>
              </div>

              <div class="highlight-box">
                <h3 style="margin-top: 0; color: #2c5aa0;">💳 Modalités de paiement</h3>
                <p style="margin-bottom: 0;">Le paiement peut être effectué par virement bancaire ou sur place. Une fois le paiement validé, les travaux de restauration débuteront immédiatement.</p>
              </div>

              <p style="text-align: center;">Pour accepter ce devis et procéder au paiement, accédez à votre espace personnel:</p>
              
              <div style="text-align: center;">
                <a href="${trackingUrl}" class="cta-button">Consulter le devis complet</a>
              </div>

              <p style="font-size: 13px; color: #6c757d; text-align: center;">Ce devis est valable 30 jours à compter de sa date d'émission.</p>
            </div>
            ${getEmailFooter()}
          </div>
        </body></html>` 
      };

    case 'quote_accepted':
      return { 
        subject: `✅ Devis accepté - Restauration en cours - ${requestNumber}`, 
        html: `<!DOCTYPE html><html><head>${styles}</head><body>
          <div class="email-container">
            ${getEmailHeader('Devis accepté', 'Les travaux vont débuter')}
            <div class="content">
              <p>Madame, Monsieur,</p>
              <p>Nous vous confirmons l'acceptation de votre devis. Les travaux de restauration vont maintenant débuter.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Numéro de demande</span>
                  <span class="info-value">${requestNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Œuvre</span>
                  <span class="info-value">${manuscriptTitle || 'Non spécifiée'}</span>
                </div>
                ${quoteAmount ? `
                <div class="info-row">
                  <span class="info-label">Montant accepté</span>
                  <span class="info-value">${quoteAmount.toLocaleString('fr-MA')} DH</span>
                </div>
                ` : ''}
              </div>

              <div class="success-box">
                <h3 style="margin-top: 0; color: #155724;">🛠️ Restauration en cours</h3>
                <p style="margin-bottom: 0;">Notre équipe de restaurateurs a commencé les travaux sur votre œuvre. Nous vous tiendrons informé de l'avancement.</p>
              </div>

              <div style="text-align: center;">
                <a href="${trackingUrl}" class="cta-button">Suivre l'avancement</a>
              </div>
            </div>
            ${getEmailFooter()}
          </div>
        </body></html>` 
      };

    case 'quote_rejected':
      return { 
        subject: `Devis décliné - ${requestNumber}`, 
        html: `<!DOCTYPE html><html><head>${styles}</head><body>
          <div class="email-container">
            ${getEmailHeader('Devis décliné', 'Information concernant votre demande')}
            <div class="content">
              <p>Madame, Monsieur,</p>
              <p>Nous avons bien pris note de votre décision de ne pas donner suite au devis de restauration.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Numéro de demande</span>
                  <span class="info-value">${requestNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Œuvre</span>
                  <span class="info-value">${manuscriptTitle || 'Non spécifiée'}</span>
                </div>
              </div>

              <div class="warning-box">
                <h3 style="margin-top: 0; color: #856404;">📦 Récupération de votre œuvre</h3>
                <p style="margin-bottom: 0;">Veuillez vous présenter au Service de Restauration de la BNRM pour récupérer votre œuvre, muni de votre pièce d'identité et du numéro de demande <strong>${requestNumber}</strong>.</p>
              </div>

              <p>Si vous souhaitez reconsidérer votre décision ou discuter d'autres options, n'hésitez pas à nous contacter.</p>
            </div>
            ${getEmailFooter()}
          </div>
        </body></html>` 
      };

    case 'payment_confirmed':
      return { 
        subject: `💳 Paiement confirmé - Travaux en cours - ${requestNumber}`, 
        html: `<!DOCTYPE html><html><head>${styles}</head><body>
          <div class="email-container">
            ${getEmailHeader('Paiement confirmé', 'Merci pour votre confiance')}
            <div class="content">
              <p>Madame, Monsieur,</p>
              <p>Nous vous confirmons la bonne réception de votre paiement. Les travaux de restauration sont désormais en cours.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Numéro de demande</span>
                  <span class="info-value">${requestNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Œuvre</span>
                  <span class="info-value">${manuscriptTitle || 'Non spécifiée'}</span>
                </div>
                ${quoteAmount ? `
                <div class="info-row">
                  <span class="info-label">Montant payé</span>
                  <span class="info-value">${quoteAmount.toLocaleString('fr-MA')} DH</span>
                </div>
                ` : ''}
              </div>

              <div class="success-box">
                <h3 style="margin-top: 0; color: #155724;">✅ Confirmation de paiement</h3>
                <p style="margin-bottom: 0;">Votre paiement a été validé avec succès. Vous recevrez une facture par email dans les prochains jours.</p>
              </div>

              <div class="highlight-box">
                <h3 style="margin-top: 0; color: #2c5aa0;">📧 Prochaine notification</h3>
                <p style="margin-bottom: 0;">Vous serez informé par email dès que les travaux de restauration seront terminés et que votre œuvre sera prête à être récupérée.</p>
              </div>

              <div style="text-align: center;">
                <a href="${trackingUrl}" class="cta-button">Suivre l'avancement</a>
              </div>
            </div>
            ${getEmailFooter()}
          </div>
        </body></html>` 
      };

    case 'restoration_started':
      return { 
        subject: `🛠️ Travaux de restauration débutés - ${requestNumber}`, 
        html: `<!DOCTYPE html><html><head>${styles}</head><body>
          <div class="email-container">
            ${getEmailHeader('Restauration en cours', 'Les travaux ont commencé')}
            <div class="content">
              <p>Madame, Monsieur,</p>
              <p>Nous avons le plaisir de vous informer que les travaux de restauration de votre œuvre ont officiellement débuté.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Numéro de demande</span>
                  <span class="info-value">${requestNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Œuvre</span>
                  <span class="info-value">${manuscriptTitle || 'Non spécifiée'}</span>
                </div>
                ${estimatedDuration ? `
                <div class="info-row">
                  <span class="info-label">Durée estimée</span>
                  <span class="info-value">${estimatedDuration} jour(s)</span>
                </div>
                ` : ''}
              </div>

              <div class="highlight-box">
                <h3 style="margin-top: 0; color: #2c5aa0;">🔧 En cours de restauration</h3>
                <p style="margin-bottom: 0;">Notre équipe de restaurateurs qualifiés travaille actuellement sur votre œuvre avec le plus grand soin, en utilisant des techniques et matériaux adaptés.</p>
              </div>

              <div style="text-align: center;">
                <a href="${trackingUrl}" class="cta-button">Suivre l'avancement</a>
              </div>
            </div>
            ${getEmailFooter()}
          </div>
        </body></html>` 
      };

    case 'restoration_completed':
      return { 
        subject: `🎉 Restauration terminée - Œuvre prête - ${requestNumber}`, 
        html: `<!DOCTYPE html><html><head>${styles}</head><body>
          <div class="email-container">
            ${getEmailHeader('Restauration terminée', 'Votre œuvre est prête !')}
            <div class="content">
              <p>Madame, Monsieur,</p>
              <p>Nous avons le plaisir de vous annoncer que les travaux de restauration de votre œuvre sont maintenant <strong>terminés</strong>.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Numéro de demande</span>
                  <span class="info-value">${requestNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Œuvre</span>
                  <span class="info-value">${manuscriptTitle || 'Non spécifiée'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Statut</span>
                  <span class="info-value" style="color: #28a745;">✅ Prête pour retrait</span>
                </div>
              </div>

              <div class="success-box">
                <h3 style="margin-top: 0; color: #155724;">📦 Récupération de votre œuvre</h3>
                <p><strong>Veuillez vous présenter au Service de Restauration de la BNRM</strong> pour récupérer votre œuvre restaurée.</p>
                <ul style="margin-bottom: 0;">
                  <li>Horaires: Lundi au Vendredi, 9h00 - 16h00</li>
                  <li>Munissez-vous du numéro: <strong>${requestNumber}</strong></li>
                  <li>Apportez une pièce d'identité valide</li>
                </ul>
              </div>

              <div class="highlight-box">
                <h3 style="margin-top: 0; color: #2c5aa0;">📋 Rapport de restauration</h3>
                <p style="margin-bottom: 0;">Un rapport détaillé des interventions réalisées ainsi que des recommandations de conservation vous sera remis lors du retrait de votre œuvre.</p>
              </div>

              <div style="text-align: center;">
                <a href="${trackingUrl}" class="cta-button">Voir les détails</a>
              </div>
            </div>
            ${getEmailFooter()}
          </div>
        </body></html>` 
      };

    case 'artwork_ready':
      return { 
        subject: `📦 Œuvre prête pour retrait - ${requestNumber}`, 
        html: `<!DOCTYPE html><html><head>${styles}</head><body>
          <div class="email-container">
            ${getEmailHeader('Œuvre disponible', 'Venez récupérer votre œuvre')}
            <div class="content">
              <p>Madame, Monsieur,</p>
              <p>Votre œuvre restaurée est disponible et vous attend au Service de Restauration de la BNRM.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Numéro de demande</span>
                  <span class="info-value">${requestNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Œuvre</span>
                  <span class="info-value">${manuscriptTitle || 'Non spécifiée'}</span>
                </div>
              </div>

              <div class="success-box">
                <h3 style="margin-top: 0; color: #155724;">🏛️ Lieu de retrait</h3>
                <p><strong>Bibliothèque Nationale du Royaume du Maroc</strong></p>
                <p>Service de Restauration et Conservation</p>
                <p>Avenue Ibn Khaldoun, Agdal, Rabat</p>
                <p style="margin-bottom: 0;">Horaires: Lundi au Vendredi, 9h00 - 16h00</p>
              </div>

              <div class="warning-box">
                <h3 style="margin-top: 0; color: #856404;">⚠️ Documents requis</h3>
                <ul style="margin-bottom: 0;">
                  <li>Numéro de demande: <strong>${requestNumber}</strong></li>
                  <li>Pièce d'identité valide (CIN ou passeport)</li>
                </ul>
              </div>
            </div>
            ${getEmailFooter()}
          </div>
        </body></html>` 
      };

    default:
      return { 
        subject: `📬 Notification - Demande ${requestNumber}`, 
        html: `<!DOCTYPE html><html><head>${styles}</head><body>
          <div class="email-container">
            ${getEmailHeader('Mise à jour', 'Information concernant votre demande')}
            <div class="content">
              <p>Madame, Monsieur,</p>
              <p>Une mise à jour a été effectuée concernant votre demande de restauration.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Numéro de demande</span>
                  <span class="info-value">${requestNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Œuvre</span>
                  <span class="info-value">${manuscriptTitle || 'Non spécifiée'}</span>
                </div>
              </div>

              <p>Pour plus de détails, veuillez consulter votre espace personnel.</p>
              
              <div style="text-align: center;">
                <a href="${trackingUrl}" class="cta-button">Accéder à mon espace</a>
              </div>
            </div>
            ${getEmailFooter()}
          </div>
        </body></html>` 
      };
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const notification: NotificationRequest = await req.json();
    
    console.log("[RESTORATION-NOTIF] Sending notification:", notification.notificationType, "to:", notification.recipientEmail);

    // Insert notification record
    await supabase.from('restoration_notifications').insert({
      request_id: notification.requestId, 
      recipient_id: notification.recipientId,
      notification_type: notification.notificationType, 
      title: getEmailContent(notification).subject,
      message: `Mise à jour: ${notification.requestNumber}`, 
      is_read: false
    });

    const emailContent = getEmailContent(notification);
    
    // Use unified SMTP client
    const result = await sendEmail({
      to: notification.recipientEmail,
      subject: emailContent.subject,
      html: emailContent.html
    });
    
    console.log("[RESTORATION-NOTIF] Email result:", result);
    
    return new Response(JSON.stringify({ 
      success: true, 
      email_sent: result.success, 
      method: result.method,
      notificationType: notification.notificationType
    }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    console.error("[RESTORATION-NOTIF] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});
