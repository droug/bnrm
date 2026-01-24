import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimpleInlineSelectOption {
  value: string;
  label: string;
}

interface SimpleInlineSelectProps {
  options: SimpleInlineSelectOption[];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  placeholder: string;
  allLabel?: string;
  className?: string;
}

export function SimpleInlineSelect({
  options,
  value,
  onChange,
  placeholder,
  allLabel = "Tous",
  className,
}: SimpleInlineSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = search.trim()
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (optionValue: string | undefined) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Bouton déclencheur */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className="flex h-10 w-full items-center justify-between rounded-md border-2 border-input bg-background px-3 py-2 text-sm hover:border-primary/50 transition-colors focus:outline-none focus:border-primary"
      >
        <span className={cn(!selectedOption && "text-muted-foreground")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {selectedOption && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
              className="p-0.5 hover:bg-destructive/20 rounded"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Liste déroulante simple - directement en dessous */}
      {isOpen && (
        <div className="mt-1 w-full bg-background border-2 border-input rounded-md shadow-md overflow-hidden">
          {/* Champ de recherche */}
          <div className="p-2 border-b border-input">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Rechercher...`}
              className="w-full h-8 px-2 text-sm border border-input rounded focus:outline-none focus:border-primary bg-background"
            />
          </div>

          {/* Liste des options */}
          <div className="max-h-[200px] overflow-y-auto">
            {/* Option "Tous" */}
            <button
              type="button"
              onClick={() => handleSelect(undefined)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent transition-colors",
                !value && "bg-accent/50 font-medium"
              )}
            >
              <span>{allLabel}</span>
              {!value && <Check className="h-4 w-4 text-primary" />}
            </button>

            {/* Options filtrées */}
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                Aucun résultat
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent transition-colors",
                    value === option.value && "bg-accent/50 font-medium"
                  )}
                >
                  <span>{option.label}</span>
                  {value === option.value && (
                    <Check className="h-4 w-4 text-primary" />
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
