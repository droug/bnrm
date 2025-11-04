-- Activer RLS sur les tables de formulaires
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;

-- Politique pour forms : lecture publique, modifications pour admins uniquement
CREATE POLICY "Les formulaires sont visibles par tous"
  ON public.forms FOR SELECT
  USING (true);

CREATE POLICY "Seuls les admins peuvent créer des formulaires"
  ON public.forms FOR INSERT
  WITH CHECK (public.is_admin_or_librarian(auth.uid()));

CREATE POLICY "Seuls les admins peuvent modifier des formulaires"
  ON public.forms FOR UPDATE
  USING (public.is_admin_or_librarian(auth.uid()));

CREATE POLICY "Seuls les admins peuvent supprimer des formulaires"
  ON public.forms FOR DELETE
  USING (public.is_admin_or_librarian(auth.uid()));

-- Politique pour form_versions : lecture publique des versions publiées, modifications pour admins
CREATE POLICY "Les versions publiées sont visibles par tous"
  ON public.form_versions FOR SELECT
  USING (is_published = true OR public.is_admin_or_librarian(auth.uid()));

CREATE POLICY "Seuls les admins peuvent créer des versions"
  ON public.form_versions FOR INSERT
  WITH CHECK (public.is_admin_or_librarian(auth.uid()));

CREATE POLICY "Seuls les admins peuvent modifier des versions"
  ON public.form_versions FOR UPDATE
  USING (public.is_admin_or_librarian(auth.uid()));

CREATE POLICY "Seuls les admins peuvent supprimer des versions"
  ON public.form_versions FOR DELETE
  USING (public.is_admin_or_librarian(auth.uid()));

-- Politique pour custom_fields : lecture pour voir les champs des versions publiées, modifications pour admins
CREATE POLICY "Les champs des versions publiées sont visibles par tous"
  ON public.custom_fields FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.form_versions fv
      WHERE fv.id = custom_fields.form_version_id
      AND (fv.is_published = true OR public.is_admin_or_librarian(auth.uid()))
    )
  );

CREATE POLICY "Seuls les admins peuvent créer des champs"
  ON public.custom_fields FOR INSERT
  WITH CHECK (public.is_admin_or_librarian(auth.uid()));

CREATE POLICY "Seuls les admins peuvent modifier des champs"
  ON public.custom_fields FOR UPDATE
  USING (public.is_admin_or_librarian(auth.uid()));

CREATE POLICY "Seuls les admins peuvent supprimer des champs"
  ON public.custom_fields FOR DELETE
  USING (public.is_admin_or_librarian(auth.uid()));