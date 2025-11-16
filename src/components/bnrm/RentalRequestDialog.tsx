import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isBefore, startOfDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface RentalSpace {
  id: string;
  space_code: string;
  space_name: string;
  capacity: number | null;
  hourly_rate: number | null;
  half_day_rate: number | null;
  full_day_rate: number | null;
  currency: string | null;
}

interface RentalRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  space: RentalSpace;
}

interface BookedSlot {
  date: string;
  start_time: string;
  end_time: string;
}

const formSchema = z.object({
  event_title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  event_description: z.string().optional(),
  organization_name: z.string().min(2, "Le nom de l'organisation est requis"),
  organization_type: z.string().min(1, "Le type d'organisation est requis"),
  contact_person: z.string().min(2, "Le nom du contact est requis"),
  contact_email: z.string().email("Email invalide"),
  contact_phone: z.string().min(10, "Numéro de téléphone invalide"),
  event_date: z.date({ required_error: "La date est requise" }),
  start_time: z.string().min(1, "L'heure de début est requise"),
  end_time: z.string().min(1, "L'heure de fin est requise"),
  participants_count: z.number().min(1, "Le nombre de participants doit être au moins 1"),
}).refine((data) => data.start_time < data.end_time, {
  message: "L'heure de fin doit être après l'heure de début",
  path: ["end_time"],
});

const AVAILABLE_TIMES = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00"
];

export function RentalRequestDialog({ open, onOpenChange, space }: RentalRequestDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    requestNumber: string;
    eventDate: string;
    eventTitle: string;
    totalAmount: number;
  } | null>(null);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableStartTimes, setAvailableStartTimes] = useState<string[]>(AVAILABLE_TIMES);
  const [availableEndTimes, setAvailableEndTimes] = useState<string[]>(AVAILABLE_TIMES);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      event_title: "",
      event_description: "",
      organization_name: "",
      organization_type: "",
      contact_person: "",
      contact_email: "",
      contact_phone: "",
      participants_count: 1,
    },
  });

  // Fetch booked slots when dialog opens
  useEffect(() => {
    if (open) {
      fetchBookedSlots();
      // Reset submission state when dialog opens
      setSubmitted(false);
      setSubmittedData(null);
    }
  }, [open, space.id]);

  // Update available times when date changes
  useEffect(() => {
    if (selectedDate) {
      updateAvailableTimes(selectedDate);
    }
  }, [selectedDate, bookedSlots]);

  // Update end times when start time changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "start_time" && value.start_time && selectedDate) {
        updateAvailableEndTimes(value.start_time, selectedDate);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, selectedDate, bookedSlots]);

  const fetchBookedSlots = async () => {
    try {
      const { data, error } = await supabase
        .from("rental_requests")
        .select("start_date, end_date")
        .eq("space_id", space.id)
        .in("status", ["pending", "approved"]);

      if (error) throw error;

      const slots: BookedSlot[] = data.map(req => ({
        date: req.start_date.split('T')[0],
        start_time: req.start_date.split('T')[1]?.substring(0, 5) || "00:00",
        end_time: req.end_date.split('T')[1]?.substring(0, 5) || "23:59",
      }));

      setBookedSlots(slots);
    } catch (error) {
      console.error("Error fetching booked slots:", error);
    }
  };

  const isDateBooked = (date: Date): boolean => {
    const dateStr = format(date, "yyyy-MM-dd");
    return bookedSlots.some(slot => slot.date === dateStr);
  };

  const isDateDisabled = (date: Date): boolean => {
    const today = startOfDay(new Date());
    return isBefore(date, today);
  };

  const updateAvailableTimes = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const bookedOnDate = bookedSlots.filter(slot => slot.date === dateStr);

    if (bookedOnDate.length === 0) {
      setAvailableStartTimes(AVAILABLE_TIMES);
      return;
    }

    // Filter out times that overlap with booked slots
    const available = AVAILABLE_TIMES.filter(time => {
      return !bookedOnDate.some(slot => 
        time >= slot.start_time && time < slot.end_time
      );
    });

    setAvailableStartTimes(available);
  };

  const updateAvailableEndTimes = (startTime: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const bookedOnDate = bookedSlots.filter(slot => slot.date === dateStr);

    // End times must be after start time
    const timesAfterStart = AVAILABLE_TIMES.filter(time => time > startTime);

    if (bookedOnDate.length === 0) {
      setAvailableEndTimes(timesAfterStart);
      return;
    }

    // Find the next booked slot after start time
    const nextBookedSlot = bookedOnDate
      .filter(slot => slot.start_time > startTime)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))[0];

    if (!nextBookedSlot) {
      setAvailableEndTimes(timesAfterStart);
      return;
    }

    // Filter times that don't overlap with the next booked slot
    const available = timesAfterStart.filter(time => time <= nextBookedSlot.start_time);
    setAvailableEndTimes(available);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour faire une demande de location",
          variant: "destructive",
        });
        return;
      }

      const startDateTime = `${format(values.event_date, "yyyy-MM-dd")}T${values.start_time}:00`;
      const endDateTime = `${format(values.event_date, "yyyy-MM-dd")}T${values.end_time}:00`;

      // Calculate duration in hours
      const startHour = parseFloat(values.start_time.replace(":", "."));
      const endHour = parseFloat(values.end_time.replace(":", "."));
      const durationHours = endHour - startHour;

      // Calculate total amount
      let totalAmount = 0;
      if (durationHours <= 4) {
        totalAmount = space.half_day_rate || 0;
      } else if (durationHours > 7) {
        totalAmount = space.full_day_rate || 0;
      } else {
        totalAmount = (space.hourly_rate || 0) * durationHours;
      }

      const { data, error } = await supabase
        .from("rental_requests")
        .insert({
          user_id: user.id,
          space_id: space.id,
          event_title: values.event_title,
          event_description: values.event_description,
          event_type: "réservation",
          organization_name: values.organization_name,
          organization_type: values.organization_type,
          contact_person: values.contact_person,
          contact_email: values.contact_email,
          contact_phone: values.contact_phone,
          start_date: startDateTime,
          end_date: endDateTime,
          expected_participants: values.participants_count,
          total_amount: totalAmount,
          currency: space.currency || "MAD",
          status: "pending",
          request_number: "",
        })
        .select()
        .single();

      if (error) throw error;

      // Store submission data for confirmation screen
      setSubmittedData({
        requestNumber: data.request_number || "En cours de génération",
        eventDate: format(values.event_date, "PPP", { locale: fr }),
        eventTitle: values.event_title,
        totalAmount: totalAmount,
      });

      setSubmitted(true);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle>Demande de location - {space.space_name}</DialogTitle>
              <DialogDescription>
                Remplissez ce formulaire pour réserver cet espace
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Event Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informations sur l'événement</h3>
              
              <FormField
                control={form.control}
                name="event_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre de l'événement *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Conférence, Atelier..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="event_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Décrivez brièvement votre événement" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="participants_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de participants *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    {space.capacity && (
                      <FormDescription>
                        Capacité maximale: {space.capacity} personnes
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date and Time Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Date et horaires</h3>
              
              <FormField
                control={form.control}
                name="event_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de l'événement *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: fr })
                            ) : (
                              <span>Sélectionnez une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setSelectedDate(date);
                          }}
                          disabled={isDateDisabled}
                          modifiers={{
                            booked: (date) => isDateBooked(date),
                          }}
                          modifiersStyles={{
                            booked: {
                              textDecoration: "line-through",
                              color: "hsl(var(--muted-foreground))",
                              opacity: 0.5,
                            },
                          }}
                          initialFocus
                          className="pointer-events-auto"
                        />
                        <div className="p-3 border-t">
                          <div className="flex items-center gap-2 text-xs">
                            <Badge variant="outline" className="bg-muted">
                              Dates barrées = complètement réservées
                            </Badge>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure de début *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedDate}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Début" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableStartTimes.map((time) => (
                            <SelectItem key={time} value={time}>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {time}
                              </div>
                            </SelectItem>
                          ))}
                          {availableStartTimes.length === 0 && (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                              Aucun créneau disponible
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure de fin *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedDate || !form.watch("start_time")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Fin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableEndTimes.map((time) => (
                            <SelectItem key={time} value={time}>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {time}
                              </div>
                            </SelectItem>
                          ))}
                          {availableEndTimes.length === 0 && (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                              Sélectionnez d'abord l'heure de début
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Organization Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informations sur l'organisation</h3>
              
              <FormField
                control={form.control}
                name="organization_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'organisation *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nom de votre organisation" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organization_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d'organisation *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="association">Association</SelectItem>
                        <SelectItem value="entreprise">Entreprise</SelectItem>
                        <SelectItem value="institution_publique">Institution publique</SelectItem>
                        <SelectItem value="universite">Université</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contact</h3>
              
              <FormField
                control={form.control}
                name="contact_person"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personne de contact *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nom complet" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="email@exemple.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+212 6XX XX XX XX" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Envoi en cours..." : "Envoyer la demande"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">✅ Demande envoyée avec succès</DialogTitle>
              <DialogDescription className="text-center">
                Votre demande de location a été enregistrée
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Merci pour votre demande !</h3>
                <p className="text-muted-foreground">
                  Nous avons bien reçu votre demande de location. Vous recevrez une confirmation par email sous peu.
                </p>
              </div>

              {submittedData && (
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <h4 className="font-semibold text-lg mb-4">Détails de votre demande</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Numéro de demande</p>
                      <p className="font-semibold">{submittedData.requestNumber}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Espace</p>
                      <p className="font-semibold">{space.space_name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Événement</p>
                      <p className="font-semibold">{submittedData.eventTitle}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-semibold">{submittedData.eventDate}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Montant estimé</p>
                      <p className="font-semibold">{submittedData.totalAmount} {space.currency}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Statut</p>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        En attente de validation
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-blue-900 mb-2">Prochaines étapes</h5>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Notre équipe examinera votre demande dans les 48 heures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Vous recevrez une confirmation par email avec les détails de la réservation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Consultez votre espace personnel pour suivre l'état de votre demande</span>
                  </li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button 
                onClick={() => {
                  setSubmitted(false);
                  setSubmittedData(null);
                  onOpenChange(false);
                }}
                className="w-full"
              >
                Fermer
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
