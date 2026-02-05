# Système de Traduction BNRM

## Vue d'ensemble

Ce projet utilise un système de traduction centralisé supportant 5 langues :
- **Français (fr)** - Langue par défaut
- **Arabe (ar)** - RTL
- **Anglais (en)**
- **Espagnol (es)**
- **Amazighe (amz)** - Tifinagh

## Structure des fichiers

```
src/
├── hooks/
│   ├── useLanguage.tsx        # Hook legacy avec traductions de base
│   └── useTranslation.tsx     # Hook unifié (recommandé)
├── i18n/
│   ├── digitalLibraryTranslations.ts   # Traductions BN/bibliothèque numérique
│   ├── portalTranslations.ts           # Traductions portail principal
│   └── README.md                        # Ce fichier
```

## Comment utiliser les traductions

### 1. Importer le hook `useTranslation`

```tsx
import { useTranslation } from "@/hooks/useTranslation";

const MyComponent = () => {
  const { t, language, setLanguage, isRTL } = useTranslation();
  
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <h1>{t('portal.hero.title')}</h1>
      <p>{t('portal.hero.description')}</p>
    </div>
  );
};
```

### 2. Fonctions disponibles

| Fonction | Description |
|----------|-------------|
| `t(key)` | Retourne la traduction pour la clé donnée |
| `tVar(key, { name: 'value' })` | Traduction avec variables `{{name}}` |
| `hasTranslation(key)` | Vérifie si une clé existe |
| `language` | Langue actuelle ('fr', 'ar', 'en', 'es', 'amz') |
| `setLanguage(lang)` | Change la langue |
| `isRTL` | `true` si la langue est RTL (arabe) |
| `getLanguageName(lang)` | Nom natif de la langue |
| `availableLanguages` | Liste des langues disponibles |

### 3. Convention de nommage des clés

```
[module].[section].[element].[property]

Exemples:
- portal.hero.title
- portal.services.consultation.title
- portal.services.consultation.desc
- dl.collections.manuscripts
- dl.search.placeholder
```

## Préfixes des modules

| Préfixe | Description |
|---------|-------------|
| `portal.` | Portail principal BNRM |
| `dl.` | Bibliothèque numérique (Digital Library) |
| `ms.` | Manuscrits |
| `cbm.` | Catalogue Bibliographique Marocain |
| `admin.` | Administration |
| `common.` | Éléments communs |

## Ajouter de nouvelles traductions

### 1. Identifier le fichier approprié

- **Portail principal** → `src/i18n/portalTranslations.ts`
- **Bibliothèque numérique** → `src/i18n/digitalLibraryTranslations.ts`
- **Traductions legacy** → `src/hooks/useLanguage.tsx`

### 2. Ajouter les clés pour TOUTES les langues

```ts
// Dans portalTranslations.ts
export const portalTranslations = {
  fr: {
    'portal.newSection.title': 'Mon Nouveau Titre',
    'portal.newSection.desc': 'Ma description en français',
  },
  ar: {
    'portal.newSection.title': 'عنواني الجديد',
    'portal.newSection.desc': 'وصفي بالعربية',
  },
  en: {
    'portal.newSection.title': 'My New Title',
    'portal.newSection.desc': 'My description in English',
  },
  es: {
    'portal.newSection.title': 'Mi Nuevo Título',
    'portal.newSection.desc': 'Mi descripción en español',
  },
  amz: {
    'portal.newSection.title': 'ⴰⵣⵡⵍ ⵉⵏⵓ ⴰⵎⴰⵢⵏⵓ',
    'portal.newSection.desc': 'ⴰⴳⵍⴰⵎ ⵉⵏⵓ ⵙ ⵜⵎⴰⵣⵉⵖⵜ',
  }
};
```

## Bonnes pratiques

1. **Toujours ajouter les 5 langues** - Même si une langue n'est pas prioritaire, ajoutez au moins la clé avec un fallback.

2. **Utiliser le fallback français** - Si une traduction manque, le système retourne automatiquement le français.

3. **Éviter les textes en dur** - Ne jamais écrire du texte directement dans les composants.

4. **Regrouper par section** - Organiser les clés par section logique de l'interface.

5. **Documenter les clés complexes** - Ajouter des commentaires pour les clés avec variables.

## Migration depuis useLanguage

Si vous utilisez encore `useLanguage`, migrez vers `useTranslation` :

```diff
- import { useLanguage } from "@/hooks/useLanguage";
+ import { useTranslation } from "@/hooks/useTranslation";

const MyComponent = () => {
-   const { language, setLanguage, t, isRTL } = useLanguage();
+   const { language, setLanguage, t, isRTL } = useTranslation();
```

Les deux hooks sont compatibles, mais `useTranslation` offre plus de fonctionnalités.

## Support RTL

Pour les langues RTL (arabe), utilisez `isRTL` :

```tsx
const { isRTL } = useTranslation();

return (
  <div 
    dir={isRTL ? 'rtl' : 'ltr'}
    className={isRTL ? 'text-right' : 'text-left'}
  >
    {/* Contenu */}
  </div>
);
```

## Vérification des traductions

Pour vérifier si toutes les clés sont traduites :

```tsx
const { hasTranslation, availableLanguages } = useTranslation();

// Vérifier une clé
if (!hasTranslation('portal.newSection.title')) {
  console.warn('Traduction manquante: portal.newSection.title');
}
```
