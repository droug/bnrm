import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[OPENAI-WHISPER] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const OPENAI_API_KEY = (Deno.env.get("OPENAI_API_KEY") ?? "").trim();
    
    if (!OPENAI_API_KEY) {
      logStep("ERROR: OPENAI_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    // Avoid logging secrets. Only log shape/length for debugging.
    logStep("OpenAI API key loaded", {
      length: OPENAI_API_KEY.length,
      startsWithSk: OPENAI_API_KEY.startsWith("sk-"),
    });

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const language = formData.get("language") as string || "auto";

    if (!audioFile) {
      logStep("ERROR: No audio file provided");
      return new Response(
        JSON.stringify({ error: "No audio file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Processing audio file", { 
      name: audioFile.name, 
      size: audioFile.size, 
      type: audioFile.type, 
      language 
    });

    // Prepare form data for OpenAI Whisper API
    const openaiFormData = new FormData();
    openaiFormData.append("file", audioFile, audioFile.name);
    openaiFormData.append("model", "whisper-1");
    openaiFormData.append("response_format", "verbose_json");
    
    // Map language codes to OpenAI format
    const languageMap: Record<string, string> = {
      "ar": "ar",
      "fr": "fr", 
      "en": "en",
      "ber": "ar", // Amazigh - fallback to Arabic
      "es": "es",
      "de": "de",
      "it": "it",
      "pt": "pt"
    };

    if (language && language !== "auto" && languageMap[language]) {
      openaiFormData.append("language", languageMap[language]);
      logStep("Language set", { language: languageMap[language] });
    }

    logStep("Calling OpenAI Whisper API...");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: openaiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Sanitize the most common key-leak pattern from OpenAI error messages.
      const safeErrorText = errorText
        .replace(/(Incorrect API key provided: )[^.\n]+/gi, "$1[REDACTED]")
        .slice(0, 2000);
      logStep("ERROR: OpenAI API error", { status: response.status, error: safeErrorText });
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Limite de requêtes atteinte. Veuillez réessayer dans quelques instants.",
            status: 429
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ 
            error: "Clé API OpenAI invalide ou expirée.",
            status: 401
          }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Transcription failed", 
          details: errorText,
          status: response.status 
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    logStep("OpenAI Whisper response received", { 
      textLength: result.text?.length,
      segmentsCount: result.segments?.length,
      duration: result.duration
    });

    // Extract segments with timestamps if available
    const segments = result.segments?.map((seg: any, idx: number) => ({
      id: idx,
      text: seg.text?.trim() || "",
      start: seg.start || 0,
      end: seg.end || 0
    })) || [];

    const transcription = {
      text: result.text?.trim() || "",
      segments: segments,
      duration: result.duration,
      language: result.language
    };

    logStep("Transcription completed successfully", { 
      textLength: transcription.text.length,
      segmentsCount: segments.length
    });

    return new Response(
      JSON.stringify(transcription),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    logStep("ERROR in function", { message: error?.message ?? String(error) });
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
