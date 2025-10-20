import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';

export interface AdvancedSearchFilters {
  author?: string;
  title?: string;
  subject?: string;
  isbn?: string;
  dateFrom?: string;
  dateTo?: string;
  language?: string;
  documentType?: string;
}

export interface SearchResultItem {
  id: string;
  title: string;
  author?: string;
  description?: string;
  thumbnail_url?: string;
  language?: string;
  published_at?: string;
  publication_year?: number;
  content_type?: string;
  source_table: 'content' | 'manuscripts';
  tags?: string[];
  isbn?: string;
  material?: string;
}

export interface AutoCompleteOption {
  value: string;
  label: string;
  type: 'author' | 'title' | 'subject';
  count?: number;
}

export function useAdvancedSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;

  // Auto-completion cache
  const [authorSuggestions, setAuthorSuggestions] = useState<AutoCompleteOption[]>([]);
  const [titleSuggestions, setTitleSuggestions] = useState<AutoCompleteOption[]>([]);
  const [subjectSuggestions, setSubjectSuggestions] = useState<AutoCompleteOption[]>([]);

  // Lire les filtres depuis l'URL
  const getFiltersFromUrl = (): AdvancedSearchFilters => {
    return {
      author: searchParams.get('author') || undefined,
      title: searchParams.get('title') || undefined,
      subject: searchParams.get('subject') || undefined,
      isbn: searchParams.get('isbn') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      language: searchParams.get('language') || undefined,
      documentType: searchParams.get('documentType') || undefined,
    };
  };

  // Mettre à jour les filtres dans l'URL
  const updateFilters = (filters: Partial<AdvancedSearchFilters>) => {
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

  // Recherche principale
  const search = async (page: number = 1) => {
    setLoading(true);
    const filters = getFiltersFromUrl();
    const offset = (page - 1) * perPage;

    try {
      let allResults: SearchResultItem[] = [];
      let totalResults = 0;

      // Recherche dans la table content
      if (!filters.documentType || filters.documentType !== 'manuscript') {
        let contentQuery = supabase
          .from('content')
          .select('*', { count: 'exact' })
          .eq('status', 'published')
          .eq('is_visible', true);

        if (filters.title) {
          contentQuery = contentQuery.ilike('title', `%${filters.title}%`);
        }
        if (filters.subject) {
          contentQuery = contentQuery.or(`tags.cs.{${filters.subject}},meta_description.ilike.%${filters.subject}%`);
        }
        if (filters.language) {
          contentQuery = contentQuery.eq('content_type', filters.language as any);
        }
        if (filters.dateFrom) {
          contentQuery = contentQuery.gte('published_at', `${filters.dateFrom}-01-01`);
        }
        if (filters.dateTo) {
          contentQuery = contentQuery.lte('published_at', `${filters.dateTo}-12-31`);
        }
        if (filters.documentType) {
          const typeMap: Record<string, 'event' | 'exhibition' | 'news' | 'page'> = {
            'book': 'page',
            'periodical': 'news',
            'image': 'exhibition',
            'audio': 'event',
            'video': 'event'
          };
          const mappedType = typeMap[filters.documentType];
          if (mappedType) {
            contentQuery = contentQuery.eq('content_type', mappedType);
          }
        }

        const { data: contentData, error: contentError, count: contentCount } = await contentQuery
          .order('published_at', { ascending: false })
          .range(offset, offset + perPage - 1);

        if (!contentError && contentData) {
          allResults.push(...contentData.map(item => ({
            ...item,
            source_table: 'content' as const,
            publication_year: item.published_at ? new Date(item.published_at).getFullYear() : undefined,
          })));
          totalResults += contentCount || 0;
        }
      }

      // Recherche dans la table manuscripts
      if (!filters.documentType || filters.documentType === 'manuscript') {
        let manuscriptQuery = supabase
          .from('manuscripts')
          .select('*', { count: 'exact' })
          .eq('is_visible', true);

        if (filters.title) {
          manuscriptQuery = manuscriptQuery.ilike('title', `%${filters.title}%`);
        }
        if (filters.author) {
          manuscriptQuery = manuscriptQuery.ilike('author', `%${filters.author}%`);
        }
        if (filters.subject) {
          manuscriptQuery = manuscriptQuery.or(`subject.cs.{${filters.subject}},description.ilike.%${filters.subject}%`);
        }
        if (filters.language) {
          manuscriptQuery = manuscriptQuery.eq('language', filters.language);
        }
        if (filters.dateFrom) {
          manuscriptQuery = manuscriptQuery.gte('publication_year', parseInt(filters.dateFrom));
        }
        if (filters.dateTo) {
          manuscriptQuery = manuscriptQuery.lte('publication_year', parseInt(filters.dateTo));
        }

        const { data: manuscriptData, error: manuscriptError, count: manuscriptCount } = await manuscriptQuery
          .order('created_at', { ascending: false })
          .range(offset, offset + perPage - 1);

        if (!manuscriptError && manuscriptData) {
          allResults.push(...manuscriptData.map(item => ({
            ...item,
            source_table: 'manuscripts' as const,
            content_type: 'manuscript',
          })));
          totalResults += manuscriptCount || 0;
        }
      }

      setResults(allResults);
      setTotalCount(totalResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Auto-complétion pour les auteurs
  const fetchAuthorSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setAuthorSuggestions([]);
      return;
    }

    try {
      const { data } = await supabase
        .from('manuscripts')
        .select('author')
        .ilike('author', `%${query}%`)
        .not('author', 'is', null)
        .limit(10);

      if (data) {
        const uniqueAuthors = [...new Set(data.map(d => d.author!))];
        setAuthorSuggestions(
          uniqueAuthors.map(author => ({
            value: author,
            label: author,
            type: 'author' as const,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching author suggestions:', error);
    }
  };

  // Auto-complétion pour les titres
  const fetchTitleSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setTitleSuggestions([]);
      return;
    }

    try {
      // Recherche dans content
      const { data: contentData } = await supabase
        .from('content')
        .select('title')
        .ilike('title', `%${query}%`)
        .eq('is_visible', true)
        .limit(5);

      // Recherche dans manuscripts
      const { data: manuscriptData } = await supabase
        .from('manuscripts')
        .select('title')
        .ilike('title', `%${query}%`)
        .eq('is_visible', true)
        .limit(5);

      const allTitles = [
        ...(contentData || []).map(d => d.title),
        ...(manuscriptData || []).map(d => d.title),
      ];

      setTitleSuggestions(
        allTitles.map(title => ({
          value: title,
          label: title,
          type: 'title' as const,
        }))
      );
    } catch (error) {
      console.error('Error fetching title suggestions:', error);
    }
  };

  // Auto-complétion pour les sujets
  const fetchSubjectSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSubjectSuggestions([]);
      return;
    }

    try {
      // Tags de content
      const { data: contentData } = await supabase
        .from('content')
        .select('tags')
        .not('tags', 'is', null);

      // Subjects de manuscripts
      const { data: manuscriptData } = await supabase
        .from('manuscripts')
        .select('subject')
        .not('subject', 'is', null);

      const allTags = new Set<string>();
      
      contentData?.forEach(item => {
        if (Array.isArray(item.tags)) {
          item.tags.forEach(tag => {
            if (tag.toLowerCase().includes(query.toLowerCase())) {
              allTags.add(tag);
            }
          });
        }
      });

      manuscriptData?.forEach(item => {
        if (Array.isArray(item.subject)) {
          item.subject.forEach(subject => {
            if (subject.toLowerCase().includes(query.toLowerCase())) {
              allTags.add(subject);
            }
          });
        }
      });

      setSubjectSuggestions(
        Array.from(allTags).slice(0, 10).map(subject => ({
          value: subject,
          label: subject,
          type: 'subject' as const,
        }))
      );
    } catch (error) {
      console.error('Error fetching subject suggestions:', error);
    }
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = ['Titre', 'Auteur', 'Type', 'Langue', 'Année', 'Description'];
    const rows = results.map(r => [
      r.title,
      r.author || '',
      r.content_type || '',
      r.language || '',
      r.publication_year?.toString() || r.published_at || '',
      r.description || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `resultats_recherche_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Export PDF (simple)
  const exportToPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Résultats de recherche', 20, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    let y = 40;
    results.forEach((result, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${result.title}`, 20, y);
      y += 7;

      doc.setFont('helvetica', 'normal');
      if (result.author) {
        doc.text(`Auteur: ${result.author}`, 25, y);
        y += 5;
      }
      if (result.language) {
        doc.text(`Langue: ${result.language}`, 25, y);
        y += 5;
      }
      if (result.description) {
        const splitText = doc.splitTextToSize(result.description, 170);
        doc.text(splitText.slice(0, 2), 25, y);
        y += 5 * Math.min(splitText.length, 2);
      }
      y += 5;
    });

    doc.save(`resultats_recherche_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    setCurrentPage(page);
    
    const filters = getFiltersFromUrl();
    const hasFilters = Object.values(filters).some(v => v);
    
    if (hasFilters) {
      search(page);
    }
  }, [searchParams]);

  const goToPage = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  return {
    results,
    loading,
    totalCount,
    currentPage,
    perPage,
    totalPages: Math.ceil(totalCount / perPage),
    filters: getFiltersFromUrl(),
    authorSuggestions,
    titleSuggestions,
    subjectSuggestions,
    updateFilters,
    goToPage,
    search,
    fetchAuthorSuggestions,
    fetchTitleSuggestions,
    fetchSubjectSuggestions,
    exportToCSV,
    exportToPDF,
  };
}
