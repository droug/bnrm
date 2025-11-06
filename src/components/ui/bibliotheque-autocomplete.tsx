import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BibliothequeAutocompleteProps {
  value: string;
  onChange: (value: string, bibliothequeId?: string, type?: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

interface BibliothequeItem {
  id: string;
  nom_bibliotheque: string;
  type_bibliotheque: string;
  ville: string;
  source: 'catalogue' | 'reseau';
}

export function BibliothequeAutocomplete({
  value,
  onChange,
  label,
  placeholder = "Rechercher une bibliothèque...",
  className = "",
}: BibliothequeAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredBibliotheques, setFilteredBibliotheques] = useState<BibliothequeItem[]>([]);
  const [popularBibliotheques, setPopularBibliotheques] = useState<BibliothequeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Charger les bibliothèques populaires au montage
  useEffect(() => {
    const fetchPopularBibliotheques = async () => {
      try {
        const { data: catalogueData } = await supabase
          .from('cbm_adhesions_catalogue')
          .select('id, nom_bibliotheque, type_bibliotheque, ville')
          .eq('statut', 'approuve')
          .limit(5);

        const { data: reseauData } = await supabase
          .from('cbm_adhesions_reseau')
          .select('id, nom_bibliotheque, type_bibliotheque, ville')
          .eq('statut', 'approuve')
          .limit(5);

        const catalogueResults: BibliothequeItem[] = (catalogueData || []).map(item => ({
          ...item,
          source: 'catalogue' as const
        }));

        const reseauResults: BibliothequeItem[] = (reseauData || []).map(item => ({
          ...item,
          source: 'reseau' as const
        }));

        const combined = [...catalogueResults, ...reseauResults].slice(0, 8);
        setPopularBibliotheques(combined);
      } catch (error) {
        console.error("Error fetching popular bibliotheques:", error);
      }
    };

    fetchPopularBibliotheques();
  }, []);

  // Recherche dans les deux tables
  useEffect(() => {
    const searchBibliotheques = async () => {
      if (!inputValue || inputValue.length < 2) {
        setFilteredBibliotheques([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchTerm = `%${inputValue}%`;
        
        // Recherche dans cbm_adhesions_catalogue
        const { data: catalogueData, error: catalogueError } = await supabase
          .from('cbm_adhesions_catalogue')
          .select('id, nom_bibliotheque, type_bibliotheque, ville')
          .or(`nom_bibliotheque.ilike.${searchTerm},ville.ilike.${searchTerm}`)
          .eq('statut', 'approuve')
          .limit(10);

        // Recherche dans cbm_adhesions_reseau
        const { data: reseauData, error: reseauError } = await supabase
          .from('cbm_adhesions_reseau')
          .select('id, nom_bibliotheque, type_bibliotheque, ville')
          .or(`nom_bibliotheque.ilike.${searchTerm},ville.ilike.${searchTerm}`)
          .eq('statut', 'approuve')
          .limit(10);

        if (catalogueError || reseauError) {
          console.error("Error fetching bibliotheques:", catalogueError || reseauError);
          return;
        }

        // Combiner les résultats
        const catalogueResults: BibliothequeItem[] = (catalogueData || []).map(item => ({
          ...item,
          source: 'catalogue' as const
        }));

        const reseauResults: BibliothequeItem[] = (reseauData || []).map(item => ({
          ...item,
          source: 'reseau' as const
        }));

        const combined = [...catalogueResults, ...reseauResults];
        setFilteredBibliotheques(combined);
      } catch (error) {
        console.error("Error searching bibliotheques:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchBibliotheques, 300);
    return () => clearTimeout(debounceTimer);
  }, [inputValue]);

  // Calculer la position du dropdown
  useEffect(() => {
    if (showSuggestions && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [showSuggestions, filteredBibliotheques]);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Synchroniser avec la prop value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSelect = (bibliotheque: BibliothequeItem) => {
    setInputValue(bibliotheque.nom_bibliotheque);
    onChange(bibliotheque.nom_bibliotheque, bibliotheque.id, bibliotheque.source);
    setShowSuggestions(false);
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
    if (newValue.length === 0 || newValue.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleClear = () => {
    setInputValue("");
    onChange("");
    inputRef.current?.focus();
  };

  const getSourceLabel = (source: string) => {
    return source === 'catalogue' ? 'Adhérent Catalogue' : 'Adhérent Réseau';
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && <Label className="mb-2">{label}</Label>}
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showSuggestions && createPortal(
        <div
          className="fixed z-50 bg-popover border border-border rounded-md shadow-lg max-h-64 overflow-y-auto"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          {inputValue.length > 0 && inputValue.length < 2 ? (
            <div className="p-3 text-sm text-muted-foreground text-center">
              Tapez au moins 2 caractères pour rechercher...
            </div>
          ) : isLoading ? (
            <div className="p-3 text-sm text-muted-foreground text-center">
              Recherche en cours...
            </div>
          ) : inputValue.length >= 2 && filteredBibliotheques.length > 0 ? (
            <ul className="py-1">
              {filteredBibliotheques.map((bibliotheque) => (
                <li
                  key={`${bibliotheque.source}-${bibliotheque.id}`}
                  onClick={() => handleSelect(bibliotheque)}
                  className="px-3 py-2 hover:bg-accent cursor-pointer"
                >
                  <div className="font-medium text-sm">{bibliotheque.nom_bibliotheque}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{bibliotheque.type_bibliotheque}</span>
                    {bibliotheque.ville && (
                      <>
                        <span>•</span>
                        <span>{bibliotheque.ville}</span>
                      </>
                    )}
                    <span>•</span>
                    <span className="text-primary font-medium">{getSourceLabel(bibliotheque.source)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : inputValue.length >= 2 ? (
            <div className="p-3 text-sm text-muted-foreground text-center">
              Aucune bibliothèque trouvée
            </div>
          ) : popularBibliotheques.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                Bibliothèques suggérées
              </div>
              <ul className="py-1">
                {popularBibliotheques.map((bibliotheque) => (
                  <li
                    key={`${bibliotheque.source}-${bibliotheque.id}`}
                    onClick={() => handleSelect(bibliotheque)}
                    className="px-3 py-2 hover:bg-accent cursor-pointer"
                  >
                    <div className="font-medium text-sm">{bibliotheque.nom_bibliotheque}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{bibliotheque.type_bibliotheque}</span>
                      {bibliotheque.ville && (
                        <>
                          <span>•</span>
                          <span>{bibliotheque.ville}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="text-primary font-medium">{getSourceLabel(bibliotheque.source)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="p-3 text-sm text-muted-foreground text-center">
              Aucune bibliothèque disponible
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
