-- Corriger les nomenclatures pour utiliser le format COLLECTION##VILLE## sans espaces

-- DOC: Format avec collection et ville obligatoires
UPDATE cote_nomenclatures 
SET 
  modele_codification = 'COLLECTION##VILLE##',
  description = 'Documents - Collection + Ville. Exemple: DOC01RBT02 (Collection DOC édition 01, Rabat provenance 02)'
WHERE prefixe = 'DOC';

-- ACT: Format avec collection et ville obligatoires
UPDATE cote_nomenclatures 
SET 
  modele_codification = 'COLLECTION##VILLE##',
  description = 'Activités - Collection + Ville. Exemple: ACT05FES03 (Collection ACT édition 05, Fès provenance 03)'
WHERE prefixe = 'ACT';

-- EXPO: Format avec collection et ville obligatoires
UPDATE cote_nomenclatures 
SET 
  modele_codification = 'COLLECTION##VILLE##',
  description = 'Expositions - Collection + Ville. Exemple: EXPO12CAS08 (Collection EXPO édition 12, Casablanca provenance 08)'
WHERE prefixe = 'EXPO';