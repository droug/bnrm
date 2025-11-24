# BNRM Official Design System

Guide d'utilisation de la charte graphique officielle de la Bibliothèque Nationale du Royaume du Maroc.

## Typographie Officielle

### Français
- **Police principale** : Georgia, Times New Roman (serif avec empattements)
- **Usage** : Titres, texte institutionnel, documents officiels
- **Classes CSS** : `font-french`, `font-serif`

### Arabe
- **Police principale** : Amiri, Noto Naskh Arabic (calligraphie traditionnelle et élégante)
- **Usage** : Titres, texte institutionnel, documents officiels
- **Classes CSS** : `font-arabic`

### Hiérarchie typographique

**Desktop:**
- Heading 1: Titre principal (العنوان الرئيسي)
- Heading 2: Sous-titre (العنوان الفرعي)
- Heading 3: Section (القسم)
- Heading 4: Sous-section (القسم الفرعي)
- Heading 5: Titre secondaire (العنوان الثانوي)
- Heading 6: Sous-titre secondaire (العنوان الفرعي الثانوي)

**Mobile:**
- Text Large: 22px
- Text Medium: 18px
- Text Regular: 16px
- Text Small: 14px
- Text Tiny: 12px

**Poids de police:**
- Extra Bold (800)
- Bold (700)
- Semi Bold (600)
- Medium (500)
- Normal (400)
- Light (300)

## Palette de Couleurs Officielle

### Famille Slate (Surfaces neutres)
```css
--slate-surface: #F8FAFC   /* Surface claire */
--slate-light: #F1F5F9     /* Fond léger */
--slate-border: #E2E8F0    /* Bordures */
--slate-text-light: #94A3B8 /* Texte léger */
--slate-text: #64748B      /* Texte standard */
--slate-base: #334155      /* Base */
--slate-base-dark: #1E293B /* Base sombre */
```

**Usage Tailwind:**
- `bg-slate-surface`, `text-slate-text`, `border-slate-border`

### Famille Blue (Couleurs primaires BNRM)
```css
--blue-surface: #EFF6FF    /* Surface */
--blue-light: #DBEAFE      /* Léger */
--blue-soft: #93C5FD       /* Doux */
--blue-primary: #3B82F6    /* Bleu BNRM officiel */
--blue-primary-dark: #2563EB /* Primaire sombre */
--blue-deep: #1D4ED8       /* Profond */
--blue-dark: #1E3A8A       /* Sombre */
```

**Usage Tailwind:**
- `bg-blue-primary`, `text-blue-primary`, `hover:bg-blue-soft`

### Famille Amber (Couleurs d'accent)
```css
--amber-surface: #FFFBE9   /* Surface */
--amber-light: #FEF3C7     /* Léger */
--amber-soft: #FCD34D      /* Doux */
--amber-primary: #F59E0B   /* Primaire */
--amber-primary-dark: #D97706 /* Primaire sombre */
--amber-deep: #B45309      /* Profond */
--amber-dark: #78350F      /* Sombre */
```

**Usage Tailwind:**
- `bg-amber-primary`, `text-amber-primary`, `border-amber-soft`

### Tokens Sémantiques

```css
--primary: var(--blue-primary)       /* Bleu BNRM officiel */
--secondary: var(--amber-light)      /* Amber pour la chaleur */
--accent: var(--amber-primary)       /* Accent amber */
--background: var(--slate-surface)   /* Fond principal */
--foreground: var(--slate-base-dark) /* Texte principal */
```

## Icônes Officielles

### Bibliothèque : Material Symbols
Les icônes BNRM proviennent de la bibliothèque **Material Symbols**.

### Directives d'utilisation

1. **Couleur interactive** : Utiliser `#3B82F6` (blue-primary) pour les icônes interactifs
2. **Taille cohérente** : Maintenir une taille uniforme dans une interface
3. **Espace de protection** : Respecter l'espace autour des icônes
4. **Pas de modification** : Éviter de modifier la forme ou la couleur

### Classes CSS disponibles

```html
<!-- Icône basique -->
<span class="material-symbols-outlined">search</span>

<!-- Icône interactive (bleu BNRM) -->
<span class="material-symbols-outlined icon-interactive">book</span>

<!-- Tailles disponibles -->
<span class="material-symbols-outlined icon-sm">menu</span>      <!-- 18px -->
<span class="material-symbols-outlined icon-md">home</span>      <!-- 24px défaut -->
<span class="material-symbols-outlined icon-lg">calendar</span>  <!-- 32px -->
<span class="material-symbols-outlined icon-xl">library</span>   <!-- 48px -->
```

### Icônes recommandées

- **Lecture** : `book`, `menu_book`, `auto_stories`
- **Recherche** : `search`, `manage_search`
- **Collections** : `library_books`, `collections_bookmark`
- **Événements** : `event`, `calendar_month`
- **Site web** : `language`, `public`, `web`

## Bonnes Pratiques

### Couleurs
- ✅ Utiliser les couleurs de la palette officielle
- ✅ Maintenir un contraste minimum de 4.5:1
- ✅ Utiliser `blue-primary` pour les interactions principales
- ❌ Ne pas modifier les couleurs du logo
- ❌ Ne pas utiliser de couleurs hors charte

### Typographie
- ✅ Georgia/Times New Roman pour le français
- ✅ Amiri pour l'arabe
- ✅ Maintenir l'équilibre visuel entre les langues
- ✅ Adapter la taille selon le support
- ❌ Ne pas utiliser de polices non autorisées
- ❌ Ne pas créer une hiérarchie confuse

### Icônes
- ✅ Material Symbols uniquement
- ✅ Couleur `blue-primary` pour les éléments interactifs
- ✅ Taille cohérente dans une interface
- ❌ Ne pas modifier la forme des icônes
- ❌ Ne pas mélanger différentes bibliothèques d'icônes

## Exemples d'utilisation

### Bouton primaire
```tsx
<button className="bg-blue-primary hover:bg-blue-primary-dark text-white font-french rounded-lg px-6 py-3">
  Rechercher
</button>
```

### Titre bilingue
```tsx
<h1 className="font-french text-4xl font-bold text-slate-base-dark">
  Bibliothèque Nationale
</h1>
<h1 className="font-arabic text-4xl font-bold text-slate-base-dark" dir="rtl">
  المكتبة الوطنية
</h1>
```

### Carte avec icône
```tsx
<div className="bg-slate-surface border border-slate-border rounded-lg p-6">
  <span className="material-symbols-outlined icon-interactive icon-lg">
    library_books
  </span>
  <h3 className="font-french text-xl font-semibold text-slate-base-dark mt-4">
    Collections
  </h3>
  <p className="font-french text-slate-text mt-2">
    Explorez nos collections de manuscrits et livres rares
  </p>
</div>
```

## Références

- Charte graphique officielle BNRM 2025
- Material Symbols: https://fonts.google.com/icons
- Tailwind CSS Documentation: https://tailwindcss.com
