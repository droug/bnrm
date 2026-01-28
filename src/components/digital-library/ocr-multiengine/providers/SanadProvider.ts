/**
 * Sanad.ai OCR Provider (Cloud API)
 * Service cloud pour OCR arabe haute précision
 * 
 * NOTE: Ce provider est un placeholder. L'intégration complète nécessite:
 * 1. La documentation API officielle de Sanad.ai
 * 2. Une clé API valide
 * 3. Les endpoints exacts pour l'upload et le traitement
 */

import { supabase } from "@/integrations/supabase/client";
import { OcrProvider, OcrLine } from '../types';

export interface SanadResult {
  text: string;
  confidence: number;
  lines: OcrLine[];
  processingTimeMs: number;
  requestId?: string;
  modelVersion?: string;
}

export interface SanadOptions {
  outputFormat?: 'text' | 'json' | 'alto';
  confidenceThreshold?: number;
  detectLayout?: boolean;
  enhanceImage?: boolean;
  language?: 'ar' | 'ar-ma' | 'fr';
}

export interface SanadApiConfig {
  baseUrl: string;
  apiKey: string;
}

class SanadProviderClass {
  private config: SanadApiConfig | null = null;
  private isConfigured = false;

  /**
   * Configurer le provider avec les credentials
   */
  configure(config: SanadApiConfig): void {
    this.config = config;
    this.isConfigured = true;
    console.log('[Sanad] Provider configuré avec URL:', config.baseUrl);
  }

  /**
   * Vérifier si le provider est configuré et disponible
   */
  isAvailable(): boolean {
    return this.isConfigured && !!this.config?.apiKey;
  }

  /**
   * Charger la configuration depuis Supabase
   */
  async loadConfigFromDatabase(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('ocr_provider_configs')
        .select('*')
        .eq('provider', 'sanad')
        .single();

      if (error || !data?.is_enabled) {
        console.log('[Sanad] Provider non activé dans la configuration');
        return false;
      }

      // La clé API devrait être stockée dans les secrets Supabase
      // et accessible via une Edge Function
      if (data.base_url) {
        this.config = {
          baseUrl: data.base_url,
          apiKey: '' // À récupérer via Edge Function
        };
      }

      return !!this.config;
    } catch (error) {
      console.error('[Sanad] Erreur de chargement config:', error);
      return false;
    }
  }

  /**
   * Reconnaître le texte via l'API Sanad.ai
   * 
   * NOTE: Cette implémentation est un placeholder.
   * L'intégration réelle dépend de la documentation API Sanad.ai
   */
  async recognize(
    imageSource: File | Blob,
    options: SanadOptions = {}
  ): Promise<SanadResult> {
    if (!this.isAvailable()) {
      throw new Error('Sanad.ai n\'est pas configuré. Veuillez configurer la clé API.');
    }

    const startTime = performance.now();

    try {
      // Appel à une Edge Function qui gère l'appel à Sanad.ai
      // Cela permet de garder la clé API sécurisée côté serveur
      const { data, error } = await supabase.functions.invoke('sanad-ocr', {
        body: {
          image: await this.blobToBase64(imageSource),
          options: {
            outputFormat: options.outputFormat || 'json',
            confidenceThreshold: options.confidenceThreshold || 0.8,
            detectLayout: options.detectLayout ?? true,
            enhanceImage: options.enhanceImage ?? true,
            language: options.language || 'ar'
          }
        }
      });

      if (error) {
        throw new Error(`Erreur Sanad API: ${error.message}`);
      }

      const processingTimeMs = Math.round(performance.now() - startTime);

      // Transformer la réponse au format standard
      return this.transformResponse(data, processingTimeMs);
    } catch (error: any) {
      console.error('[Sanad] Erreur de reconnaissance:', error);
      throw new Error(`Échec OCR Sanad: ${error.message}`);
    }
  }

  /**
   * Convertir un Blob en base64
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Retirer le préfixe data:...;base64,
        const base64Data = base64.split(',')[1] || base64;
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Transformer la réponse API au format standard
   */
  private transformResponse(apiResponse: any, processingTimeMs: number): SanadResult {
    // Structure attendue de la réponse Sanad.ai (à adapter selon doc réelle)
    const lines: OcrLine[] = (apiResponse.lines || []).map((line: any, index: number) => ({
      id: `sanad_line_${index}`,
      text: line.text || '',
      confidence: line.confidence || 0,
      bbox: {
        x: line.bbox?.x || 0,
        y: line.bbox?.y || 0,
        width: line.bbox?.width || 0,
        height: line.bbox?.height || 0
      }
    }));

    return {
      text: apiResponse.text || lines.map(l => l.text).join('\n'),
      confidence: apiResponse.confidence || 0,
      lines,
      processingTimeMs,
      requestId: apiResponse.requestId,
      modelVersion: apiResponse.modelVersion
    };
  }

  /**
   * Vérifier le statut d'un traitement asynchrone
   * (Si Sanad utilise un modèle async)
   */
  async checkStatus(requestId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: SanadResult;
    error?: string;
  }> {
    const { data, error } = await supabase.functions.invoke('sanad-ocr-status', {
      body: { requestId }
    });

    if (error) {
      return { status: 'failed', error: error.message };
    }

    return data;
  }

  /**
   * Obtenir le nom du provider
   */
  getProviderName(): OcrProvider {
    return 'sanad';
  }

  /**
   * Obtenir les options par défaut
   */
  getDefaultOptions(): SanadOptions {
    return {
      outputFormat: 'json',
      confidenceThreshold: 0.8,
      detectLayout: true,
      enhanceImage: true,
      language: 'ar'
    };
  }

  /**
   * Documentation pour l'intégration
   */
  getIntegrationGuide(): string {
    return `
# Intégration Sanad.ai OCR

## Prérequis
1. Créer un compte sur Sanad.ai
2. Obtenir une clé API
3. Configurer l'URL de base et la clé dans les secrets Supabase

## Configuration des secrets
Dans Supabase Dashboard > Settings > Edge Functions :
- SANAD_API_KEY: Votre clé API Sanad.ai
- SANAD_BASE_URL: https://api.sanad.ai (ou URL fournie)

## Edge Function (sanad-ocr)
L'Edge Function doit:
1. Recevoir l'image en base64
2. Appeler l'API Sanad.ai avec les credentials
3. Retourner le résultat formaté

## Endpoints attendus (à confirmer avec doc Sanad)
- POST /v1/ocr/recognize - Reconnaissance directe
- GET /v1/ocr/status/{requestId} - Statut async
- GET /v1/models - Liste des modèles disponibles
    `.trim();
  }
}

export const SanadProvider = new SanadProviderClass();
export default SanadProvider;
