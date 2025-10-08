import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  campaignId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { campaignId }: EmailRequest = await req.json();

    console.log("Processing mass email campaign:", campaignId);

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("email_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error("Campaign not found");
    }

    // Get recipients based on recipient_type
    let recipients: string[] = [];
    
    if (campaign.recipient_type === "custom" && campaign.custom_recipients) {
      recipients = campaign.custom_recipients;
    } else if (campaign.recipient_type === "all_subscribers") {
      const { data: subscribers } = await supabase
        .from("newsletter_subscribers")
        .select("email")
        .eq("is_active", true);
      recipients = subscribers?.map((s: any) => s.email) || [];
    } else {
      // Get emails based on role
      const roleMapping: { [key: string]: string[] } = {
        publishers: ["publisher", "editor"],
        printers: ["printer"],
        researchers: ["researcher"],
      };
      
      const roles = roleMapping[campaign.recipient_type] || [];
      if (roles.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id")
          .in("role", roles);
        
        if (profiles) {
          const userIds = profiles.map((p: any) => p.user_id);
          const { data: users } = await supabase.auth.admin.listUsers();
          recipients = users.users
            .filter((u: any) => userIds.includes(u.id))
            .map((u: any) => u.email || "");
        }
      }
    }

    // Update campaign status
    await supabase
      .from("email_campaigns")
      .update({ 
        status: "sending",
        total_recipients: recipients.length 
      })
      .eq("id", campaignId);

    let totalSent = 0;
    let totalFailed = 0;

    // Send emails in batches
    const batchSize = 50;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      for (const email of batch) {
        try {
          // Get template if exists
          let htmlContent = campaign.html_content || "";
          
          if (campaign.template_id) {
            const { data: template } = await supabase
              .from("email_templates")
              .select("html_content, subject")
              .eq("id", campaign.template_id)
              .single();
            
            if (template) {
              htmlContent = template.html_content;
            }
          }

          const emailResponse = await resend.emails.send({
            from: `${campaign.from_name} <${campaign.from_email}>`,
            to: [email],
            subject: campaign.subject,
            html: htmlContent,
          });

          console.log("Email sent to:", email, emailResponse);

          // Log success
          await supabase.from("email_campaign_logs").insert({
            campaign_id: campaignId,
            recipient_email: email,
            status: "sent",
            metadata: { resend_id: emailResponse.data?.id },
          });

          totalSent++;
        } catch (error: any) {
          console.error("Error sending email to:", email, error);

          // Log failure
          await supabase.from("email_campaign_logs").insert({
            campaign_id: campaignId,
            recipient_email: email,
            status: "failed",
            error_message: error.message,
          });

          totalFailed++;
        }
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Update campaign final status
    await supabase
      .from("email_campaigns")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        total_sent: totalSent,
        total_failed: totalFailed,
      })
      .eq("id", campaignId);

    return new Response(
      JSON.stringify({
        success: true,
        totalSent,
        totalFailed,
        totalRecipients: recipients.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-mass-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
