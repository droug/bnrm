import { supabase } from '@/integrations/supabase/client';
import { AutocompleteListDefinition } from '@/data/autocompleteListsDefinitions';

/**
 * Moteur de synchronisation pour les listes auto-complètes
 * Similaire au système de synchronisation des system_lists
 */

export interface SyncResult {
  success: boolean;
  list_code: string;
  action: 'created' | 'updated' | 'skipped' | 'failed';
  message?: string;
}

export interface SyncReport {
  totalLists: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  results: SyncResult[];
  duration: number;
}

export interface SyncStatus {
  isRunning: boolean;
  progress: number;
  currentList?: string;
  message?: string;
}

type SyncListener = (status: SyncStatus) => void;

class AutocompleteListsSyncEngine {
  private static instance: AutocompleteListsSyncEngine;
  private lastSyncTime: Date | null = null;
  private syncInProgress = false;
  private listeners: SyncListener[] = [];

  private constructor() {}

  static getInstance(): AutocompleteListsSyncEngine {
    if (!AutocompleteListsSyncEngine.instance) {
      AutocompleteListsSyncEngine.instance = new AutocompleteListsSyncEngine();
    }
    return AutocompleteListsSyncEngine.instance;
  }

  addSyncListener(listener: SyncListener) {
    this.listeners.push(listener);
  }

  removeSyncListener(listener: SyncListener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners(status: SyncStatus) {
    this.listeners.forEach(listener => listener(status));
  }

  /**
   * Calcule un hash pour détecter les changements
   */
  private calculateListHash(listDef: AutocompleteListDefinition): string {
    const data = JSON.stringify({
      list_name: listDef.list_name,
      description: listDef.description,
      portal: listDef.portal,
      platform: listDef.platform,
      service: listDef.service,
      sub_service: listDef.sub_service,
      module: listDef.module,
      form_name: listDef.form_name,
      max_levels: listDef.max_levels,
      values_count: listDef.values.length,
      values_hash: listDef.values.map(v => `${v.value_code}:${v.value_label}`).join('|')
    });
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Vérifie si une liste nécessite une mise à jour
   */
  private async needsUpdate(listDef: AutocompleteListDefinition): Promise<boolean> {
    const { data } = await supabase
      .from('autocomplete_lists')
      .select('sync_hash')
      .eq('list_code', listDef.list_code)
      .maybeSingle();

    if (!data) return true; // Nouvelle liste
    
    const currentHash = this.calculateListHash(listDef);
    return data.sync_hash !== currentHash;
  }

  /**
   * Synchronise une seule liste
   */
  private async syncSingleList(listDef: AutocompleteListDefinition): Promise<SyncResult> {
    try {
      // Vérifier si la liste existe
      const { data: existingList } = await supabase
        .from('autocomplete_lists')
        .select('id, sync_hash')
        .eq('list_code', listDef.list_code)
        .maybeSingle();

      const currentHash = this.calculateListHash(listDef);
      let listId: string;
      let action: 'created' | 'updated' | 'skipped';

      if (!existingList) {
        // Créer la liste
        const { data: newList, error: createError } = await supabase
          .from('autocomplete_lists')
          .insert({
            list_code: listDef.list_code,
            list_name: listDef.list_name,
            description: listDef.description,
            portal: listDef.portal,
            platform: listDef.platform,
            service: listDef.service,
            sub_service: listDef.sub_service,
            module: listDef.module,
            form_name: listDef.form_name,
            max_levels: listDef.max_levels,
            is_active: true,
            sync_hash: currentHash
          })
          .select('id')
          .single();

        if (createError) throw createError;
        listId = newList.id;
        action = 'created';
      } else if (existingList.sync_hash !== currentHash) {
        // Mettre à jour la liste
        const { error: updateError } = await supabase
          .from('autocomplete_lists')
          .update({
            list_name: listDef.list_name,
            description: listDef.description,
            portal: listDef.portal,
            platform: listDef.platform,
            service: listDef.service,
            sub_service: listDef.sub_service,
            module: listDef.module,
            form_name: listDef.form_name,
            max_levels: listDef.max_levels,
            sync_hash: currentHash,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingList.id);

        if (updateError) throw updateError;
        listId = existingList.id;
        action = 'updated';
      } else {
        return {
          success: true,
          list_code: listDef.list_code,
          action: 'skipped',
          message: 'Aucun changement détecté'
        };
      }

      // Synchroniser les valeurs
      await this.syncListValues(listId, listDef);

      return {
        success: true,
        list_code: listDef.list_code,
        action,
        message: `${action === 'created' ? 'Créée' : 'Mise à jour'} avec ${listDef.values.length} valeurs`
      };
    } catch (error: any) {
      console.error(`Error syncing autocomplete list ${listDef.list_code}:`, error);
      return {
        success: false,
        list_code: listDef.list_code,
        action: 'failed',
        message: error.message
      };
    }
  }

  /**
   * Synchronise les valeurs d'une liste
   */
  private async syncListValues(listId: string, listDef: AutocompleteListDefinition): Promise<void> {
    // Récupérer les valeurs existantes
    const { data: existingValues } = await supabase
      .from('autocomplete_list_values')
      .select('*')
      .eq('list_id', listId);

    const existingCodes = new Set(existingValues?.map(v => v.value_code) || []);
    const newCodes = new Set(listDef.values.map(v => v.value_code));

    // Valeurs à supprimer
    const toDelete = existingValues?.filter(v => !newCodes.has(v.value_code)) || [];
    if (toDelete.length > 0) {
      await supabase
        .from('autocomplete_list_values')
        .delete()
        .in('id', toDelete.map(v => v.id));
    }

    // Valeurs à ajouter ou mettre à jour
    for (const valueDef of listDef.values) {
      if (existingCodes.has(valueDef.value_code)) {
        // Mettre à jour
        await supabase
          .from('autocomplete_list_values')
          .update({
            value_label: valueDef.value_label,
            value_label_ar: valueDef.value_label_ar,
            parent_value_code: valueDef.parent_value_code,
            level: valueDef.level,
            sort_order: valueDef.sort_order,
            metadata: valueDef.metadata,
            is_active: true
          })
          .eq('list_id', listId)
          .eq('value_code', valueDef.value_code);
      } else {
        // Créer
        await supabase
          .from('autocomplete_list_values')
          .insert({
            list_id: listId,
            value_code: valueDef.value_code,
            value_label: valueDef.value_label,
            value_label_ar: valueDef.value_label_ar,
            parent_value_code: valueDef.parent_value_code,
            level: valueDef.level,
            sort_order: valueDef.sort_order,
            metadata: valueDef.metadata,
            is_active: true
          });
      }
    }
  }

  /**
   * Synchronise toutes les listes auto-complètes
   */
  async autoSync(definitions: AutocompleteListDefinition[]): Promise<SyncReport> {
    if (this.syncInProgress) {
      throw new Error('Une synchronisation est déjà en cours');
    }

    const startTime = Date.now();
    this.syncInProgress = true;
    
    this.notifyListeners({
      isRunning: true,
      progress: 0,
      message: 'Démarrage de la synchronisation...'
    });

    const report: SyncReport = {
      totalLists: definitions.length,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      results: [],
      duration: 0
    };

    try {
      // Vérifier quelles listes ont besoin d'être synchronisées
      const listsToSync: AutocompleteListDefinition[] = [];
      for (const def of definitions) {
        if (await this.needsUpdate(def)) {
          listsToSync.push(def);
        } else {
          report.results.push({
            success: true,
            list_code: def.list_code,
            action: 'skipped',
            message: 'Aucun changement détecté'
          });
          report.skipped++;
        }
      }

      // Synchroniser les listes par batch
      const batchSize = 3;
      for (let i = 0; i < listsToSync.length; i += batchSize) {
        const batch = listsToSync.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(def => this.syncSingleList(def))
        );

        for (const result of batchResults) {
          report.results.push(result);
          if (result.success) {
            if (result.action === 'created') report.created++;
            else if (result.action === 'updated') report.updated++;
            else if (result.action === 'skipped') report.skipped++;
          } else {
            report.failed++;
          }
        }

        const progress = Math.round(((i + batch.length) / listsToSync.length) * 100);
        this.notifyListeners({
          isRunning: true,
          progress,
          currentList: batch[batch.length - 1]?.list_name,
          message: `Synchronisation en cours... ${i + batch.length}/${listsToSync.length}`
        });
      }

      this.lastSyncTime = new Date();
      report.duration = Date.now() - startTime;

      this.notifyListeners({
        isRunning: false,
        progress: 100,
        message: 'Synchronisation terminée'
      });

      return report;
    } catch (error: any) {
      this.notifyListeners({
        isRunning: false,
        progress: 0,
        message: `Erreur: ${error.message}`
      });
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  isSyncInProgress(): boolean {
    return this.syncInProgress;
  }
}

export const autocompleteListsSyncEngine = AutocompleteListsSyncEngine.getInstance();
