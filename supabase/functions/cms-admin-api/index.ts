import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non authentifié' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Non authentifié' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname.replace('/cms-admin-api', '');
    const body = req.method !== 'GET' ? await req.json() : null;

    console.log(`CMS Admin API - ${req.method} ${path}`, { userId: user.id });

    // ============================================
    // GESTION DES PAGES
    // ============================================
    if (path === '/pages' && req.method === 'POST') {
      const { data, error } = await supabase
        .from('cms_pages')
        .insert({
          ...body,
          created_by: user.id,
          updated_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Log d'audit
      await supabase.from('cms_audit_logs').insert({
        entity_type: 'page',
        entity_id: data.id,
        action: 'create',
        user_id: user.id,
        new_values: data
      });

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path.startsWith('/pages/') && req.method === 'PUT') {
      const pageId = path.replace('/pages/', '');

      const { data, error } = await supabase
        .from('cms_pages')
        .update({
          ...body,
          updated_by: user.id
        })
        .eq('id', pageId)
        .select()
        .single();

      if (error) throw error;

      // Log d'audit
      await supabase.from('cms_audit_logs').insert({
        entity_type: 'page',
        entity_id: pageId,
        action: 'update',
        user_id: user.id,
        new_values: data
      });

      // Trigger webhook si publication
      if (body.status === 'published') {
        await triggerWebhooks(supabase, 'page_published', {
          type: 'page',
          slug: data.slug,
          id: data.id
        });
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path.startsWith('/pages/') && req.method === 'DELETE') {
      const pageId = path.replace('/pages/', '');

      const { error } = await supabase
        .from('cms_pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;

      // Log d'audit
      await supabase.from('cms_audit_logs').insert({
        entity_type: 'page',
        entity_id: pageId,
        action: 'delete',
        user_id: user.id
      });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // GESTION DES SECTIONS
    // ============================================
    if (path === '/sections' && req.method === 'POST') {
      const { data, error } = await supabase
        .from('cms_sections')
        .insert(body)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path.startsWith('/sections/') && req.method === 'PUT') {
      const sectionId = path.replace('/sections/', '');

      const { data, error } = await supabase
        .from('cms_sections')
        .update(body)
        .eq('id', sectionId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path.startsWith('/sections/') && req.method === 'DELETE') {
      const sectionId = path.replace('/sections/', '');

      const { error } = await supabase
        .from('cms_sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // WORKFLOW - CHANGER STATUT
    // ============================================
    if (path.startsWith('/workflow/') && req.method === 'POST') {
      const [, , entityType, entityId, action] = path.split('/');
      const { comment, newStatus } = body;

      const table = entityType === 'page' ? 'cms_pages' :
                    entityType === 'actualite' ? 'cms_actualites' :
                    'cms_evenements';

      // Récupérer l'entité
      const { data: entity, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .eq('id', entityId)
        .single();

      if (fetchError) throw fetchError;

      // Ajouter commentaire au workflow
      const comments = entity.workflow_comments || [];
      comments.push({
        userId: user.id,
        action,
        comment,
        timestamp: new Date().toISOString()
      });

      // Mettre à jour le statut
      const updates: any = {
        workflow_comments: comments,
        updated_by: user.id
      };

      if (newStatus) {
        updates.status = newStatus;
        if (newStatus === 'published') {
          updates.published_by = user.id;
          updates.published_at = new Date().toISOString();
        }
      }

      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', entityId)
        .select()
        .single();

      if (error) throw error;

      // Log d'audit
      await supabase.from('cms_audit_logs').insert({
        entity_type: entityType,
        entity_id: entityId,
        action: `workflow_${action}`,
        user_id: user.id,
        new_values: { status: newStatus, comment }
      });

      // Trigger webhook si publication
      if (newStatus === 'published') {
        await triggerWebhooks(supabase, `${entityType}_published`, {
          type: entityType,
          slug: data.slug,
          id: data.id
        });
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // UPLOAD MEDIA
    // ============================================
    if (path === '/media/upload' && req.method === 'POST') {
      // Note: L'upload de fichiers se fait via Supabase Storage
      // Cette API enregistre juste les métadonnées
      const { data, error } = await supabase
        .from('cms_media')
        .insert({
          ...body,
          uploaded_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route non trouvée
    return new Response(
      JSON.stringify({ error: 'Route non trouvée' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur CMS Admin API:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Fonction pour déclencher les webhooks
async function triggerWebhooks(supabase: any, eventType: string, payload: any) {
  try {
    // Récupérer les webhooks actifs pour cet événement
    const { data: webhooks, error } = await supabase
      .from('cms_webhooks')
      .select('*')
      .eq('is_active', true)
      .contains('trigger_events', [eventType]);

    if (error) throw error;

    // Déclencher chaque webhook
    for (const webhook of webhooks || []) {
      try {
        const response = await fetch(webhook.webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: eventType,
            data: payload,
            timestamp: new Date().toISOString()
          })
        });

        const success = response.ok;

        // Logger le résultat
        await supabase.from('cms_webhook_logs').insert({
          webhook_id: webhook.id,
          event_type: eventType,
          payload,
          status: success ? 'success' : 'error',
          response_code: response.status,
          response_body: await response.text(),
          completed_at: new Date().toISOString()
        });

        // Mettre à jour les stats du webhook
        if (success) {
          await supabase
            .from('cms_webhooks')
            .update({
              success_count: webhook.success_count + 1,
              last_triggered_at: new Date().toISOString()
            })
            .eq('id', webhook.id);
        } else {
          await supabase
            .from('cms_webhooks')
            .update({
              error_count: webhook.error_count + 1,
              last_triggered_at: new Date().toISOString()
            })
            .eq('id', webhook.id);
        }
      } catch (webhookError) {
        console.error(`Erreur webhook ${webhook.id}:`, webhookError);
        await supabase.from('cms_webhook_logs').insert({
          webhook_id: webhook.id,
          event_type: eventType,
          payload,
          status: 'error',
          error_message: webhookError.message,
          completed_at: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error('Erreur lors du déclenchement des webhooks:', error);
  }
}
