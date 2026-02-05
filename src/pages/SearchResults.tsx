import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Filter, SortAsc, SortDesc, Loader2, ChevronLeft, ChevronRight, X, Eye, Calendar, ArrowLeft } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

interface SearchResult {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  content_type: string;
  language: string;
  keywords: string[];
  author: string;
  publisher?: string;
  publication_year?: number;
  genre?: string;
  category?: string;
  tags?: string[];
  url: string;
  published_at: number;
  access_level: string;
  is_featured: boolean;
  view_count: number;
  status: string;
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
  publisher: string[];
  genre: string[];
  publication_year: string;
  publication_month: string;
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
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    content_type: [],
    language: [],
    author: [],
    category: [],
    publisher: [],
    genre: [],
    publication_year: '',
    publication_month: '',
    is_featured: null
  });

  // Generate years for dropdown (from 1900 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);
  
  const months = [
    { value: '01', label: language === 'ar' ? 'يناير' : 'Janvier' },
    { value: '02', label: language === 'ar' ? 'فبراير' : 'Février' },
    { value: '03', label: language === 'ar' ? 'مارس' : 'Mars' },
    { value: '04', label: language === 'ar' ? 'أبريل' : 'Avril' },
    { value: '05', label: language === 'ar' ? 'مايو' : 'Mai' },
    { value: '06', label: language === 'ar' ? 'يونيو' : 'Juin' },
    { value: '07', label: language === 'ar' ? 'يوليو' : 'Juillet' },
    { value: '08', label: language === 'ar' ? 'أغسطس' : 'Août' },
    { value: '09', label: language === 'ar' ? 'سبتمبر' : 'Septembre' },
    { value: '10', label: language === 'ar' ? 'أكتوبر' : 'Octobre' },
    { value: '11', label: language === 'ar' ? 'نوفمبر' : 'Novembre' },
    { value: '12', label: language === 'ar' ? 'ديسمبر' : 'Décembre' }
  ];

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
        publisher: filters.publisher.length > 0 ? filters.publisher.join(',') : '',
        genre: filters.genre.length > 0 ? filters.genre.join(',') : '',
        publication_year: filters.publication_year || '',
        publication_month: filters.publication_month || '',
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
      publisher: [],
      genre: [],
      publication_year: '',
      publication_month: '',
      is_featured: null
    });
  };

  const handleResultClick = (result: SearchResult) => {
    setSelectedResult(result);
    setShowDetailPanel(true);
  };

  const formatHighlight = (text: string, highlights?: string[]) => {
    if (!highlights || highlights.length === 0) {
      return text.substring(0, 200) + (text.length > 200 ? '...' : '');
    }
    
    return highlights[0].replace(/<mark>/g, '<mark class="bg-yellow-200 text-black">').substring(0, 300) + '...';
  };

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, Record<string, string>> = {
      'article': { fr: 'Article', ar: 'مقال', en: 'Article', es: 'Artículo', amz: 'Amagrad' },
      'news': { fr: 'Actualité', ar: 'أخبار', en: 'News', es: 'Noticias', amz: 'Isallen' },
      'event': { fr: 'Événement', ar: 'حدث', en: 'Event', es: 'Evento', amz: 'Anagar' },
      'manuscript': { fr: 'Manuscrit', ar: 'مخطوط', en: 'Manuscript', es: 'Manuscrito', amz: 'Aṛun' },
      'exhibition': { fr: 'Exposition', ar: 'معرض', en: 'Exhibition', es: 'Exposición', amz: 'Timleyt' }
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
      {/* Back Button */}
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {language === 'ar' ? 'رجوع' : 'Retour'}
        </Button>
      </div>

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

                {/* Date Filters */}
                <div className="space-y-3">
                  <Label className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {language === 'ar' ? 'فترة النشر' : 'Période de publication'}
                  </Label>
                  
                  {/* Year Filter */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      {language === 'ar' ? 'السنة' : 'Année'}
                    </Label>
                    <Select 
                      value={filters.publication_year} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, publication_year: value, publication_month: value ? prev.publication_month : '' }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ar' ? 'اختر سنة' : 'Sélectionner une année'} />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="">
                          {language === 'ar' ? 'كل السنوات' : 'Toutes les années'}
                        </SelectItem>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Month Filter */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      {language === 'ar' ? 'الشهر' : 'Mois'}
                    </Label>
                    <Select 
                      value={filters.publication_month}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, publication_month: value }))}
                      disabled={!filters.publication_year}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ar' ? 'اختر شهراً' : 'Sélectionner un mois'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">
                          {language === 'ar' ? 'كل الأشهر' : 'Tous les mois'}
                        </SelectItem>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Facet filters */}
                {results?.facet_counts && results.facet_counts.map((facet) => {
                  // Skip internal fields
                  if (facet.field_name === 'status' || facet.field_name === 'access_level') return null;
                  
                  return (
                    <div key={facet.field_name}>
                      <Label className="font-medium">
                        {facet.field_name === 'content_type' && (language === 'ar' ? 'نوع المحتوى' : 'Type de contenu')}
                        {facet.field_name === 'language' && (language === 'ar' ? 'اللغة' : 'Langue')}
                        {facet.field_name === 'author' && (language === 'ar' ? 'المؤلف' : 'Auteur')}
                        {facet.field_name === 'category' && (language === 'ar' ? 'الفئة' : 'Catégorie')}
                        {facet.field_name === 'publisher' && (language === 'ar' ? 'الناشر' : 'Éditeur')}
                        {facet.field_name === 'genre' && (language === 'ar' ? 'النوع' : 'Genre')}
                        {facet.field_name === 'publication_year' && (language === 'ar' ? 'سنة النشر' : 'Année de publication')}
                      </Label>
                      <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                        {facet.counts.slice(0, 10).map((count) => (
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
                  );
                })}
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
                  <Card 
                    key={hit.document.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleResultClick(hit.document)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">
                            <span 
                              className="hover:text-primary transition-colors"
                              dangerouslySetInnerHTML={{
                                __html: sanitizeHtml(formatHighlight(hit.document.title, hit.highlights?.title))
                              }}
                            />
                          </h3>
                          
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <Badge variant="secondary">
                              {getContentTypeLabel(hit.document.content_type)}
                            </Badge>
                            <Badge variant="outline">{hit.document.language.toUpperCase()}</Badge>
                            {hit.document.is_featured && (
                              <Badge variant="default">
                                {language === 'ar' ? 'مميز' : 'À la une'}
                              </Badge>
                            )}
                            {hit.document.publication_year && (
                              <Badge variant="outline" className="gap-1">
                                <Calendar className="h-3 w-3" />
                                {hit.document.publication_year}
                              </Badge>
                            )}
                          </div>

                          <p 
                            className="text-muted-foreground mb-3 line-clamp-2"
                            dangerouslySetInnerHTML={{
                              __html: sanitizeHtml(formatHighlight(
                                hit.document.excerpt || hit.document.content, 
                                hit.highlights?.excerpt || hit.highlights?.content
                              ))
                            }}
                          />

                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <span className="font-medium">{language === 'ar' ? 'المؤلف:' : 'Auteur:'}</span>
                              {hit.document.author}
                            </span>
                            {hit.document.publisher && (
                              <span className="flex items-center gap-1">
                                <span className="font-medium">{language === 'ar' ? 'الناشر:' : 'Éditeur:'}</span>
                                {hit.document.publisher}
                              </span>
                            )}
                            {hit.document.view_count > 0 && (
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {hit.document.view_count}
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

                          {/* Highlight preview with context */}
                          {hit.highlights?.content && hit.highlights.content.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <p className="text-xs text-muted-foreground mb-2">
                                {language === 'ar' ? 'مقتطفات مطابقة:' : 'Extraits correspondants:'}
                              </p>
                              <div className="space-y-2">
                                {hit.highlights.content.slice(0, 3).map((snippet, i) => (
                                  <p 
                                    key={i}
                                    className="text-sm text-muted-foreground p-2 bg-muted/30 rounded"
                                    dangerouslySetInnerHTML={{ 
                                      __html: sanitizeHtml(snippet.replace(
                                        /<mark>/g, 
                                        '<mark class="bg-yellow-200 dark:bg-yellow-500/30 text-foreground font-medium px-1 rounded">'
                                      ))
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResultClick(hit.document);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {results.found > perPage && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
                    
                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, Math.ceil(results.found / perPage)) }, (_, i) => {
                        const pageNum = i + 1;
                        const totalPages = Math.ceil(results.found / perPage);
                        
                        // Show first page, last page, current page and neighbors
                        if (
                          pageNum === 1 || 
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                          return <span key={pageNum} className="px-1">...</span>;
                        }
                        return null;
                      })}
                    </div>
                    
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

      {/* Detail Panel */}
      <Sheet open={showDetailPanel} onOpenChange={setShowDetailPanel}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <SheetHeader>
            <SheetTitle className="text-xl">
              {selectedResult?.title}
            </SheetTitle>
          </SheetHeader>
          
          {selectedResult && (
            <ScrollArea className="h-[calc(100vh-100px)] mt-6">
              <div className="space-y-6 pr-4">
                {/* Metadata */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {getContentTypeLabel(selectedResult.content_type)}
                  </Badge>
                  <Badge variant="outline">{selectedResult.language.toUpperCase()}</Badge>
                  {selectedResult.is_featured && (
                    <Badge variant="default">
                      {language === 'ar' ? 'مميز' : 'À la une'}
                    </Badge>
                  )}
                  {selectedResult.publication_year && (
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      {selectedResult.publication_year}
                    </Badge>
                  )}
                </div>

                {/* Author and Publisher */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">{language === 'ar' ? 'المؤلف:' : 'Auteur:'}</span>
                    <span>{selectedResult.author}</span>
                  </div>
                  {selectedResult.publisher && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold">{language === 'ar' ? 'الناشر:' : 'Éditeur:'}</span>
                      <span>{selectedResult.publisher}</span>
                    </div>
                  )}
                  {selectedResult.genre && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold">{language === 'ar' ? 'النوع:' : 'Genre:'}</span>
                      <span>{selectedResult.genre}</span>
                    </div>
                  )}
                  {selectedResult.category && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold">{language === 'ar' ? 'الفئة:' : 'Catégorie:'}</span>
                      <span>{selectedResult.category}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">{language === 'ar' ? 'تاريخ النشر:' : 'Date de publication:'}</span>
                    <span>
                      {new Date(selectedResult.published_at * 1000).toLocaleDateString(
                        language === 'ar' ? 'ar-MA' : 'fr-FR',
                        { year: 'numeric', month: 'long', day: 'numeric' }
                      )}
                    </span>
                  </div>
                  {selectedResult.view_count > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="h-4 w-4" />
                      <span>{selectedResult.view_count} {language === 'ar' ? 'مشاهدة' : 'vues'}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Excerpt */}
                {selectedResult.excerpt && (
                  <div>
                    <h4 className="font-semibold mb-2">
                      {language === 'ar' ? 'ملخص' : 'Résumé'}
                    </h4>
                    <p className="text-muted-foreground">{selectedResult.excerpt}</p>
                  </div>
                )}

                {/* Full content with highlights */}
                <div>
                  <h4 className="font-semibold mb-2">
                    {language === 'ar' ? 'المحتوى الكامل' : 'Contenu complet'}
                  </h4>
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ 
                      __html: sanitizeHtml(selectedResult.content.replace(
                        new RegExp(`(${query})`, 'gi'),
                        '<mark class="bg-yellow-200 dark:bg-yellow-500/30 text-foreground font-medium px-1 rounded">$1</mark>'
                      ))
                    }}
                  />
                </div>

                {/* Keywords */}
                {selectedResult.keywords && selectedResult.keywords.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">
                      {language === 'ar' ? 'الكلمات المفتاحية' : 'Mots-clés'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedResult.keywords.map((keyword, i) => (
                        <Badge key={i} variant="outline">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedResult.tags && selectedResult.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">
                      {language === 'ar' ? 'الوسوم' : 'Tags'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedResult.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 pt-4">
                  <Button asChild className="flex-1">
                    <a href={selectedResult.url}>
                      {language === 'ar' ? 'عرض المحتوى الكامل' : 'Voir le contenu complet'}
                    </a>
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}