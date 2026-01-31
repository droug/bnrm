/**
 * Utility to extract text from PDF pages for indexing
 * Uses PDF.js to extract embedded text from already OCR'd or born-digital PDFs
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ExtractionProgress {
  currentPage: number;
  totalPages: number;
  percentage: number;
}

/**
 * Extracts text from all pages of a PDF file
 * @param pdfUrl - URL of the PDF file
 * @param onProgress - Optional callback for progress updates
 * @returns Array of extracted pages with page numbers and text
 */
export async function extractTextFromPdf(
  pdfUrl: string,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<ExtractedPage[]> {
  const pages: ExtractedPage[] = [];

  try {
    console.log('[PDF Text Extractor] Loading PDF from:', pdfUrl);
    
    // Fetch PDF data
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const totalPages = pdf.numPages;
    console.log(`[PDF Text Extractor] PDF has ${totalPages} pages`);

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Extract text from all items on the page
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        pages.push({
          pageNumber: pageNum,
          text: pageText
        });

        // Report progress
        if (onProgress) {
          onProgress({
            currentPage: pageNum,
            totalPages,
            percentage: Math.round((pageNum / totalPages) * 100)
          });
        }
      } catch (pageError) {
        console.warn(`[PDF Text Extractor] Error extracting page ${pageNum}:`, pageError);
        // Continue with empty text for this page
        pages.push({
          pageNumber: pageNum,
          text: ''
        });
      }
    }

    console.log(`[PDF Text Extractor] Extracted text from ${pages.length} pages`);
    return pages;
  } catch (error) {
    console.error('[PDF Text Extractor] Error:', error);
    throw error;
  }
}

/**
 * Extracts text from a PDF File object (for upload scenarios)
 */
export async function extractTextFromPdfFile(
  file: File,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<ExtractedPage[]> {
  const pages: ExtractedPage[] = [];

  try {
    console.log('[PDF Text Extractor] Loading PDF from file:', file.name);
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const totalPages = pdf.numPages;
    console.log(`[PDF Text Extractor] PDF has ${totalPages} pages`);

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        pages.push({
          pageNumber: pageNum,
          text: pageText
        });

        if (onProgress) {
          onProgress({
            currentPage: pageNum,
            totalPages,
            percentage: Math.round((pageNum / totalPages) * 100)
          });
        }
      } catch (pageError) {
        console.warn(`[PDF Text Extractor] Error extracting page ${pageNum}:`, pageError);
        pages.push({
          pageNumber: pageNum,
          text: ''
        });
      }
    }

    console.log(`[PDF Text Extractor] Extracted text from ${pages.length} pages`);
    return pages;
  } catch (error) {
    console.error('[PDF Text Extractor] Error:', error);
    throw error;
  }
}
