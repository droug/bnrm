import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BNRMServicesPublic } from "@/components/bnrm/BNRMServicesPublic";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

export default function BNRMPortal() {
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
            <p className="text-muted-foreground text-lg">
              Abonnements, services et tarifs de la Bibliothèque Nationale du Royaume du Maroc
            </p>
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