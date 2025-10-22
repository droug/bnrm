import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Users, Square, Check } from "lucide-react";
import type { BookingData } from "../BookingWizard";

interface StepSpaceSelectionProps {
  data: BookingData;
  onUpdate: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

export default function StepSpaceSelection({ data, onUpdate }: StepSpaceSelectionProps) {
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

      <RadioGroup
        value={data.spaceId}
        onValueChange={(value) => onUpdate({ spaceId: value })}
        className="space-y-4"
      >
        {spaces?.map((space) => (
          <Card
            key={space.id}
            className={`relative cursor-pointer transition-all hover:shadow-md ${
              data.spaceId === space.id
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:border-primary/50'
            }`}
          >
            <label htmlFor={space.id} className="cursor-pointer">
              <div className="flex gap-4 p-4">
                <RadioGroupItem value={space.id} id={space.id} className="mt-1" />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{space.name}</h3>
                      {space.floor_level && (
                        <p className="text-sm text-muted-foreground">{space.floor_level}</p>
                      )}
                    </div>
                    {data.spaceId === space.id && (
                      <Badge className="gap-1">
                        <Check className="h-3 w-3" />
                        Sélectionné
                      </Badge>
                    )}
                  </div>

                  {space.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {space.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Capacité: {space.capacity} personnes</span>
                    </div>
                    {space.surface_m2 && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Square className="h-4 w-4" />
                        <span>Surface: {space.surface_m2} m²</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {space.has_stage && (
                      <Badge variant="secondary" className="text-xs">Scène</Badge>
                    )}
                    {space.has_sound_system && (
                      <Badge variant="secondary" className="text-xs">Sonorisation</Badge>
                    )}
                    {space.has_lighting && (
                      <Badge variant="secondary" className="text-xs">Éclairage</Badge>
                    )}
                    {space.has_projection && (
                      <Badge variant="secondary" className="text-xs">Projection</Badge>
                    )}
                  </div>
                </div>
              </div>
            </label>
          </Card>
        ))}
      </RadioGroup>
    </div>
  );
}
