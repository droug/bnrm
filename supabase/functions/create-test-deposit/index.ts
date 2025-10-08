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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Creating test deposit request...');

    // 1. Créer un éditeur de test s'il n'existe pas
    const testEditorEmail = 'editeur.test@bnrm.ma';
    let editorUserId: string;
    let editorProfessionalId: string;

    // Vérifier si l'éditeur existe déjà
    const { data: existingEditor } = await supabaseClient.auth.admin.listUsers();
    const editorUser = existingEditor?.users.find(u => u.email === testEditorEmail);

    if (editorUser) {
      console.log('Test editor already exists:', editorUser.id);
      editorUserId = editorUser.id;
      
      // Récupérer le professional_registry ID
      const { data: profRegistry } = await supabaseClient
        .from('professional_registry')
        .select('id')
        .eq('user_id', editorUserId)
        .single();
      
      editorProfessionalId = profRegistry?.id;
    } else {
      // Créer l'éditeur
      const { data: newEditor, error: editorError } = await supabaseClient.auth.admin.createUser({
        email: testEditorEmail,
        password: 'TestEditor2024!',
        email_confirm: true,
        user_metadata: {
          first_name: 'Éditions',
          last_name: 'Test Maroc'
        }
      });

      if (editorError) throw editorError;
      editorUserId = newEditor.user.id;
      console.log('Created test editor:', editorUserId);

      // Créer le profil
      await supabaseClient.from('profiles').insert({
        user_id: editorUserId,
        first_name: 'Éditions',
        last_name: 'Test Maroc',
        is_approved: true
      });

      // Ajouter le rôle
      await supabaseClient.from('user_roles').insert({
        user_id: editorUserId,
        role: 'editor'
      });

      // Créer l'entrée professional_registry
      const { data: profReg } = await supabaseClient
        .from('professional_registry')
        .insert({
          user_id: editorUserId,
          professional_type: 'editor',
          company_name: 'Éditions Test Maroc',
          trade_register: 'RC-TEST-2024',
          tax_id: 'IF-TEST-123456',
          professional_card_number: 'PC-EDT-2024-001',
          is_approved: true
        })
        .select('id')
        .single();

      editorProfessionalId = profReg?.id;
    }

    // 2. Créer un imprimeur de test
    const testPrinterEmail = 'imprimeur.test@bnrm.ma';
    let printerUserId: string;
    let printerProfessionalId: string;

    const printerUser = existingEditor?.users.find(u => u.email === testPrinterEmail);

    if (printerUser) {
      console.log('Test printer already exists:', printerUser.id);
      printerUserId = printerUser.id;
      
      const { data: profRegistry } = await supabaseClient
        .from('professional_registry')
        .select('id')
        .eq('user_id', printerUserId)
        .single();
      
      printerProfessionalId = profRegistry?.id;
    } else {
      const { data: newPrinter, error: printerError } = await supabaseClient.auth.admin.createUser({
        email: testPrinterEmail,
        password: 'TestPrinter2024!',
        email_confirm: true,
        user_metadata: {
          first_name: 'Imprimerie',
          last_name: 'Nationale Test'
        }
      });

      if (printerError) throw printerError;
      printerUserId = newPrinter.user.id;
      console.log('Created test printer:', printerUserId);

      await supabaseClient.from('profiles').insert({
        user_id: printerUserId,
        first_name: 'Imprimerie',
        last_name: 'Nationale Test',
        is_approved: true
      });

      await supabaseClient.from('user_roles').insert({
        user_id: printerUserId,
        role: 'printer'
      });

      const { data: profReg } = await supabaseClient
        .from('professional_registry')
        .insert({
          user_id: printerUserId,
          professional_type: 'printer',
          company_name: 'Imprimerie Nationale Test',
          trade_register: 'RC-TEST-2024-IMP',
          tax_id: 'IF-TEST-789012',
          professional_card_number: 'PC-IMP-2024-001',
          is_approved: true
        })
        .select('id')
        .single();

      printerProfessionalId = profReg?.id;
    }

    // 3. Créer la demande de dépôt légal (sans copies_count)
    const year = new Date().getFullYear();
    const timestamp = Date.now();
    const requestNumber = `DL-${year}-TEST-${timestamp}`;

    const { data: depositRequest, error: requestError } = await supabaseClient
      .from('legal_deposit_requests')
      .insert({
        request_number: requestNumber,
        initiator_id: editorProfessionalId,
        collaborator_id: printerProfessionalId,
        publication_title: 'Guide Pratique du Dépôt Légal au Maroc - Edition Test',
        publication_type: 'monographies',
        monograph_type: 'livres',
        author_name: 'Dr. Ahmed El Fassi',
        language: 'fr',
        publication_date: new Date().toISOString().split('T')[0],
        publisher_name: 'Éditions Test Maroc',
        printer_name: 'Imprimerie Nationale Test',
        status: 'soumis',
        metadata: {
          test_data: true,
          created_by: 'test-function'
        }
      })
      .select()
      .single();

    if (requestError) throw requestError;
    console.log('Created deposit request:', depositRequest.id);

    // 4. Ajouter les parties impliquées
    const parties = [
      {
        request_id: depositRequest.id,
        user_id: editorUserId,
        professional_registry_id: editorProfessionalId,
        role: 'initiator',
        approval_status: 'approved',
        approved_at: new Date().toISOString()
      },
      {
        request_id: depositRequest.id,
        user_id: printerUserId,
        professional_registry_id: printerProfessionalId,
        role: 'printer',
        approval_status: 'pending'
      }
    ];

    const { error: partiesError } = await supabaseClient
      .from('legal_deposit_parties')
      .insert(parties);

    if (partiesError) throw partiesError;
    console.log('Added parties to request');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demande de test créée avec succès',
        data: {
          requestNumber,
          requestId: depositRequest.id,
          editorEmail: testEditorEmail,
          printerEmail: testPrinterEmail,
          credentials: {
            editor: {
              email: testEditorEmail,
              password: 'TestEditor2024!'
            },
            printer: {
              email: testPrinterEmail,
              password: 'TestPrinter2024!'
            }
          }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error creating test deposit:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
