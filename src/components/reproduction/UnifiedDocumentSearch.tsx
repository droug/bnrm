import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, BookOpen, FileText, Scroll, Library, Plus, Check, Loader2 } from "lucide-react";
import { useUnifiedDocumentIndex, UnifiedDocument } from "@/hooks/useUnifiedDocumentIndex";
import { SearchPagination } from "@/components/ui/search-pagination";

interface UnifiedDocumentSearchProps {
  onSelectDocument: (document: UnifiedDocument) => void;
  selectedDocumentIds?: string[];
  showDigitizedOnly?: boolean;
}

const sourceTypeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  digital_library: { label: "Bibliothèque numérique", icon: <BookOpen className="h-4 w-4" />, color: "bg-blue-100 text-blue-800" },
  cbn: { label: "Catalogue CBN", icon: <Library className="h-4 w-4" />, color: "bg-green-100 text-green-800" },
  manuscript: { label: "Manuscrit", icon: <Scroll className="h-4 w-4" />, color: "bg-amber-100 text-amber-800" },
  cbm: { label: "Catalogue CBM", icon: <FileText className="h-4 w-4" />, color: "bg-purple-100 text-purple-800" },
};

export function UnifiedDocumentSearch({ 
  onSelectDocument, 
  selectedDocumentIds = [],
  showDigitizedOnly = false 
}: UnifiedDocumentSearchProps) {
  const { loading, documents, totalCount, searchDocuments } = useUnifiedDocumentIndex();
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [digitizedOnly, setDigitizedOnly] = useState(showDigitizedOnly);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    // Charger les documents initiaux
    performSearch();
  }, []);

  const performSearch = (page = currentPage, perPage = itemsPerPage) => {
    searchDocuments({
      query: searchQuery || undefined,
      sourceFilter: sourceFilter !== "all" ? sourceFilter : undefined,
      digitizedOnly: digitizedOnly || undefined,
      limit: perPage,
      offset: (page - 1) * perPage,
    });
  };

  const handleSearch = () => {
    setCurrentPage(1);
    performSearch(1, itemsPerPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    performSearch(page, itemsPerPage);
  };

  const handleItemsPerPageChange = (perPage: number) => {
    setItemsPerPage(perPage);
    setCurrentPage(1);
    performSearch(1, perPage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const isSelected = (docId: string) => selectedDocumentIds.includes(docId);
  
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre, auteur, cote..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les sources</SelectItem>
            <SelectItem value="digital_library">Bibliothèque numérique</SelectItem>
            <SelectItem value="cbn">Catalogue CBN</SelectItem>
            <SelectItem value="manuscript">Manuscrits</SelectItem>
            <SelectItem value="cbm">Catalogue CBM</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Checkbox
            id="digitized"
            checked={digitizedOnly}
            onCheckedChange={(checked) => setDigitizedOnly(checked as boolean)}
          />
          <label htmlFor="digitized" className="text-sm">Numérisés uniquement</label>
        </div>

        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span className="ml-2">Rechercher</span>
        </Button>
      </div>

      {/* Pagination en haut */}
      {documents.length > 0 && totalPages > 0 && (
        <SearchPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {/* Résultats */}
      <div className="space-y-2">
        {loading && documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Recherche en cours...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Aucun document trouvé</p>
            <p className="text-sm">Essayez d'autres critères de recherche</p>
          </div>
        ) : (
          documents.map((doc) => {
            const sourceInfo = sourceTypeLabels[doc.source_type] || { 
              label: doc.source_type, 
              icon: <FileText className="h-4 w-4" />,
              color: "bg-gray-100 text-gray-800"
            };
            const selected = isSelected(doc.id);

            return (
              <Card 
                key={doc.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selected ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => onSelectDocument(doc)}
              >
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="secondary" className={`text-xs ${sourceInfo.color}`}>
                        {sourceInfo.icon}
                        <span className="ml-1">{sourceInfo.label}</span>
                      </Badge>
                      {doc.is_digitized && (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                          Numérisé
                        </Badge>
                      )}
                      {doc.document_type && (
                        <Badge variant="outline" className="text-xs">
                          {doc.document_type}
                        </Badge>
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-foreground truncate">
                      {doc.title}
                    </h4>
                    {doc.title_ar && (
                      <p className="text-sm text-muted-foreground truncate" dir="rtl">
                        {doc.title_ar}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                      {doc.author && <span>Par {doc.author}</span>}
                      {doc.publication_year && <span>{doc.publication_year}</span>}
                      {doc.cote && <span className="font-mono text-xs">Cote: {doc.cote}</span>}
                    </div>
                  </div>

                  <Button 
                    variant={selected ? "default" : "outline"} 
                    size="sm"
                    className="shrink-0"
                  >
                    {selected ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Sélectionné
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Sélectionner
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination en bas */}
      {documents.length > 0 && totalPages > 0 && (
        <SearchPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}
    </div>
  );
}
