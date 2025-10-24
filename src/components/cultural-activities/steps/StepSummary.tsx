import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Building2, Calendar, Clock, Users, Package, Sparkles, Calculator, FileText, User, Mail, Phone, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import type { BookingData } from "../BookingWizard";

interface StepSummaryProps {
  data: BookingData;
  onUpdate: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

export default function StepSummary({ data, onUpdate, onNext }: StepSummaryProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasReadRegulations, setHasReadRegulations] = useState(false);
  const [acceptsConditions, setAcceptsConditions] = useState(false);

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

  // Calculer la tarification dynamique
  const { data: calculatedTariff } = useQuery({
    queryKey: ['booking-tariff', data.spaceId, data.organizerType, data.durationType, data.startDate, data.endDate],
    queryFn: async () => {
      if (!data.spaceId || !data.organizerType || !data.startDate || !data.endDate) return null;
      
      const startDateTime = `${data.startDate.toISOString().split('T')[0]} ${data.startTime || '00:00'}:00`;
      const endDateTime = `${data.endDate.toISOString().split('T')[0]} ${data.endTime || '23:59'}:00`;
      
      const { data: tariff, error } = await supabase.rpc('calculate_booking_tariff', {
        p_space_id: data.spaceId,
        p_organization_type: data.organizerType,
        p_duration_type: data.durationType || 'journee_complete',
        p_start_date: startDateTime,
        p_end_date: endDateTime
      });
      
      if (error) {
        console.error('Erreur calcul tarif:', error);
        return null;
      }
      
      return tariff;
    },
    enabled: !!(data.spaceId && data.organizerType && data.startDate && data.endDate)
  });

  const submitBooking = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("Vous devez être connecté pour effectuer une réservation");
      }

      const startDateTime = `${data.startDate?.toISOString().split('T')[0]} ${data.startTime}:00`;
      const endDateTime = `${data.endDate?.toISOString().split('T')[0]} ${data.endTime}:00`;

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          space_id: data.spaceId,
          organization_type: data.organizerType || 'association',
          organization_name: data.organizationName,
          start_date: startDateTime,
          end_date: endDateTime,
          duration_type: data.durationType || 'journee_complete',
          event_title: data.eventTitle,
          event_description: data.eventDescription,
          participants_count: data.expectedAttendees || 0,
          contact_person: data.contactPerson,
          contact_email: data.contactEmail,
          contact_phone: data.contactPhone,
          status: 'en_attente'
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

      // Envoyer l'email de confirmation
      try {
        const { error: emailError } = await supabase.functions.invoke('send-booking-confirmation', {
          body: {
            bookingId: booking.id,
            userEmail: data.contactEmail,
            userName: data.contactPerson,
            organizationName: data.organizationName || '',
            eventTitle: data.eventTitle || '',
            eventDescription: data.eventDescription || '',
            spaceName: space?.name || '',
            startDate: startDateTime,
            endDate: endDateTime,
            startTime: data.startTime || '',
            endTime: data.endTime || '',
            expectedAttendees: data.expectedAttendees || 0,
            contactPhone: data.contactPhone || '',
            contactAddress: data.contactAddress || '',
            contactCity: data.contactCity || '',
            contactCountry: data.contactCountry || ''
          }
        });

        if (emailError) {
          console.error('Erreur envoi email:', emailError);
          // Ne pas bloquer la réservation si l'email échoue
        }
      } catch (emailError) {
        console.error('Erreur envoi email:', emailError);
        // Ne pas bloquer la réservation si l'email échoue
      }

      return booking;
    },
    onSuccess: (booking) => {
      // Stocker l'ID de la réservation
      onUpdate({ submittedBookingId: booking.id });
      
      toast.success("Réservation créée avec succès", {
        description: "Votre demande de réservation a été envoyée. Vous recevrez une confirmation par email."
      });
      
      // Passer à l'étape de confirmation
      onNext();
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
                     data.startDate && data.endDate && data.startTime && data.endTime && 
                     data.eventTitle && data.eventDescription && 
                     (data.expectedAttendees && data.expectedAttendees >= 1) &&
                     data.contactPerson &&
                     data.contactEmail && data.contactPhone;

  const canSubmit = isComplete && hasReadRegulations && acceptsConditions;

  // Calcul du coût total
  const calculateTotalCost = () => {
    let total = Number(calculatedTariff) || 0; // Tarif de base incluant les charges automatiques
    
    // Coût des équipements
    if (equipment) {
      equipment.forEach(item => {
        if (!item.is_included && item.additional_cost) {
          total += Number(item.additional_cost);
        }
      });
    }
    
    // Coût des services
    if (services) {
      services.forEach(service => {
        if (service.base_cost) {
          total += Number(service.base_cost);
        }
      });
    }
    
    return total;
  };

  const totalCost = calculateTotalCost();
  const baseTariff = Number(calculatedTariff) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Validation & Acceptation</h2>
        <p className="text-muted-foreground">
          Vérifiez les informations de votre réservation et acceptez les conditions avant de confirmer
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
        {/* Espace sélectionné */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Espace sélectionné
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-lg">{space?.name}</p>
                {space?.description && (
                  <p className="text-sm text-muted-foreground mt-1">{space.description}</p>
                )}
              </div>
              <Badge variant="secondary">Capacité: {space?.capacity} pers.</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Type: {data.organizerType}</span>
              <span>•</span>
              <span>{data.organizationName}</span>
            </div>
          </CardContent>
        </Card>

        {/* Dates et horaires */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dates & Horaires
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date de début</p>
                <p className="font-medium">
                  {data.startDate && format(data.startDate, "PPP", { locale: fr })}
                </p>
                <p className="text-sm text-primary">{data.startTime}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date de fin</p>
                <p className="font-medium">
                  {data.endDate && format(data.endDate, "PPP", { locale: fr })}
                </p>
                <p className="text-sm text-primary">{data.endTime}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{data.expectedAttendees} participants attendus</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Événement</p>
              <p className="font-semibold">{data.eventTitle}</p>
              <p className="text-sm mt-1">{data.eventDescription}</p>
            </div>
          </CardContent>
        </Card>

        {/* Équipements & Services */}
        {((equipment && equipment.length > 0) || (services && services.length > 0)) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Équipements & Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {equipment && equipment.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Équipements ({equipment.length})</p>
                  <ul className="space-y-2">
                    {equipment.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="text-muted-foreground">
                          {item.is_included ? (
                            <Badge variant="secondary" className="text-xs">Inclus</Badge>
                          ) : (
                            `+${item.additional_cost} ${item.currency || 'MAD'}`
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {services && services.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Services additionnels ({services.length})</p>
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
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tarification calculée */}
        {totalCost > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Tarification calculée
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Détail de la tarification */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarif de base ({data.durationType === 'demi_journee' ? 'demi-journée' : 'journée complète'})</span>
                  <span className="font-medium">{baseTariff.toFixed(2)} MAD</span>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Inclut : location de l'espace + électricité + nettoyage
                </p>
                
                {equipment && equipment.some(item => !item.is_included && item.additional_cost) && (
                  <>
                    <Separator className="my-2" />
                    <div>
                      <p className="font-medium mb-1">Équipements additionnels :</p>
                      {equipment.map((item) => (
                        !item.is_included && item.additional_cost && (
                          <div key={item.id} className="flex justify-between text-xs ml-4">
                            <span>{item.name}</span>
                            <span>{Number(item.additional_cost).toFixed(2)} MAD</span>
                          </div>
                        )
                      ))}
                    </div>
                  </>
                )}
                
                {services && services.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    <div>
                      <p className="font-medium mb-1">Services additionnels :</p>
                      {services.map((service) => (
                        <div key={service.id} className="flex justify-between text-xs ml-4">
                          <span>{service.name}</span>
                          <span>{Number(service.base_cost).toFixed(2)} MAD</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <Separator />
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-lg font-semibold">Total estimé</span>
                <span className="text-2xl font-bold text-primary">{totalCost.toFixed(2)} MAD</span>
              </div>
              <p className="text-xs text-muted-foreground">
                * Ce montant est une estimation. Le coût définitif sera confirmé après validation de votre demande.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Détails du demandeur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Détails du demandeur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Organisme</p>
                <p className="font-medium">{data.organizationName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Personne de contact</p>
                <p className="font-medium">{data.contactPerson}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{data.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{data.contactPhone}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p>{data.contactAddress}</p>
                  <p className="text-muted-foreground">{data.contactCity}, {data.contactCountry}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Règlement et conditions */}
      <div className="space-y-4">
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Veuillez prendre connaissance du règlement d'utilisation des salles avant de confirmer votre demande.
            <a 
              href="/documents/reglement-utilisation-espaces-bnrm.pdf" 
              download="Reglement_utilisation_espaces_BNRM.pdf"
              className="block mt-2 text-primary hover:underline font-medium"
            >
              📄 Réglement d'utilisation des espaces et des salles de la BNRM
            </a>
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="read-regulations"
                checked={hasReadRegulations}
                onCheckedChange={(checked) => setHasReadRegulations(checked === true)}
              />
              <Label 
                htmlFor="read-regulations" 
                className="text-sm font-medium leading-relaxed cursor-pointer"
              >
                J'ai lu et compris le règlement d'utilisation des salles *
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="accept-conditions"
                checked={acceptsConditions}
                onCheckedChange={(checked) => setAcceptsConditions(checked === true)}
              />
              <Label 
                htmlFor="accept-conditions" 
                className="text-sm font-medium leading-relaxed cursor-pointer"
              >
                J'accepte toutes les conditions d'utilisation et m'engage à respecter le règlement intérieur *
              </Label>
            </div>
          </CardContent>
        </Card>

        {(!hasReadRegulations || !acceptsConditions) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vous devez accepter les conditions ci-dessus pour pouvoir soumettre votre demande.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Separator />

      {/* Informations de validation */}
      {!canSubmit && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">Le bouton de validation est désactivé car :</p>
            <ul className="list-disc ml-5 space-y-1 text-sm">
              {!isComplete && (
                <li>Certaines informations obligatoires sont manquantes dans les étapes précédentes</li>
              )}
              {!hasReadRegulations && (
                <li>Vous devez confirmer avoir lu le règlement d'utilisation</li>
              )}
              {!acceptsConditions && (
                <li>Vous devez accepter les conditions d'utilisation</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Votre demande sera examinée par notre équipe. Vous recevrez une confirmation par email dans les plus brefs délais.
        </AlertDescription>
      </Alert>

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting}
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
            Valider la demande
          </>
        )}
      </Button>

      {/* Debug info (à retirer en production) */}
      {!isComplete && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="text-xs text-muted-foreground">
              <strong>Informations de débogage :</strong><br/>
              Type d'organisme: {data.organizerType ? '✓' : '✗'}<br/>
              Nom organisation (étape 1): {data.organizationName ? '✓' : '✗'}<br/>
              Espace sélectionné: {data.spaceId ? '✓' : '✗'}<br/>
              Date début: {data.startDate ? '✓' : '✗'}<br/>
              Date fin: {data.endDate ? '✓' : '✗'}<br/>
              Heure début: {data.startTime ? '✓' : '✗'}<br/>
              Heure fin: {data.endTime ? '✓' : '✗'}<br/>
              Titre événement: {data.eventTitle ? '✓' : '✗'}<br/>
              Description: {data.eventDescription ? '✓' : '✗'}<br/>
              Participants: {(data.expectedAttendees && data.expectedAttendees >= 1) ? '✓' : '✗'}<br/>
              Personne contact: {data.contactPerson ? '✓' : '✗'}<br/>
              Email: {data.contactEmail ? '✓' : '✗'}<br/>
              Téléphone: {data.contactPhone ? '✓' : '✗'}
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
