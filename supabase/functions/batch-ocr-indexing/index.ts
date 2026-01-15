import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DASHSCOPE_API_KEY = Deno.env.get('DASHSCOPE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const DASHSCOPE_API_URL = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';

// Configuration
const MAX_PAGES_PER_RUN = 50; // Limite par exécution pour éviter les timeouts
const DELAY_BETWEEN_PAGES_MS = 1000; // Délai entre les pages pour éviter le rate limiting

async function processPageWithOcr(imageUrl: string, language: string): Promise<string> {
  if (!DASHSCOPE_API_KEY) {
    throw new Error('DASHSCOPE_API_KEY not configured');
  }

  // Télécharger l'image et la convertir en base64
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch image: ${imageUrl}`);
  }
  
  const imageBuffer = await imageResponse.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
  const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
  const dataUrl = `data:${mimeType};base64,${base64}`;

  let promptText = '';
  if (language === 'ar') {
    promptText = 'Please extract all Arabic and Latin text from this image accurately. Preserve the original text layout and structure. Output only the extracted text without any additional commentary.';
  } else if (language === 'fr') {
    promptText = 'Please extract all French text from this image accurately. Preserve the original text layout and structure. Output only the extracted text without any additional commentary.';
  } else {
    promptText = 'Please extract all text from this image accurately. Preserve the original text layout and structure. Output only the extracted text without any additional commentary.';
  }

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
            { image: dataUrl },
            { text: promptText }
          ]
        }
      ]
    }
  };

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
    throw new Error(`DashScope API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  
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

  return extractedText;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { documentId, documentIds, language = 'ar', baseUrl } = await req.json();

    if (!baseUrl) {
      throw new Error('baseUrl is required (e.g., https://your-domain.com)');
    }

    console.log('Starting batch OCR indexing...');
    console.log('Document ID:', documentId || 'none');
    console.log('Document IDs:', documentIds?.length || 0);
    console.log('Language:', language);
    console.log('Base URL:', baseUrl);

    // Récupérer les documents à traiter
    let query = supabase
      .from('digital_library_documents')
      .select('id, title, pages_count, ocr_processed')
      .is('deleted_at', null)
      .gt('pages_count', 0);

    if (documentIds && documentIds.length > 0) {
      query = query.in('id', documentIds);
    } else if (documentId) {
      query = query.eq('id', documentId);
    }

    const { data: documents, error: docError } = await query;

    if (docError) throw docError;

    if (!documents || documents.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No documents to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: any[] = [];
    let totalPagesProcessed = 0;

    for (const doc of documents) {
      if (totalPagesProcessed >= MAX_PAGES_PER_RUN) {
        console.log('Reached max pages limit, stopping...');
        break;
      }

      console.log(`Processing document: ${doc.title} (${doc.pages_count} pages)`);

      // Vérifier quelles pages sont déjà indexées
      const { data: existingPages } = await supabase
        .from('digital_library_pages')
        .select('page_number')
        .eq('document_id', doc.id);

      const existingPageNumbers = new Set((existingPages || []).map(p => p.page_number));
      
      // Trouver les pages manquantes
      const missingPages: number[] = [];
      for (let i = 1; i <= doc.pages_count; i++) {
        if (!existingPageNumbers.has(i)) {
          missingPages.push(i);
        }
      }

      if (missingPages.length === 0) {
        console.log(`Document ${doc.title}: all pages already indexed`);
        results.push({
          documentId: doc.id,
          title: doc.title,
          status: 'already_indexed',
          pagesProcessed: 0
        });
        continue;
      }

      console.log(`Document ${doc.title}: ${missingPages.length} pages to process`);

      const docResults = {
        documentId: doc.id,
        title: doc.title,
        pagesProcessed: 0,
        pagesSkipped: 0,
        errors: [] as string[]
      };

      for (const pageNum of missingPages) {
        if (totalPagesProcessed >= MAX_PAGES_PER_RUN) break;

        // Essayer différents formats de nommage
        const possibleUrls = [
          `${baseUrl}/digital-library-pages/${doc.id}/page_${pageNum}.jpg`,
          `${baseUrl}/digital-library-pages/${doc.id}/page_${pageNum}.png`,
          `${baseUrl}/digital-library-pages/${doc.id}/img_p${pageNum}_1.jpg`,
          `${baseUrl}/digital-library-pages/${doc.id}/img_p${pageNum}_1.png`,
        ];

        let imageUrl = '';
        for (const url of possibleUrls) {
          try {
            const checkResponse = await fetch(url, { method: 'HEAD' });
            if (checkResponse.ok) {
              imageUrl = url;
              break;
            }
          } catch {
            // Continue to next URL
          }
        }

        if (!imageUrl) {
          console.log(`Page ${pageNum}: No image found`);
          docResults.pagesSkipped++;
          continue;
        }
        
        try {
          console.log(`Processing page ${pageNum}/${doc.pages_count} of ${doc.title}`);
          
          const ocrText = await processPageWithOcr(imageUrl, language);
          
          if (ocrText && ocrText.trim()) {
            // Insérer la page OCR
            const { error: insertError } = await supabase
              .from('digital_library_pages')
              .insert({
                document_id: doc.id,
                page_number: pageNum,
                ocr_text: ocrText.trim()
              });

            if (insertError) {
              console.error(`Error inserting page ${pageNum}:`, insertError);
              docResults.errors.push(`Page ${pageNum}: ${insertError.message}`);
            } else {
              docResults.pagesProcessed++;
              totalPagesProcessed++;
            }
          } else {
            console.log(`Page ${pageNum}: No text extracted`);
            docResults.pagesSkipped++;
          }

          // Délai entre les pages
          await sleep(DELAY_BETWEEN_PAGES_MS);

        } catch (pageError: any) {
          console.error(`Error processing page ${pageNum}:`, pageError);
          docResults.errors.push(`Page ${pageNum}: ${pageError.message}`);
        }
      }

      // Mettre à jour le flag ocr_processed si toutes les pages sont traitées
      const { count } = await supabase
        .from('digital_library_pages')
        .select('*', { count: 'exact', head: true })
        .eq('document_id', doc.id);

      if (count && count >= doc.pages_count) {
        await supabase
          .from('digital_library_documents')
          .update({ ocr_processed: true })
          .eq('id', doc.id);
        
        console.log(`Document ${doc.title}: OCR processing complete`);
      }

      results.push(docResults);
    }

    const summary = {
      message: 'Batch OCR indexing completed',
      totalPagesProcessed,
      maxPagesPerRun: MAX_PAGES_PER_RUN,
      documents: results
    };

    console.log('Batch OCR summary:', JSON.stringify(summary));

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Batch OCR error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
