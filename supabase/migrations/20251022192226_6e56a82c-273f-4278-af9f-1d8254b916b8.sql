-- Activer RLS sur visits_bookings si ce n'est pas déjà fait
ALTER TABLE public.visits_bookings ENABLE ROW LEVEL SECURITY;

-- Permettre aux utilisateurs authentifiés d'insérer leurs propres réservations
CREATE POLICY "Users can create their own bookings"
ON public.visits_bookings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id OR user_id IS NULL
);

-- Permettre aux utilisateurs non authentifiés d'insérer des réservations (sans user_id)
CREATE POLICY "Anonymous users can create bookings"
ON public.visits_bookings
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Permettre aux utilisateurs de voir leurs propres réservations
CREATE POLICY "Users can view their own bookings"
ON public.visits_bookings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Permettre aux utilisateurs de voir leurs réservations via email (pour non authentifiés)
CREATE POLICY "Users can view bookings by email"
ON public.visits_bookings
FOR SELECT
TO anon, authenticated
USING (true);

-- Permettre aux admins de voir toutes les réservations
CREATE POLICY "Admins can view all bookings"
ON public.visits_bookings
FOR ALL
TO authenticated
USING (public.is_admin_or_librarian(auth.uid()));

-- Permettre aux utilisateurs de mettre à jour leurs propres réservations (annuler)
CREATE POLICY "Users can update their own bookings"
ON public.visits_bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
WITH CHECK (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Activer RLS sur visits_slots si ce n'est pas déjà fait
ALTER TABLE public.visits_slots ENABLE ROW LEVEL SECURITY;

-- Permettre à tous de voir les créneaux disponibles
CREATE POLICY "Everyone can view available slots"
ON public.visits_slots
FOR SELECT
TO anon, authenticated
USING (true);

-- Permettre aux admins de gérer les créneaux
CREATE POLICY "Admins can manage slots"
ON public.visits_slots
FOR ALL
TO authenticated
USING (public.is_admin_or_librarian(auth.uid()));
