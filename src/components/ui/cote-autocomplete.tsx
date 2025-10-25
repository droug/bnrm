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
  prefixe: string;
  modele: string;
  description: string;
}

export function CoteAutocomplete({
  value,
  onChange,
  placeholder = "Rechercher un numéro de cote",
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
      // Search only in cote_nomenclatures (Nomenclatures de Fichiers)
      const { data: nomenclaturesData, error } = await supabase
        .from("cote_nomenclatures")
        .select("prefixe, modele_codification, description")
        .or(`prefixe.ilike.%${query}%,modele_codification.ilike.%${query}%,description.ilike.%${query}%`)
        .eq("is_active", true)
        .order("prefixe");

      if (error) {
        console.error("Error fetching nomenclatures:", error);
        setSuggestions([]);
      } else {
        const suggestions = (nomenclaturesData || []).map(item => ({
          prefixe: item.prefixe,
          modele: item.modele_codification,
          description: item.description || ''
        }));
        
        setSuggestions(suggestions);
        console.log("Nomenclatures found:", suggestions.length, suggestions);
      }
    } catch (error) {
      console.error("Error fetching nomenclatures:", error);
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

  const handleSelect = (prefixe: string) => {
    setInputValue(prefixe);
    onChange(prefixe);
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
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-80 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(suggestion.prefixe)}
              className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border last:border-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-1">{suggestion.prefixe}</div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Modèle: <span className="font-mono">{suggestion.modele}</span>
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {suggestion.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && !loading && inputValue && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg p-4 text-center text-sm text-muted-foreground">
          Aucune nomenclature trouvée
        </div>
      )}
    </div>
  );
}
