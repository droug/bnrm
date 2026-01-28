/**
 * Utilitaires pour détecter si un texte a été OCRisé ou est du texte natif
 * et pour vérifier la qualité de l'OCR
 */

export interface OcrQualityResult {
  isLikelyOcr: boolean;
  confidence: number; // 0-100
  issues: string[];
  stats: {
    totalChars: number;
    suspiciousPatterns: number;
    wordCount: number;
    avgWordLength: number;
    specialCharsRatio: number;
    numericRatio: number;
    uppercaseRatio: number;
    repeatedCharsRatio: number;
  };
}

/**
 * Détecte si un texte semble avoir été généré par OCR plutôt qu'être du texte natif.
 * Analyse les patterns typiques des erreurs OCR.
 */
export function detectOcrText(text: string): OcrQualityResult {
  if (!text || text.trim().length === 0) {
    return {
      isLikelyOcr: false,
      confidence: 0,
      issues: ['Texte vide'],
      stats: {
        totalChars: 0,
        suspiciousPatterns: 0,
        wordCount: 0,
        avgWordLength: 0,
        specialCharsRatio: 0,
        numericRatio: 0,
        uppercaseRatio: 0,
        repeatedCharsRatio: 0,
      },
    };
  }

  const issues: string[] = [];
  let suspiciousScore = 0;

  const totalChars = text.length;
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const avgWordLength = wordCount > 0 ? words.reduce((sum, w) => sum + w.length, 0) / wordCount : 0;

  // 1. Caractères spéciaux inhabituels (typiques des erreurs OCR)
  const specialChars = text.match(/[^\w\s\u0600-\u06FF\u0750-\u077F.,;:!?'"()-]/g) || [];
  const specialCharsRatio = specialChars.length / totalChars;
  if (specialCharsRatio > 0.05) {
    issues.push(`Ratio élevé de caractères spéciaux: ${(specialCharsRatio * 100).toFixed(1)}%`);
    suspiciousScore += 15;
  }

  // 2. Séquences de caractères répétés (erreur OCR typique)
  const repeatedChars = text.match(/(.)\1{3,}/g) || [];
  const repeatedCharsRatio = repeatedChars.length / Math.max(1, wordCount);
  if (repeatedCharsRatio > 0.02) {
    issues.push('Séquences de caractères répétés détectées');
    suspiciousScore += 20;
  }

  // 3. Mots trop longs (fusion de mots par OCR)
  const longWords = words.filter(w => w.length > 25);
  if (longWords.length > wordCount * 0.01) {
    issues.push(`Mots anormalement longs détectés: ${longWords.length}`);
    suspiciousScore += 15;
  }

  // 4. Ratio de chiffres inhabituels (OCR confond parfois lettres/chiffres)
  const numericChars = text.match(/\d/g) || [];
  const numericRatio = numericChars.length / totalChars;
  // Un texte normal a généralement moins de 10% de chiffres
  if (numericRatio > 0.15 && numericRatio < 0.8) {
    issues.push(`Ratio de chiffres suspect: ${(numericRatio * 100).toFixed(1)}%`);
    suspiciousScore += 10;
  }

  // 5. Ratio de majuscules (OCR peut avoir des problèmes de casse)
  const uppercaseChars = text.match(/[A-Z\u0621-\u064A]/g) || [];
  const lowercaseChars = text.match(/[a-z]/g) || [];
  const uppercaseRatio = lowercaseChars.length > 0 
    ? uppercaseChars.length / (uppercaseChars.length + lowercaseChars.length) 
    : 0;
  if (uppercaseRatio > 0.4 && uppercaseRatio < 0.95) {
    issues.push(`Ratio de majuscules inhabituel: ${(uppercaseRatio * 100).toFixed(1)}%`);
    suspiciousScore += 10;
  }

  // 6. Patterns OCR typiques
  const ocrPatterns = [
    /[l1|I][l1|I]{2,}/g, // Confusion l/1/I
    /[0O][0O]{2,}/g, // Confusion 0/O
    /[rn]m|m[rn]/g, // Confusion rn/m
    /\b[A-Z]{1,2}\d+[A-Z]{1,2}\b/g, // Codes mixtes
    /[.,;:]{3,}/g, // Ponctuation répétée
    /\s{3,}/g, // Espaces multiples
  ];

  let patternMatches = 0;
  for (const pattern of ocrPatterns) {
    const matches = text.match(pattern) || [];
    patternMatches += matches.length;
  }

  if (patternMatches > 5) {
    issues.push(`Patterns OCR détectés: ${patternMatches}`);
    suspiciousScore += Math.min(25, patternMatches * 2);
  }

  // 7. Lignes très courtes (fragmentation OCR)
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const shortLines = lines.filter(l => l.length < 10 && l.trim().length > 0);
  if (lines.length > 5 && shortLines.length / lines.length > 0.3) {
    issues.push('Nombreuses lignes fragmentées');
    suspiciousScore += 15;
  }

  // 8. Mots d'une seule lettre excessifs (fragmentation)
  const singleLetterWords = words.filter(w => w.length === 1 && !/^[aAàÀ1-9يو]$/.test(w));
  if (singleLetterWords.length / wordCount > 0.1) {
    issues.push('Excès de mots d\'une seule lettre');
    suspiciousScore += 15;
  }

  // Calculer le score final
  const confidence = Math.min(100, Math.max(0, suspiciousScore));
  const isLikelyOcr = confidence >= 30;

  return {
    isLikelyOcr,
    confidence,
    issues,
    stats: {
      totalChars,
      suspiciousPatterns: patternMatches,
      wordCount,
      avgWordLength,
      specialCharsRatio,
      numericRatio,
      uppercaseRatio,
      repeatedCharsRatio,
    },
  };
}

/**
 * Vérifie si un document a déjà des pages OCRisées dans la base de données
 */
export async function checkDocumentOcrStatus(
  supabase: any,
  documentId: string
): Promise<{
  hasOcrPages: boolean;
  ocrPagesCount: number;
  totalPages: number;
  coverage: number;
}> {
  // Récupérer les infos du document
  const { data: doc } = await supabase
    .from('digital_library_documents')
    .select('pages_count, ocr_processed')
    .eq('id', documentId)
    .maybeSingle();

  const totalPages = doc?.pages_count || 0;

  // Compter les pages avec OCR
  const { count } = await supabase
    .from('digital_library_pages')
    .select('id', { count: 'exact', head: true })
    .eq('document_id', documentId)
    .not('ocr_text', 'is', null)
    .neq('ocr_text', '');

  const ocrPagesCount = count || 0;
  const coverage = totalPages > 0 ? (ocrPagesCount / totalPages) * 100 : 0;

  return {
    hasOcrPages: ocrPagesCount > 0,
    ocrPagesCount,
    totalPages,
    coverage,
  };
}

/**
 * Analyse la qualité du texte OCR existant pour un document
 */
export async function analyzeDocumentOcrQuality(
  supabase: any,
  documentId: string
): Promise<{
  overallQuality: 'good' | 'medium' | 'poor' | 'none';
  averageConfidence: number;
  pageResults: Array<{ pageNumber: number; quality: OcrQualityResult }>;
}> {
  const { data: pages } = await supabase
    .from('digital_library_pages')
    .select('page_number, ocr_text')
    .eq('document_id', documentId)
    .order('page_number', { ascending: true })
    .limit(10); // Analyser les 10 premières pages seulement

  if (!pages || pages.length === 0) {
    return {
      overallQuality: 'none',
      averageConfidence: 0,
      pageResults: [],
    };
  }

  const pageResults = pages.map((page: any) => ({
    pageNumber: page.page_number,
    quality: detectOcrText(page.ocr_text || ''),
  }));

  const ocrConfidences = pageResults
    .filter(p => p.quality.isLikelyOcr)
    .map(p => p.quality.confidence);

  const averageConfidence = ocrConfidences.length > 0
    ? ocrConfidences.reduce((a, b) => a + b, 0) / ocrConfidences.length
    : 0;

  let overallQuality: 'good' | 'medium' | 'poor' | 'none';
  if (averageConfidence < 20) {
    overallQuality = 'good';
  } else if (averageConfidence < 50) {
    overallQuality = 'medium';
  } else {
    overallQuality = 'poor';
  }

  return {
    overallQuality,
    averageConfidence,
    pageResults,
  };
}

/**
 * Retourne un message explicatif pour l'utilisateur sur le statut OCR
 */
export function getOcrStatusMessage(
  ocrProcessed: boolean,
  ocrPagesCount: number,
  totalPages: number
): { status: string; description: string; canSkip: boolean } {
  if (!ocrProcessed || ocrPagesCount === 0) {
    return {
      status: 'Non traité',
      description: 'Ce document n\'a pas encore été OCRisé.',
      canSkip: false,
    };
  }

  const coverage = totalPages > 0 ? (ocrPagesCount / totalPages) * 100 : 0;

  if (coverage >= 100) {
    return {
      status: 'Complet',
      description: `Toutes les ${totalPages} pages ont été OCRisées.`,
      canSkip: true,
    };
  }

  if (coverage >= 80) {
    return {
      status: 'Quasi-complet',
      description: `${ocrPagesCount}/${totalPages} pages OCRisées (${coverage.toFixed(0)}%).`,
      canSkip: true,
    };
  }

  return {
    status: 'Partiel',
    description: `Seulement ${ocrPagesCount}/${totalPages} pages OCRisées (${coverage.toFixed(0)}%).`,
    canSkip: false,
  };
}
