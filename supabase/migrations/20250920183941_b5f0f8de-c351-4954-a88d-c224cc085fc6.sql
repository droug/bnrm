-- Étape 1: Ajouter les nouveaux types de profils à l'enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'public_user';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'subscriber'; 
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'partner';

-- Ajouter de nouveaux champs pour les profils différenciés
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_type text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_start_date date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_end_date date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_organization text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS research_specialization text[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS access_level_details jsonb DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_preferences jsonb DEFAULT '{}';