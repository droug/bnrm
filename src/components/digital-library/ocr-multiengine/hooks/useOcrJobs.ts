import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OcrJob, OcrPage, OcrPreprocessingOptions, OcrProvider, OcrDocumentType } from "../types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export function useOcrJobs() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Récupérer les jobs OCR de l'utilisateur
  const { data: jobs, isLoading: jobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ['ocr-jobs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ocr_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as unknown as OcrJob[];
    },
    enabled: !!user
  });

  // Créer un nouveau job OCR
  const createJobMutation = useMutation({
    mutationFn: async (params: {
      documentType: OcrDocumentType;
      sourceFileUrl: string;
      sourceFileName: string;
      totalPages: number;
      cloudAllowed: boolean;
      autoMode: boolean;
      selectedProvider?: OcrProvider;
      languages?: string[];
      preprocessingOptions?: Partial<OcrPreprocessingOptions>;
      documentId?: string;
    }) => {
      const { data, error } = await supabase
        .from('ocr_jobs')
        .insert({
          user_id: user?.id,
          document_id: params.documentId || null,
          document_type: params.documentType,
          source_file_url: params.sourceFileUrl,
          source_file_name: params.sourceFileName,
          total_pages: params.totalPages,
          cloud_allowed: params.cloudAllowed,
          auto_mode: params.autoMode,
          selected_provider: params.selectedProvider || null,
          languages: params.languages || ['ara'],
          preprocessing_options: {
            deskew: true,
            denoise: true,
            binarization: 'adaptive',
            target_dpi: 300,
            line_segmentation: params.documentType === 'handwritten',
            ...(params.preprocessingOptions || {})
          },
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as OcrJob;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ocr-jobs'] });
      toast({
        title: "Job OCR créé",
        description: `Le traitement OCR #${data.id.substring(0, 8)} a été créé.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Récupérer les pages d'un job
  const getJobPages = async (jobId: string): Promise<OcrPage[]> => {
    const { data, error } = await supabase
      .from('ocr_pages')
      .select('*')
      .eq('job_id', jobId)
      .order('page_number');
    
    if (error) throw error;
    return data as unknown as OcrPage[];
  };

  // Mettre à jour le statut d'un job
  const updateJobStatusMutation = useMutation({
    mutationFn: async (params: { jobId: string; status: OcrJob['status']; errorMessage?: string }) => {
      const updateData: any = {
        status: params.status,
        updated_at: new Date().toISOString()
      };
      
      if (params.status === 'processing') {
        updateData.started_at = new Date().toISOString();
      } else if (params.status === 'completed' || params.status === 'failed') {
        updateData.completed_at = new Date().toISOString();
      }
      
      if (params.errorMessage) {
        updateData.error_message = params.errorMessage;
      }

      const { data, error } = await supabase
        .from('ocr_jobs')
        .update(updateData)
        .eq('id', params.jobId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocr-jobs'] });
    }
  });

  // Sauvegarder les résultats d'une page
  const savePageResultMutation = useMutation({
    mutationFn: async (params: {
      jobId: string;
      pageNumber: number;
      imageUrl?: string;
      providerUsed: OcrProvider;
      recognizedText: string;
      confidence: number;
      processingTimeMs: number;
      regions?: any;
      lineCount?: number;
    }) => {
      const { data, error } = await supabase
        .from('ocr_pages')
        .upsert({
          job_id: params.jobId,
          page_number: params.pageNumber,
          image_url: params.imageUrl,
          provider_used: params.providerUsed,
          recognized_text: params.recognizedText,
          confidence: params.confidence,
          processing_time_ms: params.processingTimeMs,
          regions: params.regions || null,
          line_count: params.lineCount || 0,
          status: 'completed'
        }, {
          onConflict: 'job_id,page_number'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Mettre à jour le compteur de pages traitées
      try {
        const { data: jobData } = await supabase
          .from('ocr_jobs')
          .select('processed_pages')
          .eq('id', params.jobId)
          .single();
        
        if (jobData) {
          await supabase
            .from('ocr_jobs')
            .update({ processed_pages: (jobData.processed_pages || 0) + 1 })
            .eq('id', params.jobId);
        }
      } catch (e) {
        console.error('Failed to update processed_pages:', e);
      }
      
      return data;
    }
  });

  // Logger une action dans l'audit
  const logAuditAction = async (params: {
    jobId?: string;
    pageId?: string;
    action: string;
    provider?: OcrProvider;
    sentToCloud?: boolean;
    cloudEndpoint?: string;
    fileHash?: string;
    fileSizeBytes?: number;
    durationMs?: number;
    requestData?: any;
    responseSummary?: any;
  }) => {
    await supabase
      .from('ocr_audit_logs')
      .insert({
        job_id: params.jobId,
        page_id: params.pageId,
        action: params.action,
        provider: params.provider,
        sent_to_cloud: params.sentToCloud || false,
        cloud_endpoint: params.cloudEndpoint,
        file_hash: params.fileHash,
        file_size_bytes: params.fileSizeBytes,
        user_id: user?.id,
        duration_ms: params.durationMs,
        request_data: params.requestData,
        response_summary: params.responseSummary
      });
  };

  return {
    jobs,
    isLoading: jobsLoading,
    refetchJobs,
    createJob: createJobMutation.mutateAsync,
    isCreating: createJobMutation.isPending,
    getJobPages,
    updateJobStatus: updateJobStatusMutation.mutate,
    savePageResult: savePageResultMutation.mutateAsync,
    logAuditAction
  };
}
