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
  isRare?: string;
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
      isRare: searchParams.get('isRare') || undefined,
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
        // Afficher directement les données mock selon le type de collection
        let mockData: CollectionDocument[] = [];
        
        if (collectionType === 'books') {
          mockData = [
            {
              id: 'mock-1',
              title: 'Histoire du Maroc - De l\'indépendance à nos jours',
              description: 'Une analyse approfondie de l\'évolution politique, sociale et économique du Maroc depuis l\'indépendance en 1956 jusqu\'à aujourd\'hui.',
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
              title: 'الأدب المغربي المعاصر - رؤية نقدية',
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
              description: 'Exploration détaillée de l\'architecture traditionnelle marocaine à travers les siècles.',
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
              tags: ['Architecture', 'Patrimoine'],
            },
            {
              id: 'mock-4',
              title: 'La Cuisine Marocaine - Traditions et Recettes',
              description: 'Un voyage culinaire à travers les traditions gastronomiques marocaines avec plus de 200 recettes authentiques.',
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
              tags: ['Cuisine', 'Culture'],
            },
            {
              id: 'mock-5',
              title: 'تاريخ الفن الإسلامي بالمغرب',
              description: 'بحث معمق في تاريخ الفن الإسلامي بالمغرب من العصور الوسطى حتى العصر الحديث.',
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
              tags: ['Art', 'Islam'],
            },
          ];
        } else if (collectionType === 'periodicals') {
          mockData = [
            {
              id: 'mock-per-1',
              title: 'Al Alam - Archives 1946-1956',
              description: 'Collection complète du quotidien Al Alam durant la période de lutte pour l\'indépendance. Documents historiques essentiels.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.pdf',
              file_type: 'PDF',
              language: 'العربية',
              published_at: '1946-01-01',
              created_at: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'journal',
              view_count: 4521,
              download_enabled: true,
              tags: ['Presse', 'Histoire', 'Indépendance'],
            },
            {
              id: 'mock-per-2',
              title: 'La Vie Économique - Numéros 2020-2023',
              description: 'Revue économique hebdomadaire couvrant l\'actualité économique et financière du Maroc.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.pdf',
              file_type: 'PDF',
              language: 'Français',
              published_at: '2023-12-01',
              created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'journal',
              view_count: 2876,
              download_enabled: true,
              tags: ['Économie', 'Finance', 'Actualité'],
            },
            {
              id: 'mock-per-3',
              title: 'Revue Marocaine des Sciences Politiques et Sociales',
              description: 'Publication académique semestrielle consacrée aux sciences politiques et sociales.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.pdf',
              file_type: 'PDF',
              language: 'Français',
              published_at: '2023-06-15',
              created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'journal',
              view_count: 1543,
              download_enabled: true,
              tags: ['Sciences politiques', 'Recherche', 'Académie'],
            },
            {
              id: 'mock-per-4',
              title: 'مجلة دعوة الحق - أعداد تاريخية',
              description: 'المجلة الدينية الشهرية الصادرة عن وزارة الأوقاف والشؤون الإسلامية منذ 1957.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.pdf',
              file_type: 'PDF',
              language: 'العربية',
              published_at: '2022-01-01',
              created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'journal',
              view_count: 3234,
              download_enabled: true,
              tags: ['Religion', 'Islam', 'Culture'],
            },
            {
              id: 'mock-per-5',
              title: 'Bulletin de la Société de Géographie du Maroc',
              description: 'Publication scientifique trimestrielle de géographie et cartographie du territoire marocain.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.pdf',
              file_type: 'PDF',
              language: 'Français',
              published_at: '2021-09-20',
              created_at: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'journal',
              view_count: 987,
              download_enabled: true,
              tags: ['Géographie', 'Cartographie', 'Science'],
            },
            {
              id: 'mock-per-6',
              title: 'Maroc Hebdo - Collection 2015-2020',
              description: 'Magazine hebdomadaire d\'actualité générale, politique et économique.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.pdf',
              file_type: 'PDF',
              language: 'Français',
              published_at: '2020-12-31',
              created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'journal',
              view_count: 2145,
              download_enabled: true,
              tags: ['Actualité', 'Magazine', 'Politique'],
            },
          ];
        } else if (collectionType === 'photos') {
          mockData = [
            {
              id: 'mock-photo-1',
              title: 'Marrakech 1920 - Photographies coloniales',
              description: 'Collection de photographies historiques de Marrakech dans les années 1920. Vue sur la Koutoubia, les souks et la vie quotidienne.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.jpg',
              file_type: 'JPEG',
              language: 'Français',
              published_at: '1920-01-01',
              created_at: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'image',
              view_count: 5678,
              download_enabled: true,
              tags: ['Photographie', 'Histoire', 'Marrakech'],
            },
            {
              id: 'mock-photo-2',
              title: 'Cartes anciennes du Maroc - XVIIIe siècle',
              description: 'Collection de cartes géographiques anciennes du Maroc, gravures et lithographies du 18ème siècle.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.jpg',
              file_type: 'JPEG',
              language: 'Français',
              published_at: '1750-01-01',
              created_at: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'image',
              view_count: 3456,
              download_enabled: true,
              tags: ['Cartographie', 'Histoire', 'Patrimoine'],
            },
            {
              id: 'mock-photo-3',
              title: 'Fès - Architecture et Artisanat',
              description: 'Photographies contemporaines de l\'architecture traditionnelle et des artisans de Fès.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.jpg',
              file_type: 'JPEG',
              language: 'Français',
              published_at: '2022-05-10',
              created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'image',
              view_count: 2341,
              download_enabled: true,
              tags: ['Architecture', 'Artisanat', 'Fès'],
            },
            {
              id: 'mock-photo-4',
              title: 'صور تاريخية للرباط - عاصمة المغرب',
              description: 'مجموعة من الصور التاريخية لمدينة الرباط: صومعة حسان، باب الرواح، القصبة الأوداية.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.jpg',
              file_type: 'JPEG',
              language: 'العربية',
              published_at: '1930-01-01',
              created_at: new Date(Date.now() - 320 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'image',
              view_count: 4123,
              download_enabled: true,
              tags: ['Photographie', 'Rabat', 'Monuments'],
            },
            {
              id: 'mock-photo-5',
              title: 'Atlas Mountains - Paysages et Villages Berbères',
              description: 'Collection photographique des paysages de l\'Atlas et des villages berbères traditionnels.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.jpg',
              file_type: 'JPEG',
              language: 'Français',
              published_at: '2023-08-15',
              created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'image',
              view_count: 3892,
              download_enabled: true,
              tags: ['Paysage', 'Atlas', 'Berbère'],
            },
          ];
        } else if (collectionType === 'audiovisual') {
          mockData = [
            {
              id: 'mock-av-1',
              title: 'Discours historiques de Mohammed V',
              description: 'Collection d\'enregistrements audio des discours historiques du Roi Mohammed V durant la lutte pour l\'indépendance.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.mp3',
              file_type: 'MP3',
              language: 'العربية',
              published_at: '1953-08-20',
              created_at: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'video',
              view_count: 8934,
              download_enabled: true,
              tags: ['Audio', 'Histoire', 'Indépendance'],
            },
            {
              id: 'mock-av-2',
              title: 'Musique Andalouse - Enregistrements authentiques',
              description: 'Archives sonores de concerts de musique andalouse marocaine par les grands maîtres.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.mp3',
              file_type: 'MP3',
              language: 'العربية',
              published_at: '1970-01-01',
              created_at: new Date(Date.now() - 450 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'video',
              view_count: 5623,
              download_enabled: true,
              tags: ['Musique', 'Andalousie', 'Patrimoine'],
            },
            {
              id: 'mock-av-3',
              title: 'Documentaire: Fès, Ville Impériale',
              description: 'Film documentaire sur l\'histoire et le patrimoine de Fès, capitale spirituelle du Maroc.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.mp4',
              file_type: 'MP4',
              language: 'Français',
              published_at: '2018-06-10',
              created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'video',
              view_count: 12456,
              download_enabled: false,
              tags: ['Documentaire', 'Fès', 'Patrimoine'],
            },
            {
              id: 'mock-av-4',
              title: 'التراث الشفوي الأمازيغي - تسجيلات نادرة',
              description: 'تسجيلات صوتية نادرة للحكايات والأشعار الأمازيغية التقليدية من مختلف مناطق المغرب.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.mp3',
              file_type: 'MP3',
              language: 'ⴰⵎⴰⵣⵉⵖ',
              published_at: '1980-01-01',
              created_at: new Date(Date.now() - 380 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'video',
              view_count: 3421,
              download_enabled: true,
              tags: ['Oral', 'Amazighe', 'Traditions'],
            },
            {
              id: 'mock-av-5',
              title: 'Maroc des Années 60 - Archives INA',
              description: 'Reportages télévisés sur le Maroc des années 1960: développement, culture et société.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.mp4',
              file_type: 'MP4',
              language: 'Français',
              published_at: '1965-01-01',
              created_at: new Date(Date.now() - 420 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'video',
              view_count: 6789,
              download_enabled: false,
              tags: ['Archives', 'Années 60', 'Société'],
            },
          ];
        }

        // Appliquer les filtres sur les mock data
        let filteredMocks = mockData;
        
        if (filters.title) {
          filteredMocks = filteredMocks.filter(book => 
            book.title.toLowerCase().includes(filters.title!.toLowerCase())
          );
        }
        
        if (filters.language && filters.language !== 'all') {
          filteredMocks = filteredMocks.filter(book => book.language === filters.language);
        }

        if (filters.dateFrom) {
          filteredMocks = filteredMocks.filter(book => 
            book.published_at && book.published_at >= filters.dateFrom!
          );
        }

        if (filters.dateTo) {
          filteredMocks = filteredMocks.filter(book => 
            book.published_at && book.published_at <= filters.dateTo!
          );
        }

        // Tri
        const sortBy = filters.sortBy || 'created_at';
        const sortOrder = filters.sortOrder || 'desc';
        filteredMocks.sort((a, b) => {
          const aVal = a[sortBy] || '';
          const bVal = b[sortBy] || '';
          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return sortOrder === 'asc' ? comparison : -comparison;
        });

        // Pagination
        const paginatedMocks = filteredMocks.slice(offset, offset + perPage);

        setDocuments(paginatedMocks);
        setTotalCount(filteredMocks.length);
        setLoading(false);
        return;
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
          languages: ['fr', 'ar', 'en', 'es', 'amz'],
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
