import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X } from 'lucide-react';
import { useAutocompleteList } from '@/hooks/useAutocompleteList';

interface GenericAutocompleteProps {
  listCode: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  label?: string;
  placeholder?: string;
  multiple?: boolean;
  className?: string;
}

/**
 * Composant générique d'autocomplete qui charge ses données depuis la base de données
 * Supporte la sélection simple ou multiple
 */
export function GenericAutocomplete({
  listCode,
  value,
  onChange,
  label,
  placeholder = 'Rechercher...',
  multiple = false,
  className
}: GenericAutocompleteProps) {
  const { values, loading, error, search } = useAutocompleteList(listCode);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredValues, setFilteredValues] = useState(values);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const justSelectedRef = useRef(false);

  // Initialiser inputValue avec le label correspondant à la valeur
  useEffect(() => {
    if (!multiple && typeof value === 'string' && value && values.length > 0 && !justSelectedRef.current) {
      const item = values.find((v) => v.value_code === value);
      if (item) {
        setInputValue(item.value_label);
      }
    } else if (!multiple && !value && !justSelectedRef.current) {
      setInputValue('');
    }
    // Réinitialiser le flag après avoir synchronisé
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
    }
  }, [value, values, multiple]);

  // Filtrer les valeurs en fonction de la recherche
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = search(inputValue);
      setFilteredValues(filtered);
      // Ne montrer les suggestions que si le champ est actif
      if (document.activeElement === inputRef.current) {
        setShowSuggestions(true);
      }
    } else {
      setFilteredValues(values);
      setShowSuggestions(false);
    }
  }, [inputValue, values]);

  // Mettre à jour la position du dropdown
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

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: string, label: string) => {
    justSelectedRef.current = true;
    
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (!currentValues.includes(code)) {
        onChange([...currentValues, code]);
      }
      setInputValue('');
    } else {
      // Mettre à jour immédiatement l'input avec le label complet
      setInputValue(label);
      // Appeler onChange avec le code
      onChange(code);
    }
    setShowSuggestions(false);
  };

  const handleRemove = (code: string) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((c) => c !== code));
    }
  };

  const handleClear = () => {
    setInputValue('');
    onChange(multiple ? [] : '');
    setFilteredValues(values);
  };

  if (error) {
    return (
      <div className={className}>
        {label && <Label className="text-sm font-medium text-destructive">{label}</Label>}
        <div className="text-sm text-destructive">Erreur de chargement</div>
      </div>
    );
  }

  const selectedValues = multiple && Array.isArray(value) ? value : [];

  return (
    <div className={className} ref={containerRef}>
      {label && <Label className="text-sm font-medium mb-2 block">{label}</Label>}
      
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={loading ? 'Chargement...' : placeholder}
          onFocus={() => inputValue.trim() && setShowSuggestions(true)}
          disabled={loading}
          className="w-full pr-10"
        />
        
        {inputValue && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-accent rounded-sm p-1 transition-colors"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        )}

        {/* Dropdown des suggestions */}
        {showSuggestions && filteredValues.length > 0 && createPortal(
          <div
            className="fixed bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto z-[9999]"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`
            }}
          >
            {filteredValues.map((item) => (
              <button
                key={item.value_code}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center justify-between"
                onClick={() => handleSelect(item.value_code, item.value_label)}
              >
                <span>{item.value_label}</span>
                {(multiple ? selectedValues.includes(item.value_code) : value === item.value_code) && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>,
          document.body
        )}

        {/* Message aucun résultat */}
        {showSuggestions && filteredValues.length === 0 && inputValue.trim() && createPortal(
          <div
            className="fixed bg-popover border border-border rounded-md shadow-lg p-3 text-sm text-muted-foreground z-[9999]"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`
            }}
          >
            Aucun résultat trouvé
          </div>,
          document.body
        )}
      </div>

      {/* Tags des valeurs sélectionnées (mode multiple) */}
      {multiple && selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedValues.map((code) => {
            const item = values.find((v) => v.value_code === code);
            return (
              <span
                key={code}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {item?.value_label || code}
                <button
                  type="button"
                  onClick={() => handleRemove(code)}
                  className="hover:text-primary/80"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
