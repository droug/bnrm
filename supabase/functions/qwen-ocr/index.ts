import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DASHSCOPE_API_KEY = Deno.env.get('DASHSCOPE_API_KEY');

// Alibaba Cloud DashScope API endpoint for Qwen-VL-OCR
const DASHSCOPE_API_URL = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, language = 'ar' } = await req.json();

    if (!image) {
      throw new Error('No image data provided');
    }

    if (!DASHSCOPE_API_KEY) {
      throw new Error('DASHSCOPE_API_KEY is not configured');
    }

    console.log('Processing OCR request with Qwen-VL for language:', language);

    // Determine the prompt based on language
    let promptText = '';
    if (language === 'ar') {
      promptText = 'Please extract all Arabic and Latin text from this image accurately. Preserve the original text layout and structure. Output only the extracted text without any additional commentary.';
    } else if (language === 'fr') {
      promptText = 'Please extract all French text from this image accurately. Preserve the original text layout and structure. Output only the extracted text without any additional commentary.';
    } else {
      promptText = 'Please extract all text from this image accurately. Preserve the original text layout and structure. Output only the extracted text without any additional commentary.';
    }

    // Prepare the request payload for Qwen-VL-OCR
    const payload = {
      model: 'qwen-vl-ocr-latest',
      input: {
        messages: [
          {
            role: 'system',
            content: [
              { text: 'You are an expert OCR assistant specialized in extracting text from document images. You preserve layout and handle multiple scripts including Arabic, Latin, and numbers accurately.' }
            ]
          },
          {
            role: 'user',
            content: [
              { image: image.startsWith('data:') ? image : `data:image/png;base64,${image}` },
              { text: promptText }
            ]
          }
        ]
      }
    };

    console.log('Sending request to DashScope API...');

    const response = await fetch(DASHSCOPE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DashScope API error:', response.status, errorText);
      throw new Error(`DashScope API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('OCR response received:', JSON.stringify(result).substring(0, 500));

    // Extract the text from the response
    let extractedText = '';
    if (result.output?.choices?.[0]?.message?.content) {
      const content = result.output.choices[0].message.content;
      if (Array.isArray(content)) {
        extractedText = content
          .filter((item: any) => item.text)
          .map((item: any) => item.text)
          .join('\n');
      } else if (typeof content === 'string') {
        extractedText = content;
      }
    }

    console.log('Extracted text length:', extractedText.length);

    return new Response(
      JSON.stringify({
        text: extractedText,
        language: language,
        model: 'qwen-vl-ocr-latest',
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in qwen-ocr function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        error: errorMessage,
        text: ''
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
