import { supabase } from "@/integrations/supabase/client";

interface GedDocumentData {
  documentId: string;
  documentTitle: string;
  documentType: string;
  description?: string;
  fileUrl?: string | null;
  fileName?: string;
  fileMimeType?: string;
  fileSizeBytes?: number;
  thumbnailUrl?: string | null;
  tags?: string[];
  keywords?: string[];
  workflowStatus?: 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected';
}

/**
 * Helper pour intégrer les documents de la bibliothèque numérique dans la GED
 * Enregistre automatiquement les documents, gère les versions et le workflow
 */
export async function registerDocumentInGed(data: GedDocumentData): Promise<{ success: boolean; gedDocumentId?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Utilisateur non authentifié" };
    }

    // Vérifier si un document GED existe déjà pour ce document source
    const { data: existingGed } = await supabase
      .from('ged_documents')
      .select('id, version_number')
      .eq('source_table', 'digital_library_documents')
      .eq('source_record_id', data.documentId)
      .eq('is_latest_version', true)
      .maybeSingle();

    const fileName = data.fileName || `${data.documentTitle.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const filePath = data.fileUrl ? `digital-library/${data.documentId}/${fileName}` : `digital-library/${data.documentId}/metadata.json`;

    if (existingGed) {
      // Mettre à jour le document GED existant
      const { error: updateError } = await supabase
        .from('ged_documents')
        .update({
          document_title: data.documentTitle,
          description: data.description || null,
          file_url: data.fileUrl || null,
          thumbnail_url: data.thumbnailUrl || null,
          tags: data.tags || [],
          keywords: data.keywords || [],
          workflow_status: data.workflowStatus || 'draft',
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingGed.id);

      if (updateError) {
        console.error('Erreur mise à jour GED:', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true, gedDocumentId: existingGed.id };
    } else {
      // Créer un nouveau document GED
      // Le document_number est généré automatiquement par un trigger si non fourni
      const { data: newGed, error: insertError } = await supabase
        .from('ged_documents')
        .insert([{
          document_number: `GED-BN-${Date.now()}`, // Généré côté client, sera remplacé par le trigger
          document_type: 'digital_library',
          document_category: data.documentType,
          document_title: data.documentTitle,
          description: data.description || null,
          source_module: 'digital_library',
          source_table: 'digital_library_documents',
          source_record_id: data.documentId,
          file_name: fileName,
          file_path: filePath,
          file_url: data.fileUrl || null,
          file_mime_type: data.fileMimeType || 'application/pdf',
          file_size_bytes: data.fileSizeBytes || null,
          storage_location: 'supabase_storage',
          version_number: 1,
          is_latest_version: true,
          access_level: 'public',
          confidentiality_level: 1,
          status: 'active',
          workflow_status: data.workflowStatus || 'draft',
          thumbnail_url: data.thumbnailUrl || null,
          tags: data.tags || [],
          keywords: data.keywords || [],
          indexed: false,
          ocr_processed: false,
          created_by: user.id,
        }])
        .select('id')
        .single();

      if (insertError) {
        console.error('Erreur création GED:', insertError);
        return { success: false, error: insertError.message };
      }

      return { success: true, gedDocumentId: newGed.id };
    }
  } catch (error: any) {
    console.error('Erreur intégration GED:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Met à jour le statut du workflow GED pour un document
 */
export async function updateGedWorkflowStatus(
  documentId: string, 
  status: 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected',
  rejectionReason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Utilisateur non authentifié" };
    }

    const updateData: any = {
      workflow_status: status,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    if (status === 'approved' || status === 'published') {
      updateData.approved_by = user.id;
      updateData.approved_at = new Date().toISOString();
    } else if (status === 'rejected') {
      updateData.rejected_by = user.id;
      updateData.rejected_at = new Date().toISOString();
      updateData.rejection_reason = rejectionReason || null;
    }

    const { error } = await supabase
      .from('ged_documents')
      .update(updateData)
      .eq('source_table', 'digital_library_documents')
      .eq('source_record_id', documentId)
      .eq('is_latest_version', true);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Supprime le document GED associé (soft delete)
 */
export async function deleteGedDocument(documentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('ged_documents')
      .update({
        status: 'deleted',
        deletion_date: new Date().toISOString(),
      })
      .eq('source_table', 'digital_library_documents')
      .eq('source_record_id', documentId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
