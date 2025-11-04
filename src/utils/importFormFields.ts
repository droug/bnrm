import { supabase } from "@/integrations/supabase/client";

// Définition des champs pour le formulaire "Dépôt légal - Monographies"
export const legalDepositMonographFields = [
  // Section: Identification de l'auteur
  {
    section_key: "author_identification",
    fields: [
      {
        field_key: "author_type",
        field_type: "select",
        label_fr: "Type de l'auteur",
        label_ar: "نوع المؤلف",
        is_required: true,
        order_index: 0,
        config: {
          options: [
            { value: "physical", label: "Personne physique" },
            { value: "moral", label: "Personne morale" }
          ]
        }
      },
      {
        field_key: "author_name",
        field_type: "text",
        label_fr: "Nom de l'auteur",
        label_ar: "اسم المؤلف",
        description_fr: "Nom complet de l'auteur",
        is_required: true,
        order_index: 1
      },
      {
        field_key: "author_pseudonym",
        field_type: "text",
        label_fr: "Pseudonyme",
        label_ar: "الاسم المستعار",
        description_fr: "À renseigner uniquement si l'auteur publie sous un autre nom",
        is_required: false,
        order_index: 2
      },
      {
        field_key: "author_phone",
        field_type: "text",
        label_fr: "Téléphone",
        label_ar: "الهاتف",
        is_required: false,
        order_index: 3
      },
      {
        field_key: "author_email",
        field_type: "text",
        label_fr: "Email",
        label_ar: "البريد الإلكتروني",
        is_required: false,
        order_index: 4
      },
      {
        field_key: "author_region",
        field_type: "select",
        label_fr: "Région",
        label_ar: "المنطقة",
        is_required: false,
        order_index: 5,
        config: { options: [] } // À remplir avec les régions
      },
      {
        field_key: "author_city",
        field_type: "select",
        label_fr: "Ville",
        label_ar: "المدينة",
        is_required: false,
        order_index: 6,
        config: { options: [] } // À remplir avec les villes
      }
    ]
  },
  
  // Section: Identification de la publication
  {
    section_key: "publication_identification",
    fields: [
      {
        field_key: "publication_discipline",
        field_type: "select",
        label_fr: "Discipline de l'ouvrage",
        label_ar: "تخصص العمل",
        is_required: true,
        order_index: 0,
        config: { options: [] } // À remplir avec les disciplines
      },
      {
        field_key: "publication_title",
        field_type: "text",
        label_fr: "Titre de l'ouvrage",
        label_ar: "عنوان العمل",
        is_required: true,
        order_index: 1
      },
      {
        field_key: "publication_type",
        field_type: "select",
        label_fr: "Type de publication",
        label_ar: "نوع النشر",
        is_required: true,
        order_index: 2,
        config: {
          options: [
            { value: "THE", label: "Thèse" },
            { value: "COR", label: "Cours" },
            { value: "MAN", label: "Manuel" },
            { value: "ROM", label: "Roman" }
          ]
        }
      },
      {
        field_key: "publication_support",
        field_type: "select",
        label_fr: "Type de support",
        label_ar: "نوع الدعم",
        is_required: true,
        order_index: 3,
        config: {
          options: [
            { value: "physical", label: "Physique (papier)" },
            { value: "digital", label: "Numérique" },
            { value: "both", label: "Les deux" }
          ]
        }
      },
      {
        field_key: "publication_language",
        field_type: "multiselect",
        label_fr: "Langue(s) de publication",
        label_ar: "لغة (لغات) النشر",
        is_required: true,
        order_index: 4,
        config: { options: [] } // À remplir avec les langues
      },
      {
        field_key: "publication_pages",
        field_type: "number",
        label_fr: "Nombre de pages",
        label_ar: "عدد الصفحات",
        is_required: false,
        order_index: 5
      },
      {
        field_key: "publication_dimensions",
        field_type: "text",
        label_fr: "Dimensions (cm)",
        label_ar: "الأبعاد (سم)",
        description_fr: "Format: largeur x hauteur (ex: 21 x 29.7)",
        is_required: false,
        order_index: 6
      },
      {
        field_key: "publication_isbn",
        field_type: "text",
        label_fr: "ISBN",
        label_ar: "الرقم الدولي الموحد للكتاب",
        is_required: false,
        order_index: 7
      },
      {
        field_key: "publication_date",
        field_type: "date",
        label_fr: "Date de publication",
        label_ar: "تاريخ النشر",
        is_required: true,
        order_index: 8
      },
      {
        field_key: "publication_price",
        field_type: "number",
        label_fr: "Prix public (DH)",
        label_ar: "السعر العام (درهم)",
        is_required: false,
        order_index: 9
      }
    ]
  },

  // Section: Éditeur
  {
    section_key: "publisher_info",
    fields: [
      {
        field_key: "publisher_name",
        field_type: "text",
        label_fr: "Nom de l'éditeur",
        label_ar: "اسم الناشر",
        is_required: true,
        order_index: 0
      },
      {
        field_key: "publisher_nature",
        field_type: "select",
        label_fr: "Nature de l'éditeur",
        label_ar: "طبيعة الناشر",
        is_required: false,
        order_index: 1,
        config: {
          options: [
            { value: "public", label: "Public" },
            { value: "private", label: "Privé" },
            { value: "association", label: "Association" }
          ]
        }
      },
      {
        field_key: "publisher_city",
        field_type: "text",
        label_fr: "Ville de l'éditeur",
        label_ar: "مدينة الناشر",
        is_required: false,
        order_index: 2
      },
      {
        field_key: "publisher_country",
        field_type: "text",
        label_fr: "Pays de l'éditeur",
        label_ar: "بلد الناشر",
        is_required: false,
        order_index: 3
      }
    ]
  },

  // Section: Imprimeur
  {
    section_key: "printer_info",
    fields: [
      {
        field_key: "printer_name",
        field_type: "text",
        label_fr: "Nom de l'imprimeur",
        label_ar: "اسم المطبعة",
        is_required: false,
        order_index: 0
      },
      {
        field_key: "printer_city",
        field_type: "text",
        label_fr: "Ville de l'imprimeur",
        label_ar: "مدينة المطبعة",
        is_required: false,
        order_index: 1
      },
      {
        field_key: "printer_country",
        field_type: "text",
        label_fr: "Pays de l'imprimeur",
        label_ar: "بلد المطبعة",
        is_required: false,
        order_index: 2
      },
      {
        field_key: "print_copies",
        field_type: "number",
        label_fr: "Nombre d'exemplaires imprimés",
        label_ar: "عدد النسخ المطبوعة",
        is_required: false,
        order_index: 3
      }
    ]
  }
];

export async function importFormFields(formKey: string) {
  try {
    console.log("Starting import for formKey:", formKey);
    
    // 1. Vérifier si le formulaire existe déjà
    const { data: existingForm, error: selectError } = await (supabase as any)
      .from("forms")
      .select("*")
      .eq("form_key", formKey)
      .single();

    console.log("Existing form check:", { existingForm, selectError });

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 = no rows found, c'est normal si le formulaire n'existe pas
      throw selectError;
    }

    const form = existingForm;

    if (!form) {
      throw new Error(`Le formulaire ${formKey} n'existe pas dans la base de données. Veuillez d'abord créer le formulaire via la migration.`);
    }

    console.log("Using form with ID:", form.id);
    console.log("Fetching versions for form_id:", form.id);
    let versionsResponse = await (supabase as any)
      .from("form_versions")
      .select("*")
      .eq("form_id", form.id)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log("Versions response:", versionsResponse);
    let version = versionsResponse.data;

    if (!version) {
      // Créer une première version
      const structure = {
        sections: [
          { key: "author_identification", label_fr: "Identification de l'auteur", label_ar: "تعريف المؤلف" },
          { key: "publication_identification", label_fr: "Identification de la publication", label_ar: "تعريف المنشور" },
          { key: "publisher_info", label_fr: "Éditeur", label_ar: "الناشر" },
          { key: "printer_info", label_fr: "Imprimeur", label_ar: "المطبعة" }
        ]
      };

      console.log("Creating version with form_id:", form.id);
      const createVersionResponse = await (supabase as any)
        .from("form_versions")
        .insert({
          form_id: form.id,
          version_number: 1,
          structure: structure,
          is_published: false
        })
        .select()
        .single();

      console.log("Create version response:", createVersionResponse);
      if (createVersionResponse.error) {
        console.error("Error creating version:", createVersionResponse.error);
        throw createVersionResponse.error;
      }
      version = createVersionResponse.data;
    }
    
    console.log("Using version:", version);

    // 3. Importer les champs
    let fieldsData: any[] = [];
    
    if (formKey === "legal_deposit_monograph") {
      fieldsData = legalDepositMonographFields;
    }

    // 4. Insérer les champs dans la BD
    const fieldsToInsert: any[] = [];
    
    for (const section of fieldsData) {
      for (const field of section.fields) {
        fieldsToInsert.push({
          form_version_id: version.id,
          section_key: section.section_key,
          field_key: field.field_key,
          field_type: field.field_type,
          label_fr: field.label_fr,
          label_ar: field.label_ar || "",
          description_fr: field.description_fr || "",
          description_ar: field.description_ar || "",
          is_required: field.is_required,
          is_visible: true,
          is_readonly: false,
          order_index: field.order_index,
          config: field.config || null,
          validation_rules: null,
          visibility_conditions: null,
          default_value: ""
        });
      }
    }

    // Supprimer les anciens champs
    await (supabase as any)
      .from("custom_fields")
      .delete()
      .eq("form_version_id", version.id);

    // Insérer les nouveaux champs
    const insertResponse = await (supabase as any)
      .from("custom_fields")
      .insert(fieldsToInsert);

    if (insertResponse.error) throw insertResponse.error;

    return {
      success: true,
      message: `${fieldsToInsert.length} champs importés avec succès`,
      formId: form.id,
      versionId: version.id
    };

  } catch (error) {
    console.error("Erreur lors de l'import:", error);
    throw error;
  }
}
