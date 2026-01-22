import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[LOVABLE-AI-TRANSCRIBE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      logStep("ERROR: LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Lovable AI non configuré. Contactez le support.", code: "NO_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    logStep("Lovable API key verified");

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const language = formData.get("language") as string || "ar";

    if (!audioFile) {
      logStep("ERROR: No audio file provided");
      return new Response(
        JSON.stringify({ error: "Aucun fichier audio fourni" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Processing audio file", { 
      name: audioFile.name, 
      size: audioFile.size, 
      type: audioFile.type,
      language 
    });

    // Convert audio to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    logStep("Audio converted to base64", { length: base64Audio.length });

    // Determine MIME type
    let mimeType = audioFile.type || 'audio/mpeg';
    if (!mimeType || mimeType === 'application/octet-stream') {
      const ext = audioFile.name.split('.').pop()?.toLowerCase();
      const mimeMap: Record<string, string> = {
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'webm': 'audio/webm',
        'ogg': 'audio/ogg',
        'mp4': 'audio/mp4',
        'm4a': 'audio/mp4',
        'flac': 'audio/flac',
      };
      mimeType = mimeMap[ext || ''] || 'audio/mpeg';
    }

    // Language mapping for prompt
    const languageNames: Record<string, string> = {
      "ar": "Arabic",
      "fr": "French",
      "en": "English",
      "ber": "Amazigh/Berber",
      "es": "Spanish",
      "de": "German",
      "auto": "auto-detect the language"
    };
    const langName = languageNames[language] || language;

    // Build the request for Lovable AI (Gemini multimodal)
    const requestBody = {
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a professional audio transcription service. Transcribe the following audio file accurately.

Language: ${langName}
${language !== "auto" ? `The audio is in ${langName}. Transcribe it in that same language.` : "Auto-detect the language and transcribe accordingly."}

Instructions:
1. Transcribe the audio word-for-word as accurately as possible
2. Use proper punctuation and formatting
3. If there are multiple speakers, try to indicate speaker changes with new paragraphs
4. Preserve the original language - do NOT translate
5. Return ONLY the transcription text, nothing else (no explanations, no metadata)

Transcribe the audio now:`
            },
            {
              type: "input_audio",
              input_audio: {
                data: base64Audio,
                format: mimeType.split('/')[1] || 'mp3'
              }
            }
          ]
        }
      ],
      max_tokens: 8000,
      temperature: 0.1
    };

    logStep("Calling Lovable AI Gateway with Gemini...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep("ERROR: Lovable AI error", { status: response.status, error: errorText.slice(0, 500) });
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Limite de requêtes Lovable AI atteinte. Réessayez plus tard ou passez à un forfait supérieur.",
            code: "RATE_LIMIT"
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Crédits Lovable épuisés. Rechargez vos crédits dans Settings > Workspace > Usage.",
            code: "PAYMENT_REQUIRED"
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Try alternative format (inline_data for Gemini)
      logStep("Trying alternative format with inline_data...");
      
      const altRequestBody = {
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Transcribe this audio accurately in ${langName}. Return only the transcription text, no explanations.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Audio}`
                }
              }
            ]
          }
        ],
        max_tokens: 8000,
        temperature: 0.1
      };

      const altResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(altRequestBody),
      });

      if (!altResponse.ok) {
        const altError = await altResponse.text();
        logStep("ERROR: Alternative format also failed", { error: altError.slice(0, 300) });
        return new Response(
          JSON.stringify({ 
            error: "Lovable AI ne supporte pas encore la transcription audio. Utilisez la méthode 'Local (Gratuit)'.",
            code: "UNSUPPORTED"
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const altResult = await altResponse.json();
      const altText = altResult.choices?.[0]?.message?.content?.trim() || "";
      
      logStep("Alternative transcription completed", { textLength: altText.length });
      
      return new Response(
        JSON.stringify({
          text: altText,
          segments: altText.split(/[.!?。؟]+/).filter((s: string) => s.trim()).map((s: string, i: number) => ({
            id: i,
            text: s.trim(),
            start: 0,
            end: 0
          })),
          method: "lovable-ai-gemini"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    logStep("Lovable AI response received", { 
      hasChoices: !!result.choices,
      choicesCount: result.choices?.length
    });

    const transcriptionText = result.choices?.[0]?.message?.content?.trim() || "";

    if (!transcriptionText) {
      logStep("WARNING: Empty transcription result");
      return new Response(
        JSON.stringify({ 
          error: "Transcription vide. Le fichier audio peut être trop court ou inaudible.",
          code: "EMPTY_RESULT"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Split into segments by sentences
    const segments = transcriptionText
      .split(/[.!?。؟]+/)
      .filter((s: string) => s.trim())
      .map((s: string, i: number) => ({
        id: i,
        text: s.trim(),
        start: 0,
        end: 0
      }));

    logStep("Transcription completed successfully", { 
      textLength: transcriptionText.length,
      segmentsCount: segments.length
    });

    return new Response(
      JSON.stringify({
        text: transcriptionText,
        segments: segments,
        method: "lovable-ai-gemini"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    logStep("ERROR in function", { message: error?.message ?? String(error) });
    return new Response(
      JSON.stringify({ error: error?.message || "Erreur interne du serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
