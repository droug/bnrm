import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Note: applying CSS `filter` on <body> can break `position: fixed` portals.
// We keep this dropdown as a body-portal with viewport-based positioning.

interface PortalSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface PortalSelectProps {
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  options: PortalSelectOption[];
  disabled?: boolean;
  className?: string;
}

export function PortalSelect({
  placeholder = "Sélectionnez une option",
  value,
  onChange,
  options,
  disabled = false,
  className = "",
}: PortalSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef(false);

  // Calculer la position du dropdown (fixed par rapport au viewport)
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Fermer au clic extérieur
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      // Si on est en train de sélectionner, ne pas fermer
      if (isSelectingRef.current) {
        isSelectingRef.current = false;
        return;
      }

      const target = event.target as Node;
      
      // Vérifier si le clic est sur le bouton
      if (buttonRef.current && buttonRef.current.contains(target)) {
        return;
      }
      
      // Vérifier si le clic est sur le dropdown via l'ID (car ref peut ne pas être prêt)
      const dropdownEl = document.getElementById("portal-select-dropdown");
      if (dropdownEl && dropdownEl.contains(target)) {
        return;
      }
      
      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    // Ajouter les listeners après un micro-tick pour permettre au portal de se rendre
    const frameId = requestAnimationFrame(() => {
      document.addEventListener("pointerdown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    });
    
    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelect = useCallback((optionValue: string) => {
    isSelectingRef.current = true;
    onChange(optionValue);
    setIsOpen(false);
  }, [onChange]);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  const dropdownContent = isOpen ? (
    <div
      ref={dropdownRef}
      id="portal-select-dropdown"
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 99999,
      }}
      className="bg-background border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto"
      onPointerDown={(e) => {
        // Empêcher la propagation vers le document listener
        e.stopPropagation();
      }}
    >
      <ul className="py-1">
        {options.map((option) => (
          <li
            key={option.value}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSelect(option.value);
            }}
            className={cn(
              "px-4 py-2.5 text-sm cursor-pointer transition-colors select-none",
              "hover:bg-accent",
              value === option.value && "bg-accent/50 font-medium"
            )}
          >
            {option.description ? (
              <div className="flex flex-col pointer-events-none">
                <span className="font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </div>
            ) : (
              <span className="pointer-events-none">{option.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm transition-all",
          "hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          !selectedOption && "text-muted-foreground",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <span className="truncate">{displayValue}</span>
        <ChevronDown className={cn(
          "ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>
      {createPortal(dropdownContent, document.body)}
    </>
  );
}
