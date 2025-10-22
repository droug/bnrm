import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, Users, Square, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { BookingData } from "../BookingWizard";

interface StepSpaceSelectionProps {
  data: BookingData;
  onUpdate: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

export default function StepSpaceSelection({ data, onUpdate }: StepSpaceSelectionProps) {
  const [open, setOpen] = useState(false);
  
  const { data: spaces, isLoading } = useQuery({
    queryKey: ['cultural-spaces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cultural_spaces')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const selectedSpace = spaces?.find(s => s.id === data.spaceId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Sélection de l'espace</h2>
        <p className="text-muted-foreground">
          Choisissez l'espace qui convient le mieux à votre événement
        </p>
      </div>

      <div className="space-y-2">
        <Label>Espace *</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-auto min-h-[2.5rem]"
            >
              {selectedSpace ? (
                <span className="text-left">{selectedSpace.name}</span>
              ) : (
                <span className="text-muted-foreground">Sélectionner un espace...</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Rechercher un espace..." />
              <CommandEmpty>Aucun espace trouvé.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-auto">
                {spaces?.map((space) => (
                  <CommandItem
                    key={space.id}
                    value={space.name}
                    onSelect={() => {
                      onUpdate({ spaceId: space.id });
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        data.spaceId === space.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {space.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Affichage des détails de l'espace sélectionné */}
      {selectedSpace && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{selectedSpace.name}</h3>
                {selectedSpace.floor_level && (
                  <p className="text-sm text-muted-foreground">{selectedSpace.floor_level}</p>
                )}
              </div>
              <Badge className="gap-1">
                <Check className="h-3 w-3" />
                Sélectionné
              </Badge>
            </div>

            {selectedSpace.description && (
              <p className="text-sm text-muted-foreground mb-4">
                {selectedSpace.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Capacité: {selectedSpace.capacity} personnes</span>
              </div>
              {selectedSpace.surface_m2 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Square className="h-4 w-4" />
                  <span>Surface: {selectedSpace.surface_m2} m²</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedSpace.has_stage && (
                <Badge variant="secondary" className="text-xs">Scène</Badge>
              )}
              {selectedSpace.has_sound_system && (
                <Badge variant="secondary" className="text-xs">Sonorisation</Badge>
              )}
              {selectedSpace.has_lighting && (
                <Badge variant="secondary" className="text-xs">Éclairage</Badge>
              )}
              {selectedSpace.has_projection && (
                <Badge variant="secondary" className="text-xs">Projection</Badge>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
