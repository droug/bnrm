import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ReproductionTypeOption {
  value: string;
  label: string;
  label_ar: string;
  enabled: boolean;
}

interface ReproductionFormConfig {
  reproductionTypes: ReproductionTypeOption[];
  loading: boolean;
}

const DEFAULT_REPRODUCTION_TYPES: ReproductionTypeOption[] = [
  { value: "numerique_mail", label: "Copie numérique par email (PDF)", label_ar: "نسخة رقمية عبر البريد الإلكتروني", enabled: true },
  { value: "numerique_espace", label: "Copie numérique (espace personnel)", label_ar: "نسخة رقمية (المساحة الشخصية)", enabled: true },
  { value: "papier", label: "Tirage papier", label_ar: "طباعة ورقية", enabled: true },
  { value: "microfilm", label: "Duplicata Microfilm", label_ar: "نسخة ميكروفيلم", enabled: true },
  { value: "support_physique", label: "Reproduction sur support physique", label_ar: "استنساخ على دعم مادي", enabled: true },
];

export function useReproductionFormConfig(): ReproductionFormConfig {
  const [reproductionTypes, setReproductionTypes] = useState<ReproductionTypeOption[]>(DEFAULT_REPRODUCTION_TYPES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);

      // Chercher le formulaire de configuration
      const { data: formData, error: formError } = await supabase
        .from("forms")
        .select("id")
        .eq("form_key", "reproduction_request_form")
        .maybeSingle();

      if (formError || !formData) {
        console.log("Formulaire de configuration non trouvé, utilisation des valeurs par défaut");
        setLoading(false);
        return;
      }

      // Charger la version publiée
      const { data: versionData, error: versionError } = await supabase
        .from("form_versions")
        .select("id")
        .eq("form_id", formData.id)
        .eq("is_published", true)
        .order("version_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (versionError || !versionData) {
        console.log("Aucune version publiée trouvée, utilisation des valeurs par défaut");
        setLoading(false);
        return;
      }

      // Charger les champs personnalisés
      const { data: fieldsData, error: fieldsError } = await supabase
        .from("custom_fields")
        .select("*")
        .eq("form_version_id", versionData.id)
        .eq("section_key", "type_reproduction")
        .is("deleted_at", null)
        .order("order_index");

      if (fieldsError || !fieldsData || fieldsData.length === 0) {
        console.log("Aucun champ trouvé, utilisation des valeurs par défaut");
        setLoading(false);
        return;
      }

      // Mapper les champs aux options
      const configuredTypes = fieldsData.map((field: any) => ({
        value: field.field_key,
        label: field.label_fr,
        label_ar: field.label_ar || field.label_fr,
        enabled: field.is_visible === true,
      }));

      setReproductionTypes(configuredTypes);
    } catch (error) {
      console.error("Erreur lors du chargement de la configuration:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    reproductionTypes,
    loading,
  };
}
