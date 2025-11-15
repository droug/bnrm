/**
 * RÔLES SYSTÈME VALIDES
 * 
 * Cette liste correspond EXACTEMENT à l'enum PostgreSQL 'user_role'
 * défini dans la base de données Supabase.
 * 
 * ⚠️ IMPORTANT: Ne PAS ajouter de rôles ici sans d'abord modifier l'enum SQL
 * 
 * Ces rôles sont utilisés dans la table 'user_roles' pour le contrôle d'accès
 * principal et les Row Level Security (RLS) policies.
 * 
 * Pour les rôles de workflow spécifiques, voir 'workflow_roles' table.
 */

import { Database } from "@/integrations/supabase/types";

export type UserRole = Database['public']['Enums']['user_role'];

/**
 * Liste complète des rôles système valides
 * Synchronisée avec l'enum PostgreSQL 'user_role'
 */
export const VALID_SYSTEM_ROLES: UserRole[] = [
  'admin',
  'librarian',
  'researcher',
  'visitor',
  'public_user',
  'subscriber',
  'partner',
  'producer',
  'editor',
  'printer',
  'distributor',
  'author',
  'dac',
  'comptable',
  'direction',
  'read_only',
] as const;

/**
 * Interface pour affichage dans les sélecteurs
 */
export interface SystemRoleOption {
  value: UserRole;
  label: string;
  description: string;
  category: 'administration' | 'user' | 'professional' | 'internal';
}

/**
 * Rôles avec leurs labels et descriptions
 * Pour utilisation dans les interfaces utilisateur
 */
export const SYSTEM_ROLES_OPTIONS: SystemRoleOption[] = [
  // === ADMINISTRATION ===
  {
    value: 'admin',
    label: 'Administrateur',
    description: 'Accès complet au système',
    category: 'administration',
  },
  {
    value: 'librarian',
    label: 'Bibliothécaire',
    description: 'Gestion de la bibliothèque et des catalogues',
    category: 'administration',
  },
  {
    value: 'direction',
    label: 'Direction',
    description: 'Direction de la BNRM',
    category: 'administration',
  },
  {
    value: 'dac',
    label: 'DAC',
    description: 'Direction des Affaires Culturelles',
    category: 'administration',
  },
  {
    value: 'comptable',
    label: 'Comptable',
    description: 'Gestion financière et comptabilité',
    category: 'administration',
  },

  // === UTILISATEURS ===
  {
    value: 'visitor',
    label: 'Visiteur',
    description: 'Accès public limité',
    category: 'user',
  },
  {
    value: 'public_user',
    label: 'Grand Public',
    description: 'Utilisateur inscrit grand public',
    category: 'user',
  },
  {
    value: 'subscriber',
    label: 'Abonné Premium',
    description: 'Abonnement premium avec accès étendu',
    category: 'user',
  },
  {
    value: 'researcher',
    label: 'Chercheur',
    description: 'Chercheur académique avec accès avancé',
    category: 'user',
  },
  {
    value: 'partner',
    label: 'Partenaire Institutionnel',
    description: 'Institution partenaire',
    category: 'user',
  },

  // === PROFESSIONNELS CHAÎNE DU LIVRE ===
  {
    value: 'author',
    label: 'Auteur',
    description: 'Auteur/Écrivain',
    category: 'professional',
  },
  {
    value: 'editor',
    label: 'Éditeur',
    description: 'Maison d\'édition',
    category: 'professional',
  },
  {
    value: 'printer',
    label: 'Imprimeur',
    description: 'Imprimerie',
    category: 'professional',
  },
  {
    value: 'producer',
    label: 'Producteur',
    description: 'Producteur de contenus',
    category: 'professional',
  },
  {
    value: 'distributor',
    label: 'Distributeur',
    description: 'Distributeur de livres',
    category: 'professional',
  },

  // === AUTRES ===
  {
    value: 'read_only',
    label: 'Lecture Seule',
    description: 'Accès en lecture uniquement',
    category: 'internal',
  },
];

/**
 * Obtenir le label d'un rôle
 */
export function getSystemRoleLabel(role: UserRole): string {
  const option = SYSTEM_ROLES_OPTIONS.find(opt => opt.value === role);
  return option?.label || role;
}

/**
 * Obtenir la description d'un rôle
 */
export function getSystemRoleDescription(role: UserRole): string {
  const option = SYSTEM_ROLES_OPTIONS.find(opt => opt.value === role);
  return option?.description || '';
}

/**
 * Obtenir la catégorie d'un rôle
 */
export function getSystemRoleCategory(role: UserRole): string {
  const option = SYSTEM_ROLES_OPTIONS.find(opt => opt.value === role);
  return option?.category || 'user';
}

/**
 * Vérifier si un rôle est valide
 */
export function isValidSystemRole(role: string): role is UserRole {
  return VALID_SYSTEM_ROLES.includes(role as UserRole);
}

/**
 * Filtrer les rôles par catégorie
 */
export function getSystemRolesByCategory(category: SystemRoleOption['category']): SystemRoleOption[] {
  return SYSTEM_ROLES_OPTIONS.filter(opt => opt.category === category);
}

/**
 * Rôles d'administration (accès backend)
 */
export const ADMIN_ROLES: UserRole[] = ['admin', 'librarian', 'direction', 'dac'] as const;

/**
 * Rôles utilisateurs (accès frontend)
 */
export const USER_ROLES: UserRole[] = [
  'visitor',
  'public_user',
  'subscriber',
  'researcher',
  'partner',
] as const;

/**
 * Rôles professionnels (chaîne du livre)
 */
export const PROFESSIONAL_ROLES: UserRole[] = [
  'author',
  'editor',
  'printer',
  'producer',
  'distributor',
] as const;
