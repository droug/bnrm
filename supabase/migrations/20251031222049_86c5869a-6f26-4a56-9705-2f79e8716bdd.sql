-- ========================================
-- SECURITY FIX: Improve RLS policies for digital_library_documents
-- ========================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Tout le monde peut voir les documents publiés de la bibliothèque numérique" ON public.digital_library_documents;

-- Public documents viewable by all
CREATE POLICY "Public published documents viewable by all"
ON digital_library_documents FOR SELECT
USING (
  deleted_at IS NULL 
  AND publication_status = 'published'
  AND access_level = 'public'
  AND requires_authentication = false
);

-- Restricted documents for authenticated users
CREATE POLICY "Restricted documents for authenticated users"
ON digital_library_documents FOR SELECT
TO authenticated
USING (
  deleted_at IS NULL 
  AND publication_status = 'published'
  AND access_level = 'restricted'
  AND (
    has_role(auth.uid(), 'subscriber') OR 
    has_role(auth.uid(), 'researcher') OR 
    has_role(auth.uid(), 'partner') OR
    has_role(auth.uid(), 'librarian') OR 
    has_role(auth.uid(), 'admin')
  )
);

-- Confidential documents only for staff
CREATE POLICY "Confidential documents for staff only"
ON digital_library_documents FOR SELECT
TO authenticated
USING (
  deleted_at IS NULL 
  AND access_level = 'confidential'
  AND (
    has_role(auth.uid(), 'librarian') OR 
    has_role(auth.uid(), 'admin')
  )
);

-- ========================================
-- SECURITY FIX: Make storage buckets private
-- ========================================

-- Make documents bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'documents';

-- Make partnership-documents bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'partnership-documents';

-- Remove overly permissive policies
DROP POLICY IF EXISTS "Anyone can upload partnership documents" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Authenticated users can upload to documents bucket
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL
);

-- Authenticated users can view documents
CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
);

-- Admin/librarian can manage documents
CREATE POLICY "Staff can manage documents storage"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'documents' AND
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'librarian'))
);

-- Authenticated users can upload to partnership-documents
CREATE POLICY "Authenticated users can upload partnership documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'partnership-documents' AND
  auth.uid() IS NOT NULL
);

-- Authenticated users can view partnership documents
CREATE POLICY "Authenticated users can view partnership documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'partnership-documents'
);

-- Admin/librarian can manage partnership documents
CREATE POLICY "Staff can manage partnership documents storage"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'partnership-documents' AND
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'librarian'))
);