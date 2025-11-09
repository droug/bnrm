-- Créer un professionnel de test si nécessaire
DO $$
DECLARE
  v_professional_id UUID;
BEGIN
  -- Créer ou récupérer le professionnel
  INSERT INTO professional_registry (
    user_id,
    professional_type,
    company_name,
    contact_person,
    email,
    phone,
    address,
    city,
    is_verified
  ) VALUES (
    '5631cc25-129d-4635-bbf3-a9eb8443f6a4',
    'editeur',
    'Éditions Al Madariss',
    'Ahmed Test',
    'test@almadariss.ma',
    '+212600000001',
    '123 Rue des Livres, Rabat',
    'Rabat',
    true
  )
  ON CONFLICT DO NOTHING;

  -- Récupérer l'ID du professionnel
  SELECT id INTO v_professional_id FROM professional_registry LIMIT 1;

  -- Insérer les publications de test uniquement si la table est vide
  IF NOT EXISTS (SELECT 1 FROM legal_deposit_requests LIMIT 1) THEN
    INSERT INTO legal_deposit_requests (
      request_number,
      initiator_id,
      title,
      subtitle,
      author_name,
      support_type,
      monograph_type,
      language,
      publication_date,
      page_count,
      isbn,
      issn,
      status,
      kitab_status,
      publication_status,
      metadata,
      created_at
    ) VALUES
    -- Nouvelles parutions (déjà publiées)
    (
      'DL-2025-001',
      v_professional_id,
      'Histoire du Maroc Contemporain',
      'Une perspective moderne',
      'Ahmed Bennani',
      'imprime',
      'livres',
      'ar',
      '2024-12-15',
      350,
      '978-9954-1-2345-6',
      NULL,
      'attribue',
      'approved',
      'published',
      '{"publisher": "Éditions Al Madariss", "category": "Histoire"}',
      NOW() - INTERVAL '2 months'
    ),
    (
      'DL-2025-002',
      v_professional_id,
      'La Littérature Marocaine Moderne',
      NULL,
      'Fatima Zahra Alami',
      'imprime',
      'livres',
      'fr',
      '2025-01-10',
      280,
      '978-9954-2-3456-7',
      NULL,
      'attribue',
      'approved',
      'published',
      '{"publisher": "Éditions Tarik", "category": "Littérature"}',
      NOW() - INTERVAL '1 month'
    ),
    (
      'DL-2025-003',
      v_professional_id,
      'Revue Marocaine de Droit',
      'Volume 12 - Numéro 1',
      'Collectif',
      'imprime',
      'periodiques',
      'fr',
      '2025-01-20',
      150,
      NULL,
      '1234-5678',
      'attribue',
      'approved',
      'published',
      '{"publisher": "Association Juridique Marocaine", "category": "Droit"}',
      NOW() - INTERVAL '20 days'
    ),
    (
      'DL-2025-004',
      v_professional_id,
      'Architecture Traditionnelle Marocaine',
      'Patrimoine et Innovation',
      'Hassan El Idrissi',
      'imprime',
      'beaux_livres',
      'ar',
      '2025-02-01',
      420,
      '978-9954-3-4567-8',
      NULL,
      'attribue',
      'approved',
      'published',
      '{"publisher": "Éditions Nord-Sud", "category": "Architecture"}',
      NOW() - INTERVAL '15 days'
    ),
    (
      'DL-2025-005',
      v_professional_id,
      'Cuisine Marocaine Authentique',
      'Recettes et Traditions',
      'Nadia Chraibi',
      'imprime',
      'livres',
      'fr',
      '2024-11-30',
      200,
      '978-9954-4-5678-9',
      NULL,
      'attribue',
      'approved',
      'published',
      '{"publisher": "Éditions Malika", "category": "Gastronomie"}',
      NOW() - INTERVAL '3 months'
    ),
    -- Publications à paraître (dates futures)
    (
      'DL-2025-006',
      v_professional_id,
      'Le Maroc et la Transition Énergétique',
      'Vers un Avenir Durable',
      'Rachid Benkirane',
      'imprime',
      'livres',
      'fr',
      '2025-04-15',
      310,
      '978-9954-5-6789-0',
      NULL,
      'attribue',
      'approved',
      'upcoming',
      '{"publisher": "Éditions Economiques", "category": "Environnement"}',
      NOW()
    ),
    (
      'DL-2025-007',
      v_professional_id,
      'Poésie Amazighe Contemporaine',
      'Anthologie 2025',
      'Mohand Oussaid',
      'imprime',
      'livres',
      'ber',
      '2025-05-20',
      180,
      '978-9954-6-7890-1',
      NULL,
      'attribue',
      'approved',
      'upcoming',
      '{"publisher": "Institut Royal de la Culture Amazighe", "category": "Poésie"}',
      NOW()
    ),
    (
      'DL-2025-008',
      v_professional_id,
      'Revue Marocaine d''Économie',
      'Numéro Spécial - Digitalisation',
      'Collectif',
      'imprime',
      'periodiques',
      'fr',
      '2025-06-01',
      120,
      NULL,
      '2345-6789',
      'attribue',
      'approved',
      'upcoming',
      '{"publisher": "Centre d''Études Économiques", "category": "Économie"}',
      NOW()
    );
  END IF;
END $$;