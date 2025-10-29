import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ListValue {
  id: string;
  value_code: string;
  value_label: string;
  sort_order: number;
  parent_value_id: string | null;
}

interface UseDependentListOptions {
  listCode: string;
  parentListCode?: string;
  parentSelectedValue?: string;
  enabled?: boolean;
}

/**
 * Hook pour charger les valeurs d'une liste système avec support des dépendances
 * 
 * @param listCode - Code de la liste à charger
 * @param parentListCode - Code de la liste parent (optionnel)
 * @param parentSelectedValue - Code de la valeur sélectionnée dans la liste parent
 * @param enabled - Active/désactive le chargement (par défaut: true)
 * 
 * @example
 * // Liste simple sans dépendance
 * const { values, loading } = useDependentList({ listCode: 'languages' });
 * 
 * @example
 * // Liste dépendante d'une autre liste
 * const { values: disciplines } = useDependentList({
 *   listCode: 'bd_discipline',
 *   parentListCode: 'bd_type_publication',
 *   parentSelectedValue: publicationType
 * });
 */
export function useDependentList({
  listCode,
  parentListCode,
  parentSelectedValue,
  enabled = true,
}: UseDependentListOptions) {
  const [values, setValues] = useState<ListValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !listCode) {
      setValues([]);
      setLoading(false);
      return;
    }

    const fetchValues = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the list by code
        const { data: list, error: listError } = await supabase
          .from('system_lists')
          .select('id, parent_list_id, depends_on_parent_value')
          .eq('list_code', listCode)
          .single();

        if (listError) throw listError;

        // If list depends on parent and we have parent info
        if (list.depends_on_parent_value && list.parent_list_id && parentListCode && parentSelectedValue) {
          // Get parent list
          const { data: parentList, error: parentListError } = await supabase
            .from('system_lists')
            .select('id')
            .eq('list_code', parentListCode)
            .single();

          if (parentListError) throw parentListError;

          // Get parent value
          const { data: parentValue, error: parentValueError } = await supabase
            .from('system_list_values')
            .select('id')
            .eq('list_id', parentList.id)
            .eq('value_code', parentSelectedValue)
            .single();

          if (parentValueError) throw parentValueError;

          // Get filtered values
          const { data: filteredValues, error: valuesError } = await supabase
            .from('system_list_values')
            .select('id, value_code, value_label, sort_order, parent_value_id')
            .eq('list_id', list.id)
            .eq('parent_value_id', parentValue.id)
            .eq('is_active', true)
            .order('sort_order');

          if (valuesError) throw valuesError;
          setValues(filteredValues || []);
        } else {
          // Get all values (no filtering)
          const { data: allValues, error: valuesError } = await supabase
            .from('system_list_values')
            .select('id, value_code, value_label, sort_order, parent_value_id')
            .eq('list_id', list.id)
            .eq('is_active', true)
            .order('sort_order');

          if (valuesError) throw valuesError;
          setValues(allValues || []);
        }
      } catch (err) {
        console.error('Error fetching dependent list values:', err);
        setError(err as Error);
        setValues([]);
      } finally {
        setLoading(false);
      }
    };

    fetchValues();
  }, [listCode, parentListCode, parentSelectedValue, enabled]);

  return { values, loading, error };
}
