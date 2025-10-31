# Architecture Hiérarchique des Catalogues

## Vue d'ensemble

Le système utilise une architecture hiérarchique à 4 niveaux pour gérer les documents :

```
CBM (Catalogue des Bibliothèques Marocaines)
└── CBN/Portail BNRM (Tous documents BNRM)
    └── Bibliothèque Numérique (Documents numérisés)
        └── Manuscrits (Sous-ensemble spécialisé)
```

## Structure des Tables

### 1. `cbm_catalog` - Niveau 1 (Le plus large)
**Portée** : Catalogue fédéré de toutes les bibliothèques marocaines (152+ bibliothèques)

**Caractéristiques** :
- Recherche fédérée via Z39.50, SRU, OAI-PMH
- Contient les notices de la BNRM et des autres bibliothèques
- Métadonnées bibliographiques de base
- Lien optionnel vers `cbn_documents` si le document provient de la BNRM

**Champs clés** :
- `cbm_record_id` : Identifiant unique CBM
- `source_library` : Bibliothèque source
- `cbn_document_id` : Référence vers CBN (nullable)

**Routes** : `/cbm/*`

### 2. `cbn_documents` - Niveau 2
**Portée** : Catalogue complet de la BNRM (documents physiques + numérisés)

**Caractéristiques** :
- Tous les documents de la Bibliothèque Nationale
- Notices UNIMARC complètes
- Documents physiques ET numérisés
- Gestion des réservations et reproductions
- Lien bidirectionnel avec CBM

**Champs clés** :
- `cote` : Cote unique BNRM
- `is_digitized` : Indique si numérisé
- `digital_library_document_id` : Référence vers bibliothèque numérique (si numérisé)
- `cbm_catalog_id` : Référence vers CBM (optionnel)

**Routes** : 
- `/cbn/*` (Portail BNRM)
- `/cbn/notice/:id`
- `/cbn/reserver-ouvrage`
- `/reproduction/*`

### 3. `digital_library_documents` - Niveau 3
**Portée** : Documents numérisés de la BNRM uniquement

**Caractéristiques** :
- Uniquement documents avec fichiers numériques
- Lecture en ligne, téléchargement
- Collections et thématiques virtuelles
- Statistiques de consultation
- Lien obligatoire vers `cbn_documents`

**Champs clés** :
- `cbn_document_id` : Référence obligatoire vers CBN
- `is_manuscript` : Indique si manuscrit
- `manuscript_id` : Référence vers manuscripts (si applicable)
- `publication_status` : Statut de publication

**Routes** : 
- `/digital-library/*`
- `/digital-library/document/:id`
- `/digital-library/book-reader/:id`

### 4. `manuscripts` - Niveau 4 (Le plus spécialisé)
**Portée** : Manuscrits numérisés uniquement

**Caractéristiques** :
- Sous-ensemble spécialisé de la bibliothèque numérique
- Métadonnées spécifiques aux manuscrits (époque, langue, état)
- Plateforme dédiée avec fonctionnalités avancées
- Liens vers CBN et bibliothèque numérique

**Nouveaux champs** :
- `digital_library_document_id` : Référence vers bibliothèque numérique
- `cbn_document_id` : Référence vers CBN

**Routes** : 
- `/manuscripts/*`
- `/digital-library/book-reader/:id` (réutilisé)

## Relations entre Tables

### Relations Hiérarchiques

```
cbm_catalog.cbn_document_id ──→ cbn_documents.id
cbn_documents.cbm_catalog_id ──→ cbm_catalog.id (bidirectionnel)

cbn_documents.digital_library_document_id ──→ digital_library_documents.id
digital_library_documents.cbn_document_id ──→ cbn_documents.id (obligatoire)

digital_library_documents.manuscript_id ──→ manuscripts.id
manuscripts.digital_library_document_id ──→ digital_library_documents.id
manuscripts.cbn_document_id ──→ cbn_documents.id
```

### Cascade de Données

1. **Document CBM de la BNRM** :
   - Créer dans `cbm_catalog`
   - Créer dans `cbn_documents`
   - Lier les deux

2. **Numérisation d'un document CBN** :
   - Document existe dans `cbn_documents`
   - Créer dans `digital_library_documents`
   - Mettre à jour `cbn_documents.is_digitized = true`
   - Lier via `digital_library_document_id`

3. **Ajout d'un manuscrit** :
   - Créer dans `cbn_documents`
   - Créer dans `digital_library_documents` (avec `is_manuscript = true`)
   - Créer dans `manuscripts`
   - Lier les trois tables

## Flux de Recherche

### Recherche CBM
```sql
-- Recherche fédérée dans toutes les bibliothèques
SELECT * FROM cbm_catalog 
WHERE title ILIKE '%terme%' 
  AND deleted_at IS NULL;

-- Si document BNRM, on peut accéder aux détails via JOIN
SELECT c.*, d.* FROM cbm_catalog c
LEFT JOIN cbn_documents d ON c.cbn_document_id = d.id
WHERE c.source_library = 'BNRM';
```

### Recherche CBN
```sql
-- Tous les documents BNRM
SELECT * FROM cbn_documents 
WHERE title ILIKE '%terme%' 
  AND deleted_at IS NULL;

-- Uniquement documents numérisés
SELECT * FROM cbn_documents 
WHERE is_digitized = true 
  AND deleted_at IS NULL;
```

### Recherche Bibliothèque Numérique
```sql
-- Documents numérisés publiés
SELECT * FROM digital_library_documents 
WHERE title ILIKE '%terme%' 
  AND publication_status = 'published'
  AND deleted_at IS NULL;

-- Avec métadonnées CBN complètes
SELECT d.*, c.* FROM digital_library_documents d
JOIN cbn_documents c ON d.cbn_document_id = c.id
WHERE d.publication_status = 'published';
```

### Recherche Manuscrits
```sql
-- Tous les manuscrits
SELECT * FROM manuscripts 
WHERE title ILIKE '%terme%';

-- Avec métadonnées complètes
SELECT m.*, d.*, c.* 
FROM manuscripts m
LEFT JOIN digital_library_documents d ON m.digital_library_document_id = d.id
LEFT JOIN cbn_documents c ON m.cbn_document_id = c.id;
```

## Services et APIs

### Services TypeScript à Créer

1. **`CBMService`** : Recherche fédérée CBM
2. **`CBNService`** : Gestion documents BNRM
3. **`DigitalLibraryService`** : Gestion bibliothèque numérique
4. **`ManuscriptService`** : Gestion manuscrits (existe déjà, à adapter)

### Endpoints Edge Functions

- `/cbm-search` : Recherche fédérée
- `/cbn-catalog` : Catalogue BNRM
- `/digital-library` : Documents numérisés
- `/manuscripts` : Manuscrits

## Navigation et Liens

### Liens Hiérarchiques dans l'UI

**Du CBM vers CBN** :
```tsx
// Si document BNRM dans CBM
if (cbmDocument.source_library === 'BNRM' && cbmDocument.cbn_document_id) {
  <Link to={`/cbn/notice/${cbmDocument.cbn_document_id}`}>
    Voir la notice complète BNRM
  </Link>
}
```

**Du CBN vers Bibliothèque Numérique** :
```tsx
// Si document numérisé dans CBN
if (cbnDocument.is_digitized && cbnDocument.digital_library_document_id) {
  <Link to={`/digital-library/document/${cbnDocument.digital_library_document_id}`}>
    Consulter la version numérique
  </Link>
}
```

**De la Bibliothèque Numérique vers Manuscrits** :
```tsx
// Si manuscrit dans bibliothèque numérique
if (digitalDocument.is_manuscript && digitalDocument.manuscript_id) {
  <Link to={`/manuscripts/${digitalDocument.manuscript_id}`}>
    Accéder à la plateforme manuscrits
  </Link>
}
```

**Navigation inverse (remontée hiérarchique)** :
```tsx
// Manuscrit → Bibliothèque Numérique
<Link to={`/digital-library/document/${manuscript.digital_library_document_id}`}>
  Voir dans la bibliothèque numérique
</Link>

// Bibliothèque Numérique → CBN
<Link to={`/cbn/notice/${digitalDocument.cbn_document_id}`}>
  Voir la notice BNRM complète
</Link>

// CBN → CBM
<Link to={`/cbm/notice/${cbnDocument.cbm_catalog_id}`}>
  Voir dans le catalogue marocain
</Link>
```

## Politique de Sécurité (RLS)

### Niveaux d'Accès

| Table | Public | Authentifié | Admin/Librarian |
|-------|--------|-------------|-----------------|
| `cbm_catalog` | ✓ Lecture | ✓ Lecture | ✓ Tout |
| `cbn_documents` | ✓ (public) | ✓ (tous) | ✓ Tout |
| `digital_library_documents` | ✓ (published) | ✓ (published) | ✓ Tout |
| `manuscripts` | ✓ (public) | ✓ (tous) | ✓ Tout |

## Migration de Données

### Depuis l'ancienne structure

Si vous avez des données existantes dans d'autres tables, voici comment migrer :

```sql
-- 1. Migrer vers cbn_documents
INSERT INTO cbn_documents (cote, title, author, ...)
SELECT cote, title, author, ... FROM old_catalog_table;

-- 2. Migrer vers digital_library_documents (pour documents numérisés)
INSERT INTO digital_library_documents (cbn_document_id, title, pdf_url, ...)
SELECT 
  cbn.id, 
  old.title, 
  old.file_url, 
  ...
FROM old_digital_content old
JOIN cbn_documents cbn ON old.cote = cbn.cote;

-- 3. Mettre à jour les liens
UPDATE cbn_documents 
SET digital_library_document_id = dl.id
FROM digital_library_documents dl
WHERE cbn_documents.id = dl.cbn_document_id;
```

## Prochaines Étapes

1. ✅ Créer les tables et relations
2. ⏳ Créer les services TypeScript
3. ⏳ Adapter les composants existants
4. ⏳ Mettre à jour les routes
5. ⏳ Migrer les données existantes
6. ⏳ Tester les liens hiérarchiques
7. ⏳ Documentation utilisateur
