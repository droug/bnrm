import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { text, sourceLang, targetLangs, context } = await req.json();

    if (!text || !sourceLang || !targetLangs?.length) {
      return new Response(JSON.stringify({ error: 'Missing required fields: text, sourceLang, targetLangs' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const langNames: Record<string, string> = {
      fr: 'French',
      ar: 'Arabic (Modern Standard Arabic, used in Morocco)',
      en: 'English',
      es: 'Spanish',
      amz: 'Amazigh/Tamazight (Tifinagh script: ⵜⴰⵎⴰⵣⵉⵖⵜ)',
    };

    const targetLangsList = targetLangs.map((l: string) => `- ${l}: ${langNames[l] || l}`).join('\n');

    const systemPrompt = `You are a professional translator for the BNRM (Bibliothèque Nationale du Royaume du Maroc) website.
You translate UI text (buttons, labels, menus, titles, descriptions) accurately and naturally.

Key rules:
- For Arabic (ar): use Modern Standard Arabic with Moroccan conventions
- For Amazigh (amz): use Tifinagh script (ⵜⴰⵎⴰⵣⵉⵖⵜ)
- For Spanish (es): use neutral/standard Spanish
- For English (en): use standard English
- Keep translations concise and appropriate for UI context
- Preserve any {{variables}} or HTML tags in the text
- If the text is a single word or short label, keep the translation equally concise`;

    const userPrompt = `Translate the following text from ${langNames[sourceLang] || sourceLang} to the target languages.
${context ? `Context: This text is used in ${context} (e.g., navigation menu, form label, button, page title, etc.)` : ''}

Source text (${sourceLang}): "${text}"

Target languages:
${targetLangsList}

Return ONLY a valid JSON object with language codes as keys and translated text as values. No markdown, no explanation.
Example: {"ar": "...", "en": "...", "es": "...", "amz": "..."}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requêtes atteinte, réessayez dans un moment.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Crédits AI épuisés. Veuillez recharger votre compte.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errText = await response.text();
      console.error('AI gateway error:', response.status, errText);
      return new Response(JSON.stringify({ error: 'Erreur du service de traduction' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '';

    // Parse JSON from AI response (strip markdown if present)
    let translations: Record<string, string> = {};
    try {
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      translations = JSON.parse(jsonStr);
    } catch {
      console.error('Failed to parse AI response:', content);
      return new Response(JSON.stringify({ error: 'Impossible de parser la réponse AI', raw: content }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ translations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('ai-translate error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
