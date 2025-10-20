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
              description: 'Une analyse approfondie de l\'évolution politique, sociale et économique du Maroc depuis l\'indépendance en 1956 jusqu\'à aujourd\'hui. L\'ouvrage explore les grandes transformations sociales, les réformes politiques et le développement économique du royaume.',
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
              metadata: {
                dc_creator: 'Dr. Mohammed Kenbib',
                dc_publisher: 'Publications de la Faculté des Lettres et des Sciences Humaines',
                dc_date: '2020',
                dc_language: 'fr',
                dc_subject: ['Histoire', 'Politique', 'Maroc moderne']
              }
            },
            {
              id: 'mock-2',
              title: 'الأدب المغربي المعاصر - رؤية نقدية',
              description: 'دراسة شاملة للأدب المغربي المعاصر وتطوره عبر العقود الأخيرة، مع التركيز على الأعمال الأدبية البارزة والتيارات الفكرية المؤثرة في المشهد الثقافي المغربي.',
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
              metadata: {
                dc_creator: 'د. عبد الكريم جويطي',
                dc_publisher: 'دار الثقافة',
                dc_date: '2019',
                dc_language: 'ar',
                dc_subject: ['أدب', 'نقد أدبي', 'ثقافة مغربية']
              }
            },
            {
              id: 'mock-3',
              title: 'Architecture Traditionnelle Marocaine - Patrimoine et Modernité',
              description: 'Exploration détaillée de l\'architecture traditionnelle marocaine à travers les siècles. L\'ouvrage analyse les médinas, riads, kasbahs et palais, en mettant en lumière les techniques de construction ancestrales et les éléments décoratifs caractéristiques.',
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
              metadata: {
                dc_creator: 'Fatima-Zahra Benslimane',
                dc_publisher: 'Éditions Marocaines',
                dc_date: '2021',
                dc_language: 'fr',
                dc_subject: ['Architecture', 'Patrimoine architectural', 'Urbanisme']
              }
            },
            {
              id: 'mock-4',
              title: 'La Cuisine Marocaine - Traditions et Recettes Authentiques',
              description: 'Un voyage culinaire à travers les traditions gastronomiques marocaines. Plus de 200 recettes authentiques accompagnées de leurs origines historiques et culturelles. De la cuisine de rue aux plats royaux, découvrez la richesse de la gastronomie marocaine.',
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
              metadata: {
                dc_creator: 'Choumicha Chafay',
                dc_publisher: 'Les Éditions du Goût',
                dc_date: '2022',
                dc_language: 'fr',
                dc_subject: ['Gastronomie', 'Recettes', 'Culture culinaire']
              }
            },
            {
              id: 'mock-5',
              title: 'تاريخ الفن الإسلامي بالمغرب - من العصور الوسطى إلى العصر الحديث',
              description: 'بحث معمق في تاريخ الفن الإسلامي بالمغرب من العصور الوسطى حتى العصر الحديث. دراسة تفصيلية للمعالم الأثرية، الزخارف، الخط العربي والفنون التطبيقية التي تميز الإبداع الفني المغربي.',
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
              metadata: {
                dc_creator: 'د. أحمد سكونتي',
                dc_publisher: 'منشورات وزارة الثقافة',
                dc_date: '2018',
                dc_language: 'ar',
                dc_subject: ['فن إسلامي', 'تاريخ الفن', 'آثار']
              }
            },
            {
              id: 'mock-6',
              title: 'Le Maroc et la Méditerranée - Relations Historiques et Culturelles',
              description: 'Analyse approfondie des relations historiques du Maroc avec les pays méditerranéens, de l\'antiquité à l\'époque moderne. L\'ouvrage examine les échanges commerciaux, culturels et diplomatiques qui ont façonné l\'identité méditerranéenne du royaume.',
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
              metadata: {
                dc_creator: 'Prof. Abdallah Laroui',
                dc_publisher: 'Centre Jacques-Berque',
                dc_date: '2017',
                dc_language: 'fr',
                dc_subject: ['Histoire méditerranéenne', 'Relations internationales', 'Diplomatie']
              }
            },
            {
              id: 'mock-7',
              title: 'الموسيقى الأندلسية المغربية - تاريخ وتطور',
              description: 'دراسة شاملة للموسيقى الأندلسية المغربية، تاريخها، أنواعها (الآلة، الغرناطي، الملحون) وتطورها عبر العصور. يتناول الكتاب المقامات، الإيقاعات والآلات الموسيقية التقليدية.',
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
              metadata: {
                dc_creator: 'عبد الوهاب بلقايد',
                dc_publisher: 'دار الموسيقى',
                dc_date: '2021',
                dc_language: 'ar',
                dc_subject: ['موسيقى أندلسية', 'تراث موسيقي', 'فنون']
              }
            },
            {
              id: 'mock-8',
              title: 'Guide du Patrimoine Culturel Marocain UNESCO',
              description: 'Guide officiel recensant les sites du patrimoine culturel marocain classés par l\'UNESCO et les monuments historiques nationaux. Fiches détaillées pour chaque site avec photos, historique et informations pratiques pour les visiteurs.',
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
              metadata: {
                dc_creator: 'Ministère de la Culture',
                dc_publisher: 'Ministère de la Culture du Maroc',
                dc_date: '2023',
                dc_language: 'fr',
                dc_subject: ['Patrimoine mondial', 'Monuments historiques', 'Tourisme culturel']
              }
            },
            {
              id: 'mock-9',
              title: 'الصحافة المغربية - نشأة وتطور',
              description: 'تاريخ الصحافة المغربية منذ نشأتها في القرن التاسع عشر وحتى العصر الرقمي. دراسة تحليلية للدور الذي لعبته الصحافة في التحولات السياسية والاجتماعية بالمغرب.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.pdf',
              file_type: 'PDF',
              language: 'العربية',
              published_at: '2020-12-05',
              created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'document',
              view_count: 1456,
              download_enabled: true,
              tags: ['Journalisme', 'Médias', 'Histoire'],
              metadata: {
                dc_creator: 'د. محمد العربي المساري',
                dc_publisher: 'دار النشر المغربية',
                dc_date: '2020',
                dc_language: 'ar',
                dc_subject: ['صحافة', 'إعلام', 'تاريخ معاصر']
              }
            },
            {
              id: 'mock-10',
              title: 'Les Dynasties Marocaines - Pouvoir et Civilisation',
              description: 'Panorama complet des grandes dynasties qui ont régné sur le Maroc : Idrissides, Almoravides, Almohades, Mérinides, Saadiens et Alaouites. Analyse de leur contribution à la civilisation marocaine et à l\'histoire du Maghreb.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.pdf',
              file_type: 'PDF',
              language: 'Français',
              published_at: '2019-04-22',
              created_at: new Date(Date.now() - 280 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'document',
              view_count: 3421,
              download_enabled: true,
              tags: ['Histoire', 'Dynasties', 'Civilisation'],
              metadata: {
                dc_creator: 'Dr. Hassan Aourid',
                dc_publisher: 'Éditions La Croisée des Chemins',
                dc_date: '2019',
                dc_language: 'fr',
                dc_subject: ['Histoire médiévale', 'Dynasties', 'Pouvoir politique']
              }
            },
            {
              id: 'mock-11',
              title: 'التراث الشفوي الأمازيغي - حكايات وأساطير',
              description: 'جمع وتوثيق للتراث الشفوي الأمازيغي من مختلف مناطق المغرب. حكايات، أساطير، أمثال وأشعار شعبية تعكس الثقافة والحكمة الأمازيغية عبر العصور.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.pdf',
              file_type: 'PDF',
              language: 'ⴰⵎⴰⵣⵉⵖ',
              published_at: '2022-06-15',
              created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'document',
              view_count: 892,
              download_enabled: true,
              tags: ['Amazigh', 'Patrimoine', 'Tradition orale'],
              metadata: {
                dc_creator: 'د. فاطمة بودشار',
                dc_publisher: 'المعهد الملكي للثقافة الأمازيغية',
                dc_date: '2022',
                dc_language: 'ber',
                dc_subject: ['تراث شفوي', 'ثقافة أمازيغية', 'أدب شعبي']
              }
            },
            {
              id: 'mock-12',
              title: 'L\'Économie Marocaine - Défis et Perspectives',
              description: 'Analyse économique approfondie du Maroc contemporain. Étude des secteurs clés (agriculture, industrie, services, tourisme), des politiques économiques et des enjeux du développement durable.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.pdf',
              file_type: 'PDF',
              language: 'Français',
              published_at: '2023-03-20',
              created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'document',
              view_count: 2876,
              download_enabled: true,
              tags: ['Économie', 'Développement', 'Politique économique'],
              metadata: {
                dc_creator: 'Prof. Najib Akesbi',
                dc_publisher: 'Institut Marocain d\'Analyse des Politiques',
                dc_date: '2023',
                dc_language: 'fr',
                dc_subject: ['Économie', 'Développement économique', 'Politiques publiques']
              }
            },
            {
              id: 'mock-13',
              title: 'الخط العربي والزخرفة المغربية',
              description: 'دراسة فنية شاملة للخط العربي والزخرفة في الفن المغربي. أنواع الخطوط (الكوفي، الثلث، النسخ)، تقنيات الزخرفة الهندسية والنباتية، وتطبيقاتها في العمارة والمخطوطات.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.pdf',
              file_type: 'PDF',
              language: 'العربية',
              published_at: '2021-11-08',
              created_at: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'document',
              view_count: 1234,
              download_enabled: true,
              tags: ['Calligraphie', 'Art', 'Décoration'],
              metadata: {
                dc_creator: 'الخطاط محمد المليحي',
                dc_publisher: 'دار الفنون',
                dc_date: '2021',
                dc_language: 'ar',
                dc_subject: ['خط عربي', 'زخرفة', 'فنون تشكيلية']
              }
            },
            {
              id: 'mock-14',
              title: 'Le Soufisme au Maroc - Histoire et Spiritualité',
              description: 'Exploration de la tradition soufie marocaine, ses grandes figures (Chadiliya, Tijania, Boutchichiya), ses pratiques spirituelles et son influence sur la société marocaine à travers les siècles.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.pdf',
              file_type: 'PDF',
              language: 'Français',
              published_at: '2018-10-12',
              created_at: new Date(Date.now() - 380 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'document',
              view_count: 1678,
              download_enabled: true,
              tags: ['Soufisme', 'Religion', 'Spiritualité'],
              metadata: {
                dc_creator: 'Dr. Mohamed Tozy',
                dc_publisher: 'Centre d\'Études et de Recherches',
                dc_date: '2018',
                dc_language: 'fr',
                dc_subject: ['Soufisme', 'Islam', 'Histoire religieuse']
              }
            },
            {
              id: 'mock-15',
              title: 'المرأة المغربية - تاريخ وتحديات معاصرة',
              description: 'دراسة سوسيولوجية وتاريخية لوضع المرأة المغربية عبر العصور. تحليل للتحولات الاجتماعية، المكتسبات القانونية والتحديات المعاصرة في مسار التحرر والمساواة.',
              thumbnail_url: '/placeholder.svg',
              file_url: '/placeholder.pdf',
              file_type: 'PDF',
              language: 'العربية',
              published_at: '2022-03-08',
              created_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              content_type: 'document',
              view_count: 2145,
              download_enabled: true,
              tags: ['Société', 'Femmes', 'Droits'],
              metadata: {
                dc_creator: 'د. فاطمة المرنيسي',
                dc_publisher: 'منشورات الفنك',
                dc_date: '2022',
                dc_language: 'ar',
                dc_subject: ['قضايا المرأة', 'مجتمع', 'حقوق الإنسان']
              }
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
