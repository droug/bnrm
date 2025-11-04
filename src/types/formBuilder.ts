export interface FormFilter {
  platform: string;
  module: string;
  formKey: string;
  version?: number;
  language: "fr" | "ar";
}

export interface FormSection {
  key: string;
  label_fr: string;
  label_ar?: string;
  order_index: number;
  fields: CustomField[];
}

export interface CustomField {
  id: string;
  field_key: string;
  field_type: string;
  section_key: string;
  order_index: number;
  insert_after?: string;
  label_fr: string;
  label_ar?: string;
  description_fr?: string;
  description_ar?: string;
  is_required: boolean;
  is_visible: boolean;
  is_readonly: boolean;
  default_value?: string;
  validation_rules?: Record<string, any>;
  visibility_conditions?: any[];
  config?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface FormStructure {
  id: string;
  form_id: string;
  version_number: number;
  structure: {
    sections: FormSection[];
  };
  is_published: boolean;
  published_at?: string;
  created_at: string;
}

export interface ConfigurableForm {
  id: string;
  platform: string;
  module: string;
  form_name: string;
  form_key: string;
  current_version: number;
  created_at: string;
  updated_at: string;
}

export interface FieldTypeOption {
  type: string;
  icon: string;
  label_fr: string;
  label_ar: string;
}

export const FIELD_TYPES: FieldTypeOption[] = [
  { type: "text", icon: "T", label_fr: "Texte sur seule ligne", label_ar: "نص في سطر واحد" },
  { type: "textarea", icon: "T", label_fr: "Texte multiligne", label_ar: "نص متعدد الأسطر" },
  { type: "select", icon: "≡", label_fr: "Liste système", label_ar: "قائمة النظام" },
  { type: "multiselect", icon: "≡", label_fr: "Multiple sélection", label_ar: "اختيار متعدد" },
  { type: "date", icon: "📅", label_fr: "Date", label_ar: "تاريخ" },
  { type: "number", icon: "#", label_fr: "Nombre", label_ar: "رقم" },
  { type: "boolean", icon: "⚪", label_fr: "Oui/Non", label_ar: "نعم/لا" },
  { type: "link", icon: "🔗", label_fr: "Lien", label_ar: "رابط" },
  { type: "location", icon: "🌍", label_fr: "Emplacement", label_ar: "الموقع" },
  { type: "coordinates", icon: "📍", label_fr: "Latitude/Longitude", label_ar: "خط الطول/العرض" },
  { type: "reference", icon: "🔍", label_fr: "Référence", label_ar: "مرجع" },
  { type: "file", icon: "📎", label_fr: "Pièce jointe", label_ar: "ملف مرفق" },
  { type: "group", icon: "📁", label_fr: "Groupe", label_ar: "مجموعة" },
];
