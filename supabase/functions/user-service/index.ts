import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserRequest {
  action: 'get_profile' | 'update_profile' | 'get_roles' | 'assign_role' | 'get_permissions' | 'list_users';
  user_id?: string;
  profile_data?: Record<string, any>;
  role?: string;
  filters?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const currentUser = userData.user;
    if (!currentUser) throw new Error("User not authenticated");

    const { action, user_id, profile_data, role, filters }: UserRequest = await req.json();

    console.log(`[USER-SERVICE] Action: ${action}`);

    switch (action) {
      case 'get_profile': {
        const targetUserId = user_id || currentUser.id;

        const { data, error } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('user_id', targetUserId)
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ profile: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'update_profile': {
        const targetUserId = user_id || currentUser.id;

        // Vérifier que l'utilisateur ne modifie que son propre profil ou est admin
        const { data: currentProfile } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('user_id', currentUser.id)
          .single();

        if (targetUserId !== currentUser.id && currentProfile?.role !== 'admin') {
          throw new Error("Unauthorized to update other user profiles");
        }

        const { data, error } = await supabaseClient
          .from('profiles')
          .update({
            ...profile_data,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', targetUserId)
          .select()
          .single();

        if (error) throw error;

        // Log l'activité
        await supabaseClient
          .from('activity_logs')
          .insert({
            user_id: currentUser.id,
            action: 'profile_updated',
            resource_type: 'profile',
            resource_id: targetUserId,
            details: profile_data,
          });

        return new Response(JSON.stringify({ success: true, profile: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'get_roles': {
        const targetUserId = user_id || currentUser.id;

        const { data, error } = await supabaseClient
          .from('user_roles')
          .select('*')
          .eq('user_id', targetUserId);

        if (error) throw error;

        return new Response(JSON.stringify({ roles: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'assign_role': {
        // Vérifier que l'utilisateur est admin
        const { data: adminCheck } = await supabaseClient
          .rpc('has_role', { _user_id: currentUser.id, _role: 'admin' });

        if (!adminCheck) {
          throw new Error("Only admins can assign roles");
        }

        const { data, error } = await supabaseClient
          .from('user_roles')
          .insert({
            user_id,
            role,
          })
          .select()
          .single();

        if (error) throw error;

        // Log l'activité
        await supabaseClient
          .from('activity_logs')
          .insert({
            user_id: currentUser.id,
            action: 'role_assigned',
            resource_type: 'user_role',
            resource_id: user_id,
            details: { role },
          });

        return new Response(JSON.stringify({ success: true, user_role: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'get_permissions': {
        const targetUserId = user_id || currentUser.id;

        const { data, error } = await supabaseClient
          .rpc('get_user_permissions', { user_uuid: targetUserId });

        if (error) throw error;

        return new Response(JSON.stringify({ permissions: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'list_users': {
        // Vérifier que l'utilisateur est admin ou librarian
        const { data: isAdmin } = await supabaseClient
          .rpc('is_admin_or_librarian', { user_uuid: currentUser.id });

        if (!isAdmin) {
          throw new Error("Only admins and librarians can list users");
        }

        let query = supabaseClient
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        // Appliquer les filtres
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              query = query.eq(key, value);
            }
          });
        }

        const { data, error } = await query;
        if (error) throw error;

        return new Response(JSON.stringify({ users: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
    }
  } catch (error) {
    console.error('[USER-SERVICE] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
