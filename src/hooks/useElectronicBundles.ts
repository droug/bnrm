import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ElectronicBundle {
  id: string;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  provider: string;
  provider_logo_url?: string;
  website_url?: string;
  api_base_url?: string;
  api_key_name?: string;
  api_authentication_type?: string;
  api_headers?: Record<string, string>;
  api_query_params?: Record<string, string>;
  ip_authentication?: boolean;
  ip_ranges?: string[];
  access_type?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  is_active?: boolean;
  document_count?: number;
  categories?: string[];
  subjects?: string[];
  supported_formats?: string[];
  search_endpoint?: string;
  fulltext_endpoint?: string;
  metadata_endpoint?: string;
  proxy_required?: boolean;
  proxy_url?: string;
  notes?: string;
  contact_email?: string;
  contact_phone?: string;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export function useElectronicBundles() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bundles, isLoading, error } = useQuery({
    queryKey: ['electronic-bundles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('electronic_bundles')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as ElectronicBundle[];
    }
  });

  const { data: activeBundles } = useQuery({
    queryKey: ['electronic-bundles-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('electronic_bundles')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as ElectronicBundle[];
    }
  });

  const createBundle = useMutation({
    mutationFn: async (bundle: Omit<ElectronicBundle, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('electronic_bundles')
        .insert(bundle)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['electronic-bundles'] });
      queryClient.invalidateQueries({ queryKey: ['electronic-bundles-active'] });
      toast({ title: "Bouquet créé avec succès" });
    },
    onError: (error) => {
      toast({ 
        title: "Erreur", 
        description: "Impossible de créer le bouquet", 
        variant: "destructive" 
      });
      console.error(error);
    }
  });

  const updateBundle = useMutation({
    mutationFn: async ({ id, ...bundle }: Partial<ElectronicBundle> & { id: string }) => {
      const { data, error } = await supabase
        .from('electronic_bundles')
        .update(bundle)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['electronic-bundles'] });
      queryClient.invalidateQueries({ queryKey: ['electronic-bundles-active'] });
      toast({ title: "Bouquet mis à jour" });
    },
    onError: (error) => {
      toast({ 
        title: "Erreur", 
        description: "Impossible de mettre à jour le bouquet", 
        variant: "destructive" 
      });
      console.error(error);
    }
  });

  const deleteBundle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('electronic_bundles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['electronic-bundles'] });
      queryClient.invalidateQueries({ queryKey: ['electronic-bundles-active'] });
      toast({ title: "Bouquet supprimé" });
    },
    onError: (error) => {
      toast({ 
        title: "Erreur", 
        description: "Impossible de supprimer le bouquet", 
        variant: "destructive" 
      });
      console.error(error);
    }
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('electronic_bundles')
        .update({ is_active: !is_active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['electronic-bundles'] });
      queryClient.invalidateQueries({ queryKey: ['electronic-bundles-active'] });
      toast({ title: "Statut mis à jour" });
    }
  });

  return {
    bundles,
    activeBundles,
    isLoading,
    error,
    createBundle,
    updateBundle,
    deleteBundle,
    toggleActive
  };
}
