import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Types
export interface Donor {
  id: string;
  user_id?: string;
  donor_type: 'individual' | 'institution' | 'association';
  first_name?: string;
  last_name?: string;
  organization_name?: string;
  biography?: string;
  biography_ar?: string;
  photo_url?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  is_anonymous: boolean;
  is_featured: boolean;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  donor_id: string;
  donation_number?: string;
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  support_type: string;
  thematic?: string[];
  estimated_quantity?: number;
  oldest_item_date?: string;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  historical_value?: string;
  images?: string[];
  documents?: string[];
  cataloged_items_count: number;
  donation_date?: string;
  reception_date?: string;
  status: 'pending' | 'accepted' | 'cataloged' | 'rejected' | 'archived';
  validation_notes?: string;
  validated_by?: string;
  validated_at?: string;
  created_at: string;
  updated_at: string;
  donor?: Donor;
}

export interface DonationItem {
  id: string;
  donation_id: string;
  title: string;
  title_ar?: string;
  author?: string;
  publication_year?: string;
  support_type?: string;
  description?: string;
  image_url?: string;
  catalog_number?: string;
  is_digitized: boolean;
  digital_library_id?: string;
  created_at: string;
}

export interface DonationProposal {
  id: string;
  user_id?: string;
  proposal_number?: string;
  donor_type: 'individual' | 'institution' | 'association';
  first_name: string;
  last_name: string;
  organization_name?: string;
  email: string;
  phone: string;
  address?: string;
  city: string;
  country?: string;
  support_type: string;
  thematics?: string[];
  estimated_books_count?: number;
  estimated_pages_count?: number;
  oldest_item_date?: string;
  collection_description: string;
  historical_value?: string;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  documents?: string[];
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'converted';
  review_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  converted_donation_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DonorFilters {
  search?: string;
  donorType?: string;
  status?: string;
  isFeatured?: boolean;
}

export interface DonationFilters {
  search?: string;
  donorId?: string;
  supportType?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  oldestItemDateFrom?: string;
  oldestItemDateTo?: string;
}

// Hook pour les donateurs publics (page vitrine)
export function usePublicDonors() {
  return useQuery({
    queryKey: ['public-donors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donors')
        .select('*')
        .eq('status', 'active')
        .eq('is_anonymous', false)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Donor[];
    }
  });
}

// Hook pour les donateurs (admin)
export function useDonors(filters?: DonorFilters) {
  return useQuery({
    queryKey: ['donors', filters],
    queryFn: async () => {
      let query = supabase
        .from('donors')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters?.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,organization_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }
      if (filters?.donorType) {
        query = query.eq('donor_type', filters.donorType);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.isFeatured !== undefined) {
        query = query.eq('is_featured', filters.isFeatured);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Donor[];
    }
  });
}

// Hook pour un donateur spécifique
export function useDonor(id?: string) {
  return useQuery({
    queryKey: ['donor', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('donors')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Donor | null;
    },
    enabled: !!id
  });
}

// Hook pour les donations
export function useDonations(filters?: DonationFilters) {
  return useQuery({
    queryKey: ['donations', filters],
    queryFn: async () => {
      let query = supabase
        .from('donations')
        .select(`
          *,
          donor:donors(*)
        `)
        .order('created_at', { ascending: false });
      
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,donation_number.ilike.%${filters.search}%`);
      }
      if (filters?.donorId) {
        query = query.eq('donor_id', filters.donorId);
      }
      if (filters?.supportType) {
        query = query.eq('support_type', filters.supportType);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.dateFrom) {
        query = query.gte('donation_date', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('donation_date', filters.dateTo);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as (Donation & { donor: Donor })[];
    }
  });
}

// Hook pour les donations d'un donateur
export function useDonorDonations(donorId?: string) {
  return useQuery({
    queryKey: ['donor-donations', donorId],
    queryFn: async () => {
      if (!donorId) return [];
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('donor_id', donorId)
        .order('donation_date', { ascending: false });
      
      if (error) throw error;
      return data as Donation[];
    },
    enabled: !!donorId
  });
}

// Hook pour les items d'une donation
export function useDonationItems(donationId?: string) {
  return useQuery({
    queryKey: ['donation-items', donationId],
    queryFn: async () => {
      if (!donationId) return [];
      const { data, error } = await supabase
        .from('donation_items')
        .select('*')
        .eq('donation_id', donationId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DonationItem[];
    },
    enabled: !!donationId
  });
}

// Hook pour les propositions de dons
export function useDonationProposals(status?: string) {
  return useQuery({
    queryKey: ['donation-proposals', status],
    queryFn: async () => {
      let query = supabase
        .from('donation_proposals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as DonationProposal[];
    }
  });
}

// Hook pour les propositions de l'utilisateur connecté
export function useMyProposals() {
  return useQuery({
    queryKey: ['my-proposals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('donation_proposals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DonationProposal[];
    }
  });
}

// Hook pour l'espace donateur (mon profil donateur)
export function useMyDonorProfile() {
  return useQuery({
    queryKey: ['my-donor-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('donors')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Donor | null;
    }
  });
}

// Mutations
export function useMecenatMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createDonor = useMutation({
    mutationFn: async (donor: Partial<Donor>) => {
      const { data, error } = await supabase
        .from('donors')
        .insert(donor as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      toast({ title: "Donateur créé avec succès" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const updateDonor = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Donor> & { id: string }) => {
      const { data, error } = await supabase
        .from('donors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      queryClient.invalidateQueries({ queryKey: ['donor'] });
      toast({ title: "Donateur mis à jour" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const createDonation = useMutation({
    mutationFn: async (donation: Partial<Donation>) => {
      const { data, error } = await supabase
        .from('donations')
        .insert(donation as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      toast({ title: "Donation créée avec succès" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const updateDonation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Donation> & { id: string }) => {
      const { data, error } = await supabase
        .from('donations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      toast({ title: "Donation mise à jour" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const createProposal = useMutation({
    mutationFn: async (proposal: Partial<DonationProposal>) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('donation_proposals')
        .insert({ ...proposal, user_id: user?.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donation-proposals'] });
      queryClient.invalidateQueries({ queryKey: ['my-proposals'] });
      toast({ title: "Proposition envoyée avec succès" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const updateProposal = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DonationProposal> & { id: string }) => {
      const { data, error } = await supabase
        .from('donation_proposals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donation-proposals'] });
      queryClient.invalidateQueries({ queryKey: ['my-proposals'] });
      toast({ title: "Proposition mise à jour" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  return {
    createDonor,
    updateDonor,
    createDonation,
    updateDonation,
    createProposal,
    updateProposal
  };
}
