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
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchroniser l'affichage avec la valeur sélectionnée
  useEffect(() => {
    if (!isEditing && !multiple && typeof value === 'string') {
      if (value && values.length > 0) {
        const item = values.find((v) => v.value_code === value);
        if (item) {
          setInputValue(item.value_label);
        }
      } else if (!value) {
        setInputValue('');
      }
    }
  }, [value, values, multiple, isEditing]);

  // Filtrer les valeurs
  const filteredValues = inputValue.trim() && isEditing
    ? values.filter(v => 
        v.value_label.toLowerCase().includes(inputValue.toLowerCase()) ||
        v.value_code.toLowerCase().includes(inputValue.toLowerCase())
      )
    : values;

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
        // Sortir du mode édition après un court délai
        setTimeout(() => {
          setIsEditing(false);
        }, 100);
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
      setInputValue('');
    } else {
      onChange(code);
      // Forcer l'affichage du label immédiatement
      setInputValue(label);
      // Sortir du mode édition pour que la synchronisation prenne le relais
      setTimeout(() => {
        setIsEditing(false);
      }, 50);
    }
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditing(true);
    setInputValue(e.target.value);
    if (e.target.value.trim()) {
      setShowSuggestions(true);
    }
  };

  const handleInputFocus = () => {
    setIsEditing(true);
    if (inputValue.trim()) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Ne pas quitter le mode édition immédiatement pour permettre le clic sur les suggestions
    // Le mode édition sera désactivé par handleSelect ou handleClickOutside
  };

  const handleRemove = (code: string) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((c) => c !== code));
    }
  };

  const handleClear = () => {
    setIsEditing(false);
    setInputValue('');
    onChange(multiple ? [] : '');
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
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={loading ? 'Chargement...' : placeholder}
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
