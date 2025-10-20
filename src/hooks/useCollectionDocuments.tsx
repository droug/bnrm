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
        
        // Ajouter des exemples si la table est vide
        const documentsData = data || [];
        if (documentsData.length === 0 && collectionType === 'books') {
          const mockBooks: CollectionDocument[] = [
            {
              id: 'mock-1',
              title: 'Histoire du Maroc - De l\'indépendance à nos jours',
              author: 'Dr. Mohammed Kenbib',
              description: 'Une analyse approfondie de l\'évolution politique, sociale et économique du Maroc depuis l\'indépendance en 1956 jusqu\'à nos jours.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.pdf',
              file_type: 'PDF',
              language: 'Français',
              published_at: '2020-05-15',
              created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'document',
              view_count: 2547,
              download_enabled: true,
              tags: ['Histoire', 'Maroc', 'Politique'],
            },
            {
              id: 'mock-2',
              title: 'الأدب المغربي المعاصر',
              author: 'د. عبد الكريم جويطي',
              description: 'دراسة شاملة للأدب المغربي المعاصر وتطوره عبر العقود الأخيرة، مع التركيز على الأعمال الأدبية البارزة.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.pdf',
              file_type: 'PDF',
              language: 'العربية',
              published_at: '2019-11-20',
              created_at: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'document',
              view_count: 1823,
              download_enabled: true,
              tags: ['Littérature', 'Arabe', 'Culture'],
            },
            {
              id: 'mock-3',
              title: 'Architecture Traditionnelle Marocaine',
              author: 'Fatima-Zahra Benslimane',
              description: 'Exploration détaillée de l\'architecture traditionnelle marocaine à travers les siècles, incluant les médinas, riads et kasbahs.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.pdf',
              file_type: 'PDF',
              language: 'Français',
              published_at: '2021-03-10',
              created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'document',
              view_count: 3156,
              download_enabled: true,
              tags: ['Architecture', 'Patrimoine', 'Artisanat'],
            },
            {
              id: 'mock-4',
              title: 'La Cuisine Marocaine - Traditions et Recettes',
              author: 'Choumicha Chafay',
              description: 'Un voyage culinaire à travers les traditions gastronomiques marocaines, avec plus de 200 recettes authentiques et leurs origines historiques.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.pdf',
              file_type: 'PDF',
              language: 'Français',
              published_at: '2022-01-25',
              created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'document',
              view_count: 4892,
              download_enabled: true,
              tags: ['Cuisine', 'Culture', 'Traditions'],
            },
            {
              id: 'mock-5',
              title: 'تاريخ الفن الإسلامي بالمغرب',
              author: 'د. أحمد سكونتي',
              description: 'بحث معمق في تاريخ الفن الإسلامي بالمغرب من العصور الوسطى حتى العصر الحديث، مع دراسة تفصيلية للمعالم الأثرية.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.pdf',
              file_type: 'PDF',
              language: 'العربية',
              published_at: '2018-09-12',
              created_at: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'document',
              view_count: 1567,
              download_enabled: true,
              tags: ['Art', 'Islam', 'Histoire'],
            },
            {
              id: 'mock-6',
              title: 'Le Maroc et la Méditerranée - Relations Historiques',
              author: 'Prof. Abdallah Laroui',
              description: 'Analyse des relations historiques du Maroc avec les pays méditerranéens, de l\'antiquité à l\'époque moderne.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.pdf',
              file_type: 'PDF',
              language: 'Français',
              published_at: '2017-06-30',
              created_at: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'document',
              view_count: 2134,
              download_enabled: true,
              tags: ['Histoire', 'Géopolitique', 'Méditerranée'],
            },
            {
              id: 'mock-7',
              title: 'الموسيقى الأندلسية المغربية',
              author: 'عبد الوهاب بلقايد',
              description: 'دراسة شاملة للموسيقى الأندلسية المغربية، تاريخها، أنواعها وتطورها عبر العصور.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.pdf',
              file_type: 'PDF',
              language: 'العربية',
              published_at: '2021-08-18',
              created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'document',
              view_count: 987,
              download_enabled: true,
              tags: ['Musique', 'Andalousie', 'Patrimoine'],
            },
            {
              id: 'mock-8',
              title: 'Guide du Patrimoine Culturel Marocain',
              author: 'Ministère de la Culture',
              description: 'Guide officiel recensant les sites du patrimoine culturel marocain classés par l\'UNESCO et les monuments historiques nationaux.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.pdf',
              file_type: 'PDF',
              language: 'Français',
              published_at: '2023-02-14',
              created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'document',
              view_count: 5234,
              download_enabled: true,
              tags: ['Patrimoine', 'UNESCO', 'Tourisme'],
            },
          ];
          setDocuments(mockBooks);
          setTotalCount(mockBooks.length);
        } else {
          setDocuments(documentsData);
          setTotalCount(count || 0);
        }
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
