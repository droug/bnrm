import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SectionCustomField {
  id: string;
  section_id: string;
  field_key: string;
  field_type: string;
  label_fr: string;
  label_ar: string;
  description_fr: string;
  description_ar: string;
  placeholder_fr: string;
  placeholder_ar: string;
  is_required: boolean;
  is_visible: boolean;
  is_readonly: boolean;
  order_index: number;
  config: any;
  validation_rules: any;
  default_value: string;
}

export function useSectionCustomFields(formKey: string, sectionKey: string) {
  return useQuery({
    queryKey: ["section-custom-fields", formKey, sectionKey],
    queryFn: async () => {
      // Récupérer la section
      const { data: section, error: sectionError } = await supabase
        .from("form_sections")
        .select("id")
        .eq("form_key", formKey)
        .eq("section_key", sectionKey)
        .eq("is_active", true)
        .single();

      if (sectionError) throw sectionError;
      if (!section) return [];

      // Récupérer les champs personnalisés de cette section
      const { data: fields, error: fieldsError } = await supabase
        .from("section_custom_fields")
        .select("*")
        .eq("section_id", section.id)
        .eq("is_visible", true)
        .order("order_index", { ascending: true });

      if (fieldsError) throw fieldsError;
      return (fields || []) as SectionCustomField[];
    },
    enabled: !!formKey && !!sectionKey,
  });
}
