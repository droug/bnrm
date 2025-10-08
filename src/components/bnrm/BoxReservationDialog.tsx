import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface BoxReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tariff?: {
    id_tarif: string;
    montant: number;
    devise: string;
  };
}

export function BoxReservationDialog({ 
  open, 
  onOpenChange, 
  tariff 
}: BoxReservationDialogProps) {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [boxNumber, setBoxNumber] = useState("");
  const [purpose, setPurpose] = useState("");

  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    const diff = endDate.getTime() - startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    if (!tariff) return 0;
    return tariff.montant * calculateDuration();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour réserver un box",
        variant: "destructive",
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Dates manquantes",
        description: "Veuillez sélectionner les dates de début et de fin",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const reservationData = {
        user_id: user.id,
        service_id: "S007",
        tariff_id: tariff?.id_tarif,
        status: "pending",
        is_paid: false,
        registration_data: {
          firstName: profile?.first_name || "",
          lastName: profile?.last_name || "",
          email: user.email || "",
          phone: profile?.phone || "",
          boxNumber,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          duration: calculateDuration(),
          purpose,
          totalAmount: calculateTotal(),
        },
      };

      const { data: reservation, error } = await supabase
        .from("service_registrations")
        .insert(reservationData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Réservation enregistrée",
        description: "Votre demande de réservation a été enregistrée avec succès. Vous recevrez une confirmation par email.",
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la réservation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authentification requise</DialogTitle>
            <DialogDescription>
              Veuillez vous connecter pour réserver un box.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => window.location.href = "/auth"} className="w-full">
            Se connecter / S'inscrire
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl p-0 gap-0"
        style={{
          position: 'fixed',
          top: '5vh',
          left: '50%',
          transform: 'translateX(-50%)',
          maxHeight: '90vh',
          width: '90vw',
          maxWidth: '800px',
          margin: 0,
        }}
      >
        {/* Container principal avec hauteur fixe */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '85vh', maxHeight: '650px' }}>
          {/* Header - hauteur fixe */}
          <div style={{ flexShrink: 0, padding: '16px', borderBottom: '1px solid hsl(var(--border))' }}>
            <DialogHeader>
              <DialogTitle>Réservation de Box</DialogTitle>
              <DialogDescription>
                Remplissez le formulaire pour réserver un box de travail
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Zone de contenu - scrollable */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            overflowX: 'hidden', 
            padding: '16px',
            minHeight: 0 
          }}>
            <form id="box-reservation-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-muted/30 p-3 rounded-lg space-y-3">
                <h3 className="font-semibold text-sm">Informations personnelles</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Prénom</Label>
                    <Input value={profile?.first_name || ""} disabled className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nom</Label>
                    <Input value={profile?.last_name || ""} disabled className="h-9" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Email</Label>
                  <Input value={user.email || ""} disabled className="h-9" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Téléphone</Label>
                  <Input value={profile?.phone || ""} disabled className="h-9" />
                </div>
              </div>

              <div className="bg-muted/30 p-3 rounded-lg space-y-3">
                <h3 className="font-semibold text-sm">Détails de la réservation</h3>
                
                <div className="space-y-1.5">
                  <Label htmlFor="boxNumber" className="text-xs">Numéro de box préféré (optionnel)</Label>
                  <Input
                    id="boxNumber"
                    value={boxNumber}
                    onChange={(e) => setBoxNumber(e.target.value)}
                    placeholder="Ex: B12, A05..."
                    className="h-9"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Si disponible, nous essaierons de vous attribuer ce box
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Date de début *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-9 text-xs",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          {startDate ? format(startDate, "dd/MM/yyyy", { locale: fr }) : "Sélectionner"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[100]" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Date de fin *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-9 text-xs",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          {endDate ? format(endDate, "dd/MM/yyyy", { locale: fr }) : "Sélectionner"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[100]" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) => !startDate || date <= startDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {startDate && endDate && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-lg">
                    <p className="text-xs">
                      <strong>Durée:</strong> {calculateDuration()} jour(s)
                    </p>
                    {tariff && (
                      <p className="text-xs font-semibold text-primary mt-0.5">
                        <strong>Total:</strong> {calculateTotal()} {tariff.devise}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="purpose" className="text-xs">Objet de la réservation *</Label>
                  <Textarea
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Décrivez brièvement le motif de votre réservation..."
                    required
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer - hauteur fixe */}
          <div style={{ 
            flexShrink: 0, 
            padding: '16px', 
            borderTop: '1px solid hsl(var(--border))',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            backgroundColor: 'hsl(var(--background))'
          }}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" form="box-reservation-form" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Confirmer la réservation"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
