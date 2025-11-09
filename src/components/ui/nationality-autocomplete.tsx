import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
}

export function NationalityAutocomplete({
  value,
  onChange,
  placeholder = 'Sélectionner la nationalité',
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

  const selectedNationality = nationalities.find((n) => n.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedNationality ? selectedNationality.label_fr : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher une nationalité..." />
          <CommandEmpty>
            {loading ? 'Chargement...' : 'Aucune nationalité trouvée.'}
          </CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {nationalities.map((nationality) => (
              <CommandItem
                key={nationality.code}
                value={nationality.label_fr}
                onSelect={() => {
                  onChange(nationality.code);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === nationality.code ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {nationality.label_fr}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
