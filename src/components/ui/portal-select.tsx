import { useState, useRef, useEffect } from "react";
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
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        const dropdownEl = document.getElementById("portal-select-dropdown");
        if (dropdownEl && !dropdownEl.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  const dropdownContent = isOpen ? (
    <div
      id="portal-select-dropdown"
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 99999,
      }}
      className="bg-background border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto"
    >
      <ul className="py-1">
        {options.map((option) => (
          <li
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={cn(
              "px-4 py-2.5 text-sm cursor-pointer transition-colors",
              "hover:bg-accent",
              value === option.value && "bg-accent/50 font-medium"
            )}
          >
            {option.description ? (
              <div className="flex flex-col">
                <span className="font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </div>
            ) : (
              option.label
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
