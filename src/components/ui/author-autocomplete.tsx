import { useState, useEffect, useRef } from 'react';
import { Check, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface AuthorAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

interface AuthorSuggestion {
  id: string;
  author: string;
  count?: number;
}

/**
 * Composant d'auto-complétion intelligente pour les auteurs
 * Suggère des auteurs existants depuis la base de données en temps réel
 */
export function AuthorAutocomplete({
  value = '',
  onChange,
  placeholder = 'Rechercher un auteur...',
  label,
  className,
}: AuthorAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AuthorSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Charger les suggestions
  const fetchSuggestions = async (query: string) => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Rechercher uniquement dans manuscripts
      const { data: manuscriptData, error: manuscriptError } = await supabase
        .from('manuscripts')
        .select('author')
        .not('author', 'is', null)
        .ilike('author', `%${query}%`)
        .limit(20);

      if (manuscriptError) {
        console.error('Error fetching author suggestions:', manuscriptError);
        setSuggestions([]);
      } else {
        // Récupérer les auteurs
        const allAuthors = (manuscriptData || []).map(item => item.author);

        // Compter les occurrences et dédupliquer
        const authorCounts = new Map<string, number>();
        allAuthors.forEach(author => {
          if (author) {
            authorCounts.set(author, (authorCounts.get(author) || 0) + 1);
          }
        });

        // Convertir en tableau de suggestions
        const uniqueSuggestions = Array.from(authorCounts.entries())
          .map(([author, count]) => ({
            id: author,
            author,
            count
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setSuggestions(uniqueSuggestions);
      }
    } catch (error) {
      console.error('Error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce la recherche
  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange?.(newValue);
    setOpen(true);

    // Annuler le timeout précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Nouveau timeout pour debounce
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 150);
  };

  const handleSelect = (suggestion: AuthorSuggestion) => {
    setInputValue(suggestion.author);
    onChange?.(suggestion.author);
    setOpen(false);
    setSuggestions([]);
  };

  // Synchroniser avec la prop value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Nettoyer le timeout au démontage
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn('space-y-2 relative', className)} ref={containerRef}>
      {label && (
        <Label className="text-sm font-medium">{label}</Label>
      )}
      
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (inputValue.length >= 1) {
              setOpen(true);
              fetchSuggestions(inputValue);
            }
          }}
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {/* Dropdown des suggestions */}
        {open && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-80 overflow-auto">
            <div className="py-1">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 text-sm hover:bg-accent transition-colors text-left',
                    inputValue === suggestion.author && 'bg-accent/50'
                  )}
                  onClick={() => handleSelect(suggestion)}
                >
                  <Check
                    className={cn(
                      'h-4 w-4 shrink-0 mt-0.5',
                      inputValue === suggestion.author ? 'opacity-100 text-primary' : 'opacity-0'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{suggestion.author}</div>
                    {suggestion.count && suggestion.count > 1 && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {suggestion.count} {suggestion.count > 1 ? 'documents' : 'document'}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message si aucun résultat */}
        {open && !loading && suggestions.length === 0 && inputValue.length >= 1 && (
          <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg">
            <div className="p-4 text-sm text-muted-foreground text-center">
              Aucun auteur trouvé. Continuez à taper pour rechercher...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
