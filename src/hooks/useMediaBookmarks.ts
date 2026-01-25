import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface MediaBookmark {
  id: string;
  user_id: string;
  document_id: string;
  timestamp_seconds: number;
  label: string | null;
  created_at: string;
}

export function useMediaBookmarks(documentId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<MediaBookmark[]>([]);
  const [loading, setLoading] = useState(true);

  // Load bookmarks
  const loadBookmarks = useCallback(async () => {
    if (!user || !documentId) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('media_bookmarks')
        .select('*')
        .eq('document_id', documentId)
        .eq('user_id', user.id)
        .order('timestamp_seconds', { ascending: true });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  }, [user, documentId]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  // Add bookmark
  const addBookmark = useCallback(async (timestampSeconds: number, label?: string) => {
    if (!user || !documentId) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter des marque-pages",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('media_bookmarks')
        .insert({
          user_id: user.id,
          document_id: documentId,
          timestamp_seconds: timestampSeconds,
          label: label || null
        })
        .select()
        .single();

      if (error) throw error;

      setBookmarks(prev => [...prev, data].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds));
      
      toast({
        title: "Marque-page ajouté",
        description: label || `Position ${formatTime(timestampSeconds)} enregistrée`
      });

      return data;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le marque-page",
        variant: "destructive"
      });
      return null;
    }
  }, [user, documentId, toast]);

  // Update bookmark label
  const updateBookmark = useCallback(async (bookmarkId: string, label: string) => {
    try {
      const { error } = await supabase
        .from('media_bookmarks')
        .update({ label })
        .eq('id', bookmarkId);

      if (error) throw error;

      setBookmarks(prev => 
        prev.map(b => b.id === bookmarkId ? { ...b, label } : b)
      );

      toast({
        title: "Marque-page modifié",
        description: "Le libellé a été mis à jour"
      });
    } catch (error) {
      console.error('Error updating bookmark:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le marque-page",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Delete bookmark
  const deleteBookmark = useCallback(async (bookmarkId: string) => {
    try {
      const { error } = await supabase
        .from('media_bookmarks')
        .delete()
        .eq('id', bookmarkId);

      if (error) throw error;

      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
      
      toast({
        title: "Marque-page supprimé"
      });
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le marque-page",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    bookmarks,
    loading,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    refresh: loadBookmarks
  };
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
