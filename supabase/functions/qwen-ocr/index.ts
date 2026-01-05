import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};


// Alibaba Cloud DashScope API endpoints for Qwen-VL-OCR
// Note: some accounts/keys are region-bound; we try both Intl and CN endpoints.
const DASHSCOPE_API_URL_INTL = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
const DASHSCOPE_API_URL_CN = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';

function normalizeDashscopeApiKey(raw: string | null): string {
  let v = (raw ?? '').trim();
  if (!v) return '';

  // Common paste mistakes:
  // - "Bearer sk-..."
  // - "DASHSCOPE_API_KEY=sk-..."
  // - quoted values
  if (v.includes('=') && !v.startsWith('sk-')) {
    const parts = v.split('=');
    v = (parts[parts.length - 1] ?? '').trim();
  }

  if (/^bearer\s+/i.test(v)) {
    v = v.replace(/^bearer\s+/i, '').trim();
  }

  v = v.replace(/^['"]+|['"]+$/g, '').trim();

  return v;
}

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

    // Read secret per-request so updates take effect quickly.
    const dashscopeApiKey = normalizeDashscopeApiKey(Deno.env.get('DASHSCOPE_API_KEY'));
    if (!dashscopeApiKey) {
      throw new Error('DASHSCOPE_API_KEY is not configured (expected a DashScope API Key, usually starting with "sk-")');
    }

    console.log('DashScope key loaded:', { length: dashscopeApiKey.length, prefix: dashscopeApiKey.slice(0, 4) });

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

    const urlCandidates = Array.from(
      new Set(
        [
          (Deno.env.get('DASHSCOPE_API_URL') ?? '').trim(),
          DASHSCOPE_API_URL_INTL,
          DASHSCOPE_API_URL_CN,
        ].filter(Boolean)
      )
    );

    let response: Response | null = null;
    let lastErrorText = '';
    let lastStatus = 500;

    for (const apiUrl of urlCandidates) {
      const r = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${dashscopeApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (r.ok) {
        response = r;
        break;
      }

      lastStatus = r.status;
      lastErrorText = await r.text();
      console.error('DashScope API error:', {
        apiUrl,
        status: r.status,
        keyHint: {
          length: dashscopeApiKey.length,
          prefix: dashscopeApiKey.slice(0, 4),
          startsWithSk: dashscopeApiKey.startsWith('sk-'),
        },
        bodyPreview: lastErrorText.slice(0, 300),
      });
    }

    if (!response) {
      throw new Error(`DashScope API error: ${lastStatus} - ${lastErrorText}`);
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
    const status = errorMessage.includes('DashScope API error: 401') ? 401 : 500;

    return new Response(
      JSON.stringify({
        error: errorMessage,
        text: ''
      }),
      {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
