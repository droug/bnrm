import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Shield, FileText, Clock, Archive, Scale, ArrowLeft, Edit, DollarSign, BookOpen, Users, Database, Copy } from "lucide-react";
import { PermissionGuard } from "@/hooks/usePermissions";
import { WatermarkContainer } from "@/components/ui/watermark";
import { AdminHeader } from "@/components/AdminHeader";
import { useNavigate } from "react-router-dom";

export default function AdminSettings() {
  const navigate = useNavigate();
  const adminCards = [
    {
      icon: Shield,
      title: "Gestion des Droits et Permissions",
      description: "Gérer les rôles et les permissions d'accès au système",
      href: "/settings",
      permission: "users.permissions"
    },
    {
      icon: Users,
      title: "Gestion des Utilisateurs",
      description: "Administrer les comptes utilisateurs, rôles et approbations",
      href: "/admin/users",
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
      icon: Archive,
      title: "Archivage",
      description: "Configurer l'archivage automatique du contenu",
      href: "/admin/archiving",
      permission: "content.archive"
    },
    {
      icon: Edit,
      title: "Éditeur WYSIWYG",
      description: "Éditeur visuel pour créer et modifier du contenu",
      href: "/admin/wysiwyg",
      permission: "content.manage"
    },
    {
      icon: DollarSign,
      title: "Gestion des Tarifs BNRM",
      description: "Gérer les tarifs et services de la Bibliothèque Nationale",
      href: "/admin/bnrm-tariffs",
      permission: "content.manage"
    },
    {
      icon: BookOpen,
      title: "Gestion du Dépôt Légal",
      description: "Interface complète de gestion du dépôt légal BNRM",
      href: "/admin/bnrm-backoffice",
      permission: "legal_deposit.manage"
    },
    {
      icon: Database,
      title: "Catalogue en Ligne - Métadonnées",
      description: "Gérer les métadonnées du catalogue, imports SIGB et exports",
      href: "/admin/catalog-metadata",
      permission: "content.manage"
    },
    {
      icon: Copy,
      title: "Demandes de Reproduction",
      description: "Gérer les demandes de reproduction de documents - Validation et workflow",
      href: "/admin/reproduction",
      permission: "requests.manage"
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
        {/* Header standardisé */}
        <AdminHeader 
          title="Paramétrage et Administration"
          subtitle="Gérez les paramètres système et les fonctionnalités administratives"
        />

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
                        onClick={() => {
                          console.log('Navigating to:', card.href);
                          navigate(card.href);
                        }}
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