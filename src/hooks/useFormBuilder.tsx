import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormFilter, FormStructure, CustomField, ConfigurableForm, FormSection } from "@/types/formBuilder";

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
      // Charger le formulaire depuis la table forms
      const { data: formData, error: formError } = await supabase
        .from("forms")
        .select("*")
        .eq("form_key", filter.formKey)
        .maybeSingle();

      if (formError) throw formError;
      if (!formData) {
        throw new Error("Formulaire introuvable");
      }
      setCurrentForm(formData as any);

      // Charger la version actuelle
      const { data: versionData, error: versionError } = await supabase
        .from("form_versions")
        .select("*")
        .eq("form_id", formData.id)
        .order("version_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (versionError) throw versionError;
      if (!versionData) {
        throw new Error("Aucune version trouvée pour ce formulaire");
      }
      setCurrentStructure(versionData as any);

      // Charger les champs personnalisés existants
      const { data: fieldsData, error: fieldsError } = await supabase
        .from("custom_fields")
        .select("*")
        .eq("form_version_id", versionData.id)
        .is("deleted_at", null)
        .order("section_key")
        .order("order_index");

      if (fieldsError) throw fieldsError;
      
      // Générer automatiquement les champs manquants depuis la structure
      const existingFields = (fieldsData as any) || [];
      const structure = versionData.structure as any;
      const sections = structure?.sections || [];
      
      // Pour chaque section, vérifier si elle a des champs de base à générer
      const generatedFields = await generateMissingFields(
        versionData.id,
        sections,
        existingFields,
        filter.formKey
      );
      
      setCustomFields([...existingFields, ...generatedFields]);

      toast.success("Formulaire chargé avec succès");
    } catch (error: any) {
      console.error("Error loading form:", error);
      toast.error("Erreur lors du chargement du formulaire");
    } finally {
      setLoading(false);
    }
  };

  const generateMissingFields = async (
    versionId: string,
    sections: FormSection[],
    existingFields: CustomField[],
    formKey: string
  ): Promise<CustomField[]> => {
    const generatedFields: CustomField[] = [];
    const baseFormFields = getBaseFormFields(formKey);
    
    for (const section of sections) {
      const sectionBaseFields = baseFormFields[section.key] || [];
      
      for (let i = 0; i < sectionBaseFields.length; i++) {
        const baseField = sectionBaseFields[i];
        const fieldExists = existingFields.some(
          (f) => f.field_key === baseField.field_key && f.section_key === section.key
        );
        
        if (!fieldExists) {
          try {
            const { data, error } = await supabase
              .from("custom_fields")
              .insert({
                form_version_id: versionId,
                field_key: baseField.field_key,
                field_type: baseField.field_type,
                section_key: section.key,
                order_index: i,
                label_fr: baseField.label_fr,
                label_ar: baseField.label_ar || "",
                description_fr: baseField.description_fr || "",
                is_required: baseField.is_required || false,
                is_visible: baseField.is_visible !== false,
                is_readonly: baseField.is_readonly || false,
              })
              .select()
              .single();
            
            if (!error && data) {
              generatedFields.push(data as any);
            }
          } catch (error) {
            console.error(`Error creating field ${baseField.field_key}:`, error);
          }
        }
      }
    }
    
    return generatedFields;
  };

  // Définir les champs de base pour chaque formulaire
  const getBaseFormFields = (formKey: string): Record<string, any[]> => {
    // Configuration des champs de base par formulaire
    const formFieldsConfig: Record<string, Record<string, any[]>> = {
      legal_deposit_monograph: {
        identification_auteur: [
          { field_key: "nom_auteur", field_type: "text", label_fr: "Nom de l'auteur", label_ar: "اسم المؤلف", is_required: true },
          { field_key: "prenom_auteur", field_type: "text", label_fr: "Prénom de l'auteur", label_ar: "اسم المؤلف الشخصي", is_required: true },
          { field_key: "nationalite_auteur", field_type: "text", label_fr: "Nationalité de l'auteur", label_ar: "جنسية المؤلف" },
          { field_key: "cin_auteur", field_type: "text", label_fr: "CIN de l'auteur", label_ar: "البطاقة الوطنية للمؤلف" },
        ],
        identification_publication: [
          { field_key: "titre_publication", field_type: "text", label_fr: "Titre de la publication", label_ar: "عنوان المنشور", is_required: true },
          { field_key: "sous_titre", field_type: "text", label_fr: "Sous-titre", label_ar: "العنوان الفرعي" },
          { field_key: "isbn", field_type: "text", label_fr: "ISBN", label_ar: "الرقم الدولي", description_fr: "Numéro ISBN du livre" },
          { field_key: "nombre_pages", field_type: "number", label_fr: "Nombre de pages", label_ar: "عدد الصفحات" },
          { field_key: "format", field_type: "select", label_fr: "Format", label_ar: "الشكل" },
          { field_key: "langue_publication", field_type: "select", label_fr: "Langue de publication", label_ar: "لغة النشر", is_required: true },
          { field_key: "date_publication", field_type: "date", label_fr: "Date de publication", label_ar: "تاريخ النشر", is_required: true },
        ],
        identification_editeur: [
          { field_key: "nom_editeur", field_type: "text", label_fr: "Nom de l'éditeur", label_ar: "اسم الناشر", is_required: true },
          { field_key: "adresse_editeur", field_type: "text", label_fr: "Adresse de l'éditeur", label_ar: "عنوان الناشر" },
          { field_key: "ville_editeur", field_type: "text", label_fr: "Ville de l'éditeur", label_ar: "مدينة الناشر" },
          { field_key: "telephone_editeur", field_type: "tel", label_fr: "Téléphone de l'éditeur", label_ar: "هاتف الناشر" },
          { field_key: "email_editeur", field_type: "email", label_fr: "Email de l'éditeur", label_ar: "البريد الإلكتروني للناشر" },
        ],
        identification_imprimeur: [
          { field_key: "nom_imprimeur", field_type: "text", label_fr: "Nom de l'imprimeur", label_ar: "اسم المطبعة" },
          { field_key: "adresse_imprimeur", field_type: "text", label_fr: "Adresse de l'imprimeur", label_ar: "عنوان المطبعة" },
          { field_key: "ville_imprimeur", field_type: "text", label_fr: "Ville de l'imprimeur", label_ar: "مدينة المطبعة" },
          { field_key: "tirage", field_type: "number", label_fr: "Tirage", label_ar: "عدد النسخ المطبوعة", description_fr: "Nombre d'exemplaires imprimés" },
        ],
        pieces_fournir: [
          { field_key: "exemplaires_depot", field_type: "number", label_fr: "Nombre d'exemplaires à déposer", label_ar: "عدد النسخ المودعة", is_required: true, description_fr: "Minimum 3 exemplaires requis" },
          { field_key: "cin_copie", field_type: "file", label_fr: "Copie CIN", label_ar: "نسخة من البطاقة الوطنية", is_required: true },
          { field_key: "bordereau_depot", field_type: "file", label_fr: "Bordereau de dépôt", label_ar: "وصل الإيداع" },
        ],
      },
      reproduction_request_form: {
        type_reproduction: [
          { field_key: "numerique_mail", field_type: "boolean", label_fr: "Copie numérique par email (PDF)", label_ar: "نسخة رقمية عبر البريد الإلكتروني", is_visible: true },
          { field_key: "numerique_espace", field_type: "boolean", label_fr: "Copie numérique (espace personnel)", label_ar: "نسخة رقمية (المساحة الشخصية)", is_visible: true },
          { field_key: "papier", field_type: "boolean", label_fr: "Tirage papier", label_ar: "طباعة ورقية", is_visible: true },
          { field_key: "microfilm", field_type: "boolean", label_fr: "Duplicata Microfilm", label_ar: "نسخة ميكروفيلم", is_visible: true },
          { field_key: "support_physique", field_type: "boolean", label_fr: "Reproduction sur support physique", label_ar: "استنساخ على دعم مادي", is_visible: true },
        ],
      },
      // On peut ajouter d'autres formulaires ici
    };
    
    return formFieldsConfig[formKey] || {};
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

  const updateSections = async (sections: FormSection[]) => {
    if (!currentStructure) {
      toast.error("Aucune structure de formulaire chargée");
      return;
    }

    try {
      const { error } = await supabase
        .from("form_versions")
        .update({
          structure: {
            sections: sections,
          } as any,
        })
        .eq("id", currentStructure.id);

      if (error) throw error;

      setCurrentStructure({
        ...currentStructure,
        structure: {
          sections: sections,
        },
      });

      toast.success("Sections mises à jour avec succès");
    } catch (error: any) {
      console.error("Error updating sections:", error);
      toast.error("Erreur lors de la mise à jour des sections");
      throw error;
    }
  };

  const generateCompleteForm = async (formKey: string) => {
    if (!currentForm || !currentStructure) {
      toast.error("Aucun formulaire chargé");
      return;
    }

    try {
      // 1. Générer et insérer les sections
      const sections = getFormSections(formKey);
      
      const { error: updateError } = await supabase
        .from("form_versions")
        .update({
          structure: {
            sections: sections,
          } as any,
        })
        .eq("id", currentStructure.id);

      if (updateError) throw updateError;

      // 2. Générer et insérer tous les champs
      const baseFormFields = getBaseFormFields(formKey);
      const allFields: CustomField[] = [];

      for (const section of sections) {
        const sectionFields = baseFormFields[section.key] || [];
        
        for (let i = 0; i < sectionFields.length; i++) {
          const baseField = sectionFields[i];
          
          const { data, error } = await supabase
            .from("custom_fields")
            .insert({
              form_version_id: currentStructure.id,
              field_key: baseField.field_key,
              field_type: baseField.field_type,
              section_key: section.key,
              order_index: i,
              label_fr: baseField.label_fr,
              label_ar: baseField.label_ar || "",
              description_fr: baseField.description_fr || "",
              is_required: baseField.is_required || false,
              is_visible: baseField.is_visible !== false,
              is_readonly: baseField.is_readonly || false,
            })
            .select()
            .single();
          
          if (!error && data) {
            allFields.push(data as any);
          }
        }
      }

      // 3. Mettre à jour l'état local
      setCurrentStructure({
        ...currentStructure,
        structure: {
          sections: sections,
        },
      });
      setCustomFields(allFields);

      toast.success(`${sections.length} sections et ${allFields.length} champs générés`);
    } catch (error: any) {
      console.error("Error generating complete form:", error);
      toast.error("Erreur lors de la génération du formulaire");
      throw error;
    }
  };

  const getFormSections = (formKey: string): FormSection[] => {
    const sectionsConfig: Record<string, FormSection[]> = {
      legal_deposit_monograph: [
        {
          key: "identification_auteur",
          label_fr: "Identification de l'auteur",
          label_ar: "تعريف المؤلف",
          order_index: 0,
          fields: [],
        },
        {
          key: "identification_publication",
          label_fr: "Identification de la publication",
          label_ar: "تعريف المنشور",
          order_index: 1,
          fields: [],
        },
        {
          key: "identification_editeur",
          label_fr: "Identification de l'Éditeur",
          label_ar: "تعريف الناشر",
          order_index: 2,
          fields: [],
        },
        {
          key: "identification_imprimeur",
          label_fr: "Identification de l'imprimeur",
          label_ar: "تعريف المطبعة",
          order_index: 3,
          fields: [],
        },
        {
          key: "pieces_fournir",
          label_fr: "Pièces à fournir",
          label_ar: "الوثائق المطلوبة",
          order_index: 4,
          fields: [],
        },
      ],
      reproduction_request_form: [
        {
          key: "type_reproduction",
          label_fr: "Type de reproduction",
          label_ar: "نوع الاستنساخ",
          order_index: 0,
          fields: [],
        },
      ],
    };

    return sectionsConfig[formKey] || [];
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
        .from("forms")
        .select("module")
        .order("module");

      if (error) throw error;
      
      const uniqueModules = [...new Set(data?.map(f => f.module).filter(Boolean) || [])];
      setAvailableModules(uniqueModules as string[]);
    } catch (error) {
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
        .from("forms")
        .select("*")
        .eq("module", module)
        .order("form_name");

      if (error) throw error;
      setAvailableForms(data as any || []);
    } catch (error) {
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
    updateSections,
    generateCompleteForm,
  };
}
