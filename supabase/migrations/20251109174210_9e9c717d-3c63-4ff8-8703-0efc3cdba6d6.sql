-- Ajouter le champ "Nationalité de l'auteur" aux formulaires BD/Logiciels et Collections spécialisées
DO $$
DECLARE
  v_bd_software_version_id UUID;
  v_special_collections_version_id UUID;
BEGIN
  -- Récupérer les versions des formulaires
  SELECT fv.id INTO v_bd_software_version_id
  FROM form_versions fv
  JOIN forms f ON f.id = fv.form_id
  WHERE f.form_key = 'legal_deposit_bd_software'
  AND fv.is_published = true
  ORDER BY fv.version_number DESC
  LIMIT 1;

  SELECT fv.id INTO v_special_collections_version_id
  FROM form_versions fv
  JOIN forms f ON f.id = fv.form_id
  WHERE f.form_key = 'legal_deposit_special_collections'
  AND fv.is_published = true
  ORDER BY fv.version_number DESC
  LIMIT 1;

  -- Ajouter le champ pour le formulaire BD/Logiciels
  IF v_bd_software_version_id IS NOT NULL THEN
    INSERT INTO custom_fields (
      form_version_id,
      field_key,
      field_type,
      section_key,
      label_fr,
      label_ar,
      is_required,
      is_visible,
      config,
      order_index
    ) VALUES (
      v_bd_software_version_id,
      'author_nationality',
      'autocomplete',
      'identification_auteur',
      'Nationalité',
      'الجنسية',
      false,
      true,
      '{"listCode": "nationalities"}'::jsonb,
      100
    )
    ON CONFLICT (form_version_id, field_key) DO NOTHING;
  END IF;

  -- Ajouter le champ pour le formulaire Collections spécialisées
  IF v_special_collections_version_id IS NOT NULL THEN
    INSERT INTO custom_fields (
      form_version_id,
      field_key,
      field_type,
      section_key,
      label_fr,
      label_ar,
      is_required,
      is_visible,
      config,
      order_index
    ) VALUES (
      v_special_collections_version_id,
      'author_nationality',
      'autocomplete',
      'identification_auteur',
      'Nationalité',
      'الجنسية',
      false,
      true,
      '{"listCode": "nationalities"}'::jsonb,
      100
    )
    ON CONFLICT (form_version_id, field_key) DO NOTHING;
  END IF;
END $$;