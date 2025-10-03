import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, MapPin, ExternalLink } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  author: string;
  snippet: string;
  highlights: string[];
  page?: number;
  paragraph?: number;
  matchCount: number;
}

interface SearchResultsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  results: SearchResult[];
  searchQuery: string;
  onResultClick: (result: SearchResult) => void;
}

export function SearchResultsPanel({
  isOpen,
  onClose,
  results,
  searchQuery,
  onResultClick
}: SearchResultsPanelProps) {
  const highlightText = (text: string) => {
    if (!searchQuery) return text;
    
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <mark key={index} className="bg-yellow-300 px-1 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Résultats ({results.length})
            </span>
            {searchQuery && (
              <Badge variant="secondary" className="ml-2">
                "{searchQuery}"
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          {results.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun résultat trouvé</p>
              <p className="text-sm mt-2">Essayez de modifier votre recherche</p>
            </div>
          ) : (
            <div className="space-y-4 pr-4">
              {results.map((result, index) => (
                <Card 
                  key={result.id}
                  className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-primary/30 hover:border-l-primary"
                  onClick={() => onResultClick(result)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm leading-tight mb-1">
                          {highlightText(result.title)}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {result.author}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {result.matchCount} {result.matchCount === 1 ? 'occurrence' : 'occurrences'}
                      </Badge>
                    </div>

                    {/* Snippet avec surbrillance */}
                    <div className="text-sm bg-muted/50 p-3 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">
                        {result.page && `Page ${result.page}`}
                        {result.paragraph && `, Paragraphe ${result.paragraph}`}
                      </p>
                      <p className="text-sm leading-relaxed">
                        {highlightText(result.snippet)}
                      </p>
                    </div>

                    {/* Highlights supplémentaires */}
                    {result.highlights && result.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {result.highlights.slice(0, 3).map((highlight, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {highlightText(highlight)}
                          </Badge>
                        ))}
                        {result.highlights.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{result.highlights.length - 3} plus
                          </Badge>
                        )}
                      </div>
                    )}

                    <Button size="sm" variant="ghost" className="w-full justify-between group">
                      Voir le manuscrit
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}