import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownOption {
  value: string;
  label: string;
}

interface SimpleDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  searchable?: boolean;
}

export function SimpleDropdown({ 
  value, 
  onChange, 
  options, 
  placeholder = "Sélectionner...",
  searchable = false 
}: SimpleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = searchable && searchQuery
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative w-full z-50" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <span className={selectedOption ? "" : "text-muted-foreground"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown List - Simple, no floating */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg overflow-hidden z-[9999]" style={{ position: 'fixed' as any }} ref={(el) => {
          if (el && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            el.style.position = 'fixed';
            el.style.top = `${rect.bottom + 4}px`;
            el.style.left = `${rect.left}px`;
            el.style.width = `${rect.width}px`;
          }
        }}>
          {searchable && (
            <div className="p-2 border-b border-input">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full px-2 py-1 text-sm border border-input rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
            </div>
          )}
          
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                Aucun résultat
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm text-left",
                    "hover:bg-accent hover:text-accent-foreground",
                    "transition-colors cursor-pointer",
                    value === option.value && "bg-accent/50"
                  )}
                >
                  <span>{option.label}</span>
                  {value === option.value && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
