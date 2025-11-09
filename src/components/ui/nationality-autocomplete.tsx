/**
 * Composant d'autocomplete pour les nationalités
 * Charge les données depuis la base de données via la liste "nationalities"
 */

import { GenericAutocomplete } from './generic-autocomplete';

interface NationalityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function NationalityAutocomplete({ 
  value, 
  onChange, 
  label = 'Nationalité', 
  placeholder = 'Rechercher une nationalité...',
  className 
}: NationalityAutocompleteProps) {
  return (
    <GenericAutocomplete
      listCode="nationalities"
      value={value}
      onChange={onChange as (value: string | string[]) => void}
      label={label}
      placeholder={placeholder}
      className={className}
    />
  );
}