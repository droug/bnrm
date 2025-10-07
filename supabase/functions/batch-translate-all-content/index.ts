import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LANGUAGES = ['fr', 'ar', 'ber', 'en'];
const LANGUAGE_NAMES: Record<string, string> = {
  'ar': 'Arabic',
  'ber': 'Amazigh (Berber)',
  'en': 'English',
  'fr': 'French'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { onlyMissing = true } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer tout le contenu publié
    const { data: contents, error: contentsError } = await supabase
      .from('content')
      .select('id, title, excerpt, content_body, meta_title, meta_description, seo_keywords, content_type')
      .eq('status', 'published');

    if (contentsError) throw contentsError;

    console.log(`Found ${contents?.length || 0} published contents`);

    const results = {
      total: contents?.length || 0,
      processed: 0,
      skipped: 0,
      errors: 0,
      details: [] as any[]
    };

    for (const content of contents || []) {
      try {
        // Vérifier les traductions existantes
        const { data: existingTranslations } = await supabase
          .from('content_translations')
          .select('language_code')
          .eq('content_id', content.id);

        const existingLangs = existingTranslations?.map(t => t.language_code) || [];
        const missingLangs = LANGUAGES.filter(lang => !existingLangs.includes(lang));

        if (onlyMissing && missingLangs.length === 0) {
          results.skipped++;
          results.details.push({
            contentId: content.id,
            title: content.title,
            status: 'skipped',
            reason: 'All translations exist'
          });
          continue;
        }

        const langsToTranslate = onlyMissing ? missingLangs : LANGUAGES;

        for (const targetLang of langsToTranslate) {
          try {
            console.log(`Translating "${content.title}" to ${targetLang}...`);
            
            const prompt = `Translate the following content to ${LANGUAGE_NAMES[targetLang]}. 
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
Content: ${content.content_body.substring(0, 2000)}${content.content_body.length > 2000 ? '...' : ''}
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
              throw new Error(`AI API error: ${aiResponse.status}`);
            }

            const aiData = await aiResponse.json();
            const translatedText = aiData.choices[0].message.content.trim();
            
            const jsonMatch = translatedText.match(/\{[\s\S]*\}/);
            const translated = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(translatedText);

            const slug = translated.title
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .substring(0, 100);

            const { error: insertError } = await supabase
              .from('content_translations')
              .upsert({
                content_id: content.id,
                language_code: targetLang,
                title: translated.title,
                excerpt: translated.excerpt || '',
                content_body: translated.content_body,
                meta_title: translated.meta_title || translated.title,
                meta_description: translated.meta_description || translated.excerpt,
                seo_keywords: translated.seo_keywords || [],
                slug: `${slug}-${targetLang}`,
                is_approved: false,
              }, {
                onConflict: 'content_id,language_code'
              });

            if (insertError) throw insertError;

            results.processed++;
            
            // Petit délai pour éviter de surcharger l'API
            await new Promise(resolve => setTimeout(resolve, 500));
            
          } catch (langError) {
            console.error(`Error translating to ${targetLang}:`, langError);
            results.errors++;
          }
        }

        results.details.push({
          contentId: content.id,
          title: content.title,
          status: 'processed',
          languages: langsToTranslate
        });

      } catch (contentError) {
        console.error(`Error processing content ${content.id}:`, contentError);
        results.errors++;
        results.details.push({
          contentId: content.id,
          title: content.title,
          status: 'error',
          error: contentError instanceof Error ? contentError.message : 'Unknown error'
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        message: `Batch translation completed: ${results.processed} processed, ${results.skipped} skipped, ${results.errors} errors`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Batch translate error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
