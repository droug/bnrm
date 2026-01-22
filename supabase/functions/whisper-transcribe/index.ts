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
    const HUGGINGFACE_API_TOKEN = Deno.env.get("HUGGINGFACE_API_TOKEN");
    
    if (!HUGGINGFACE_API_TOKEN) {
      console.error("HUGGINGFACE_API_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: "Hugging Face API token not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      console.error("No audio file provided");
      return new Response(
        JSON.stringify({ error: "No audio file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing transcription for file: ${audioFile.name}, size: ${audioFile.size}, type: ${audioFile.type}`);

    // Get audio bytes
    const audioBytes = await audioFile.arrayBuffer();

    // Use Whisper large-v3 for best multilingual support (Arabic, French, English)
    // Alternative models: openai/whisper-medium, openai/whisper-small
    const modelId = "openai/whisper-large-v3";
    
    console.log(`Calling Hugging Face Inference API with model: ${modelId}`);

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${modelId}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HUGGINGFACE_API_TOKEN}`,
          "Content-Type": audioFile.type || "audio/mpeg",
        },
        body: audioBytes,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Hugging Face API error: ${response.status} - ${errorText}`);
      
      // Check for model loading state
      if (response.status === 503) {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.includes("loading")) {
          return new Response(
            JSON.stringify({ 
              error: "Le modèle Whisper est en cours de chargement. Réessayez dans quelques secondes.",
              details: errorText,
              status: 503,
              retry: true
            }),
            { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
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
    console.log(`Transcription completed successfully`);

    // Hugging Face Whisper returns { text: "..." }
    const transcription = {
      text: result.text || "",
      // Hugging Face inference API doesn't return word timestamps
      // but we can simulate basic segments from the text
      words: []
    };

    return new Response(
      JSON.stringify(transcription),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in whisper-transcribe function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
