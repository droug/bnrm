import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SystemListValue {
  value_code: string;
  value_label: string;
  sort_order?: number;
  metadata?: any; // JSON type from Supabase
  parent_code?: string | null;
}

export interface SystemList {
  id: string;
  list_code: string;
  list_name: string;
  description?: string;
  is_hierarchical: boolean;
  portal?: string;
  platform?: string;
  service?: string;
  sub_service?: string;
  module?: string;
  form_name?: string;
}

/**
 * Hook pour charger et gérer les listes système dynamiques
 */
export function useSystemList(listCode: string) {
  const [values, setValues] = useState<SystemListValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadListValues();
  }, [listCode]);

  const loadListValues = async () => {
    try {
      setLoading(true);
      setError(null);

      // D'abord, vérifier dans system_lists (listes déroulantes)
      const { data: listData, error: listError } = await supabase
        .from('system_lists')
        .select('id, is_hierarchical')
        .eq('list_code', listCode)
        .maybeSingle();

      if (!listError && listData) {
        // Récupérer les valeurs depuis system_list_values
        const { data: valuesData, error: valuesError } = await supabase
          .from('system_list_values')
          .select('value_code, value_label, sort_order, metadata, parent_code')
          .eq('list_id', listData.id)
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (valuesError) throw valuesError;
        setValues(valuesData || []);
        setLoading(false);
        return;
      }

      // Sinon, essayer dans autocomplete_lists (listes auto-complètes)
      const { data: autoListData, error: autoListError } = await supabase
        .from('autocomplete_lists')
        .select('id')
        .eq('list_code', listCode)
        .maybeSingle();

      if (!autoListError && autoListData) {
        // Récupérer les valeurs depuis autocomplete_list_values
        const { data: autoValuesData, error: autoValuesError } = await supabase
          .from('autocomplete_list_values')
          .select('value_code, value_label, sort_order, parent_value_code')
          .eq('list_id', autoListData.id)
          .eq('is_active', true)
          .order('level', { ascending: true })
          .order('sort_order', { ascending: true });

        if (autoValuesError) throw autoValuesError;
        
        // Mapper pour correspondre à l'interface SystemListValue
        const mappedValues = (autoValuesData || []).map(v => ({
          value_code: v.value_code,
          value_label: v.value_label,
          sort_order: v.sort_order,
          parent_code: v.parent_value_code,
          metadata: null
        }));
        
        setValues(mappedValues);
        setLoading(false);
        return;
      }

      // Si pas trouvé dans les deux tables
      console.warn(`Liste ${listCode} non trouvée`);
      setValues([]);
    } catch (err: any) {
      console.error(`Error loading system list ${listCode}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtenir les options pour un select
  const options = useMemo(() => {
    return values.map(v => ({
      value: v.value_code,
      label: v.value_label,
      parent: v.parent_code,
      metadata: v.metadata
    }));
  }, [values]);

  // Obtenir les options hiérarchiques (à 2 niveaux)
  const hierarchicalOptions = useMemo(() => {
    const parents = values.filter(v => !v.parent_code);
    return parents.map(parent => ({
      value: parent.value_code,
      label: parent.value_label,
      children: values
        .filter(v => v.parent_code === parent.value_code)
        .map(child => ({
          value: child.value_code,
          label: child.value_label,
          metadata: child.metadata
        }))
    }));
  }, [values]);

  // Rechercher dans les valeurs
  const search = (query: string): SystemListValue[] => {
    const lowerQuery = query.toLowerCase();
    return values.filter(v => 
      v.value_label.toLowerCase().includes(lowerQuery) ||
      v.value_code.toLowerCase().includes(lowerQuery)
    );
  };

  // Obtenir le label d'un code
  const getLabel = (code: string): string | undefined => {
    return values.find(v => v.value_code === code)?.value_label;
  };

  return {
    values,
    options,
    hierarchicalOptions,
    loading,
    error,
    reload: loadListValues,
    search,
    getLabel
  };
}

/**
 * Hook pour charger toutes les listes système
 */
export function useSystemLists() {
  const [lists, setLists] = useState<SystemList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('system_lists')
        .select('id, list_code, list_name, description, is_hierarchical, portal, platform, service, sub_service, module, form_name')
        .order('list_name');

      if (fetchError) throw fetchError;
      setLists(data || []);
    } catch (err: any) {
      console.error('Error loading system lists:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    lists,
    loading,
    error,
    reload: loadLists
  };
}
