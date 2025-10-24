import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, Loader2, Users, Square, ChevronDown, CalendarDays, Image } from "lucide-react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { BookingData } from "../BookingWizard";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import SpaceGalleryModal from "../SpaceGalleryModal";

interface StepOrganizerTypeProps {
  data: BookingData;
  onUpdate: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

export default function StepOrganizerType({ data, onUpdate }: StepOrganizerTypeProps) {
  const [organizerTypeOpen, setOrganizerTypeOpen] = useState(false);
  const [spaceDropdownOpen, setSpaceDropdownOpen] = useState(false);
  const [spaceSearch, setSpaceSearch] = useState("");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const organizerTypeRef = useRef<HTMLDivElement>(null);
  const spaceRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
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

  // Fetch blocked dates for the selected space
  const { data: blockedDates } = useQuery({
    queryKey: ['space-availability', data.spaceId],
    queryFn: async () => {
      if (!data.spaceId) return [];
      
      const { data: availabilityData, error } = await supabase
        .from('space_availability')
        .select('start_date, end_date')
        .eq('space_id', data.spaceId)
        .eq('is_blocked', true)
        .gte('end_date', new Date().toISOString());
      
      if (error) throw error;
      return availabilityData || [];
    },
    enabled: !!data.spaceId
  });

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
        setSpaceDropdownOpen(false);
        setSpaceSearch("");
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

      {/* Upload pièces justificatives - obligatoire pour organisme public */}
      {data.organizerType === 'public' && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="justification" className="text-base font-semibold flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Pièces justificatives (obligatoire)
              </Label>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Documents justifiant le statut d'organisme public (Format PDF, max 10 MB)
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
      <div className="space-y-2 relative z-50" ref={spaceRef}>
        <Label>Espace *</Label>
        <div className="relative">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Rechercher un espace..."
            value={spaceDropdownOpen ? spaceSearch : (selectedSpace?.name || "")}
            onChange={(e) => setSpaceSearch(e.target.value)}
            onClick={() => {
              setSpaceDropdownOpen(true);
              setSpaceSearch("");
            }}
            className="h-11 pr-10"
            autoComplete="off"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
            onClick={() => {
              setSpaceDropdownOpen(!spaceDropdownOpen);
              if (!spaceDropdownOpen) {
                setSpaceSearch("");
                searchInputRef.current?.focus();
              }
            }}
          >
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </div>
        {spaceDropdownOpen && (
          <div className="absolute z-[9999] w-full top-full mt-1 bg-background border-2 border-primary/20 rounded-lg shadow-xl overflow-hidden">
            <div className="max-h-[300px] overflow-auto bg-background">
              {filteredSpaces && filteredSpaces.length > 0 ? (
                filteredSpaces.map((space) => (
                  <button
                    key={space.id}
                    type="button"
                    className={cn(
                      "w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b border-border/50 last:border-0",
                      data.spaceId === space.id && "bg-accent font-medium"
                    )}
                    onClick={() => {
                      onUpdate({ spaceId: space.id });
                      setSpaceSearch("");
                      setSpaceDropdownOpen(false);
                    }}
                  >
                    {space.name}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setGalleryOpen(true)}
                >
                  <Image className="h-4 w-4" />
                  Visualiser l'espace
                </Button>
                <Badge className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Sélectionné
                </Badge>
              </div>
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

      {/* Calendrier des disponibilités et prix */}
      {selectedSpace && data.organizerType && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendrier */}
          <Card className="border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Disponibilités</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Les dates non cliquables sont déjà réservées ou indisponibles
              </p>
              <Calendar
                mode="single"
                locale={fr}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (date < today) return true;
                  
                  return blockedDates?.some(blocked => {
                    const start = new Date(blocked.start_date);
                    const end = new Date(blocked.end_date);
                    return date >= start && date <= end;
                  }) || false;
                }}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Tarifs */}
          <Card className="border-2 border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Tarification</h3>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Journée complète</span>
                    <span className="text-xl font-bold text-primary">
                      {data.organizerType === 'public' 
                        ? `${selectedSpace.tariff_public_full_day} MAD`
                        : `${selectedSpace.tariff_private_full_day} MAD`
                      }
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Location pour une journée entière
                  </p>
                </div>

                {selectedSpace.allows_half_day && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Demi-journée</span>
                      <span className="text-xl font-bold text-primary">
                        {data.organizerType === 'public' 
                          ? `${selectedSpace.tariff_public_half_day} MAD`
                          : `${selectedSpace.tariff_private_half_day} MAD`
                        }
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Location pour une demi-journée
                    </p>
                  </div>
                )}

                {(selectedSpace.electricity_charge > 0 || selectedSpace.cleaning_charge > 0) && (
                  <div className="border-t pt-4 space-y-2">
                    <p className="text-sm font-medium mb-2">Frais supplémentaires :</p>
                    {selectedSpace.electricity_charge > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Électricité</span>
                        <span className="font-medium">{selectedSpace.electricity_charge} MAD</span>
                      </div>
                    )}
                    {selectedSpace.cleaning_charge > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Nettoyage</span>
                        <span className="font-medium">{selectedSpace.cleaning_charge} MAD</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <p className="text-xs text-blue-900">
                    💡 Les tarifs affichés correspondent au type d'organisme <strong>{data.organizerType === 'public' ? 'Public' : 'Privé'}</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Texte descriptif tarifs réduits */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-900 leading-relaxed">
            <strong className="font-semibold">Tarifs réduits réservés aux :</strong>
            <br />
            • Organisations non gouvernementales (ONG) nationales ou internationales œuvrant dans les domaines d'intérêt public
            <br />
            • Associations sans but lucratif
            <br />
            • Représentations diplomatiques accréditées au Maroc
            <br />
            • Organismes internationaux d'intérêt public
            <br />
            • Ministères et établissements publics à caractère administratif
          </p>
        </CardContent>
      </Card>

      {/* Gallery Modal */}
      {selectedSpace && (
        <SpaceGalleryModal
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          spaceName={selectedSpace.name}
          galleryImages={(selectedSpace.gallery_images as any) || []}
        />
      )}
    </div>
  );
}
