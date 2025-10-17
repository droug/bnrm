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
    const { role } = await req.json();

    if (!role || !['editor', 'printer', 'producer'].includes(role)) {
      throw new Error('Type de professionnel invalide');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const dataByRole: Record<string, any[]> = {
      editor: [
        {
          email: `editeur.${Date.now()}@example.ma`,
          password: 'Test123!',
          profile: {
            first_name: 'Hassan',
            last_name: 'Kadiri',
            phone: '+212-6-00-11-22-33',
            institution: 'Éditions Tarik',
          },
          registration_data: {
            type: 'morale',
            nameAr: 'منشورات طارق',
            nameFr: 'Éditions Tarik',
            commerceRegistry: `RC-2022-${Math.floor(Math.random() * 100000)}`,
            contactPerson: 'Hassan Kadiri',
            address: '15 Rue des Écrivains',
            region: 'Rabat-Salé-Kénitra',
            city: 'Rabat',
          }
        },
        {
          email: `editeur2.${Date.now()}@example.ma`,
          password: 'Test123!',
          profile: {
            first_name: 'Amina',
            last_name: 'Bekkali',
            phone: '+212-6-44-55-66-77',
            institution: 'Dar Nachr Al Maarifa',
          },
          registration_data: {
            type: 'morale',
            nameAr: 'دار نشر المعرفة',
            nameFr: 'Dar Nachr Al Maarifa',
            commerceRegistry: `RC-2023-${Math.floor(Math.random() * 100000)}`,
            contactPerson: 'Amina Bekkali',
            address: '89 Boulevard Hassan II',
            region: 'Casablanca-Settat',
            city: 'Casablanca',
          }
        }
      ],
      printer: [
        {
          email: `imprimeur.${Date.now()}@example.ma`,
          password: 'Test123!',
          profile: {
            first_name: 'Omar',
            last_name: 'Benjelloun',
            phone: '+212-6-77-88-99-00',
            institution: 'Imprimerie Rapide',
          },
          registration_data: {
            nameAr: 'المطبعة السريعة',
            nameFr: 'Imprimerie Rapide',
            commerceRegistry: `RC-2021-${Math.floor(Math.random() * 100000)}`,
            contactPerson: 'Omar Benjelloun',
            address: 'Zone Industrielle Sidi Bernoussi',
            region: 'Casablanca-Settat',
            city: 'Casablanca',
          }
        },
        {
          email: `imprimeur2.${Date.now()}@example.ma`,
          password: 'Test123!',
          profile: {
            first_name: 'Nadia',
            last_name: 'Chraibi',
            phone: '+212-6-33-44-55-66',
            institution: 'Atlas Print',
          },
          registration_data: {
            nameAr: 'أطلس للطباعة',
            nameFr: 'Atlas Print',
            commerceRegistry: `RC-2020-${Math.floor(Math.random() * 100000)}`,
            contactPerson: 'Nadia Chraibi',
            address: '45 Avenue de l\'Industrie',
            region: 'Tanger-Tétouan-Al Hoceïma',
            city: 'Tanger',
          }
        }
      ],
      producer: [
        {
          email: `producteur.${Date.now()}@example.ma`,
          password: 'Test123!',
          profile: {
            first_name: 'Mehdi',
            last_name: 'Slaoui',
            phone: '+212-6-88-99-00-11',
            institution: 'Media Productions Maroc',
          },
          registration_data: {
            companyName: 'Media Productions Maroc',
            companyRegistrationNumber: `RC-2022-${Math.floor(Math.random() * 100000)}`,
            taxIdentificationNumber: `IF-${Math.floor(Math.random() * 100000000)}`,
            productionType: 'Contenus multimédias éducatifs',
            productionCapacity: '75000 unités/an',
            website: 'https://mediaproductions.ma',
            yearsOfExperience: '6',
            description: 'Production de contenus éducatifs multimédias pour établissements scolaires et universitaires.',
            address: '67 Rue de la Production',
            city: 'Rabat',
          }
        },
        {
          email: `producteur2.${Date.now()}@example.ma`,
          password: 'Test123!',
          profile: {
            first_name: 'Zineb',
            last_name: 'Idrissi',
            phone: '+212-6-11-22-33-44',
            institution: 'Créations Éditoriales du Sud',
          },
          registration_data: {
            companyName: 'Créations Éditoriales du Sud',
            companyRegistrationNumber: `RC-2023-${Math.floor(Math.random() * 100000)}`,
            taxIdentificationNumber: `IF-${Math.floor(Math.random() * 100000000)}`,
            productionType: 'Livres jeunesse',
            productionCapacity: '40000 unités/an',
            website: 'https://creations-sud.ma',
            yearsOfExperience: '10',
            description: 'Spécialisés dans la création de livres illustrés pour enfants avec focus sur la culture marocaine.',
            address: '23 Boulevard Mohammed V',
            city: 'Agadir',
          }
        }
      ]
    };

    const professionalsToCreate = dataByRole[role];
    const results = [];

    for (const prof of professionalsToCreate) {
      // Créer l'utilisateur
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: prof.email,
        password: prof.password,
        email_confirm: true,
        user_metadata: {
          first_name: prof.profile.first_name,
          last_name: prof.profile.last_name,
        }
      });

      if (authError) {
        console.error(`Erreur création ${prof.email}:`, authError);
        continue;
      }

      // Mettre à jour le profil
      await supabase
        .from('profiles')
        .update({
          ...prof.profile,
          is_approved: true,
        })
        .eq('user_id', authData.user.id);

      // Attribuer le rôle
      await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: role,
          granted_by: authData.user.id,
        });

      // Créer invitation et demande
      const { data: invitation } = await supabase
        .from('professional_invitations')
        .insert({
          email: prof.email,
          professional_type: role,
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
            professional_type: role,
            company_name: prof.registration_data.nameFr || prof.registration_data.companyName || prof.profile.institution,
            verified_deposit_number: invitation.last_deposit_number,
            invitation_id: invitation.id,
            cndp_acceptance: true,
            registration_data: prof.registration_data,
            status: 'approved',
            reviewed_by: authData.user.id,
            reviewed_at: new Date().toISOString(),
          });
      }

      results.push({ email: prof.email, status: 'success' });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: results.length,
        role,
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
