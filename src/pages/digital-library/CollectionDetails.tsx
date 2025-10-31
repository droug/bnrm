import { useParams, useNavigate } from "react-router-dom";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, SlidersHorizontal, Calendar, Languages, FileType, ArrowUpDown } from "lucide-react";
import { useCollectionDocuments } from "@/hooks/useCollectionDocuments";
import { Skeleton } from "@/components/ui/skeleton";
import { TitleAutocomplete } from "@/components/ui/title-autocomplete";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export default function CollectionDetails() {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  
  const collectionType = (collectionId as any) || 'books';
  const {
    documents,
    loading,
    totalCount,
    currentPage,
    totalPages,
    filters,
    facets,
    updateFilters,
    goToPage,
  } = useCollectionDocuments(collectionType);

  const collectionInfo: Record<string, any> = {
    books: { 
      title: "Livres numériques", 
      description: "Ouvrages numérisés sur le patrimoine marocain, littérature classique et contemporaine",
      icon: "📚"
    },
    periodicals: { 
      title: "Revues et périodiques", 
      description: "Journaux marocains historiques, revues scientifiques et culturelles",
      icon: "📰"
    },
    manuscripts: { 
      title: "Manuscrits numérisés", 
      description: "Manuscrits arabes, berbères et hébraïques du patrimoine marocain",
      icon: "📜"
    },
    photos: { 
      title: "Photographies et cartes", 
      description: "Collections de photographies historiques, cartes anciennes et lithographies",
      icon: "🖼️"
    },
    audiovisual: { 
      title: "Archives sonores et audiovisuelles", 
      description: "Enregistrements audio, vidéos documentaires et archives orales",
      icon: "🎬"
    },
  };

  const collection = collectionInfo[collectionType] || collectionInfo.books;

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => goToPage(1)} className="cursor-pointer">
                  1
                </PaginationLink>
              </PaginationItem>
              {startPage > 2 && <PaginationEllipsis />}
            </>
          )}
          
          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => goToPage(page)}
                isActive={page === currentPage}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationLink onClick={() => goToPage(totalPages)} className="cursor-pointer">
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {collection.icon} {collection.title}
          </h1>
          <p className="text-muted-foreground mb-4">{collection.description}</p>
          <Badge variant="secondary" className="text-sm">
            {totalCount.toLocaleString()} documents
          </Badge>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />
              Filtres de recherche
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recherche par titre avec auto-complétion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TitleAutocomplete
                label="Titre"
                placeholder="Rechercher par titre..."
                value={filters.title || ''}
                onChange={(value) => updateFilters({ title: value || undefined })}
                collectionType={collectionType}
              />
              
              {collectionType === 'manuscripts' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Auteur</label>
                  <Input
                    placeholder="Rechercher par auteur..."
                    value={filters.author || ''}
                    onChange={(e) => updateFilters({ author: e.target.value || undefined })}
                  />
                </div>
              )}
            </div>

            {/* Filtres avancés */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Langue */}
              {facets.languages.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    Langue
                  </label>
                  <Select value={filters.language || 'all'} onValueChange={(v) => updateFilters({ language: v === 'all' ? undefined : v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les langues</SelectItem>
                      {facets.languages.map(lang => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Type de document */}
              {facets.types.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <FileType className="h-4 w-4" />
                    Type
                  </label>
                  <Select value={filters.documentType || 'all'} onValueChange={(v) => updateFilters({ documentType: v === 'all' ? undefined : v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      {facets.types.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Support (pour manuscrits) */}
              {collectionType === 'manuscripts' && facets.materials.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Support</label>
                  <Select value={filters.material || 'all'} onValueChange={(v) => updateFilters({ material: v === 'all' ? undefined : v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les supports</SelectItem>
                      {facets.materials.map(mat => (
                        <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Filtres de date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date de début
                </label>
                <Input
                  type={collectionType === 'manuscripts' ? 'number' : 'date'}
                  placeholder={collectionType === 'manuscripts' ? 'Année' : 'Date'}
                  value={filters.dateFrom || ''}
                  onChange={(e) => updateFilters({ dateFrom: e.target.value || undefined })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date de fin
                </label>
                <Input
                  type={collectionType === 'manuscripts' ? 'number' : 'date'}
                  placeholder={collectionType === 'manuscripts' ? 'Année' : 'Date'}
                  value={filters.dateTo || ''}
                  onChange={(e) => updateFilters({ dateTo: e.target.value || undefined })}
                />
              </div>
            </div>

            {/* Tri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Trier par
                </label>
                <Select value={filters.sortBy || 'created_at'} onValueChange={(v) => updateFilters({ sortBy: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Titre</SelectItem>
                    {collectionType === 'manuscripts' && <SelectItem value="author">Auteur</SelectItem>}
                    <SelectItem value="created_at">Date d'ajout</SelectItem>
                    {collectionType !== 'manuscripts' && <SelectItem value="published_at">Date de publication</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Ordre</label>
                <Select value={filters.sortOrder || 'desc'} onValueChange={(v) => updateFilters({ sortOrder: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Croissant</SelectItem>
                    <SelectItem value="desc">Décroissant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => updateFilters({ 
                  title: undefined, 
                  author: undefined, 
                  dateFrom: undefined, 
                  dateTo: undefined,
                  language: undefined,
                  documentType: undefined,
                  material: undefined,
                  sortBy: 'created_at',
                  sortOrder: 'desc'
                })}
              >
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Liste des documents */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-10 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <p className="text-muted-foreground">Aucun document trouvé avec ces critères.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {documents.map((doc: any) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      {doc.thumbnail_url && (
                        <img 
                          src={doc.thumbnail_url} 
                          alt={doc.title}
                          className="w-24 h-32 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{doc.title}</h3>
                        {doc.author && (
                          <p className="text-sm text-muted-foreground mb-2">{doc.author}</p>
                        )}
                        {doc.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {doc.description}
                          </p>
                        )}
                        <div className="flex gap-2 flex-wrap mb-3">
                          {doc.language && (
                            <Badge variant="outline" className="text-xs">
                              {doc.language}
                            </Badge>
                          )}
                          {doc.material && (
                            <Badge variant="outline" className="text-xs">
                              {doc.material}
                            </Badge>
                          )}
                          {doc.publication_year && (
                            <Badge variant="outline" className="text-xs">
                              {doc.publication_year}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => navigate(`/digital-library/document/${doc.id}`)}
                            size="sm"
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Voir les détails
                          </Button>
                          {collectionType === 'manuscripts' && (
                            <Button 
                              variant="outline"
                              onClick={() => navigate(`/manuscript-reader/${doc.id}`)}
                              size="sm"
                            >
                              Consulter
                            </Button>
                          )}
                          {collectionType !== 'manuscripts' && doc.file_url && (
                            <Button 
                              variant="outline"
                              onClick={() => navigate(`/digital-library/book-reader/${doc.id}`)}
                              size="sm"
                            >
                              Consulter
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {renderPagination()}
          </>
        )}
      </div>
    </DigitalLibraryLayout>
  );
}
