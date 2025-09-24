import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Shield, FileText, Clock, Archive, Scale, ArrowLeft } from "lucide-react";
import { PermissionGuard } from "@/hooks/usePermissions";
import { WatermarkContainer } from "@/components/ui/watermark";

export default function AdminSettings() {
  const adminCards = [
    {
      icon: Shield,
      title: "Gestion des Droits et Permissions",
      description: "Gérer les rôles utilisateurs et les permissions d'accès",
      href: "/settings?tab=permissions",
      permission: "users.manage"
    },
    {
      icon: FileText,
      title: "Gestion de contenu",
      description: "Créer et modérer les actualités, événements et expositions",
      href: "/admin/content",
      permission: "content.manage"
    },
    {
      icon: Clock,
      title: "Demandes en attente",
      description: "Traiter les demandes d'accès aux manuscrits",
      href: "/admin/access-requests",
      permission: "requests.manage"
    },
    {
      icon: Scale,
      title: "Dépôt légal",
      description: "Gérer le processus de dépôt légal et les soumissions",
      href: "/settings?tab=legal-deposit",
      permission: "legal_deposit.manage"
    },
    {
      icon: Archive,
      title: "Archivage",
      description: "Configurer l'archivage automatique du contenu",
      href: "/settings?tab=archiving",
      permission: "content.archive"
    }
  ];

  return (
    <WatermarkContainer 
      watermarkProps={{ 
        text: "BNRM Administration - Accès Protégé", 
        variant: "subtle", 
        position: "pattern",
        opacity: 0.02
      }}
    >
      <div className="min-h-screen bg-background">
        {/* Header with breadcrumb */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.history.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Paramétrage et Administration</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container py-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-8">
              <Settings className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Administration et Paramétrage</h1>
                <p className="text-muted-foreground mt-2">
                  Gérez les paramètres système et les fonctionnalités administratives
                </p>
              </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {adminCards.map((card) => (
                <PermissionGuard key={card.title} permission={card.permission}>
                  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <card.icon className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-lg">{card.title}</span>
                      </CardTitle>
                      <CardDescription className="text-base">
                        {card.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full" 
                        onClick={() => window.location.href = card.href}
                      >
                        Accéder
                      </Button>
                    </CardContent>
                  </Card>
                </PermissionGuard>
              ))}
            </div>
          </div>
        </main>
      </div>
    </WatermarkContainer>
  );
}