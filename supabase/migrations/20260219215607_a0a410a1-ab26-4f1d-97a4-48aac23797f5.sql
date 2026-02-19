-- Suppression du doublon "Pass journalier" (SRV-PASS-JOUR)
-- Le vrai Pass journalier est SL-PASS (catégorie Inscription, is_free=true)
-- SRV-PASS-JOUR est un doublon parasite avec des tarifs à 0 MAD

-- 1. Supprimer les tarifs orphelins liés au doublon
DELETE FROM bnrm_tarifs 
WHERE id_service = 'SRV-PASS-JOUR';

-- 2. Supprimer le service dupliqué
DELETE FROM bnrm_services 
WHERE id_service = 'SRV-PASS-JOUR';