import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CustomField, FormSection } from "@/types/formBuilder";

interface UseDynamicFormOptions {
  formKey: string;
  enabled?: boolean;
}

export function useDynamicForm({ formKey, enabled = true }: UseDynamicFormOptions) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [sections, setSections] = useState<FormSection[]>([]);
  const [fields, setFields] = useState<CustomField[]>([]);

  useEffect(() => {
    if (enabled && formKey) {
      loadForm();
    }
  }, [formKey, enabled]);

  const loadForm = async () => {
    try {
      setLoading(true);

      // Charger le formulaire
      const formsResponse = await (supabase as any)
        .from("forms")
        .select("*")
        .eq("form_key", formKey)
        .maybeSingle();

      if (formsResponse.error) throw formsResponse.error;
      if (!formsResponse.data) return;
      setForm(formsResponse.data);

      // Charger la dernière version (publiée ou non)
      const versionsResponse = await (supabase as any)
        .from("form_versions")
        .select("*")
        .eq("form_id", formsResponse.data.id)
        .order("version_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (versionsResponse.error) throw versionsResponse.error;
      if (!versionsResponse.data) return;

      // Extraire les sections
      const structure = versionsResponse.data.structure as any;
      setSections(structure?.sections || []);

      // Charger les champs
      const fieldsResponse = await (supabase as any)
        .from("custom_fields")
        .select("*")
        .eq("form_version_id", versionsResponse.data.id)
        .is("deleted_at", null)
        .order("order_index");

      if (fieldsResponse.error) throw fieldsResponse.error;
      setFields(fieldsResponse.data || []);

    } catch (error) {
      console.error("Erreur lors du chargement du formulaire:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    form,
    sections,
    fields,
    reload: loadForm,
  };
}
