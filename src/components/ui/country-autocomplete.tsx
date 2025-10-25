import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

interface CountryAutocompleteProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  placeholder?: string;
}

const COUNTRIES = [
  'Maroc', 'France', 'Algérie', 'Tunisie', 'Égypte', 'Arabie Saoudite',
  'États-Unis', 'Royaume-Uni', 'Allemagne', 'Espagne', 'Italie', 'Portugal',
  'Belgique', 'Suisse', 'Canada', 'Liban', 'Jordanie', 'Émirats Arabes Unis',
  'Qatar', 'Koweït', 'Bahreïn', 'Oman', 'Palestine', 'Syrie', 'Irak',
  'Libye', 'Soudan', 'Mauritanie', 'Sénégal', 'Mali', 'Niger', 'Tchad',
  'Burkina Faso', 'Côte d\'Ivoire', 'Guinée', 'Cameroun', 'Gabon',
  'République Démocratique du Congo', 'Madagascar', 'Turquie', 'Iran',
  'Pakistan', 'Afghanistan', 'Inde', 'Chine', 'Japon', 'Corée du Sud',
  'Australie', 'Nouvelle-Zélande', 'Brésil', 'Argentine', 'Mexique',
  'Chili', 'Colombie', 'Pérou', 'Venezuela', 'Russie', 'Pologne',
  'République Tchèque', 'Roumanie', 'Hongrie', 'Grèce', 'Pays-Bas',
  'Suède', 'Norvège', 'Danemark', 'Finlande', 'Irlande', 'Autriche'
].sort();

export function CountryAutocomplete({ value, onChange, label = 'Pays', placeholder = 'Rechercher un pays...' }: CountryAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = COUNTRIES.filter(country =>
        country.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredCountries(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredCountries([]);
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

  const handleSelect = (country: string) => {
    if (!value.includes(country)) {
      onChange([...value, country]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleRemove = (country: string) => {
    onChange(value.filter(c => c !== country));
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          onFocus={() => inputValue.trim() && setShowSuggestions(true)}
          className="w-full"
        />
        
        {showSuggestions && filteredCountries.length > 0 && createPortal(
          <div
            className="fixed bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto z-[9999]"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`
            }}
          >
            {filteredCountries.map((country) => (
              <button
                key={country}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center justify-between"
                onClick={() => handleSelect(country)}
              >
                <span>{country}</span>
                {value.includes(country) && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>,
          document.body
        )}

        {showSuggestions && filteredCountries.length === 0 && inputValue.trim() && createPortal(
          <div
            className="fixed bg-popover border border-border rounded-md shadow-lg p-3 text-sm text-muted-foreground z-[9999]"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`
            }}
          >
            Aucun pays trouvé
          </div>,
          document.body
        )}
      </div>

      {/* Selected Countries */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((country) => (
            <span
              key={country}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
            >
              {country}
              <button
                type="button"
                onClick={() => handleRemove(country)}
                className="hover:text-primary/80"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
