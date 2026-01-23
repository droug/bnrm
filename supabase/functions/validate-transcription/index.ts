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
        JSON.stringify({ validatedText: "", corrections: [], confidence: 1 }),
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

    const systemPrompt = `Tu es un expert linguiste spécialisé dans la correction et la validation de transcriptions audio.

Ta tâche est d'analyser une transcription brute et de:
1. Identifier et corriger les mots mal transcrits ou inexistants
2. Vérifier la cohérence grammaticale et syntaxique des phrases
3. Corriger les erreurs de ponctuation
4. Préserver le sens original et le style du locuteur

RÈGLES IMPORTANTES:
- La langue de la transcription est: ${langName}
- NE PAS traduire le texte - garde la même langue
- NE PAS ajouter de contenu qui n'existe pas dans l'original
- Corriger uniquement les erreurs évidentes de transcription
- Préserver les expressions idiomatiques et le registre de langue
- Pour l'arabe, respecter la grammaire et l'orthographe arabes standards

Réponds UNIQUEMENT avec un objet JSON valide au format suivant:
{
  "validatedText": "le texte corrigé complet",
  "corrections": [
    {"original": "mot erroné", "corrected": "mot corrigé", "reason": "explication courte"}
  ],
  "confidence": 0.95
}

Le champ "confidence" est un score entre 0 et 1 indiquant ta confiance dans la qualité de la transcription originale.`;

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
          { role: "user", content: `Voici la transcription à valider et corriger:\n\n${text}` }
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
            confidence: 0.5
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Return original text on error
      return new Response(
        JSON.stringify({ 
          validatedText: text,
          corrections: [],
          confidence: 0.5,
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
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        validationResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Return original text if parsing fails
      validationResult = {
        validatedText: text,
        corrections: [],
        confidence: 0.7
      };
    }

    console.log(`Validation complete: ${validationResult.corrections?.length || 0} corrections, confidence: ${validationResult.confidence}`);

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
