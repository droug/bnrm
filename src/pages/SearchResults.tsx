import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Filter, SortAsc, SortDesc, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SearchResult {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  content_type: string;
  language: string;
  keywords: string[];
  author: string;
  category?: string;
  tags?: string[];
  url: string;
  published_at: number;
  access_level: string;
  is_featured: boolean;
  view_count: number;
  highlights?: {
    title?: string[];
    content?: string[];
    excerpt?: string[];
  };
}

interface SearchResponse {
  hits: Array<{
    document: SearchResult;
    highlights: any;
  }>;
  found: number;
  search_time_ms: number;
  page: number;
  facet_counts: Array<{
    field_name: string;
    counts: Array<{
      value: string;
      count: number;
    }>;
  }>;
}

interface Filters {
  content_type: string[];
  language: string[];
  author: string[];
  category: string[];
  is_featured: boolean | null;
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { user, profile } = useAuth();

  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    content_type: [],
    language: [],
    author: [],
    category: [],
    is_featured: null
  });

  const query = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('per_page') || '10');
  const sortBy = searchParams.get('sort_by') || 'published_at:desc';

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, currentPage, perPage, sortBy, filters]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const searchOptions = {
        language: filters.language.length > 0 ? filters.language.join(',') : '',
        content_type: filters.content_type.length > 0 ? filters.content_type.join(',') : '',
        author: filters.author.length > 0 ? filters.author.join(',') : '',
        category: filters.category.length > 0 ? filters.category.join(',') : '',
        page: currentPage,
        per_page: perPage,
        sort_by: sortBy,
        user_role: profile?.role || 'visitor'
      };

      const { data, error } = await supabase.functions.invoke('search-engine', {
        body: {
          query,
          ...searchOptions
        }
      });

      if (error) throw error;

      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      toast.error(language === 'ar' ? 'خطأ في البحث' : 'Erreur de recherche');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filterType: keyof Filters, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked 
        ? [...(prev[filterType] as string[]), value]
        : (prev[filterType] as string[]).filter(v => v !== value)
    }));
  };

  const updateSearchParams = (updates: Record<string, string | number>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      newParams.set(key, value.toString());
    });
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: newPage });
  };

  const handlePerPageChange = (newPerPage: string) => {
    updateSearchParams({ per_page: newPerPage, page: 1 });
  };

  const handleSortChange = (newSort: string) => {
    updateSearchParams({ sort_by: newSort, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      content_type: [],
      language: [],
      author: [],
      category: [],
      is_featured: null
    });
  };

  const formatHighlight = (text: string, highlights?: string[]) => {
    if (!highlights || highlights.length === 0) {
      return text.substring(0, 200) + (text.length > 200 ? '...' : '');
    }
    
    return highlights[0].replace(/<mark>/g, '<mark class="bg-yellow-200 text-black">').substring(0, 300) + '...';
  };

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, Record<string, string>> = {
      'article': { fr: 'Article', ar: 'مقال', en: 'Article', ber: 'Amagrad' },
      'news': { fr: 'Actualité', ar: 'أخبار', en: 'News', ber: 'Isallen' },
      'event': { fr: 'Événement', ar: 'حدث', en: 'Event', ber: 'Anagar' },
      'manuscript': { fr: 'Manuscrit', ar: 'مخطوط', en: 'Manuscript', ber: 'Aṛun' },
      'exhibition': { fr: 'Exposition', ar: 'معرض', en: 'Exhibition', ber: 'Timleyt' }
    };
    return labels[type]?.[language] || type;
  };

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">
            {language === 'ar' ? 'البحث في الكتالوج' : 'Recherche dans le catalogue'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {language === 'ar' 
              ? 'اكتب كلمات مفتاحية للبحث في مجموعاتنا'
              : 'Saisissez des mots-clés pour rechercher dans nos collections'
            }
          </p>
          <SearchBar 
            variant="default" 
            className="max-w-md mx-auto"
            showSuggestions={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Search Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              {language === 'ar' ? 'نتائج البحث' : 'Résultats de recherche'}
            </h1>
            {results && (
              <p className="text-muted-foreground">
                {language === 'ar' 
                  ? `${results.found} نتيجة لـ "${query}" في ${results.search_time_ms}ms`
                  : `${results.found} résultats pour "${query}" en ${results.search_time_ms}ms`
                }
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {language === 'ar' ? 'الفلاتر' : 'Filtres'}
            </Button>
          </div>
        </div>

        {/* New Search */}
        <SearchBar 
          variant="default"
          className="max-w-2xl"
          showSuggestions={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {language === 'ar' ? 'الفلاتر' : 'Filtres'}
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    {language === 'ar' ? 'مسح' : 'Effacer'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Results per page */}
                <div>
                  <Label>{language === 'ar' ? 'النتائج في الصفحة' : 'Résultats par page'}</Label>
                  <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort options */}
                <div>
                  <Label>{language === 'ar' ? 'ترتيب النتائج' : 'Trier par'}</Label>
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published_at:desc">
                        {language === 'ar' ? 'الأحدث أولاً' : 'Plus récent'}
                      </SelectItem>
                      <SelectItem value="published_at:asc">
                        {language === 'ar' ? 'الأقدم أولاً' : 'Plus ancien'}
                      </SelectItem>
                      <SelectItem value="view_count:desc">
                        {language === 'ar' ? 'الأكثر مشاهدة' : 'Plus consulté'}
                      </SelectItem>
                      <SelectItem value="title:asc">
                        {language === 'ar' ? 'العنوان (أ-ي)' : 'Titre (A-Z)'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Facet filters */}
                {results?.facet_counts && results.facet_counts.map((facet) => (
                  <div key={facet.field_name}>
                    <Label className="font-medium">
                      {facet.field_name === 'content_type' && (language === 'ar' ? 'نوع المحتوى' : 'Type de contenu')}
                      {facet.field_name === 'language' && (language === 'ar' ? 'اللغة' : 'Langue')}
                      {facet.field_name === 'author' && (language === 'ar' ? 'المؤلف' : 'Auteur')}
                      {facet.field_name === 'category' && (language === 'ar' ? 'الفئة' : 'Catégorie')}
                    </Label>
                    <div className="space-y-2 mt-2">
                      {facet.counts.slice(0, 5).map((count) => (
                        <div key={count.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${facet.field_name}-${count.value}`}
                            checked={(filters[facet.field_name as keyof Filters] as string[])?.includes?.(count.value) || false}
                            onCheckedChange={(checked) => 
                              handleFilterChange(facet.field_name as keyof Filters, count.value, checked as boolean)
                            }
                          />
                          <Label 
                            htmlFor={`${facet.field_name}-${count.value}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {facet.field_name === 'content_type' ? getContentTypeLabel(count.value) : count.value}
                            <span className="text-muted-foreground ml-1">({count.count})</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">{language === 'ar' ? 'جاري البحث...' : 'Recherche en cours...'}</span>
            </div>
          ) : results?.hits && results.hits.length > 0 ? (
            <>
              {/* Results list */}
              <div className="space-y-4 mb-6">
                {results.hits.map((hit, index) => (
                  <Card key={hit.document.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">
                            <a 
                              href={hit.document.url}
                              className="hover:text-primary transition-colors"
                              dangerouslySetInnerHTML={{
                                __html: formatHighlight(hit.document.title, hit.highlights?.title)
                              }}
                            />
                          </h3>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary">
                              {getContentTypeLabel(hit.document.content_type)}
                            </Badge>
                            <Badge variant="outline">{hit.document.language.toUpperCase()}</Badge>
                            {hit.document.is_featured && (
                              <Badge variant="default">
                                {language === 'ar' ? 'مميز' : 'À la une'}
                              </Badge>
                            )}
                          </div>

                          <p 
                            className="text-muted-foreground mb-3"
                            dangerouslySetInnerHTML={{
                              __html: formatHighlight(
                                hit.document.excerpt || hit.document.content, 
                                hit.highlights?.excerpt || hit.highlights?.content
                              )
                            }}
                          />

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{hit.document.author}</span>
                            <span>
                              {new Date(hit.document.published_at * 1000).toLocaleDateString(
                                language === 'ar' ? 'ar-MA' : 'fr-FR'
                              )}
                            </span>
                            {hit.document.view_count > 0 && (
                              <span>
                                {hit.document.view_count} {language === 'ar' ? 'مشاهدة' : 'vues'}
                              </span>
                            )}
                          </div>

                          {hit.document.keywords && hit.document.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {hit.document.keywords.slice(0, 5).map((keyword, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {results.found > perPage && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {language === 'ar' 
                      ? `الصفحة ${currentPage} من ${Math.ceil(results.found / perPage)}`
                      : `Page ${currentPage} sur ${Math.ceil(results.found / perPage)}`
                    }
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {language === 'ar' ? 'السابق' : 'Précédent'}
                    </Button>
                    
                    <span className="px-3 py-1 text-sm">
                      {currentPage}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= Math.ceil(results.found / perPage)}
                    >
                      {language === 'ar' ? 'التالي' : 'Suivant'}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {language === 'ar' ? 'لم يتم العثور على نتائج' : 'Aucun résultat trouvé'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {language === 'ar' 
                  ? 'جرب كلمات مفتاحية مختلفة أو قم بتوسيع نطاق البحث'
                  : 'Essayez des mots-clés différents ou élargissez votre recherche'
                }
              </p>
              <Button variant="outline" onClick={clearFilters}>
                {language === 'ar' ? 'مسح الفلاتر' : 'Effacer les filtres'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}