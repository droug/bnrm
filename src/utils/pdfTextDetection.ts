/**
 * Utility to detect if a PDF file contains embedded/searchable text
 * This helps determine if OCR has already been performed
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export interface PdfTextDetectionResult {
  hasEmbeddedText: boolean;
  totalTextLength: number;
  pagesWithText: number;
  totalPages: number;
  sampleText: string;
  confidence: 'high' | 'medium' | 'low' | 'none';
}

/**
 * Detects if a PDF file contains embedded/searchable text (already OCR'd or born-digital)
 * @param file - The PDF file to analyze
 * @param maxPagesToCheck - Maximum number of pages to check (default: 5)
 * @returns Detection result with text presence info
 */
export async function detectPdfEmbeddedText(
  file: File,
  maxPagesToCheck: number = 5
): Promise<PdfTextDetectionResult> {
  const result: PdfTextDetectionResult = {
    hasEmbeddedText: false,
    totalTextLength: 0,
    pagesWithText: 0,
    totalPages: 0,
    sampleText: '',
    confidence: 'none',
  };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    result.totalPages = pdf.numPages;
    const pagesToCheck = Math.min(maxPagesToCheck, pdf.numPages);
    
    let allText = '';
    
    for (let pageNum = 1; pageNum <= pagesToCheck; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ')
        .trim();
      
      if (pageText.length > 10) {
        result.pagesWithText++;
        allText += pageText + '\n';
      }
    }
    
    result.totalTextLength = allText.length;
    result.sampleText = allText.substring(0, 500);
    
    // Determine if PDF has embedded text
    // A page typically has at least 100 characters of meaningful text
    const avgTextPerPage = result.totalTextLength / pagesToCheck;
    
    if (avgTextPerPage > 200) {
      result.hasEmbeddedText = true;
      result.confidence = 'high';
    } else if (avgTextPerPage > 50) {
      result.hasEmbeddedText = true;
      result.confidence = 'medium';
    } else if (avgTextPerPage > 10) {
      result.hasEmbeddedText = true;
      result.confidence = 'low';
    } else {
      result.hasEmbeddedText = false;
      result.confidence = 'none';
    }
    
    console.log('[PDF Text Detection] Result:', {
      hasEmbeddedText: result.hasEmbeddedText,
      totalTextLength: result.totalTextLength,
      pagesWithText: result.pagesWithText,
      totalPages: result.totalPages,
      confidence: result.confidence,
    });
    
    return result;
  } catch (error) {
    console.error('[PDF Text Detection] Error:', error);
    // Return default (no text detected) on error
    return result;
  }
}

/**
 * Quick check to determine if OCR should be skipped for this PDF
 */
export async function shouldSkipOcr(file: File): Promise<boolean> {
  const detection = await detectPdfEmbeddedText(file, 3);
  return detection.hasEmbeddedText && detection.confidence !== 'low';
}
