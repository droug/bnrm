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
      author: [
        {
          email: `auteur.${Date.now()}@example.ma`,
          password: 'Test123!',
          profile: {
            first_name: 'Hassan',
            last_name: 'Bennani',
            phone: '+212-6-11-22-33-44',
            institution: 'Écrivain indépendant',
          },
          registration_data: {
            cin: 'AB123456',
            address: '12 Rue de la Liberté, Rabat',
            city: 'Rabat',
            postalCode: '10000',
            nationality: 'Marocaine',
            birthDate: '1980-03-20',
            literaryGenre: 'Roman',
            publishedWorks: 'Les Vents du Désert (2015), Mémoires d\'Anfa (2018)',
          }
        },
        {
          email: `auteur2.${Date.now()}@example.ma`,
          password: 'Test123!',
          profile: {
            first_name: 'Fatima',
            last_name: 'Zahra',
            phone: '+212-6-55-66-77-88',
            institution: 'Association des Écrivains Marocains',
          },
          registration_data: {
            cin: 'CD789012',
            address: '78 Boulevard Mohammed V, Fès',
            city: 'Fès',
            postalCode: '30000',
            nationality: 'Marocaine',
            birthDate: '1975-11-08',
            literaryGenre: 'Poésie',
            publishedWorks: 'Chants du Maghreb (2012), Lumières d\'Orient (2020)',
          }
        }
      ],
      editor: [
        {
          email: `editeur.${Date.now()}@example.ma`,
          password: 'Test123!',
          profile: {
            first_name: 'Mohammed',
            last_name: 'Alaoui',
            phone: '+212-5-22-45-67-89',
            institution: 'Éditions du Maghreb',
          },
          registration_data: {
            type: 'morale',
            nameAr: 'منشورات المغرب',
            nameFr: 'Éditions du Maghreb',
            commerceRegistry: `RC-2022-${Math.floor(Math.random() * 100000)}`,
            contactPerson: 'Mohammed Alaoui',
            address: '45 Avenue Hassan II',
            region: 'Casablanca-Settat',
            city: 'Casablanca',
          }
        },
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
      ],
      distributor: [
        {
          email: `distributeur.${Date.now()}@example.ma`,
          password: 'Test123!',
          profile: {
            first_name: 'Youssef',
            last_name: 'Tazi',
            phone: '+212-6-22-33-44-55',
            institution: 'Distribution Nationale du Livre',
          },
          registration_data: {
            companyName: 'Distribution Nationale du Livre',
            legalForm: 'SARL',
            registrationNumber: `RC-2021-${Math.floor(Math.random() * 100000)}`,
            taxNumber: `IF-${Math.floor(Math.random() * 100000000)}`,
            address: '12 Avenue des FAR',
            city: 'Casablanca',
            postalCode: '20250',
            contactFirstName: 'Youssef',
            contactLastName: 'Tazi',
            phone: '+212-6-22-33-44-55',
            website: 'https://dnl.ma',
            distributionNetwork: 'National avec points de vente dans 8 villes',
            territorialCoverage: 'Tout le territoire marocain',
            storageCapacity: '50000 livres',
            clientTypes: ['Librairies indépendantes', 'Grandes surfaces culturelles', 'Bibliothèques'],
            experience: '15',
            services: ['Distribution physique', 'Stockage et logistique', 'Marketing et promotion'],
          }
        },
        {
          email: `distributeur2.${Date.now()}@example.ma`,
          password: 'Test123!',
          profile: {
            first_name: 'Laila',
            last_name: 'Bennani',
            phone: '+212-6-66-77-88-99',
            institution: 'Diffusion Maghreb Livres',
          },
          registration_data: {
            companyName: 'Diffusion Maghreb Livres',
            legalForm: 'SA',
            registrationNumber: `RC-2019-${Math.floor(Math.random() * 100000)}`,
            taxNumber: `IF-${Math.floor(Math.random() * 100000000)}`,
            address: '78 Boulevard Zerktouni',
            city: 'Marrakech',
            postalCode: '40000',
            contactFirstName: 'Laila',
            contactLastName: 'Bennani',
            phone: '+212-6-66-77-88-99',
            website: 'https://maghreblivres.ma',
            distributionNetwork: 'Régional Sud avec expansion nationale',
            territorialCoverage: 'Sud du Maroc et expansion',
            storageCapacity: '35000 livres',
            clientTypes: ['Librairies en ligne', 'Établissements scolaires', 'Kiosques à journaux'],
            experience: '10',
            services: ['Distribution numérique', 'Gestion des retours', 'Suivi des ventes'],
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
