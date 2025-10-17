-- Ajouter le rôle 'distributor' au type enum user_role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'distributor';