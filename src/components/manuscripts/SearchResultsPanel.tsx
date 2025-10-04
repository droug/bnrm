import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, ChevronRight, FileText } from "lucide-react";
import { SearchResult } from "@/hooks/useManuscriptSearch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface SearchResultsPanelProps {
  results: SearchResult[];
  searchQuery: string;
  onResultClick: (result: SearchResult) => void;
  highlightText: (text: string, query: string) => string;
}

export function SearchResultsPanel({ results, searchQuery, onResultClick, highlightText }: SearchResultsPanelProps) {
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleResultClick = (result: SearchResult) => {
    setSelectedResult(result);
    setIsOpen(true);
  };

  const navigateToManuscript = () => {
    if (selectedResult) {
      onResultClick(selectedResult);
      setIsOpen(false);
    }
  };

  if (results.length === 0) return null;

  return (
    <>
      <Card className="fixed right-4 top-20 bottom-4 w-96 bg-background/95 backdrop-blur shadow-lg overflow-hidden flex flex-col z-50">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Résultats dans le texte
            </h3>
            <Badge variant="secondary">
              {results.length} résultat{results.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result)}
                className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 
                      className="font-medium text-sm leading-tight flex-1"
                      dangerouslySetInnerHTML={{ __html: highlightText(result.title, searchQuery) }}
                    />
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  </div>

                  {result.author && (
                    <p className="text-xs text-muted-foreground">
                      Par: <span dangerouslySetInnerHTML={{ __html: highlightText(result.author, searchQuery) }} />
                    </p>
                  )}

                  {result.description && (
                    <p 
                      className="text-xs text-muted-foreground line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: highlightText(result.description, searchQuery) }}
                    />
                  )}

                  <div className="flex gap-1 flex-wrap">
                    {result.language && (
                      <Badge variant="outline" className="text-xs">
                        {result.language}
                      </Badge>
                    )}
                    {result.period && (
                      <Badge variant="outline" className="text-xs">
                        {result.period}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedResult && (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl">{selectedResult.title}</SheetTitle>
                <SheetDescription>
                  {selectedResult.author && `Par ${selectedResult.author}`}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {selectedResult.thumbnail_url && (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img
                      src={selectedResult.thumbnail_url}
                      alt={selectedResult.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p 
                      className="text-sm text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: highlightText(selectedResult.description || '', searchQuery) }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {selectedResult.language && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1">Langue</h4>
                        <p className="text-sm">{selectedResult.language}</p>
                      </div>
                    )}
                    {selectedResult.period && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1">Période</h4>
                        <p className="text-sm">{selectedResult.period}</p>
                      </div>
                    )}
                    {selectedResult.genre && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1">Genre</h4>
                        <p className="text-sm">{selectedResult.genre}</p>
                      </div>
                    )}
                    {selectedResult.cote && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1">Cote</h4>
                        <p className="text-sm">{selectedResult.cote}</p>
                      </div>
                    )}
                    {selectedResult.source && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1">Source</h4>
                        <p className="text-sm">{selectedResult.source}</p>
                      </div>
                    )}
                    {selectedResult.publication_year && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1">Année</h4>
                        <p className="text-sm">{selectedResult.publication_year}</p>
                      </div>
                    )}
                  </div>

                  {selectedResult.material && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2">Matériau</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          {selectedResult.material}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={navigateToManuscript} className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    Consulter le manuscrit
                  </Button>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Fermer
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}