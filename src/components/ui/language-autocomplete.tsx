import { useState, useEffect, useRef } from 'react';
import { Check, Languages, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { worldLanguages } from '@/data/worldLanguages';

interface LanguageAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

/**
 * Composant d'auto-complétion pour les langues
 * Utilise la liste complète des langues mondiales
 */
export function LanguageAutocomplete({
  value = '',
  onChange,
  placeholder = 'Rechercher une langue...',
  label,
  className,
}: LanguageAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredLanguages, setFilteredLanguages] = useState(worldLanguages);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrer les langues
  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    
    if (newValue.length === 0) {
      setFilteredLanguages(worldLanguages);
    } else {
      const filtered = worldLanguages.filter(lang => 
        lang.name.toLowerCase().includes(newValue.toLowerCase()) ||
        lang.code.toLowerCase().includes(newValue.toLowerCase())
      );
      setFilteredLanguages(filtered);
    }
    
    setOpen(true);
  };

  const handleSelect = (langCode: string, langName: string) => {
    setInputValue(langName);
    onChange?.(langCode);
    setOpen(false);
  };

  const handleClear = () => {
    setInputValue('');
    onChange?.('');
    setFilteredLanguages(worldLanguages);
  };

  // Synchroniser avec la prop value
  useEffect(() => {
    if (value) {
      const lang = worldLanguages.find(l => l.code === value);
      setInputValue(lang?.name || value);
    } else {
      setInputValue('');
    }
  }, [value]);

  return (
    <div className={cn('space-y-2 relative', className)} ref={containerRef}>
      {label && (
        <Label className="text-sm font-medium">{label}</Label>
      )}
      
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setOpen(true)}
          className="pr-20"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-accent rounded-sm transition-colors"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
          <Languages className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Dropdown des suggestions */}
        {open && filteredLanguages.length > 0 && (
          <div className="absolute z-[9999] w-full mt-1 bg-popover text-popover-foreground border rounded-lg shadow-lg max-h-80 overflow-auto">
            <div className="py-1">
              {filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-2 text-sm hover:bg-accent transition-colors text-left',
                    value === lang.code && 'bg-accent/50'
                  )}
                  onClick={() => handleSelect(lang.code, lang.name)}
                >
                  <Check
                    className={cn(
                      'h-4 w-4 shrink-0 mt-0.5',
                      value === lang.code ? 'opacity-100 text-primary' : 'opacity-0'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{lang.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {lang.code.toUpperCase()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message si aucun résultat */}
        {open && filteredLanguages.length === 0 && inputValue.length > 0 && (
          <div className="absolute z-[9999] w-full mt-1 bg-popover text-popover-foreground border rounded-lg shadow-lg">
            <div className="p-4 text-sm text-muted-foreground text-center">
              Aucune langue trouvée pour "{inputValue}"
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
