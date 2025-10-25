import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CoteAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

interface CoteSuggestion {
  cote: string;
  type?: string;
}

export function CoteAutocomplete({
  value,
  onChange,
  placeholder = "Rechercher un numéro de côte",
  label,
  className = "",
}: CoteAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<CoteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 1) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Search in manuscripts with cote
      const { data: manuscriptData } = await supabase
        .from("manuscripts")
        .select("cote, title")
        .not("cote", "is", null)
        .or(`cote.ilike.%${query}%,title.ilike.%${query}%`)
        .order("cote")
        .limit(15);

      // Search in cote_collections for collection codes
      const { data: collectionsData } = await supabase
        .from("cote_collections")
        .select("code, nom_francais")
        .or(`code.ilike.%${query}%,nom_francais.ilike.%${query}%`)
        .limit(10);

      // Search in cote_nomenclatures for prefixes
      const { data: nomenclaturesData } = await supabase
        .from("cote_nomenclatures")
        .select("prefixe, description")
        .or(`prefixe.ilike.%${query}%,description.ilike.%${query}%`)
        .eq("is_active", true)
        .limit(10);

      const suggestions: CoteSuggestion[] = [];

      // Add manuscripts with cote
      if (manuscriptData) {
        manuscriptData.forEach(item => {
          suggestions.push({
            cote: item.cote!,
            type: item.title ? (item.title.length > 35 ? item.title.substring(0, 35) + '...' : item.title) : 'Manuscrit'
          });
        });
      }

      // Add collection codes as suggestions
      if (collectionsData) {
        collectionsData.forEach(item => {
          suggestions.push({
            cote: item.code,
            type: item.nom_francais
          });
        });
      }

      // Add nomenclature prefixes
      if (nomenclaturesData) {
        nomenclaturesData.forEach(item => {
          // Extract example from description
          const match = item.description?.match(/Exemple:\s*([^\s(]+)/);
          const example = match ? match[1] : item.prefixe;
          suggestions.push({
            cote: example,
            type: `Modèle ${item.prefixe}`
          });
        });
      }

      // Remove duplicates by cote
      const uniqueCotes = Array.from(
        new Map(suggestions.map(item => [item.cote, item])).values()
      );

      setSuggestions(uniqueCotes);
      console.log("Côte suggestions found:", uniqueCotes.length, uniqueCotes);
    } catch (error) {
      console.error("Error fetching côte suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setOpen(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  const handleSelect = (cote: string) => {
    setInputValue(cote);
    onChange(cote);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className={`space-y-2 relative ${className}`} ref={wrapperRef}>
      {label && <Label>{label}</Label>}
      <div className="relative">
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          onFocus={() => inputValue && setOpen(true)}
          className="pl-10"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(suggestion.cote)}
              className="w-full px-4 py-2 text-left hover:bg-accent transition-colors flex items-center justify-between"
            >
              <span className="font-medium">{suggestion.cote}</span>
              {suggestion.type && (
                <span className="text-xs text-muted-foreground">{suggestion.type}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {open && !loading && inputValue && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg p-4 text-center text-sm text-muted-foreground">
          Aucun numéro de côte trouvé
        </div>
      )}
    </div>
  );
}
