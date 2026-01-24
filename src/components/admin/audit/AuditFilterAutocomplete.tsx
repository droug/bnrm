import { useState, useRef, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutocompleteOption {
  value: string;
  label: string;
}

interface AuditFilterAutocompleteProps {
  options: AutocompleteOption[];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  placeholder: string;
  allLabel?: string;
  className?: string;
}

export function AuditFilterAutocomplete({
  options,
  value,
  onChange,
  placeholder,
  allLabel = "Tous",
  className,
}: AuditFilterAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(() => {
    if (!value) return null;
    return options.find(opt => opt.value === value);
  }, [value, options]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const searchLower = search.toLowerCase();
    return options.filter(opt => 
      opt.label.toLowerCase().includes(searchLower) ||
      opt.value.toLowerCase().includes(searchLower)
    );
  }, [options, search]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions]);

  // Scroll to highlighted item
  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlightedEl = listRef.current.children[highlightedIndex + 1] as HTMLElement;
      if (highlightedEl) {
        highlightedEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => 
          Math.min(prev + 1, filteredOptions.length) // +1 for "All" option
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex === 0) {
          onChange(undefined);
        } else {
          onChange(filteredOptions[highlightedIndex - 1]?.value);
        }
        setIsOpen(false);
        setSearch("");
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearch("");
        break;
    }
  };

  const handleSelect = (optionValue: string | undefined) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger */}
      <div
        className={cn(
          "flex items-center gap-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer hover:bg-accent/50 transition-colors",
          isOpen && "ring-2 ring-ring ring-offset-2"
        )}
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className={cn("flex-1 truncate", !selectedOption && "text-muted-foreground")}>
          {selectedOption?.label || allLabel}
        </span>
        {selectedOption ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 hover:bg-destructive/20"
            onClick={(e) => {
              e.stopPropagation();
              onChange(undefined);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-[100001] top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg"
          style={{ maxHeight: "300px" }}
        >
          {/* Search Input */}
          <div className="p-2 border-b">
            <Input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Rechercher ${placeholder.toLowerCase()}...`}
              className="h-8"
              autoFocus
            />
          </div>

          {/* Options List */}
          <div
            ref={listRef}
            className="overflow-y-auto"
            style={{ maxHeight: "240px" }}
          >
            {/* All option */}
            <div
              className={cn(
                "px-3 py-2 cursor-pointer text-sm transition-colors",
                highlightedIndex === 0
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50",
                !value && "font-medium text-primary"
              )}
              onClick={() => handleSelect(undefined)}
              onMouseEnter={() => setHighlightedIndex(0)}
            >
              {allLabel}
            </div>

            {/* Filtered options */}
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                Aucun résultat trouvé
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={cn(
                    "px-3 py-2 cursor-pointer text-sm transition-colors",
                    highlightedIndex === index + 1
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50",
                    value === option.value && "font-medium text-primary"
                  )}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index + 1)}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>

          {/* Count */}
          <div className="px-3 py-1.5 border-t text-xs text-muted-foreground bg-muted/30">
            {filteredOptions.length} option{filteredOptions.length > 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}
