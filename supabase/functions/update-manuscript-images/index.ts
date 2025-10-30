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

    // Mapping des titres vers les images générées
    const imageMapping: Record<string, string> = {
      'المقدمة': '/manuscripts/muqaddima.jpg',
      'كتاب الأغاني': '/manuscripts/aghani.jpg',
      'الكتاب': '/manuscripts/kitab.jpg',
      'رسالة الغفران': '/manuscripts/ghufran.jpg',
      'طوق الحمامة': '/manuscripts/tawq.jpg',
      'ألف ليلة وليلة': '/manuscripts/1001nights.jpg',
      'الشفاء': '/manuscripts/shifa.jpg',
      'تاريخ الرسل والملوك': '/manuscripts/tabari.jpg',
      'كليلة ودمنة': '/manuscripts/kalila.jpg',
      'البخلاء': '/manuscripts/bukhala.jpg',
    };

    let updatedCount = 0;
    const updates = [];

    // Mettre à jour chaque manuscrit avec son image correspondante
    for (const [title, imageUrl] of Object.entries(imageMapping)) {
      const { data, error } = await supabase
        .from('manuscripts')
        .update({ thumbnail_url: imageUrl })
        .eq('title', title)
        .select();

      if (error) {
        console.error(`Error updating ${title}:`, error);
      } else if (data && data.length > 0) {
        updatedCount += data.length;
        updates.push({ title, imageUrl, updated: true });
      } else {
        updates.push({ title, imageUrl, updated: false, reason: 'not found' });
      }
    }

    console.log(`Successfully updated ${updatedCount} manuscript images`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${updatedCount} manuscrits mis à jour avec leurs images`,
        updates
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
