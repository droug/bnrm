import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Download, Printer, Home, Mail } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import jsPDF from "jspdf";
import type { BookingData } from "../BookingWizard";
import logoHeader from "@/assets/logo-header-report.png";

interface StepConfirmationProps {
  data: BookingData;
  bookingId?: string;
}

export default function StepConfirmation({ data, bookingId }: StepConfirmationProps) {
  const navigate = useNavigate();

  // Récupérer les informations de l'espace
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

  const handleDownloadPDF = async () => {
    try {
      toast.info("Génération du PDF en cours...");

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Couleurs du thème (en format RGB)
      const primaryColor: [number, number, number] = [139, 92, 246]; // violet primaire
      const textColor: [number, number, number] = [31, 41, 55]; // gris foncé
      const lightGray: [number, number, number] = [243, 244, 246];
      
      let yPosition = 20;

      // En-tête avec logo
      try {
        const img = new Image();
        img.src = logoHeader;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        pdf.addImage(img, 'PNG', 15, yPosition, 50, 20);
      } catch (error) {
        console.error('Erreur chargement logo:', error);
      }
      
      yPosition += 35;

      // Titre principal
      pdf.setFontSize(22);
      pdf.setTextColor(...primaryColor);
      pdf.setFont("helvetica", "bold");
      pdf.text("RÉCAPITULATIF DE RÉSERVATION", pageWidth / 2, yPosition, { align: "center" });
      
      yPosition += 15;

      // Numéro de référence
      if (bookingId) {
        pdf.setFontSize(11);
        pdf.setTextColor(...textColor);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Référence: ${bookingId.slice(0, 8).toUpperCase()}`, pageWidth / 2, yPosition, { align: "center" });
        yPosition += 5;
      }

      // Date de génération
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Généré le ${format(new Date(), "PPP 'à' HH:mm", { locale: fr })}`, pageWidth / 2, yPosition, { align: "center" });
      
      yPosition += 15;

      // Fonction pour créer une section
      const addSection = (title: string, content: Array<{ label: string; value: string }>) => {
        // Titre de section
        pdf.setFillColor(...lightGray);
        pdf.rect(15, yPosition, pageWidth - 30, 8, "F");
        pdf.setFontSize(12);
        pdf.setTextColor(...primaryColor);
        pdf.setFont("helvetica", "bold");
        pdf.text(title, 20, yPosition + 5.5);
        yPosition += 12;

        // Contenu
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        content.forEach(({ label, value }) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.setTextColor(100, 100, 100);
          pdf.text(label + ":", 20, yPosition);
          pdf.setTextColor(...textColor);
          pdf.setFont("helvetica", "bold");
          pdf.text(value, 80, yPosition);
          pdf.setFont("helvetica", "normal");
          yPosition += 7;
        });
        
        yPosition += 5;
      };

      // Section Informations de l'événement
      addSection("INFORMATIONS DE L'ÉVÉNEMENT", [
        { label: "Titre", value: data.eventTitle || "N/A" },
        { label: "Description", value: data.eventDescription || "N/A" },
        { label: "Type d'organisme", value: data.organizerType === 'public' ? 'Public' : 'Privé' },
        { label: "Nom de l'organisme", value: data.organizationName || "N/A" },
        { label: "Espace", value: space?.name || "N/A" },
        { label: "Capacité", value: space?.capacity ? `${space.capacity} personnes` : "N/A" },
        { label: "Participants attendus", value: data.expectedAttendees ? `${data.expectedAttendees} personnes` : "N/A" }
      ]);

      // Section Dates et horaires
      addSection("DATES ET HORAIRES", [
        { label: "Date de début", value: data.startDate ? format(data.startDate, "PPP", { locale: fr }) : "N/A" },
        { label: "Heure de début", value: data.startTime || "N/A" },
        { label: "Date de fin", value: data.endDate ? format(data.endDate, "PPP", { locale: fr }) : "N/A" },
        { label: "Heure de fin", value: data.endTime || "N/A" }
      ]);

      // Section Équipements et services
      if ((equipment && equipment.length > 0) || (services && services.length > 0)) {
        const equipServContent: Array<{ label: string; value: string }> = [];
        
        if (equipment && equipment.length > 0) {
          equipServContent.push({ 
            label: "Équipements", 
            value: equipment.map(e => e.name).join(", ") 
          });
        }
        
        if (services && services.length > 0) {
          equipServContent.push({ 
            label: "Services", 
            value: services.map(s => s.name).join(", ") 
          });
        }
        
        addSection("ÉQUIPEMENTS & SERVICES", equipServContent);
      }

      // Section Coordonnées du demandeur
      addSection("COORDONNÉES DU DEMANDEUR", [
        { label: "Personne de contact", value: data.contactPerson || "N/A" },
        { label: "Email", value: data.contactEmail || "N/A" },
        { label: "Téléphone", value: data.contactPhone || "N/A" },
        { label: "Adresse", value: data.contactAddress || "N/A" },
        { label: "Ville", value: data.contactCity || "N/A" },
        { label: "Pays", value: data.contactCountry || "N/A" }
      ]);

      // Pied de page
      yPosition = pageHeight - 25;
      pdf.setDrawColor(...primaryColor);
      pdf.setLineWidth(0.5);
      pdf.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 5;
      
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont("helvetica", "italic");
      pdf.text("Bibliothèque Nationale du Royaume du Maroc", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 5;
      pdf.text("Avenue Ibn Batouta - Rabat", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 4;
      pdf.text("Tél: +212 5XX XX XX XX | Email: reservations@bnrm.ma", pageWidth / 2, yPosition, { align: "center" });

      // Télécharger le PDF
      const fileName = `Reservation_${bookingId?.slice(0, 8).toUpperCase() || 'BNRM'}_${format(new Date(), "yyyyMMdd")}.pdf`;
      pdf.save(fileName);
      
      toast.success("PDF généré avec succès");
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReturnHome = () => {
    navigate("/");
  };

  return (
    <div className="space-y-6">
      {/* Message de succès principal */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-green-900">
                Demande transmise avec succès !
              </h2>
              <p className="text-green-800 max-w-2xl">
                Votre demande de réservation a bien été transmise à la Bibliothèque Nationale du Royaume du Maroc.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations complémentaires */}
      <Alert>
        <Mail className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Prochaines étapes :</p>
            <ul className="text-sm space-y-1 ml-4 list-disc">
              <li>Vous recevrez un email de confirmation à l'adresse : <strong>{data.contactEmail}</strong></li>
              <li>Notre équipe vérifiera la disponibilité de l'espace demandé</li>
              <li>Vous serez contacté dans un délai de 2 à 3 jours ouvrables</li>
              <li>Un deuxième email vous sera envoyé une fois votre demande approuvée</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* Numéro de référence */}
      {bookingId && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Numéro de référence</p>
                <p className="text-lg font-mono font-bold mt-1">{bookingId.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Événement</p>
                <p className="font-medium mt-1">{data.eventTitle}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Récapitulatif rapide */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">Récapitulatif de votre demande</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Organisme</p>
              <p className="font-medium">{data.organizationName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Contact</p>
              <p className="font-medium">{data.contactPerson}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date de l'événement</p>
              <p className="font-medium">
                {data.startDate?.toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Horaire</p>
              <p className="font-medium">{data.startTime} - {data.endTime}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boutons d'action */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          variant="outline" 
          onClick={handleDownloadPDF}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Télécharger le récapitulatif (PDF)
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handlePrint}
          className="w-full"
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimer la demande
        </Button>
        
        <Button 
          onClick={handleReturnHome}
          className="w-full"
        >
          <Home className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Button>
      </div>

      {/* Message d'aide */}
      <Alert>
        <AlertDescription>
          <p className="text-sm">
            Pour toute question concernant votre demande, vous pouvez nous contacter par email à{" "}
            <a href="mailto:reservations@bnrm.ma" className="text-primary hover:underline font-medium">
              reservations@bnrm.ma
            </a>
            {" "}ou par téléphone au <span className="font-medium">+212 5XX XX XX XX</span>
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
