import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookMarked } from 'lucide-react';

interface CoteAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

// Exemples de cotes (à remplacer par des données réelles de l'API)
const SAMPLE_COTES = [
  'A123.456',
  'A234.567',
  'B345.678',
  'B456.789',
  'C567.890',
  'D678.901',
  'E789.012',
  'F890.123',
  'G901.234',
  'H012.345',
  'MAR001.001',
  'MAR002.003',
  'FRA100.250',
  'HIS200.100',
  'LIT300.050',
  'SCI400.200',
  'ART500.150',
  'REL600.300',
  'POL700.400',
  'ECO800.500'
];

export function CoteAutocomplete({ 
  value, 
  onChange, 
  label = 'Cote', 
  placeholder = 'Ex: A123.456' 
}: CoteAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCotes, setFilteredCotes] = useState<string[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = SAMPLE_COTES.filter(cote =>
        cote.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredCotes(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredCotes([]);
      setShowSuggestions(false);
    }
  }, [inputValue]);

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

  const handleSelect = (cote: string) => {
    setInputValue(cote);
    onChange(cote);
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
                key={cote}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center gap-2"
                onClick={() => handleSelect(cote)}
              >
                <BookMarked className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono">{cote}</span>
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
