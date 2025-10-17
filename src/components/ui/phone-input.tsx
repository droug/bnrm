import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
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
import { worldCountries, Country } from "@/data/worldCountries";

export interface PhoneInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
  defaultCountry?: string; // ISO code, e.g., "MA"
  onCountryChange?: (country: Country) => void;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value = "", onChange, defaultCountry = "MA", onCountryChange, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [selectedCountry, setSelectedCountry] = React.useState<Country>(
      worldCountries.find(c => c.code === defaultCountry) || worldCountries[0]
    );
    const [phoneNumber, setPhoneNumber] = React.useState("");

    // Initialize phone number from value prop
    React.useEffect(() => {
      if (value && value.startsWith("+")) {
        // Find country by dial code
        const country = worldCountries.find(c => value.startsWith(c.dialCode));
        if (country) {
          setSelectedCountry(country);
          setPhoneNumber(value.substring(country.dialCode.length).trim());
        } else {
          setPhoneNumber(value);
        }
      } else if (value) {
        setPhoneNumber(value);
      }
    }, [value]);

    const handleCountrySelect = (country: Country) => {
      setSelectedCountry(country);
      setOpen(false);
      onCountryChange?.(country);
      
      // Update full phone value
      const fullValue = `${country.dialCode} ${phoneNumber}`.trim();
      onChange?.(fullValue);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPhone = e.target.value.replace(/[^\d\s]/g, ""); // Only numbers and spaces
      setPhoneNumber(newPhone);
      
      // Update full phone value
      const fullValue = `${selectedCountry.dialCode} ${newPhone}`.trim();
      onChange?.(fullValue);
    };

    return (
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[180px] justify-between"
            >
              <span className="flex items-center gap-2 truncate">
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0 pointer-events-auto" align="start">
            <Command>
              <CommandInput placeholder="Rechercher un pays..." />
              <CommandList>
                <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
                <CommandGroup>
                  {worldCountries.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={`${country.name} ${country.nameAr} ${country.dialCode}`}
                      onSelect={() => handleCountrySelect(country)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCountry.code === country.code ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="mr-2 text-lg">{country.flag}</span>
                      <span className="flex-1">{country.name}</span>
                      <span className="text-muted-foreground text-sm ml-2">{country.dialCode}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="flex-1 relative">
          <Input
            type="tel"
            ref={ref}
            value={phoneNumber}
            onChange={handlePhoneChange}
            className={cn(className)}
            placeholder="6 XX XX XX XX"
            {...props}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none opacity-0">
            {selectedCountry.dialCode}
          </div>
        </div>
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
