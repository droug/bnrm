import { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSystemList } from '@/hooks/useSystemList';

interface DynamicSelectProps {
  source: string; // Code de la liste système
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

/**
 * Composant Select dynamique avec autocomplete
 * Charge les options depuis les system_lists
 */
export function DynamicSelect({
  source,
  value,
  onChange,
  placeholder = 'Sélectionner...',
  label,
  required = false,
  disabled = false,
  className,
  error
}: DynamicSelectProps) {
  const { options, loading, error: loadError, search, getLabel } = useSystemList(source);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleSelect = (selectedValue: string) => {
    onChange?.(selectedValue);
    setOpen(false);
    setSearchQuery('');
  };

  const displayValue = value ? getLabel(value) : placeholder;

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
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || loading}
          className={cn(
            'w-full justify-between',
            !value && 'text-muted-foreground',
            error && 'border-destructive'
          )}
          onClick={() => setOpen(!open)}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement...
            </>
          ) : (
            <>
              <span className="truncate">{displayValue}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </>
          )}
        </Button>

        {open && !loading && (
          <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="p-2 border-b sticky top-0 bg-background">
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8"
                autoFocus
              />
            </div>
            
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                Aucun résultat trouvé
              </div>
            ) : (
              <div className="py-1">
                {filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      'w-full flex items-center px-3 py-2 text-sm hover:bg-accent transition-colors text-left',
                      value === option.value && 'bg-accent'
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
