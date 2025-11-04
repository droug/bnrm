import { supabase } from "@/integrations/supabase/client";

export async function initializeLegalDepositMonographForm() {
  try {
    // Vérifier si le formulaire existe dans la table forms
    const { data: form } = await supabase
      .from("forms")
      .select("id")
      .eq("form_key", "legal_deposit_monograph")
      .maybeSingle();

    if (!form) {
      throw new Error("Form not found");
    }

    // Vérifier si une version existe déjà
    const { data: existingVersion } = await supabase
      .from("form_versions")
      .select("id")
      .eq("form_id", form.id)
      .maybeSingle();

    if (existingVersion) {
      console.log("Version already exists");
      return { success: true, versionId: existingVersion.id };
    }

    // Créer la version avec les sections
    const { data: version, error: versionError } = await supabase
      .from("form_versions")
      .insert({
        form_id: form.id,
        version_number: 1,
        structure: {
          sections: [
            {
              key: "identification_auteur",
              label_fr: "Identification de l'auteur",
              label_ar: "تعريف المؤلف",
              order_index: 0,
              fields: []
            },
            {
              key: "identification_publication",
              label_fr: "Identification de la publication",
              label_ar: "تعريف المنشور",
              order_index: 1,
              fields: []
            },
            {
              key: "identification_editeur",
              label_fr: "Identification de l'Éditeur",
              label_ar: "تعريف الناشر",
              order_index: 2,
              fields: []
            },
            {
              key: "identification_imprimeur",
              label_fr: "Identification de l'imprimeur",
              label_ar: "تعريف المطبعة",
              order_index: 3,
              fields: []
            },
            {
              key: "pieces_fournir",
              label_fr: "Pièces à fournir",
              label_ar: "الوثائق المطلوبة",
              order_index: 4,
              fields: []
            }
          ]
        },
        is_published: true
      })
      .select()
      .single();

    if (versionError) {
      console.error("Error creating version:", versionError);
      throw versionError;
    }

    // Créer les champs de base pour chaque section
    const baseFields = [
      // Section 1: Identification de l'auteur
      { section_key: "identification_auteur", field_key: "author_type", field_type: "select", label_fr: "Type de l'auteur", label_ar: "نوع المؤلف", order_index: 0, is_required: true },
      { section_key: "identification_auteur", field_key: "author_name", field_type: "text", label_fr: "Nom de l'auteur", label_ar: "اسم المؤلف", order_index: 1, is_required: true },
      { section_key: "identification_auteur", field_key: "author_pseudonym", field_type: "text", label_fr: "Pseudonyme", label_ar: "الاسم المستعار", order_index: 2 },
      { section_key: "identification_auteur", field_key: "author_phone", field_type: "text", label_fr: "Téléphone", label_ar: "الهاتف", order_index: 3 },
      { section_key: "identification_auteur", field_key: "author_email", field_type: "text", label_fr: "Email", label_ar: "البريد الإلكتروني", order_index: 4 },
      { section_key: "identification_auteur", field_key: "author_region", field_type: "select", label_fr: "Région", label_ar: "المنطقة", order_index: 5 },
      { section_key: "identification_auteur", field_key: "author_city", field_type: "select", label_fr: "Ville", label_ar: "المدينة", order_index: 6 },
      
      // Section 2: Identification de la publication
      { section_key: "identification_publication", field_key: "publication_discipline", field_type: "select", label_fr: "Discipline de l'ouvrage", label_ar: "تخصص الكتاب", order_index: 0 },
      { section_key: "identification_publication", field_key: "publication_title", field_type: "text", label_fr: "Titre de l'ouvrage", label_ar: "عنوان الكتاب", order_index: 1, is_required: true },
      { section_key: "identification_publication", field_key: "support_type", field_type: "select", label_fr: "Type de support", label_ar: "نوع الوسيط", order_index: 2 },
      { section_key: "identification_publication", field_key: "publication_type", field_type: "select", label_fr: "Type de publication", label_ar: "نوع النشر", order_index: 3, is_required: true },
      { section_key: "identification_publication", field_key: "is_periodic", field_type: "select", label_fr: "Périodicité", label_ar: "الدورية", order_index: 4, is_required: true },
      { section_key: "identification_publication", field_key: "collection_title", field_type: "text", label_fr: "Titre de la collection", label_ar: "عنوان السلسلة", order_index: 5 },
      { section_key: "identification_publication", field_key: "collection_number", field_type: "text", label_fr: "Numéro dans la collection", label_ar: "الرقم في السلسلة", order_index: 6 },
      { section_key: "identification_publication", field_key: "number_of_pages", field_type: "number", label_fr: "Nombre de pages", label_ar: "عدد الصفحات", order_index: 7 },
      
      // Section 3: Identification de l'Éditeur
      { section_key: "identification_editeur", field_key: "publisher_id", field_type: "select", label_fr: "Éditeur", label_ar: "الناشر", order_index: 0 },
      { section_key: "identification_editeur", field_key: "publication_date", field_type: "date", label_fr: "Date prévue de parution", label_ar: "تاريخ النشر المتوقع", order_index: 1 },
      
      // Section 4: Identification de l'imprimeur
      { section_key: "identification_imprimeur", field_key: "printer_id", field_type: "select", label_fr: "Imprimerie", label_ar: "المطبعة", order_index: 0 },
      { section_key: "identification_imprimeur", field_key: "printer_email", field_type: "text", label_fr: "Email", label_ar: "البريد الإلكتروني", order_index: 1 },
      { section_key: "identification_imprimeur", field_key: "printer_country", field_type: "select", label_fr: "Pays", label_ar: "البلد", order_index: 2 },
      { section_key: "identification_imprimeur", field_key: "printer_phone", field_type: "text", label_fr: "Téléphone", label_ar: "الهاتف", order_index: 3 },
      { section_key: "identification_imprimeur", field_key: "printer_address", field_type: "textarea", label_fr: "Adresse", label_ar: "العنوان", order_index: 4 },
      { section_key: "identification_imprimeur", field_key: "print_run_number", field_type: "number", label_fr: "Nombre de tirage", label_ar: "عدد النسخ المطبوعة", order_index: 5 },
      
      // Section 5: Pièces à fournir
      { section_key: "pieces_fournir", field_key: "cover_file", field_type: "file", label_fr: "Joindre la couverture (format « jpg » moins de 1 MO)", label_ar: "إرفاق الغلاف", order_index: 0, is_required: true },
      { section_key: "pieces_fournir", field_key: "summary_file", field_type: "file", label_fr: "Joindre le sommaire (format « PDF » moins de 2 MO)", label_ar: "إرفاق الفهرس", order_index: 1, is_required: true },
      { section_key: "pieces_fournir", field_key: "abstract_file", field_type: "file", label_fr: "Joindre résumé de l'ouvrage (format « PDF » moins de 2 MO)", label_ar: "إرفاق ملخص الكتاب", order_index: 2, is_required: true },
      { section_key: "pieces_fournir", field_key: "cin_file", field_type: "file", label_fr: "Envoyer une copie de la CIN du directeur", label_ar: "إرسال نسخة من البطاقة الوطنية", order_index: 3, is_required: true },
    ];

    const fieldsToInsert = baseFields.map(field => ({
      form_version_id: version.id,
      ...field,
      is_visible: true,
      is_readonly: false
    }));

    const { error: fieldsError } = await supabase
      .from("custom_fields")
      .insert(fieldsToInsert);

    if (fieldsError) {
      console.error("Error creating fields:", fieldsError);
      throw fieldsError;
    }

    return { success: true, versionId: version.id };
  } catch (error) {
    console.error("Error initializing form:", error);
    return { success: false, error };
  }
}
