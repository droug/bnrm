-- Ajouter les colonnes manquantes pour la gestion des réservations d'ouvrages
ALTER TABLE reservations_ouvrages
ADD COLUMN IF NOT EXISTS reason_refus TEXT,
ADD COLUMN IF NOT EXISTS validated_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS refused_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS date_validation TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS date_refus TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS date_archivage TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS admin_comments TEXT;

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Admins can manage all reservations" ON reservations_ouvrages;
DROP POLICY IF EXISTS "Librarians can manage routed reservations" ON reservations_ouvrages;
DROP POLICY IF EXISTS "Users can view their own reservations" ON reservations_ouvrages;
DROP POLICY IF EXISTS "Users can create reservations" ON reservations_ouvrages;
DROP POLICY IF EXISTS "Admins and librarians can view all reservations" ON reservations_ouvrages;
DROP POLICY IF EXISTS "Admins and librarians can update reservations" ON reservations_ouvrages;

-- Créer les nouvelles politiques
CREATE POLICY "Admins and librarians can view all reservations"
ON reservations_ouvrages FOR SELECT
USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Admins and librarians can update reservations"
ON reservations_ouvrages FOR UPDATE
USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Users can create reservations"
ON reservations_ouvrages FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own reservations"
ON reservations_ouvrages FOR SELECT
USING (user_id = auth.uid() OR is_admin_or_librarian(auth.uid()));

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_reservations_ouvrages_statut ON reservations_ouvrages(statut);
CREATE INDEX IF NOT EXISTS idx_reservations_ouvrages_routed_to ON reservations_ouvrages(routed_to);
CREATE INDEX IF NOT EXISTS idx_reservations_ouvrages_created_at ON reservations_ouvrages(created_at DESC);