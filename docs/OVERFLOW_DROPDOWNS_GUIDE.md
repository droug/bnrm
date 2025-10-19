# Guide de correction des problèmes d'overflow et dropdowns

## Problèmes identifiés et corrigés

### 1. Z-index cohérent pour les dropdowns

**Variables CSS ajoutées dans index.css:**
```css
--z-popover: 1000;
--z-dropdown: 100;
--z-navbar: 200;
```

**Composants mis à jour:**
- `select.tsx`: Utilise `z-[var(--z-popover)]`
- `popover.tsx`: Utilise `z-[var(--z-popover)]`
- `dropdown-menu.tsx`: Utilise `z-[var(--z-dropdown)]`

### 2. Fond opaque pour les dropdowns

Tous les composants dropdown utilisent maintenant:
- `bg-popover` pour un fond opaque
- `text-popover-foreground` pour le texte lisible
- `border` pour une délimitation claire

### 3. Overflow problématiques identifiés

**À éviter dans les conteneurs parents de modales:**
- `overflow-hidden` sur les sections principales
- `overflow-auto` sur les containers fixes
- `overflow-scroll` sur les wrappers de dialogue

**Zones sécurisées pour overflow:**
- Contenu interne des cartes
- Viewports de défilement explicites
- Images et médias

### 4. Règles CSS pour modales

Les modales utilisent maintenant:
```css
position: fixed;
z-index: var(--z-dialog);
```

Au lieu de:
```css
position: absolute;  /* ❌ Peut être rogné */
```

## Checklist pour les nouveaux composants

- [ ] Les dropdowns ont `bg-popover`
- [ ] Les dropdowns ont `z-[var(--z-popover)]` ou `z-[var(--z-dropdown)]`
- [ ] Les modales utilisent `position: fixed`
- [ ] Pas de `overflow-hidden` sur les containers parents de modales
- [ ] Les popovers utilisent `<Portal>` de Radix UI

## Composants à ne PAS envelopper avec overflow-hidden

- Dialog
- AlertDialog
- Sheet
- Popover
- DropdownMenu
- Select
- Tooltip
- ContextMenu

## Tests à effectuer

1. Ouvrir un dropdown dans une modal
2. Ouvrir un select dans un conteneur scrollable
3. Vérifier que les popovers ne sont pas coupés
4. Tester sur mobile et desktop
5. Vérifier le dark mode
