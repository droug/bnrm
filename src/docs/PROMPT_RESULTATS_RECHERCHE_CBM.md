# 📚 PROMPT TECHNIQUE : Résultats de recherche avancée (CBM – BNRM)

## 🎯 Objectif

Concevoir l'interface de résultats de recherche avancée dans le portail BNRM, affichant les ouvrages correspondant aux critères de recherche avec leurs métadonnées UNIMARC, leur statut d'accès (numérisé, libre d'accès, consultation physique), et permettant l'accès direct ou la réservation selon le type de support.

---

## 🧭 1. Emplacement et navigation

| Paramètre | Valeur |
|-----------|--------|
| **Route** | `/cbm/recherche-avancee` |
| **Source de données** | Base CBM (métadonnées UNIMARC) + table `supports` |
| **Accès** | Public (lecture seule) |
| **Paramètres URL** | `?query=...&author=...&title=...&subject=...&dateFrom=...&dateTo=...&language=...&type=...&page=...` |

### Comportement de navigation

```typescript
// Si aucun paramètre de recherche
→ Afficher le formulaire de recherche avancée vide

// Si paramètres présents
→ Exécuter la recherche et afficher les résultats

// Si aucun résultat
→ Message "Aucun ouvrage ne correspond à vos critères"

// Si erreur de connexion
→ Message d'erreur avec bouton "Réessayer"
```

---

## 🧱 2. Structure de la page

### A. Fil d'Ariane (Breadcrumb)

```
Accueil > Catalogue CBM > Recherche avancée > Résultats (142 ouvrages)
```

- Utiliser le composant `<Breadcrumb />` de shadcn/ui
- Dernier élément en gras, non cliquable
- Afficher le nombre total de résultats

### B. En-tête de la page

```tsx
<header>
  <h1>Résultats de recherche</h1>
  <p className="text-muted-foreground">
    {totalResults} ouvrage(s) trouvé(s) pour "{searchQuery}"
  </p>
</header>
```

**Éléments affichés :**
- 📊 Nombre total de résultats
- 🔍 Critères de recherche appliqués (badges cliquables pour les retirer)
- 🔄 Bouton "Nouvelle recherche" (réinitialise tous les filtres)
- 📥 Bouton "Exporter les résultats" (CSV / PDF)

### C. Barre de filtres latérale (sidebar gauche)

**Filtres disponibles :**

| Filtre | Type | Source |
|--------|------|--------|
| **Type de document** | Checkbox multiple | `supports.type_document` |
| **Langue** | Checkbox multiple | UNIMARC zone 101 |
| **Date de publication** | Range slider | UNIMARC zone 210$d |
| **Statut d'accès** | Checkbox multiple | `supports.statut_acces` |
| **Disponibilité** | Checkbox | Calcul dynamique |
| **Auteur** | Autocomplete | UNIMARC zone 700 |
| **Collection** | Dropdown | UNIMARC zone 225 |

**Comportement :**
- Afficher le nombre de résultats par filtre : `Français (84)`
- Mise à jour dynamique des résultats sans rechargement de page
- Bouton "Réinitialiser les filtres"
- Filtres repliables (accordéon)

### D. Zone de résultats principale

#### 1. Barre d'outils des résultats

```tsx
<div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-4">
    <Select value={sortBy} onValueChange={setSortBy}>
      <SelectOption value="relevance">Pertinence</SelectOption>
      <SelectOption value="date-desc">Date (récent → ancien)</SelectOption>
      <SelectOption value="date-asc">Date (ancien → récent)</SelectOption>
      <SelectOption value="title-asc">Titre (A → Z)</SelectOption>
      <SelectOption value="author-asc">Auteur (A → Z)</SelectOption>
    </Select>
    
    <ToggleGroup value={viewMode} onValueChange={setViewMode}>
      <ToggleGroupItem value="grid"><Grid3x3 /></ToggleGroupItem>
      <ToggleGroupItem value="list"><List /></ToggleGroupItem>
    </ToggleGroup>
  </div>
  
  <div className="text-sm text-muted-foreground">
    Affichage {startIndex}–{endIndex} sur {totalResults}
  </div>
</div>
```

**Fonctionnalités :**
- 🔽 Tri : Pertinence, Date, Titre, Auteur
- 🎨 Mode d'affichage : Grille (cards) ou Liste (tableau)
- 📄 Pagination : 20 résultats par page (configurable)

#### 2. Carte de résultat (mode grille)

```tsx
<Card className="group hover:shadow-lg transition-all duration-200">
  <CardHeader>
    {/* Badge de statut */}
    <Badge variant={getAccessVariant(document.statut_acces)}>
      {document.statut_acces === "libre" && <Globe className="w-3 h-3" />}
      {document.statut_acces === "restreint" && <Lock className="w-3 h-3" />}
      {document.statut_acces === "consultation" && <Building className="w-3 h-3" />}
      {formatStatutAcces(document.statut_acces)}
    </Badge>
    
    {/* Miniature ou icône */}
    <div className="relative w-full aspect-[3/4] bg-muted rounded-md overflow-hidden">
      {document.thumbnail ? (
        <img src={document.thumbnail} alt={document.title} className="object-cover" />
      ) : (
        <div className="flex items-center justify-center h-full">
          <BookOpen className="w-12 h-12 text-muted-foreground/40" />
        </div>
      )}
    </div>
  </CardHeader>
  
  <CardContent>
    {/* Titre (cliquable vers notice détaillée) */}
    <h3 className="font-semibold text-lg line-clamp-2 mb-2">
      <Link to={`/cbn/notice/${document.id}`} className="hover:text-primary">
        {document.title}
      </Link>
    </h3>
    
    {/* Auteur(s) */}
    <p className="text-sm text-muted-foreground mb-2">
      {document.authors?.map((author, i) => (
        <span key={i}>
          <Link to={`/cbm/recherche-avancee?author=${author}`} className="hover:underline">
            {author}
          </Link>
          {i < document.authors.length - 1 && ", "}
        </span>
      ))}
    </p>
    
    {/* Informations complémentaires */}
    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        {document.publication_year}
      </span>
      <span className="flex items-center gap-1">
        <Globe className="w-3 h-3" />
        {document.language}
      </span>
      <span className="flex items-center gap-1">
        <FileText className="w-3 h-3" />
        {document.type_document}
      </span>
    </div>
    
    {/* Extrait de résumé (si disponible) */}
    {document.summary && (
      <p className="text-sm text-muted-foreground/80 line-clamp-2 mt-2">
        {highlightSearchTerms(document.summary, searchQuery)}
      </p>
    )}
  </CardContent>
  
  <CardFooter className="flex gap-2">
    {/* Bouton principal adaptatif */}
    {document.statut_acces === "libre" ? (
      <Button variant="secondary" className="flex-1" asChild>
        <a href={document.bn_link} target="_blank">
          <ExternalLink className="w-4 h-4" />
          Consulter en ligne
        </a>
      </Button>
    ) : (
      <Button 
        variant="default" 
        className="flex-1"
        onClick={() => handleReservation(document)}
      >
        <BookmarkPlus className="w-4 h-4" />
        Réserver
      </Button>
    )}
    
    {/* Bouton "Voir la notice" */}
    <Button variant="outline" size="icon" asChild>
      <Link to={`/cbn/notice/${document.id}`}>
        <Eye className="w-4 h-4" />
      </Link>
    </Button>
  </CardFooter>
</Card>
```

#### 3. Ligne de résultat (mode liste)

```tsx
<TableRow className="hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/cbn/notice/${document.id}`)}>
  <TableCell className="w-12">
    <Checkbox 
      checked={selectedDocs.includes(document.id)}
      onCheckedChange={(checked) => toggleSelection(document.id, checked)}
    />
  </TableCell>
  
  <TableCell className="w-16">
    {document.thumbnail ? (
      <img src={document.thumbnail} alt="" className="w-12 h-16 object-cover rounded" />
    ) : (
      <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
        <BookOpen className="w-6 h-6 text-muted-foreground/40" />
      </div>
    )}
  </TableCell>
  
  <TableCell>
    <div className="font-medium">{document.title}</div>
    <div className="text-sm text-muted-foreground">{document.authors?.join(", ")}</div>
  </TableCell>
  
  <TableCell className="text-center">{document.publication_year}</TableCell>
  
  <TableCell>
    <Badge variant={getAccessVariant(document.statut_acces)}>
      {formatStatutAcces(document.statut_acces)}
    </Badge>
  </TableCell>
  
  <TableCell className="text-center">{document.language}</TableCell>
  
  <TableCell className="text-right">
    <div className="flex gap-2 justify-end">
      {document.statut_acces === "libre" ? (
        <Button variant="ghost" size="sm" asChild>
          <a href={document.bn_link} target="_blank">
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      ) : (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleReservation(document);
          }}
        >
          <BookmarkPlus className="w-4 h-4" />
        </Button>
      )}
    </div>
  </TableCell>
</TableRow>
```

### E. Pagination

```tsx
<div className="flex items-center justify-between mt-8">
  <div className="text-sm text-muted-foreground">
    Page {currentPage} sur {totalPages}
  </div>
  
  <Pagination>
    <PaginationContent>
      <PaginationItem>
        <PaginationPrevious 
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        />
      </PaginationItem>
      
      {pageNumbers.map((pageNum) => (
        <PaginationItem key={pageNum}>
          <PaginationLink
            onClick={() => goToPage(pageNum)}
            isActive={pageNum === currentPage}
          >
            {pageNum}
          </PaginationLink>
        </PaginationItem>
      ))}
      
      <PaginationItem>
        <PaginationNext 
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
      </PaginationItem>
    </PaginationContent>
  </Pagination>
  
  <Select value={resultsPerPage} onValueChange={setResultsPerPage}>
    <SelectTrigger className="w-32">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="10">10 / page</SelectItem>
      <SelectItem value="20">20 / page</SelectItem>
      <SelectItem value="50">50 / page</SelectItem>
      <SelectItem value="100">100 / page</SelectItem>
    </SelectContent>
  </Select>
</div>
```

---

## 🧠 3. Logique de comportement adaptatif

### A. Gestion du bouton "Consulter / Réserver"

```typescript
function getActionButton(document: SearchResultDocument) {
  const { statut_acces, bn_link, is_digitized, allow_physical_consultation } = document;
  
  // CAS 1 : Libre accès → Lien direct vers BN
  if (statut_acces === "libre" && bn_link) {
    return {
      label: "Consulter en ligne",
      icon: <ExternalLink />,
      variant: "secondary",
      action: () => window.open(bn_link, "_blank")
    };
  }
  
  // CAS 2 : Numérisé (accès restreint) → Réservation BN
  if (is_digitized && statut_acces === "restreint") {
    return {
      label: "Réserver",
      icon: <BookmarkPlus />,
      variant: "default",
      action: () => openReservationModal(document, "bn_numerique")
    };
  }
  
  // CAS 3 : Non numérisé → Réservation physique
  if (!is_digitized && allow_physical_consultation) {
    return {
      label: "Réserver",
      icon: <BookmarkPlus />,
      variant: "default",
      action: () => openReservationModal(document, "responsable_support")
    };
  }
  
  // CAS 4 : Consultation sur place uniquement
  if (!is_digitized && !allow_physical_consultation) {
    return {
      label: "Sur place uniquement",
      icon: <Building />,
      variant: "outline",
      action: () => showInfoToast("Cet ouvrage est consultable uniquement sur place à la BNRM")
    };
  }
}
```

### B. Ouverture de la modale de réservation

```typescript
function handleReservation(document: SearchResultDocument) {
  const user = getCurrentUser();
  
  // Vérifier si utilisateur connecté
  if (!user) {
    // Formulaire simplifié (nom, email, téléphone, motif)
    openReservationModal({
      document,
      formType: "guest",
      destination: document.is_digitized ? "bn_numerique" : "responsable_support"
    });
    return;
  }
  
  // Vérifier si adhérent
  if (user.is_member) {
    // Formulaire complet (avec type d'adhésion, date souhaitée)
    openReservationModal({
      document,
      formType: "member",
      destination: document.is_digitized ? "bn_numerique" : "responsable_support",
      userData: {
        name: user.full_name,
        email: user.email,
        phone: user.phone,
        membership_type: user.membership_type,
        membership_number: user.membership_number
      }
    });
  } else {
    // Formulaire simplifié (utilisateur connecté mais non adhérent)
    openReservationModal({
      document,
      formType: "registered",
      destination: document.is_digitized ? "bn_numerique" : "responsable_support",
      userData: {
        name: user.full_name,
        email: user.email,
        phone: user.phone
      }
    });
  }
}
```

---

## 📊 4. Sources de données et structure

### A. Table `cbm_notices` (métadonnées UNIMARC)

```sql
SELECT 
  id,
  title,
  authors,
  publication_year,
  publisher,
  language,
  isbn,
  issn,
  cote,
  summary,
  keywords,
  collection,
  type_document,
  physical_description,
  thumbnail_url,
  created_at,
  updated_at
FROM cbm_notices
WHERE 
  (title ILIKE '%' || :query || '%' OR
   authors @> ARRAY[:query] OR
   keywords @> ARRAY[:query])
  AND (:author IS NULL OR :author = ANY(authors))
  AND (:language IS NULL OR language = :language)
  AND (:dateFrom IS NULL OR publication_year >= :dateFrom)
  AND (:dateTo IS NULL OR publication_year <= :dateTo)
ORDER BY 
  CASE 
    WHEN :sortBy = 'relevance' THEN ts_rank(search_vector, plainto_tsquery(:query))
    WHEN :sortBy = 'date-desc' THEN publication_year
    WHEN :sortBy = 'date-asc' THEN -publication_year
    WHEN :sortBy = 'title-asc' THEN title
    WHEN :sortBy = 'author-asc' THEN authors[1]
  END
LIMIT :limit OFFSET :offset;
```

### B. Table `supports` (statut des supports)

```sql
SELECT 
  support_id,
  type_document,
  is_digitized,
  statut_acces, -- 'libre', 'restreint', 'consultation'
  allow_physical_consultation,
  bn_link,
  physical_location,
  consultation_notes
FROM supports
WHERE notice_id = :noticeId;
```

### C. Interface TypeScript

```typescript
interface SearchResultDocument {
  // Identifiants
  id: string;
  notice_id: string;
  support_id: string;
  
  // Métadonnées bibliographiques
  title: string;
  authors: string[];
  publication_year: number;
  publisher: string;
  language: string;
  isbn?: string;
  issn?: string;
  cote: string;
  
  // Description
  summary?: string;
  keywords: string[];
  collection?: string;
  type_document: string; // "Livre", "Manuscrit", "Périodique", etc.
  physical_description?: string;
  
  // Accès et disponibilité
  is_digitized: boolean;
  statut_acces: "libre" | "restreint" | "consultation";
  allow_physical_consultation: boolean;
  bn_link?: string; // Lien vers la Bibliothèque Numérique
  physical_location?: string;
  
  // Médias
  thumbnail_url?: string;
  
  // Métadonnées système
  created_at: Date;
  updated_at: Date;
}

interface SearchFilters {
  query?: string;
  author?: string;
  title?: string;
  subject?: string;
  dateFrom?: number;
  dateTo?: number;
  language?: string;
  type?: string;
  statutAcces?: string[];
  disponible?: boolean;
  collection?: string;
}

interface SearchParams {
  filters: SearchFilters;
  sortBy: "relevance" | "date-desc" | "date-asc" | "title-asc" | "author-asc";
  page: number;
  resultsPerPage: number;
}
```

---

## 🎨 5. UX/UI et composants Lovable

### A. Palette de couleurs (design system BNRM)

```css
/* index.css */
:root {
  /* Couleurs principales */
  --primary: 35 65% 49%;        /* Doré BNRM #C6A760 */
  --primary-foreground: 0 0% 100%;
  
  --secondary: 30 8% 33%;       /* Gris foncé #555 */
  --secondary-foreground: 0 0% 100%;
  
  --accent: 40 80% 90%;         /* Beige clair */
  --accent-foreground: 30 8% 33%;
  
  --muted: 40 15% 97%;          /* Blanc cassé #F8F7F2 */
  --muted-foreground: 30 8% 45%;
  
  /* Statuts d'accès */
  --success: 142 76% 36%;       /* Vert (libre accès) */
  --warning: 38 92% 50%;        /* Orange (restreint) */
  --destructive: 0 84% 60%;     /* Rouge (consultation) */
}
```

### B. Composants shadcn/ui utilisés

| Composant | Usage |
|-----------|-------|
| `<Card />` | Carte de résultat (mode grille) |
| `<Table />` | Liste de résultats (mode liste) |
| `<Badge />` | Statut d'accès, type de document, langue |
| `<Button />` | Actions (consulter, réserver, voir notice) |
| `<Select />` | Tri, résultats par page, filtres |
| `<Checkbox />` | Sélection multiple, filtres |
| `<Accordion />` | Filtres repliables |
| `<Sheet />` | Modale de réservation |
| `<Pagination />` | Navigation entre les pages |
| `<ScrollArea />` | Zone de résultats scrollable |
| `<Breadcrumb />` | Fil d'Ariane |
| `<ToggleGroup />` | Basculer entre grille et liste |
| `<Separator />` | Séparateur visuel |

### C. Variants des badges de statut

```typescript
function getAccessVariant(statut: string): "default" | "secondary" | "destructive" {
  switch (statut) {
    case "libre":
      return "default"; // Vert
    case "restreint":
      return "secondary"; // Orange
    case "consultation":
      return "destructive"; // Rouge
    default:
      return "secondary";
  }
}

function formatStatutAcces(statut: string): string {
  const labels = {
    libre: "Libre accès",
    restreint: "Accès restreint",
    consultation: "Consultation physique"
  };
  return labels[statut] || statut;
}
```

### D. Responsive design

```tsx
// Desktop : Sidebar + Résultats en grille (3 colonnes)
<div className="grid grid-cols-[280px_1fr] gap-6">
  <aside className="hidden lg:block">
    {/* Filtres */}
  </aside>
  <main>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {results.map(doc => <ResultCard key={doc.id} document={doc} />)}
    </div>
  </main>
</div>

// Mobile : Filtres dans un Sheet, résultats en 1 colonne
<div className="space-y-4">
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline" className="w-full lg:hidden">
        <Filter className="w-4 h-4 mr-2" />
        Filtres ({activeFiltersCount})
      </Button>
    </SheetTrigger>
    <SheetContent side="left">
      {/* Filtres */}
    </SheetContent>
  </Sheet>
  
  <div className="grid grid-cols-1 gap-4">
    {results.map(doc => <ResultCard key={doc.id} document={doc} />)}
  </div>
</div>
```

---

## 🔍 6. Fonctionnalités avancées

### A. Mise en évidence des termes recherchés

```typescript
function highlightSearchTerms(text: string, query: string): JSX.Element {
  if (!query || !text) return <>{text}</>;
  
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-primary/20 text-foreground font-medium">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
```

### B. Sélection multiple et actions groupées

```tsx
<div className="flex items-center gap-2 mb-4">
  <Checkbox 
    checked={selectedAll}
    onCheckedChange={toggleSelectAll}
  />
  <span className="text-sm text-muted-foreground">
    {selectedDocs.length} document(s) sélectionné(s)
  </span>
  
  {selectedDocs.length > 0 && (
    <>
      <Separator orientation="vertical" className="h-6" />
      <Button variant="outline" size="sm" onClick={exportSelected}>
        <Download className="w-4 h-4 mr-2" />
        Exporter la sélection
      </Button>
      <Button variant="outline" size="sm" onClick={clearSelection}>
        <X className="w-4 h-4 mr-2" />
        Désélectionner
      </Button>
    </>
  )}
</div>
```

### C. Export des résultats (CSV / PDF)

```typescript
async function exportResults(format: "csv" | "pdf") {
  const { exportToCSV, exportToPDF } = useAdvancedSearch();
  
  try {
    if (format === "csv") {
      await exportToCSV();
      toast.success("Export CSV généré avec succès");
    } else {
      await exportToPDF();
      toast.success("Export PDF généré avec succès");
    }
  } catch (error) {
    toast.error("Erreur lors de l'export");
    console.error(error);
  }
}
```

### D. Sauvegarde de recherche (utilisateurs connectés)

```tsx
{user && (
  <Button 
    variant="outline" 
    size="sm"
    onClick={() => saveSearch(searchParams)}
  >
    <Bookmark className="w-4 h-4 mr-2" />
    Sauvegarder cette recherche
  </Button>
)}
```

---

## 🔐 7. Sécurité et Row-Level Security (RLS)

### A. Politiques RLS sur `cbm_notices`

```sql
-- Lecture publique des notices
CREATE POLICY "Notices CBM lisibles par tous"
ON cbm_notices FOR SELECT
USING (true);

-- Seuls les administrateurs peuvent modifier
CREATE POLICY "Seuls les admins peuvent modifier les notices"
ON cbm_notices FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');
```

### B. Politiques RLS sur `supports`

```sql
-- Lecture publique des supports
CREATE POLICY "Supports lisibles par tous"
ON supports FOR SELECT
USING (true);

-- Logs des réservations (seulement pour l'utilisateur concerné)
CREATE POLICY "Un utilisateur ne voit que ses réservations"
ON reservations_ouvrages FOR SELECT
USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');
```

### C. Validation des entrées utilisateur

```typescript
import { z } from "zod";

const searchParamsSchema = z.object({
  query: z.string().max(200).optional(),
  author: z.string().max(100).optional(),
  title: z.string().max(200).optional(),
  subject: z.string().max(100).optional(),
  dateFrom: z.number().min(1000).max(2100).optional(),
  dateTo: z.number().min(1000).max(2100).optional(),
  language: z.string().length(2).optional(), // Code ISO 639-1
  type: z.enum(["Livre", "Manuscrit", "Périodique", "Carte", "Audiovisuel"]).optional(),
  page: z.number().min(1).default(1),
  resultsPerPage: z.number().min(10).max(100).default(20)
});

type SearchParams = z.infer<typeof searchParamsSchema>;
```

---

## ♿ 8. Accessibilité (WCAG 2.1 AA)

### Checklist d'accessibilité

- [x] Navigation au clavier (Tab, Enter, Espace)
- [x] Support des lecteurs d'écran (ARIA labels)
- [x] Contraste suffisant (ratio 4.5:1 minimum)
- [x] Taille de texte ajustable (rem/em)
- [x] Indicateurs de focus visibles
- [x] Support RTL pour l'arabe
- [x] Alternatives textuelles pour les images
- [x] États des boutons annoncés (loading, disabled)

### Exemple de composant accessible

```tsx
<Card
  role="article"
  aria-labelledby={`doc-title-${document.id}`}
  aria-describedby={`doc-desc-${document.id}`}
>
  <CardHeader>
    <h3 id={`doc-title-${document.id}`}>
      {document.title}
    </h3>
    <p id={`doc-desc-${document.id}`} className="sr-only">
      {`${document.type_document} de ${document.authors?.join(", ")}, publié en ${document.publication_year}`}
    </p>
  </CardHeader>
  
  <CardFooter>
    <Button
      aria-label={`Réserver le document ${document.title}`}
      onClick={() => handleReservation(document)}
    >
      <BookmarkPlus aria-hidden="true" />
      Réserver
    </Button>
  </CardFooter>
</Card>
```

---

## 📱 9. Performance et optimisation

### A. Lazy loading des résultats

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useInfiniteQuery({
  queryKey: ["search-results", searchParams],
  queryFn: ({ pageParam = 1 }) => fetchResults(searchParams, pageParam),
  getNextPageParam: (lastPage, pages) => 
    lastPage.hasMore ? pages.length + 1 : undefined
});

// Scroll infini
useEffect(() => {
  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  };
  
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [hasNextPage, isFetchingNextPage, fetchNextPage]);
```

### B. Cache des résultats (React Query)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false
    }
  }
});
```

### C. Debounce sur les filtres

```typescript
import { useDebouncedCallback } from "use-debounce";

const debouncedSearch = useDebouncedCallback(
  (filters: SearchFilters) => {
    performSearch(filters);
  },
  500 // 500ms de délai
);

// Usage
<Input
  value={query}
  onChange={(e) => {
    setQuery(e.target.value);
    debouncedSearch({ ...filters, query: e.target.value });
  }}
/>
```

---

## 🧪 10. États et gestion d'erreurs

### A. États de chargement

```tsx
{isLoading && (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {Array.from({ length: 12 }).map((_, i) => (
      <Card key={i} className="animate-pulse">
        <CardHeader>
          <div className="w-full aspect-[3/4] bg-muted rounded-md" />
        </CardHeader>
        <CardContent>
          <div className="h-6 bg-muted rounded mb-2" />
          <div className="h-4 bg-muted rounded w-2/3 mb-2" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </CardContent>
      </Card>
    ))}
  </div>
)}
```

### B. Aucun résultat

```tsx
{!isLoading && results.length === 0 && (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <SearchX className="w-16 h-16 text-muted-foreground/40 mb-4" />
    <h3 className="text-xl font-semibold mb-2">
      Aucun résultat trouvé
    </h3>
    <p className="text-muted-foreground mb-6 max-w-md">
      Aucun ouvrage ne correspond à vos critères de recherche.
      Essayez de modifier vos filtres ou votre requête.
    </p>
    <Button variant="outline" onClick={resetFilters}>
      <RotateCcw className="w-4 h-4 mr-2" />
      Réinitialiser les filtres
    </Button>
  </div>
)}
```

### C. Erreurs réseau

```tsx
{isError && (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <AlertCircle className="w-16 h-16 text-destructive mb-4" />
    <h3 className="text-xl font-semibold mb-2">
      Erreur de chargement
    </h3>
    <p className="text-muted-foreground mb-6 max-w-md">
      Une erreur s'est produite lors du chargement des résultats.
      Veuillez réessayer.
    </p>
    <Button onClick={() => refetch()}>
      <RefreshCw className="w-4 h-4 mr-2" />
      Réessayer
    </Button>
  </div>
)}
```

---

## 🌐 11. SEO et métadonnées

### A. Balises meta dynamiques

```tsx
import { Helmet } from "react-helmet";

<Helmet>
  <title>
    {totalResults > 0 
      ? `${totalResults} résultats pour "${searchQuery}" - Recherche CBM - BNRM`
      : "Recherche avancée - Catalogue CBM - BNRM"
    }
  </title>
  <meta 
    name="description" 
    content={`Résultats de recherche dans le catalogue CBM de la Bibliothèque Nationale du Royaume du Maroc. ${totalResults} ouvrage(s) trouvé(s).`}
  />
  <meta name="robots" content="index, follow" />
  
  {/* Open Graph */}
  <meta property="og:title" content={`Recherche CBM - ${totalResults} résultats`} />
  <meta property="og:description" content={`Découvrez ${totalResults} ouvrages dans le catalogue CBM.`} />
  <meta property="og:type" content="website" />
  
  {/* Structured Data */}
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SearchResultsPage",
      "name": "Résultats de recherche CBM",
      "description": `${totalResults} résultats pour "${searchQuery}"`,
      "url": window.location.href,
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": totalResults,
        "itemListElement": results.slice(0, 10).map((doc, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "item": {
            "@type": "Book",
            "name": doc.title,
            "author": doc.authors?.join(", "),
            "datePublished": doc.publication_year,
            "isbn": doc.isbn
          }
        }))
      }
    })}
  </script>
</Helmet>
```

---

## 📦 12. Dépendances et APIs

### A. Hooks personnalisés requis

| Hook | Fichier | Responsabilité |
|------|---------|----------------|
| `useAdvancedSearch` | `src/hooks/useAdvancedSearch.tsx` | Recherche, filtres, pagination, export |
| `useReservation` | `src/hooks/useReservation.tsx` | Gestion des réservations |
| `useAuth` | `src/hooks/useAuth.tsx` | État de connexion utilisateur |
| `useDebounce` | `src/hooks/useDebounce.tsx` | Debounce des inputs |

### B. API Endpoints (Supabase)

```typescript
// GET /cbm_notices?query=...&author=...&page=...
// Récupère les notices correspondant aux critères

// GET /supports?notice_id=...
// Récupère le statut d'accès d'un support

// POST /reservations_ouvrages
// Crée une nouvelle réservation

// GET /users/me
// Récupère le profil utilisateur (si connecté)
```

### C. Queries React Query

```typescript
// Recherche principale
const { data: results, isLoading } = useQuery({
  queryKey: ["search", searchParams],
  queryFn: () => searchCBM(searchParams)
});

// Facettes (filtres)
const { data: facets } = useQuery({
  queryKey: ["search-facets"],
  queryFn: fetchSearchFacets
});

// Réservations utilisateur
const { data: userReservations } = useQuery({
  queryKey: ["user-reservations", user?.id],
  queryFn: () => fetchUserReservations(user?.id),
  enabled: !!user
});
```

---

## ✅ 13. Checklist d'implémentation

### Phase 1 : Structure de base
- [ ] Créer le composant `AdvancedSearchResults.tsx`
- [ ] Implémenter le layout responsive (sidebar + main)
- [ ] Ajouter le breadcrumb de navigation
- [ ] Créer les composants `ResultCard` et `ResultRow`

### Phase 2 : Filtres et tri
- [ ] Implémenter la sidebar de filtres (accordéon)
- [ ] Ajouter le tri (pertinence, date, titre, auteur)
- [ ] Implémenter le toggle grille/liste
- [ ] Gérer la persistance des filtres dans l'URL

### Phase 3 : Logique de recherche
- [ ] Adapter `useAdvancedSearch` pour les résultats
- [ ] Implémenter la pagination
- [ ] Ajouter le debounce sur les filtres
- [ ] Gérer le cache avec React Query

### Phase 4 : Actions sur les résultats
- [ ] Implémenter le bouton adaptatif (Consulter / Réserver)
- [ ] Connecter la modale de réservation
- [ ] Ajouter la mise en évidence des termes recherchés
- [ ] Implémenter la sélection multiple

### Phase 5 : Export et fonctionnalités avancées
- [ ] Ajouter l'export CSV/PDF
- [ ] Implémenter la sauvegarde de recherche (si connecté)
- [ ] Ajouter les suggestions de recherche
- [ ] Implémenter le scroll infini (optionnel)

### Phase 6 : États et erreurs
- [ ] Ajouter les skeletons de chargement
- [ ] Gérer l'état "aucun résultat"
- [ ] Gérer les erreurs réseau
- [ ] Ajouter les toasts de feedback

### Phase 7 : Accessibilité et SEO
- [ ] Vérifier la navigation clavier
- [ ] Ajouter les ARIA labels
- [ ] Implémenter le support RTL
- [ ] Ajouter les métadonnées SEO dynamiques
- [ ] Tester avec un lecteur d'écran

### Phase 8 : Tests et optimisation
- [ ] Tester sur mobile/tablette/desktop
- [ ] Optimiser les performances (lazy loading, cache)
- [ ] Vérifier les contrastes de couleurs (WCAG)
- [ ] Tester avec différents volumes de résultats (0, 10, 100+)

---

## 📋 14. Résumé exécutif

### Objectif principal
Créer une interface de résultats de recherche avancée pour le catalogue CBM, permettant aux utilisateurs de :
1. **Consulter** les ouvrages trouvés avec leurs métadonnées complètes
2. **Filtrer** et **trier** les résultats selon différents critères
3. **Accéder directement** aux ouvrages en libre accès via la Bibliothèque Numérique
4. **Réserver** les ouvrages restreints ou non numérisés via une modale adaptative

### Comportement adaptatif clé

| Statut du document | Action principale | Destination |
|--------------------|-------------------|-------------|
| 🟢 Libre accès | "Consulter en ligne" (lien direct) | Bibliothèque Numérique |
| 🟠 Numérisé (restreint) | "Réserver" (modale) | Bibliothèque Numérique |
| 🔴 Non numérisé | "Réserver" (modale) | Responsable Support |
| ⚪ Consultation physique uniquement | "Sur place uniquement" (info) | BNRM |

### Technologies utilisées
- **Frontend** : React, TypeScript, Tailwind CSS
- **UI** : shadcn/ui (Card, Table, Badge, Button, Sheet, Pagination)
- **State** : React Query (cache, pagination)
- **Backend** : Supabase (PostgreSQL, RLS)
- **Search** : PostgreSQL Full-Text Search (tsvector)

### Points d'attention
1. **Performance** : Lazy loading, cache, debounce sur les filtres
2. **Accessibilité** : WCAG 2.1 AA, support RTL, navigation clavier
3. **SEO** : Métadonnées dynamiques, structured data
4. **UX** : Feedback immédiat, états de chargement, gestion d'erreurs

---

**Version** : 1.0  
**Date** : 2025-10-26  
**Auteur** : Lovable AI  
**Projet** : Portail BNRM - Interface de résultats de recherche CBM
