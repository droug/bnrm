import { useState, useRef, useEffect } from "react";
import { ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import { format, addDays, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface InlineDatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  daysToShow?: number;
}

export function InlineDatePicker({
  value,
  onChange,
  placeholder = "Sélectionnez une date",
  className,
  id,
  daysToShow = 14,
}: InlineDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate available dates (next 14 days by default)
  const availableDates = Array.from({ length: daysToShow }, (_, i) => {
    return addDays(startOfDay(new Date()), i);
  });

  // Close dropdown when clicking outside
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

  const handleSelect = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  const formatDateForDisplay = (date: Date) => {
    return format(date, "EEEE d MMMM yyyy", { locale: fr });
  };

  const isSelected = (date: Date) => {
    if (!value) return false;
    return format(date, "yyyy-MM-dd") === format(value, "yyyy-MM-dd");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <span className={cn("flex items-center gap-2", !value && "text-muted-foreground")}>
          <CalendarIcon className="h-4 w-4" />
          {value ? formatDateForDisplay(value) : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-auto rounded-md border border-input bg-background shadow-lg">
          <div className="py-1">
            {availableDates.map((date, index) => {
              const dateKey = format(date, "yyyy-MM-dd");
              const isToday = index === 0;
              
              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => handleSelect(date)}
                  className={cn(
                    "w-full px-3 py-2.5 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                    "transition-colors",
                    isSelected(date) && "bg-accent font-semibold"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="capitalize">
                      {formatDateForDisplay(date)}
                    </span>
                    {isToday && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        Aujourd'hui
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
