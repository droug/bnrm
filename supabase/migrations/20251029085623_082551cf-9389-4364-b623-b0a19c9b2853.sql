-- Créer la liste des disciplines pour BD/Logiciels/Audiovisuel
DO $$
DECLARE
  v_bd_discipline_list_id UUID;
  v_bd_type_pub_list_id UUID;
  v_database_value_id UUID;
  v_software_value_id UUID;
  v_audiovisual_value_id UUID;
BEGIN
  -- Récupérer l'ID de la liste parent (bd_type_publication)
  SELECT id INTO v_bd_type_pub_list_id
  FROM system_lists
  WHERE list_code = 'bd_type_publication';

  -- Créer la liste des disciplines
  INSERT INTO system_lists (
    list_code,
    list_name,
    description,
    parent_list_id,
    depends_on_parent_value,
    is_active
  ) VALUES (
    'bd_discipline',
    'Disciplines (BD & Logiciels)',
    'Liste des disciplines spécifiques aux bases de données, logiciels et documents audiovisuels',
    v_bd_type_pub_list_id,
    true,
    true
  ) RETURNING id INTO v_bd_discipline_list_id;

  -- Récupérer les IDs des valeurs du type de publication
  SELECT id INTO v_database_value_id
  FROM system_list_values
  WHERE list_id = v_bd_type_pub_list_id AND value_code = 'database';

  SELECT id INTO v_software_value_id
  FROM system_list_values
  WHERE list_id = v_bd_type_pub_list_id AND value_code = 'software';

  SELECT id INTO v_audiovisual_value_id
  FROM system_list_values
  WHERE list_id = v_bd_type_pub_list_id AND value_code = 'audiovisual';

  -- Disciplines pour Base de données
  INSERT INTO system_list_values (list_id, value_code, value_label, parent_value_id, sort_order, is_active) VALUES
  (v_bd_discipline_list_id, 'db_bibliographic', 'Bases de données bibliographiques', v_database_value_id, 1, true),
  (v_bd_discipline_list_id, 'db_scientific', 'Bases de données scientifiques', v_database_value_id, 2, true),
  (v_bd_discipline_list_id, 'db_legal', 'Bases de données juridiques', v_database_value_id, 3, true),
  (v_bd_discipline_list_id, 'db_economic', 'Bases de données économiques', v_database_value_id, 4, true),
  (v_bd_discipline_list_id, 'db_medical', 'Bases de données médicales', v_database_value_id, 5, true),
  (v_bd_discipline_list_id, 'db_cultural', 'Bases de données culturelles', v_database_value_id, 6, true),
  (v_bd_discipline_list_id, 'db_historical', 'Bases de données historiques', v_database_value_id, 7, true),
  (v_bd_discipline_list_id, 'db_geographic', 'Bases de données géographiques', v_database_value_id, 8, true);

  -- Disciplines pour Logiciel
  INSERT INTO system_list_values (list_id, value_code, value_label, parent_value_id, sort_order, is_active) VALUES
  (v_bd_discipline_list_id, 'sw_educational', 'Logiciels éducatifs', v_software_value_id, 1, true),
  (v_bd_discipline_list_id, 'sw_management', 'Logiciels de gestion', v_software_value_id, 2, true),
  (v_bd_discipline_list_id, 'sw_accounting', 'Logiciels de comptabilité', v_software_value_id, 3, true),
  (v_bd_discipline_list_id, 'sw_scientific', 'Logiciels scientifiques', v_software_value_id, 4, true),
  (v_bd_discipline_list_id, 'sw_health', 'Logiciels de santé', v_software_value_id, 5, true),
  (v_bd_discipline_list_id, 'sw_design', 'Logiciels de conception/design', v_software_value_id, 6, true),
  (v_bd_discipline_list_id, 'sw_engineering', 'Logiciels d''ingénierie', v_software_value_id, 7, true),
  (v_bd_discipline_list_id, 'sw_multimedia', 'Logiciels multimédias', v_software_value_id, 8, true);

  -- Disciplines pour Document audiovisuel
  INSERT INTO system_list_values (list_id, value_code, value_label, parent_value_id, sort_order, is_active) VALUES
  (v_bd_discipline_list_id, 'av_documentary', 'Documentaires', v_audiovisual_value_id, 1, true),
  (v_bd_discipline_list_id, 'av_educational', 'Films éducatifs', v_audiovisual_value_id, 2, true),
  (v_bd_discipline_list_id, 'av_reportage', 'Reportages', v_audiovisual_value_id, 3, true),
  (v_bd_discipline_list_id, 'av_conference', 'Conférences enregistrées', v_audiovisual_value_id, 4, true),
  (v_bd_discipline_list_id, 'av_cultural', 'Émissions culturelles', v_audiovisual_value_id, 5, true),
  (v_bd_discipline_list_id, 'av_scientific', 'Contenus scientifiques', v_audiovisual_value_id, 6, true),
  (v_bd_discipline_list_id, 'av_historical', 'Archives historiques', v_audiovisual_value_id, 7, true),
  (v_bd_discipline_list_id, 'av_artistic', 'Œuvres artistiques', v_audiovisual_value_id, 8, true);

END $$;