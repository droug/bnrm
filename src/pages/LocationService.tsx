import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LocationService() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRedirect = () => {
    navigate("/reservation-espaces");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-primary">Location à la demande</h1>
            <p className="text-lg text-muted-foreground">
              Louez nos espaces pour vos événements culturels et professionnels
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Service de location d'espaces</CardTitle>
              <CardDescription>
                Pour louer un espace, veuillez utiliser notre service de réservation d'espaces culturels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Nous proposons la location de différents espaces pour vos événements:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Salles de conférence</li>
                <li>Auditoriums</li>
                <li>Espaces d'exposition</li>
                <li>Salles de réunion</li>
              </ul>
              <Button onClick={handleRedirect} className="w-full mt-6">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Réserver un espace
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
