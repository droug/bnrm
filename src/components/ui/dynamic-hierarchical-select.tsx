import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSystemList } from '@/hooks/useSystemList';

interface DynamicHierarchicalSelectProps {
  source: string;
  value?: string;
  onChange?: (value: string, parentValue?: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

/**
 * Composant Select hiérarchique à 2 niveaux (ex: disciplines)
 */
export function DynamicHierarchicalSelect({
  source,
  value,
  onChange,
  placeholder = 'Sélectionner...',
  label,
  required = false,
  disabled = false,
  className,
  error
}: DynamicHierarchicalSelectProps) {
  const { hierarchicalOptions, loading, error: loadError, getLabel } = useSystemList(source);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredOptions = searchQuery
    ? hierarchicalOptions
        .map(parent => ({
          ...parent,
          children: parent.children.filter(child =>
            child.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            parent.label.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }))
        .filter(parent => 
          parent.children.length > 0 ||
          parent.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
    : hierarchicalOptions;

  const handleSelect = (selectedValue: string) => {
    onChange?.(selectedValue);
    setShowDropdown(false);
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
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}

      <div className="relative">
        <Input
          placeholder={displayValue}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          disabled={disabled || loading}
          className={cn(error && 'border-destructive')}
        />

        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}

        {showDropdown && !loading && (
          <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-96 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                Aucun résultat trouvé
              </div>
            ) : (
              filteredOptions.map(parent => (
                <div key={parent.value}>
                  {/* Parent category */}
                  <div className="px-3 py-2 bg-muted/50 text-sm font-semibold sticky top-0">
                    {parent.label}
                  </div>
                  
                  {/* Children */}
                  {parent.children.map(child => (
                    <button
                      key={child.value}
                      type="button"
                      className={cn(
                        'w-full flex items-center px-5 py-2 text-sm hover:bg-accent transition-colors text-left',
                        value === child.value && 'bg-accent'
                      )}
                      onClick={() => handleSelect(child.value)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === child.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <span>{child.label}</span>
                    </button>
                  ))}
                </div>
              ))
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
