-- Migration: Modification du workflow de restauration  
-- Le paiement se fait maintenant APRÈS la restauration au lieu d'AVANT

-- Documentation du nouveau workflow (paiement après restauration):
-- 1. soumise - Demande initiale soumise par l'utilisateur
-- 2. en_attente_autorisation - En attente d'approbation du directeur
-- 3. autorisee - Approuvée par le directeur  
-- 4. oeuvre_recue - Œuvre physiquement reçue
-- 5. diagnostic_en_cours - Diagnostic en cours
-- 6. devis_en_attente - Devis préparé, en attente de l'envoi
-- 7. devis_accepte - Devis accepté par le demandeur, restauration démarre automatiquement
-- 8. restauration_en_cours - Travaux de restauration en cours
-- 9. paiement_en_attente - Restauration terminée, en attente du paiement
-- 10. paiement_valide - Paiement effectué et validé
-- 11. cloturee - Œuvre restituée, dossier clôturé

-- Statuts de rejet:
-- - refusee_direction - Refusée par le directeur
-- - devis_refuse - Devis refusé par le demandeur

-- Mise à jour du commentaire de la table
COMMENT ON TABLE public.restoration_requests IS 
'Demandes de restauration de manuscrits.

Workflow actuel (paiement après restauration):
Soumise → Autorisation → Autorisée → Œuvre reçue → Diagnostic → Devis → Restauration → Paiement → Restitution';