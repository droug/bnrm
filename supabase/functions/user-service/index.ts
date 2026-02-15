import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserRequest {
  action: 'get_profile' | 'update_profile' | 'get_roles' | 'assign_role' | 'get_permissions' | 'list_users' | 'delete_professional' | 'create_internal_user';
  user_id?: string;
  profile_data?: Record<string, any>;
  role?: string;
  filters?: Record<string, any>;
  reason?: string;
  deleted_reason?: string;
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  institution?: string;
  research_field?: string;
  role_code?: string;
  role_id?: string;
  roles?: Array<{ role_code: string; role_id: string }>;
  notes?: string;
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

    // Decode JWT payload - handle URL-safe base64
    let jwtPayload: any;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
      jwtPayload = JSON.parse(atob(padded));
      console.log("[USER-SERVICE] JWT decoded, sub:", jwtPayload.sub, "role:", jwtPayload.role);
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

    const { action, user_id, profile_data, role, filters, deleted_reason, email, password, first_name, last_name, phone, institution, research_field, role_code, role_id, roles, notes }: UserRequest = await req.json();

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

        console.log(`[USER-SERVICE] Soft-deleting professional account: ${user_id}`);

        // Récupérer les infos du profil avant suppression pour le log
        const { data: profileToDelete } = await supabaseClient
          .from('profiles')
          .select('first_name, last_name, institution')
          .eq('user_id', user_id)
          .single();

        // Récupérer les infos de la demande d'inscription
        const { data: registrationRequest } = await supabaseClient
          .from('professional_registration_requests')
          .select('professional_type, company_name, registration_data')
          .eq('user_id', user_id)
          .single();

        // Récupérer l'email depuis Auth
        const { data: authUserData } = await supabaseClient.auth.admin.getUserById(user_id);
        const deletedEmail = authUserData?.user?.email;

        // 1. Soft-delete: marquer le profil comme "deleted"
        const { error: softDeleteError } = await supabaseClient
          .from('profiles')
          .update({
            account_status: 'deleted',
            deleted_at: new Date().toISOString(),
            deleted_by: currentUser.id,
            is_approved: false,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user_id);

        if (softDeleteError) {
          console.error('[USER-SERVICE] Error soft-deleting profile:', softDeleteError);
          throw new Error(`Erreur lors du marquage du profil: ${softDeleteError.message}`);
        }

        // 2. Supprimer les rôles
        for (const roleTable of ['user_roles', 'user_system_roles']) {
          try {
            await supabaseClient.from(roleTable).delete().eq('user_id', user_id);
          } catch (e) {
            console.warn(`[USER-SERVICE] Warning cleaning ${roleTable}:`, e);
          }
        }

        // 3. Désactiver le compte Auth (ban au lieu de supprimer)
        try {
          await supabaseClient.auth.admin.updateUserById(user_id, {
            ban_duration: '876600h', // ~100 years
          });
          console.log(`[USER-SERVICE] Auth account banned for user ${user_id}`);
        } catch (e) {
          console.warn(`[USER-SERVICE] Error banning auth user:`, e);
        }

        // 4. Marquer les enregistrements dans les tables de répertoire comme supprimés
        const directoryTables = ['publishers', 'printers', 'producers'];
        const professionalEmail = deletedEmail || registrationRequest?.registration_data?.email;
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
            }
          } catch (e) {
            console.warn(`[USER-SERVICE] Error updating ${dirTable}:`, e);
          }
        }

        // 5. Marquer la demande d'inscription comme supprimée
        try {
          await supabaseClient
            .from('professional_registration_requests')
            .update({ status: 'deleted', updated_at: new Date().toISOString() })
            .eq('user_id', user_id);
          console.log(`[USER-SERVICE] Registration request marked as deleted for user ${user_id}`);
        } catch (e) {
          console.warn(`[USER-SERVICE] Error updating registration request:`, e);
        }

        // 6. Annuler les tranches réservées
        try {
          if (professionalEmail) {
            await supabaseClient
              .from('reserved_number_ranges')
              .update({ status: 'cancelled' })
              .eq('status', 'active')
              .eq('requester_email', professionalEmail);
          }
          if (companyName) {
            await supabaseClient
              .from('reserved_number_ranges')
              .update({ status: 'cancelled' })
              .eq('status', 'active')
              .eq('requester_name', companyName);
          }
          await supabaseClient
            .from('reserved_number_ranges')
            .update({ status: 'cancelled' })
            .eq('status', 'active')
            .eq('requester_id', user_id);
        } catch (e) {
          console.warn(`[USER-SERVICE] Error cancelling reserved ranges:`, e);
        }

        // 7. Log l'activité
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
                email: deletedEmail,
                institution: profileToDelete?.institution,
                role: registrationRequest?.professional_type,
                company_name: registrationRequest?.company_name,
              },
              reason: deleted_reason || undefined,
              deleted_by: currentUser.email,
              deleted_at: new Date().toISOString(),
              soft_delete: true,
            },
          });

        console.log(`[USER-SERVICE] Professional account soft-deleted: ${user_id}`);

        return new Response(JSON.stringify({ 
          success: true, 
          message: "Compte professionnel supprimé avec succès",
          deleted_user_id: user_id
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'create_internal_user': {
        // Vérifier que l'utilisateur est admin ou librarian
        const { data: isAdminOrLib } = await supabaseClient
          .rpc('is_admin_or_librarian', { user_uuid: currentUser.id });

        if (!isAdminOrLib) {
          throw new Error("Seuls les administrateurs et bibliothécaires peuvent créer des utilisateurs internes");
        }
        
        if (!email || !password || !first_name || !last_name) {
          throw new Error("Email, mot de passe, prénom et nom sont requis");
        }

        console.log(`[USER-SERVICE] Creating internal user: ${email}`);

        // Check if a deleted account exists for this email
        let newUserId: string;
        let isReactivation = false;

        // Look up existing auth user by email - use paginated search to avoid missing users beyond page 1
        let existingAuthUser: any = null;
        let page = 1;
        const perPage = 1000;
        let found = false;
        
        while (!found) {
          const { data: pageData, error: listError } = await supabaseClient.auth.admin.listUsers({ page, perPage });
          if (listError || !pageData?.users?.length) break;
          
          const match = pageData.users.find((u: any) => u.email === email);
          if (match) {
            existingAuthUser = match;
            found = true;
          } else if (pageData.users.length < perPage) {
            break; // Last page
          } else {
            page++;
          }
        }
        
        console.log(`[USER-SERVICE] Auth lookup for ${email}: ${existingAuthUser ? 'found (id: ' + existingAuthUser.id + ')' : 'not found'} (scanned ${page} page(s))`);

        if (existingAuthUser) {
          // Check if this user has a deleted profile
          const { data: existingProfile } = await supabaseClient
            .from('profiles')
            .select('account_status')
            .eq('user_id', existingAuthUser.id)
            .single();

          if (existingProfile?.account_status === 'deleted' || !existingProfile) {
            // Reactivate the deleted account or recover orphan auth user (no profile)
            console.log(`[USER-SERVICE] ${existingProfile ? 'Reactivating deleted' : 'Recovering orphan'} account: ${existingAuthUser.id}`);
            isReactivation = true;
            newUserId = existingAuthUser.id;

            // Unban and update password
            const { error: updateAuthError } = await supabaseClient.auth.admin.updateUserById(newUserId, {
              password,
              ban_duration: 'none',
              email_confirm: true,
              user_metadata: { first_name, last_name },
            });

            if (updateAuthError) {
              console.error('[USER-SERVICE] Error reactivating auth user:', updateAuthError);
              throw new Error(`Erreur lors de la réactivation du compte: ${updateAuthError.message}`);
            }
          } else {
            // Account exists and is active - cannot create
            return new Response(JSON.stringify({ 
              success: false, 
              error: "Un utilisateur avec cette adresse e-mail existe déjà et est actif." 
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            });
          }
        } else {
          // No existing auth user - create new
          const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { first_name, last_name }
          });

          if (createError) {
            console.error('[USER-SERVICE] Error creating user:', createError);
            throw new Error(`Erreur lors de la création du compte: ${createError.message}`);
          }

          if (!newUser.user) {
            throw new Error('Aucun utilisateur créé');
          }

          newUserId = newUser.user.id;
        }

        console.log(`[USER-SERVICE] User ${isReactivation ? 'reactivated' : 'created'}: ${newUserId}`);

        // 2. Create/update profile (reactivate if deleted)
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .upsert({
            user_id: newUserId,
            first_name,
            last_name,
            phone: phone || null,
            institution: institution || null,
            research_field: research_field || null,
            is_approved: true,
            account_status: 'active',
            deleted_at: null,
            deleted_by: null,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (profileError) {
          console.error('[USER-SERVICE] Error creating/updating profile:', profileError);
        }

        // 3. Clean old roles before assigning new ones (important for reactivation)
        if (isReactivation) {
          await supabaseClient.from('user_roles').delete().eq('user_id', newUserId);
          await supabaseClient.from('user_system_roles').delete().eq('user_id', newUserId);
        }

        // 4. Assign roles
        const rolesToAssign = roles && roles.length > 0 
          ? roles 
          : (role_code ? [{ role_code, role_id: role_id || '' }] : []);

        const enumRoles = [
          'admin', 'librarian', 'researcher', 'partner', 'subscriber', 'visitor',
          'public_user', 'editor', 'printer', 'producer', 'distributor', 'author',
          'validateur', 'direction', 'dac', 'comptable', 'read_only'
        ];

        for (const r of rolesToAssign) {
          if (r.role_id) {
            const { error: systemRoleError } = await supabaseClient
              .from('user_system_roles')
              .insert({ user_id: newUserId, role_id: r.role_id });

            if (systemRoleError) {
              console.warn(`[USER-SERVICE] Error assigning system role ${r.role_id}:`, systemRoleError);
            }
          }

          if (r.role_code && enumRoles.includes(r.role_code)) {
            const { error: enumRoleError } = await supabaseClient
              .from('user_roles')
              .insert({ user_id: newUserId, role: r.role_code });

            if (enumRoleError) {
              console.warn(`[USER-SERVICE] Error assigning enum role ${r.role_code}:`, enumRoleError);
            }
          }
        }

        // 5. Activity log
        await supabaseClient
          .from('activity_logs')
          .insert({
            user_id: currentUser.id,
            action: isReactivation ? 'reactivate_internal_user' : 'create_internal_user',
            resource_type: 'user',
            resource_id: newUserId,
            details: {
              roles: rolesToAssign.map(r => r.role_code),
              created_by_admin: true,
              reactivated: isReactivation,
              notes: notes || null
            }
          });

        console.log(`[USER-SERVICE] Internal user ${isReactivation ? 'reactivated' : 'created'} successfully: ${newUserId}`);

        return new Response(JSON.stringify({ 
          success: true, 
          user_id: newUserId,
          email,
          reactivated: isReactivation
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
