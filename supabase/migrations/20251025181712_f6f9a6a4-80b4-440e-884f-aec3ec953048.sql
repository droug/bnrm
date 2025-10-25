-- Mettre à jour les nomenclatures qui utilisent AAAA et MM

-- DOC: Supprimer l'année
UPDATE cote_nomenclatures 
SET 
  modele_codification = 'DOC_VILLE##_###',
  description = 'Documents - Ville + Numéro. Exemple: DOC_RBT_089 (Rabat, document 89)'
WHERE prefixe = 'DOC';

-- ACT: Supprimer l'année et le mois
UPDATE cote_nomenclatures 
SET 
  modele_codification = 'ACT_VILLE##_##',
  description = 'Activités - Ville + Numéro. Exemple: ACT_FES_12 (Fès, activité 12)'
WHERE prefixe = 'ACT';

-- EXPO: Supprimer l'année
UPDATE cote_nomenclatures 
SET 
  modele_codification = 'EXPO_###',
  description = 'Expositions - Numéro. Exemple: EXPO_025 (Exposition 25)'
WHERE prefixe = 'EXPO';