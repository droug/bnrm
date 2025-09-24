import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Shield, FileText, Clock, Archive, Scale, Edit } from "lucide-react";
import { PermissionGuard } from "@/hooks/usePermissions";

export function AdminSettingsCards() {
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
    },
    {
      icon: Edit,
      title: "Éditeur WYSIWYG",
      description: "Éditeur visuel pour créer et modifier du contenu",
      href: "/settings?tab=wysiwyg",
      permission: "content.manage"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Administration et Paramétrage</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminCards.map((card) => (
          <PermissionGuard key={card.title} permission={card.permission}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <card.icon className="h-5 w-5 text-primary" />
                  <span>{card.title}</span>
                </CardTitle>
                <CardDescription>
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline"
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
  );
}