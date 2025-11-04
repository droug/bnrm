import { Control } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { InlineSelect } from "@/components/ui/inline-select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CustomField } from "@/types/formBuilder";

interface DynamicFieldProps {
  field: CustomField;
  control: Control<any>;
  language: "fr" | "ar";
}

export function DynamicField({ field, control, language }: DynamicFieldProps) {
  const label = language === "fr" ? field.label_fr : (field.label_ar || field.label_fr);
  const description = language === "fr" ? field.description_fr : (field.description_ar || field.description_fr);

  // Si le champ n'est pas visible, ne rien afficher
  if (!field.is_visible) {
    return null;
  }

  const renderField = (fieldProps: any) => {
    const { field: formField } = fieldProps;

    switch (field.field_type) {
      case "text":
        return (
          <Input
            {...formField}
            placeholder={label}
            disabled={field.is_readonly}
            dir={language === "ar" ? "rtl" : "ltr"}
          />
        );

      case "textarea":
        return (
          <Textarea
            {...formField}
            placeholder={label}
            disabled={field.is_readonly}
            dir={language === "ar" ? "rtl" : "ltr"}
            rows={4}
          />
        );

      case "number":
        return (
          <Input
            {...formField}
            type="number"
            placeholder={label}
            disabled={field.is_readonly}
            onChange={(e) => formField.onChange(e.target.valueAsNumber)}
          />
        );

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={field.is_readonly}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formField.value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formField.value ? format(formField.value, "PPP") : <span>{label}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formField.value}
                onSelect={formField.onChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={formField.value}
              onCheckedChange={formField.onChange}
              disabled={field.is_readonly}
            />
            <span className="text-sm">{formField.value ? "Oui" : "Non"}</span>
          </div>
        );

      case "select":
        // Les options doivent être dans field.config.options
        const options = field.config?.options || [];
        return (
          <InlineSelect
            value={formField.value}
            onChange={formField.onChange}
            options={options}
            placeholder={`Sélectionner ${label.toLowerCase()}`}
            disabled={field.is_readonly}
          />
        );

      case "multiselect":
        // Pour les multi-sélections, on peut utiliser des checkboxes
        const multiselectOptions = field.config?.options || [];
        return (
          <div className="space-y-2">
            {multiselectOptions.map((option: any) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  checked={formField.value?.includes(option.value)}
                  onCheckedChange={(checked) => {
                    const current = formField.value || [];
                    if (checked) {
                      formField.onChange([...current, option.value]);
                    } else {
                      formField.onChange(current.filter((v: string) => v !== option.value));
                    }
                  }}
                  disabled={field.is_readonly}
                />
                <label className="text-sm">{option.label}</label>
              </div>
            ))}
          </div>
        );

      case "file":
        return (
          <Input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                formField.onChange(file);
              }
            }}
            disabled={field.is_readonly}
          />
        );

      case "link":
        return (
          <Input
            {...formField}
            type="url"
            placeholder="https://..."
            disabled={field.is_readonly}
          />
        );

      default:
        return (
          <Input
            {...formField}
            placeholder={label}
            disabled={field.is_readonly}
          />
        );
    }
  };

  return (
    <FormField
      control={control}
      name={field.field_key}
      rules={{
        required: field.is_required ? `${label} est obligatoire` : false,
        validate: field.validation_rules ? (value) => {
          // Appliquer les règles de validation custom
          if (field.validation_rules?.min && value < field.validation_rules.min) {
            return `La valeur doit être supérieure ou égale à ${field.validation_rules.min}`;
          }
          if (field.validation_rules?.max && value > field.validation_rules.max) {
            return `La valeur doit être inférieure ou égale à ${field.validation_rules.max}`;
          }
          if (field.validation_rules?.pattern && !new RegExp(field.validation_rules.pattern).test(value)) {
            return field.validation_rules.message || "Format invalide";
          }
          return true;
        } : undefined,
      }}
      defaultValue={field.default_value || ""}
      render={(fieldProps) => (
        <FormItem className="space-y-2">
          <FormLabel className="flex items-center gap-1">
            {label}
            {field.is_required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            {renderField(fieldProps)}
          </FormControl>
          {description && (
            <FormDescription dir={language === "ar" ? "rtl" : "ltr"}>
              {description}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
