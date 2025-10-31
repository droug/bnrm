import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AutocompleteListValue {
  value_code: string;
  value_label: string;
  parent_value_code?: string | null;
  level: number;
  sort_order: number;
}

export interface AutocompleteList {
  id: string;
  list_code: string;
  list_name: string;
  description?: string;
  portal?: string;
  platform?: string;
  service?: string;
  sub_service?: string;
  module?: string;
  form_name?: string;
  max_levels: number;
  is_active: boolean;
}

/**
 * Hook pour charger et gérer les listes auto-complètes hiérarchiques
 */
export function useAutocompleteList(listCode: string) {
  const [values, setValues] = useState<AutocompleteListValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (listCode) {
      loadListValues();
    }
  }, [listCode]);

  const loadListValues = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer la liste
      const { data: listData, error: listError } = await supabase
        .from('autocomplete_lists')
        .select('id, max_levels')
        .eq('list_code', listCode)
        .maybeSingle();

      if (listError) throw listError;
      if (!listData) {
        console.warn(`Liste autocomplete ${listCode} non trouvée`);
        setValues([]);
        setLoading(false);
        return;
      }

      // Récupérer les valeurs
      const { data: valuesData, error: valuesError } = await supabase
        .from('autocomplete_list_values')
        .select('value_code, value_label, parent_value_code, level, sort_order')
        .eq('list_id', listData.id)
        .eq('is_active', true)
        .order('level', { ascending: true })
        .order('sort_order', { ascending: true });

      if (valuesError) throw valuesError;

      setValues(valuesData || []);
    } catch (err: any) {
      console.error(`Error loading autocomplete list ${listCode}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtenir les catégories de niveau 1
  const categories = useMemo(() => {
    return values.filter(v => v.level === 1).map(v => ({
      value: v.value_code,
      label: v.value_label
    }));
  }, [values]);

  // Obtenir les sous-catégories pour une catégorie donnée
  const getSubcategories = (parentCode: string) => {
    return values
      .filter(v => v.level === 2 && v.parent_value_code === parentCode)
      .map(v => ({
        value: v.value_code,
        label: v.value_label
      }));
  };

  // Obtenir toutes les options hiérarchiques
  const hierarchicalOptions = useMemo(() => {
    const parents = values.filter(v => v.level === 1);
    return parents.map(parent => ({
      value: parent.value_code,
      label: parent.value_label,
      children: values
        .filter(v => v.level === 2 && v.parent_value_code === parent.value_code)
        .map(child => ({
          value: child.value_code,
          label: child.value_label
        }))
    }));
  }, [values]);

  // Rechercher dans les valeurs
  const search = (query: string): AutocompleteListValue[] => {
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
    categories,
    getSubcategories,
    hierarchicalOptions,
    loading,
    error,
    reload: loadListValues,
    search,
    getLabel
  };
}

/**
 * Hook pour charger toutes les listes autocomplete
 */
export function useAutocompleteLists() {
  const [lists, setLists] = useState<AutocompleteList[]>([]);
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
        .from('autocomplete_lists')
        .select('*')
        .order('list_name');

      if (fetchError) throw fetchError;
      setLists(data || []);
    } catch (err: any) {
      console.error('Error loading autocomplete lists:', err);
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
