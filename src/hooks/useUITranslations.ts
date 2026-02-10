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
  section: string;
  fr: string;
  ar: string;
  en: string;
  es: string;
  amz: string;
  isFromDB: boolean;
  dbId?: string;
}

// Section definitions for organizing translations
export const SECTION_OPTIONS = [
  { value: 'general', label: 'Général' },
  { value: 'header', label: 'En-tête / Header' },
  { value: 'footer', label: 'Pied de page / Footer' },
  { value: 'nav', label: 'Navigation / Menus' },
  { value: 'hero', label: 'Hero / Bannière' },
  { value: 'home', label: 'Page d\'accueil' },
  { value: 'search', label: 'Recherche' },
  { value: 'auth', label: 'Authentification' },
  { value: 'form', label: 'Formulaires' },
  { value: 'button', label: 'Boutons / Actions' },
  { value: 'dialog', label: 'Dialogues / Modals' },
  { value: 'table', label: 'Tableaux / Listes' },
  { value: 'notification', label: 'Notifications / Toast' },
  { value: 'error', label: 'Erreurs / Validation' },
  { value: 'dashboard', label: 'Tableau de bord' },
  { value: 'profile', label: 'Profil utilisateur' },
  { value: 'manuscript', label: 'Manuscrits' },
  { value: 'catalog', label: 'Catalogue / CBM' },
  { value: 'cms', label: 'CMS / Gestion contenu' },
  { value: 'booking', label: 'Réservations / Espaces' },
  { value: 'services', label: 'Services numériques' },
  { value: 'about', label: 'À propos' },
  { value: 'contact', label: 'Contact' },
  { value: 'legal', label: 'Mentions légales' },
  { value: 'accessibility', label: 'Accessibilité' },
];

// Auto-detect section from key
const detectSection = (key: string): string => {
  const k = key.toLowerCase();
  if (k.includes('nav') || k.includes('menu') || k.includes('dropdown')) return 'nav';
  if (k.includes('header')) return 'header';
  if (k.includes('footer')) return 'footer';
  if (k.includes('hero') || k.includes('banner')) return 'hero';
  if (k.includes('home') || k.includes('accueil')) return 'home';
  if (k.includes('search') || k.includes('recherche')) return 'search';
  if (k.includes('auth') || k.includes('login') || k.includes('register') || k.includes('password')) return 'auth';
  if (k.includes('form') || k.includes('input') || k.includes('label') || k.includes('placeholder')) return 'form';
  if (k.includes('button') || k.includes('btn') || k.includes('action') || k.includes('submit') || k.includes('cancel')) return 'button';
  if (k.includes('dialog') || k.includes('modal') || k.includes('confirm')) return 'dialog';
  if (k.includes('table') || k.includes('list') || k.includes('column') || k.includes('row')) return 'table';
  if (k.includes('toast') || k.includes('notification') || k.includes('alert') || k.includes('success')) return 'notification';
  if (k.includes('error') || k.includes('valid') || k.includes('required')) return 'error';
  if (k.includes('dashboard') || k.includes('admin') || k.includes('stats')) return 'dashboard';
  if (k.includes('profile') || k.includes('account') || k.includes('user')) return 'profile';
  if (k.includes('manuscript') || k.includes('makhtutat')) return 'manuscript';
  if (k.includes('catalog') || k.includes('cbm') || k.includes('cbn')) return 'catalog';
  if (k.includes('cms') || k.includes('content') || k.includes('page')) return 'cms';
  if (k.includes('booking') || k.includes('space') || k.includes('reservation')) return 'booking';
  if (k.includes('service')) return 'services';
  if (k.includes('about') || k.includes('propos')) return 'about';
  if (k.includes('contact')) return 'contact';
  return 'general';
};

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
      section: detectSection(key),
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
      section: detectSection(key),
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
          section: dbRow.section || entry.section,
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
        section: dbRow.section || detectSection(dbRow.translation_key),
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
    mutationFn: async (entry: { key: string; fr: string; ar: string; en: string; es: string; amz: string; source: string; category: string; section?: string }) => {
      const { data: existing } = await supabase
        .from('ui_translations')
        .select('id')
        .eq('translation_key', entry.key)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('ui_translations')
          .update({ fr: entry.fr, ar: entry.ar, en: entry.en, es: entry.es, amz: entry.amz, category: entry.category, section: entry.section || 'general' })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ui_translations')
          .insert({
            translation_key: entry.key,
            source: entry.source,
            category: entry.category,
            section: entry.section || 'general',
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
      queryClient.invalidateQueries({ queryKey: ['ui-translations-overrides'] });
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
      queryClient.invalidateQueries({ queryKey: ['ui-translations-overrides'] });
      toast.success('Traduction supprimée');
    },
  });

  // AI translate mutation
  const aiTranslateMutation = useMutation({
    mutationFn: async ({ text, sourceLang, targetLangs, context }: { text: string; sourceLang: string; targetLangs: string[]; context?: string }) => {
      const { data, error } = await supabase.functions.invoke('ai-translate', {
        body: { text, sourceLang, targetLangs, context },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.translations as Record<string, string>;
    },
  });

  return {
    entries: getMergedEntries(),
    isLoading,
    saveMutation,
    deleteMutation,
    aiTranslateMutation,
  };
};
