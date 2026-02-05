import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, ChevronDown, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface Suggestion {
  text: string;
  type: string;
  url: string;
}

export default function SearchBar({ 
  placeholder,
  className = "",
  onSearch,
  showSuggestions = true,
  variant = "default" 
}: {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  showSuggestions?: boolean;
  variant?: "default" | "hero" | "compact";
}) {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const [activeFilters, setActiveFilters] = useState<{type: string, value: string}[]>([]);

  const defaultPlaceholder = language === 'ar' 
    ? 'البحث في الكتالوج...' 
    : language === 'amz'
    ? 'Arezzu deg ukatalog...'
    : language === 'en'
    ? 'Search catalog...'
    : language === 'es'
    ? 'Buscar en el catálogo...'
    : 'Rechercher dans le catalogue...';

  // Debounced suggestions
  useEffect(() => {
    if (!showSuggestions || query.length < 2) {
      setSuggestions([]);
      setShowSuggestionsDropdown(false);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      await fetchSuggestions(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, language, showSuggestions]);

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestionsDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoadingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-engine', {
        body: {
          query: searchQuery,
          language: language,
          limit: 5
        }
      });

      if (error) throw error;

      if (data?.suggestions) {
        setSuggestions(data.suggestions);
        setShowSuggestionsDropdown(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSuggestionsDropdown(false);

    try {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        // Navigate to search results page
        const searchParams = new URLSearchParams({
          q: searchQuery,
          lang: language
        });
        navigate(`/search?${searchParams.toString()}`);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
    if (e.key === 'Escape') {
      setShowSuggestionsDropdown(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.text);
    setShowSuggestionsDropdown(false);
    
    // Navigate directly to the suggested content
    if (suggestion.url) {
      navigate(suggestion.url);
    } else {
      handleSearch(suggestion.text);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestionsDropdown(false);
    setActiveFilters([]);
    inputRef.current?.focus();
  };

  const addFilter = (type: string, value: string) => {
    // Remove existing filter of same type
    const newFilters = activeFilters.filter(f => f.type !== type);
    setActiveFilters([...newFilters, { type, value }]);
  };

  const removeFilter = (type: string) => {
    setActiveFilters(activeFilters.filter(f => f.type !== type));
  };

  const handleSearchWithFilters = () => {
    if (!query.trim() && activeFilters.length === 0) return;

    const searchParams = new URLSearchParams({
      q: query || '*',
      lang: language
    });

    activeFilters.forEach(filter => {
      searchParams.append(filter.type, filter.value);
    });

    navigate(`/search?${searchParams.toString()}`);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "hero":
        return "h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/70 backdrop-blur-sm";
      case "compact":
        return "h-10 text-sm";
      default:
        return "h-12";
    }
  };

  const getButtonVariant = (): "default" | "destructive" | "ghost" | "link" | "outline" | "secondary" => {
    switch (variant) {
      case "hero":
        return "ghost";
      default:
        return "ghost";
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="space-y-2">
        {/* Filter badges */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <Badge 
                key={filter.type} 
                variant="secondary" 
                className="gap-1 bg-primary/10 text-primary border border-primary/20"
              >
                <span className="text-xs font-medium">
                  {filter.type === 'author' ? (language === 'ar' ? 'المؤلف' : 'Auteur') : 
                   filter.type === 'publisher' ? (language === 'ar' ? 'الناشر' : 'Éditeur') :
                   filter.type === 'genre' ? (language === 'ar' ? 'النوع' : 'Genre') :
                   filter.type === 'publication_year' ? (language === 'ar' ? 'السنة' : 'Année') :
                   filter.type === 'language' ? (language === 'ar' ? 'اللغة' : 'Langue') : filter.type}
                  : {filter.value}
                </span>
                <button
                  onClick={() => removeFilter(filter.type)}
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="relative flex items-center gap-2">
          {/* Filters dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={variant === 'hero' ? 'ghost' : 'outline'}
                size="sm"
                className={`
                  flex items-center gap-1 shrink-0
                  ${variant === 'hero' ? 'text-white/90 hover:text-white border-white/20 hover:bg-white/10' : 'text-foreground'}
                `}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">{language === 'ar' ? 'الفلاتر' : 'Filtres'}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-background border-border z-50">
              <DropdownMenuLabel>{language === 'ar' ? 'تصفية حسب' : 'Filtrer par'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                const value = prompt(language === 'ar' ? 'اسم المؤلف:' : "Nom de l'auteur:");
                if (value) addFilter('author', value);
              }}>
                <span>{language === 'ar' ? 'المؤلف' : 'Auteur'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const value = prompt(language === 'ar' ? 'اسم الناشر:' : "Nom de l'éditeur:");
                if (value) addFilter('publisher', value);
              }}>
                <span>{language === 'ar' ? 'الناشر' : 'Éditeur'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const value = prompt(language === 'ar' ? 'النوع:' : "Genre:");
                if (value) addFilter('genre', value);
              }}>
                <span>{language === 'ar' ? 'النوع' : 'Genre'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const value = prompt(language === 'ar' ? 'السنة (مثال: 2024):' : "Année (ex: 2024):");
                if (value) addFilter('publication_year', value);
              }}>
                <span>{language === 'ar' ? 'سنة النشر' : 'Année de publication'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const value = prompt(language === 'ar' ? 'اللغة (ar/fr/en):' : "Langue (ar/fr/en):");
                if (value) addFilter('language', value);
              }}>
                <span>{language === 'ar' ? 'اللغة' : 'Langue'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search input */}
          <div className="relative flex-1">
            <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${variant === 'hero' ? 'text-white/70' : ''} pointer-events-none`} />
            
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder || defaultPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestionsDropdown(true);
                }
              }}
              className={`
                ${language === 'ar' ? 'pr-10 pl-20' : 'pl-10 pr-20'} text-right
                ${getVariantClasses()}
              `}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />

            {/* Clear button - always visible when there's text */}
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className={`absolute ${language === 'ar' ? 'left-12' : 'right-12'} top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-destructive/10 z-10`}
                title={language === 'ar' ? 'مسح البحث' : 'Effacer la recherche'}
              >
                <X className={`h-5 w-5 ${variant === 'hero' ? 'text-white hover:text-white' : 'text-destructive hover:text-destructive'} transition-colors`} />
              </Button>
            )}

            {/* Search button */}
            <Button
              type="button"
              variant={variant === 'hero' ? 'secondary' : 'default'}
              size="sm"
              onClick={handleSearchWithFilters}
              disabled={isSearching}
              className={`absolute ${language === 'ar' ? 'left-1' : 'right-1'} top-1/2 -translate-y-1/2 h-8 px-3`}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestionsDropdown && showSuggestions && (
        <div
          ref={suggestionsRef}
          className={`
            absolute top-full mt-1 w-full bg-background border border-border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto
            ${language === 'ar' ? 'text-right' : 'text-left'}
          `}
        >
          {isLoadingSuggestions ? (
            <div className="p-3 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">
                {language === 'ar' ? 'جاري البحث...' : 'Recherche...'}
              </span>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`
                    w-full px-3 py-2 text-sm hover:bg-accent text-left transition-colors
                    ${language === 'ar' ? 'text-right' : 'text-left'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{suggestion.text}</span>
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                      {suggestion.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 text-sm text-muted-foreground text-center">
              {language === 'ar' ? 'لا توجد اقتراحات' : 'Aucune suggestion'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
