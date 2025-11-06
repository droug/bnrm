-- Insertion de données de test pour les adhérents au catalogue CBM
INSERT INTO public.cbm_adhesions_catalogue (
  nom_bibliotheque,
  type_bibliotheque,
  tutelle,
  adresse,
  region,
  ville,
  directeur,
  email,
  telephone,
  referent_technique,
  responsable_catalogage,
  sigb,
  nombre_documents,
  statut
) VALUES
  ('Bibliothèque Nationale du Royaume du Maroc', 'Bibliothèque Nationale', 'Ministère de la Culture', 'Avenue Ibn Batouta, BP 1003', 'Rabat-Salé-Kénitra', 'Rabat', 'Dr. Ahmed Benani', 'contact@bnrm.ma', '+212 537 77 18 88', 'Hamza El Fassi', 'Leila Benjelloun', 'Koha', 250000, 'approuve'),
  ('Bibliothèque Universitaire Hassan II Casablanca', 'Bibliothèque Universitaire', 'Université Hassan II', 'Boulevard Sidi Othmane', 'Casablanca-Settat', 'Casablanca', 'Prof. Fatima Zahra Alaoui', 'bu@uh2c.ma', '+212 522 23 45 67', 'Youssef Mansouri', 'Nadia El Amrani', 'PMB', 180000, 'approuve'),
  ('Bibliothèque Municipale de Marrakech', 'Bibliothèque Publique', 'Commune de Marrakech', 'Place Youssef Ibn Tachfine', 'Marrakech-Safi', 'Marrakech', 'M. Omar Benjelloun', 'bib.marrakech@gmail.com', '+212 524 44 33 22', 'Salim Tazi', 'Amina Hakim', 'Koha', 45000, 'approuve'),
  ('Bibliothèque Al Quaraouiyine', 'Bibliothèque Spécialisée', 'Université Al Quaraouiyine', 'Derb El Miter', 'Fès-Meknès', 'Fès', 'Dr. Mohammed Lakhdar', 'contact@alquaraouiyine.ma', '+212 535 63 45 78', 'Rachid Bennani', 'Samira El Fassi', 'Symphony', 120000, 'approuve'),
  ('Bibliothèque Régionale de Tanger', 'Bibliothèque Publique', 'Région de Tanger-Tétouan-Al Hoceïma', 'Avenue Mohammed V', 'Tanger-Tétouan-Al Hoceïma', 'Tanger', 'Mme. Samira Bennani', 'biblio.tanger@region.ma', '+212 539 94 12 34', 'Karim Alaoui', 'Fatima Mansouri', 'PMB', 65000, 'approuve');

-- Insertion de données de test pour les adhérents au réseau CBM
INSERT INTO public.cbm_adhesions_reseau (
  nom_bibliotheque,
  type_bibliotheque,
  tutelle,
  adresse,
  region,
  ville,
  directeur,
  email,
  telephone,
  referent_technique,
  responsable_catalogage,
  moyens_recensement,
  en_cours_informatisation,
  nombre_documents,
  statut
) VALUES
  ('Bibliothèque de l''Institut Français d''Agadir', 'Bibliothèque Spécialisée', 'Institut Français', 'Rue Ahmed Chawki', 'Souss-Massa', 'Agadir', 'M. Jean-Pierre Dubois', 'biblio@if-agadir.ma', '+212 528 82 14 15', 'Sophie Martin', 'Pierre Durand', 'Fiches manuelles', 'oui', 15000, 'approuve'),
  ('Centre de Documentation Universitaire Meknès', 'Centre de Documentation', 'Université Moulay Ismail', 'Avenue Zitoune', 'Fès-Meknès', 'Meknès', 'Dr. Rachid El Amrani', 'cdu@umi.ac.ma', '+212 535 51 22 33', 'Hassan Tazi', 'Aicha Bennani', 'Registres', 'en_cours', 28000, 'approuve'),
  ('Bibliothèque Provinciale d''Essaouira', 'Bibliothèque Publique', 'Province d''Essaouira', 'Place Moulay Hassan', 'Marrakech-Safi', 'Essaouira', 'M. Karim Tazi', 'bib.essaouira@province.ma', '+212 524 47 55 66', 'Mohamed El Fassi', 'Zineb Mansouri', 'Excel', 'oui', 22000, 'approuve'),
  ('Médiathèque de Rabat', 'Bibliothèque Publique', 'Commune de Rabat', 'Avenue Allal Ben Abdellah', 'Rabat-Salé-Kénitra', 'Rabat', 'Mme. Laila Mansouri', 'mediatheque@rabat.ma', '+212 537 70 98 76', 'Omar Benjelloun', 'Nadia Hakim', 'Fiches', 'en_cours', 35000, 'approuve'),
  ('Bibliothèque Universitaire Chouaib Doukkali', 'Bibliothèque Universitaire', 'Université Chouaib Doukkali', 'Route Ben Maachou', 'Casablanca-Settat', 'El Jadida', 'Prof. Hassan Benjelloun', 'bu@ucd.ac.ma', '+212 523 34 21 10', 'Youssef Alaoui', 'Leila El Amrani', 'Registres et Excel', 'oui', 42000, 'approuve');