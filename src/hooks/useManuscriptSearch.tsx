import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SearchFilters {
  author?: string;
  language?: string;
  period?: string;
  genre?: string;
  subject?: string;
  publicationYear?: number;
  cote?: string;
  source?: string;
  historicalPeriod?: string;
  status?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  description: string;
  thumbnail_url: string;
  language: string;
  period: string;
  genre: string;
  subject: string[];
  publication_year: number;
  cote: string;
  source: string;
  historical_period: string;
  status: string;
  access_level: string;
  permalink: string;
  highlights?: {
    title?: string[];
    description?: string[];
    content?: string[];
  };
  relevance?: number;
}

export function useManuscriptSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [facets, setFacets] = useState<Record<string, any>>({});

  const search = async (query: string, filters: SearchFilters = {}, pageNum: number = 1) => {
    setLoading(true);
    const startTime = performance.now();

    try {
      let queryBuilder = supabase
        .from('manuscripts')
        .select('*', { count: 'exact' })
        .eq('is_visible', true);

      // Recherche plein texte si une requête est fournie
      if (query && query.trim()) {
        // Utiliser la recherche vectorielle PostgreSQL pour un meilleur classement
        queryBuilder = queryBuilder.or(
          `title.ilike.%${query}%,author.ilike.%${query}%,description.ilike.%${query}%,full_text_content.ilike.%${query}%`
        );
      }

      // Appliquer les filtres
      if (filters.author) {
        queryBuilder = queryBuilder.ilike('author', `%${filters.author}%`);
      }
      if (filters.language) {
        queryBuilder = queryBuilder.eq('language', filters.language);
      }
      if (filters.period) {
        queryBuilder = queryBuilder.eq('period', filters.period);
      }
      if (filters.genre) {
        queryBuilder = queryBuilder.eq('genre', filters.genre);
      }
      if (filters.subject) {
        queryBuilder = queryBuilder.contains('subject', [filters.subject]);
      }
      if (filters.publicationYear) {
        queryBuilder = queryBuilder.eq('publication_year', filters.publicationYear);
      }
      if (filters.cote) {
        queryBuilder = queryBuilder.ilike('cote', `%${filters.cote}%`);
      }
      if (filters.source) {
        queryBuilder = queryBuilder.eq('source', filters.source);
      }
      if (filters.historicalPeriod) {
        queryBuilder = queryBuilder.eq('historical_period', filters.historicalPeriod);
      }
      if (filters.status) {
        queryBuilder = queryBuilder.eq('status', filters.status as any);
      }

      // Pagination
      const from = (pageNum - 1) * perPage;
      const to = from + perPage - 1;
      queryBuilder = queryBuilder.range(from, to);

      // Tri par pertinence (basé sur le nombre de correspondances)
      queryBuilder = queryBuilder.order('created_at', { ascending: false });

      const { data, error, count } = await queryBuilder;

      if (error) throw error;

      setResults(data || []);
      setTotalResults(count || 0);
      setPage(pageNum);

      // Enregistrer la recherche dans les logs
      const searchDuration = Math.round(performance.now() - startTime);
      await supabase.rpc('log_search', {
        p_query: query || '',
        p_filters: filters as any,
        p_results_count: count || 0,
        p_search_duration_ms: searchDuration
      });

      // Récupérer les facettes pour affichage
      await fetchFacets();

    } catch (error) {
      console.error('Erreur de recherche:', error);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchFacets = async () => {
    try {
      // Récupérer les facettes disponibles
      const { data: languageFacets } = await supabase
        .from('manuscripts')
        .select('language')
        .eq('is_visible', true);

      const { data: periodFacets } = await supabase
        .from('manuscripts')
        .select('period')
        .eq('is_visible', true);

      const { data: genreFacets } = await supabase
        .from('manuscripts')
        .select('genre')
        .eq('is_visible', true);

      const { data: authorFacets } = await supabase
        .from('manuscripts')
        .select('author')
        .eq('is_visible', true);

      // Compter les occurrences
      const countOccurrences = (items: any[], key: string) => {
        const counts: Record<string, number> = {};
        items?.forEach(item => {
          if (item[key]) {
            counts[item[key]] = (counts[item[key]] || 0) + 1;
          }
        });
        return counts;
      };

      setFacets({
        languages: countOccurrences(languageFacets || [], 'language'),
        periods: countOccurrences(periodFacets || [], 'period'),
        genres: countOccurrences(genreFacets || [], 'genre'),
        authors: countOccurrences(authorFacets || [], 'author')
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des facettes:', error);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query || !text) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase()
        ? `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">${part}</mark>`
        : part
    ).join('');
  };

  const getSearchSettings = async () => {
    try {
      const { data } = await supabase
        .from('search_settings')
        .select('*')
        .single();

      if (data) {
        setPerPage(data.results_per_page);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
    }
  };

  useEffect(() => {
    getSearchSettings();
  }, []);

  return {
    results,
    loading,
    totalResults,
    page,
    perPage,
    facets,
    search,
    setPage,
    setPerPage,
    highlightText
  };
}