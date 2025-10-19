import { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSystemList } from '@/hooks/useSystemList';

interface DynamicMultiSelectProps {
  source: string;
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  maxSelections?: number;
}

/**
 * Composant Multi-Select dynamique avec autocomplete
 */
export function DynamicMultiSelect({
  source,
  value = [],
  onChange,
  placeholder = 'Rechercher et sélectionner...',
  label,
  required = false,
  disabled = false,
  className,
  error,
  maxSelections
}: DynamicMultiSelectProps) {
  const { options, loading, error: loadError, search, getLabel } = useSystemList(source);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredOptions = searchQuery
    ? search(searchQuery).map(v => ({ value: v.value_code, label: v.value_label }))
    : options;

  const availableOptions = filteredOptions.filter(
    opt => !value.includes(opt.value)
  );

  const handleAdd = (optionValue: string) => {
    if (maxSelections && value.length >= maxSelections) {
      return;
    }
    onChange?.([...value, optionValue]);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleRemove = (optionValue: string) => {
    onChange?.(value.filter(v => v !== optionValue));
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

      {/* Selected values */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/30">
          {value.map(v => (
            <Badge key={v} variant="secondary" className="gap-1">
              <span>{getLabel(v)}</span>
              <button
                type="button"
                onClick={() => handleRemove(v)}
                disabled={disabled}
                className="ml-1 hover:bg-destructive/20 rounded-sm"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          disabled={disabled || loading || (maxSelections !== undefined && value.length >= maxSelections)}
          className={cn(error && 'border-destructive')}
        />
        
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}

        {/* Dropdown */}
        {showDropdown && !loading && availableOptions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto">
            {availableOptions.map(option => (
              <button
                key={option.value}
                type="button"
                className="w-full flex items-center px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                onClick={() => handleAdd(option.value)}
              >
                <Check className="mr-2 h-4 w-4 opacity-0" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {maxSelections && (
        <p className="text-xs text-muted-foreground">
          {value.length} / {maxSelections} sélectionné{value.length > 1 ? 's' : ''}
        </p>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
