import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  printerEmail: string;
  printerName: string;
  printerId: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { printerEmail, printerName, printerId } =
      (await req.json()) as InvitationRequest;

    if (!printerEmail || !printerName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get SMTP credentials from environment
    const smtpUser = Deno.env.get("GMAIL_USER");
    const smtpPass = Deno.env.get("GMAIL_APP_PASSWORD");

    if (!smtpUser || !smtpPass) {
      console.error("SMTP credentials not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build registration URL
    const baseUrl = Deno.env.get("PUBLIC_SITE_URL") || "https://bnrm.lovable.app";
    const registrationUrl = `${baseUrl}/signup?role=printer&ref=${printerId}`;

    // Email content
    const emailSubject = "Invitation à rejoindre la plateforme BNRM - Dépôt Légal";
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1a365d 0%, #2d5a87 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Bibliothèque Nationale du Royaume du Maroc</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Plateforme de Dépôt Légal</p>
  </div>
  
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1a365d; margin-top: 0;">Bonjour ${printerName},</h2>
    
    <p>Vous avez été mentionné comme imprimeur dans le cadre d'une déclaration de dépôt légal sur la plateforme de la Bibliothèque Nationale du Royaume du Maroc.</p>
    
    <p>Pour pouvoir confirmer les déclarations qui vous concernent et accéder à votre espace professionnel, nous vous invitons à créer votre compte sur notre plateforme.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${registrationUrl}" 
         style="background: linear-gradient(135deg, #1a365d 0%, #2d5a87 100%); 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 6px; 
                font-weight: bold;
                display: inline-block;">
        Créer mon compte Imprimeur
      </a>
    </div>
    
    <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;"><strong>Important :</strong> Votre inscription sera soumise à validation dans un délai de 10 jours ouvrables.</p>
    </div>
    
    <p>En créant votre compte, vous pourrez :</p>
    <ul style="color: #555;">
      <li>Confirmer les déclarations de dépôt légal vous concernant</li>
      <li>Suivre l'état de vos confirmations</li>
      <li>Accéder à votre historique</li>
      <li>Recevoir des notifications importantes</li>
    </ul>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">
    
    <p style="font-size: 12px; color: #666; margin-bottom: 0;">
      Cet email a été envoyé automatiquement par la plateforme de dépôt légal de la BNRM.<br>
      Si vous n'êtes pas concerné par ce message, veuillez l'ignorer.
    </p>
  </div>
</body>
</html>
    `.trim();

    // Send email using SMTP (nodemailer approach via fetch to external service or direct SMTP)
    // For simplicity, we'll use a basic SMTP approach via Deno
    
    const encoder = new TextEncoder();
    
    // Try connecting to SMTP
    const smtpHost = "smtp.gmail.com";
    const smtpPorts = [587, 465];
    
    let emailSent = false;
    
    for (const port of smtpPorts) {
      try {
        const conn = await Deno.connect({ hostname: smtpHost, port });
        
        const read = async () => {
          const buf = new Uint8Array(1024);
          const n = await conn.read(buf);
          return new TextDecoder().decode(buf.subarray(0, n || 0));
        };
        
        const write = async (cmd: string) => {
          await conn.write(encoder.encode(cmd + "\r\n"));
          return await read();
        };
        
        await read(); // Initial greeting
        await write(`EHLO ${smtpHost}`);
        await write("STARTTLS");
        
        // Upgrade to TLS
        const tlsConn = await Deno.startTls(conn, { hostname: smtpHost });
        
        const readTls = async () => {
          const buf = new Uint8Array(1024);
          const n = await tlsConn.read(buf);
          return new TextDecoder().decode(buf.subarray(0, n || 0));
        };
        
        const writeTls = async (cmd: string) => {
          await tlsConn.write(encoder.encode(cmd + "\r\n"));
          return await readTls();
        };
        
        await writeTls(`EHLO ${smtpHost}`);
        await writeTls("AUTH LOGIN");
        await writeTls(btoa(smtpUser));
        await writeTls(btoa(smtpPass));
        await writeTls(`MAIL FROM:<${smtpUser}>`);
        await writeTls(`RCPT TO:<${printerEmail}>`);
        await writeTls("DATA");
        
        const emailData = [
          `From: BNRM - Depot Legal <${smtpUser}>`,
          `To: ${printerEmail}`,
          `Subject: ${emailSubject}`,
          "MIME-Version: 1.0",
          'Content-Type: text/html; charset="UTF-8"',
          "",
          emailBody,
          ".",
        ].join("\r\n");
        
        await writeTls(emailData);
        await writeTls("QUIT");
        
        tlsConn.close();
        emailSent = true;
        break;
      } catch (e) {
        console.error(`Failed to send via port ${port}:`, e);
        continue;
      }
    }

    if (!emailSent) {
      // Log the invitation for manual follow-up
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.from("activity_logs").insert({
        action: "printer_invitation_pending",
        resource_type: "printer",
        resource_id: printerId,
        details: {
          email: printerEmail,
          name: printerName,
          reason: "SMTP delivery failed, manual follow-up required",
        },
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Email queued for manual delivery" 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Log successful invitation
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await supabase.from("activity_logs").insert({
      action: "printer_invitation_sent",
      resource_type: "printer",
      resource_id: printerId,
      details: {
        email: printerEmail,
        name: printerName,
      },
    });

    return new Response(
      JSON.stringify({ success: true, message: "Invitation sent successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-printer-invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
