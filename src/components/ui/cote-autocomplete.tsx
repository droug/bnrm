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
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Search in manuscripts table for cote numbers
      const { data: manuscriptData, error: manuscriptError } = await supabase
        .from("manuscripts")
        .select("cote, title")
        .ilike("cote", `%${query}%`)
        .not("cote", "is", null)
        .limit(15);

      if (manuscriptError) throw manuscriptError;

      const allCotes = (manuscriptData || []).map(item => ({ 
        cote: item.cote!, 
        type: item.title ? item.title.substring(0, 30) + '...' : 'Manuscrit' 
      }));

      // Remove duplicates by cote
      const uniqueCotes = Array.from(
        new Map(allCotes.map(item => [item.cote, item])).values()
      );

      setSuggestions(uniqueCotes);
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
