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
    const { documentId, documentIds, language = 'ar', baseUrl, pdfUrl } = await req.json();

    // Allow either baseUrl for image-based OCR or pdfUrl for direct PDF OCR
    const hasPdfUrl = !!pdfUrl;
    const hasBaseUrl = !!baseUrl;

    console.log('Starting batch OCR indexing...');
    console.log('Document ID:', documentId || 'none');
    console.log('Document IDs:', documentIds?.length || 0);
    console.log('Language:', language);
    console.log('Base URL:', baseUrl || 'none');
    console.log('PDF URL:', pdfUrl || 'none');

    // Récupérer les documents à traiter
    let query = supabase
      .from('digital_library_documents')
      .select('id, title, pages_count, ocr_processed, pdf_url');

    if (documentIds && documentIds.length > 0) {
      query = query.in('id', documentIds).is('deleted_at', null);
    } else if (documentId) {
      query = query.eq('id', documentId).is('deleted_at', null);
    } else {
      // Only filter for pages_count > 0 when not targeting specific documents
      query = query.is('deleted_at', null).gt('pages_count', 0);
    }

    const { data: documents, error: docError } = await query;

    if (docError) throw docError;

    if (!documents || documents.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No documents to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If processing a single document with pdfUrl, we'll process the PDF directly
    // For batch or image-based processing, baseUrl is still needed
    const isSingleDocWithPdf = documents.length === 1 && (hasPdfUrl || documents[0].pdf_url);
    
    if (!isSingleDocWithPdf && !hasBaseUrl && documents.some(d => d.pages_count > 0)) {
      throw new Error('baseUrl is required for image-based OCR processing. Provide pdfUrl for direct PDF processing.');
    }

    const results: any[] = [];
    let totalPagesProcessed = 0;

    for (const doc of documents) {
      if (totalPagesProcessed >= MAX_PAGES_PER_RUN) {
        console.log('Reached max pages limit, stopping...');
        break;
      }

      // Determine the PDF URL to use
      const documentPdfUrl = pdfUrl || doc.pdf_url;
      const useDirectPdf = !!documentPdfUrl && !hasBaseUrl;

      console.log(`Processing document: ${doc.title} (pages_count: ${doc.pages_count}, pdf_url: ${documentPdfUrl ? 'yes' : 'no'})`);

      // If we have a PDF and no pages_count, we need to process the PDF directly
      if (useDirectPdf && documentPdfUrl) {
        console.log(`Document has PDF URL: ${documentPdfUrl}`);
        
        const docResults = {
          documentId: doc.id,
          title: doc.title,
          pagesProcessed: 0,
          pagesSkipped: 0,
          errors: [] as string[]
        };

        try {
          // Just verify the PDF is accessible with a HEAD request (don't load the whole file)
          const headResponse = await fetch(documentPdfUrl, { method: 'HEAD' });
          
          if (!headResponse.ok) {
            throw new Error(`PDF not accessible: ${headResponse.status}`);
          }

          const contentLength = headResponse.headers.get('content-length');
          console.log(`PDF accessible, size: ${contentLength || 'unknown'} bytes`);

          // Update the document to indicate OCR should be done client-side
          // PDFs require client-side rendering which isn't available in edge functions
          await supabase
            .from('digital_library_documents')
            .update({ 
              language: language 
            })
            .eq('id', doc.id);

          results.push({
            ...docResults,
            status: 'pdf_requires_client_processing',
            message: 'Le traitement OCR des PDF doit être effectué côté client. Utilisez l\'outil OCR manuel dans l\'interface.'
          });
          
          continue;
        } catch (pdfError: any) {
          console.error(`Error checking PDF for ${doc.title}:`, pdfError);
          docResults.errors.push(pdfError.message);
          results.push(docResults);
          continue;
        }
      }

      // Image-based processing (requires baseUrl)
      if (!hasBaseUrl) {
        console.log(`Skipping document ${doc.title}: no baseUrl and no PDF`);
        results.push({
          documentId: doc.id,
          title: doc.title,
          status: 'skipped',
          reason: 'No baseUrl provided for image-based OCR'
        });
        continue;
      }

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
