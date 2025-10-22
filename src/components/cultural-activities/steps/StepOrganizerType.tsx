import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, Loader2, Users, Square, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { BookingData } from "../BookingWizard";

interface StepOrganizerTypeProps {
  data: BookingData;
  onUpdate: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

export default function StepOrganizerType({ data, onUpdate }: StepOrganizerTypeProps) {
  const [organizerTypeOpen, setOrganizerTypeOpen] = useState(false);
  const [spaceOpen, setSpaceOpen] = useState(false);
  const [spaceSearch, setSpaceSearch] = useState("");
  const organizerTypeRef = useRef<HTMLDivElement>(null);
  const spaceRef = useRef<HTMLDivElement>(null);
  
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

  const filteredSpaces = spaces?.filter(space =>
    space.name.toLowerCase().includes(spaceSearch.toLowerCase())
  );

  const organizerTypes = [
    { value: "public", label: "Public" },
    { value: "private", label: "Privé" }
  ];

  const selectedOrganizerType = organizerTypes.find(t => t.value === data.organizerType);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (organizerTypeRef.current && !organizerTypeRef.current.contains(event.target as Node)) {
        setOrganizerTypeOpen(false);
      }
      if (spaceRef.current && !spaceRef.current.contains(event.target as Node)) {
        setSpaceOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error("Veuillez sélectionner un fichier PDF");
        e.target.value = '';
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Le fichier ne doit pas dépasser 10 MB");
        e.target.value = '';
        return;
      }
      
      onUpdate({ justificationDocument: file });
      toast.success("Pièce justificative ajoutée");
    }
  };

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
        <h2 className="text-2xl font-bold mb-2">Type d'organisme & sélection de l'espace</h2>
        <p className="text-muted-foreground">
          Renseignez les informations de votre organisme et choisissez l'espace souhaité
        </p>
      </div>

      {/* Type d'organisme */}
      <div className="space-y-2 relative" ref={organizerTypeRef}>
        <Label>Type d'organisme *</Label>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between h-11 font-normal"
          onClick={() => setOrganizerTypeOpen(!organizerTypeOpen)}
        >
          {selectedOrganizerType ? (
            <span>{selectedOrganizerType.label}</span>
          ) : (
            <span className="text-muted-foreground">Sélectionner le type d'organisme</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
        {organizerTypeOpen && (
          <div className="absolute z-[9999] w-full mt-1 bg-popover border rounded-lg shadow-lg">
            {organizerTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                className={cn(
                  "w-full text-left px-4 py-2.5 hover:bg-accent transition-colors",
                  "first:rounded-t-lg last:rounded-b-lg",
                  data.organizerType === type.value && "bg-accent"
                )}
                onClick={() => {
                  onUpdate({ organizerType: type.value });
                  setOrganizerTypeOpen(false);
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Upload PDF si organisme public */}
      {data.organizerType === 'public' && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="justification" className="text-base font-semibold flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Pièce justificative (obligatoire)
              </Label>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Document officiel attestant du statut d'organisme public (Format PDF, max 10 MB)
              </p>
            </div>
            
            <Input
              id="justification"
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
            
            {data.justificationDocument && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Fichier ajouté: {(data.justificationDocument as File).name}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sélection de l'espace */}
      <div className="space-y-2 relative" ref={spaceRef}>
        <Label>Espace *</Label>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between h-auto min-h-[2.75rem] font-normal"
          onClick={() => setSpaceOpen(!spaceOpen)}
        >
          {selectedSpace ? (
            <span className="text-left">{selectedSpace.name}</span>
          ) : (
            <span className="text-muted-foreground">Sélectionner un espace...</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
        {spaceOpen && (
          <div className="absolute z-[9999] w-full mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden">
            <div className="p-2 border-b bg-popover">
              <Input
                placeholder="Rechercher un espace..."
                value={spaceSearch}
                onChange={(e) => setSpaceSearch(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="max-h-[300px] overflow-auto bg-popover">
              {filteredSpaces && filteredSpaces.length > 0 ? (
                filteredSpaces.map((space) => (
                  <button
                    key={space.id}
                    type="button"
                    className={cn(
                      "w-full text-left px-4 py-2.5 hover:bg-accent transition-colors",
                      data.spaceId === space.id && "bg-accent"
                    )}
                    onClick={() => {
                      onUpdate({ spaceId: space.id });
                      setSpaceOpen(false);
                      setSpaceSearch("");
                    }}
                  >
                    {space.name}
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Aucun espace trouvé.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Détails de l'espace sélectionné */}
      {selectedSpace && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{selectedSpace.name}</h3>
                {selectedSpace.floor_level && (
                  <p className="text-sm text-muted-foreground">{selectedSpace.floor_level}</p>
                )}
              </div>
              <Badge className="gap-1">
                <CheckCircle className="h-3 w-3" />
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
          </CardContent>
        </Card>
      )}

      {/* Calendrier des disponibilités */}
      {data.spaceId && (
        <div className="space-y-2">
          <Label>Disponibilités de l'espace</Label>
          <Card>
            <CardContent className="p-6">
              <Calendar
                mode="single"
                selected={data.eventDate}
                onSelect={(date) => onUpdate({ eventDate: date })}
                className="rounded-md border"
                disabled={(date) => date < new Date()}
              />
              <p className="text-sm text-muted-foreground mt-3">
                Sélectionnez une date pour vérifier la disponibilité
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
