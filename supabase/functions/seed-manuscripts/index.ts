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
        title_ar: 'المقدمة',
        author: 'ابن خلدون',
        language: 'ar',
        script_type: 'arabic',
        physical_description: 'Manuscrit en bon état',
        acquisition_method: 'don',
        conservation_status: 'bon',
        classification: 'histoire',
        thumbnail_url: '/manuscripts/muqaddima.jpg'
      },
      {
        title: 'كتاب الأغاني',
        title_ar: 'كتاب الأغاني',
        author: 'أبو الفرج الأصفهاني',
        language: 'ar',
        script_type: 'arabic',
        physical_description: 'Manuscrit ancien',
        acquisition_method: 'don',
        conservation_status: 'bon',
        classification: 'littérature',
        thumbnail_url: '/manuscripts/aghani.jpg'
      },
      {
        title: 'الكتاب',
        title_ar: 'الكتاب',
        author: 'سيبويه',
        language: 'ar',
        script_type: 'arabic',
        physical_description: 'Manuscrit de grammaire arabe',
        acquisition_method: 'don',
        conservation_status: 'bon',
        classification: 'linguistique',
        thumbnail_url: '/manuscripts/kitab.jpg'
      },
      {
        title: 'رسالة الغفران',
        title_ar: 'رسالة الغفران',
        author: 'أبو العلاء المعري',
        language: 'ar',
        script_type: 'arabic',
        physical_description: 'Œuvre littéraire classique',
        acquisition_method: 'don',
        conservation_status: 'bon',
        classification: 'littérature',
        thumbnail_url: '/manuscripts/ghufran.jpg'
      },
      {
        title: 'طوق الحمامة',
        title_ar: 'طوق الحمامة',
        author: 'ابن حزم الأندلسي',
        language: 'ar',
        script_type: 'arabic',
        physical_description: 'Traité sur l\'amour',
        acquisition_method: 'don',
        conservation_status: 'bon',
        classification: 'philosophie',
        thumbnail_url: '/manuscripts/tawq.jpg'
      },
      {
        title: 'ألف ليلة وليلة',
        title_ar: 'ألف ليلة وليلة',
        author: 'مجموعة من المؤلفين',
        language: 'ar',
        script_type: 'arabic',
        physical_description: 'Recueil de contes',
        acquisition_method: 'don',
        conservation_status: 'bon',
        classification: 'littérature',
        thumbnail_url: '/manuscripts/1001nights.jpg'
      },
      {
        title: 'الشفاء',
        title_ar: 'الشفاء',
        author: 'ابن سينا',
        language: 'ar',
        script_type: 'arabic',
        physical_description: 'Encyclopédie philosophique et scientifique',
        acquisition_method: 'don',
        conservation_status: 'bon',
        classification: 'philosophie',
        thumbnail_url: '/manuscripts/shifa.jpg'
      },
      {
        title: 'تاريخ الرسل والملوك',
        title_ar: 'تاريخ الرسل والملوك',
        author: 'الطبري',
        language: 'ar',
        script_type: 'arabic',
        physical_description: 'Chronique historique',
        acquisition_method: 'don',
        conservation_status: 'bon',
        classification: 'histoire',
        thumbnail_url: '/manuscripts/tabari.jpg'
      },
      {
        title: 'كليلة ودمنة',
        title_ar: 'كليلة ودمنة',
        author: 'ابن المقفع',
        language: 'ar',
        script_type: 'arabic',
        physical_description: 'Fables et contes',
        acquisition_method: 'don',
        conservation_status: 'bon',
        classification: 'littérature',
        thumbnail_url: '/manuscripts/kalila.jpg'
      },
      {
        title: 'البخلاء',
        title_ar: 'البخلاء',
        author: 'الجاحظ',
        language: 'ar',
        script_type: 'arabic',
        physical_description: 'Œuvre satirique',
        acquisition_method: 'don',
        conservation_status: 'bon',
        classification: 'littérature',
        thumbnail_url: '/manuscripts/bukhala.jpg'
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
