import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';

interface Nationality {
  code: string;
  label_fr: string;
}

interface NationalityAutocompleteProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  gender?: 'homme' | 'femme' | '';
  onOtherValueChange?: (value: string) => void;
  otherValue?: string;
}

// Fonction pour convertir une nationalité féminine en masculin
function toMasculine(nationality: string): string {
  // Règles de transformation féminin → masculin pour les nationalités françaises
  const transformations: Record<string, string> = {
    // Terminaisons en -ienne → -ien
    'Algérienne': 'Algérien',
    'Tunisienne': 'Tunisien',
    'Égyptienne': 'Égyptien',
    'Italienne': 'Italien',
    'Canadienne': 'Canadien',
    'Indienne': 'Indien',
    'Brésilienne': 'Brésilien',
    'Australienne': 'Australien',
    'Mauritanienne': 'Mauritanien',
    'Libyenne': 'Libyen',
    'Syrienne': 'Syrien',
    'Jordanienne': 'Jordanien',
    'Palestinienne': 'Palestinien',
    'Irakienne': 'Irakien',
    'Iranienne': 'Iranien',
    'Saoudienne': 'Saoudien',
    'Koweïtienne': 'Koweïtien',
    'Bahreïnienne': 'Bahreïnien',
    'Qatarienne': 'Qatarien',
    'Émirienne': 'Émirien',
    'Omanienne': 'Omanien',
    'Yéménite': 'Yéménite', // Invariable
    'Ukrainienne': 'Ukrainien',
    'Russe': 'Russe', // Invariable
    'Norvégienne': 'Norvégien',
    'Suédoise': 'Suédois',
    'Finlandaise': 'Finlandais',
    'Danoise': 'Danois',
    'Polonaise': 'Polonais',
    'Tchèque': 'Tchèque', // Invariable
    'Autrichienne': 'Autrichien',
    'Hongroise': 'Hongrois',
    'Roumaine': 'Roumain',
    'Bulgare': 'Bulgare', // Invariable
    'Grecque': 'Grec',
    'Turque': 'Turc',
    'Serbe': 'Serbe', // Invariable
    'Croate': 'Croate', // Invariable
    'Slovène': 'Slovène', // Invariable
    'Albanaise': 'Albanais',
    'Macédonienne': 'Macédonien',
    'Monténégrine': 'Monténégrin',
    'Bosniaque': 'Bosniaque', // Invariable
    'Kosovare': 'Kosovar',
    'Afghane': 'Afghan',
    'Pakistanaise': 'Pakistanais',
    'Bangladaise': 'Bangladais',
    'Sri-Lankaise': 'Sri-Lankais',
    'Népalaise': 'Népalais',
    'Birmane': 'Birman',
    'Thaïlandaise': 'Thaïlandais',
    'Vietnamienne': 'Vietnamien',
    'Cambodgienne': 'Cambodgien',
    'Laotienne': 'Laotien',
    'Malaisienne': 'Malaisien',
    'Indonésienne': 'Indonésien',
    'Philippine': 'Philippin',
    'Chinoise': 'Chinois',
    'Japonaise': 'Japonais',
    'Coréenne': 'Coréen',
    'Mongole': 'Mongol',
    'Américaine': 'Américain',
    'Mexicaine': 'Mexicain',
    'Cubaine': 'Cubain',
    'Haïtienne': 'Haïtien',
    'Jamaïcaine': 'Jamaïcain',
    'Colombienne': 'Colombien',
    'Vénézuélienne': 'Vénézuélien',
    'Péruvienne': 'Péruvien',
    'Chilienne': 'Chilien',
    'Argentine': 'Argentin',
    'Uruguayenne': 'Uruguayen',
    'Paraguayenne': 'Paraguayen',
    'Bolivienne': 'Bolivien',
    'Équatorienne': 'Équatorien',
    'Sud-Africaine': 'Sud-Africain',
    'Nigériane': 'Nigérian',
    'Ghanéenne': 'Ghanéen',
    'Kenyane': 'Kenyan',
    'Éthiopienne': 'Éthiopien',
    'Soudanaise': 'Soudanais',
    'Congolaise': 'Congolais',
    'Camerounaise': 'Camerounais',
    'Ivoirienne': 'Ivoirien',
    'Sénégalaise': 'Sénégalais',
    'Malienne': 'Malien',
    'Burkinabè': 'Burkinabè', // Invariable
    'Nigérienne': 'Nigérien',
    'Togolaise': 'Togolais',
    'Béninoise': 'Béninois',
    'Gabonaise': 'Gabonais',
    'Centrafricaine': 'Centrafricain',
    'Tchadienne': 'Tchadien',
    'Rwandaise': 'Rwandais',
    'Burundaise': 'Burundais',
    'Ougandaise': 'Ougandais',
    'Tanzanienne': 'Tanzanien',
    'Zambienne': 'Zambien',
    'Zimbabwéenne': 'Zimbabwéen',
    'Mozambicaine': 'Mozambicain',
    'Angolaise': 'Angolais',
    'Namibienne': 'Namibien',
    'Botswanaise': 'Botswanais',
    'Malgache': 'Malgache', // Invariable
    'Mauricienne': 'Mauricien',
    'Comorienne': 'Comorien',
    'Seychelloise': 'Seychellois',
    // Terminaisons en -aise → -ais
    'Française': 'Français',
    'Anglaise': 'Anglais',
    'Irlandaise': 'Irlandais',
    'Écossaise': 'Écossais',
    'Galloise': 'Gallois',
    'Portugaise': 'Portugais',
    'Néerlandaise': 'Néerlandais',
    'Libanaise': 'Libanais',
    // Terminaisons en -e → suppression du e
    'Allemande': 'Allemand',
    'Espagnole': 'Espagnol',
    'Belge': 'Belge', // Invariable
    'Suisse': 'Suisse', // Invariable
    'Luxembourgeoise': 'Luxembourgeois',
    'Marocaine': 'Marocain',
  };

  // Chercher une correspondance exacte
  if (transformations[nationality]) {
    return transformations[nationality];
  }

  // Règles génériques de transformation
  // -ienne → -ien
  if (nationality.endsWith('ienne')) {
    return nationality.slice(0, -5) + 'ien';
  }
  // -aise → -ais
  if (nationality.endsWith('aise')) {
    return nationality.slice(0, -4) + 'ais';
  }
  // -oise → -ois
  if (nationality.endsWith('oise')) {
    return nationality.slice(0, -4) + 'ois';
  }
  // -ane → -an
  if (nationality.endsWith('ane')) {
    return nationality.slice(0, -3) + 'an';
  }
  // -ine → -in
  if (nationality.endsWith('ine')) {
    return nationality.slice(0, -3) + 'in';
  }
  // -que (féminin) → -c (masculin) pour certains cas
  if (nationality === 'Grecque') {
    return 'Grec';
  }
  if (nationality === 'Turque') {
    return 'Turc';
  }

  // Par défaut, retourner tel quel (nationalités invariables ou déjà masculines)
  return nationality;
}

export function NationalityAutocomplete({
  value,
  onChange,
  placeholder = 'Sélectionner la nationalité',
  gender = '',
  onOtherValueChange,
  otherValue = '',
}: NationalityAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [nationalities, setNationalities] = useState<Nationality[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNationalities();
  }, []);

  const loadNationalities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('nationalities')
        .select('code, label_fr')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setNationalities(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des nationalités:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transformer les nationalités selon le genre
  const getDisplayLabel = (label: string): string => {
    if (gender === 'homme') {
      return toMasculine(label);
    }
    // Par défaut (femme ou non spécifié), garder le féminin (forme stockée en DB)
    return label;
  };

  const selectedNationality = nationalities.find((n) => n.code === value);
  const isOtherSelected = value === 'OTHER';

  // Afficher le label sélectionné (avec fallback si pas encore chargé)
  const getSelectedLabel = (): string => {
    if (isOtherSelected) return 'Autre';
    if (selectedNationality) return getDisplayLabel(selectedNationality.label_fr);
    if (value && loading) return 'Chargement...';
    if (value && !selectedNationality && !loading) return value; // Fallback: show code if not found
    return placeholder;
  };

  // Préparer la liste avec "Autre" à la fin (seulement si pas déjà présent dans la DB)
  const hasOtherInDb = nationalities.some(n => n.code === 'OTHER');
  const displayNationalities = hasOtherInDb 
    ? nationalities 
    : [...nationalities, { code: 'OTHER', label_fr: 'Autre' }];

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span className="truncate">
              {getSelectedLabel()}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[200px] p-0 bg-popover border border-border shadow-lg z-[100]" align="start">
          <Command>
            <CommandInput placeholder="Rechercher une nationalité..." />
            <CommandEmpty>
              {loading ? 'Chargement...' : 'Aucune nationalité trouvée.'}
            </CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {displayNationalities.map((nationality) => (
                <CommandItem
                  key={nationality.code}
                  value={nationality.code === 'OTHER' ? 'Autre' : getDisplayLabel(nationality.label_fr)}
                  onSelect={() => {
                    onChange(nationality.code);
                    if (nationality.code !== 'OTHER' && onOtherValueChange) {
                      onOtherValueChange('');
                    }
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === nationality.code ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {nationality.code === 'OTHER' ? 'Autre' : getDisplayLabel(nationality.label_fr)}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Champ de saisie si "Autre" est sélectionné */}
      {isOtherSelected && (
        <Input
          value={otherValue}
          onChange={(e) => onOtherValueChange?.(e.target.value)}
          placeholder="Précisez votre nationalité..."
          className="mt-2"
        />
      )}
    </div>
  );
}