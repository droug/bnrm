import { ReactNode, useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";

interface BaseFieldProps {
  label: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  className?: string;
}

interface TextFieldProps extends BaseFieldProps {
  type?: "text" | "email" | "tel" | "number" | "url" | "date";
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

interface TextAreaFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

interface SelectFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
}

interface SwitchFieldProps extends BaseFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const FieldWrapper = ({ 
  label, 
  required, 
  helpText, 
  error, 
  className,
  children 
}: BaseFieldProps & { children: ReactNode }) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {helpText && !error && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
};

export const TextField = ({
  label,
  required,
  helpText,
  error,
  className,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  min,
  max,
  step
}: TextFieldProps) => {
  return (
    <FieldWrapper
      label={label}
      required={required}
      helpText={helpText}
      error={error}
      className={className}
    >
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={cn(
          "bg-background",
          error && "border-destructive focus-visible:ring-destructive"
        )}
      />
    </FieldWrapper>
  );
};

export const TextAreaField = ({
  label,
  required,
  helpText,
  error,
  className,
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled
}: TextAreaFieldProps) => {
  return (
    <FieldWrapper
      label={label}
      required={required}
      helpText={helpText}
      error={error}
      className={className}
    >
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={cn(
          "bg-background resize-none",
          error && "border-destructive focus-visible:ring-destructive"
        )}
      />
    </FieldWrapper>
  );
};

export const SelectField = ({
  label,
  required,
  helpText,
  error,
  className,
  value,
  onChange,
  options,
  placeholder,
  disabled
}: SelectFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <FieldWrapper
      label={label}
      required={required}
      helpText={helpText}
      error={error}
      className={className}
    >
      <div ref={containerRef} className="relative">
        {/* Bouton de sélection */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "w-full flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm",
            "hover:bg-accent/50 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            error && "border-destructive",
            disabled && "opacity-50 cursor-not-allowed",
            !selectedOption && "text-muted-foreground"
          )}
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "transform rotate-180"
          )} />
        </button>

        {/* Liste des options */}
        {isOpen && !disabled && (
          <div className="absolute top-full mt-1 w-full bg-background border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm text-left",
                  "hover:bg-accent transition-colors",
                  value === option.value && "bg-accent/50 font-medium"
                )}
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <Check className="h-4 w-4" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </FieldWrapper>
  );
};

export const SwitchField = ({
  label,
  required,
  helpText,
  error,
  className,
  checked,
  onChange,
  disabled
}: SwitchFieldProps) => {
  return (
    <div className={cn("flex items-center justify-between space-x-4 rounded-lg border p-4", className)}>
      <div className="flex-1 space-y-1">
        <Label className="text-sm font-medium text-foreground cursor-pointer">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {helpText && !error && (
          <p className="text-xs text-muted-foreground">{helpText}</p>
        )}
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
};
