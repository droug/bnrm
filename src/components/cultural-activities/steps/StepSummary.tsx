import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Building2, Calendar, Clock, Users, Package, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import type { BookingData } from "../BookingWizard";

interface StepSummaryProps {
  data: BookingData;
  onUpdate: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

export default function StepSummary({ data }: StepSummaryProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: space } = useQuery({
    queryKey: ['space', data.spaceId],
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

  const { data: equipment } = useQuery({
    queryKey: ['selected-equipment', data.equipment],
    queryFn: async () => {
      if (!data.equipment?.length) return [];
      const { data: equipment, error } = await supabase
        .from('space_equipment')
        .select('*')
        .in('id', data.equipment);
      
      if (error) throw error;
      return equipment;
    },
    enabled: !!data.equipment?.length
  });

  const { data: services } = useQuery({
    queryKey: ['selected-services', data.services],
    queryFn: async () => {
      if (!data.services?.length) return [];
      const { data: services, error } = await supabase
        .from('space_services')
        .select('*')
        .in('id', data.services);
      
      if (error) throw error;
      return services;
    },
    enabled: !!data.services?.length
  });

  const submitBooking = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("Vous devez être connecté pour effectuer une réservation");
      }

      // Get user profile for contact info
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone')
        .eq('user_id', user.id)
        .single();

      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      const startDateTime = `${data.eventDate?.toISOString().split('T')[0]} ${data.startTime}:00`;
      const endDateTime = `${data.eventDate?.toISOString().split('T')[0]} ${data.endTime}:00`;

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          space_id: data.spaceId,
          organization_type: data.organizerType || 'association',
          organization_name: data.organizationName,
          start_date: startDateTime,
          end_date: endDateTime,
          event_title: data.eventTitle,
          event_description: `Type: ${data.eventType || 'Non spécifié'}\n\n${data.eventDescription}`,
          participants_count: data.expectedAttendees || 0,
          contact_person: profile ? `${profile.first_name} ${profile.last_name}` : 'Non renseigné',
          contact_email: authUser?.email || 'non-renseigne@example.com',
          contact_phone: profile?.phone || 'Non renseigné',
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Insert equipment
      if (data.equipment?.length) {
        const equipmentInserts = data.equipment.map(equipId => ({
          booking_id: booking.id,
          equipment_id: equipId,
          quantity: 1
        }));

        const { error: equipError } = await supabase
          .from('booking_equipment')
          .insert(equipmentInserts);

        if (equipError) throw equipError;
      }

      // Insert services
      if (data.services?.length) {
        const servicesInserts = data.services.map(serviceId => ({
          booking_id: booking.id,
          service_id: serviceId
        }));

        const { error: serviceError } = await supabase
          .from('booking_services')
          .insert(servicesInserts);

        if (serviceError) throw serviceError;
      }

      return booking;
    },
    onSuccess: () => {
      toast.success("Réservation créée avec succès", {
        description: "Votre demande de réservation a été envoyée. Vous recevrez une confirmation par email."
      });
      navigate("/profile");
    },
    onError: (error: Error) => {
      toast.error("Erreur", {
        description: error.message
      });
    }
  });

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Connexion requise", {
        description: "Vous devez être connecté pour effectuer une réservation"
      });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);
    await submitBooking.mutateAsync();
    setIsSubmitting(false);
  };

  const isComplete = data.organizerType && data.organizationName && data.spaceId && 
                     data.eventDate && data.startTime && data.endTime && 
                     data.eventType && data.eventTitle && data.eventDescription && 
                     data.expectedAttendees;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Récapitulatif</h2>
        <p className="text-muted-foreground">
          Vérifiez les informations de votre réservation avant de confirmer
        </p>
      </div>

      {!isComplete && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Certaines informations obligatoires sont manquantes. Veuillez compléter toutes les étapes.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informations de l'organisateur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <Badge>{data.organizerType}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Organisation:</span>
              <span className="font-medium">{data.organizationName}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Espace et Date
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Espace:</span>
              <span className="font-medium">{space?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">
                {data.eventDate && format(data.eventDate, "PPP", { locale: fr })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Horaires:</span>
              <span className="font-medium">{data.startTime} - {data.endTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Participants:</span>
              <span className="font-medium">{data.expectedAttendees} personnes</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Détails de l'événement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <Badge variant="secondary">{data.eventType}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Titre:</span>
              <p className="font-medium mt-1">{data.eventTitle}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Description:</span>
              <p className="text-sm mt-1">{data.eventDescription}</p>
            </div>
          </CardContent>
        </Card>

        {equipment && equipment.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Équipements ({equipment.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {equipment.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="text-muted-foreground">
                      {item.is_included ? 'Inclus' : `+${item.additional_cost} ${item.currency || 'MAD'}`}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {services && services.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Services complémentaires ({services.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {services.map((service) => (
                  <li key={service.id} className="flex justify-between text-sm">
                    <span>{service.name}</span>
                    <span className="text-muted-foreground">
                      {service.base_cost} {service.currency}/{service.unit_type}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Votre demande sera examinée par notre équipe. Vous recevrez une confirmation par email dans les plus brefs délais.
        </AlertDescription>
      </Alert>

      <Button
        onClick={handleSubmit}
        disabled={!isComplete || isSubmitting}
        size="lg"
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <CheckCircle className="h-5 w-5 mr-2" />
            Confirmer la réservation
          </>
        )}
      </Button>
    </div>
  );
}
