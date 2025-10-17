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
    console.log('📥 Requête reçue avec le rôle:', role);

    if (!role || !['author', 'editor', 'printer', 'producer', 'distributor'].includes(role)) {
      console.error('❌ Type de professionnel invalide:', role);
      throw new Error('Type de professionnel invalide');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    console.log('✅ Client Supabase créé');

    const dataByRole: Record<string, any[]> = {
      printer: [
        {
          email: `imprimerie.nationale.${Date.now()}@example.ma`,
          password: 'Test123!',
          profile: {
            first_name: 'Direction',
            last_name: 'Imprimerie Nationale',
            phone: '+212-5-37-76-50-14',
            institution: 'Imprimerie Nationale du Maroc',
          },
          registration_data: {
            nameAr: 'المطبعة الوطنية',
            nameFr: 'Imprimerie Nationale du Maroc',
            commerceRegistry: `RC-2024-${Math.floor(Math.random() * 100000)}`,
            contactPerson: 'Direction Générale',
            address: 'Avenue Al Majd, Hay Riad',
            region: 'Rabat-Salé-Kénitra',
            city: 'Rabat',
            website: 'https://imprimerienationale.ma',
            description: 'Fabrication d\'ouvrages officiels et documents administratifs',
          }
        },
      ],
      editor: [
        {
          email: `croisee.chemins.${Date.now()}@example.ma`,
          password: 'Test123!',
          profile: {
            first_name: 'Abdelkader',
            last_name: 'Retnani',
            phone: '+212-5-22-26-80-70',
            institution: 'Éditions La Croisée des Chemins',
          },
          registration_data: {
            type: 'morale',
            nameAr: 'دار النشر مفترق الطرق',
            nameFr: 'Éditions La Croisée des Chemins',
            commerceRegistry: `RC-2024-${Math.floor(Math.random() * 100000)}`,
            contactPerson: 'Abdelkader Retnani',
            address: '33 Rue Tarik Ibn Ziad',
            region: 'Casablanca-Settat',
            city: 'Casablanca',
            website: 'https://www.lacroiseedeschemins.ma',
            description: 'Publication et diffusion de livres marocains et internationaux',
          }
        },
        {
          email: `yomad.${Date.now()}@example.ma`,
          password: 'Test123!',
          profile: {
            first_name: 'Youssef',
            last_name: 'Amine',
            phone: '+212-6-61-23-45-67',
            institution: 'Éditions Yomad',
          },
          registration_data: {
            type: 'morale',
            nameAr: 'منشورات يماد',
            nameFr: 'Éditions Yomad',
            commerceRegistry: `RC-2023-${Math.floor(Math.random() * 100000)}`,
            contactPerson: 'Youssef Amine',
            address: '12 Boulevard Zerktouni',
            region: 'Casablanca-Settat',
            city: 'Casablanca',
            website: 'https://www.yomad.ma',
            description: 'Spécialisé en littérature jeunesse et livres éducatifs',
          }
        },
        {
          email: `marsam.${Date.now()}@example.ma`,
          password: 'Test123!',
          profile: {
            first_name: 'Majid',
            last_name: 'El Kabbaj',
            phone: '+212-5-37-70-89-12',
            institution: 'Marsam Éditions',
          },
          registration_data: {
            type: 'morale',
            nameAr: 'منشورات مرسم',
            nameFr: 'Marsam Éditions',
            commerceRegistry: `RC-2022-${Math.floor(Math.random() * 100000)}`,
            contactPerson: 'Majid El Kabbaj',
            address: '7 Avenue Hassan II',
            region: 'Rabat-Salé-Kénitra',
            city: 'Rabat',
            website: 'https://marsam.ma',
            description: 'Beaux livres, essais et publications culturelles',
          }
        },
        {
          email: `entouteslettres.${Date.now()}@example.ma`,
          password: 'Test123!',
          profile: {
            first_name: 'Nadia',
            last_name: 'Essalmi',
            phone: '+212-5-22-44-55-66',
            institution: 'Éditions En Toutes Lettres',
          },
          registration_data: {
            type: 'morale',
            nameAr: 'منشورات بكل الأحرف',
            nameFr: 'Éditions En Toutes Lettres',
            commerceRegistry: `RC-2021-${Math.floor(Math.random() * 100000)}`,
            contactPerson: 'Nadia Essalmi',
            address: '45 Rue de la Liberté',
            region: 'Casablanca-Settat',
            city: 'Casablanca',
            website: 'https://entouteslettres.ma',
            description: 'Essais et études sociales, publications académiques',
          }
        },
        {
          email: `okad.${Date.now()}@example.ma`,
          password: 'Test123!',
          profile: {
            first_name: 'Rachid',
            last_name: 'Benkirane',
            phone: '+212-5-24-33-44-55',
            institution: 'Éditions Okad',
          },
          registration_data: {
            type: 'morale',
            nameAr: 'منشورات عكاظ',
            nameFr: 'Éditions Okad',
            commerceRegistry: `RC-2020-${Math.floor(Math.random() * 100000)}`,
            contactPerson: 'Rachid Benkirane',
            address: '78 Avenue Mohammed V',
            region: 'Marrakech-Safi',
            city: 'Marrakech',
            website: 'https://okad.ma',
            description: 'Livres culturels et éducatifs, patrimoine marocain',
          }
        },
        {
          email: `bouregreg.${Date.now()}@example.ma`,
          password: 'Test123!',
          profile: {
            first_name: 'Ahmed',
            last_name: 'Tounsi',
            phone: '+212-5-37-73-22-11',
            institution: 'Éditions Bouregreg',
          },
          registration_data: {
            type: 'morale',
            nameAr: 'منشورات أبي رقراق',
            nameFr: 'Éditions Bouregreg',
            commerceRegistry: `RC-2023-${Math.floor(Math.random() * 100000)}`,
            contactPerson: 'Ahmed Tounsi',
            address: '23 Rue Oued Fès',
            region: 'Rabat-Salé-Kénitra',
            city: 'Rabat',
            website: 'https://bouregreg.ma',
            description: 'Littérature marocaine contemporaine et patrimoine',
          }
        }
      ],
      distributor: [
        {
          email: `mediasoft.${Date.now()}@example.ma`,
          password: 'Test123!',
          profile: {
            first_name: 'Karim',
            last_name: 'Alaoui',
            phone: '+212-5-22-98-76-54',
            institution: 'Distributeur Mediasoft',
          },
          registration_data: {
            companyName: 'Mediasoft Distribution',
            legalForm: 'SARL',
            registrationNumber: `RC-2022-${Math.floor(Math.random() * 100000)}`,
            taxNumber: `IF-${Math.floor(Math.random() * 100000000)}`,
            address: '56 Boulevard Moulay Youssef',
            city: 'Casablanca',
            postalCode: '20250',
            contactFirstName: 'Karim',
            contactLastName: 'Alaoui',
            phone: '+212-5-22-98-76-54',
            website: 'https://mediasoft.ma',
            distributionNetwork: 'National avec 15 points de distribution',
            territorialCoverage: 'Tout le territoire marocain',
            storageCapacity: '80000 unités',
            clientTypes: ['Librairies', 'Établissements scolaires', 'Bibliothèques'],
            experience: '12',
            services: ['Distribution physique', 'Logistique', 'Marketing'],
            description: 'Diffusion de publications et contenus éducatifs',
          }
        }
      ]
    };

    const professionalsToCreate = dataByRole[role];
    console.log(`📋 Nombre de professionnels à créer: ${professionalsToCreate?.length || 0}`);
    const results = [];

    for (const prof of professionalsToCreate) {
      try {
        console.log(`👤 Création de l'utilisateur: ${prof.email}`);
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
          console.error(`Erreur création auth ${prof.email}:`, authError);
          results.push({ email: prof.email, status: 'failed', error: authError.message });
          continue;
        }

        // Mettre à jour le profil
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            ...prof.profile,
            is_approved: true,
          })
          .eq('user_id', authData.user.id);

        if (profileError) {
          console.error(`Erreur profil ${prof.email}:`, profileError);
        }

        // Attribuer le rôle
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: role,
            granted_by: authData.user.id,
          });

        if (roleError) {
          console.error(`❌ Erreur rôle ${prof.email}:`, roleError);
        } else {
          console.log(`✅ Rôle ${role} attribué à ${prof.email}`);
        }

        // Créer invitation et demande
        const { data: invitation, error: invitError } = await supabase
          .from('professional_invitations')
          .insert({
            email: prof.email,
            professional_type: role,
            last_deposit_number: `DL-2024-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`,
            status: 'used',
          })
          .select()
          .single();

        if (invitError) {
          console.error(`Erreur invitation ${prof.email}:`, invitError);
        }

        if (invitation) {
          const { error: requestError } = await supabase
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

          if (requestError) {
            console.error(`Erreur demande inscription ${prof.email}:`, requestError);
          }
        }

        results.push({ email: prof.email, status: 'success' });
      } catch (err) {
        console.error(`Erreur globale ${prof.email}:`, err);
        results.push({ email: prof.email, status: 'failed', error: String(err) });
      }
    }
    
    console.log('✅ Injection terminée avec succès. Résultats:', results);

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
    console.error('💥 Erreur globale:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        details: error 
      }),
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
