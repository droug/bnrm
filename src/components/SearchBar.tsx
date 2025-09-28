import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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

  const defaultPlaceholder = language === 'ar' 
    ? 'البحث في الكتالوج...' 
    : language === 'ber'
    ? 'Arezzu deg ukatalog...'
    : language === 'en'
    ? 'Search catalog...'
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
    inputRef.current?.focus();
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
      <div className="relative flex items-center">
        <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} h-5 w-5 text-muted-foreground ${variant === 'hero' ? 'text-white/70' : ''}`} />
        
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
            ${language === 'ar' ? 'pr-10 pl-12 text-right' : 'pl-10 pr-12'}
            ${getVariantClasses()}
          `}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        />

        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className={`absolute ${language === 'ar' ? 'left-1' : 'right-1'} h-8 w-8 p-0 hover:bg-transparent`}
          >
            <X className={`h-4 w-4 ${variant === 'hero' ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`} />
          </Button>
        )}

        {!query && (
          <Button
            type="button"
            variant={getButtonVariant()}
            size="sm"
            onClick={() => handleSearch()}
            disabled={isSearching || !query.trim()}
            className={`absolute ${language === 'ar' ? 'left-1' : 'right-1'} h-8 w-8 p-0`}
          >
            {isSearching ? (
              <Loader2 className={`h-4 w-4 animate-spin ${variant === 'hero' ? 'text-white/70' : 'text-muted-foreground'}`} />
            ) : (
              <Search className={`h-4 w-4 ${variant === 'hero' ? 'text-white/70' : 'text-muted-foreground'}`} />
            )}
          </Button>
        )}
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