import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PageRequest {
  slug?: string;
  lang?: 'fr' | 'ar';
}

interface ListRequest {
  lang?: 'fr' | 'ar';
  limit?: number;
  page?: number;
  from?: string;
  to?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/cms-api', '');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`CMS API - ${req.method} ${path}`);

    // ============================================
    // PAGES
    // ============================================
    if (path.startsWith('/pages/')) {
      const slug = path.replace('/pages/', '');
      const lang = url.searchParams.get('lang') || 'fr';
      
      // Récupérer la page
      const { data: page, error: pageError } = await supabase
        .from('cms_pages')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (pageError || !page) {
        return new Response(
          JSON.stringify({ error: 'Page non trouvée' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Récupérer les sections
      const { data: sections, error: sectionsError } = await supabase
        .from('cms_sections')
        .select('*')
        .eq('page_id', page.id)
        .eq('is_visible', true)
        .order('order_index', { ascending: true });

      if (sectionsError) {
        throw sectionsError;
      }

      // Formater la réponse
      const response = {
        title: lang === 'ar' ? page.title_ar : page.title_fr,
        seo: {
          title: lang === 'ar' ? page.seo_title_ar : page.seo_title_fr,
          description: lang === 'ar' ? page.seo_description_ar : page.seo_description_fr,
          canonical: page.seo_canonical,
          keywords: lang === 'ar' ? page.seo_keywords_ar : page.seo_keywords_fr,
          hreflang: [
            { lang: 'fr', url: `${supabaseUrl}/${page.slug}?lang=fr` },
            { lang: 'ar', url: `${supabaseUrl}/${page.slug}?lang=ar` }
          ]
        },
        sections: sections?.map(s => ({
          type: s.section_type,
          title: lang === 'ar' ? s.title_ar : s.title_fr,
          content: lang === 'ar' ? s.content_ar : s.content_fr,
          props: s.props
        })) || []
      };

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // ACTUALITÉS
    // ============================================
    if (path === '/actualites') {
      const lang = url.searchParams.get('lang') || 'fr';
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const page = parseInt(url.searchParams.get('page') || '1');
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('cms_actualites')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .order('date_publication', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const response = {
        items: data?.map(a => ({
          slug: a.slug,
          title: lang === 'ar' ? a.title_ar : a.title_fr,
          chapo: lang === 'ar' ? a.chapo_ar : a.chapo_fr,
          image: a.image_url,
          imageAlt: lang === 'ar' ? a.image_alt_ar : a.image_alt_fr,
          date: a.date_publication,
          tags: a.tags,
          category: a.category
        })) || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Détail actualité
    if (path.startsWith('/actualites/')) {
      const slug = path.replace('/actualites/', '');
      const lang = url.searchParams.get('lang') || 'fr';

      const { data, error } = await supabase
        .from('cms_actualites')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: 'Actualité non trouvée' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Incrémenter le compteur de vues
      await supabase
        .from('cms_actualites')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);

      const response = {
        title: lang === 'ar' ? data.title_ar : data.title_fr,
        chapo: lang === 'ar' ? data.chapo_ar : data.chapo_fr,
        body: lang === 'ar' ? data.body_ar : data.body_fr,
        image: data.image_url,
        imageAlt: lang === 'ar' ? data.image_alt_ar : data.image_alt_fr,
        date: data.date_publication,
        tags: data.tags,
        category: data.category,
        viewCount: data.view_count
      };

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // ÉVÉNEMENTS
    // ============================================
    if (path === '/evenements') {
      const lang = url.searchParams.get('lang') || 'fr';
      const from = url.searchParams.get('from');
      const to = url.searchParams.get('to');

      let query = supabase
        .from('cms_evenements')
        .select('*')
        .eq('status', 'published')
        .order('date_debut', { ascending: true });

      if (from) {
        query = query.gte('date_debut', from);
      }
      if (to) {
        query = query.lte('date_fin', to);
      }

      const { data, error } = await query;

      if (error) throw error;

      const response = {
        items: data?.map(e => ({
          slug: e.slug,
          title: lang === 'ar' ? e.title_ar : e.title_fr,
          description: lang === 'ar' ? e.description_ar : e.description_fr,
          dateDebut: e.date_debut,
          dateFin: e.date_fin,
          lieu: lang === 'ar' ? e.lieu_ar : e.lieu_fr,
          affiche: e.affiche_url,
          cta: {
            label: lang === 'ar' ? e.cta_label_ar : e.cta_label_fr,
            url: e.cta_url
          },
          tags: e.tags,
          eventType: e.event_type
        })) || []
      };

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // MENUS
    // ============================================
    if (path === '/menu') {
      const lang = url.searchParams.get('lang') || 'fr';

      const { data, error } = await supabase
        .from('cms_menus')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify(data?.items || []),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // FOOTER
    // ============================================
    if (path === '/footer') {
      const lang = url.searchParams.get('lang') || 'fr';

      const { data, error } = await supabase
        .from('cms_footer')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;

      const response = {
        columns: data?.columns || [],
        socialLinks: data?.social_links || [],
        logos: data?.logos || [],
        legalText: lang === 'ar' ? data?.legal_text_ar : data?.legal_text_fr
      };

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // BANNIÈRES
    // ============================================
    if (path === '/bannieres') {
      const lang = url.searchParams.get('lang') || 'fr';
      const position = url.searchParams.get('position');

      let query = supabase
        .from('cms_bannieres')
        .select('*')
        .eq('is_active', true)
        .eq('status', 'published')
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('priority', { ascending: false });

      if (position) {
        query = query.eq('position', position);
      }

      const { data, error } = await query;

      if (error) throw error;

      const response = data?.map(b => ({
        title: lang === 'ar' ? b.title_ar : b.title_fr,
        text: lang === 'ar' ? b.text_ar : b.text_fr,
        image: b.image_url,
        imageAlt: lang === 'ar' ? b.image_alt_ar : b.image_alt_fr,
        link: {
          url: b.link_url,
          label: lang === 'ar' ? b.link_label_ar : b.link_label_fr
        },
        position: b.position,
        priority: b.priority
      })) || [];

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route non trouvée
    return new Response(
      JSON.stringify({ error: 'Route non trouvée' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur CMS API:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
