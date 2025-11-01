import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, MapPin } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SearchPagination } from "@/components/ui/search-pagination";

interface SearchResult {
  id: string;
  title: string;
  author?: string;
  publisher?: string;
  year?: string;
  type?: string;
  isbn?: string;
  library_name: string;
  library_code: string;
  availability_status?: string;
  shelf_location?: string;
}

interface CBMSearchWithSelectionProps {
  searchResults: SearchResult[];
  isSearching: boolean;
  onResultsChange?: (results: SearchResult[]) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export function CBMSearchWithSelection({ 
  searchResults, 
  isSearching,
  onResultsChange,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}: CBMSearchWithSelectionProps) {
  const { toast } = useToast();
  const [documentsCache, setDocumentsCache] = useState<Record<string, any>>({});

  // Charger les documents depuis Supabase pour le cache
  useEffect(() => {
    const loadDocuments = async () => {
      const { data, error } = await supabase
        .from('cbm_catalog')
        .select('*');
      
      if (data && !error) {
        const cache = data.reduce((acc, doc) => {
          acc[doc.id] = doc;
          return acc;
        }, {} as Record<string, any>);
        setDocumentsCache(cache);
      }
    };
    
    loadDocuments();
  }, []);

  return (
    <div className="space-y-4">
      {searchResults.length > 0 && (
        <Card className="border-2 border-cbm-primary/10">
          <CardHeader>
            <CardTitle className="text-lg text-cbm-primary">
              Résultats de recherche ({totalItems})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SearchPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={onPageChange}
              onItemsPerPageChange={onItemsPerPageChange}
            />
            
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <div 
                    key={result.id}
                    className="p-4 border rounded-lg transition-all border-cbm-primary/20 bg-card hover:shadow-cbm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Title with icon */}
                        <div className="flex items-start gap-2">
                          <BookOpen className="h-5 w-5 text-cbm-primary shrink-0 mt-0.5" />
                          <h4 className="font-semibold text-base leading-tight">
                            {result.title}
                          </h4>
                        </div>
                        
                        {/* Author, Year, Publisher */}
                        <p className="text-sm text-muted-foreground">
                          {result.author && `Par ${result.author}`}
                          {result.author && result.year && ' • '}
                          {result.year}
                          {(result.author || result.year) && result.publisher && ' • '}
                          {result.publisher}
                        </p>
                        
                        {/* Library info */}
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-cbm-secondary" />
                          <span className="font-medium text-cbm-secondary">
                            {result.library_name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {result.library_code}
                          </Badge>
                        </div>
                        
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                          {result.availability_status && (
                            <Badge 
                              variant="secondary"
                              className="text-xs"
                            >
                              {result.availability_status}
                            </Badge>
                          )}
                          {result.type && (
                            <Badge variant="outline" className="text-xs">
                              {result.type}
                            </Badge>
                          )}
                          {result.shelf_location && (
                            <Badge variant="outline" className="text-xs">
                              Cote: {result.shelf_location}
                            </Badge>
                          )}
                          {result.isbn && (
                            <Badge variant="outline" className="text-xs">
                              ISBN: {result.isbn}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      
      {isSearching && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Recherche en cours dans toutes les bibliothèques...</p>
        </div>
      )}
      
      {!isSearching && searchResults.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Lancez une recherche pour afficher les résultats</p>
        </div>
      )}
    </div>
  );
}
