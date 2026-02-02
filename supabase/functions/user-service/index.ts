import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserRequest {
  action: 'get_profile' | 'update_profile' | 'get_roles' | 'assign_role' | 'get_permissions' | 'list_users' | 'delete_professional';
  user_id?: string;
  profile_data?: Record<string, any>;
  role?: string;
  filters?: Record<string, any>;
  reason?: string;
  deleted_reason?: string;
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

    const { action, user_id, profile_data, role, filters, deleted_reason }: UserRequest = await req.json();

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

      case 'delete_professional': {
        // Vérifier que l'utilisateur est admin
        const { data: adminCheck } = await supabaseClient
          .rpc('has_role', { _user_id: currentUser.id, _role: 'admin' });

        if (!adminCheck) {
          throw new Error("Seuls les administrateurs peuvent supprimer des comptes professionnels");
        }

        if (!user_id) {
          throw new Error("L'ID utilisateur est requis");
        }

        console.log(`[USER-SERVICE] Deleting professional account: ${user_id}`);

        // Récupérer les infos du profil avant suppression pour le log
        const { data: profileToDelete } = await supabaseClient
          .from('profiles')
          .select('first_name, last_name, email, institution, role')
          .eq('user_id', user_id)
          .single();

        // Récupérer les infos de la demande d'inscription
        const { data: registrationRequest } = await supabaseClient
          .from('professional_registration_requests')
          .select('professional_type, company_name, registration_data')
          .eq('user_id', user_id)
          .single();

        // Supprimer l'utilisateur de auth.users
        // NB: l'opération doit être idempotente.
        // Si l'utilisateur a déjà été supprimé (ex: tentative précédente partiellement réussie),
        // on ne doit pas renvoyer 500 — on nettoie simplement les données publiques résiduelles.
        let alreadyDeleted = false;
        const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user_id);

        if (deleteError) {
          const msg = (deleteError as any)?.message?.toString?.() ?? String(deleteError);
          const isUserNotFound = msg.toLowerCase().includes('user not found') || msg.toLowerCase().includes('not found');
          if (isUserNotFound) {
            alreadyDeleted = true;
            console.warn(`[USER-SERVICE] User ${user_id} not found in Auth; treating delete as success.`);
          } else {
            console.error('[USER-SERVICE] Error deleting user from auth:', deleteError);
            throw new Error(`Erreur lors de la suppression: ${msg}`);
          }
        } else {
          console.log(`[USER-SERVICE] User ${user_id} deleted successfully`);
        }

        // Nettoyage défensif (au cas où des données publiques resteraient)
        // Le service role bypass RLS, donc ces suppressions sont autorisées ici.
        await supabaseClient.from('professional_registration_documents').delete().eq('user_id', user_id);
        await supabaseClient.from('professional_registration_requests').delete().eq('user_id', user_id);
        await supabaseClient.from('user_roles').delete().eq('user_id', user_id);
        await supabaseClient.from('profiles').delete().eq('user_id', user_id);

        // Log l'activité
        await supabaseClient
          .from('activity_logs')
          .insert({
            user_id: currentUser.id,
            action: 'professional_account_deleted',
            resource_type: 'professional',
            resource_id: user_id,
            details: {
              deleted_user: {
                name: profileToDelete ? `${profileToDelete.first_name} ${profileToDelete.last_name}` : 'N/A',
                email: profileToDelete?.email,
                institution: profileToDelete?.institution,
                role: registrationRequest?.professional_type,
                company_name: registrationRequest?.company_name,
              },
              reason: deleted_reason || undefined,
              deleted_by: currentUser.email,
              deleted_at: new Date().toISOString(),
              already_deleted: alreadyDeleted,
            },
          });

        return new Response(JSON.stringify({ 
          success: true, 
          message: "Compte professionnel supprimé avec succès",
          deleted_user_id: user_id
        }), {
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
