import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormFilter, FormStructure, CustomField, ConfigurableForm } from "@/types/formBuilder";

export function useFormBuilder() {
  const [loading, setLoading] = useState(false);
  const [currentForm, setCurrentForm] = useState<ConfigurableForm | null>(null);
  const [currentStructure, setCurrentStructure] = useState<FormStructure | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [availableModules, setAvailableModules] = useState<string[]>([]);
  const [availableForms, setAvailableForms] = useState<ConfigurableForm[]>([]);

  const loadFormStructure = async (filter: FormFilter) => {
    setLoading(true);
    try {
      // Charger le formulaire
      const { data: formData, error: formError } = await supabase
        .from("configurable_forms")
        .select("*")
        .eq("platform", filter.platform)
        .eq("module", filter.module)
        .eq("form_key", filter.formKey)
        .single();

      if (formError) throw formError;
      setCurrentForm(formData);

      // Charger la version actuelle
      const { data: versionData, error: versionError } = await supabase
        .from("form_versions")
        .select("*")
        .eq("form_id", formData.id)
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

      if (versionError) throw versionError;
      setCurrentStructure(versionData as any);

      // Charger les champs personnalisés
      const { data: fieldsData, error: fieldsError } = await supabase
        .from("custom_fields")
        .select("*")
        .eq("form_version_id", versionData.id)
        .is("deleted_at", null)
        .order("section_key")
        .order("order_index");

      if (fieldsError) throw fieldsError;
      setCustomFields((fieldsData as any) || []);

      toast.success("Formulaire chargé avec succès");
    } catch (error: any) {
      console.error("Error loading form:", error);
      toast.error("Erreur lors du chargement du formulaire");
    } finally {
      setLoading(false);
    }
  };

  const createField = async (fieldData: Partial<CustomField>) => {
    if (!currentStructure) {
      toast.error("Aucun formulaire sélectionné");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("custom_fields")
        .insert({
          form_version_id: currentStructure.id,
          ...fieldData,
        } as any)
        .select()
        .single();

      if (error) throw error;

      setCustomFields([...customFields, data as any]);
      
      // Log audit
      await supabase.from("form_audit_log").insert({
        form_id: currentForm!.id,
        action: "create",
        entity_type: "field",
        entity_id: data.id,
        diff: { new: data },
      });

      toast.success("Champ créé avec succès");
      return data;
    } catch (error: any) {
      console.error("Error creating field:", error);
      toast.error("Erreur lors de la création du champ");
      throw error;
    }
  };

  const updateField = async (fieldId: string, updates: Partial<CustomField>) => {
    try {
      const { data, error } = await supabase
        .from("custom_fields")
        .update(updates)
        .eq("id", fieldId)
        .select()
        .single();

      if (error) throw error;

      setCustomFields(
        customFields.map((f) => (f.id === fieldId ? (data as any) : f))
      );

      // Log audit
      await supabase.from("form_audit_log").insert({
        form_id: currentForm!.id,
        action: "update",
        entity_type: "field",
        entity_id: fieldId,
        diff: { updates },
      });

      toast.success("Champ mis à jour");
      return data;
    } catch (error: any) {
      console.error("Error updating field:", error);
      toast.error("Erreur lors de la mise à jour du champ");
      throw error;
    }
  };

  const deleteField = async (fieldId: string) => {
    try {
      const { error } = await supabase
        .from("custom_fields")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", fieldId);

      if (error) throw error;

      setCustomFields(customFields.filter((f) => f.id !== fieldId));

      // Log audit
      await supabase.from("form_audit_log").insert({
        form_id: currentForm!.id,
        action: "delete",
        entity_type: "field",
        entity_id: fieldId,
      });

      toast.success("Champ supprimé");
    } catch (error: any) {
      console.error("Error deleting field:", error);
      toast.error("Erreur lors de la suppression du champ");
      throw error;
    }
  };

  const publishVersion = async () => {
    if (!currentForm || !currentStructure) {
      toast.error("Aucun formulaire sélectionné");
      return;
    }

    try {
      // Marquer la version comme publiée
      const { error } = await supabase
        .from("form_versions")
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
        })
        .eq("id", currentStructure.id);

      if (error) throw error;

      // Log audit
      await supabase.from("form_audit_log").insert({
        form_id: currentForm.id,
        action: "publish",
        entity_type: "version",
        entity_id: currentStructure.id,
      });

      toast.success("Version publiée avec succès");
      
      // Recharger
      await loadFormStructure({
        platform: currentForm.platform,
        module: currentForm.module,
        formKey: currentForm.form_key,
        language: "fr",
      });
    } catch (error: any) {
      console.error("Error publishing version:", error);
      toast.error("Erreur lors de la publication");
      throw error;
    }
  };

  const reorderFields = async (sectionKey: string, fieldIds: string[]) => {
    try {
      const updates = fieldIds.map((fieldId, index) => ({
        id: fieldId,
        order_index: index,
      }));

      for (const update of updates) {
        await supabase
          .from("custom_fields")
          .update({ order_index: update.order_index })
          .eq("id", update.id);
      }

      setCustomFields(
        customFields.map((f) => {
          const update = updates.find((u) => u.id === f.id);
          return update ? { ...f, order_index: update.order_index } : f;
        })
      );

      toast.success("Ordre mis à jour");
    } catch (error: any) {
      console.error("Error reordering fields:", error);
      toast.error("Erreur lors du réordonnancement");
      throw error;
    }
  };

  const loadModulesByPlatform = async (platform: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_modules_by_platform', { p_platform: platform });

      if (error) throw error;
      // Filter out any empty strings
      setAvailableModules(data?.map((m: any) => m.module).filter((m: string) => m && m.trim()) || []);
    } catch (error: any) {
      console.error("Error loading modules:", error);
      toast.error("Erreur lors du chargement des modules");
    } finally {
      setLoading(false);
    }
  };

  const loadFormsByPlatformAndModule = async (platform: string, module: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_forms_by_platform', { p_platform: platform });

      if (error) throw error;
      
      // Filter out any forms with empty form_key
      const filteredForms = data?.filter((f: any) => 
        f.module === module && f.form_key && f.form_key.trim()
      ) || [];
      setAvailableForms(filteredForms as any);
    } catch (error: any) {
      console.error("Error loading forms:", error);
      toast.error("Erreur lors du chargement des formulaires");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    currentForm,
    currentStructure,
    customFields,
    availableModules,
    availableForms,
    loadFormStructure,
    loadModulesByPlatform,
    loadFormsByPlatformAndModule,
    createField,
    updateField,
    deleteField,
    publishVersion,
    reorderFields,
  };
}
