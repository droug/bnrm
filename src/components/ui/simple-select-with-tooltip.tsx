import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OptionWithTooltip {
  value: string;
  label: string;
  tooltip?: string;
}

interface SimpleSelectWithTooltipProps {
  options: OptionWithTooltip[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SimpleSelectWithTooltip({ 
  options, 
  value, 
  onChange, 
  placeholder = "Sélectionner" 
}: SimpleSelectWithTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md flex items-center justify-between hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <span className={selectedOption ? "text-foreground" : "text-muted-foreground"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute w-full mt-1 bg-background border border-input rounded-md shadow-lg z-50 max-h-60 overflow-auto">
          <TooltipProvider delayDuration={300}>
            {options.map((option) => (
              <div key={option.value} className="relative group">
                {option.tooltip ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between ${
                          value === option.value ? 'bg-accent text-accent-foreground' : ''
                        }`}
                      >
                        <span>{option.label}</span>
                        <Info className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs bg-popover text-popover-foreground border border-border">
                      <p className="text-sm">{option.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors ${
                      value === option.value ? 'bg-accent text-accent-foreground' : ''
                    }`}
                  >
                    {option.label}
                  </button>
                )}
              </div>
            ))}
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}
