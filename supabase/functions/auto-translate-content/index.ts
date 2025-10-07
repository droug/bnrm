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
    const { contentId, targetLanguages } = await req.json();
    
    if (!contentId || !targetLanguages || !Array.isArray(targetLanguages)) {
      return new Response(
        JSON.stringify({ error: 'contentId and targetLanguages array are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer le contenu original
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('title, excerpt, content_body, meta_title, meta_description, seo_keywords')
      .eq('id', contentId)
      .single();

    if (contentError || !content) {
      return new Response(
        JSON.stringify({ error: 'Content not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];
    const languageNames: Record<string, string> = {
      'ar': 'Arabic',
      'ber': 'Amazigh (Berber)',
      'en': 'English',
      'fr': 'French'
    };

    // Traduire pour chaque langue
    for (const targetLang of targetLanguages) {
      try {
        console.log(`Translating to ${targetLang}...`);
        
        const prompt = `Translate the following content to ${languageNames[targetLang]}. 
Keep the same tone and style. Return ONLY valid JSON with these exact fields:
{
  "title": "translated title",
  "excerpt": "translated excerpt",
  "content_body": "translated content",
  "meta_title": "translated meta title",
  "meta_description": "translated meta description",
  "seo_keywords": ["keyword1", "keyword2"]
}

Content to translate:
Title: ${content.title}
Excerpt: ${content.excerpt || ''}
Content: ${content.content_body}
Meta Title: ${content.meta_title || ''}
Meta Description: ${content.meta_description || ''}
SEO Keywords: ${content.seo_keywords?.join(', ') || ''}`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: 'You are a professional translator. Always respond with valid JSON only, no additional text.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`AI translation error for ${targetLang}:`, errorText);
          results.push({ language: targetLang, success: false, error: 'Translation failed' });
          continue;
        }

        const aiData = await aiResponse.json();
        const translatedText = aiData.choices[0].message.content.trim();
        
        // Extraire le JSON de la réponse
        let translated;
        try {
          // Nettoyer le texte pour extraire uniquement le JSON
          const jsonMatch = translatedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            translated = JSON.parse(jsonMatch[0]);
          } else {
            translated = JSON.parse(translatedText);
          }
        } catch (parseError) {
          console.error(`JSON parse error for ${targetLang}:`, parseError);
          console.error('Response was:', translatedText);
          results.push({ language: targetLang, success: false, error: 'Invalid translation format' });
          continue;
        }

        // Générer un slug pour la traduction
        const slug = translated.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 100);

        // Insérer ou mettre à jour la traduction
        const { error: insertError } = await supabase
          .from('content_translations')
          .upsert({
            content_id: contentId,
            language_code: targetLang,
            title: translated.title,
            excerpt: translated.excerpt,
            content_body: translated.content_body,
            meta_title: translated.meta_title,
            meta_description: translated.meta_description,
            seo_keywords: translated.seo_keywords,
            slug: `${slug}-${targetLang}`,
            is_approved: false,
            translated_by: null
          }, {
            onConflict: 'content_id,language_code'
          });

        if (insertError) {
          console.error(`Insert error for ${targetLang}:`, insertError);
          results.push({ language: targetLang, success: false, error: insertError.message });
        } else {
          results.push({ language: targetLang, success: true });
        }
      } catch (error) {
        console.error(`Error translating to ${targetLang}:`, error);
        results.push({ 
          language: targetLang, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        message: `Translation completed for ${results.filter(r => r.success).length}/${targetLanguages.length} languages`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Auto-translate error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
