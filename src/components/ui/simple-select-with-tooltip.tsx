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
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

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

  const handleMouseEnter = (optionValue: string) => {
    const buttonEl = buttonRefs.current[optionValue];
    if (buttonEl) {
      const rect = buttonEl.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top,
        left: rect.right + 8
      });
    }
    setHoveredOption(optionValue);
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
        <div className="absolute w-full mt-1 bg-background border border-input rounded-md shadow-lg z-[100] max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              ref={(el) => (buttonRefs.current[option.value] = el)}
              type="button"
              onClick={() => handleSelect(option.value)}
              onMouseEnter={() => handleMouseEnter(option.value)}
              onMouseLeave={() => setHoveredOption(null)}
              className={`w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between ${
                value === option.value ? 'bg-accent text-accent-foreground' : ''
              }`}
            >
              <span>{option.label}</span>
              {option.tooltip && (
                <Info className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Tooltip Portal - rendered outside dropdown */}
      {hoveredOption && options.find(opt => opt.value === hoveredOption)?.tooltip && (
        <div
          className="fixed w-80 p-3 bg-popover text-popover-foreground border border-border rounded-md shadow-xl z-[200] pointer-events-none"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          <p className="text-sm leading-relaxed">
            {options.find(opt => opt.value === hoveredOption)?.tooltip}
          </p>
        </div>
      )}
    </div>
  );
}
