import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimpleSelectOption {
  value: string;
  label: string;
}

interface SimpleSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SimpleSelectOption[];
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function SimpleSelect({
  value,
  onValueChange,
  options,
  placeholder = "Sélectionner...",
  className,
  icon,
}: SimpleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  return (
    <>
      <div ref={containerRef} className={cn("relative", className)}>
        {/* Trigger Button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-14 w-full items-center justify-between rounded-md border-2 border-input bg-background px-4 py-2 text-base hover:border-primary/50 transition-colors focus:outline-none focus:border-primary"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className={cn(!selectedOption && "text-muted-foreground")}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "transform rotate-180"
            )}
          />
        </button>
      </div>

      {/* Dropdown List - Rendered with fixed positioning */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
          className="bg-background border-2 border-input rounded-md shadow-lg z-[100] max-h-[300px] overflow-auto"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onValueChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 text-left hover:bg-accent transition-colors",
                value === option.value && "bg-accent/50"
              )}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
