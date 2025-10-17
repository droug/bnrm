import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const testProfessionals = [
      // Éditeurs
      {
        email: 'editeur1@test.ma',
        password: 'Test123!',
        role: 'editor' as const,
        profile: {
          first_name: 'Ahmed',
          last_name: 'Benali',
          phone: '+212-6-12-34-56-78',
          institution: 'Éditions Al Madariss',
        },
        registration_data: {
          type: 'morale',
          nameAr: 'دار المدارس للنشر',
          nameFr: 'Éditions Al Madariss',
          commerceRegistry: 'RC-2020-123456',
          contactPerson: 'Ahmed Benali',
          address: '45 Avenue Mohammed V',
          region: 'Rabat-Salé-Kénitra',
          city: 'Rabat',
        }
      },
      {
        email: 'editeur2@test.ma',
        password: 'Test123!',
        role: 'editor' as const,
        profile: {
          first_name: 'Fatima',
          last_name: 'Zahra',
          phone: '+212-6-87-65-43-21',
          institution: 'Dar Al Fikr',
        },
        registration_data: {
          type: 'morale',
          nameAr: 'دار الفكر',
          nameFr: 'Dar Al Fikr',
          commerceRegistry: 'RC-2019-789012',
          contactPerson: 'Fatima Zahra',
          address: '12 Rue des Librairies',
          region: 'Casablanca-Settat',
          city: 'Casablanca',
        }
      },
      // Imprimeurs
      {
        email: 'imprimeur1@test.ma',
        password: 'Test123!',
        role: 'printer' as const,
        profile: {
          first_name: 'Youssef',
          last_name: 'Alami',
          phone: '+212-6-11-22-33-44',
          institution: 'Imprimerie Moderne',
        },
        registration_data: {
          nameAr: 'المطبعة الحديثة',
          nameFr: 'Imprimerie Moderne',
          commerceRegistry: 'RC-2018-456789',
          contactPerson: 'Youssef Alami',
          address: 'Zone Industrielle Ain Sebaa',
          region: 'Casablanca-Settat',
          city: 'Casablanca',
        }
      },
      {
        email: 'imprimeur2@test.ma',
        password: 'Test123!',
        role: 'printer' as const,
        profile: {
          first_name: 'Rachid',
          last_name: 'Tazi',
          phone: '+212-6-55-66-77-88',
          institution: 'Imprimerie Nationale',
        },
        registration_data: {
          nameAr: 'المطبعة الوطنية',
          nameFr: 'Imprimerie Nationale',
          commerceRegistry: 'RC-2015-234567',
          contactPerson: 'Rachid Tazi',
          address: '78 Boulevard de la Résistance',
          region: 'Fès-Meknès',
          city: 'Fès',
        }
      },
      // Producteurs
      {
        email: 'producteur1@test.ma',
        password: 'Test123!',
        role: 'producer' as const,
        profile: {
          first_name: 'Karim',
          last_name: 'El Fassi',
          phone: '+212-6-99-88-77-66',
          institution: 'Productions Culturelles Maroc',
        },
        registration_data: {
          companyName: 'Productions Culturelles Maroc',
          companyRegistrationNumber: 'RC-2021-345678',
          taxIdentificationNumber: 'IF-12345678',
          productionType: 'Livres éducatifs',
          productionCapacity: '50000 unités/an',
          website: 'https://pcm.ma',
          yearsOfExperience: '8',
          description: 'Spécialisés dans la production de livres éducatifs et manuels scolaires pour tous les niveaux.',
          address: '23 Rue de l\'Industrie',
          city: 'Marrakech',
        }
      },
      {
        email: 'producteur2@test.ma',
        password: 'Test123!',
        role: 'producer' as const,
        profile: {
          first_name: 'Samira',
          last_name: 'Bennis',
          phone: '+212-6-22-33-44-55',
          institution: 'Atlas Productions',
        },
        registration_data: {
          companyName: 'Atlas Productions',
          companyRegistrationNumber: 'RC-2019-567890',
          taxIdentificationNumber: 'IF-87654321',
          productionType: 'Littérature générale',
          productionCapacity: '30000 unités/an',
          website: 'https://atlasprod.ma',
          yearsOfExperience: '12',
          description: 'Production de livres de littérature marocaine et traductions d\'œuvres internationales.',
          address: '56 Avenue Hassan II',
          city: 'Tanger',
        }
      }
    ];

    const results = [];

    for (const testProf of testProfessionals) {
      // Créer l'utilisateur
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testProf.email,
        password: testProf.password,
        email_confirm: true,
        user_metadata: {
          first_name: testProf.profile.first_name,
          last_name: testProf.profile.last_name,
        }
      });

      if (authError) {
        console.error(`Erreur création utilisateur ${testProf.email}:`, authError);
        results.push({ email: testProf.email, status: 'error', error: authError.message });
        continue;
      }

      // Mettre à jour le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          ...testProf.profile,
          is_approved: true,
        })
        .eq('user_id', authData.user.id);

      if (profileError) {
        console.error(`Erreur mise à jour profil ${testProf.email}:`, profileError);
      }

      // Attribuer le rôle
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: testProf.role,
          granted_by: authData.user.id,
        });

      if (roleError) {
        console.error(`Erreur attribution rôle ${testProf.email}:`, roleError);
      }

      // Créer une demande d'inscription approuvée
      const { data: invitation } = await supabase
        .from('professional_invitations')
        .insert({
          email: testProf.email,
          professional_type: testProf.role,
          last_deposit_number: `DL-2024-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`,
          status: 'used',
        })
        .select()
        .single();

      if (invitation) {
        await supabase
          .from('professional_registration_requests')
          .insert({
            user_id: authData.user.id,
            professional_type: testProf.role,
            company_name: testProf.registration_data.nameFr || testProf.registration_data.companyName || testProf.profile.institution,
            verified_deposit_number: invitation.last_deposit_number,
            invitation_id: invitation.id,
            cndp_acceptance: true,
            registration_data: testProf.registration_data,
            status: 'approved',
            reviewed_by: authData.user.id,
            reviewed_at: new Date().toISOString(),
          });
      }

      results.push({ 
        email: testProf.email, 
        status: 'success',
        role: testProf.role,
        userId: authData.user.id
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Professionnels de test créés avec succès',
        results 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    );
  }
});
