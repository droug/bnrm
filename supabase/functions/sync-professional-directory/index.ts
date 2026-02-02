import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type RegistrationData = Record<string, unknown> | null;

const getEmailFromRegistrationData = (registrationData: RegistrationData): string | null => {
  if (!registrationData) return null;
  const email = (registrationData["email"] ?? registrationData["contact_email"]) as string | undefined;
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  return normalized.length ? normalized : null;
};

const unique = (values: (string | null | undefined)[]) => {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of values) {
    if (!v) continue;
    const key = v.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ success: false, error: "Missing Supabase env" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    const caller = userData?.user;
    if (userError || !caller) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .limit(1);

    if (rolesError || !roles?.length) {
      return new Response(JSON.stringify({ success: false, error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: approvedRequests, error: reqError } = await supabaseAdmin
      .from("professional_registration_requests")
      .select("professional_type, registration_data")
      .eq("status", "approved")
      .in("professional_type", ["editor", "printer"]);

    if (reqError) {
      return new Response(JSON.stringify({ success: false, error: reqError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const editorEmails = unique(
      (approvedRequests ?? [])
        .filter((r: any) => r.professional_type === "editor")
        .map((r: any) => getEmailFromRegistrationData(r.registration_data as RegistrationData))
    );

    const printerEmails = unique(
      (approvedRequests ?? [])
        .filter((r: any) => r.professional_type === "printer")
        .map((r: any) => getEmailFromRegistrationData(r.registration_data as RegistrationData))
    );

    const now = new Date().toISOString();

    const invalidateTable = async (table: "publishers" | "printers") => {
      const { error } = await supabaseAdmin
        .from(table)
        .update({ is_validated: false, updated_at: now })
        // Avoid a full-table update: only flip rows that are not already false
        .neq("is_validated", false);
      return { error };
    };

    const validateByEmails = async (table: "publishers" | "printers", emails: string[]) => {
      if (!emails.length) return { updated: 0, errors: [] as string[] };
      let updated = 0;
      const errors: string[] = [];

      // Case-insensitive match per-email to avoid missing rows due to email casing
      for (const email of emails) {
        const { data, error } = await supabaseAdmin
          .from(table)
          .update({ is_validated: true, deleted_at: null, updated_at: now })
          .ilike("email", email)
          .select("id");

        if (error) {
          errors.push(`${table}:${email}:${error.message}`);
          continue;
        }
        updated += (data?.length ?? 0);
      }

      return { updated, errors };
    };

    const invalidatePublishers = await invalidateTable("publishers");
    if (invalidatePublishers.error) {
      return new Response(
        JSON.stringify({ success: false, error: invalidatePublishers.error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const invalidatePrinters = await invalidateTable("printers");
    if (invalidatePrinters.error) {
      return new Response(
        JSON.stringify({ success: false, error: invalidatePrinters.error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const publishersRes = await validateByEmails("publishers", editorEmails);
    const printersRes = await validateByEmails("printers", printerEmails);

    return new Response(
      JSON.stringify({
        success: true,
        editor_emails: editorEmails.length,
        printer_emails: printerEmails.length,
        publishers_updated: publishersRes.updated,
        printers_updated: printersRes.updated,
        errors: [...publishersRes.errors, ...printersRes.errors],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
