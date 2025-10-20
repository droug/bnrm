import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Denv.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const exampleDocuments = [
      {
        title: 'Histoire du Maroc Médiéval',
        content_type: 'page',
        status: 'published',
        slug: 'histoire-maroc-medieval',
        content_body: '<p>Une exploration approfondie de l\'histoire du Maroc pendant la période médiévale.</p>',
        excerpt: 'L\'histoire fascinante du Maroc au Moyen Âge',
        published_at: new Date().toISOString(),
        is_featured: true,
        file_type: 'PDF',
        tags: ['histoire', 'maroc', 'médiéval']
      },
      {
        title: 'Architecture Andalouse au Maroc',
        content_type: 'page',
        status: 'published',
        slug: 'architecture-andalouse-maroc',
        content_body: '<p>Étude de l\'influence andalouse sur l\'architecture marocaine.</p>',
        excerpt: 'Les merveilles de l\'architecture andalouse',
        published_at: new Date().toISOString(),
        is_featured: true,
        file_type: 'PDF',
        tags: ['architecture', 'andalousie', 'maroc']
      },
      {
        title: 'Les Manuscrits de Fès',
        content_type: 'page',
        status: 'published',
        slug: 'manuscrits-fes',
        content_body: '<p>Collection des manuscrits historiques conservés à Fès.</p>',
        excerpt: 'Trésors manuscrits de la bibliothèque de Fès',
        published_at: new Date().toISOString(),
        is_featured: false,
        file_type: 'PDF',
        tags: ['manuscrits', 'fès', 'patrimoine']
      },
      {
        title: 'Poésie Arabe Classique',
        content_type: 'page',
        status: 'published',
        slug: 'poesie-arabe-classique',
        content_body: '<p>Anthologie de la poésie arabe classique du Maghreb.</p>',
        excerpt: 'Les grands poètes arabes du Maghreb',
        published_at: new Date().toISOString(),
        is_featured: true,
        file_type: 'PDF',
        tags: ['poésie', 'littérature', 'arabe']
      },
      {
        title: 'Calligraphie Marocaine Traditionnelle',
        content_type: 'page',
        status: 'published',
        slug: 'calligraphie-marocaine',
        content_body: '<p>L\'art de la calligraphie dans la tradition marocaine.</p>',
        excerpt: 'Techniques et styles de calligraphie marocaine',
        published_at: new Date().toISOString(),
        is_featured: false,
        file_type: 'PDF',
        tags: ['calligraphie', 'art', 'maroc']
      },
      {
        title: 'Dynasties du Maroc',
        content_type: 'page',
        status: 'published',
        slug: 'dynasties-maroc',
        content_body: '<p>Histoire des grandes dynasties qui ont régné sur le Maroc.</p>',
        excerpt: 'Les dynasties marocaines à travers les siècles',
        published_at: new Date().toISOString(),
        is_featured: true,
        file_type: 'PDF',
        tags: ['histoire', 'dynasties', 'maroc']
      },
      {
        title: 'Artisanat Traditionnel Berbère',
        content_type: 'page',
        status: 'published',
        slug: 'artisanat-berbere',
        content_body: '<p>Les techniques artisanales des communautés berbères.</p>',
        excerpt: 'Savoir-faire artisanal berbère ancestral',
        published_at: new Date().toISOString(),
        is_featured: false,
        file_type: 'PDF',
        tags: ['artisanat', 'berbère', 'tradition']
      },
      {
        title: 'Musique Andalouse Marocaine',
        content_type: 'page',
        status: 'published',
        slug: 'musique-andalouse',
        content_body: '<p>L\'héritage de la musique andalouse au Maroc.</p>',
        excerpt: 'Les trésors de la musique andalouse',
        published_at: new Date().toISOString(),
        is_featured: true,
        file_type: 'PDF',
        tags: ['musique', 'andalousie', 'culture']
      },
      {
        title: 'Jardins Marocains',
        content_type: 'page',
        status: 'published',
        slug: 'jardins-marocains',
        content_body: '<p>L\'art des jardins dans la culture marocaine.</p>',
        excerpt: 'Les jardins traditionnels du Maroc',
        published_at: new Date().toISOString(),
        is_featured: false,
        file_type: 'PDF',
        tags: ['jardins', 'architecture', 'nature']
      },
      {
        title: 'Cuisine Marocaine Authentique',
        content_type: 'page',
        status: 'published',
        slug: 'cuisine-marocaine',
        content_body: '<p>Recettes et traditions culinaires marocaines.</p>',
        excerpt: 'Le patrimoine gastronomique du Maroc',
        published_at: new Date().toISOString(),
        is_featured: true,
        file_type: 'PDF',
        tags: ['cuisine', 'gastronomie', 'tradition']
      },
      {
        title: 'Textile et Tissage Traditionnel',
        content_type: 'page',
        status: 'published',
        slug: 'textile-tissage',
        content_body: '<p>L\'art du tissage et du textile marocain.</p>',
        excerpt: 'Techniques de tissage traditionnel',
        published_at: new Date().toISOString(),
        is_featured: false,
        file_type: 'PDF',
        tags: ['textile', 'artisanat', 'tissage']
      },
      {
        title: 'Contes et Légendes du Maroc',
        content_type: 'page',
        status: 'published',
        slug: 'contes-legendes-maroc',
        content_body: '<p>Recueil de contes et légendes populaires marocains.</p>',
        excerpt: 'La tradition orale marocaine',
        published_at: new Date().toISOString(),
        is_featured: true,
        file_type: 'PDF',
        tags: ['contes', 'légendes', 'folklore']
      },
      {
        title: 'Zellige et Mosaïque Marocaine',
        content_type: 'page',
        status: 'published',
        slug: 'zellige-mosaique',
        content_body: '<p>L\'art du zellige dans l\'architecture marocaine.</p>',
        excerpt: 'Techniques et motifs du zellige',
        published_at: new Date().toISOString(),
        is_featured: false,
        file_type: 'PDF',
        tags: ['zellige', 'mosaïque', 'art']
      },
      {
        title: 'Soufisme au Maroc',
        content_type: 'page',
        status: 'published',
        slug: 'soufisme-maroc',
        content_body: '<p>Histoire et pratiques du soufisme marocain.</p>',
        excerpt: 'Les confréries soufies du Maroc',
        published_at: new Date().toISOString(),
        is_featured: true,
        file_type: 'PDF',
        tags: ['soufisme', 'spiritualité', 'islam']
      },
      {
        title: 'Cités Impériales du Maroc',
        content_type: 'page',
        status: 'published',
        slug: 'cites-imperiales',
        content_body: '<p>Guide historique des quatre cités impériales.</p>',
        excerpt: 'Fès, Marrakech, Meknès et Rabat',
        published_at: new Date().toISOString(),
        is_featured: false,
        file_type: 'PDF',
        tags: ['cités', 'histoire', 'architecture']
      },
      {
        title: 'Astronomie Arabe Médiévale',
        content_type: 'page',
        status: 'published',
        slug: 'astronomie-arabe',
        content_body: '<p>L\'héritage scientifique de l\'astronomie arabe.</p>',
        excerpt: 'Contributions arabes à l\'astronomie',
        published_at: new Date().toISOString(),
        is_featured: true,
        file_type: 'PDF',
        tags: ['astronomie', 'science', 'arabe']
      },
      {
        title: 'Médecine Traditionnelle Marocaine',
        content_type: 'page',
        status: 'published',
        slug: 'medecine-traditionnelle',
        content_body: '<p>Pratiques et remèdes de la médecine traditionnelle.</p>',
        excerpt: 'Savoirs médicinaux ancestraux',
        published_at: new Date().toISOString(),
        is_featured: false,
        file_type: 'PDF',
        tags: ['médecine', 'tradition', 'santé']
      },
      {
        title: 'Bijouterie Berbère',
        content_type: 'page',
        status: 'published',
        slug: 'bijouterie-berbere',
        content_body: '<p>L\'art de la bijouterie dans la culture berbère.</p>',
        excerpt: 'Techniques et symboles des bijoux berbères',
        published_at: new Date().toISOString(),
        is_featured: true,
        file_type: 'PDF',
        tags: ['bijoux', 'berbère', 'artisanat']
      },
      {
        title: 'Philosophie Arabe Classique',
        content_type: 'page',
        status: 'published',
        slug: 'philosophie-arabe',
        content_body: '<p>Grands penseurs de la philosophie arabe médiévale.</p>',
        excerpt: 'L\'héritage philosophique arabe',
        published_at: new Date().toISOString(),
        is_featured: false,
        file_type: 'PDF',
        tags: ['philosophie', 'pensée', 'arabe']
      },
      {
        title: 'Routes Commerciales du Sahara',
        content_type: 'page',
        status: 'published',
        slug: 'routes-sahara',
        content_body: '<p>Histoire des routes commerciales transsahariennes.</p>',
        excerpt: 'Le commerce caravanier à travers le désert',
        published_at: new Date().toISOString(),
        is_featured: true,
        file_type: 'PDF',
        tags: ['commerce', 'sahara', 'histoire']
      }
    ];

    const { data, error } = await supabaseClient
      .from('content')
      .insert(exampleDocuments)
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Documents d\'exemple créés avec succès',
        count: data?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
