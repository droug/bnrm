import { supabase } from "@/integrations/supabase/client";

export interface SystemListDefinition {
  list_code: string;
  list_name: string;
  portal: string;
  platform: string;
  service: string;
  sub_service?: string;
  module: string;
  form_name: string;
  field_type: string;
  description: string;
  is_hierarchical?: boolean;
  values: Array<{
    value_code: string;
    value_label: string;
    sort_order: number;
    parent_code?: string;
  }>;
}

/**
 * Moteur de synchronisation robuste pour les listes système
 * - Détecte automatiquement les nouvelles listes
 * - Met à jour les listes existantes
 * - Synchronise les valeurs
 * - Gère la hiérarchie parent-enfant
 */
export class SystemListsSyncEngine {
  private static instance: SystemListsSyncEngine;
  private syncInProgress = false;
  private lastSyncTime: Date | null = null;
  private syncListeners: Set<(status: SyncStatus) => void> = new Set();

  private constructor() {}

  static getInstance(): SystemListsSyncEngine {
    if (!SystemListsSyncEngine.instance) {
      SystemListsSyncEngine.instance = new SystemListsSyncEngine();
    }
    return SystemListsSyncEngine.instance;
  }

  /**
   * Ajouter un listener pour suivre le statut de synchronisation
   */
  addSyncListener(listener: (status: SyncStatus) => void) {
    this.syncListeners.add(listener);
  }

  removeSyncListener(listener: (status: SyncStatus) => void) {
    this.syncListeners.delete(listener);
  }

  private notifyListeners(status: SyncStatus) {
    this.syncListeners.forEach(listener => listener(status));
  }

  /**
   * Calculer un hash pour détecter les changements
   */
  private calculateListHash(listDef: SystemListDefinition): string {
    const data = JSON.stringify({
      code: listDef.list_code,
      name: listDef.list_name,
      portal: listDef.portal,
      platform: listDef.platform,
      service: listDef.service,
      sub_service: listDef.sub_service,
      module: listDef.module,
      form_name: listDef.form_name,
      description: listDef.description,
      values_count: listDef.values.length,
      values: listDef.values.map(v => `${v.value_code}:${v.value_label}`).join(',')
    });
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Vérifier si une liste nécessite une mise à jour
   */
  private async needsUpdate(listDef: SystemListDefinition): Promise<boolean> {
    const newHash = this.calculateListHash(listDef);
    
    const { data } = await supabase
      .from('system_lists')
      .select('description')
      .eq('list_code', listDef.list_code)
      .maybeSingle();
    
    if (!data) return true; // Nouvelle liste
    
    // On stocke le hash dans la description (entre crochets à la fin)
    const hashMatch = data.description?.match(/\[hash:([a-z0-9]+)\]$/);
    const storedHash = hashMatch?.[1];
    
    return storedHash !== newHash;
  }

  /**
   * Synchroniser une seule liste
   */
  private async syncSingleList(listDef: SystemListDefinition): Promise<SyncResult> {
    try {
      const hash = this.calculateListHash(listDef);
      
      // Vérifier si la liste existe
      const { data: existingList, error: fetchError } = await supabase
        .from('system_lists')
        .select('id, is_hierarchical')
        .eq('list_code', listDef.list_code)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let listId: string;
      let operation: 'created' | 'updated';

      if (!existingList) {
        // Créer la liste
        const { data: newList, error: insertError } = await supabase
          .from('system_lists')
          .insert({
            list_code: listDef.list_code,
            list_name: listDef.list_name,
            portal: listDef.portal,
            platform: listDef.platform,
            service: listDef.service,
            sub_service: listDef.sub_service,
            module: listDef.module,
            form_name: listDef.form_name,
            field_type: listDef.field_type,
            description: `${listDef.description} [hash:${hash}]`,
            is_hierarchical: listDef.is_hierarchical || false,
            is_active: true,
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        listId = newList.id;
        operation = 'created';
      } else {
        listId = existingList.id;
        
        // Mettre à jour la liste
        const { error: updateError } = await supabase
          .from('system_lists')
          .update({
            list_name: listDef.list_name,
            portal: listDef.portal,
            platform: listDef.platform,
            service: listDef.service,
            sub_service: listDef.sub_service,
            module: listDef.module,
            form_name: listDef.form_name,
            description: `${listDef.description} [hash:${hash}]`,
          })
          .eq('id', listId);

        if (updateError) throw updateError;
        operation = 'updated';
      }

      // Synchroniser les valeurs
      await this.syncListValues(listId, listDef);

      return { success: true, operation, listCode: listDef.list_code };
    } catch (error: any) {
      console.error(`Erreur pour la liste ${listDef.list_code}:`, error);
      return { success: false, operation: 'failed', listCode: listDef.list_code, error: error.message };
    }
  }

  /**
   * Synchroniser les valeurs d'une liste
   */
  private async syncListValues(listId: string, listDef: SystemListDefinition) {
    // Récupérer les valeurs existantes
    const { data: existingValues } = await supabase
      .from('system_list_values')
      .select('id, value_code')
      .eq('list_id', listId);

    const existingCodes = new Set(existingValues?.map(v => v.value_code) || []);
    const newCodes = new Set(listDef.values.map(v => v.value_code));

    // Supprimer les valeurs qui n'existent plus dans la définition
    const codesToDelete = Array.from(existingCodes).filter(code => !newCodes.has(code));
    if (codesToDelete.length > 0) {
      const idsToDelete = existingValues
        ?.filter(v => codesToDelete.includes(v.value_code))
        .map(v => v.id) || [];
      
      if (idsToDelete.length > 0) {
        await supabase
          .from('system_list_values')
          .delete()
          .in('id', idsToDelete);
      }
    }

    // Ajouter ou mettre à jour les valeurs
    for (const value of listDef.values) {
      let parent_value_id: string | null = null;
      
      // Gérer la hiérarchie si nécessaire
      if (value.parent_code && listDef.is_hierarchical) {
        const { data: parentValue } = await supabase
          .from('system_list_values')
          .select('id')
          .eq('list_id', listId)
          .eq('value_code', value.parent_code)
          .maybeSingle();

        if (parentValue) {
          parent_value_id = parentValue.id;
        }
      }

      // Vérifier si la valeur existe
      const { data: existingValue } = await supabase
        .from('system_list_values')
        .select('id')
        .eq('list_id', listId)
        .eq('value_code', value.value_code)
        .maybeSingle();

      if (!existingValue) {
        // Insérer la valeur
        await supabase
          .from('system_list_values')
          .insert({
            list_id: listId,
            value_code: value.value_code,
            value_label: value.value_label,
            sort_order: value.sort_order,
            parent_value_id: parent_value_id,
            is_active: true,
          });
      } else {
        // Mettre à jour la valeur
        await supabase
          .from('system_list_values')
          .update({
            value_label: value.value_label,
            sort_order: value.sort_order,
            parent_value_id: parent_value_id,
            is_active: true,
          })
          .eq('id', existingValue.id);
      }
    }
  }

  /**
   * Synchronisation automatique de toutes les listes définies
   */
  async autoSync(definitions: SystemListDefinition[]): Promise<SyncReport> {
    if (this.syncInProgress) {
      console.log('Synchronisation déjà en cours...');
      return {
        total: 0,
        created: 0,
        updated: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
        results: []
      };
    }

    this.syncInProgress = true;
    const startTime = Date.now();
    
    this.notifyListeners({ status: 'running', progress: 0 });

    const report: SyncReport = {
      total: definitions.length,
      created: 0,
      updated: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      results: []
    };

    try {
      // Vérifier quelles listes nécessitent une mise à jour
      const listsToSync: SystemListDefinition[] = [];
      
      for (const listDef of definitions) {
        const needsUpdate = await this.needsUpdate(listDef);
        if (needsUpdate) {
          listsToSync.push(listDef);
        } else {
          report.skipped++;
        }
      }

      console.log(`📊 ${listsToSync.length} listes à synchroniser sur ${definitions.length}`);

      // Synchroniser les listes en parallèle (par lots de 5)
      const batchSize = 5;
      for (let i = 0; i < listsToSync.length; i += batchSize) {
        const batch = listsToSync.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(listDef => this.syncSingleList(listDef))
        );

        report.results.push(...batchResults);
        
        // Compter les résultats
        batchResults.forEach(result => {
          if (result.success) {
            if (result.operation === 'created') report.created++;
            else if (result.operation === 'updated') report.updated++;
          } else {
            report.failed++;
          }
        });

        const progress = ((i + batch.length) / listsToSync.length) * 100;
        this.notifyListeners({ status: 'running', progress });
      }

      report.duration = Date.now() - startTime;
      this.lastSyncTime = new Date();

      this.notifyListeners({ 
        status: 'completed', 
        progress: 100,
        report 
      });

      console.log(`✅ Synchronisation terminée en ${report.duration}ms`);
      console.log(`   Créées: ${report.created}, Mises à jour: ${report.updated}, Ignorées: ${report.skipped}, Erreurs: ${report.failed}`);

      return report;
    } catch (error: any) {
      this.notifyListeners({ status: 'error', error: error.message });
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Obtenir le statut de la dernière synchronisation
   */
  getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  isSyncInProgress(): boolean {
    return this.syncInProgress;
  }
}

// Types
export interface SyncResult {
  success: boolean;
  operation: 'created' | 'updated' | 'failed';
  listCode: string;
  error?: string;
}

export interface SyncReport {
  total: number;
  created: number;
  updated: number;
  failed: number;
  skipped: number;
  duration: number;
  results: SyncResult[];
}

export interface SyncStatus {
  status: 'running' | 'completed' | 'error';
  progress?: number;
  report?: SyncReport;
  error?: string;
}

// Export singleton
export const systemListsSyncEngine = SystemListsSyncEngine.getInstance();
