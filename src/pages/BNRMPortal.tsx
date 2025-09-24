import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BNRMServices } from "@/components/bnrm/BNRMServices";
import { BNRMTariffs } from "@/components/bnrm/BNRMTariffs";
import { BNRMParameters } from "@/components/bnrm/BNRMParameters";
import { BNRMHistory } from "@/components/bnrm/BNRMHistory";
import { Badge } from "@/components/ui/badge";
import { Building2, Settings, History, DollarSign } from "lucide-react";

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
              Gestion des services, tarifs et paramètres de la Bibliothèque Nationale du Royaume du Maroc
            </p>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="services" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Services
              </TabsTrigger>
              <TabsTrigger value="tariffs" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Tarifs
              </TabsTrigger>
              <TabsTrigger value="parameters" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Paramètres
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Historique
              </TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="space-y-6">
              <BNRMServices />
            </TabsContent>

            <TabsContent value="tariffs" className="space-y-6">
              <BNRMTariffs />
            </TabsContent>

            <TabsContent value="parameters" className="space-y-6">
              <BNRMParameters />
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <BNRMHistory />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}