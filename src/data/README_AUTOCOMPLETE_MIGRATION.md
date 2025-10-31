# Migration des listes auto-complètes vers la base de données

## Résumé

Toutes les listes auto-complètes codées en dur ont été migrées vers la base de données pour centraliser et faciliter la gestion des données de référence.

## Fichiers obsolètes

Les fichiers suivants sont maintenant **OBSOLÈTES** et ne doivent plus être utilisés directement :

- ❌ `src/data/worldLanguages.ts` 
- ❌ `src/data/worldCountries.ts`
- ❌ `src/components/ui/country-autocomplete.tsx` (versions anciennes)
- ❌ `src/components/ui/language-autocomplete.tsx` (versions anciennes)

## Nouvelle architecture

### 1. Définitions centralisées
Toutes les listes sont maintenant définies dans :
```
src/data/autocompleteListsDefinitions.ts
```

Ce fichier contient :
- `COUNTRIES_LIST` : 72 pays avec codes ISO, drapeaux, indicatifs
- `LANGUAGES_LIST` : 70 langues avec codes ISO et traductions arabes

### 2. Synchronisation automatique
Les listes sont automatiquement synchronisées vers la base de données au démarrage de l'application via :
```typescript
src/services/autocompleteListsSync.ts
```

### 3. Composant générique
Un nouveau composant générique remplace tous les anciens composants :
```typescript
<GenericAutocomplete 
  listCode="world_countries"  // ou "world_languages"
  value={selectedValue}
  onChange={setValue}
  label="Pays"
  placeholder="Rechercher..."
  multiple={true}  // pour sélection multiple
/>
```

## Guide de migration

### Avant (ancien code)
```typescript
import { CountryAutocomplete } from '@/components/ui/country-autocomplete';
import { LanguageAutocomplete } from '@/components/ui/language-autocomplete';

<CountryAutocomplete 
  value={countries} 
  onChange={setCountries}
/>

<LanguageAutocomplete 
  value={language} 
  onChange={setLanguage}
/>
```

### Après (nouveau code)
```typescript
import { GenericAutocomplete } from '@/components/ui/generic-autocomplete';

<GenericAutocomplete 
  listCode="world_countries"
  value={countries} 
  onChange={setCountries}
  multiple
/>

<GenericAutocomplete 
  listCode="world_languages"
  value={language} 
  onChange={setLanguage}
/>
```

## Compatibilité

Les anciens composants `CountryAutocomplete` et `LanguageAutocomplete` ont été refactorisés pour utiliser `GenericAutocomplete` en interne, garantissant une compatibilité ascendante.

Cependant, il est **fortement recommandé** de migrer vers `GenericAutocomplete` pour bénéficier de :
- ✅ Données toujours synchronisées avec la base
- ✅ Gestion centralisée des listes
- ✅ Support de nouvelles listes sans code supplémentaire
- ✅ Modification des listes via l'interface admin

## Ajouter une nouvelle liste

1. Définir la liste dans `autocompleteListsDefinitions.ts`:
```typescript
export const NEW_LIST: AutocompleteListDefinition = {
  list_code: 'my_new_list',
  list_name: 'Ma nouvelle liste',
  description: 'Description',
  portal: 'BNRM',
  platform: 'Common',
  service: 'System',
  sub_service: 'Reference',
  form_name: 'General',
  max_levels: 1,
  values: [
    { value_code: 'code1', value_label: 'Label 1', level: 1, sort_order: 1 }
  ]
};

// Ajouter à l'export
export const AUTOCOMPLETE_LISTS_DEFINITIONS = [
  COUNTRIES_LIST,
  LANGUAGES_LIST,
  NEW_LIST  // 👈 Ajouter ici
];
```

2. Utiliser dans l'application:
```typescript
<GenericAutocomplete 
  listCode="my_new_list"
  value={value}
  onChange={setValue}
/>
```

3. La synchronisation automatique se charge du reste ! 🎉

## Gestion des données

### Interface Admin
Accédez à `/admin/system-lists` pour :
- ✅ Visualiser toutes les listes organisées hiérarchiquement
- ✅ Ajouter/modifier/supprimer des listes
- ✅ Ajouter/modifier/supprimer des valeurs
- ✅ Forcer une synchronisation manuelle

### Synchronisation
- **Automatique** : Au démarrage de l'application
- **Manuelle** : Via le bouton "Synchroniser les listes" dans l'interface admin
- **Intelligente** : Seules les modifications sont appliquées (hash-based)

## Base de données

### Tables
- `autocomplete_lists` : Métadonnées des listes
- `autocomplete_list_values` : Valeurs des listes

### Requêtes
Le hook `useAutocompleteList` gère automatiquement :
- ✅ Chargement des données
- ✅ Mise en cache
- ✅ Recherche/filtrage
- ✅ Support hiérarchique
- ✅ Gestion des erreurs

## Nettoyage du code

Les fichiers suivants peuvent être supprimés dans une future version :
- `src/data/worldLanguages.ts`
- `src/data/worldCountries.ts`
- `src/components/ui/country-autocomplete-legacy.tsx`
- `src/components/ui/language-autocomplete-legacy.tsx`

**Note** : Conservés temporairement pour la compatibilité avec le code existant.
