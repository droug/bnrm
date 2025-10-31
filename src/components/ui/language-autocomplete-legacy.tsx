/**
 * @deprecated Ce composant est obsolète. Utilisez GenericAutocomplete avec listCode="world_languages" à la place.
 * 
 * Exemple de migration:
 * <LanguageAutocomplete value={language} onChange={setLanguage} />
 * devient:
 * <GenericAutocomplete listCode="world_languages" value={language} onChange={setLanguage} />
 */

import { GenericAutocomplete } from './generic-autocomplete';

interface LanguageAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function LanguageAutocomplete({
  value = '',
  onChange,
  placeholder = 'Rechercher une langue...',
  label,
  className,
}: LanguageAutocompleteProps) {
  return (
    <GenericAutocomplete
      listCode="world_languages"
      value={value}
      onChange={(v) => onChange?.(v as string)}
      label={label}
      placeholder={placeholder}
      className={className}
    />
  );
}
