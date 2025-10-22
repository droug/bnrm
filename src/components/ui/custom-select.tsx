import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

export const CustomSelect = ({
  value,
  onValueChange,
  options,
  placeholder = "Sélectionner",
  className,
  icon,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Bouton trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border-2 border-[#D4AF37]/30 bg-white px-3 py-2 text-sm hover:border-[#D4AF37]/50 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[#002B45]">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[#D4AF37] transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Liste déroulante */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-[#D4AF37]/30 rounded-md shadow-lg overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm hover:bg-[#D4AF37]/10 transition-colors",
                  value === option.value && "bg-[#D4AF37]/20 font-medium"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};