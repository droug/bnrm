import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { text, language } = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ validatedText: "", corrections: [], confidence: 1, qualityScore: 100 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Validating transcription: ${text.length} characters, language: ${language}`);

    // Language names for the prompt
    const languageNames: Record<string, string> = {
      "ar": "Arabe",
      "fr": "Français", 
      "en": "Anglais",
      "ber": "Amazigh/Berbère",
      "es": "Espagnol",
      "de": "Allemand",
      "it": "Italien",
      "pt": "Portugais"
    };

    const langName = languageNames[language] || language || "la langue d'origine";

    const systemPrompt = `Tu es un expert linguiste spécialisé dans la reconstruction de transcriptions audio de mauvaise qualité.

CONTEXTE: Cette transcription provient d'un modèle de reconnaissance vocale basique qui a produit beaucoup d'erreurs. Ton travail est de la RECONSTRUIRE intelligemment.

TÂCHE PRINCIPALE:
1. Identifier les mots qui n'existent PAS dans la langue ${langName} ou qui sont manifestement mal transcrits
2. REMPLACER ces mots par des mots RÉELS qui ont du sens dans le contexte
3. Reconstruire des phrases cohérentes et grammaticalement correctes
4. Évaluer la qualité globale de la transcription originale

RÈGLES CRITIQUES:
- Langue: ${langName} - NE PAS traduire
- Sois AGRESSIF dans les corrections - préfère une phrase sensée à du charabia
- Si un mot n'existe pas, trouve le mot réel le plus probable selon le contexte
- Pour l'arabe: utilise l'arabe standard moderne, corrige les mots déformés
- Supprime les répétitions inutiles et les faux mots

ÉVALUATION DE QUALITÉ:
- 0-30: Transcription très mauvaise, beaucoup de mots inexistants
- 31-60: Qualité médiocre, plusieurs erreurs importantes  
- 61-80: Qualité acceptable, quelques corrections nécessaires
- 81-100: Bonne qualité, corrections mineures seulement

Réponds UNIQUEMENT avec un objet JSON valide:
{
  "validatedText": "le texte ENTIÈREMENT corrigé et cohérent",
  "corrections": [
    {"original": "mot erroné", "corrected": "mot correct", "type": "inexistant|grammaire|orthographe"}
  ],
  "qualityScore": 45,
  "recommendation": "Si qualityScore < 50, suggère d'utiliser Gemini ou OpenAI pour une meilleure transcription"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Transcription à corriger et reconstruire:\n\n"${text}"\n\nAnalyse chaque mot, identifie ceux qui n'existent pas, et reconstruis un texte cohérent.` }
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI API error: ${response.status} - ${errorText}`);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Trop de requêtes. Veuillez réessayer.",
            validatedText: text,
            corrections: [],
            qualityScore: 50
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          validatedText: text,
          corrections: [],
          qualityScore: 50,
          error: "Validation failed, returning original text"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const aiResponse = result.choices?.[0]?.message?.content || "";
    
    console.log("AI response received, parsing JSON...");

    // Try to parse JSON from the response
    let validationResult;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        validationResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      validationResult = {
        validatedText: text,
        corrections: [],
        qualityScore: 50
      };
    }

    console.log(`Validation complete: ${validationResult.corrections?.length || 0} corrections, quality: ${validationResult.qualityScore}%`);

    return new Response(
      JSON.stringify(validationResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in validate-transcription function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
