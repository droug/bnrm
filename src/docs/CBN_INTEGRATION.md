# Intégration CBN - Catalogue des Bibliothèques Nationales

## 📋 État actuel

La fiche détaillée d'ouvrage (`/cbn/notice/:id`) est **fonctionnelle** avec des données de test mockées.

## ⚠️ À faire : Intégration base de données

### 1. Création de la table `cbn_documents`

```sql
-- Table pour les notices bibliographiques CBN
CREATE TABLE public.cbn_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identifiants
  document_id TEXT UNIQUE NOT NULL, -- Ex: DOC-2024-001
  isbn TEXT,
  issn TEXT,
  cote TEXT,
  
  -- Informations de base (UNIMARC)
  title TEXT NOT NULL,
  title_ar TEXT, -- Titre en arabe
  subtitle TEXT,
  author TEXT NOT NULL,
  authors_secondary TEXT[], -- Zone 700
  
  -- Publication (Zone 210)
  publisher TEXT,
  publication_place TEXT,
  publication_year TEXT,
  
  -- Description (Zone 300)
  physical_description TEXT,
  document_type TEXT NOT NULL, -- Livre, Périodique, etc.
  support_type TEXT NOT NULL, -- Imprimé, Électronique, etc.
  language TEXT NOT NULL,
  
  -- Contenu (Zone 330)
  summary TEXT,
  table_of_contents TEXT,
  
  -- Indexation (Zone 606)
  keywords TEXT[],
  collection TEXT,
  series TEXT,
  
  -- Statut et accès
  access_status TEXT CHECK (access_status IN ('libre_acces', 'acces_restreint', 'consultation_physique')) NOT NULL,
  support_status TEXT CHECK (support_status IN ('numerise', 'non_numerise', 'libre_acces')) NOT NULL,
  is_free_access BOOLEAN DEFAULT false,
  allow_physical_consultation BOOLEAN DEFAULT true,
  bn_link TEXT, -- Lien vers Bibliothèque Numérique si libre accès
  
  -- Métadonnées (Zone 801)
  origin_catalog TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Soft delete
  is_deleted BOOLEAN DEFAULT false
);

-- Index pour les recherches
CREATE INDEX idx_cbn_documents_document_id ON public.cbn_documents(document_id);
CREATE INDEX idx_cbn_documents_author ON public.cbn_documents(author);
CREATE INDEX idx_cbn_documents_title ON public.cbn_documents USING gin(to_tsvector('french', title));
CREATE INDEX idx_cbn_documents_keywords ON public.cbn_documents USING gin(keywords);
CREATE INDEX idx_cbn_documents_isbn ON public.cbn_documents(isbn);

-- RLS
ALTER TABLE public.cbn_documents ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut lire les documents non supprimés
CREATE POLICY "Public can view non-deleted documents"
  ON public.cbn_documents
  FOR SELECT
  USING (is_deleted = false);

-- Trigger pour updated_at
CREATE TRIGGER update_cbn_documents_updated_at
  BEFORE UPDATE ON public.cbn_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

### 2. Modifier `CBNNoticeDetail.tsx`

Remplacer la section `fetchDocumentDetails` par :

```typescript
const fetchDocumentDetails = async () => {
  try {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('cbn_documents')
      .select('*')
      .eq('document_id', id)
      .single();

    if (error) throw error;

    if (!data) {
      setDocument(null);
      return;
    }

    setDocument({
      id: data.id,
      title: data.title,
      title_ar: data.title_ar,
      author: data.author,
      authors_secondary: data.authors_secondary,
      publisher: data.publisher,
      publication_place: data.publication_place,
      publication_year: data.publication_year,
      isbn: data.isbn,
      issn: data.issn,
      cote: data.cote,
      document_type: data.document_type,
      support_type: data.support_type,
      language: data.language,
      summary: data.summary,
      table_of_contents: data.table_of_contents,
      keywords: data.keywords,
      collection: data.collection,
      series: data.series,
      physical_description: data.physical_description,
      access_status: data.access_status,
      support_status: data.support_status,
      is_free_access: data.is_free_access,
      allow_physical_consultation: data.allow_physical_consultation,
      bn_link: data.bn_link,
      created_at: data.created_at
    });

    // Charger les documents liés
    fetchRelatedDocuments(data.author, data.collection);
  } catch (error: any) {
    console.error("Erreur lors du chargement de la notice:", error);
    toast.error("Erreur lors du chargement des détails");
  } finally {
    setLoading(false);
  }
};
```

### 3. Implémenter `fetchRelatedDocuments`

```typescript
const fetchRelatedDocuments = async (author: string, collection?: string) => {
  try {
    let query = supabase
      .from('cbn_documents')
      .select('id, document_id, title, author, publisher, publication_year, document_type, support_type, language, access_status, support_status, is_free_access, allow_physical_consultation, created_at')
      .eq('is_deleted', false)
      .neq('document_id', id)
      .limit(6);

    // Rechercher par auteur ou collection
    if (collection) {
      query = query.or(`author.eq.${author},collection.eq.${collection}`);
    } else {
      query = query.eq('author', author);
    }

    const { data, error } = await query;

    if (error) throw error;

    setRelatedDocuments(data || []);
  } catch (error: any) {
    console.error("Erreur lors du chargement des documents liés:", error);
  }
};
```

## 📊 Import de données UNIMARC

Pour importer des données depuis un système SIGB (Système Intégré de Gestion de Bibliothèque) :

1. Exporter les notices au format UNIMARC/ISO 2709
2. Utiliser un script de conversion (Python + pymarc)
3. Insérer dans `cbn_documents` via API

## 🔗 Liens utiles

- [Format UNIMARC](https://www.transition-bibliographique.fr/unimarc/)
- [Zones UNIMARC principales](https://www.transition-bibliographique.fr/unimarc/manuel-unimarc-format-bibliographique/)
- [pymarc pour Python](https://pypi.org/project/pymarc/)

## ✅ Checklist d'intégration

- [ ] Créer la table `cbn_documents` avec RLS
- [ ] Importer des données de test
- [ ] Remplacer les données mockées dans le code
- [ ] Tester la navigation et la recherche
- [ ] Vérifier les performances avec volume réel
- [ ] Configurer les backups automatiques
