import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OcrGroundTruth } from "../types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export function useOcrGroundTruth(jobId?: string) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Récupérer les corrections pour un job
  const { data: corrections, isLoading } = useQuery({
    queryKey: ['ocr-ground-truth', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      
      const { data, error } = await supabase
        .from('ocr_ground_truth')
        .select('*')
        .eq('job_id', jobId)
        .order('page_number, line_index');
      
      if (error) throw error;
      return data as unknown as OcrGroundTruth[];
    },
    enabled: !!jobId
  });

  // Ajouter une correction
  const addCorrectionMutation = useMutation({
    mutationFn: async (params: {
      jobId: string;
      pageId?: string;
      pageNumber: number;
      lineId?: string;
      lineIndex?: number;
      bbox?: { x: number; y: number; width: number; height: number };
      recognizedText: string;
      correctedText: string;
      correctionType?: 'spelling' | 'segmentation' | 'missing' | 'extra';
    }) => {
      const { data, error } = await supabase
        .from('ocr_ground_truth')
        .insert({
          job_id: params.jobId,
          page_id: params.pageId,
          page_number: params.pageNumber,
          line_id: params.lineId,
          line_index: params.lineIndex,
          bbox: params.bbox,
          recognized_text: params.recognizedText,
          corrected_text: params.correctedText,
          correction_type: params.correctionType,
          created_by: user?.id,
          is_validated: false
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocr-ground-truth', jobId] });
      toast({
        title: "Correction enregistrée",
        description: "La correction a été ajoutée au jeu de données d'entraînement."
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

  // Valider une correction
  const validateCorrectionMutation = useMutation({
    mutationFn: async (correctionId: string) => {
      const { data, error } = await supabase
        .from('ocr_ground_truth')
        .update({
          is_validated: true,
          validated_by: user?.id
        })
        .eq('id', correctionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocr-ground-truth', jobId] });
      toast({
        title: "Correction validée",
        description: "La correction a été validée et peut être utilisée pour l'entraînement."
      });
    }
  });

  // Mettre à jour une correction
  const updateCorrectionMutation = useMutation({
    mutationFn: async (params: { id: string; correctedText: string }) => {
      const { data, error } = await supabase
        .from('ocr_ground_truth')
        .update({
          corrected_text: params.correctedText,
          is_validated: false // Réinitialiser la validation après modification
        })
        .eq('id', params.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocr-ground-truth', jobId] });
    }
  });

  // Supprimer une correction
  const deleteCorrectionMutation = useMutation({
    mutationFn: async (correctionId: string) => {
      const { error } = await supabase
        .from('ocr_ground_truth')
        .delete()
        .eq('id', correctionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocr-ground-truth', jobId] });
      toast({
        title: "Correction supprimée"
      });
    }
  });

  // Statistiques des corrections
  const getStats = () => {
    if (!corrections) return { total: 0, validated: 0, pending: 0 };
    
    const validated = corrections.filter(c => c.is_validated).length;
    return {
      total: corrections.length,
      validated,
      pending: corrections.length - validated
    };
  };

  return {
    corrections,
    isLoading,
    stats: getStats(),
    addCorrection: addCorrectionMutation.mutateAsync,
    validateCorrection: validateCorrectionMutation.mutate,
    updateCorrection: updateCorrectionMutation.mutate,
    deleteCorrection: deleteCorrectionMutation.mutate,
    isAdding: addCorrectionMutation.isPending
  };
}
