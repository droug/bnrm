import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Créer des utilisateurs de test
    const testUsers = [
      {
        email: 'editeur.test@bnrm.ma',
        password: 'TestBNRM2025!',
        role: 'editor',
        firstName: 'Ahmed',
        lastName: 'Alami',
        institution: 'Éditions Dar Al Kitab'
      },
      {
        email: 'imprimeur.test@bnrm.ma',
        password: 'TestBNRM2025!',
        role: 'printer',
        firstName: 'Fatima',
        lastName: 'Benani',
        institution: 'Imprimerie Nationale'
      },
      {
        email: 'admin.test@bnrm.ma',
        password: 'TestBNRM2025!',
        role: 'admin',
        firstName: 'Mohammed',
        lastName: 'Tazi',
        institution: 'BNRM - Bibliothèque Nationale'
      },
      {
        email: 'producteur.test@bnrm.ma',
        password: 'TestBNRM2025!',
        role: 'producer',
        firstName: 'Youssef',
        lastName: 'Fassi',
        institution: 'Productions Atlas Média'
      },
    ];

    const createdUsers: any[] = [];

    for (const testUser of testUsers) {
      // Créer l'utilisateur
      const { data: user, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
        user_metadata: {
          first_name: testUser.firstName,
          last_name: testUser.lastName
        }
      });

      if (userError) {
        console.error(`Erreur création utilisateur ${testUser.email}:`, userError);
        continue;
      }

      // Créer le profil
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          user_id: user.user.id,
          first_name: testUser.firstName,
          last_name: testUser.lastName,
          institution: testUser.institution,
          role: testUser.role,
          is_approved: true
        });

      if (profileError) {
        console.error(`Erreur création profil ${testUser.email}:`, profileError);
      }

      // Assigner le rôle
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .upsert({
          user_id: user.user.id,
          role: testUser.role,
          granted_by: user.user.id
        });

      if (roleError) {
        console.error(`Erreur attribution rôle ${testUser.email}:`, roleError);
      }

      createdUsers.push({
        email: testUser.email,
        id: user.user.id,
        role: testUser.role
      });
    }

    // Créer des dépôts légaux de test pour différents états du workflow
    const editorUser = createdUsers.find(u => u.role === 'editor');
    const printerUser = createdUsers.find(u => u.role === 'printer');
    const producerUser = createdUsers.find(u => u.role === 'producer');

    if (editorUser) {
      const testDeposits = [
        // Dépôt en brouillon - début du workflow
        {
          request_number: `DL-2025-${Date.now()}-001`,
          title: "Introduction à la littérature marocaine",
          subtitle: "Un voyage à travers les siècles",
          author_name: "Karim Benslimane",
          support_type: "imprime",
          monograph_type: "livres",
          language: "fr",
          status: "brouillon",
          initiator_id: editorUser.id,
          page_count: 320,
          publication_date: '2025-01-15',
        },
        // Dépôt soumis - en attente de validation service
        {
          request_number: `DL-2025-${Date.now()}-002`,
          title: "الشعر الأندلسي المعاصر",
          subtitle: "دراسة تحليلية",
          author_name: "سعيد المرابط",
          support_type: "imprime",
          monograph_type: "livres",
          language: "ar",
          status: "soumis",
          initiator_id: editorUser.id,
          submission_date: new Date().toISOString(),
          page_count: 256,
          publication_date: '2025-02-01',
        },
        // Dépôt en attente validation département B
        {
          request_number: `DL-2025-${Date.now()}-003`,
          title: "تاريخ المغرب الحديث",
          subtitle: "من الاستقلال إلى اليوم",
          author_name: "محمد الفاسي",
          support_type: "imprime",
          monograph_type: "livres",
          language: "ar",
          status: "en_attente_validation_b",
          initiator_id: editorUser.id,
          submission_date: new Date(Date.now() - 86400000).toISOString(),
          validated_by_service: editorUser.id,
          service_validated_at: new Date(Date.now() - 43200000).toISOString(),
          service_validation_notes: "Dossier complet et conforme",
          page_count: 450,
          publication_date: '2025-01-20',
        },
        // Dépôt en attente validation comité
        {
          request_number: `DL-2025-${Date.now()}-004`,
          title: "Architecture berbère traditionnelle",
          subtitle: "Art et techniques de construction",
          author_name: "Rachid Benkirane",
          support_type: "imprime",
          monograph_type: "beaux_livres",
          language: "fr",
          status: "en_attente_comite_validation",
          initiator_id: editorUser.id,
          submission_date: new Date(Date.now() - 172800000).toISOString(),
          validated_by_service: editorUser.id,
          service_validated_at: new Date(Date.now() - 129600000).toISOString(),
          validated_by_department: editorUser.id,
          department_validated_at: new Date(Date.now() - 86400000).toISOString(),
          page_count: 280,
          publication_date: '2025-03-01',
        },
        // Dépôt validé - numéros attribués
        {
          request_number: `DL-2025-${Date.now()}-005`,
          title: "Guide pratique du jardinage méditerranéen",
          subtitle: "Techniques et plantes adaptées",
          author_name: "Laila Tazi",
          support_type: "imprime",
          monograph_type: "livres",
          language: "fr",
          status: "valide",
          initiator_id: editorUser.id,
          submission_date: new Date(Date.now() - 259200000).toISOString(),
          validated_by_service: editorUser.id,
          service_validated_at: new Date(Date.now() - 216000000).toISOString(),
          validated_by_department: editorUser.id,
          department_validated_at: new Date(Date.now() - 172800000).toISOString(),
          validated_by_committee: editorUser.id,
          committee_validated_at: new Date(Date.now() - 129600000).toISOString(),
          dl_number: 'DL-2025-00123',
          isbn_assigned: '978-9954-0-1234-5',
          attribution_date: new Date(Date.now() - 86400000).toISOString(),
          page_count: 180,
          publication_date: '2024-12-15',
        },
        // Dépôt électronique
        {
          request_number: `DL-2025-${Date.now()}-006`,
          title: "Cours de programmation Python",
          subtitle: "Du débutant à l'expert",
          author_name: "Omar Benjelloun",
          support_type: "electronique",
          monograph_type: "livres",
          language: "fr",
          status: "soumis",
          initiator_id: editorUser.id,
          submission_date: new Date().toISOString(),
          page_count: 420,
          publication_date: '2025-01-10',
        },
      ];

      const { error: depositsError } = await supabaseAdmin
        .from('legal_deposit_requests')
        .insert(testDeposits);

      if (depositsError) {
        console.error('Erreur création dépôts éditeur:', depositsError);
      }
    }

    // Créer des dépôts pour l'imprimeur
    if (printerUser) {
      const printerDeposits = [
        {
          request_number: `DL-2025-${Date.now()}-101`,
          title: "Revue Culturelle Marocaine - N°145",
          subtitle: "Numéro spécial patrimoine",
          author_name: "Collectif",
          support_type: "imprime",
          monograph_type: "periodiques",
          language: "fr",
          status: "soumis",
          initiator_id: printerUser.id,
          submission_date: new Date().toISOString(),
          page_count: 64,
          publication_date: '2025-01-01',
        },
        {
          request_number: `DL-2025-${Date.now()}-102`,
          title: "مجلة الثقافة المغربية",
          subtitle: "العدد الخاص بالتراث",
          author_name: "فريق التحرير",
          support_type: "imprime",
          monograph_type: "periodiques",
          language: "ar",
          status: "en_attente_validation_b",
          initiator_id: printerUser.id,
          submission_date: new Date(Date.now() - 86400000).toISOString(),
          validated_by_service: printerUser.id,
          service_validated_at: new Date(Date.now() - 43200000).toISOString(),
          page_count: 72,
          publication_date: '2024-12-01',
        },
      ];

      const { error: printerDepositsError } = await supabaseAdmin
        .from('legal_deposit_requests')
        .insert(printerDeposits);

      if (printerDepositsError) {
        console.error('Erreur création dépôts imprimeur:', printerDepositsError);
      }
    }

    // Créer des dépôts audiovisuels pour le producteur
    if (producerUser) {
      const producerDeposits = [
        {
          request_number: `DL-2025-${Date.now()}-201`,
          title: "Documentaire: Les Trésors du Maroc",
          subtitle: "Un voyage à travers l'histoire",
          author_name: "Équipe Atlas Média",
          support_type: "electronique",
          monograph_type: "audiovisuel",
          language: "fr",
          status: "soumis",
          initiator_id: producerUser.id,
          submission_date: new Date().toISOString(),
          publication_date: '2025-02-01',
        },
      ];

      const { error: producerDepositsError } = await supabaseAdmin
        .from('legal_deposit_requests')
        .insert(producerDeposits);

      if (producerDepositsError) {
        console.error('Erreur création dépôts producteur:', producerDepositsError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Utilisateurs et dépôts de test créés avec succès',
        users: createdUsers.map(u => ({
          email: u.email,
          role: u.role,
          password: 'TestBNRM2025!'
        })),
        depositsCreated: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
