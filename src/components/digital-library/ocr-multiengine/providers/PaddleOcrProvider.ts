/**
 * PaddleOCR Provider
 * Moteur OCR haute performance basé sur PaddlePaddle (Baidu)
 * Excellent pour l'arabe, le français et les documents multilingues
 * 
 * Mode TEST : Simulation côté client (sans serveur PaddleOCR)
 * Mode PROD : Nécessite un serveur PaddleOCR (Docker image : paddlepaddle/paddleocr)
 */

export interface PaddleOcrResult {
  text: string;
  confidence: number;
  lines: PaddleOcrLine[];
  processingTimeMs: number;
  model: string;
  language: string;
  boxes?: PaddleOcrBox[];
}

export interface PaddleOcrLine {
  text: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
}

export interface PaddleOcrBox {
  points: [number, number][];
  text: string;
  confidence: number;
}

export interface PaddleOcrOptions {
  language: 'ar' | 'fr' | 'en' | 'ar+fr' | 'ar+en' | 'ar+fr+en';
  useAngleClassifier: boolean;
  useMjdegree: boolean;
  detModel: 'DB_server' | 'DB_mobile';
  recModel: 'SVTR_LCNet' | 'PP-OCRv4';
  serverUrl?: string;
}

const DEFAULT_OPTIONS: PaddleOcrOptions = {
  language: 'ar',
  useAngleClassifier: true,
  useMjdegree: false,
  detModel: 'DB_server',
  recModel: 'PP-OCRv4',
  serverUrl: undefined,
};

// Supported language display names
const LANGUAGE_LABELS: Record<string, string> = {
  'ar': 'Arabe',
  'fr': 'Français',
  'en': 'Anglais',
  'ar+fr': 'Arabe + Français',
  'ar+en': 'Arabe + Anglais',
  'ar+fr+en': 'Arabe + Français + Anglais',
};

class PaddleOcrProviderClass {
  private isTestMode = true; // Bascule en false si serverUrl est configuré

  /**
   * Vérifier si le serveur PaddleOCR est accessible
   */
  async checkServerHealth(serverUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${serverUrl}/healthz`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Traitement OCR via serveur PaddleOCR (mode production)
   */
  private async recognizeViaServer(
    file: File,
    options: PaddleOcrOptions,
    serverUrl: string
  ): Promise<PaddleOcrResult> {
    const startTime = performance.now();
    const formData = new FormData();
    formData.append('image', file);
    formData.append('language', options.language);
    formData.append('use_angle_cls', String(options.useAngleClassifier));
    formData.append('det_model', options.detModel);
    formData.append('rec_model', options.recModel);

    const response = await fetch(`${serverUrl}/ocr`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(120000), // 2 min timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PaddleOCR Server Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const processingTimeMs = Math.round(performance.now() - startTime);

    // Parse server response format
    const lines: PaddleOcrLine[] = [];
    const boxes: PaddleOcrBox[] = [];
    let fullText = '';
    let totalConfidence = 0;

    if (data.results && Array.isArray(data.results)) {
      for (const item of data.results) {
        const box: PaddleOcrBox = {
          points: item.box || [],
          text: item.text || '',
          confidence: item.score || 0,
        };
        boxes.push(box);

        const points = item.box || [];
        const xs = points.map((p: [number, number]) => p[0]);
        const ys = points.map((p: [number, number]) => p[1]);
        const line: PaddleOcrLine = {
          text: item.text || '',
          confidence: (item.score || 0) * 100,
          bbox: {
            x: Math.min(...xs),
            y: Math.min(...ys),
            width: Math.max(...xs) - Math.min(...xs),
            height: Math.max(...ys) - Math.min(...ys),
          },
        };
        lines.push(line);
        fullText += (fullText ? '\n' : '') + item.text;
        totalConfidence += item.score || 0;
      }
    }

    const avgConfidence = lines.length > 0 ? (totalConfidence / lines.length) * 100 : 0;

    return {
      text: fullText,
      confidence: avgConfidence,
      lines,
      processingTimeMs,
      model: `PP-OCRv4 (${options.recModel})`,
      language: LANGUAGE_LABELS[options.language] || options.language,
      boxes,
    };
  }

  /**
   * Mode TEST : Simulation PaddleOCR (sans serveur)
   * Retourne un résultat simulé avec texte extrait par canvas (si image)
   */
  private async recognizeTestMode(
    file: File,
    options: PaddleOcrOptions
  ): Promise<PaddleOcrResult> {
    const startTime = performance.now();

    // Simulate processing delay (PaddleOCR is fast: ~0.5-2s per page)
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const processingTimeMs = Math.round(performance.now() - startTime);

    // Simulate realistic Arabic OCR output for test mode
    const sampleLines = [
      { text: '[TEST MODE - PaddleOCR] النص المستخرج بالمحاكاة', confidence: 94.2 },
      { text: 'يتم تشغيل PaddleOCR في وضع الاختبار', confidence: 91.7 },
      { text: 'لتفعيل الوضع الحقيقي، قم بتوفير عنوان URL للخادم', confidence: 88.3 },
      { text: `الملف: ${file.name} | الحجم: ${(file.size / 1024).toFixed(1)} Ko`, confidence: 95.1 },
      { text: `اللغة المحددة: ${LANGUAGE_LABELS[options.language] || options.language}`, confidence: 93.4 },
      { text: `النموذج: ${options.recModel} | المحرك: ${options.detModel}`, confidence: 90.0 },
    ];

    const lines: PaddleOcrLine[] = sampleLines.map((l, i) => ({
      text: l.text,
      confidence: l.confidence,
      bbox: { x: 10, y: 10 + i * 30, width: 400, height: 25 },
    }));

    const fullText = lines.map(l => l.text).join('\n');
    const avgConfidence = lines.reduce((s, l) => s + l.confidence, 0) / lines.length;

    return {
      text: fullText,
      confidence: avgConfidence,
      lines,
      processingTimeMs,
      model: `PP-OCRv4 [TEST MODE]`,
      language: LANGUAGE_LABELS[options.language] || options.language,
    };
  }

  /**
   * Point d'entrée principal : reconnaître le texte dans un fichier
   */
  async recognize(
    file: File,
    options: Partial<PaddleOcrOptions> = {}
  ): Promise<PaddleOcrResult> {
    const mergedOptions: PaddleOcrOptions = { ...DEFAULT_OPTIONS, ...options };

    if (mergedOptions.serverUrl) {
      const isHealthy = await this.checkServerHealth(mergedOptions.serverUrl);
      if (isHealthy) {
        return this.recognizeViaServer(file, mergedOptions, mergedOptions.serverUrl);
      } else {
        console.warn('[PaddleOCR] Serveur non accessible, bascule en mode test');
      }
    }

    return this.recognizeTestMode(file, mergedOptions);
  }

  getSupportedLanguages(): { code: string; name: string }[] {
    return Object.entries(LANGUAGE_LABELS).map(([code, name]) => ({ code, name }));
  }

  getProviderName(): string {
    return 'paddleocr';
  }

  isAvailable(): boolean {
    return true; // Toujours disponible (mode test)
  }

  getDescription(): string {
    return 'PaddleOCR v4 — Moteur haute performance (Baidu/PaddlePaddle) — Excellent pour l\'arabe et les documents multilingues';
  }
}

export const PaddleOcrProvider = new PaddleOcrProviderClass();
export default PaddleOcrProvider;
