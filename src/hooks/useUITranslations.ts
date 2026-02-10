// Hook for managing UI translations from database + static files
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { portalTranslations } from '@/i18n/portalTranslations';
import { digitalLibraryTranslations } from '@/i18n/digitalLibraryTranslations';
import { toast } from 'sonner';

export interface TranslationEntry {
  key: string;
  source: 'portal' | 'digital_library' | 'custom' | 'db_override';
  category: string;
  fr: string;
  ar: string;
  en: string;
  es: string;
  amz: string;
  isFromDB: boolean;
  dbId?: string;
}

// Extract category from a translation key (e.g., "portal.nav.discover" → "nav")
const extractCategory = (key: string): string => {
  const parts = key.split('.');
  if (parts.length >= 2) return parts[1];
  return 'general';
};

// Build merged translation entries from static files
const buildStaticEntries = (): TranslationEntry[] => {
  const entries: Map<string, TranslationEntry> = new Map();

  // Process portal translations
  const portalFr = portalTranslations.fr || {};
  const portalAr = portalTranslations.ar || {};
  const portalEn = (portalTranslations as any).en || {};
  const portalEs = (portalTranslations as any).es || {};
  const portalAmz = (portalTranslations as any).amz || {};

  Object.keys(portalFr).forEach(key => {
    entries.set(key, {
      key,
      source: 'portal',
      category: extractCategory(key),
      fr: portalFr[key] || '',
      ar: portalAr[key] || '',
      en: portalEn[key] || '',
      es: portalEs[key] || '',
      amz: portalAmz[key] || '',
      isFromDB: false,
    });
  });

  // Process digital library translations
  const dlFr = digitalLibraryTranslations.fr || {};
  const dlAr = (digitalLibraryTranslations as any).ar || {};
  const dlEn = (digitalLibraryTranslations as any).en || {};
  const dlEs = (digitalLibraryTranslations as any).es || {};
  const dlAmz = (digitalLibraryTranslations as any).amz || {};

  Object.keys(dlFr).forEach(key => {
    entries.set(key, {
      key,
      source: 'digital_library',
      category: extractCategory(key),
      fr: dlFr[key] || '',
      ar: dlAr[key] || '',
      en: dlEn[key] || '',
      es: dlEs[key] || '',
      amz: dlAmz[key] || '',
      isFromDB: false,
    });
  });

  return Array.from(entries.values());
};

export const useUITranslations = () => {
  const queryClient = useQueryClient();

  // Fetch DB translations
  const { data: dbTranslations, isLoading } = useQuery({
    queryKey: ['ui-translations-db'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ui_translations')
        .select('*')
        .eq('is_active', true)
        .order('translation_key');
      if (error) throw error;
      return data || [];
    },
  });

  // Merge static + DB entries (DB overrides static)
  const getMergedEntries = (): TranslationEntry[] => {
    const staticEntries = buildStaticEntries();
    const dbMap = new Map<string, any>();
    
    (dbTranslations || []).forEach((row: any) => {
      dbMap.set(row.translation_key, row);
    });

    // Override static with DB values
    const merged = staticEntries.map(entry => {
      const dbRow = dbMap.get(entry.key);
      if (dbRow) {
        dbMap.delete(entry.key); // Mark as used
        return {
          ...entry,
          fr: dbRow.fr || entry.fr,
          ar: dbRow.ar || entry.ar,
          en: dbRow.en || entry.en,
          es: dbRow.es || entry.es,
          amz: dbRow.amz || entry.amz,
          isFromDB: true,
          dbId: dbRow.id,
          source: dbRow.source || entry.source,
          category: dbRow.category || entry.category,
        };
      }
      return entry;
    });

    // Add DB-only entries (custom keys)
    dbMap.forEach((dbRow) => {
      merged.push({
        key: dbRow.translation_key,
        source: dbRow.source || 'custom',
        category: dbRow.category || 'general',
        fr: dbRow.fr || '',
        ar: dbRow.ar || '',
        en: dbRow.en || '',
        es: dbRow.es || '',
        amz: dbRow.amz || '',
        isFromDB: true,
        dbId: dbRow.id,
      });
    });

    return merged;
  };

  // Save/update a translation
  const saveMutation = useMutation({
    mutationFn: async (entry: { key: string; fr: string; ar: string; en: string; es: string; amz: string; source: string; category: string }) => {
      const { data: existing } = await supabase
        .from('ui_translations')
        .select('id')
        .eq('translation_key', entry.key)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('ui_translations')
          .update({ fr: entry.fr, ar: entry.ar, en: entry.en, es: entry.es, amz: entry.amz, category: entry.category })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ui_translations')
          .insert({
            translation_key: entry.key,
            source: entry.source,
            category: entry.category,
            fr: entry.fr,
            ar: entry.ar,
            en: entry.en,
            es: entry.es,
            amz: entry.amz,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ui-translations-db'] });
      toast.success('Traduction enregistrée');
    },
    onError: () => {
      toast.error('Erreur lors de l\'enregistrement');
    },
  });

  // Delete a custom translation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ui_translations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ui-translations-db'] });
      toast.success('Traduction supprimée');
    },
  });

  return {
    entries: getMergedEntries(),
    isLoading,
    saveMutation,
    deleteMutation,
  };
};
