/**
 * Utilitaire de gestion des statuts workflow
 * Mapping entre statuts internes et statuts publics selon le tableau de référence
 */

export type InternalStatus = 
  | 'a_verifier'           // Soumise
  | 'confirmee'            // Validée
  | 'rejetee'              // Refusée
  | 'verification_en_cours' // Vérification en cours
  | 'contractualisee'      // Contractualisée
  | 'facturee'             // Facturée
  | 'en_cours_execution'   // Mise à disposition
  | 'archivee'             // Archivée sans suite
  | 'cloturee'             // Clôturée
  // Alias pour compatibilité
  | 'en_attente'
  | 'validee'
  | 'refusee'
  | 'en_attente_paiement'
  | 'archivee_sans_suite';

export type PublicStatus = 
  | 'en_cours'             // En cours
  | 'acceptee'             // Acceptée
  | 'refusee'              // Refusée
  | 'confirmee'            // Confirmée
  | 'en_attente_paiement'  // En attente de paiement
  | 'terminee';            // Terminée

/**
 * Mapping des statuts internes vers les statuts publics (vus par le demandeur)
 */
export const STATUS_MAPPING: Record<InternalStatus, PublicStatus> = {
  // Soumise → En cours
  'a_verifier': 'en_cours',
  'en_attente': 'en_cours',
  
  // Validée → Acceptée
  'confirmee': 'acceptee',
  'validee': 'acceptee',
  
  // Refusée → Refusée
  'rejetee': 'refusee',
  'refusee': 'refusee',
  
  // Vérification en cours → En cours
  'verification_en_cours': 'en_cours',
  
  // Contractualisée → Confirmée
  'contractualisee': 'confirmee',
  
  // Facturée → En attente de paiement
  'facturee': 'en_attente_paiement',
  'en_attente_paiement': 'en_attente_paiement',
  
  // Mise à disposition → En cours
  'en_cours_execution': 'en_cours',
  
  // Archivée sans suite → En cours
  'archivee': 'en_cours',
  'archivee_sans_suite': 'en_cours',
  
  // Clôturée → Terminée
  'cloturee': 'terminee',
};

/**
 * Labels français pour les statuts internes
 */
export const INTERNAL_STATUS_LABELS: Record<InternalStatus, string> = {
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
};

/**
 * Labels français pour les statuts publics
 */
export const PUBLIC_STATUS_LABELS: Record<PublicStatus, string> = {
  'en_cours': 'En cours',
  'acceptee': 'Acceptée',
  'refusee': 'Refusée',
  'confirmee': 'Confirmée',
  'en_attente_paiement': 'En attente de paiement',
  'terminee': 'Terminée',
};

/**
 * Convertit un statut interne en statut public
 */
export function getPublicStatus(internalStatus: InternalStatus): PublicStatus {
  return STATUS_MAPPING[internalStatus] || 'en_cours';
}

/**
 * Obtient le label d'un statut interne
 */
export function getInternalStatusLabel(status: InternalStatus): string {
  return INTERNAL_STATUS_LABELS[status] || status;
}

/**
 * Obtient le label d'un statut public
 */
export function getPublicStatusLabel(status: PublicStatus): string {
  return PUBLIC_STATUS_LABELS[status] || status;
}
