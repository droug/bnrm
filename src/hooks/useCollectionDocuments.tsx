import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';

export interface DocumentFilters {
  author?: string;
  title?: string;
  dateFrom?: string;
  dateTo?: string;
  language?: string;
  documentType?: string;
  material?: string;
  sortBy?: 'title' | 'author' | 'published_at' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface CollectionDocument {
  id: string;
  title: string;
  author?: string;
  description?: string;
  thumbnail_url?: string;
  file_url?: string;
  file_type?: string;
  language?: string;
  published_at?: string;
  created_at: string;
  status: string;
  content_type?: string;
  material?: string;
  view_count?: number;
  download_enabled?: boolean;
  tags?: string[];
  // Métadonnées Dublin Core/MARC
  metadata?: {
    dc_creator?: string;
    dc_publisher?: string;
    dc_date?: string;
    dc_rights?: string;
    dc_format?: string;
    dc_identifier?: string;
    dc_language?: string;
    dc_subject?: string[];
    marc_245?: string; // Titre
    marc_100?: string; // Auteur principal
    marc_260?: string; // Publication
    marc_300?: string; // Description physique
  };
}

export interface ManuscriptDocument {
  id: string;
  title: string;
  author?: string;
  description?: string;
  thumbnail_url?: string;
  file_url?: string;
  language?: string;
  period?: string;
  genre?: string;
  material?: string;
  publication_year?: number;
  created_at: string;
  status: string;
  access_level: string;
}

type CollectionType = 'books' | 'periodicals' | 'manuscripts' | 'photos' | 'audiovisual';

const COLLECTION_TYPE_MAP: Record<CollectionType, string> = {
  books: 'document',
  periodicals: 'journal',
  manuscripts: 'manuscript',
  photos: 'image',
  audiovisual: 'video'
};

export function useCollectionDocuments(collectionType: CollectionType) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [documents, setDocuments] = useState<CollectionDocument[] | ManuscriptDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;

  // Lire les filtres depuis l'URL
  const getFiltersFromUrl = (): DocumentFilters => {
    return {
      author: searchParams.get('author') || undefined,
      title: searchParams.get('title') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      language: searchParams.get('language') || undefined,
      documentType: searchParams.get('type') || undefined,
      material: searchParams.get('material') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'created_at',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    };
  };

  // Mettre à jour les filtres dans l'URL
  const updateFilters = (filters: Partial<DocumentFilters>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value.toString());
      } else {
        newParams.delete(key);
      }
    });
    
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  // Charger les documents
  const loadDocuments = async (page: number = 1) => {
    setLoading(true);
    const filters = getFiltersFromUrl();
    const offset = (page - 1) * perPage;

    try {
      if (collectionType === 'manuscripts') {
        // Table manuscripts séparée
        let query = supabase
          .from('manuscripts')
          .select('*', { count: 'exact' })
          .eq('is_visible', true);

        // Filtres
        if (filters.title) {
          query = query.ilike('title', `%${filters.title}%`);
        }
        if (filters.author) {
          query = query.ilike('author', `%${filters.author}%`);
        }
        if (filters.language) {
          query = query.eq('language', filters.language);
        }
        if (filters.material) {
          query = query.ilike('material', `%${filters.material}%`);
        }
        if (filters.dateFrom) {
          query = query.gte('publication_year', parseInt(filters.dateFrom));
        }
        if (filters.dateTo) {
          query = query.lte('publication_year', parseInt(filters.dateTo));
        }

        // Tri
        query = query.order(filters.sortBy || 'created_at', { 
          ascending: filters.sortOrder === 'asc' 
        });

        // Pagination
        query = query.range(offset, offset + perPage - 1);

        const { data, error, count } = await query;

        if (error) throw error;
        setDocuments(data || []);
        setTotalCount(count || 0);
      } else {
        // Table content pour les autres types
        const contentType = COLLECTION_TYPE_MAP[collectionType] as 'event' | 'exhibition' | 'news' | 'page';
        let query = supabase
          .from('content')
          .select('*', { count: 'exact' })
          .eq('content_type', contentType)
          .eq('status', 'published')
          .eq('is_visible', true);

        // Filtres
        if (filters.title) {
          query = query.ilike('title', `%${filters.title}%`);
        }
        if (filters.dateFrom) {
          query = query.gte('published_at', filters.dateFrom);
        }
        if (filters.dateTo) {
          query = query.lte('published_at', filters.dateTo);
        }
        if (filters.documentType && filters.documentType !== 'all') {
          query = query.eq('file_type', filters.documentType);
        }

        // Tri
        query = query.order(filters.sortBy || 'created_at', { 
          ascending: filters.sortOrder === 'asc' 
        });

        // Pagination
        query = query.range(offset, offset + perPage - 1);

        const { data, error, count } = await query;

        if (error) throw error;
        setDocuments(data || []);
        setTotalCount(count || 0);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Charger les facettes pour les filtres
  const [facets, setFacets] = useState<{
    languages: string[];
    types: string[];
    materials: string[];
  }>({ languages: [], types: [], materials: [] });

  const loadFacets = async () => {
    try {
      if (collectionType === 'manuscripts') {
        const { data: languages } = await supabase
          .from('manuscripts')
          .select('language')
          .not('language', 'is', null);

        const { data: materials } = await supabase
          .from('manuscripts')
          .select('material')
          .not('material', 'is', null);

        setFacets({
          languages: [...new Set(languages?.map(d => d.language) || [])],
          types: [],
          materials: [...new Set(materials?.map(d => d.material) || [])],
        });
      } else {
        const contentType = COLLECTION_TYPE_MAP[collectionType] as 'event' | 'exhibition' | 'news' | 'page';
        const { data: types } = await supabase
          .from('content')
          .select('file_type')
          .eq('content_type', contentType)
          .not('file_type', 'is', null);

        setFacets({
          languages: ['fr', 'ar', 'en', 'ber'],
          types: [...new Set(types?.map(d => d.file_type) || [])],
          materials: [],
        });
      }
    } catch (error) {
      console.error('Error loading facets:', error);
    }
  };

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    setCurrentPage(page);
    loadDocuments(page);
    loadFacets();
  }, [collectionType, searchParams]);

  const goToPage = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  return {
    documents,
    loading,
    totalCount,
    currentPage,
    perPage,
    totalPages: Math.ceil(totalCount / perPage),
    filters: getFiltersFromUrl(),
    facets,
    updateFilters,
    goToPage,
    reload: () => loadDocuments(currentPage),
  };
}
