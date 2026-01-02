import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import { BNRMServicesPublic } from "@/components/bnrm/BNRMServicesPublic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

export default function BNRMPortal() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Portail BNRM
              </h1>
              <Badge variant="secondary" className="ml-2">
                Bibliothèque Nationale du Royaume du Maroc
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg mb-4">
              Abonnements, services et tarifs de la Bibliothèque Nationale du Royaume du Maroc
            </p>

            {/* Menu "Accéder à nos services" */}
            <div className="flex gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    Accéder à nos services
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => navigate("/reservation-espaces")}>
                    Réservez nos espaces
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/depot-legal")}>
                    Dépôt légal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Main Content - Public Services */}
          <BNRMServicesPublic />
        </div>
      </main>
      
      <Footer />
      
      {/* Outils globaux (Accessibilité + Chatbot) */}
      <GlobalAccessibilityTools />
    </div>
  );
}