-- Supprimer l'ancienne contrainte
ALTER TABLE public.form_versions 
DROP CONSTRAINT IF EXISTS form_versions_form_id_fkey;

-- Supprimer les versions orphelines (dont le form_id n'existe pas dans forms)
DELETE FROM public.form_versions
WHERE form_id NOT IN (SELECT id FROM public.forms);

-- Recréer la contrainte avec la bonne référence
ALTER TABLE public.form_versions 
ADD CONSTRAINT form_versions_form_id_fkey 
FOREIGN KEY (form_id) 
REFERENCES public.forms(id) 
ON DELETE CASCADE;