import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Download, Printer, Home, Mail } from "lucide-react";
import { toast } from "sonner";
import type { BookingData } from "../BookingWizard";

interface StepConfirmationProps {
  data: BookingData;
  bookingId?: string;
}

export default function StepConfirmation({ data, bookingId }: StepConfirmationProps) {
  const navigate = useNavigate();

  const handleDownloadPDF = () => {
    // TODO: Implémenter la génération du PDF récapitulatif
    toast.info("Génération du PDF en cours...", {
      description: "Le téléchargement démarrera dans quelques instants"
    });
    
    // Simulation pour l'instant
    setTimeout(() => {
      toast.success("PDF généré avec succès");
    }, 1500);
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
