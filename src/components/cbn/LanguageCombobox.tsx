import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const languages = [
  { value: "all", label: "Toutes les langues" },
  { value: "ar", label: "Arabe" },
  { value: "fr", label: "Français" },
  { value: "en", label: "Anglais" },
  { value: "es", label: "Espagnol" },
  { value: "de", label: "Allemand" },
  { value: "it", label: "Italien" },
  { value: "pt", label: "Portugais" },
  { value: "ru", label: "Russe" },
  { value: "zh", label: "Chinois" },
  { value: "ja", label: "Japonais" },
  { value: "ko", label: "Coréen" },
  { value: "tr", label: "Turc" },
  { value: "nl", label: "Néerlandais" },
  { value: "pl", label: "Polonais" },
  { value: "sv", label: "Suédois" },
  { value: "no", label: "Norvégien" },
  { value: "da", label: "Danois" },
  { value: "fi", label: "Finnois" },
  { value: "el", label: "Grec" },
  { value: "he", label: "Hébreu" },
  { value: "hi", label: "Hindi" },
  { value: "bn", label: "Bengali" },
  { value: "ur", label: "Ourdou" },
  { value: "fa", label: "Persan" },
  { value: "th", label: "Thaï" },
  { value: "vi", label: "Vietnamien" },
  { value: "id", label: "Indonésien" },
  { value: "ms", label: "Malais" },
  { value: "tl", label: "Tagalog" },
  { value: "sw", label: "Swahili" },
  { value: "am", label: "Amharique" },
  { value: "ha", label: "Haoussa" },
  { value: "yo", label: "Yoruba" },
  { value: "ig", label: "Igbo" },
  { value: "zu", label: "Zoulou" },
  { value: "xh", label: "Xhosa" },
  { value: "af", label: "Afrikaans" },
  { value: "sq", label: "Albanais" },
  { value: "hy", label: "Arménien" },
  { value: "az", label: "Azéri" },
  { value: "eu", label: "Basque" },
  { value: "be", label: "Biélorusse" },
  { value: "bs", label: "Bosniaque" },
  { value: "bg", label: "Bulgare" },
  { value: "ca", label: "Catalan" },
  { value: "hr", label: "Croate" },
  { value: "cs", label: "Tchèque" },
  { value: "et", label: "Estonien" },
  { value: "gl", label: "Galicien" },
  { value: "ka", label: "Géorgien" },
  { value: "hu", label: "Hongrois" },
  { value: "is", label: "Islandais" },
  { value: "ga", label: "Irlandais" },
  { value: "kk", label: "Kazakh" },
  { value: "lv", label: "Letton" },
  { value: "lt", label: "Lituanien" },
  { value: "mk", label: "Macédonien" },
  { value: "mt", label: "Maltais" },
  { value: "mn", label: "Mongol" },
  { value: "ro", label: "Roumain" },
  { value: "sr", label: "Serbe" },
  { value: "sk", label: "Slovaque" },
  { value: "sl", label: "Slovène" },
  { value: "uk", label: "Ukrainien" },
  { value: "cy", label: "Gallois" },
  { value: "yi", label: "Yiddish" },
  { value: "la", label: "Latin" },
  { value: "sa", label: "Sanskrit" },
  { value: "ber", label: "Berbère (Tamazight)" },
  { value: "kab", label: "Kabyle" },
  { value: "tzm", label: "Tamazight du Maroc central" },
  { value: "shi", label: "Tachelhit" },
  { value: "rif", label: "Tarifit" },
];

interface LanguageComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function LanguageCombobox({ value, onChange }: LanguageComboboxProps) {
  const [open, setOpen] = useState(false);

  const selectedLanguage = languages.find((lang) => lang.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedLanguage ? selectedLanguage.label : "Sélectionner une langue..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 z-50 bg-popover" align="start">
        <Command>
          <CommandInput placeholder="Rechercher une langue..." className="h-9" />
          <CommandList>
            <CommandEmpty>Aucune langue trouvée.</CommandEmpty>
            <CommandGroup>
              {languages.map((language) => (
                <CommandItem
                  key={language.value}
                  value={language.label}
                  onSelect={() => {
                    onChange(language.value);
                    setOpen(false);
                  }}
                >
                  {language.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === language.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
