import { supabase } from "@/integrations/supabase/client";

export interface ReadingHistoryData {
  contentType: 'manuscript' | 'book' | 'periodical' | 'document';
  actionType: 'view' | 'download' | 'read';
  title: string;
  author?: string;
  thumbnailUrl?: string;
  lastPageRead?: number;
  readingProgress?: number;
  contentId?: string;
  manuscriptId?: string;
}

export interface FavoriteData {
  contentType: 'manuscript' | 'book' | 'periodical' | 'document';
  title: string;
  author?: string;
  thumbnailUrl?: string;
  notes?: string;
  contentId?: string;
  manuscriptId?: string;
}

export interface BookmarkData {
  pageNumber: number;
  note?: string;
  contentId?: string;
  manuscriptId?: string;
}

export interface ReviewData {
  rating: number;
  comment: string;
  contentId?: string;
  manuscriptId?: string;
}

// Track reading history
export async function trackReadingHistory(userId: string, data: ReadingHistoryData) {
  try {
    const { error } = await supabase.from('reading_history').insert({
      user_id: userId,
      content_type: data.contentType,
      action_type: data.actionType,
      title: data.title,
      author: data.author || null,
      thumbnail_url: data.thumbnailUrl || null,
      last_page_read: data.lastPageRead || null,
      reading_progress: data.readingProgress || 0,
      content_id: data.contentId || null,
      manuscript_id: data.manuscriptId || null,
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error tracking reading history:', error);
    return { success: false, error };
  }
}

// Update reading progress
export async function updateReadingProgress(
  userId: string, 
  contentId: string | undefined,
  manuscriptId: string | undefined,
  pageNumber: number, 
  totalPages: number
) {
  try {
    const progress = (pageNumber / totalPages) * 100;
    
    // Find existing history entry
    const { data: existing, error: fetchError } = await supabase
      .from('reading_history')
      .select('id')
      .eq('user_id', userId)
      .eq(contentId ? 'content_id' : 'manuscript_id', contentId || manuscriptId)
      .eq('action_type', 'read')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (existing) {
      // Update existing entry
      const { error } = await supabase
        .from('reading_history')
        .update({
          last_page_read: pageNumber,
          reading_progress: progress,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating reading progress:', error);
    return { success: false, error };
  }
}

// Toggle favorite
export async function toggleFavorite(userId: string, data: FavoriteData) {
  try {
    // Check if already favorite
    const { data: existing, error: checkError } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq(data.contentId ? 'content_id' : 'manuscript_id', data.contentId || data.manuscriptId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      // Remove from favorites
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id);

      if (error) throw error;
      return { success: true, isFavorite: false };
    } else {
      // Add to favorites
      const { error } = await supabase.from('favorites').insert({
        user_id: userId,
        content_type: data.contentType,
        title: data.title,
        author: data.author || null,
        thumbnail_url: data.thumbnailUrl || null,
        notes: data.notes || null,
        content_id: data.contentId || null,
        manuscript_id: data.manuscriptId || null,
      });

      if (error) throw error;
      return { success: true, isFavorite: true };
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return { success: false, error };
  }
}

// Check if item is favorite
export async function checkIsFavorite(
  userId: string, 
  contentId: string | undefined, 
  manuscriptId: string | undefined
) {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq(contentId ? 'content_id' : 'manuscript_id', contentId || manuscriptId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return { isFavorite: !!data };
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return { isFavorite: false };
  }
}

// Save bookmark
export async function saveBookmark(userId: string, data: BookmarkData) {
  try {
    const { error } = await supabase.from('user_bookmarks').upsert({
      user_id: userId,
      page_number: data.pageNumber,
      note: data.note || null,
      content_id: data.contentId || null,
      manuscript_id: data.manuscriptId || null,
    }, {
      onConflict: 'user_id,content_id,manuscript_id,page_number'
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error saving bookmark:', error);
    return { success: false, error };
  }
}

// Submit review
export async function submitReview(userId: string, data: ReviewData) {
  try {
    const { error } = await supabase.from('user_reviews').upsert({
      user_id: userId,
      rating: data.rating,
      comment: data.comment,
      content_id: data.contentId || null,
      manuscript_id: data.manuscriptId || null,
    }, {
      onConflict: 'user_id,content_id,manuscript_id'
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error submitting review:', error);
    return { success: false, error };
  }
}
