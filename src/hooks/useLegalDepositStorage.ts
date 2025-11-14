import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UploadedDocument {
  url: string;
  path: string;
  fileName: string;
  size: number;
  type: string;
}

export function useLegalDepositStorage() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  /**
   * Upload un fichier vers Supabase Storage
   * @param file Le fichier à uploader
   * @param documentType Type de document (cover, cin, summary, etc.)
   * @param userId ID de l'utilisateur
   * @returns URL publique du fichier uploadé
   */
  const uploadDocument = async (
    file: File,
    documentType: string,
    userId: string
  ): Promise<UploadedDocument> => {
    try {
      setUploading(true);
      setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));

      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${documentType}-${timestamp}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      console.log('Uploading file:', { filePath, size: file.size, type: file.type });

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('legal-deposit-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      setUploadProgress(prev => ({ ...prev, [documentType]: 100 }));

      // Obtenir l'URL publique signée (valide 1 an)
      const { data: urlData } = await supabase.storage
        .from('legal-deposit-documents')
        .createSignedUrl(filePath, 31536000); // 1 an en secondes

      if (!urlData?.signedUrl) {
        throw new Error('Impossible de générer l\'URL du document');
      }

      console.log('Upload successful:', { path: data.path, url: urlData.signedUrl });

      return {
        url: urlData.signedUrl,
        path: data.path,
        fileName: file.name,
        size: file.size,
        type: file.type
      };
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(`Erreur lors de l'upload: ${error.message}`);
      throw error;
    } finally {
      setUploading(false);
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[documentType];
          return newProgress;
        });
      }, 2000);
    }
  };

  /**
   * Upload plusieurs fichiers en parallèle
   * @param files Map de fichiers à uploader {documentType: File}
   * @param userId ID de l'utilisateur
   * @returns Map des URLs uploadées {documentType: UploadedDocument}
   */
  const uploadMultipleDocuments = async (
    files: Record<string, File>,
    userId: string
  ): Promise<Record<string, UploadedDocument>> => {
    const uploadedDocs: Record<string, UploadedDocument> = {};

    try {
      setUploading(true);

      // Upload tous les fichiers en parallèle
      const uploadPromises = Object.entries(files).map(async ([docType, file]) => {
        const uploaded = await uploadDocument(file, docType, userId);
        return { docType, uploaded };
      });

      const results = await Promise.all(uploadPromises);

      // Construire l'objet de résultat
      results.forEach(({ docType, uploaded }) => {
        uploadedDocs[docType] = uploaded;
      });

      toast.success(`${results.length} document(s) uploadé(s) avec succès`);
      return uploadedDocs;
    } catch (error: any) {
      console.error('Error uploading multiple documents:', error);
      toast.error('Erreur lors de l\'upload des documents');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Supprimer un document du storage
   * @param filePath Chemin du fichier dans le storage
   */
  const deleteDocument = async (filePath: string): Promise<void> => {
    try {
      const { error } = await supabase.storage
        .from('legal-deposit-documents')
        .remove([filePath]);

      if (error) throw error;

      toast.success('Document supprimé');
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(`Erreur lors de la suppression: ${error.message}`);
      throw error;
    }
  };

  /**
   * Obtenir l'URL publique d'un document
   * @param filePath Chemin du fichier
   * @returns URL signée valide 1 an
   */
  const getDocumentUrl = async (filePath: string): Promise<string> => {
    try {
      const { data, error } = await supabase.storage
        .from('legal-deposit-documents')
        .createSignedUrl(filePath, 31536000); // 1 an

      if (error) throw error;
      if (!data?.signedUrl) throw new Error('URL non disponible');

      return data.signedUrl;
    } catch (error: any) {
      console.error('Error getting document URL:', error);
      throw error;
    }
  };

  return {
    uploading,
    uploadProgress,
    uploadDocument,
    uploadMultipleDocuments,
    deleteDocument,
    getDocumentUrl
  };
}
