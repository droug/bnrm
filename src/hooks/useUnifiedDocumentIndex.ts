import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UnifiedDocument {
  id: string;
  source_type: string;
  source_id: string;
  title: string;
  title_ar?: string;
  author?: string;
  publication_year?: number;
  document_type?: string;
  cote?: string;
  is_digitized: boolean;
  cover_image_url?: string;
  digital_url?: string;
}

interface SearchParams {
  query?: string;
  sourceFilter?: string;
  typeFilter?: string;
  digitizedOnly?: boolean;
  limit?: number;
  offset?: number;
}

export function useUnifiedDocumentIndex() {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<UnifiedDocument[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const searchDocuments = async (params: SearchParams = {}) => {
    setLoading(true);
    try {
      // D'abord compter le total
      const { count, error: countError } = await supabase
        .from('unified_document_index')
        .select('*', { count: 'exact', head: true })
        .or(
          params.query 
            ? `title.ilike.%${params.query}%,author.ilike.%${params.query}%,cote.ilike.%${params.query}%`
            : 'id.not.is.null'
        );
      
      if (!countError && count !== null) {
        setTotalCount(count);
      }

      const { data, error } = await supabase.rpc('search_unified_documents', {
        search_query: params.query || null,
        source_filter: params.sourceFilter || null,
        type_filter: params.typeFilter || null,
        digitized_only: params.digitizedOnly ?? null,
        limit_count: params.limit || 50,
        offset_count: params.offset || 0,
      });

      if (error) throw error;
      
      setDocuments((data as UnifiedDocument[]) || []);
      return data as UnifiedDocument[];
    } catch (error) {
      console.error('Error searching documents:', error);
      toast.error("Erreur lors de la recherche");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getDocumentById = async (sourceType: string, sourceId: string): Promise<UnifiedDocument | null> => {
    try {
      const { data, error } = await supabase
        .from('unified_document_index')
        .select('*')
        .eq('source_type', sourceType)
        .eq('source_id', sourceId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching document:', error);
      return null;
    }
  };

  const syncFromSource = async (sourceType: 'digital_library' | 'cbn' | 'manuscript' | 'cbm') => {
    setLoading(true);
    try {
      const functionName = `sync_unified_from_${sourceType === 'manuscript' ? 'manuscripts' : sourceType}`;
      const { data, error } = await supabase.rpc(functionName as any);

      if (error) throw error;
      
      toast.success(`Synchronisation ${sourceType} terminée: ${data} documents`);
      return data as number;
    } catch (error) {
      console.error(`Error syncing from ${sourceType}:`, error);
      toast.error(`Erreur de synchronisation ${sourceType}`);
      return 0;
    } finally {
      setLoading(false);
    }
  };

  const syncAll = async () => {
    setLoading(true);
    const results: Record<string, number> = {};
    
    try {
      for (const source of ['digital_library', 'cbn', 'manuscripts', 'cbm'] as const) {
        const { data, error } = await supabase.rpc(`sync_unified_from_${source}` as any);
        if (!error) {
          results[source] = data as number;
        }
      }
      
      const total = Object.values(results).reduce((a, b) => a + b, 0);
      toast.success(`Synchronisation terminée: ${total} documents indexés`);
      return results;
    } catch (error) {
      console.error('Error syncing all sources:', error);
      toast.error("Erreur lors de la synchronisation globale");
      return results;
    } finally {
      setLoading(false);
    }
  };

  const getStats = async () => {
    try {
      const { data, error } = await supabase
        .from('unified_document_index')
        .select('source_type, is_digitized')
        .order('source_type');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        bySource: {} as Record<string, number>,
        digitized: 0,
      };

      data?.forEach(doc => {
        stats.bySource[doc.source_type] = (stats.bySource[doc.source_type] || 0) + 1;
        if (doc.is_digitized) stats.digitized++;
      });

      return stats;
    } catch (error) {
      console.error('Error getting stats:', error);
      return { total: 0, bySource: {}, digitized: 0 };
    }
  };

  return {
    loading,
    documents,
    totalCount,
    searchDocuments,
    getDocumentById,
    syncFromSource,
    syncAll,
    getStats,
  };
}
