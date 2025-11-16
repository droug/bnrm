import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimpleListSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export function SimpleListSelect({
  value,
  onChange,
  options,
  placeholder = "Sélectionner",
  disabled = false,
  required = false,
}: SimpleListSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border border-input bg-background px-4 py-3 text-[15px]",
          "hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !value && "text-muted-foreground/60"
        )}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="mt-1 w-full border border-input bg-background rounded-lg shadow-lg max-h-[200px] overflow-auto">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-4 py-2.5 text-[15px] hover:bg-muted/50 transition-colors",
                value === option && "bg-muted font-medium"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
