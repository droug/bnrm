-- Insérer des données fictives pour publishers
INSERT INTO publishers (name, address, city, country, phone, email, google_maps_link, publisher_type) VALUES
  ('Éditions Tarik', '45 Avenue Hassan II', 'Casablanca', 'Maroc', '+212 522 274 040', 'contact@editionstarik.ma', 'https://maps.google.com/?q=33.5731,-7.5898', 'non_etatique'),
  ('Le Fennec', '8 Rue Cadi Ayad', 'Casablanca', 'Maroc', '+212 522 316 970', 'info@lefennec.ma', 'https://maps.google.com/?q=33.5883,-7.6114', 'non_etatique'),
  ('Marsam', 'Résidence Yasmine, Rabat', 'Rabat', 'Maroc', '+212 537 702 166', 'marsam@marsam.ma', 'https://maps.google.com/?q=34.0209,-6.8416', 'non_etatique'),
  ('Afrique Orient', '6 Rue Chouaib Doukkali', 'Casablanca', 'Maroc', '+212 522 293 245', 'contact@afriqueorient.com', 'https://maps.google.com/?q=33.5731,-7.6298', 'non_etatique'),
  ('Centre Culturel Arabe', '15 Zankat Al Yamama', 'Casablanca', 'Maroc', '+212 522 206 504', 'cca@menara.ma', 'https://maps.google.com/?q=33.5892,-7.6036', 'etatique'),
  ('Dar Al Qalam', 'Avenue Mohammed V', 'Rabat', 'Maroc', '+212 537 709 862', 'daralqalam@gmail.com', 'https://maps.google.com/?q=34.0181,-6.8323', 'non_etatique'),
  ('Al Madariss', '28 Rue Taha Hussein', 'Casablanca', 'Maroc', '+212 522 987 654', 'info@almadariss.ma', 'https://maps.google.com/?q=33.5950,-7.6187', 'non_etatique'),
  ('Éditions El Maarif', 'Boulevard Zerktouni', 'Casablanca', 'Maroc', '+212 522 276 543', 'elmaarif@edition.ma', 'https://maps.google.com/?q=33.5820,-7.6247', 'etatique')
ON CONFLICT (id) DO NOTHING;

-- Insérer des données fictives pour printers
INSERT INTO printers (name, address, city, country, phone, email, google_maps_link) VALUES
  ('Imprimerie Idéale', 'Zone Industrielle Oukacha', 'Casablanca', 'Maroc', '+212 522 345 678', 'contact@ideale.ma', 'https://maps.google.com/?q=33.5642,-7.6589'),
  ('Imprimerie de Fédala', 'Route de Rabat, Km 13', 'Mohammedia', 'Maroc', '+212 523 324 556', 'fedala@print.ma', 'https://maps.google.com/?q=33.7063,-7.3824'),
  ('Najah El Jadida', '34 Bd Abdelmoumen', 'Casablanca', 'Maroc', '+212 522 987 321', 'najah@printing.ma', 'https://maps.google.com/?q=33.5889,-7.6247'),
  ('Dar El Kitab', 'Angle Bd Mohamed Zerktouni', 'Casablanca', 'Maroc', '+212 522 456 789', 'darelkitab@impression.ma', 'https://maps.google.com/?q=33.5831,-7.6198'),
  ('Imprimerie El Maarif', '12 Rue Ibn Batouta', 'Rabat', 'Maroc', '+212 537 654 321', 'elmaarif@print.ma', 'https://maps.google.com/?q=34.0115,-6.8498'),
  ('Atlas Print', 'Zone Industrielle Aïn Sebaâ', 'Casablanca', 'Maroc', '+212 522 678 543', 'atlas@printing.ma', 'https://maps.google.com/?q=33.6121,-7.5234')
ON CONFLICT (id) DO NOTHING;

-- Insérer des données fictives pour producers
INSERT INTO producers (name, address, city, country, phone, email, google_maps_link) VALUES
  ('Morocco Digital Productions', 'Technopolis Rabat Shore', 'Rabat', 'Maroc', '+212 537 567 890', 'contact@mdp.ma', 'https://maps.google.com/?q=33.9716,-6.8498'),
  ('Atlas Software', 'Casablanca Technopark', 'Casablanca', 'Maroc', '+212 522 520 520', 'info@atlassoft.ma', 'https://maps.google.com/?q=33.5731,-7.6589'),
  ('Maghreb Multimedia', '22 Avenue des FAR', 'Casablanca', 'Maroc', '+212 522 432 109', 'multimedia@maghreb.ma', 'https://maps.google.com/?q=33.5892,-7.6114'),
  ('Digital Media Morocco', 'Sidi Maarouf, Casablanca', 'Casablanca', 'Maroc', '+212 522 978 654', 'dmm@digital.ma', 'https://maps.google.com/?q=33.5145,-7.6589'),
  ('Sahara Productions', 'Boulevard Zerktouni', 'Marrakech', 'Maroc', '+212 524 456 789', 'sahara@prod.ma', 'https://maps.google.com/?q=31.6295,-7.9811')
ON CONFLICT (id) DO NOTHING;

-- Insérer des données fictives pour distributors
INSERT INTO distributors (name, address, city, country, phone, email, google_maps_link) VALUES
  ('Sogedi Distribution', '45 Bd Mohamed V', 'Casablanca', 'Maroc', '+212 522 301 234', 'sogedi@distribution.ma', 'https://maps.google.com/?q=33.5731,-7.6198'),
  ('Librairie Nationale', '14 Avenue Hassan II', 'Rabat', 'Maroc', '+212 537 709 987', 'nationale@librairie.ma', 'https://maps.google.com/?q=34.0209,-6.8416'),
  ('Book Diffusion Maroc', 'Zone Industrielle', 'Tanger', 'Maroc', '+212 539 345 678', 'bdm@diffusion.ma', 'https://maps.google.com/?q=35.7595,-5.8340'),
  ('Atlas Distribution', 'Route de Rabat', 'Casablanca', 'Maroc', '+212 522 876 543', 'atlas@distrib.ma', 'https://maps.google.com/?q=33.5950,-7.6298'),
  ('Maghreb Diffusion', 'Avenue Mohammed VI', 'Marrakech', 'Maroc', '+212 524 567 890', 'maghreb@diffusion.ma', 'https://maps.google.com/?q=31.6369,-8.0089')
ON CONFLICT (id) DO NOTHING;