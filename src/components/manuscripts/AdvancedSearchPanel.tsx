import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleSelect } from "@/components/ui/simple-select";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter, SlidersHorizontal } from "lucide-react";
import { SearchFilters } from "@/hooks/useManuscriptSearch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface AdvancedSearchPanelProps {
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  onSearch: () => void;
  facets?: Record<string, Record<string, number>>;
}

export function AdvancedSearchPanel({ filters, setFilters, onSearch, facets }: AdvancedSearchPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const clearFilters = () => {
    setFilters({});
    onSearch();
  };

  const hasActiveFilters = Object.keys(filters).length > 0;
  const activeFilterCount = Object.keys(filters).length;

  const renderFacetButton = (title: string, facetKey: string, filterKey: keyof SearchFilters) => {
    if (!facets || !facets[facetKey]) return null;
    const facetData = facets[facetKey];
    const entries = Object.entries(facetData).filter(([key]) => key).slice(0, 5);
    if (entries.length === 0) return null;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant={filters[filterKey] ? "default" : "outline"} 
            size="sm"
            className="h-8"
          >
            {title}
            {filters[filterKey] && <Badge variant="secondary" className="ml-1 px-1 text-xs">{String(filters[filterKey]).slice(0, 15)}</Badge>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2 bg-background border shadow-lg z-50" align="start" side="bottom" sideOffset={4}>
          <div className="space-y-1">
            {entries.map(([value, count]) => (
              <button
                key={value}
                onClick={() => {
                  setFilters({ ...filters, [filterKey]: value });
                  onSearch();
                }}
                className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors ${
                  filters[filterKey] === value ? 'bg-accent font-medium' : ''
                }`}
              >
                <span className="truncate">{value}</span>
                <Badge variant="secondary" className="ml-2 shrink-0 text-xs">{count}</Badge>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="space-y-3">
      {/* Barre de filtres rapides */}
      <div className="flex flex-wrap items-center gap-2">
        {renderFacetButton('Langue', 'languages', 'language')}
        {renderFacetButton('Période', 'periods', 'period')}
        {renderFacetButton('Genre', 'genres', 'genre')}
        
        <SimpleSelect
          value={filters.status || 'all'}
          onChange={(value) => {
            setFilters({ ...filters, status: value === 'all' ? undefined : value });
            onSearch();
          }}
          options={[
            { value: 'all', label: 'Tous statuts' },
            { value: 'available', label: 'Disponible' },
            { value: 'digitization', label: 'Numérisation' },
            { value: 'reserved', label: 'Réservé' },
            { value: 'maintenance', label: 'Maintenance' },
          ]}
          placeholder="Statut"
          className="h-8 w-auto"
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="h-8"
        >
          <SlidersHorizontal className="h-4 w-4 mr-1" />
          Plus de filtres
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">{activeFilterCount}</Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Filtres avancés (repliable) */}
      {showAdvanced && (
        <div className="bg-muted/30 rounded-lg p-4 space-y-3 border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="author" className="text-xs font-medium">
                Auteur
              </Label>
              <Input
                id="author"
                placeholder="Nom de l'auteur..."
                value={filters.author || ''}
                onChange={(e) => setFilters({ ...filters, author: e.target.value })}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cote" className="text-xs font-medium">
                Cote
              </Label>
              <Input
                id="cote"
                placeholder="Numéro de cote..."
                value={filters.cote || ''}
                onChange={(e) => setFilters({ ...filters, cote: e.target.value })}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="year" className="text-xs font-medium">
                Année
              </Label>
              <Input
                id="year"
                type="number"
                placeholder="AAAA"
                value={filters.publicationYear || ''}
                onChange={(e) => setFilters({ ...filters, publicationYear: parseInt(e.target.value) || undefined })}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="source" className="text-xs font-medium">
                Source
              </Label>
              <Input
                id="source"
                placeholder="Source du manuscrit..."
                value={filters.source || ''}
                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject" className="text-xs font-medium">
                Sujet
              </Label>
              <Input
                id="subject"
                placeholder="Sujet..."
                value={filters.subject || ''}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="historicalPeriod" className="text-xs font-medium">
                Période historique
              </Label>
              <Input
                id="historicalPeriod"
                placeholder="Période..."
                value={filters.historicalPeriod || ''}
                onChange={(e) => setFilters({ ...filters, historicalPeriod: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button onClick={onSearch} size="sm" className="h-8">
              <Search className="h-3.5 w-3.5 mr-1.5" />
              Rechercher
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}