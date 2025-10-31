/**
 * @deprecated Ce composant est obsolète. Utilisez GenericAutocomplete avec listCode="world_countries" à la place.
 * 
 * Exemple de migration:
 * <CountryAutocomplete value={countries} onChange={setCountries} />
 * devient:
 * <GenericAutocomplete listCode="world_countries" value={countries} onChange={setCountries} multiple />
 */

import { GenericAutocomplete } from './generic-autocomplete';

interface CountryAutocompleteProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  placeholder?: string;
}

export function CountryAutocomplete({ 
  value, 
  onChange, 
  label = 'Pays', 
  placeholder = 'Rechercher un pays...' 
}: CountryAutocompleteProps) {
  return (
    <GenericAutocomplete
      listCode="world_countries"
      value={value}
      onChange={onChange as (value: string | string[]) => void}
      label={label}
      placeholder={placeholder}
      multiple
    />
  );
}
