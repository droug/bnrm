import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { SearchFilters } from "@/hooks/useManuscriptSearch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AdvancedSearchPanelProps {
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  onSearch: () => void;
  facets?: Record<string, Record<string, number>>;
}

export function AdvancedSearchPanel({ filters, setFilters, onSearch, facets }: AdvancedSearchPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const clearFilters = () => {
    setFilters({});
    onSearch();
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const renderFacet = (title: string, facetKey: string, filterKey: keyof SearchFilters) => {
    if (!facets || !facets[facetKey]) return null;

    const facetData = facets[facetKey];
    const entries = Object.entries(facetData).filter(([key]) => key);
    
    if (entries.length === 0) return null;

    return (
      <div className="space-y-2">
        <Label className="text-sm font-semibold">{title}</Label>
        <div className="space-y-1">
          {entries.slice(0, 10).map(([value, count]) => (
            <button
              key={value}
              onClick={() => {
                setFilters({ ...filters, [filterKey]: value });
                onSearch();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors ${
                filters[filterKey] === value ? 'bg-accent font-medium' : ''
              }`}
            >
              <span className="truncate">{value}</span>
              <Badge variant="secondary" className="ml-2 shrink-0">
                {count}
              </Badge>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="h-10"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtres avancés
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">{Object.keys(filters).length}</Badge>
          )}
          {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-10"
          >
            <X className="h-4 w-4 mr-1" />
            Effacer les filtres
          </Button>
        )}
      </div>

      {showFilters && (
        <Card className="mt-4">
          <CardContent className="pt-6 space-y-4">
        {/* Filtres de base */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="author" className="text-sm font-medium">
              Auteur
            </Label>
            <Input
              id="author"
              placeholder="Nom de l'auteur..."
              value={filters.author || ''}
              onChange={(e) => setFilters({ ...filters, author: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="cote" className="text-sm font-medium">
              Cote
            </Label>
            <Input
              id="cote"
              placeholder="Numéro de cote..."
              value={filters.cote || ''}
              onChange={(e) => setFilters({ ...filters, cote: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="year" className="text-sm font-medium">
              Année de publication
            </Label>
            <Input
              id="year"
              type="number"
              placeholder="AAAA"
              value={filters.publicationYear || ''}
              onChange={(e) => setFilters({ ...filters, publicationYear: parseInt(e.target.value) || undefined })}
              className="mt-1"
            />
          </div>
        </div>

        {/* Filtres à facettes */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>Filtres par catégorie</span>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            {renderFacet('Langue', 'languages', 'language')}
            {renderFacet('Période', 'periods', 'period')}
            {renderFacet('Genre', 'genres', 'genre')}
            {renderFacet('Auteurs', 'authors', 'author')}
          </CollapsibleContent>
        </Collapsible>

        {/* Filtres additionnels */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="source" className="text-sm font-medium">
              Source
            </Label>
            <Input
              id="source"
              placeholder="Source du manuscrit..."
              value={filters.source || ''}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              className="mt-1"
            />
          </div>

          <div className="relative z-10">
            <Label htmlFor="status" className="text-sm font-medium">
              Statut
            </Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="mt-1" id="status">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent position="item-aligned">
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="digitization">En numérisation</SelectItem>
                <SelectItem value="reserved">Réservé</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

            <Button onClick={onSearch} className="w-full">
              <Search className="h-4 w-4 mr-2" />
              Appliquer les filtres
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}