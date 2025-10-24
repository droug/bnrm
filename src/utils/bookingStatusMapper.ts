/**
 * Mapper de statuts pour les réservations d'espaces culturels
 * 
 * Correspondance entre statuts internes (base de données) et statuts publics (affichés aux demandeurs)
 * 
 * | Étape | Statut interne | Statut public (demandeur) |
 * |-------|----------------|---------------------------|
 * | Soumise | a_verifier | En cours |
 * | Validée | confirmee | Acceptée |
 * | Refusée | rejetee | Refusée |
 * | Vérification en cours | verification_en_cours | En cours |
 * | Contractualisée | contractualisee | Confirmée |
 * | Facturée | facturee | En attente de paiement |
 * | Mise à disposition | en_cours_execution | En cours |
 * | Archivée sans suite | archivee | En cours |
 * | Clôturée | cloturee | Terminée |
 */

export type InternalBookingStatus = 
  | 'a_verifier'
  | 'en_attente' // Alias pour a_verifier
  | 'confirmee'
  | 'validee' // Alias pour confirmee
  | 'rejetee'
  | 'refusee' // Alias pour rejetee
  | 'verification_en_cours'
  | 'contractualisee'
  | 'facturee'
  | 'en_attente_paiement' // Alias pour facturee
  | 'en_cours_execution'
  | 'archivee'
  | 'archivee_sans_suite' // Alias pour archivee
  | 'cloturee'
  | 'annulee';

export type PublicBookingStatus = 
  | 'en_cours'
  | 'acceptee'
  | 'refusee'
  | 'confirmee'
  | 'en_attente_paiement'
  | 'terminee';

/**
 * Convertit un statut interne en statut public pour l'affichage aux demandeurs
 */
export function getPublicStatus(internalStatus: InternalBookingStatus): PublicBookingStatus {
  const statusMap: Record<InternalBookingStatus, PublicBookingStatus> = {
    'a_verifier': 'en_cours',
    'en_attente': 'en_cours',
    'confirmee': 'acceptee',
    'validee': 'acceptee',
    'rejetee': 'refusee',
    'refusee': 'refusee',
    'verification_en_cours': 'en_cours',
    'contractualisee': 'confirmee',
    'facturee': 'en_attente_paiement',
    'en_attente_paiement': 'en_attente_paiement',
    'en_cours_execution': 'en_cours',
    'archivee': 'en_cours',
    'archivee_sans_suite': 'en_cours',
    'cloturee': 'terminee',
    'annulee': 'refusee',
  };

  return statusMap[internalStatus] || 'en_cours';
}

/**
 * Retourne le label français du statut public
 */
export function getPublicStatusLabel(publicStatus: PublicBookingStatus): string {
  const labelMap: Record<PublicBookingStatus, string> = {
    'en_cours': 'En cours',
    'acceptee': 'Acceptée',
    'refusee': 'Refusée',
    'confirmee': 'Confirmée',
    'en_attente_paiement': 'En attente de paiement',
    'terminee': 'Terminée',
  };

  return labelMap[publicStatus] || 'En cours';
}

/**
 * Retourne le label français du statut interne
 */
export function getInternalStatusLabel(internalStatus: InternalBookingStatus): string {
  const labelMap: Record<InternalBookingStatus, string> = {
    'a_verifier': 'À vérifier',
    'en_attente': 'À vérifier',
    'confirmee': 'Confirmée',
    'validee': 'Confirmée',
    'rejetee': 'Rejetée',
    'refusee': 'Rejetée',
    'verification_en_cours': 'Vérification en cours',
    'contractualisee': 'Contractualisée',
    'facturee': 'Facturée',
    'en_attente_paiement': 'Facturée',
    'en_cours_execution': 'En cours d\'exécution',
    'archivee': 'Archivée',
    'archivee_sans_suite': 'Archivée',
    'cloturee': 'Clôturée',
    'annulee': 'Annulée',
  };

  return labelMap[internalStatus] || internalStatus;
}

/**
 * Retourne le statut public formaté pour l'affichage aux demandeurs
 */
export function getFormattedPublicStatus(internalStatus: InternalBookingStatus): {
  status: PublicBookingStatus;
  label: string;
} {
  const publicStatus = getPublicStatus(internalStatus);
  return {
    status: publicStatus,
    label: getPublicStatusLabel(publicStatus),
  };
}
