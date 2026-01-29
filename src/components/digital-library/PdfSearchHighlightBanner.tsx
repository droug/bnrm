import { useState, useEffect, memo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PdfSearchHighlightBannerProps {
  documentId: string;
  pageNumber: number;
  searchText: string;
  onClear?: () => void;
}

interface PageOcrData {
  match_count: number;
  preview_text: string;
}

// Cache for OCR data per page
const pageOcrCache = new Map<string, PageOcrData | null>();

export const PdfSearchHighlightBanner = memo(function PdfSearchHighlightBanner({
  documentId,
  pageNumber,
  searchText,
  onClear,
}: PdfSearchHighlightBannerProps) {
  const [matchData, setMatchData] = useState<PageOcrData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!searchText || searchText.length < 2 || !documentId) {
      setMatchData(null);
      setLoading(false);
      return;
    }

    const cacheKey = `${documentId}:${pageNumber}:${searchText}`;
    
    // Check cache first
    if (pageOcrCache.has(cacheKey)) {
      setMatchData(pageOcrCache.get(cacheKey) || null);
      setLoading(false);
      return;
    }

    const fetchOcrData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('digital_library_pages')
          .select('ocr_text')
          .eq('document_id', documentId)
          .eq('page_number', pageNumber)
          .single();

        if (error || !data?.ocr_text) {
          pageOcrCache.set(cacheKey, null);
          setMatchData(null);
          return;
        }

        const ocrText = data.ocr_text;
        const searchLower = searchText.toLowerCase();
        const textLower = ocrText.toLowerCase();
        
        // Count occurrences
        let count = 0;
        let index = 0;
        while ((index = textLower.indexOf(searchLower, index)) !== -1) {
          count++;
          index += searchText.length;
        }

        if (count > 0) {
          // Get context around first match
          const firstIndex = textLower.indexOf(searchLower);
          const start = Math.max(0, firstIndex - 30);
          const end = Math.min(ocrText.length, firstIndex + searchText.length + 30);
          let preview = ocrText.substring(start, end);
          if (start > 0) preview = '...' + preview;
          if (end < ocrText.length) preview = preview + '...';

          const result = { match_count: count, preview_text: preview };
          pageOcrCache.set(cacheKey, result);
          setMatchData(result);
        } else {
          pageOcrCache.set(cacheKey, null);
          setMatchData(null);
        }
      } catch (err) {
        console.warn('Error fetching OCR data:', err);
        setMatchData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOcrData();
  }, [documentId, pageNumber, searchText]);

  if (!matchData || loading) {
    return null;
  }

  // Highlight the search term in the preview text
  const highlightPreview = (text: string) => {
    if (!searchText) return text;
    const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      part.toLowerCase() === searchText.toLowerCase() 
        ? <mark key={i} className="bg-yellow-400 dark:bg-yellow-600 px-0.5 rounded font-bold">{part}</mark>
        : part
    );
  };

  return (
    <div 
      className="absolute top-0 left-0 right-0 z-20 bg-yellow-400/95 dark:bg-yellow-600/95 text-yellow-900 dark:text-yellow-50 p-2 shadow-lg animate-in slide-in-from-top duration-300"
      dir="auto"
    >
      <div className="flex items-center gap-2 max-w-full">
        <Search className="h-4 w-4 flex-shrink-0" />
        <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-900 dark:bg-yellow-400/20 dark:text-yellow-50 flex-shrink-0">
          {matchData.match_count} occurrence{matchData.match_count > 1 ? 's' : ''}
        </Badge>
        <p className="text-xs truncate flex-1 font-medium" title={matchData.preview_text}>
          {highlightPreview(matchData.preview_text)}
        </p>
        {onClear && (
          <button
            onClick={onClear}
            className="p-1 hover:bg-yellow-500/50 rounded flex-shrink-0"
            title="Effacer la recherche"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
});

export default PdfSearchHighlightBanner;
