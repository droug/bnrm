
-- Supprimer les anciens tarifs de reproduction numérique pour les recréer proprement
DELETE FROM bnrm_tarifs WHERE id_tarif LIKE 'TREP-NUM%';

-- Réinsérer les 12 tarifs conformément au barème 2025 du PDF
INSERT INTO bnrm_tarifs (id_tarif, id_service, montant, devise, condition_tarif, periode_validite, is_active) VALUES
-- Particuliers - Non commercial
('TREP-NUM01', 'SRV-REP-NUM', 2.50, 'DH/page', 'Particuliers - Manuscrits/lithographies/livres rares/périodiques sur CD ou clé USB (non commercial)', '2025', true),
('TREP-NUM02', 'SRV-REP-NUM', 2.50, 'DH/page', 'Particuliers - Manuscrits/lithographies/livres rares/périodiques sur papier couleur (non commercial)', '2025', true),
('TREP-NUM03', 'SRV-REP-NUM', 2.00, 'DH/page', 'Particuliers - Manuscrits/lithographies/livres rares/périodiques sur papier noir & blanc (non commercial)', '2025', true),
-- Particuliers - Commercial
('TREP-NUM04', 'SRV-REP-NUM', 600.00, 'DH/page', 'Particuliers - Manuscrits/lithographies/livres rares/périodiques sur CD ou clé USB (commercial)', '2025', true),
('TREP-NUM05', 'SRV-REP-NUM', 600.00, 'DH/page', 'Particuliers - Manuscrits/lithographies/livres rares/périodiques sur papier couleur (commercial)', '2025', true),
('TREP-NUM06', 'SRV-REP-NUM', 600.00, 'DH/page', 'Particuliers - Manuscrits/lithographies/livres rares/périodiques sur papier noir & blanc (commercial)', '2025', true),
-- Entreprises/Institutionnels - Non commercial
('TREP-NUM07', 'SRV-REP-NUM', 3.50, 'DH/page', 'Entreprises/Institutionnels - Manuscrits/lithographies/livres rares/périodiques sur CD ou clé USB (non commercial)', '2025', true),
('TREP-NUM08', 'SRV-REP-NUM', 3.50, 'DH/page', 'Entreprises/Institutionnels - Manuscrits/lithographies/livres rares/périodiques sur papier couleur (non commercial)', '2025', true),
('TREP-NUM09', 'SRV-REP-NUM', 3.00, 'DH/page', 'Entreprises/Institutionnels - Manuscrits/lithographies/livres rares/périodiques sur papier noir & blanc (non commercial)', '2025', true),
-- Entreprises/Institutionnels - Commercial
('TREP-NUM10', 'SRV-REP-NUM', 800.00, 'DH/page', 'Entreprises/Institutionnels - Manuscrits/lithographies/livres rares/périodiques sur CD ou clé USB (commercial)', '2025', true),
('TREP-NUM11', 'SRV-REP-NUM', 800.00, 'DH/page', 'Entreprises/Institutionnels - Manuscrits/lithographies/livres rares/périodiques sur papier couleur (commercial)', '2025', true),
('TREP-NUM12', 'SRV-REP-NUM', 800.00, 'DH/page', 'Entreprises/Institutionnels - Manuscrits/lithographies/livres rares/périodiques sur papier noir & blanc (commercial)', '2025', true);
