/**
 * eScriptorium/Kraken HTR Provider
 * Moteur local pour reconnaissance de manuscrits (HTR)
 * 
 * eScriptorium est une interface web pour Kraken OCR/HTR
 * Recommandé pour : manuscrits arabes, documents historiques
 */

import { supabase } from "@/integrations/supabase/client";
import { OcrProvider, OcrLine, OcrRegion } from '../types';

export interface EScriptoriumResult {
  text: string;
  confidence: number;
  lines: OcrLine[];
  regions: OcrRegion[];
  processingTimeMs: number;
  projectId?: string;
  documentId?: string;
  pageXml?: string;
  altoXml?: string;
}

export interface EScriptoriumOptions {
  modelName?: string;
  autoSegmentation?: boolean;
  segmentationModel?: string;
  bidiReorder?: boolean;
  lineHeight?: 'variable' | 'fixed';
  regionTypes?: ('text' | 'marginalia' | 'decoration')[];
}

export interface EScriptoriumConfig {
  baseUrl: string;
  apiToken?: string;
  projectId?: string;
}

class EScriptoriumProviderClass {
  private config: EScriptoriumConfig | null = null;
  private isConfigured = false;

  /**
   * Configurer le provider
   */
  configure(config: EScriptoriumConfig): void {
    this.config = config;
    this.isConfigured = true;
    console.log('[eScriptorium] Provider configuré avec URL:', config.baseUrl);
  }

  /**
   * Vérifier si le provider est disponible
   */
  isAvailable(): boolean {
    return this.isConfigured && !!this.config?.baseUrl;
  }

  /**
   * Charger la configuration depuis la base de données
   */
  async loadConfigFromDatabase(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('ocr_provider_configs')
        .select('*')
        .eq('provider', 'escriptorium')
        .single();

      if (error || !data?.is_enabled) {
        console.log('[eScriptorium] Provider non activé');
        return false;
      }

      if (data.base_url) {
        this.configure({
          baseUrl: data.base_url,
          apiToken: undefined, // À récupérer via Edge Function
          projectId: (data.default_options as any)?.projectId
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('[eScriptorium] Erreur de chargement config:', error);
      return false;
    }
  }

  /**
   * Créer un projet eScriptorium
   */
  async createProject(name: string, description?: string): Promise<{ projectId: string }> {
    if (!this.isAvailable()) {
      throw new Error('eScriptorium n\'est pas configuré');
    }

    const { data, error } = await supabase.functions.invoke('escriptorium-api', {
      body: {
        action: 'create_project',
        params: { name, description }
      }
    });

    if (error) throw new Error(`Erreur création projet: ${error.message}`);
    return { projectId: data.id };
  }

  /**
   * Importer une image dans un projet
   */
  async importImage(
    projectId: string,
    image: File | Blob,
    imageName: string
  ): Promise<{ documentId: string; pageId: string }> {
    if (!this.isAvailable()) {
      throw new Error('eScriptorium n\'est pas configuré');
    }

    const base64 = await this.blobToBase64(image);

    const { data, error } = await supabase.functions.invoke('escriptorium-api', {
      body: {
        action: 'import_image',
        params: {
          projectId,
          image: base64,
          imageName
        }
      }
    });

    if (error) throw new Error(`Erreur import image: ${error.message}`);
    return { documentId: data.documentId, pageId: data.pageId };
  }

  /**
   * Lancer la segmentation automatique
   */
  async runSegmentation(
    documentId: string,
    options: { model?: string; regions?: boolean } = {}
  ): Promise<{ taskId: string }> {
    const { data, error } = await supabase.functions.invoke('escriptorium-api', {
      body: {
        action: 'segment',
        params: {
          documentId,
          model: options.model || 'default',
          detectRegions: options.regions ?? true
        }
      }
    });

    if (error) throw new Error(`Erreur segmentation: ${error.message}`);
    return { taskId: data.taskId };
  }

  /**
   * Lancer la reconnaissance HTR avec Kraken
   */
  async runRecognition(
    documentId: string,
    modelName: string,
    options: EScriptoriumOptions = {}
  ): Promise<{ taskId: string }> {
    const { data, error } = await supabase.functions.invoke('escriptorium-api', {
      body: {
        action: 'transcribe',
        params: {
          documentId,
          model: modelName,
          bidiReorder: options.bidiReorder ?? true
        }
      }
    });

    if (error) throw new Error(`Erreur transcription: ${error.message}`);
    return { taskId: data.taskId };
  }

  /**
   * Vérifier le statut d'une tâche
   */
  async checkTaskStatus(taskId: string): Promise<{
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress?: number;
    error?: string;
  }> {
    const { data, error } = await supabase.functions.invoke('escriptorium-api', {
      body: {
        action: 'task_status',
        params: { taskId }
      }
    });

    if (error) return { status: 'failed', error: error.message };
    return data;
  }

  /**
   * Récupérer les résultats de transcription
   */
  async getTranscriptionResult(documentId: string): Promise<EScriptoriumResult> {
    const startTime = performance.now();

    const { data, error } = await supabase.functions.invoke('escriptorium-api', {
      body: {
        action: 'get_transcription',
        params: { documentId }
      }
    });

    if (error) throw new Error(`Erreur récupération résultat: ${error.message}`);

    const processingTimeMs = Math.round(performance.now() - startTime);
    return this.transformResponse(data, processingTimeMs);
  }

  /**
   * Exporter en format PAGE XML
   */
  async exportPageXml(documentId: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('escriptorium-api', {
      body: {
        action: 'export',
        params: { documentId, format: 'pagexml' }
      }
    });

    if (error) throw new Error(`Erreur export PAGE XML: ${error.message}`);
    return data.xml;
  }

  /**
   * Exporter en format ALTO
   */
  async exportAlto(documentId: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('escriptorium-api', {
      body: {
        action: 'export',
        params: { documentId, format: 'alto' }
      }
    });

    if (error) throw new Error(`Erreur export ALTO: ${error.message}`);
    return data.xml;
  }

  /**
   * Lancer l'entraînement d'un modèle personnalisé
   */
  async trainModel(params: {
    modelName: string;
    baseModel?: string;
    trainingData: { image: string; transcription: string }[];
    epochs?: number;
  }): Promise<{ taskId: string; modelId: string }> {
    const { data, error } = await supabase.functions.invoke('escriptorium-api', {
      body: {
        action: 'train_model',
        params: {
          name: params.modelName,
          baseModel: params.baseModel || 'arabic_best',
          trainingData: params.trainingData,
          epochs: params.epochs || 50
        }
      }
    });

    if (error) throw new Error(`Erreur entraînement: ${error.message}`);
    return { taskId: data.taskId, modelId: data.modelId };
  }

  /**
   * Lister les modèles disponibles
   */
  async listModels(): Promise<{
    id: string;
    name: string;
    type: 'segmentation' | 'recognition';
    accuracy?: number;
    isCustom: boolean;
  }[]> {
    const { data, error } = await supabase.functions.invoke('escriptorium-api', {
      body: { action: 'list_models' }
    });

    if (error) throw new Error(`Erreur liste modèles: ${error.message}`);
    return data.models || [];
  }

  /**
   * Transformer la réponse au format standard
   */
  private transformResponse(apiResponse: any, processingTimeMs: number): EScriptoriumResult {
    const lines: OcrLine[] = (apiResponse.lines || []).map((line: any, index: number) => ({
      id: line.id || `line_${index}`,
      text: line.text || '',
      confidence: line.confidence || 0,
      bbox: line.bbox || { x: 0, y: 0, width: 0, height: 0 },
      baseline: line.baseline
    }));

    const regions: OcrRegion[] = (apiResponse.regions || []).map((region: any) => ({
      id: region.id,
      type: region.type || 'text',
      coords: region.coords || { x: 0, y: 0, width: 0, height: 0 },
      lines: (region.lines || []).map((line: any, i: number) => ({
        id: line.id || `${region.id}_line_${i}`,
        text: line.text || '',
        confidence: line.confidence || 0,
        bbox: line.bbox || { x: 0, y: 0, width: 0, height: 0 }
      }))
    }));

    return {
      text: apiResponse.text || lines.map(l => l.text).join('\n'),
      confidence: apiResponse.confidence || 0,
      lines,
      regions,
      processingTimeMs,
      projectId: apiResponse.projectId,
      documentId: apiResponse.documentId,
      pageXml: apiResponse.pageXml,
      altoXml: apiResponse.altoXml
    };
  }

  /**
   * Convertir Blob en base64
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1] || base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Obtenir le nom du provider
   */
  getProviderName(): OcrProvider {
    return 'escriptorium';
  }

  /**
   * Guide d'installation eScriptorium
   */
  getInstallationGuide(): string {
    return `
# Installation eScriptorium (on-premises)

## Option 1: Docker (Recommandé)
\`\`\`bash
git clone https://gitlab.com/scripta/escriptorium.git
cd escriptorium
docker-compose up -d
\`\`\`

## Option 2: Installation manuelle
Suivre la documentation officielle:
https://escriptorium.readthedocs.io/en/latest/install.html

## Configuration
1. Démarrer eScriptorium sur votre serveur
2. Créer un compte utilisateur
3. Générer un token API
4. Configurer l'URL et le token dans les secrets Supabase:
   - ESCRIPTORIUM_BASE_URL: http://votre-serveur:8080
   - ESCRIPTORIUM_API_TOKEN: votre_token

## Modèles HTR recommandés pour l'arabe
- arabic_best: Modèle général arabe
- maghribi: Écriture maghrébine
- naskh: Écriture naskh standard
    `.trim();
  }
}

export const EScriptoriumProvider = new EScriptoriumProviderClass();
export default EScriptoriumProvider;
