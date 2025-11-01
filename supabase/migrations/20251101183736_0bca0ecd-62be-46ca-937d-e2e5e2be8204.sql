-- Créer des politiques RLS pour permettre l'accès en lecture aux documents CBN
-- Ces documents sont publics et peuvent être consultés par tout le monde

-- Politique pour la table cbn_documents (lecture publique)
CREATE POLICY "Allow public read access to cbn_documents"
ON public.cbn_documents
FOR SELECT
USING (true);

-- Politique pour la table cbm_catalog (lecture publique)
CREATE POLICY "Allow public read access to cbm_catalog"
ON public.cbm_catalog
FOR SELECT
USING (true);