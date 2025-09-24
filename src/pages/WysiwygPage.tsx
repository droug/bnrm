import { useState } from "react";
import { Link } from "react-router-dom";
import { WatermarkContainer } from "@/components/ui/watermark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft,
  Edit,
  Home
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { Navigate } from "react-router-dom";
import WysiwygEditor from "@/components/wysiwyg/WysiwygEditor";
import Header from "@/components/Header";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

const WysiwygPage = () => {
  const { user, profile, loading } = useAuth();
  const { hasPermission } = usePermissions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !hasPermission('content.manage')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <WatermarkContainer 
      watermarkProps={{ 
        text: "BNRM WYSIWYG Editor", 
        variant: "subtle", 
        position: "corner",
        opacity: 0.03
      }}
    >
      <div className="min-h-screen bg-background">
        <Header />
        
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
                  <BreadcrumbPage>Éditeur WYSIWYG</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                  <Edit className="h-8 w-8 text-primary" />
                  Éditeur WYSIWYG
                </h1>
                <p className="text-muted-foreground mt-2">
                  Éditeur visuel pour créer et modifier du contenu de manière intuitive
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

          {/* WYSIWYG Editor */}
          <Card className="shadow-soft">
            <CardContent className="p-0">
              <div className="border rounded-lg overflow-hidden">
                <WysiwygEditor />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </WatermarkContainer>
  );
};

export default WysiwygPage;