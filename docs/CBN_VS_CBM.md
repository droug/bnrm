# Distinction CBN vs CBM - Architecture des Catalogues

## Vue d'ensemble

Le système comporte maintenant **deux catalogues distincts** :

### 1. CBN - Catalogue de la Bibliothèque Nationale
- **Base de données**: Table `cbn_documents` (Supabase)
- **Portail**: BNRM Portal
- **Usage principal**: 
  - Réservation d'ouvrages du fonds de la Bibliothèque Nationale
  - Demande de reproduction de documents patrimoniaux
  - Bibliothèque Numérique

### 2. CBM - Catalogue de la Bibliothèque Marocaine
- **Base de données**: Recherche fédérée sur plusieurs bibliothèques du réseau
- **Portail**: CBM Platform
- **Usage principal**:
  - Recherche collaborative multi-bibliothèques
  - Protocoles Z39.50, SRU, OAI-PMH
  - Interconnexion des catalogues des bibliothèques partenaires

---

## Services et Routes

### Service "Réserver un ouvrage" (CBN)

**Route**: `/cbn/reserver-ouvrage`

**Composants**:
- `BookReservationService` (page principale)
- `CBNAdvancedSearch` (recherche avancée dans le catalogue CBN)
- `CBNSearchWithSelection` (recherche avec sélection de document)
- `BookReservationDialog` (formulaire de réservation)

**Workflow**:
1. L'utilisateur recherche un document dans le catalogue CBN via l'interface de recherche avancée
2. Il sélectionne le document souhaité
3. Il remplit le formulaire de réservation
4. La demande est routée vers le service approprié selon le statut du document

**Base de données**: 
- Recherche: `cbn_documents`
- Réservations: `reservations_ouvrages`

---

### Service "Demande de reproduction" (CBN)

**Route**: `/reproduction/new`

**Composants**:
- `ReproductionRequestForm` (page principale avec recherche intégrée)
- `CBNSearchWithSelection` (recherche CBN réutilisée)

**Workflow**:
1. L'utilisateur recherche un ou plusieurs documents via l'interface de recherche CBN
2. Il sélectionne les documents à reproduire
3. Il choisit les modalités de reproduction (numérique, papier, etc.)
4. La demande est créée et routée selon l'institution propriétaire

**Base de données**:
- Recherche: `cbn_documents`
- Reproductions: `reproduction_requests` + `reproduction_items`

---

### Plateforme CBM (Recherche fédérée)

**Route**: `/cbm/recherche`

**Composants**:
- `CBMRecherche` (recherche simple et avancée)
- `CBMPortal` (portail d'accueil)

**Caractéristiques**:
- Recherche simultanée dans 152+ bibliothèques
- Protocoles standards (Z39.50, SRU, OAI-PMH)
- Formats UNIMARC et Dublin Core

---

## Composants de Recherche Réutilisables

### `CBNAdvancedSearch`
Interface de recherche avancée pour le catalogue CBN, similaire à celle du CBM.

**Props**:
- `onSearch`: Callback avec critères de recherche
- `onSelectDocument`: Callback optionnel pour sélection directe
- `compact`: Mode compact pour intégration dans dialogues

**Critères de recherche**:
- Recherche simple: Tous champs, titre, auteur, sujet, ISBN
- Recherche avancée: 
  - Titre
  - Auteur
  - Éditeur
  - Année de publication
  - Sujet / Mots-clés
  - Langue
  - Type de document
  - ISBN/ISSN

### `CBNSearchWithSelection`
Composant combinant recherche et sélection de documents avec affichage des résultats.

**Props**:
- `onSelectDocument`: Callback avec document sélectionné
- `selectedDocumentId`: ID du document actuellement sélectionné
- `compact`: Mode compact

**Fonctionnalités**:
- Affichage des résultats de recherche
- Sélection visuelle du document
- Carte détaillée pour chaque résultat
- État de sélection persistant

---

## Intégration Future - API du Catalogue CBN

### TODO: Connexion à la vraie API
Actuellement, les composants de recherche CBN utilisent des données mockées. 

**À implémenter**:

```typescript
// Dans CBNSearchWithSelection.tsx
const handleSearch = async (criteria: SearchCriteria) => {
  const { data, error } = await supabase
    .from('cbn_documents')
    .select('*')
    .ilike('title', `%${criteria.title}%`)
    .ilike('author', `%${criteria.author}%`)
    // ... autres critères
    
  if (data) {
    setSearchResults(data.map(doc => ({
      id: doc.id,
      title: doc.title,
      author: doc.author,
      publisher: doc.publisher,
      year: doc.year,
      type: doc.document_type,
      status: doc.access_status,
      cote: doc.cote
    })));
  }
};
```

**Table cbn_documents** (selon CBN_INTEGRATION.md):
- `id`: UUID
- `record_number`: Numéro de notice
- `title`: Titre
- `author`: Auteur
- `publisher`: Éditeur
- `publication_year`: Année
- `isbn`: ISBN
- `document_type`: Type
- `language`: Langue
- `cote`: Cote
- `access_status`: Statut d'accès
- `keywords`: Mots-clés

---

## Points d'Entrée dans l'Application

### Dans le Header
```tsx
<Link to="/cbn/reserver-ouvrage">
  <div className="font-semibold">Réserver un ouvrage</div>
  <div className="text-xs">Recherchez et réservez un document CBN</div>
</Link>
```

### Sur la page d'accueil (Index.tsx)
```tsx
{ 
  icon: BookOpen, 
  label: "Réserver un ouvrage", 
  href: "/cbn/reserver-ouvrage" 
}
```

---

## Architecture des Données

```
CBN (Bibliothèque Nationale)
├── cbn_documents (catalogue)
├── reservations_ouvrages (réservations)
├── reproduction_requests (reproductions)
└── reproduction_items (détails reproductions)

CBM (Réseau des Bibliothèques)
├── Recherche fédérée externe
├── API Z39.50 / SRU
└── Pas de stockage local permanent
```

---

## Routage des Demandes

### Réservation d'ouvrage (CBN)
```
Document sélectionné
    ↓
Vérification du statut
    ↓
┌─────────────────────┐
│ Libre accès?        │ → OUI → Bibliothèque Numérique
└─────────────────────┘
    ↓ NON
┌─────────────────────┐
│ Numérisé?           │ → OUI → Bibliothèque Numérique
└─────────────────────┘         (ou Responsable Support si consultation physique demandée)
    ↓ NON
Responsable Support (consultation physique obligatoire)
```

### Demande de reproduction (CBN)
```
Document(s) sélectionné(s)
    ↓
Vérification institution propriétaire
    ↓
┌─────────────────────┐
│ BNRM?               │ → OUI → Traitement interne
└─────────────────────┘
    ↓ NON
Institution partenaire (redirection externe)
```

---

## Prochaines Étapes

1. ✅ Créer les composants de recherche CBN
2. ✅ Intégrer dans les services de réservation et reproduction
3. ✅ Ajouter les routes dans l'application
4. ✅ Mettre à jour les points d'entrée (Header, Index)
5. ⏳ Connecter à la vraie API du catalogue CBN
6. ⏳ Implémenter la recherche dans `cbn_documents`
7. ⏳ Tester le workflow complet de réservation
8. ⏳ Tester le workflow complet de reproduction
