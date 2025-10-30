import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const exampleManuscripts = [
      {
        title: 'المقدمة',
        author: 'ابن خلدون',
        language: 'arabe',
        description: 'Manuscrit historique en bon état',
        period: 'XIVe siècle',
        genre: 'histoire',
        thumbnail_url: '/manuscripts/muqaddima.jpg',
        is_visible: true,
        status: 'available',
        access_level: 'public'
      },
      {
        title: 'كتاب الأغاني',
        author: 'أبو الفرج الأصفهاني',
        language: 'arabe',
        description: 'Recueil de poésie et musique arabe classique',
        period: 'Xe siècle',
        genre: 'littérature',
        thumbnail_url: '/manuscripts/aghani.jpg',
        is_visible: true,
        status: 'available',
        access_level: 'public'
      },
      {
        title: 'الكتاب',
        author: 'سيبويه',
        language: 'arabe',
        description: 'Traité fondateur de grammaire arabe',
        period: 'VIIIe siècle',
        genre: 'linguistique',
        thumbnail_url: '/manuscripts/kitab.jpg',
        is_visible: true,
        status: 'available',
        access_level: 'public'
      },
      {
        title: 'رسالة الغفران',
        author: 'أبو العلاء المعري',
        language: 'arabe',
        description: 'Œuvre philosophique et littéraire majeure',
        period: 'XIe siècle',
        genre: 'littérature',
        thumbnail_url: '/manuscripts/ghufran.jpg',
        is_visible: true,
        status: 'available',
        access_level: 'public'
      },
      {
        title: 'طوق الحمامة',
        author: 'ابن حزم الأندلسي',
        language: 'arabe',
        description: 'Traité sur l\'amour et la psychologie',
        period: 'XIe siècle',
        genre: 'philosophie',
        thumbnail_url: '/manuscripts/tawq.jpg',
        is_visible: true,
        status: 'available',
        access_level: 'public'
      },
      {
        title: 'ألف ليلة وليلة',
        author: 'مجموعة من المؤلفين',
        language: 'arabe',
        description: 'Recueil légendaire de contes arabes',
        period: 'Période médiévale',
        genre: 'littérature',
        thumbnail_url: '/manuscripts/1001nights.jpg',
        is_visible: true,
        status: 'available',
        access_level: 'public'
      },
      {
        title: 'الشفاء',
        author: 'ابن سينا',
        language: 'arabe',
        description: 'Encyclopédie majeure de philosophie et sciences',
        period: 'XIe siècle',
        genre: 'philosophie',
        thumbnail_url: '/manuscripts/shifa.jpg',
        is_visible: true,
        status: 'available',
        access_level: 'public'
      },
      {
        title: 'تاريخ الرسل والملوك',
        author: 'الطبري',
        language: 'arabe',
        description: 'Chronique historique majeure du monde islamique',
        period: 'Xe siècle',
        genre: 'histoire',
        thumbnail_url: '/manuscripts/tabari.jpg',
        is_visible: true,
        status: 'available',
        access_level: 'public'
      },
      {
        title: 'كليلة ودمنة',
        author: 'ابن المقفع',
        language: 'arabe',
        description: 'Recueil célèbre de fables animalières',
        period: 'VIIIe siècle',
        genre: 'littérature',
        thumbnail_url: '/manuscripts/kalila.jpg',
        is_visible: true,
        status: 'available',
        access_level: 'public'
      },
      {
        title: 'البخلاء',
        author: 'الجاحظ',
        language: 'arabe',
        description: 'Œuvre satirique sur l\'avarice et les mœurs',
        period: 'IXe siècle',
        genre: 'littérature',
        thumbnail_url: '/manuscripts/bukhala.jpg',
        is_visible: true,
        status: 'available',
        access_level: 'public'
      }
    ];

    const { data, error } = await supabase
      .from('manuscripts')
      .insert(exampleManuscripts)
      .select();

    if (error) {
      console.error('Error inserting manuscripts:', error);
      throw error;
    }

    console.log(`Successfully inserted ${data.length} example manuscripts`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${data.length} manuscrits d'exemple ajoutés avec succès`,
        data 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
