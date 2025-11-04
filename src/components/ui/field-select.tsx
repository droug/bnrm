import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

interface FieldSelectItemProps {
  value: string;
  children: React.ReactNode;
}

export function FieldSelectItem({ value, children }: FieldSelectItemProps) {
  return (
    <div data-value={value} data-label={children}>
      {children}
    </div>
  );
}

export function FieldSelect({
  value,
  onValueChange,
  placeholder = "Sélectionner...",
  disabled = false,
  children,
}: FieldSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const selectRef = useRef<HTMLDivElement>(null);

  // Extraire les options depuis les enfants
  const options: Array<{ value: string; label: React.ReactNode }> = [];
  
  const extractOptions = (child: any) => {
    if (!child) return;
    
    if (Array.isArray(child)) {
      child.forEach(extractOptions);
    } else if (child.type === FieldSelectItem) {
      options.push({
        value: child.props.value,
        label: child.props.children,
      });
    } else if (child.props?.children) {
      extractOptions(child.props.children);
    }
  };
  
  extractOptions(children);

  // Trouver le label de la valeur sélectionnée
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label || placeholder;

  // Calculer la position de la liste déroulante
  useEffect(() => {
    if (isOpen && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Fermer la liste si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className="relative w-full">
      {/* Bouton trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
          "ring-offset-background placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !value && "text-muted-foreground"
        )}
      >
        <span className="truncate">{displayValue}</span>
        <ChevronDown
          className={cn(
            "ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Liste déroulante via Portal */}
      {isOpen && createPortal(
        <div 
          className="fixed z-[9999] rounded-md border border-border bg-background shadow-lg"
          style={{
            top: `${dropdownPosition.top + 4}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          <div className="max-h-[300px] overflow-y-auto p-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "w-full rounded-sm px-3 py-2 text-sm text-left",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                  "transition-colors cursor-pointer",
                  value === option.value && "bg-accent text-accent-foreground font-medium"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
