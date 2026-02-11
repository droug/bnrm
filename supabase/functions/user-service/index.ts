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

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  // Service role client for admin operations
  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");

    // Decode JWT payload to extract user ID (avoids SDK session issues)
    let jwtPayload: any;
    try {
      jwtPayload = JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error("[USER-SERVICE] JWT decode error:", e);
      throw new Error("Invalid token");
    }

    if (!jwtPayload.sub) throw new Error("Invalid token: no sub claim");

    // Validate user exists via admin API (service role)
    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(jwtPayload.sub);
    if (userError || !userData.user) {
      console.error("[USER-SERVICE] Admin getUserById error:", userError);
      throw new Error("User not authenticated");
    }
    const currentUser = userData.user;

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

        // IMPORTANT: Supprimer TOUTES les données liées AVANT de supprimer l'utilisateur Auth
        // car il y a des contraintes FK vers auth.users avec ON DELETE NO ACTION ou CASCADE
        console.log(`[USER-SERVICE] Cleaning up related data for user: ${user_id}`);
        
        // Tables avec FK directes vers auth.users - doivent être nettoyées AVANT la suppression Auth
        const cleanupTables = [
          { table: 'vexpo_exhibitions', column: 'created_by' },
          { table: 'vexpo_artworks', column: 'created_by' },
          { table: 'professional_registration_documents', column: 'user_id' },
          { table: 'professional_registration_requests', column: 'user_id' },
          { table: 'user_roles', column: 'user_id' },
          { table: 'profiles', column: 'user_id' },
          { table: 'chat_conversations', column: 'user_id' },
          { table: 'chatbot_interactions', column: 'user_id' },
          { table: 'reading_history', column: 'user_id' },
          { table: 'favorites', column: 'user_id' },
          { table: 'user_bookmarks', column: 'user_id' },
          { table: 'user_reviews', column: 'user_id' },
          { table: 'reproduction_requests', column: 'user_id' },
          { table: 'professional_registry', column: 'user_id' },
        ];

        for (const { table, column } of cleanupTables) {
          try {
            const { error: cleanupError } = await supabaseClient
              .from(table)
              .delete()
              .eq(column, user_id);
            
            if (cleanupError) {
              console.warn(`[USER-SERVICE] Warning cleaning ${table}: ${cleanupError.message}`);
            } else {
              console.log(`[USER-SERVICE] Cleaned ${table} for user ${user_id}`);
            }
          } catch (e) {
            console.warn(`[USER-SERVICE] Error cleaning ${table}:`, e);
          }
        }

        // Mettre à NULL les références optionnelles (colonnes avec ON DELETE SET NULL)
        const nullifyTables = [
          { table: 'bnrm_tarifs_historique', column: 'utilisateur_responsable' },
          { table: 'legal_deposit_requests', column: 'rejected_by' },
          { table: 'legal_deposit_requests', column: 'validated_by_committee' },
          { table: 'legal_deposit_requests', column: 'validated_by_service' },
          { table: 'legal_deposit_requests', column: 'validated_by_department' },
          { table: 'deposit_workflow_steps', column: 'gestionnaire_id' },
          { table: 'deposit_activity_log', column: 'user_id' },
          { table: 'number_ranges', column: 'created_by' },
          { table: 'deposit_notifications', column: 'recipient_id' },
          { table: 'user_reviews', column: 'reviewed_by' },
          { table: 'catalog_metadata', column: 'created_by' },
          { table: 'catalog_metadata', column: 'updated_by' },
          { table: 'metadata_import_history', column: 'imported_by' },
          { table: 'metadata_exports', column: 'exported_by' },
          { table: 'sigb_configuration', column: 'configured_by' },
          { table: 'reproduction_requests', column: 'processed_by' },
          { table: 'reproduction_requests', column: 'manager_validator_id' },
          { table: 'reproduction_requests', column: 'service_validator_id' },
          { table: 'reproduction_requests', column: 'rejected_by' },
        ];

        for (const { table, column } of nullifyTables) {
          try {
            const { error: nullifyError } = await supabaseClient
              .from(table)
              .update({ [column]: null })
              .eq(column, user_id);
            
            if (nullifyError) {
              console.warn(`[USER-SERVICE] Warning nullifying ${table}.${column}: ${nullifyError.message}`);
            }
          } catch (e) {
            console.warn(`[USER-SERVICE] Error nullifying ${table}.${column}:`, e);
          }
        }

        // Marquer les enregistrements dans les tables de répertoire comme supprimés
        // pour qu'ils n'apparaissent plus dans l'autocomplétion
        const directoryTables = ['publishers', 'printers', 'producers'];
        const professionalEmail = profileToDelete?.email || registrationRequest?.registration_data?.email;
        const companyName = registrationRequest?.company_name;

        for (const dirTable of directoryTables) {
          try {
            let query = supabaseClient.from(dirTable).update({ deleted_at: new Date().toISOString(), is_validated: false });
            
            if (professionalEmail) {
              query = query.eq('email', professionalEmail);
            } else if (companyName) {
              query = query.eq('name', companyName);
            } else {
              continue;
            }

            const { error: dirError } = await query;
            if (dirError) {
              console.warn(`[USER-SERVICE] Warning updating ${dirTable}: ${dirError.message}`);
            } else {
              console.log(`[USER-SERVICE] Marked ${dirTable} records as deleted for ${professionalEmail || companyName}`);
            }
          } catch (e) {
            console.warn(`[USER-SERVICE] Error updating ${dirTable}:`, e);
          }
        }

        // Annuler les tranches réservées pour ce professionnel supprimé
        // On annule par email ET par nom séparément pour couvrir tous les cas
        try {
          if (professionalEmail) {
            const { error: rangeError1 } = await supabaseClient
              .from('reserved_number_ranges')
              .update({ status: 'cancelled' })
              .eq('status', 'active')
              .eq('requester_email', professionalEmail);
            if (rangeError1) {
              console.warn(`[USER-SERVICE] Warning cancelling ranges by email: ${rangeError1.message}`);
            } else {
              console.log(`[USER-SERVICE] Cancelled reserved ranges by email for ${professionalEmail}`);
            }
          }
          if (companyName) {
            const { error: rangeError2 } = await supabaseClient
              .from('reserved_number_ranges')
              .update({ status: 'cancelled' })
              .eq('status', 'active')
              .eq('requester_name', companyName);
            if (rangeError2) {
              console.warn(`[USER-SERVICE] Warning cancelling ranges by name: ${rangeError2.message}`);
            } else {
              console.log(`[USER-SERVICE] Cancelled reserved ranges by name for ${companyName}`);
            }
          }
          // Also cancel by requester_id if available
          const { error: rangeError3 } = await supabaseClient
            .from('reserved_number_ranges')
            .update({ status: 'cancelled' })
            .eq('status', 'active')
            .eq('requester_id', user_id);
          if (rangeError3) {
            console.warn(`[USER-SERVICE] Warning cancelling ranges by id: ${rangeError3.message}`);
          } else {
            console.log(`[USER-SERVICE] Cancelled reserved ranges by id for ${user_id}`);
          }
        } catch (e) {
          console.warn(`[USER-SERVICE] Error cancelling reserved ranges:`, e);
        }

        console.log(`[USER-SERVICE] Data cleanup completed, now deleting Auth user: ${user_id}`);

        // Supprimer l'utilisateur de auth.users
        // NB: l'opération doit être idempotente.
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
          console.log(`[USER-SERVICE] User ${user_id} deleted from Auth successfully`);
        }

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
