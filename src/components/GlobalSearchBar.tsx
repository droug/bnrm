import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface QuickSuggestion {
  id: string;
  title: string;
  type: 'livre' | 'manuscrit' | 'périodique';
  typeLabel: string;
}

export default function GlobalSearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<QuickSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const timeout = setTimeout(() => {
      fetchQuickSuggestions(query);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const fetchQuickSuggestions = async (searchQuery: string) => {
    setLoading(true);
    try {
      const allSuggestions: QuickSuggestion[] = [];

      // 2-3 livres (table content)
      const { data: contentData } = await supabase
        .from('content')
        .select('id, title, content_type')
        .ilike('title', `%${searchQuery}%`)
        .eq('status', 'published')
        .eq('is_visible', true)
        .limit(2);

      if (contentData) {
        contentData.forEach(item => {
          allSuggestions.push({
            id: item.id,
            title: item.title,
            type: 'livre',
            typeLabel: 'Livre',
          });
        });
      }

      // 2-3 manuscrits
      const { data: manuscriptData } = await supabase
        .from('manuscripts')
        .select('id, title')
        .ilike('title', `%${searchQuery}%`)
        .eq('is_visible', true)
        .limit(2);

      if (manuscriptData) {
        manuscriptData.forEach(item => {
          allSuggestions.push({
            id: item.id,
            title: item.title,
            type: 'manuscrit',
            typeLabel: 'Manuscrit',
          });
        });
      }

      // 2-3 périodiques
      const { data: periodicalData } = await supabase
        .from('content')
        .select('id, title')
        .ilike('title', `%${searchQuery}%`)
        .eq('status', 'published')
        .eq('is_visible', true)
        .limit(2);

      if (periodicalData) {
        periodicalData.forEach(item => {
          allSuggestions.push({
            id: item.id,
            title: item.title,
            type: 'périodique',
            typeLabel: 'Périodique',
          });
        });
      }

      setSuggestions(allSuggestions.slice(0, 6));
      setOpen(allSuggestions.length > 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      navigate(`/digital-library/search?title=${encodeURIComponent(query)}`);
      setOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: QuickSuggestion) => {
    navigate(`/digital-library/document/${suggestion.id}`);
    setOpen(false);
    setQuery("");
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              type="text"
              placeholder="Rechercher un document, un auteur, un sujet..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pr-24 pl-10"
              aria-label="Barre de recherche globale"
              aria-describedby="search-help"
              role="searchbox"
              aria-autocomplete="list"
              aria-controls="search-suggestions"
              aria-expanded={open}
            />
            <span id="search-help" className="sr-only">
              Tapez au moins 2 caractères pour voir les suggestions
            </span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {loading && (
              <Loader2 className="absolute right-16 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <Button 
              type="submit" 
              size="sm" 
              className="absolute right-1 top-1/2 -translate-y-1/2"
            >
              Rechercher
            </Button>
          </div>
        </PopoverTrigger>
        {suggestions.length > 0 && (
          <PopoverContent 
            className="w-full p-0" 
            align="start" 
            sideOffset={5}
            id="search-suggestions"
            role="listbox"
            aria-label="Suggestions de recherche"
          >
            <Command>
              <CommandList>
                <CommandGroup heading="Suggestions rapides" role="group">
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion.id}
                      onSelect={() => handleSuggestionClick(suggestion)}
                      className="flex items-center justify-between cursor-pointer"
                      role="option"
                      aria-label={`${suggestion.title} - ${suggestion.typeLabel}`}
                    >
                      <span className="truncate flex-1">{suggestion.title}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {suggestion.typeLabel}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
    </form>
  );
}
