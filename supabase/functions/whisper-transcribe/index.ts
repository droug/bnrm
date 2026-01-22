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
        JSON.stringify({ error: "Lovable API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const language = formData.get("language") as string || "auto";

    if (!audioFile) {
      console.error("No audio file provided");
      return new Response(
        JSON.stringify({ error: "No audio file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing transcription for file: ${audioFile.name}, size: ${audioFile.size}, type: ${audioFile.type}, language: ${language}`);

    // Convert audio file to base64
    const audioBytes = await audioFile.arrayBuffer();
    const base64Audio = btoa(
      new Uint8Array(audioBytes).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // Determine MIME type
    let mimeType = audioFile.type || "audio/mpeg";
    if (audioFile.name.endsWith('.mp4') || audioFile.name.endsWith('.m4a')) {
      mimeType = "audio/mp4";
    } else if (audioFile.name.endsWith('.webm')) {
      mimeType = "audio/webm";
    } else if (audioFile.name.endsWith('.wav')) {
      mimeType = "audio/wav";
    } else if (audioFile.name.endsWith('.ogg')) {
      mimeType = "audio/ogg";
    }

    console.log(`Using MIME type: ${mimeType}`);

    // Build the prompt for transcription
    let languageInstruction = "";
    if (language && language !== "auto") {
      const languageNames: Record<string, string> = {
        "ar": "Arabic (العربية)",
        "fr": "French (Français)",
        "en": "English",
        "ber": "Amazigh/Berber (ⵜⴰⵎⴰⵣⵉⵖⵜ)"
      };
      languageInstruction = `The audio is in ${languageNames[language] || language}. `;
    }

    const systemPrompt = `You are an expert audio transcription assistant. Your task is to transcribe audio content accurately and completely.

${languageInstruction}Please transcribe the entire audio content verbatim. Include all spoken words. 
If there are multiple speakers, you may indicate speaker changes with line breaks.
Output ONLY the transcription text, nothing else. No explanations, no comments, just the pure transcription.`;

    console.log("Calling Lovable AI Gateway for transcription...");

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
          { 
            role: "user", 
            content: [
              {
                type: "text",
                text: "Please transcribe this audio file completely and accurately:"
              },
              {
                type: "input_audio",
                input_audio: {
                  data: base64Audio,
                  format: mimeType.split('/')[1] || "mp3"
                }
              }
            ]
          }
        ],
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Lovable AI API error: ${response.status} - ${errorText}`);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Trop de requêtes. Veuillez réessayer dans quelques instants.",
            status: 429
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Crédits API insuffisants. Veuillez recharger votre compte.",
            status: 402
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
    console.log("Lovable AI response received");

    // Extract the transcription text from the response
    const transcriptionText = result.choices?.[0]?.message?.content || "";
    
    if (!transcriptionText) {
      console.error("No transcription text in response");
      return new Response(
        JSON.stringify({ 
          error: "No transcription generated",
          details: "The AI model did not return any transcription text"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Transcription completed successfully, length: ${transcriptionText.length} characters`);

    const transcription = {
      text: transcriptionText.trim(),
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
