import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar as CalendarIcon, Clock, Users, Trash2, Plus, CheckCircle, AlertCircle, Pencil } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { BookingData, EventSlot } from "../BookingWizard";

interface StepDateTimeProps {
  data: BookingData;
  onUpdate: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

export default function StepDateTime({ data, onUpdate }: StepDateTimeProps) {
  const [slots, setSlots] = useState<EventSlot[]>(data.eventSlots || []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<EventSlot | null>(null);
  const [newSlot, setNewSlot] = useState<EventSlot>({
    id: '',
    date: new Date(),
    startTime: "09:00",
    endTime: "18:00",
    participants: 1
  });

  // Récupérer les infos de l'espace sélectionné
  const { data: selectedSpace } = useQuery({
    queryKey: ['cultural-space', data.spaceId],
    queryFn: async () => {
      if (!data.spaceId) return null;
      const { data: space, error } = await supabase
        .from('cultural_spaces')
        .select('*')
        .eq('id', data.spaceId)
        .single();
      
      if (error) throw error;
      return space;
    },
    enabled: !!data.spaceId
  });

  // Synchroniser les slots avec les données du formulaire
  useEffect(() => {
    onUpdate({ eventSlots: slots });
  }, [slots]);

  // Ouvrir la modale pour ajouter un créneau
  const openAddSlotDialog = () => {
    if (slots.length >= 10) {
      toast.error("Maximum 10 créneaux autorisés");
      return;
    }
    setEditingSlot(null);
    setNewSlot({
      id: `slot-${Date.now()}`,
      date: new Date(),
      startTime: "09:00",
      endTime: "18:00",
      participants: 1
    });
    setIsDialogOpen(true);
  };

  // Ouvrir la modale pour modifier un créneau
  const openEditSlotDialog = (slot: EventSlot) => {
    setEditingSlot(slot);
    setNewSlot({ ...slot });
    setIsDialogOpen(true);
  };

  // Confirmer l'ajout ou la modification du créneau
  const confirmSlot = () => {
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime || !newSlot.participants) {
      toast.error("Veuillez compléter tous les champs");
      return;
    }

    if (editingSlot) {
      // Modification
      setSlots(slots.map(slot => slot.id === editingSlot.id ? newSlot : slot));
      toast.success("Créneau modifié");
    } else {
      // Ajout
      setSlots([...slots, newSlot]);
      toast.success("Créneau ajouté");
    }
    
    setIsDialogOpen(false);
    setEditingSlot(null);
  };

  // Supprimer un créneau
  const removeSlot = (id: string) => {
    if (slots.length === 1) {
      toast.error("Au moins un créneau est requis");
      return;
    }

    setSlots(slots.filter(slot => slot.id !== id));
    toast.success("Créneau supprimé");
  };

  // Mettre à jour un créneau
  const updateSlot = (id: string, updates: Partial<EventSlot>) => {
    setSlots(slots.map(slot => 
      slot.id === id ? { ...slot, ...updates } : slot
    ));
  };

  // Vérifier les chevauchements
  const checkOverlaps = (currentSlot: EventSlot): boolean => {
    for (const slot of slots) {
      if (slot.id === currentSlot.id) continue;
      
      // Même date
      if (format(slot.date, 'yyyy-MM-dd') === format(currentSlot.date, 'yyyy-MM-dd')) {
        const slotStart = slot.startTime;
        const slotEnd = slot.endTime;
        const currentStart = currentSlot.startTime;
        const currentEnd = currentSlot.endTime;
        
        // Vérifier le chevauchement
        if (
          (currentStart < slotEnd && currentEnd > slotStart) ||
          (slotStart < currentEnd && slotEnd > currentStart)
        ) {
          return true;
        }
      }
    }
    return false;
  };

  // Calculer le total de participants
  const totalParticipants = slots.reduce((sum, slot) => sum + (slot.participants || 0), 0);

  // Validation de la capacité
  const capacityError = selectedSpace && totalParticipants > selectedSpace.capacity;

  // Validation des dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Trier les créneaux par date et heure
  const sortedSlots = [...slots].sort((a, b) => {
    const dateCompare = a.date.getTime() - b.date.getTime();
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Détails de l'événement</h2>
        <p className="text-muted-foreground">
          Renseignez les informations détaillées sur votre événement
        </p>
      </div>

      {/* Titre de l'événement */}
      <div className="space-y-2">
        <Label htmlFor="eventTitle">Titre de l'événement *</Label>
        <Input
          id="eventTitle"
          placeholder="Ex: Festival du livre africain"
          value={data.eventTitle || ""}
          onChange={(e) => onUpdate({ eventTitle: e.target.value })}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="eventDescription">Description *</Label>
        <Textarea
          id="eventDescription"
          placeholder="Décrivez votre événement, son objectif, son déroulement prévu..."
          value={data.eventDescription || ""}
          onChange={(e) => onUpdate({ eventDescription: e.target.value })}
          rows={4}
          required
        />
      </div>

      {/* Section Créneaux */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#D4AF37]" />
              Créneaux de l'événement
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Ajoutez les différents créneaux prévus pour votre événement
            </p>
          </div>
          <Button
            type="button"
            onClick={openAddSlotDialog}
            disabled={slots.length >= 10}
            className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un créneau
          </Button>
        </div>

        {/* Tableau des créneaux */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#FAFAFA]">
                <TableHead className="font-semibold text-[#002B45]">Date</TableHead>
                <TableHead className="font-semibold text-[#002B45]">Heure début</TableHead>
                <TableHead className="font-semibold text-[#002B45]">Heure fin</TableHead>
                <TableHead className="font-semibold text-[#002B45]">Participants</TableHead>
                <TableHead className="font-semibold text-[#002B45] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSlots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Aucun créneau ajouté. Cliquez sur "Ajouter un créneau" pour commencer.
                  </TableCell>
                </TableRow>
              ) : (
                sortedSlots.map((slot, index) => {
                  const hasOverlap = checkOverlaps(slot);
                  const isIncomplete = !slot.date || !slot.startTime || !slot.endTime;
                  
                  return (
                    <TableRow 
                      key={slot.id}
                      className={cn(
                        "hover:bg-[#FAFAFA]/50",
                        (hasOverlap || isIncomplete) && "bg-destructive/5"
                      )}
                    >
                      <TableCell className="font-medium">
                        {slot.date ? format(slot.date, "PPP", { locale: fr }) : "-"}
                        {(hasOverlap || isIncomplete) && (
                          <div className="text-xs text-destructive mt-1">
                            {isIncomplete && "Incomplet"}
                            {hasOverlap && !isIncomplete && "Chevauchement"}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{slot.startTime || "-"}</TableCell>
                      <TableCell>{slot.endTime || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#D4AF37]" />
                          {slot.participants}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditSlotDialog(slot)}
                            className="text-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {slots.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeSlot(slot.id);
                              }}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Total de participants */}
        {slots.length > 0 && (
          <Card className="p-4 bg-[#D4AF37]/5 border-[#D4AF37]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#D4AF37]" />
                <span className="font-semibold text-[#002B45]">Total prévu :</span>
              </div>
              <span className="text-2xl font-bold text-[#D4AF37]">
                {totalParticipants} {totalParticipants > 1 ? "personnes" : "personne"}
              </span>
            </div>
            {selectedSpace && (
              <p className="text-sm text-muted-foreground mt-2">
                Capacité de l'espace : {selectedSpace.capacity} personnes
              </p>
            )}
            {capacityError && (
              <Alert variant="destructive" className="mt-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Le nombre total de participants ({totalParticipants}) dépasse la capacité de l'espace sélectionné ({selectedSpace?.capacity} personnes).
                </AlertDescription>
              </Alert>
            )}
          </Card>
        )}
      </div>

      {/* Upload du programme */}
      <div className="space-y-2">
        <Label htmlFor="program">Programme de l'événement (PDF, Word) *</Label>
        <Input
          id="program"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const validTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              ];
              
              if (!validTypes.includes(file.type)) {
                toast.error("Format non supporté. Veuillez utiliser PDF ou Word");
                e.target.value = '';
                return;
              }
              
              if (file.size > 10 * 1024 * 1024) {
                toast.error("Le fichier ne doit pas dépasser 10 MB");
                e.target.value = '';
                return;
              }
              
              onUpdate({ programDocument: file });
              toast.success("Programme ajouté");
            }
          }}
          className="cursor-pointer"
          required
        />
        {data.programDocument && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Fichier ajouté: {(data.programDocument as File).name}</span>
          </div>
        )}
        {!data.programDocument && (
          <p className="text-sm text-muted-foreground">
            Veuillez télécharger le programme de votre événement
          </p>
        )}
      </div>

      {/* Modale d'ajout/modification de créneau */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#002B45]">
              {editingSlot ? "Modifier le créneau" : "Ajouter un créneau"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Date *
              </Label>
              <div className="border rounded-md p-3 bg-white">
                <Calendar
                  mode="single"
                  selected={newSlot.date}
                  onSelect={(date) => date && setNewSlot({ ...newSlot, date })}
                  disabled={(date) => date < today}
                  locale={fr}
                  className="pointer-events-auto"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Heure de début */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Heure de début *
                </Label>
                <Input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  className="h-11"
                />
              </div>

              {/* Heure de fin */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Heure de fin *
                </Label>
                <Input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>

            {/* Nombre de participants */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Nombre de participants *
              </Label>
              <Input
                type="number"
                min="1"
                max="500"
                value={newSlot.participants}
                onChange={(e) => setNewSlot({ ...newSlot, participants: parseInt(e.target.value) || 1 })}
                placeholder="Ex: 50"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingSlot(null);
              }}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={confirmSlot}
              className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white"
            >
              {editingSlot ? "Modifier" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
