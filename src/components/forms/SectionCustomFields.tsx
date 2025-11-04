import { UseFormReturn } from "react-hook-form";
import { useSectionCustomFields } from "@/hooks/useSectionCustomFields";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface SectionCustomFieldsProps {
  formKey: string;
  sectionKey: string;
  form: UseFormReturn<any>;
  language?: string;
}

export function SectionCustomFields({
  formKey,
  sectionKey,
  form,
  language = "fr"
}: SectionCustomFieldsProps) {
  const { data: fields, isLoading } = useSectionCustomFields(formKey, sectionKey);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!fields || fields.length === 0) {
    return null;
  }

  const getLabel = (field: any) => {
    return language === "ar" && field.label_ar ? field.label_ar : field.label_fr;
  };

  const getDescription = (field: any) => {
    return language === "ar" && field.description_ar ? field.description_ar : field.description_fr;
  };

  const getPlaceholder = (field: any) => {
    return language === "ar" && field.placeholder_ar ? field.placeholder_ar : field.placeholder_fr;
  };

  const renderField = (field: any) => {
    const fieldName = `custom_${field.field_key}`;
    
    switch (field.field_type) {
      case "text":
      case "email":
      case "tel":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={fieldName}>
              {getLabel(field)}
              {field.is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {getDescription(field) && (
              <p className="text-sm text-muted-foreground">{getDescription(field)}</p>
            )}
            <Input
              id={fieldName}
              type={field.field_type}
              placeholder={getPlaceholder(field)}
              disabled={field.is_readonly}
              {...form.register(fieldName, {
                required: field.is_required ? "Ce champ est requis" : false,
              })}
            />
            {form.formState.errors[fieldName] && (
              <p className="text-sm text-destructive">
                {form.formState.errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={fieldName}>
              {getLabel(field)}
              {field.is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {getDescription(field) && (
              <p className="text-sm text-muted-foreground">{getDescription(field)}</p>
            )}
            <Textarea
              id={fieldName}
              placeholder={getPlaceholder(field)}
              disabled={field.is_readonly}
              {...form.register(fieldName, {
                required: field.is_required ? "Ce champ est requis" : false,
              })}
            />
            {form.formState.errors[fieldName] && (
              <p className="text-sm text-destructive">
                {form.formState.errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );

      case "number":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={fieldName}>
              {getLabel(field)}
              {field.is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {getDescription(field) && (
              <p className="text-sm text-muted-foreground">{getDescription(field)}</p>
            )}
            <Input
              id={fieldName}
              type="number"
              placeholder={getPlaceholder(field)}
              disabled={field.is_readonly}
              {...form.register(fieldName, {
                required: field.is_required ? "Ce champ est requis" : false,
                valueAsNumber: true,
              })}
            />
            {form.formState.errors[fieldName] && (
              <p className="text-sm text-destructive">
                {form.formState.errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );

      case "select":
        const options = field.config?.options || [];
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={fieldName}>
              {getLabel(field)}
              {field.is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {getDescription(field) && (
              <p className="text-sm text-muted-foreground">{getDescription(field)}</p>
            )}
            <Select
              onValueChange={(value) => form.setValue(fieldName, value)}
              defaultValue={form.getValues(fieldName)}
              disabled={field.is_readonly}
            >
              <SelectTrigger>
                <SelectValue placeholder={getPlaceholder(field)} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors[fieldName] && (
              <p className="text-sm text-destructive">
                {form.formState.errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );

      case "checkbox":
      case "boolean":
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              id={fieldName}
              disabled={field.is_readonly}
              checked={form.watch(fieldName)}
              onCheckedChange={(checked) => form.setValue(fieldName, checked)}
            />
            <Label htmlFor={fieldName} className="cursor-pointer">
              {getLabel(field)}
              {field.is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {getDescription(field) && (
              <p className="text-sm text-muted-foreground">{getDescription(field)}</p>
            )}
          </div>
        );

      case "date":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={fieldName}>
              {getLabel(field)}
              {field.is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {getDescription(field) && (
              <p className="text-sm text-muted-foreground">{getDescription(field)}</p>
            )}
            <Input
              id={fieldName}
              type="date"
              disabled={field.is_readonly}
              {...form.register(fieldName, {
                required: field.is_required ? "Ce champ est requis" : false,
              })}
            />
            {form.formState.errors[fieldName] && (
              <p className="text-sm text-destructive">
                {form.formState.errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 mt-4 pt-4 border-t border-border">
      <p className="text-sm font-medium text-muted-foreground">Champs personnalisés</p>
      {fields.map((field) => renderField(field))}
    </div>
  );
}
