/**
 * Composant d'autocomplete pour un seul pays (sélection simple)
 * Charge les données depuis la base de données via la liste "world_countries"
 */

import { GenericAutocomplete } from './generic-autocomplete';

interface CountrySingleAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function CountrySingleAutocomplete({
  value = '',
  onChange,
  placeholder = "Rechercher un pays...",
  label,
  className,
}: CountrySingleAutocompleteProps) {
  return (
    <GenericAutocomplete
      listCode="world_countries"
      value={value}
      onChange={(v) => onChange?.(v as string)}
      label={label}
      placeholder={placeholder}
      className={className}
    />
  );
}
