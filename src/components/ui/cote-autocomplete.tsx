import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookMarked } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CoteAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

interface CoteNomenclature {
  id: string;
  prefixe: string;
  modele_codification: string;
  description?: string;
  module_concerne: string;
  is_active: boolean;
}

export function CoteAutocomplete({ 
  value, 
  onChange, 
  label = 'Cote', 
  placeholder = 'Ex: PH2_ED25_MRK_001' 
}: CoteAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCotes, setFilteredCotes] = useState<CoteNomenclature[]>([]);
  const [allCotes, setAllCotes] = useState<CoteNomenclature[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Récupérer les nomenclatures de cotes depuis la base de données
  useEffect(() => {
    const fetchCotes = async () => {
      try {
        const { data, error } = await supabase
          .from('cote_nomenclatures')
          .select('*')
          .eq('is_active', true)
          .order('prefixe');
        
        if (error) throw error;
        setAllCotes(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des cotes:', error);
      }
    };
    
    fetchCotes();
  }, []);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = allCotes.filter(cote =>
        cote.prefixe.toLowerCase().includes(inputValue.toLowerCase()) ||
        cote.modele_codification.toLowerCase().includes(inputValue.toLowerCase()) ||
        cote.description?.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredCotes(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredCotes([]);
      setShowSuggestions(false);
    }
  }, [inputValue, allCotes]);

  useEffect(() => {
    if (showSuggestions && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [showSuggestions]);

  const handleSelect = (cote: CoteNomenclature) => {
    const coteValue = `${cote.prefixe}_${cote.modele_codification}`;
    setInputValue(coteValue);
    onChange(coteValue);
    setShowSuggestions(false);
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => inputValue.trim() && setShowSuggestions(true)}
          className="w-full pr-10"
        />
        <BookMarked className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        
        {showSuggestions && filteredCotes.length > 0 && createPortal(
          <div
            className="fixed bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto z-[9999]"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`
            }}
          >
            {filteredCotes.map((cote) => (
              <button
                key={cote.id}
                type="button"
                className="w-full text-left px-3 py-3 hover:bg-accent hover:text-accent-foreground cursor-pointer border-b last:border-b-0"
                onClick={() => handleSelect(cote)}
              >
                <div className="flex items-start gap-2">
                  <BookMarked className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-sm">{cote.prefixe}</span>
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                        {cote.module_concerne}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-muted-foreground mt-1">
                      {cote.modele_codification}
                    </div>
                    {cote.description && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {cote.description}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>,
          document.body
        )}

        {showSuggestions && filteredCotes.length === 0 && inputValue.trim() && createPortal(
          <div
            className="fixed bg-popover border border-border rounded-md shadow-lg p-3 text-sm text-muted-foreground z-[9999]"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`
            }}
          >
            Aucune cote trouvée
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}
