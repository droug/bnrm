import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

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
  return (
    <FieldWrapper
      label={label}
      required={required}
      helpText={helpText}
      error={error}
      className={className}
    >
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger 
          className={cn(
            "bg-background",
            error && "border-destructive"
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-background">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
