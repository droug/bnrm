import { supabase } from "@/integrations/supabase/client";

/**
 * Sanitize filename for storage
 */
const sanitizeFilename = (filename: string): string => {
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-zA-Z0-9.\-_]/g, '_') // Replace special chars
    .replace(/_+/g, '_') // Remove multiple underscores
    .toLowerCase();
};

/**
 * Upload a file to the professional-documents bucket
 * @param file The file to upload
 * @param folder The folder within the bucket (e.g., 'editor', 'printer')
 * @param referenceNumber A unique reference number for the request
 * @returns The public URL of the uploaded file
 */
export async function uploadProfessionalDocument(
  file: File,
  folder: string,
  referenceNumber: string
): Promise<string | null> {
  if (!file) return null;

  try {
    const timestamp = Date.now();
    const sanitizedFilename = sanitizeFilename(file.name);
    const filePath = `${folder}/${referenceNumber}/${timestamp}_${sanitizedFilename}`;

    const { data, error } = await supabase.storage
      .from('professional-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('professional-documents')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Failed to upload file:', error);
    return null;
  }
}

/**
 * Upload multiple professional documents
 * @param files Object containing file fields
 * @param folder The folder within the bucket
 * @param referenceNumber A unique reference number
 * @returns Object with file URLs
 */
export async function uploadProfessionalDocuments(
  files: {
    logoFile?: File | null;
    commerceRegistryFile?: File | null;
    cinFile?: File | null;
    photoFile?: File | null;
  },
  folder: string,
  referenceNumber: string
): Promise<{
  logo_url?: string;
  rc_attachment_url?: string;
  cin_file_url?: string;
  photo_url?: string;
}> {
  const result: {
    logo_url?: string;
    rc_attachment_url?: string;
    cin_file_url?: string;
    photo_url?: string;
  } = {};

  // Upload logo
  if (files.logoFile) {
    const url = await uploadProfessionalDocument(files.logoFile, folder, referenceNumber);
    if (url) result.logo_url = url;
  }

  // Upload RC attachment
  if (files.commerceRegistryFile) {
    const url = await uploadProfessionalDocument(files.commerceRegistryFile, folder, referenceNumber);
    if (url) result.rc_attachment_url = url;
  }

  // Upload CIN file
  if (files.cinFile) {
    const url = await uploadProfessionalDocument(files.cinFile, folder, referenceNumber);
    if (url) result.cin_file_url = url;
  }

  // Upload photo
  if (files.photoFile) {
    const url = await uploadProfessionalDocument(files.photoFile, folder, referenceNumber);
    if (url) result.photo_url = url;
  }

  return result;
}
