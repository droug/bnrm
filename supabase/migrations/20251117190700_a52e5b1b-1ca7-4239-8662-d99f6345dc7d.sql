
-- ===================================================
-- SYSTÈME DE NOTIFICATIONS CENTRALISÉ - Migration Simplifiée
-- Enrichissement progressif et sécurisé
-- ===================================================

-- Étape 1: Enrichir la table notifications existante (seulement colonnes manquantes)
DO $$ 
BEGIN
  -- Ajouter les colonnes manquantes une par une avec gestion d'erreurs
  BEGIN
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS notification_number TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type_code TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 2;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS category TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS module TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS source_table TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS source_record_id UUID;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS related_url TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS short_message TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS requires_action BOOLEAN DEFAULT false;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS action_url TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS action_label TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS action_completed BOOLEAN DEFAULT false;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS action_completed_at TIMESTAMP WITH TIME ZONE;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS created_by UUID;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;
END $$;

-- Migrer type vers type_code si type_code est vide
UPDATE public.notifications SET type_code = type WHERE type_code IS NULL;

-- Étape 2: Créer les index manquants
CREATE INDEX IF NOT EXISTS idx_notifications_type_code ON public.notifications(type_code);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_module ON public.notifications(module);
CREATE INDEX IF NOT EXISTS idx_notifications_source ON public.notifications(source_table, source_record_id);
CREATE INDEX IF NOT EXISTS idx_notifications_expires ON public.notifications(expires_at);

-- Étape 3: Créer une fonction simple pour générer les numéros de notification
CREATE OR REPLACE FUNCTION public.generate_notification_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  seq_num INTEGER;
BEGIN
  IF NEW.notification_number IS NULL THEN
    SELECT COALESCE(MAX(CAST(SPLIT_PART(notification_number, '-', 3) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM notifications
    WHERE notification_number LIKE 'NOTIF-' || EXTRACT(YEAR FROM NOW())::TEXT || '-%';
    
    NEW.notification_number := 'NOTIF-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(seq_num::TEXT, 8, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Créer le trigger si il n'existe pas
DROP TRIGGER IF EXISTS trigger_generate_notification_number ON public.notifications;
CREATE TRIGGER trigger_generate_notification_number
  BEFORE INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_notification_number();

-- Étape 4: Créer une fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Commentaires
COMMENT ON TABLE public.notifications IS 'Table principale des notifications du système (enrichie pour centralisation)';
COMMENT ON COLUMN public.notifications.notification_number IS 'Numéro unique de la notification (format: NOTIF-YYYY-NNNNNNNN)';
COMMENT ON COLUMN public.notifications.type_code IS 'Code du type de notification';
COMMENT ON COLUMN public.notifications.priority IS 'Priorité (1=basse, 2=normale, 3=haute, 4=urgente)';
COMMENT ON COLUMN public.notifications.category IS 'Catégorie de la notification';
COMMENT ON COLUMN public.notifications.module IS 'Module source de la notification';
COMMENT ON COLUMN public.notifications.source_table IS 'Table source de la notification';
COMMENT ON COLUMN public.notifications.source_record_id IS 'ID de l''enregistrement source';
COMMENT ON COLUMN public.notifications.related_url IS 'URL associée à la notification';
