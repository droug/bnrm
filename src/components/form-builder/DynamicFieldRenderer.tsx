import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { InlineSelect } from "@/components/ui/inline-select";
import { GenericAutocomplete } from "@/components/ui/generic-autocomplete";
import { NationalityAutocomplete } from "@/components/ui/nationality-autocomplete";
import { PhoneInput } from "@/components/ui/phone-input";
import { CustomField } from "@/types/formBuilder";

interface DynamicFieldRendererProps {
  field: CustomField;
  language: string;
  value?: any;
  onChange: (value: any) => void;
  // Props additionnelles pour le champ nationalité
  gender?: 'homme' | 'femme' | '';
  otherNationalityValue?: string;
  onOtherNationalityChange?: (value: string) => void;
}

export function DynamicFieldRenderer({ 
  field, 
  language, 
  value, 
  onChange,
  gender = '',
  otherNationalityValue = '',
  onOtherNationalityChange
}: DynamicFieldRendererProps) {
  const label = language === "ar" ? field.label_ar || field.label_fr : field.label_fr;
  const description = language === "ar" ? field.description_ar : field.description_fr;

  // Détecter si c'est un champ téléphone par field_key ou label
  const isPhoneField = field.field_type === "tel" || 
                       field.field_key?.toLowerCase().includes('phone') ||
                       field.field_key?.toLowerCase().includes('telephone') ||
                       field.label_fr?.toLowerCase().includes('téléphone') ||
                       field.label_fr?.toLowerCase().includes('telephone');

  const renderField = () => {
    // Si c'est un champ téléphone, utiliser PhoneInput
    if (isPhoneField) {
      return (
        <PhoneInput
          value={value || ""}
          onChange={onChange}
          placeholder={label}
          defaultCountry="MA"
        />
      );
    }

    switch (field.field_type) {
      case "text":
      case "email":
      case "url":
        return (
          <Input
            type={field.field_type}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={label}
            required={field.is_required}
            disabled={field.is_readonly}
          />
        );

      case "tel":
        return (
          <PhoneInput
            value={value || ""}
            onChange={onChange}
            placeholder={label}
            defaultCountry="MA"
          />
        );

      case "textarea":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={label}
            required={field.is_required}
            disabled={field.is_readonly}
            rows={4}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={label}
            required={field.is_required}
            disabled={field.is_readonly}
          />
        );

      case "date":
        return (
          <Input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.is_required}
            disabled={field.is_readonly}
          />
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value || false}
              onCheckedChange={onChange}
              disabled={field.is_readonly}
            />
            <label className="text-sm">{label}</label>
          </div>
        );

      case "select":
        // Les options doivent être définies dans field.config.options
        const options = (field.config?.options as any)?.map((opt: string) => ({
          value: opt,
          label: opt,
        })) || [];
        
        return (
          <InlineSelect
            value={value || ""}
            onChange={onChange}
            placeholder={`Sélectionner ${label.toLowerCase()}`}
            options={options}
            disabled={field.is_readonly}
          />
        );

      case "autocomplete":
        // Cas spécial pour la nationalité - utiliser le composant dédié
        const listCode = field.config?.list_code as string;
        if (field.field_key === "author_nationality" || listCode === "nationalities") {
          return (
            <NationalityAutocomplete
              value={value || ''}
              onChange={onChange}
              placeholder={`Sélectionner ${label.toLowerCase()}`}
              gender={gender}
              otherValue={otherNationalityValue}
              onOtherValueChange={onOtherNationalityChange}
            />
          );
        }
        
        // Autocomplete générique avec chargement depuis la base de données
        if (!listCode) {
          return <div className="text-sm text-destructive">Configuration manquante: list_code requis</div>;
        }
        return (
          <GenericAutocomplete
            listCode={listCode}
            value={value || ''}
            onChange={onChange}
            placeholder={`Rechercher ${label.toLowerCase()}`}
          />
        );

      case "file":
        return (
          <Input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChange(file);
            }}
            required={field.is_required}
            disabled={field.is_readonly}
          />
        );

      default:
        return (
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={label}
            required={field.is_required}
            disabled={field.is_readonly}
          />
        );
    }
  };

  if (!field.is_visible) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {field.is_required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {renderField()}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}