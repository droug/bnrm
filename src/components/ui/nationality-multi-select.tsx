import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

interface NationalityMultiSelectProps {
  value?: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  gender?: 'homme' | 'femme' | '';
  onOtherValueChange?: (value: string) => void;
  otherValue?: string;
}

// Fonction pour convertir une nationalité féminine en masculin
function toMasculine(nationality: string): string {
  const transformations: Record<string, string> = {
    'Algérienne': 'Algérien',
    'Tunisienne': 'Tunisien',
    'Égyptienne': 'Égyptien',
    'Italienne': 'Italien',
    'Canadienne': 'Canadien',
    'Indienne': 'Indien',
    'Brésilienne': 'Brésilien',
    'Australienne': 'Australien',
    'Française': 'Français',
    'Anglaise': 'Anglais',
    'Allemande': 'Allemand',
    'Espagnole': 'Espagnol',
    'Portugaise': 'Portugais',
    'Marocaine': 'Marocain',
    'Américaine': 'Américain',
    'Chinoise': 'Chinois',
    'Japonaise': 'Japonais',
    'Russe': 'Russe',
    'Belge': 'Belge',
    'Suisse': 'Suisse',
  };

  if (transformations[nationality]) {
    return transformations[nationality];
  }

  if (nationality.endsWith('ienne')) {
    return nationality.slice(0, -5) + 'ien';
  }
  if (nationality.endsWith('aise')) {
    return nationality.slice(0, -4) + 'ais';
  }
  if (nationality.endsWith('oise')) {
    return nationality.slice(0, -4) + 'ois';
  }
  if (nationality.endsWith('ane')) {
    return nationality.slice(0, -3) + 'an';
  }

  return nationality;
}

export function NationalityMultiSelect({
  value = [],
  onChange,
  placeholder = 'Sélectionner les nationalités',
  gender = '',
  onOtherValueChange,
  otherValue = '',
}: NationalityMultiSelectProps) {
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

  const getDisplayLabel = (label: string): string => {
    if (gender === 'homme') {
      return toMasculine(label);
    }
    return label;
  };

  const isOtherSelected = value.includes('OTHER');

  const handleToggleCode = (code: string) => {
    if (value.includes(code)) {
      onChange(value.filter(v => v !== code));
      if (code === 'OTHER') {
        onOtherValueChange?.('');
      }
    } else {
      onChange([...value, code]);
    }
  };

  const removeNationality = (code: string) => {
    onChange(value.filter(v => v !== code));
    if (code === 'OTHER') {
      onOtherValueChange?.('');
    }
  };

  const getNationalityLabel = (code: string): string => {
    if (code === 'OTHER') return 'Autre';
    const nationality = nationalities.find(n => n.code === code);
    return nationality ? getDisplayLabel(nationality.label_fr) : code;
  };

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
            className="w-full justify-between font-normal min-h-[40px] h-auto"
          >
            <div className="flex flex-wrap gap-1 flex-1 text-left">
              {value.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                value.map(code => (
                  <Badge
                    key={code}
                    variant="secondary"
                    className="mr-1 mb-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNationality(code);
                    }}
                  >
                    {getNationalityLabel(code)}
                    <X className="ml-1 h-3 w-3 cursor-pointer" />
                  </Badge>
                ))
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[--radix-popover-trigger-width] min-w-[200px] p-0 bg-popover border border-border shadow-lg z-[100]" 
          align="start"
        >
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
                    handleToggleCode(nationality.code);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value.includes(nationality.code) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {nationality.code === 'OTHER' ? 'Autre' : getDisplayLabel(nationality.label_fr)}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

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
