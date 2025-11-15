import { useState, useEffect, useRef } from 'react';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSystemList } from '@/hooks/useSystemList';
import * as Popover from '@radix-ui/react-popover';

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

  // Synchroniser la valeur affichée avec la valeur sélectionnée uniquement si l'utilisateur ne tape pas
  useEffect(() => {
    if (!isTyping) {
      if (value) {
        const label = getLabel(value);
        setSearchQuery(label || '');
      } else {
        setSearchQuery('');
      }
    }
  }, [value, getLabel, isTyping]);

  const filteredOptions = searchQuery
    ? search(searchQuery)
    : options;

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
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <Popover.Root open={open} onOpenChange={setOpen}>
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
        </div>

        <Popover.Portal>
          <Popover.Content
            className="z-[var(--z-popover)] w-[var(--radix-popover-trigger-width)] bg-popover border rounded-md shadow-lg max-h-60 overflow-auto"
            sideOffset={4}
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {!loading && filteredOptions.length > 0 && (
              <div className="py-1">
                {filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value, option.label)}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors',
                      value === option.value && 'bg-accent/50'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
            
            {!loading && searchQuery && filteredOptions.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                Aucun résultat trouvé
              </div>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
