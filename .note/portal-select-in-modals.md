# Règle : Utiliser PortalSelect dans les modales/Dialog

## Problème
Les composants `Select` de Radix UI dans les modales (`Dialog`, `DialogContent`) ont des problèmes de z-index et de positionnement. Les listes déroulantes peuvent apparaître en dessous de la modale ou être coupées par le `overflow: hidden`.

## Solution
Utiliser le composant `PortalSelect` (src/components/ui/portal-select.tsx) qui utilise `createPortal` pour afficher la liste déroulante directement dans le `body` avec `position: fixed`.

## Quand appliquer
- **TOUJOURS** utiliser `PortalSelect` au lieu de `Select` dans les modales (`Dialog`, `DialogContent`, `Sheet`, etc.)
- Pour les Select en dehors des modales, le composant standard peut être utilisé

## Comment migrer

### Avant (problématique)
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Sélectionner..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Après (correct)
```tsx
import { PortalSelect } from "@/components/ui/portal-select";

<PortalSelect
  value={value}
  onChange={setValue}
  placeholder="Sélectionner..."
  options={[
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
  ]}
/>
```

## Props de PortalSelect
- `value`: string - Valeur sélectionnée
- `onChange`: (value: string) => void - Callback de changement
- `options`: { value: string; label: string; description?: string }[] - Options disponibles
- `placeholder?`: string - Texte du placeholder
- `className?`: string - Classes CSS additionnelles

## Fichiers corrigés (référence)
- src/components/digital-library/DocumentsManager.tsx
- src/components/AddInternalUserDialog.tsx
- src/components/EditUserDialog.tsx
- src/components/workflow/CreateRoleDialog.tsx
- src/components/cms/media/MediaUploadDialog.tsx
- src/components/digital-library/ReservationRequestDialog.tsx
