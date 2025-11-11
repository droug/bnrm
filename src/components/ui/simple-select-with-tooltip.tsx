import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Info } from 'lucide-react';

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
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoveredOption(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setHoveredOption(null);
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
        <div className="absolute w-full mt-1 bg-background border border-input rounded-md shadow-lg z-[100]">
          <div className="max-h-80 overflow-auto">
            {options.map((option) => (
              <div key={option.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setHoveredOption(option.value)}
                  onMouseLeave={() => setHoveredOption(null)}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between ${
                    value === option.value ? 'bg-accent text-accent-foreground' : ''
                  }`}
                >
                  <span>{option.label}</span>
                  {option.tooltip && (
                    <Info className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 ml-2" />
                  )}
                </button>
                
                {/* Tooltip affiché directement sous l'option au survol */}
                {option.tooltip && hoveredOption === option.value && (
                  <div className="px-3 py-2 bg-muted/50 border-t border-border">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {option.tooltip}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
