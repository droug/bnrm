import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Option {
  value: string;
  label: string;
  description?: string;
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
  };
}

interface InlineMultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function InlineMultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Sélectionnez...",
  className,
}: InlineMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOptions = options.filter(opt => selected.includes(opt.value));

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    option.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const removeOption = (value: string) => {
    onChange(selected.filter(v => v !== value));
  };

  // Calculer la position du dropdown quand il s'ouvre
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("space-y-2", className)} ref={containerRef}>
      {/* Selected badges */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30">
          {selectedOptions.map(option => (
            <Badge key={option.value} variant="secondary" className="gap-1 py-1.5">
              <span>{option.label}</span>
              {option.badge && (
                <span className="text-xs opacity-70">• {option.badge.text}</span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeOption(option.value);
                }}
                className="ml-1 hover:bg-destructive/20 rounded-sm"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Trigger button */}
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between h-auto min-h-[44px]"
      >
        <span className="text-muted-foreground">
          {selectedOptions.length > 0
            ? `${selectedOptions.length} élément(s) sélectionné(s)`
            : placeholder}
        </span>
        <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {/* Dropdown list - utilise position fixed pour éviter les problèmes de conteneur */}
      {isOpen && (
        <div 
          className="fixed bg-background border rounded-md shadow-lg max-h-80 overflow-hidden"
          style={{ 
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            zIndex: 9999
          }}
        >
          {/* Search input */}
          <div className="p-2 border-b bg-background sticky top-0">
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
              autoFocus
            />
          </div>

          {/* Options list */}
          <div className="overflow-y-auto max-h-64 bg-background">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Aucun résultat trouvé.
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleOption(option.value)}
                  className="w-full text-left px-3 py-2.5 hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      selected.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{option.label}</span>
                      {option.badge && (
                        <Badge variant={option.badge.variant} className="text-xs">
                          {option.badge.text}
                        </Badge>
                      )}
                    </div>
                    {option.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {option.description}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
