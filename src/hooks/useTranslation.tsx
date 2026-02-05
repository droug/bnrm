// Unified Translation Hook - Centralized access to all translations
// Merges portal, digital library, and legacy translations

import { useLanguage, Language } from './useLanguage';
import { digitalLibraryTranslations } from '@/i18n/digitalLibraryTranslations';
import { portalTranslations } from '@/i18n/portalTranslations';

// Get all translations for a given language
const getAllTranslations = (lang: Language): Record<string, string> => {
  const dl = digitalLibraryTranslations[lang] || digitalLibraryTranslations.fr;
  const portal = portalTranslations[lang] || portalTranslations.fr;
  
  return {
    ...dl,
    ...portal,
  };
};

export const useTranslation = () => {
  const { language, setLanguage, t: legacyT, isRTL } = useLanguage();
  
  // Enhanced translation function that checks all sources
  const t = (key: string, fallback?: string): string => {
    // First try the legacy translation function
    const legacyResult = legacyT(key);
    if (legacyResult !== key) {
      return legacyResult;
    }
    
    // Then try merged translations
    const allTranslations = getAllTranslations(language);
    if (allTranslations[key]) {
      return allTranslations[key];
    }
    
    // Fallback to French if translation not found
    if (language !== 'fr') {
      const frTranslations = getAllTranslations('fr');
      if (frTranslations[key]) {
        return frTranslations[key];
      }
    }
    
    // Return fallback or key if nothing found
    return fallback || key;
  };
  
  // Translation function with variable interpolation
  const tVar = (key: string, variables: Record<string, string | number>): string => {
    let translated = t(key);
    Object.entries(variables).forEach(([varKey, value]) => {
      translated = translated.replace(`{{${varKey}}}`, String(value));
    });
    return translated;
  };
  
  // Check if a translation key exists
  const hasTranslation = (key: string): boolean => {
    const legacyResult = legacyT(key);
    if (legacyResult !== key) return true;
    
    const allTranslations = getAllTranslations(language);
    return !!allTranslations[key];
  };
  
  // Get language display name
  const getLanguageName = (lang: Language): string => {
    const names: Record<Language, string> = {
      fr: 'Français',
      ar: 'العربية',
      en: 'English',
      es: 'Español',
      amz: 'ⵜⴰⵎⴰⵣⵉⵖⵜ',
    };
    return names[lang];
  };
  
  // Get all available languages
  const availableLanguages: { code: Language; name: string; nativeName: string }[] = [
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'amz', name: 'Amazigh', nativeName: 'ⵜⴰⵎⴰⵣⵉⵖⵜ' },
  ];
  
  return {
    language,
    setLanguage,
    t,
    tVar,
    hasTranslation,
    isRTL,
    getLanguageName,
    availableLanguages,
  };
};

export type { Language };
