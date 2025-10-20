import { useState, useEffect, useRef } from 'react';
import { Check, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface TitleAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  collectionType?: string;
  placeholder?: string;
  label?: string;
  className?: string;
}

interface TitleSuggestion {
  id: string;
  title: string;
  subtitle?: string | null;
}

/**
 * Composant d'auto-complétion intelligente pour les titres
 * Suggère des titres existants depuis la base de données en temps réel
 */
export function TitleAutocomplete({
  value = '',
  onChange,
  collectionType = 'books',
  placeholder = 'Rechercher par titre...',
  label,
  className,
}: TitleAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<TitleSuggestion[]>([]);
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
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content')
        .select('id, title')
        .ilike('title', `%${query}%`)
        .order('title', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error fetching title suggestions:', error);
        setSuggestions([]);
      } else {
        const typedData = (data || []).map(item => ({
          id: item.id,
          title: item.title,
          subtitle: null
        }));
        setSuggestions(typedData);
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
    }, 300);
  };

  const handleSelect = (suggestion: TitleSuggestion) => {
    setInputValue(suggestion.title);
    onChange?.(suggestion.title);
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
            if (inputValue.length >= 2) {
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
                    inputValue === suggestion.title && 'bg-accent/50'
                  )}
                  onClick={() => handleSelect(suggestion)}
                >
                  <Check
                    className={cn(
                      'h-4 w-4 shrink-0 mt-0.5',
                      inputValue === suggestion.title ? 'opacity-100 text-primary' : 'opacity-0'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{suggestion.title}</div>
                    {suggestion.subtitle && (
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">
                        {suggestion.subtitle}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message si aucun résultat */}
        {open && !loading && suggestions.length === 0 && inputValue.length >= 2 && (
          <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg">
            <div className="p-4 text-sm text-muted-foreground text-center">
              Aucun titre trouvé. Continuez à taper pour rechercher...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
