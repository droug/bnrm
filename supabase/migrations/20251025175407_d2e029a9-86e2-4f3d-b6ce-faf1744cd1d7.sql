-- Insertion des abréviations officielles des villes BNRM
INSERT INTO public.cote_villes (nom_arabe, nom_francais, abreviation) VALUES
('مراكش', 'Marrakech', 'MRK'),
('الرباط', 'Rabat', 'RBT'),
('طنجة', 'Tanger', 'TNG'),
('سطات', 'Settat', 'SET'),
('بني ملال', 'Béni Mellal', 'BEN'),
('فاس', 'Fès', 'FES'),
('تارودانت', 'Taroudant', 'TRD')
ON CONFLICT (abreviation) DO UPDATE SET
  nom_arabe = EXCLUDED.nom_arabe,
  nom_francais = EXCLUDED.nom_francais;