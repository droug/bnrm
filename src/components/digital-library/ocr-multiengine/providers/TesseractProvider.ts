/**
 * Tesseract OCR Provider
 * Moteur local pour texte imprimé arabe
 */

import { createWorker, Worker, RecognizeResult } from 'tesseract.js';
import { OcrProvider, OcrLine } from '../types';

export interface TesseractResult {
  text: string;
  confidence: number;
  lines: OcrLine[];
  processingTimeMs: number;
  words: { text: string; confidence: number; bbox: any }[];
}

export interface TesseractOptions {
  languages: string[];
}

class TesseractProviderClass {
  private worker: Worker | null = null;
  private isInitialized = false;
  private currentLanguages: string[] = [];

  async initialize(languages: string[] = ['ara']): Promise<void> {
    if (this.isInitialized && this.languagesMatch(languages)) {
      return;
    }

    if (this.worker) {
      await this.terminate();
    }

    console.log('[Tesseract] Initialisation avec langues:', languages);
    
    this.worker = await createWorker(languages.join('+'), 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`[Tesseract] Progression: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    this.currentLanguages = languages;
    this.isInitialized = true;
  }

  private languagesMatch(languages: string[]): boolean {
    if (languages.length !== this.currentLanguages.length) return false;
    return languages.every((lang, i) => lang === this.currentLanguages[i]);
  }

  async recognize(
    imageSource: string | File | Blob,
    options: TesseractOptions = { languages: ['ara'] }
  ): Promise<TesseractResult> {
    const startTime = performance.now();
    await this.initialize(options.languages);

    if (!this.worker) {
      throw new Error('Tesseract worker non initialisé');
    }

    const result: RecognizeResult = await this.worker.recognize(imageSource);
    const processingTimeMs = Math.round(performance.now() - startTime);

    const lines: OcrLine[] = [];
    const words: { text: string; confidence: number; bbox: any }[] = [];
    const blocks = result.data.blocks || [];
    let lineIndex = 0;
    
    for (const block of blocks) {
      for (const paragraph of (block.paragraphs || [])) {
        for (const line of (paragraph.lines || [])) {
          lines.push({
            id: `line_${lineIndex++}`,
            text: line.text,
            confidence: line.confidence,
            bbox: {
              x: line.bbox.x0,
              y: line.bbox.y0,
              width: line.bbox.x1 - line.bbox.x0,
              height: line.bbox.y1 - line.bbox.y0
            }
          });
          for (const word of (line.words || [])) {
            words.push({
              text: word.text,
              confidence: word.confidence,
              bbox: { x: word.bbox.x0, y: word.bbox.y0, width: word.bbox.x1 - word.bbox.x0, height: word.bbox.y1 - word.bbox.y0 }
            });
          }
        }
      }
    }

    return { text: result.data.text, confidence: result.data.confidence, lines, words, processingTimeMs };
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
      this.currentLanguages = [];
    }
  }

  getSupportedLanguages(): { code: string; name: string }[] {
    return [
      { code: 'ara', name: 'Arabe' },
      { code: 'fra', name: 'Français' },
      { code: 'eng', name: 'Anglais' },
      { code: 'ber', name: 'Amazighe' },
      { code: 'lat', name: 'Latin' }
    ];
  }

  getProviderName(): OcrProvider {
    return 'tesseract';
  }

  isAvailable(): boolean {
    return true;
  }
}

export const TesseractProvider = new TesseractProviderClass();
export default TesseractProvider;
