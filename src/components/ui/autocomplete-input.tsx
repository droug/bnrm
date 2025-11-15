import { useState, useEffect, useRef } from 'react';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSystemList } from '@/hooks/useSystemList';

interface AutocompleteInputProps {
  source: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export function AutocompleteInput({
  source,
  value,
  onChange,
  placeholder = 'Rechercher...',
  label,
  required = false,
  disabled = false,
  className,
  error
}: AutocompleteInputProps) {
  const { options, loading, error: loadError, search, getLabel } = useSystemList(source);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchroniser la valeur affichée avec la valeur sélectionnée uniquement si l'utilisateur ne tape pas
  useEffect(() => {
    if (!isTyping) {
      if (value) {
        const label = getLabel(value);
        setSearchQuery(label);
      } else {
        setSearchQuery('');
      }
    }
  }, [value, getLabel, isTyping]);

  const filteredOptions = searchQuery
    ? search(searchQuery)
    : options;

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

  const handleSelect = (selectedValue: string, selectedLabel: string) => {
    setIsTyping(false);
    onChange?.(selectedValue);
    setSearchQuery(selectedLabel);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setIsTyping(true);
    setSearchQuery(newValue);
    setOpen(true);
    
    // Si l'utilisateur efface tout, on réinitialise la valeur
    if (!newValue) {
      onChange?.('');
    }
  };

  const handleClear = () => {
    setIsTyping(false);
    setSearchQuery('');
    onChange?.('');
    setOpen(false);
  };

  if (loadError) {
    return (
      <div className="text-sm text-destructive">
        Erreur de chargement: {loadError}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)} ref={containerRef}>
      {label && (
        <Label>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          disabled={disabled || loading}
          className={cn(
            'pr-8',
            error && 'border-destructive'
          )}
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {!loading && searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {open && !loading && filteredOptions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="py-1">
              {filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value, option.label)}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors',
                    value === option.value && 'bg-accent/50'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {open && !loading && searchQuery && filteredOptions.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
            <div className="p-4 text-sm text-muted-foreground text-center">
              Aucun résultat trouvé
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
