# 📘 Interface "Fiche d'Ouvrage / Notice détaillée (CBN – BNRM)"

**Version** : 2.0  
**Dernière mise à jour** : 26 octobre 2025  
**Statut** : Spécification technique complète

---

## 🎯 Objectif

Concevoir la **fiche détaillée d'un ouvrage** dans le portail BNRM, affichant :
- Les informations bibliographiques complètes (métadonnées UNIMARC)
- Le statut du support (numérisé, non numérisé, libre d'accès)
- Le bouton **"Réserver un Ouvrage"** avec comportement adaptatif
- L'intégration avec la modale de réservation
- L'historique des réservations de l'utilisateur

---

## 🧭 1. Emplacement et navigation

### Route
```
/cbm/notice/:id
```

### Source de données
- **Base CBM** : métadonnées UNIMARC (catalogue bibliographique)
- **Table Supabase** : `cbn_documents`

### Accès
- **Public** : lecture seule pour les informations générales
- **Authentifié** : accès à l'historique et réservation

### Comportements de navigation

| Cas | Action |
|-----|--------|
| `id` invalide | Afficher page "Notice introuvable" (404) |
| Ouvrage supprimé | Message : "Ce document n'est plus accessible" |
| Ouvrage restreint | Message : "Accès contrôlé - Contactez l'administration" |
| Retour utilisateur | Breadcrumb : Accueil > Recherche > Notice |

### Fil d'Ariane (Breadcrumb)
```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/cbm/recherche">Recherche CBM</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>{document.title}</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

---

## 🧱 2. Structure de la page

### Layout général
```
┌─────────────────────────────────────────────────────┐
│  BREADCRUMB                                         │
├─────────────────────────┬───────────────────────────┤
│                         │                           │
│  CONTENU PRINCIPAL      │  SIDEBAR (droite)         │
│  (70%)                  │  (30%)                    │
│                         │                           │
│  • En-tête notice       │  • Disponibilité & Accès  │
│  • Résumé               │  • Bouton de réservation  │
│  • Description          │  • Statut du support      │
│  • Détails biblio       │  • Historique utilisateur │
│  • Documents liés       │                           │
│                         │                           │
└─────────────────────────┴───────────────────────────┘
```

### A. En-tête de la notice (Header)

| Élément | Description | Exemple |
|---------|-------------|---------|
| 📘 **Titre complet** | Majuscules, FR + AR si disponible | LA PENSÉE ANDALOUSE / الفكر الأندلسي |
| ✍️ **Auteur(s)** | Liste cliquable (→ recherche auteur) | Ibn Rushd, Averroès |
| 🏢 **Éditeur / Lieu / Année** | Ligne compacte | Dar Al-Fikr, Beyrouth, 1998 |
| 🏷 **Identifiants** | ISBN / ISSN / Cote / ID interne | ISBN: 978-9953-123-45-6 / Cote: 1B.305 |
| 📂 **Type / Support / Langue** | Icônes + badges | 📖 Livre • Arabe • 342 pages |
| 🟢 **Statut d'accès** | Badge coloré dynamique | 🟢 Libre accès / 🟠 Restreint / 🔴 Physique |

#### Exemple de code (Header)
```tsx
<Card className="mb-6">
  <CardHeader>
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <CardTitle className="text-3xl font-bold mb-2">
          {document.title}
        </CardTitle>
        {document.titleAr && (
          <CardTitle className="text-2xl font-bold mb-4" dir="rtl">
            {document.titleAr}
          </CardTitle>
        )}
        
        <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <Link to={`/cbm/recherche?author=${document.author}`}>
              {document.author}
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            {document.publisher}, {document.place}, {document.year}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline">
            <Book className="w-3 h-3 mr-1" />
            {document.documentType}
          </Badge>
          <Badge variant="outline">
            <Globe className="w-3 h-3 mr-1" />
            {document.language}
          </Badge>
          <Badge variant="outline">
            <FileText className="w-3 h-3 mr-1" />
            {document.pages} pages
          </Badge>
        </div>
        
        <div className="flex gap-2">
          {getAccessStatusBadge(document.accessStatus)}
        </div>
      </div>
    </div>
  </CardHeader>
</Card>
```

### B. Bloc "Résumé et description"

| Élément | Contenu | Source UNIMARC |
|---------|---------|----------------|
| 🧾 **Résumé / Note** | Extrait 250-400 caractères | Zone 330 |
| 📚 **Sommaire** | Liste à puces (si disponible) | Zone 327 |
| 🗂 **Indexation thématique** | Mots-clés cliquables (vedettes) | Zone 606 |
| 🧭 **Collection / Série** | Titre + lien recherche | Zone 225 |

#### Exemple de code (Résumé)
```tsx
<Card className="mb-6">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <FileText className="w-5 h-5" />
      Résumé
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground leading-relaxed">
      {document.summary}
    </p>
    
    {document.tableOfContents && (
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Sommaire</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {document.tableOfContents.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    )}
    
    <div className="mt-4">
      <h4 className="font-semibold mb-2">Mots-clés</h4>
      <div className="flex flex-wrap gap-2">
        {document.keywords.map((keyword, i) => (
          <Badge 
            key={i} 
            variant="secondary"
            className="cursor-pointer hover:bg-primary/20"
            onClick={() => navigate(`/cbm/recherche?keyword=${keyword}`)}
          >
            {keyword}
          </Badge>
        ))}
      </div>
    </div>
  </CardContent>
</Card>
```

### C. Bloc "Détails bibliographiques" (Accordéon)

Champs issus des **zones UNIMARC** :

| Zone | Champ | Description |
|------|-------|-------------|
| 100 | Auteur principal | Nom normalisé de l'auteur |
| 210 | Publication | Éditeur, lieu, date |
| 215 | Description matérielle | Pages, illustrations, dimensions |
| 300 | Notes générales | Informations complémentaires |
| 330 | Résumé | Note de contenu |
| 606 | Indexation matière | Vedettes-matière |
| 700 | Auteurs secondaires | Contributeurs |
| 801 | Origine de la notice | Source de catalogage |
| 995 | Exemplaires | Cote et localisation physique |

#### Exemple de code (Accordéon)
```tsx
<Accordion type="single" collapsible className="mb-6">
  <AccordionItem value="biblio">
    <AccordionTrigger className="text-lg font-semibold">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        Détails bibliographiques complets
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1">
            ISBN
          </h4>
          <p>{document.isbn || 'Non disponible'}</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1">
            Cote
          </h4>
          <p>{document.cote}</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1">
            Format
          </h4>
          <p>{document.physicalDescription}</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1">
            Collection
          </h4>
          <p>{document.collection || 'Aucune'}</p>
        </div>
        
        {document.contributors && document.contributors.length > 0 && (
          <div className="col-span-2">
            <h4 className="font-semibold text-sm text-muted-foreground mb-1">
              Contributeurs
            </h4>
            <p>{document.contributors.join(', ')}</p>
          </div>
        )}
      </div>
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### D. Bloc "Disponibilité et accès" (Sidebar)

| Élément | Description / Règle |
|---------|---------------------|
| **Type de support** | Auto-complétion : Manuscrit, Livre, Périodique, etc. |
| **Statut du support** | 🟢 Libre accès / 🟠 Numérisé (restreint) / 🔴 Non numérisé |
| **Consultation physique autorisée ?** | Oui / Non (dépend de la fiche support) |
| **Lien consultation** | Si libre → Bouton "Consulter en ligne sur la BN" |
| **Disponibilité physique** | Si non numérisé → "Disponible en salle BNRM" |

#### Logique d'affichage

```tsx
// Si libre d'accès → Pas de bouton réservation, seulement lien BN
if (document.isFreeAccess) {
  return (
    <Button variant="secondary" onClick={() => window.open(document.bnLink)}>
      <ExternalLink className="w-4 h-4 mr-2" />
      Consulter en ligne sur la BN
    </Button>
  );
}

// Si restreint ou non numérisé → Bouton "Réserver"
return (
  <Button 
    variant="default" 
    onClick={() => setReservationModalOpen(true)}
  >
    <Calendar className="w-4 h-4 mr-2" />
    Réserver un Ouvrage
  </Button>
);
```

---

## 🧠 3. Bouton "Réserver un Ouvrage" - Comportement adaptatif

### Tableau de décision

| Statut du document | Numérisé ? | Consultation physique demandée ? | Action |
|-------------------|------------|----------------------------------|--------|
| 🟢 Libre accès | Oui | N/A | **Bouton remplacé** par "Consulter en ligne" (lien BN) |
| 🟠 Numérisé (restreint) | Oui | Non | **Bouton actif** → Modale → Routage vers BN Numérique |
| 🟠 Numérisé (restreint) | Oui | Oui | Vérifier `allowPhysical` → Si non autorisé, **message bloquant** |
| 🔴 Non numérisé | Non | Oui (obligatoire) | **Bouton actif** → Modale → Routage vers Responsable Support |

### Interface TypeScript

```tsx
interface DocumentInfo {
  id: string;
  title: string;
  titleAr?: string;
  author: string;
  cote: string;
  
  // Statut du support
  isFreeAccess: boolean;         // Libre accès (pas de réservation)
  isDigitized: boolean;          // Numérisé ou non
  allowPhysical: boolean;        // Autorisation consultation physique
  
  // Liens
  bnLink?: string;               // Lien Bibliothèque Numérique
  
  // Métadonnées
  publisher: string;
  place: string;
  year: string;
  isbn?: string;
  language: string;
  pages?: number;
  summary?: string;
  keywords: string[];
  collection?: string;
  contributors?: string[];
}
```

### Logique de routage (fonction déterministe)

```tsx
/**
 * Détermine le routage de la demande de réservation
 * selon le statut du document et le type de consultation
 */
function determineReservationRouting(
  document: DocumentInfo,
  requestPhysical: boolean
): {
  destination: 'bn_numerique' | 'responsable_support' | 'blocked';
  message: string;
} {
  // Cas 1 : Document en libre accès
  if (document.isFreeAccess) {
    return {
      destination: 'blocked',
      message: 'Ce document est en libre accès. Consultez-le directement sur la Bibliothèque Numérique.'
    };
  }
  
  // Cas 2 : Document numérisé
  if (document.isDigitized) {
    // Cas 2a : Consultation numérique demandée
    if (!requestPhysical) {
      return {
        destination: 'bn_numerique',
        message: 'Votre demande sera traitée par la Bibliothèque Numérique.'
      };
    }
    
    // Cas 2b : Consultation physique demandée
    if (requestPhysical) {
      if (!document.allowPhysical) {
        return {
          destination: 'blocked',
          message: 'Cet ouvrage est exclusivement consultable en ligne.'
        };
      }
      return {
        destination: 'responsable_support',
        message: 'Votre demande sera traitée par le Responsable Support.'
      };
    }
  }
  
  // Cas 3 : Document non numérisé (consultation physique obligatoire)
  if (!document.isDigitized) {
    return {
      destination: 'responsable_support',
      message: 'Votre demande sera traitée par le Responsable Support pour consultation sur place.'
    };
  }
  
  // Fallback
  return {
    destination: 'blocked',
    message: 'Une erreur est survenue. Veuillez contacter l\'administration.'
  };
}
```

### Exemple d'implémentation du bouton

```tsx
function ReservationButton({ document, user }: { 
  document: DocumentInfo; 
  user?: User;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  
  // Cas 1 : Document en libre accès
  if (document.isFreeAccess) {
    return (
      <Button 
        variant="secondary" 
        size="lg"
        onClick={() => window.open(document.bnLink, '_blank')}
        className="w-full"
      >
        <ExternalLink className="w-5 h-5 mr-2" />
        Consulter en ligne sur la Bibliothèque Numérique
      </Button>
    );
  }
  
  // Cas 2 & 3 : Réservation requise
  return (
    <>
      <Button 
        variant="default" 
        size="lg"
        onClick={() => setModalOpen(true)}
        className="w-full bg-[#C6A760] hover:bg-[#B89750] text-white"
      >
        <Calendar className="w-5 h-5 mr-2" />
        Réserver un Ouvrage
      </Button>
      
      <ReservationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        document={document}
        user={user}
      />
    </>
  );
}
```

---

## 🧩 4. Intégration avec la modale de réservation

La modale de réservation est définie dans `src/components/cbn/ReservationModal.tsx` (voir `PROMPT_RESERVATION_OUVRAGE.md`).

### Props passées à la modale

```tsx
interface ReservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: {
    id: string;
    title: string;
    cote: string;
    isDigitized: boolean;
    allowPhysical: boolean;
    isFreeAccess: boolean;
  };
  user?: {
    id: string;
    email: string;
    name: string;
    isSubscriber: boolean;
  };
}
```

### Transmission du contexte

```tsx
<ReservationModal
  open={reservationModalOpen}
  onOpenChange={setReservationModalOpen}
  document={{
    id: document.id,
    title: document.title,
    cote: document.cote,
    isDigitized: document.isDigitized,
    allowPhysical: document.allowPhysical,
    isFreeAccess: document.isFreeAccess,
  }}
  user={user ? {
    id: user.id,
    email: user.email,
    name: user.profile?.full_name || user.email,
    isSubscriber: userRole === 'subscriber' || userRole === 'researcher',
  } : undefined}
/>
```

---

## 📊 5. Historique des réservations utilisateur

### Affichage (sidebar, si connecté)

```tsx
{user && (
  <Card className="mt-4">
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <History className="w-5 h-5" />
        Vos réservations
      </CardTitle>
    </CardHeader>
    <CardContent>
      {userReservations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune réservation en cours
        </p>
      ) : (
        <div className="space-y-3">
          {userReservations.map((reservation) => (
            <div 
              key={reservation.id}
              className="p-3 bg-muted/50 rounded-lg text-sm"
            >
              <p className="font-medium">{reservation.documentTitle}</p>
              <p className="text-muted-foreground text-xs mt-1">
                {format(new Date(reservation.createdAt), 'dd/MM/yyyy', { locale: fr })}
              </p>
              <Badge 
                variant={
                  reservation.status === 'approved' ? 'success' : 
                  reservation.status === 'pending' ? 'warning' : 
                  'default'
                }
                className="mt-2"
              >
                {reservation.status === 'approved' ? 'Approuvée' :
                 reservation.status === 'pending' ? 'En attente' :
                 'Traitée'}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
)}
```

### Requête Supabase

```tsx
const fetchUserReservations = async (userId: string) => {
  const { data, error } = await supabase
    .from('reservations_ouvrages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    return [];
  }
  
  return data;
};
```

---

## 🗂 6. Documents liés / "Voir aussi"

### Affichage

```tsx
<Card className="mt-6">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <BookOpen className="w-5 h-5" />
      Documents similaires
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {relatedDocuments.map((doc) => (
        <Card 
          key={doc.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(`/cbm/notice/${doc.id}`)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm line-clamp-2">
              {doc.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground mb-2">
              {doc.author}
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Voir la notice
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </CardContent>
</Card>
```

### Requêtes de récupération

```tsx
// Documents du même auteur
const fetchRelatedByAuthor = async (authorName: string, currentId: string) => {
  const { data } = await supabase
    .from('cbn_documents')
    .select('id, title, author, cote')
    .ilike('author', `%${authorName}%`)
    .neq('id', currentId)
    .limit(3);
  
  return data || [];
};

// Documents de la même collection
const fetchRelatedByCollection = async (collection: string, currentId: string) => {
  const { data } = await supabase
    .from('cbn_documents')
    .select('id, title, author, cote')
    .eq('collection', collection)
    .neq('id', currentId)
    .limit(3);
  
  return data || [];
};
```

---

## 🗄️ 7. Structure Supabase

### Table `cbn_documents`

```sql
CREATE TABLE public.cbn_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Métadonnées bibliographiques (UNIMARC)
  title TEXT NOT NULL,
  title_ar TEXT,
  author TEXT NOT NULL,
  publisher TEXT,
  publication_place TEXT,
  publication_year TEXT,
  isbn TEXT,
  issn TEXT,
  cote TEXT NOT NULL UNIQUE,
  
  -- Description
  document_type TEXT NOT NULL, -- 'livre', 'manuscrit', 'periodique'
  language TEXT DEFAULT 'fr',
  pages INTEGER,
  physical_description TEXT,
  summary TEXT,
  table_of_contents TEXT[], -- Array pour le sommaire
  keywords TEXT[], -- Array pour les mots-clés
  collection TEXT,
  contributors TEXT[], -- Auteurs secondaires
  
  -- Statut et accès
  access_status TEXT NOT NULL CHECK (access_status IN ('libre_acces', 'numerise_restreint', 'non_numerise')),
  is_digitized BOOLEAN DEFAULT false,
  is_free_access BOOLEAN DEFAULT false,
  allow_physical_consultation BOOLEAN DEFAULT true,
  bn_link TEXT, -- Lien vers la Bibliothèque Numérique
  
  -- Métadonnées système
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Indexation full-text
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(author, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(summary, '')), 'C')
  ) STORED
);

-- Index pour la recherche full-text
CREATE INDEX idx_cbn_documents_search ON public.cbn_documents USING GIN(search_vector);

-- Index pour les recherches fréquentes
CREATE INDEX idx_cbn_documents_author ON public.cbn_documents(author);
CREATE INDEX idx_cbn_documents_cote ON public.cbn_documents(cote);
CREATE INDEX idx_cbn_documents_access_status ON public.cbn_documents(access_status);

-- RLS Policies (lecture publique, modification admin)
ALTER TABLE public.cbn_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique des documents CBN"
  ON public.cbn_documents
  FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "Modification réservée aux admins"
  ON public.cbn_documents
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.user_roles WHERE role = 'admin'
    )
  );
```

### Table `reservations_ouvrages` (voir PROMPT_RESERVATION_OUVRAGE.md)

Lien avec `cbn_documents.id` via `document_id`.

---

## 🎨 8. Design System UX/UI (Lovable)

### Tokens de couleurs (index.css)

```css
:root {
  /* Palette BNRM */
  --bnrm-gold: 37 64% 59%; /* #C6A760 */
  --bnrm-gold-dark: 37 54% 49%; /* #B89750 */
  --bnrm-cream: 45 33% 96%; /* #F8F7F2 */
  --bnrm-gray: 0 0% 33%; /* #555555 */
  
  /* Statuts d'accès */
  --status-free: 142 76% 36%; /* Vert - Libre accès */
  --status-restricted: 38 92% 50%; /* Orange - Restreint */
  --status-physical: 0 84% 60%; /* Rouge - Physique uniquement */
}
```

### Composants Shadcn utilisés

| Composant | Usage |
|-----------|-------|
| `<Card>` | Conteneurs principaux |
| `<Accordion>` | Détails bibliographiques |
| `<Badge>` | Statuts, mots-clés |
| `<Button>` | Actions (réserver, consulter) |
| `<Breadcrumb>` | Navigation |
| `<Tabs>` | (Optionnel) Sections de contenu |
| `<Dialog>` | Modale de réservation (via `ReservationModal`) |

### Icônes Lucide React

```tsx
import {
  Book, BookOpen, User, Building, Globe, FileText,
  Calendar, ExternalLink, History, ChevronDown, ChevronUp
} from 'lucide-react';
```

### Responsive Design

| Breakpoint | Comportement |
|------------|--------------|
| **Desktop** (≥1024px) | Layout 2 colonnes (70% / 30%) |
| **Tablet** (768-1023px) | Layout 2 colonnes (60% / 40%) |
| **Mobile** (<768px) | Layout 1 colonne, sidebar en bas |

### Accessibilité (WCAG 2.1 AA)

- ✅ Contraste minimum 4.5:1 pour le texte
- ✅ Support navigation clavier (Tab, Enter, Esc)
- ✅ ARIA labels sur boutons et liens
- ✅ Support RTL complet pour l'arabe
- ✅ Texte alternatif sur images/icônes

---

## 🔐 9. Sécurité et validation

### Contrôle d'accès (RLS)

```sql
-- Lecture publique pour tous les documents non supprimés
CREATE POLICY "public_read_documents"
  ON cbn_documents FOR SELECT
  USING (deleted_at IS NULL);

-- Modification uniquement par admins/librarians
CREATE POLICY "admin_modify_documents"
  ON cbn_documents FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles 
      WHERE role IN ('admin', 'librarian')
    )
  );
```

### Validation côté client

```tsx
// Vérification de l'ID du document
const documentIdSchema = z.string().uuid({
  message: "ID de document invalide"
});

// Validation avant chargement
try {
  documentIdSchema.parse(id);
} catch (error) {
  navigate('/404');
  return;
}
```

### Gestion des erreurs

```tsx
// États de chargement
if (loading) {
  return <div>Chargement de la notice...</div>;
}

// Document non trouvé
if (!document) {
  return (
    <div className="text-center py-12">
      <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
      <h2 className="text-2xl font-bold mb-2">Notice introuvable</h2>
      <p className="text-muted-foreground mb-4">
        Le document demandé n'existe pas ou a été supprimé.
      </p>
      <Button onClick={() => navigate('/cbm/recherche')}>
        Retour à la recherche
      </Button>
    </div>
  );
}

// Document supprimé
if (document.deleted_at) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Document supprimé</AlertTitle>
      <AlertDescription>
        Ce document n'est plus accessible dans le catalogue.
      </AlertDescription>
    </Alert>
  );
}
```

---

## 📋 10. SEO et métadonnées

### Composant `<NoticeHead>` (react-helmet)

```tsx
import { Helmet } from 'react-helmet';

interface NoticeHeadProps {
  document: DocumentInfo;
}

export function NoticeHead({ document }: NoticeHeadProps) {
  const title = `${document.title} - ${document.author} | BNRM`;
  const description = document.summary 
    ? document.summary.substring(0, 160)
    : `Notice détaillée de ${document.title} par ${document.author}`;
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={document.keywords.join(', ')} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="book" />
      <meta property="og:locale" content="fr_MA" />
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Book",
          "name": document.title,
          "author": {
            "@type": "Person",
            "name": document.author
          },
          "publisher": {
            "@type": "Organization",
            "name": document.publisher
          },
          "datePublished": document.year,
          "isbn": document.isbn,
          "inLanguage": document.language,
          "description": document.summary
        })}
      </script>
    </Helmet>
  );
}
```

---

## ✅ 11. Checklist d'implémentation

### Core Features
- [ ] Route `/cbm/notice/:id` configurée
- [ ] Récupération document depuis `cbn_documents`
- [ ] Affichage en-tête (titre FR/AR, auteur, éditeur, identifiants)
- [ ] Affichage résumé et mots-clés
- [ ] Accordéon "Détails bibliographiques"
- [ ] Sidebar "Disponibilité et accès"
- [ ] Bouton adaptatif "Réserver / Consulter en ligne"
- [ ] Intégration `ReservationModal`
- [ ] Historique des réservations utilisateur
- [ ] Section "Documents liés"
- [ ] Breadcrumb de navigation

### Logique métier
- [ ] Fonction `determineReservationRouting()` implémentée
- [ ] Gestion cas "Libre accès" (pas de réservation)
- [ ] Gestion cas "Numérisé restreint" (modale → BN)
- [ ] Gestion cas "Non numérisé" (modale → Support)
- [ ] Blocage si `allowPhysical = false`
- [ ] Récupération documents liés (même auteur, collection)

### Base de données
- [ ] Table `cbn_documents` créée
- [ ] Index full-text configuré
- [ ] RLS policies activées (lecture publique)
- [ ] Trigger `updated_at` fonctionnel

### UX/UI
- [ ] Design tokens BNRM appliqués
- [ ] Badges de statut colorés
- [ ] Layout responsive (desktop/tablet/mobile)
- [ ] Support RTL pour l'arabe
- [ ] Navigation clavier fonctionnelle
- [ ] États de chargement affichés
- [ ] Gestion erreurs 404

### SEO & Accessibilité
- [ ] Composant `<NoticeHead>` intégré
- [ ] Meta tags Open Graph
- [ ] Schema.org JSON-LD
- [ ] Attributs ARIA sur éléments interactifs
- [ ] Contraste couleurs WCAG AA

### Sécurité
- [ ] Validation ID document (UUID)
- [ ] Sanitization des entrées utilisateur
- [ ] RLS policies testées
- [ ] Gestion documents supprimés

### Tests
- [ ] Test navigation vers notice valide
- [ ] Test ID invalide (404)
- [ ] Test document libre accès (lien BN)
- [ ] Test document restreint (modale)
- [ ] Test document non numérisé
- [ ] Test historique utilisateur connecté
- [ ] Test responsive mobile/tablet

---

## 📊 12. Résumé exécutif

### Objectif
Créer une **fiche détaillée d'ouvrage** intégrant :
- Métadonnées UNIMARC complètes
- Bouton de réservation adaptatif selon le statut
- Modale de réservation conditionnelle
- Historique utilisateur
- Documents liés

### Complexité
⭐⭐⭐⭐ (4/5) - Moyenne-élevée

**Raisons** :
- Logique de routage conditionnelle complexe
- Intégration avec système de réservation
- Gestion multi-statuts (libre/restreint/physique)
- Métadonnées UNIMARC riches

### Temps estimé
- **Développement** : 8-12 heures
- **Tests & ajustements** : 3-4 heures
- **Total** : 11-16 heures

### Dépendances critiques
1. Table `cbn_documents` (base de données)
2. `ReservationModal` (modale de réservation)
3. Système d'authentification (historique utilisateur)
4. Hook `useAccessControl` (contrôle d'accès)

### Maintenance
- **Faible** : Logique métier stable
- **Attention** : Synchronisation avec mises à jour UNIMARC

---

**Fin du document**  
**Version** : 2.0  
**Auteur** : Équipe Lovable IA  
**Dernière révision** : 26 octobre 2025
