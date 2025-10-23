-- Étape 1: Ajouter les nouveaux rôles à l'enum user_role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'dac';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'comptable';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'direction';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'read_only';