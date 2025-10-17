import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
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
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedCountry, setSelectedCountry] = React.useState<Country>(
      worldCountries.find(c => c.code === defaultCountry) || worldCountries[0]
    );
    const [phoneNumber, setPhoneNumber] = React.useState("");
    const dropdownRef = React.useRef<HTMLDivElement>(null);

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

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };

      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [open]);

    const handleCountrySelect = (country: Country) => {
      setSelectedCountry(country);
      setOpen(false);
      setSearchQuery("");
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

    const filteredCountries = React.useMemo(() => {
      if (!searchQuery) return worldCountries;
      const query = searchQuery.toLowerCase();
      return worldCountries.filter(
        (country) =>
          country.name.toLowerCase().includes(query) ||
          country.nameAr.includes(query) ||
          country.dialCode.includes(query)
      );
    }, [searchQuery]);

    return (
      <div className="flex gap-2">
        <div ref={dropdownRef} className="relative w-[180px]">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-input rounded-lg bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <span className="flex items-center gap-2 truncate">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
            </span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </button>

          {open && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-lg shadow-lg z-50 max-h-[300px] overflow-hidden">
              <div className="p-2 border-b border-border">
                <Input
                  type="text"
                  placeholder="Rechercher un pays..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="overflow-y-auto max-h-[250px]">
                {filteredCountries.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    Aucun pays trouvé.
                  </div>
                ) : (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                        selectedCountry.code === country.code && "bg-accent"
                      )}
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="flex-1 text-left truncate">{country.name}</span>
                      <span className="text-muted-foreground text-xs">{country.dialCode}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1">
          <Input
            type="tel"
            ref={ref}
            value={phoneNumber}
            onChange={handlePhoneChange}
            className={cn(className)}
            placeholder="6 XX XX XX XX"
            {...props}
          />
        </div>
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
