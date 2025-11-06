-- Permettre à tout le monde de voir les adhésions approuvées du catalogue
CREATE POLICY "Anyone can view approved catalogue adhesions"
ON public.cbm_adhesions_catalogue
FOR SELECT
USING (statut = 'approuve');

-- Permettre à tout le monde de voir les adhésions approuvées du réseau
CREATE POLICY "Anyone can view approved reseau adhesions"
ON public.cbm_adhesions_reseau
FOR SELECT
USING (statut = 'approuve');