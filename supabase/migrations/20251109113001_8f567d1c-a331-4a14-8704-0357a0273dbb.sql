-- Insérer des données de test pour cbm_adhesions
INSERT INTO public.cbm_adhesions (
  user_id,
  library_name,
  library_type,
  address,
  city,
  phone,
  email,
  contact_person,
  status,
  created_at
) VALUES
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Bibliothèque Municipale de Casablanca',
    'public',
    '123 Avenue Mohammed V, Casablanca',
    'Casablanca',
    '+212 5 22 12 34 56',
    'bibliotheque.casa@ville.ma',
    'Ahmed Alami',
    'approved',
    NOW() - INTERVAL '15 days'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Bibliothèque Universitaire de Rabat',
    'university',
    '456 Avenue des FAR, Rabat',
    'Rabat',
    '+212 5 37 98 76 54',
    'bu.rabat@univ.ma',
    'Fatima Bennis',
    'approved',
    NOW() - INTERVAL '10 days'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Médiathèque de Marrakech',
    'public',
    '789 Boulevard Hassan II, Marrakech',
    'Marrakech',
    '+212 5 24 44 55 66',
    'mediatheque.marrakech@ville.ma',
    'Mohamed Tazi',
    'pending',
    NOW() - INTERVAL '3 days'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Bibliothèque Privée Al-Hikma',
    'private',
    '321 Rue de la Liberté, Fès',
    'Fès',
    '+212 5 35 77 88 99',
    'contact@alhikma.ma',
    'Laila Fassi',
    'pending',
    NOW() - INTERVAL '2 days'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Centre de Documentation Tanger',
    'specialized',
    '654 Avenue Pasteur, Tanger',
    'Tanger',
    '+212 5 39 33 22 11',
    'doc.tanger@centre.ma',
    'Rachid El Ouardi',
    'rejected',
    NOW() - INTERVAL '5 days'
  );

-- Insérer des données de test pour cbm_formation_requests
INSERT INTO public.cbm_formation_requests (
  user_id,
  library_name,
  training_type,
  preferred_dates,
  number_of_participants,
  status,
  created_at
) VALUES
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Bibliothèque Municipale de Casablanca',
    'Catalogage UNIMARC',
    '2025-02-15',
    12,
    'approved',
    NOW() - INTERVAL '12 days'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Bibliothèque Universitaire de Rabat',
    'Gestion de bibliothèque',
    '2025-03-01',
    8,
    'approved',
    NOW() - INTERVAL '8 days'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Médiathèque de Marrakech',
    'Numérisation et archivage',
    '2025-02-20',
    15,
    'pending',
    NOW() - INTERVAL '4 days'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Bibliothèque Privée Al-Hikma',
    'Catalogage UNIMARC',
    '2025-03-10',
    6,
    'pending',
    NOW() - INTERVAL '1 day'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Centre de Documentation Tanger',
    'Gestion de bibliothèque',
    '2025-02-25',
    10,
    'rejected',
    NOW() - INTERVAL '6 days'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Bibliothèque de Agadir',
    'Numérisation et archivage',
    '2025-03-05',
    20,
    'approved',
    NOW() - INTERVAL '20 days'
  );