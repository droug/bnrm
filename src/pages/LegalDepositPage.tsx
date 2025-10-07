import { useState } from "react";
import { Link } from "react-router-dom";
import { WatermarkContainer } from "@/components/ui/watermark";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  Scale,
  Home
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { Navigate } from "react-router-dom";
import LegalDepositBackoffice from "@/components/LegalDepositBackoffice";
import { AdminHeader } from "@/components/AdminHeader";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NumberManagement } from "@/components/legal-deposit/NumberManagement";

const LegalDepositPage = () => {
  console.log("LegalDepositPage component is rendering");
  const { user, profile, loading } = useAuth();
  const { hasPermission } = usePermissions();

  console.log("LegalDepositPage - User:", user?.id);
  console.log("LegalDepositPage - Profile:", profile);
  console.log("LegalDepositPage - Loading:", loading);

  if (loading) {
    console.log("LegalDepositPage - Still loading, showing spinner");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Wait for profile to load if user is authenticated
  if (!user) {
    console.log("LegalDepositPage - No user, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // If user exists but profile is still loading, wait
  if (user && !profile) {
    console.log("LegalDepositPage - User exists but profile not loaded yet, showing spinner");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check role once profile is loaded
  if (profile?.role !== 'admin' && profile?.role !== 'librarian') {
    console.log("LegalDepositPage - Access denied. Profile role:", profile?.role);
    return <Navigate to="/dashboard" replace />;
  }

  console.log("LegalDepositPage - Access granted, rendering page");

  return (
    <WatermarkContainer 
      watermarkProps={{ 
        text: "BNRM Legal Deposit - Workflow CPS", 
        variant: "subtle", 
        position: "corner",
        opacity: 0.03
      }}
    >
      <div className="min-h-screen bg-background">
        {/* Header standardisé */}
        <AdminHeader 
          title="Backoffice Dépôt Légal"
          badgeText="Workflow CPS"
          subtitle="Interface de gestion des dépôts légaux et processus CPS"
        />
        
        <main className="container py-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Tableau de bord
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Backoffice Dépôt Légal</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                  <Scale className="h-8 w-8 text-primary" />
                  Backoffice Dépôt Légal - CPS Conforme
                </h1>
                <p className="text-muted-foreground mt-2">
                  Workflow complet : Professionnel A & B, Validation 4 niveaux, Attribution automatique DL/ISBN/ISSN/ISMN
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button asChild variant="outline">
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Retour au Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Nouveau Backoffice Dépôt Légal conforme au CPS */}
          <Tabs defaultValue="requests" className="space-y-6">
            <TabsList>
              <TabsTrigger value="requests">Demandes de dépôt</TabsTrigger>
              <TabsTrigger value="numbers">Gestion des numéros</TabsTrigger>
            </TabsList>

            <TabsContent value="requests">
              <LegalDepositBackoffice />
            </TabsContent>

            <TabsContent value="numbers">
              <NumberManagement />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </WatermarkContainer>
  );
};

export default LegalDepositPage;