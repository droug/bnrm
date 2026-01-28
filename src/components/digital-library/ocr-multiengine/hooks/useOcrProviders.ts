import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OcrProviderConfig, OcrModel, OcrProvider } from "../types";
import { useToast } from "@/hooks/use-toast";

export function useOcrProviders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les configurations des fournisseurs
  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ['ocr-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ocr_provider_configs')
        .select('*')
        .order('provider');
      
      if (error) throw error;
      return data as unknown as OcrProviderConfig[];
    }
  });

  // Récupérer les modèles OCR
  const { data: models, isLoading: modelsLoading } = useQuery({
    queryKey: ['ocr-models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ocr_models')
        .select('*')
        .eq('is_active', true)
        .order('provider, is_default desc');
      
      if (error) throw error;
      return data as unknown as OcrModel[];
    }
  });

  // Mettre à jour la configuration d'un fournisseur
  const updateProviderMutation = useMutation({
    mutationFn: async (config: Partial<OcrProviderConfig> & { id: string }) => {
      const { data, error } = await supabase
        .from('ocr_provider_configs')
        .update({
          is_enabled: config.is_enabled,
          base_url: config.base_url,
          default_options: config.default_options,
          rate_limit_per_minute: config.rate_limit_per_minute,
          rate_limit_per_day: config.rate_limit_per_day,
        })
        .eq('id', config.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocr-providers'] });
      toast({
        title: "Configuration mise à jour",
        description: "Les paramètres du fournisseur OCR ont été sauvegardés."
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

  // Obtenir les fournisseurs activés
  const getEnabledProviders = () => {
    return providers?.filter(p => p.is_enabled) || [];
  };

  // Obtenir un fournisseur par type
  const getProvider = (provider: OcrProvider) => {
    return providers?.find(p => p.provider === provider);
  };

  // Obtenir les modèles pour un fournisseur
  const getModelsForProvider = (provider: OcrProvider) => {
    return models?.filter(m => m.provider === provider) || [];
  };

  // Obtenir le modèle par défaut pour un fournisseur
  const getDefaultModel = (provider: OcrProvider) => {
    return models?.find(m => m.provider === provider && m.is_default);
  };

  return {
    providers,
    models,
    isLoading: providersLoading || modelsLoading,
    updateProvider: updateProviderMutation.mutate,
    isUpdating: updateProviderMutation.isPending,
    getEnabledProviders,
    getProvider,
    getModelsForProvider,
    getDefaultModel
  };
}
