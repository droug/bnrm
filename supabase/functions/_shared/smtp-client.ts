// Client SMTP partagé pour l'envoi d'emails
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const SMTP_HOST = Deno.env.get("SMTP_HOST");
  const SMTP_PORT = Deno.env.get("SMTP_PORT");
  const SMTP_USER = Deno.env.get("SMTP_USER");
  const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD");
  const SMTP_FROM = Deno.env.get("SMTP_FROM") || options.from;

  // Vérifier si la configuration SMTP est disponible
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
    console.warn("SMTP configuration incomplete, checking for Resend fallback...");
    
    // Fallback vers Resend si configuré
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      return await sendViaResend(options, RESEND_API_KEY);
    }
    
    return { 
      success: false, 
      error: "Email service not configured (SMTP or Resend)" 
    };
  }

  try {
    console.log(`Sending email via SMTP to: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
    
    const client = new SMTPClient({
      connection: {
        hostname: SMTP_HOST,
        port: parseInt(SMTP_PORT, 10),
        tls: parseInt(SMTP_PORT, 10) === 465,
        auth: {
          username: SMTP_USER,
          password: SMTP_PASSWORD,
        },
      },
    });

    await client.send({
      from: SMTP_FROM || "noreply@bnrm.ma",
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      content: "auto",
      html: options.html,
    });

    await client.close();

    console.log("Email sent successfully via SMTP");
    return { success: true };
  } catch (error: any) {
    console.error("SMTP error:", error);
    
    // Tentative de fallback vers Resend en cas d'erreur SMTP
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      console.log("Attempting fallback to Resend...");
      return await sendViaResend(options, RESEND_API_KEY);
    }
    
    return { 
      success: false, 
      error: `SMTP error: ${error.message}` 
    };
  }
}

async function sendViaResend(options: EmailOptions, apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Fallback: Sending email via Resend to: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
    
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: options.from || "BNRM - Bibliothèque Nationale <onboarding@resend.dev>",
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Resend error:", errorData);
      return { 
        success: false, 
        error: `Resend error: ${errorData.message || 'Unknown error'}` 
      };
    }

    console.log("Email sent successfully via Resend (fallback)");
    return { success: true };
  } catch (error: any) {
    console.error("Resend fallback error:", error);
    return { 
      success: false, 
      error: `Resend error: ${error.message}` 
    };
  }
}
