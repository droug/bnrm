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
  const { values, loading, error } = useAutocompleteList(listCode);
  const [displayValue, setDisplayValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousValueRef = useRef(value);

  // Synchroniser displayValue uniquement quand la valeur externe change réellement
  useEffect(() => {
    if (!multiple && typeof value === 'string') {
      // Si la valeur a changé depuis l'extérieur (pas depuis notre sélection)
      if (value !== previousValueRef.current) {
        previousValueRef.current = value;
        
        if (value && values.length > 0) {
          const item = values.find((v) => v.value_code === value);
          if (item) {
            setDisplayValue(item.value_label);
          }
        } else {
          setDisplayValue('');
        }
      }
    }
  }, [value, values, multiple]);

  // Calculer les valeurs filtrées
  const filteredValues = displayValue.trim()
    ? values.filter(v => 
        v.value_label.toLowerCase().includes(displayValue.toLowerCase()) ||
        v.value_code.toLowerCase().includes(displayValue.toLowerCase())
      )
    : values;

  // Mettre à jour la position du dropdown (fixed position = viewport coords, no scrollY)
  useEffect(() => {
    if (showSuggestions && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom,
        left: rect.left,
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
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (!currentValues.includes(code)) {
        onChange([...currentValues, code]);
      }
      setDisplayValue('');
    } else {
      // Mettre à jour la ref avant d'appeler onChange pour éviter la re-synchronisation
      previousValueRef.current = code;
      // Mettre à jour l'affichage immédiatement
      setDisplayValue(label);
      // Appeler onChange
      onChange(code);
    }
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value);
    setShowSuggestions(true);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleRemove = (code: string) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((c) => c !== code));
    }
  };

  const handleClear = () => {
    setDisplayValue('');
    onChange(multiple ? [] : '');
    previousValueRef.current = '';
    setShowSuggestions(false);
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
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={loading ? 'Chargement...' : placeholder}
          disabled={loading}
          className="w-full pr-10"
        />
        
        {displayValue && !loading && (
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
            className="fixed bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              zIndex: 100001
            }}
          >
            {filteredValues.map((item) => (
              <button
                key={item.value_code}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center justify-between"
                onMouseDown={(e) => {
                  e.preventDefault(); // Empêcher le blur de l'input
                  handleSelect(item.value_code, item.value_label);
                }}
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
        {showSuggestions && filteredValues.length === 0 && displayValue.trim() && createPortal(
          <div
            className="fixed bg-popover border border-border rounded-md shadow-lg p-3 text-sm text-muted-foreground"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              zIndex: 100001
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
