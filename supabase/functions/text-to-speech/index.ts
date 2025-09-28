import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Force redeploy to update environment variables - v2.1

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

console.log('OpenAI API Key configured:', OPENAI_API_KEY ? 'Yes' : 'No');

if (!OPENAI_API_KEY || OPENAI_API_KEY === 'secret') {
  console.error('OPENAI_API_KEY is not set or still using default value');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('OPENAI_API_KEY value:', OPENAI_API_KEY ? `${OPENAI_API_KEY.substring(0, 10)}...` : 'undefined');
    
    // Vérifier si la clé API est disponible
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'secret') {
      console.error('OpenAI API key is missing or invalid');
      return new Response(
        JSON.stringify({ 
          error: 'Configuration API manquante',
          audioContent: null
        }),
        { 
          status: 200, // Retourner 200 pour éviter l'erreur côté client
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { text, voice = 'alloy', language = 'fr' } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    console.log('Processing text-to-speech request:', { text: text.substring(0, 50) + '...', voice, language });

    // Choose voice based on language and preference
    const voiceMap: { [key: string]: string } = {
      'fr': voice || 'alloy',
      'ar': voice || 'shimmer',
      'en': voice || 'nova',
      'ber': voice || 'alloy'
    };

    const selectedVoice = voiceMap[language] || 'alloy';

    // Generate speech from text
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: selectedVoice,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    // Convert audio buffer to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    console.log('Text-to-speech generation successful');

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        voice: selectedVoice,
        language: language,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );

  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        audioContent: null
      }),
      {
        status: 200, // Changer à 200 pour éviter l'erreur côté client
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});