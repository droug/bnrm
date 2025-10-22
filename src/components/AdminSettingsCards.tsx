import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Shield, FileText, Clock, Archive, Scale, Edit, Library, UserCog, MapPin } from "lucide-react";
import { PermissionGuard } from "@/hooks/usePermissions";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";

export function AdminSettingsCards() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const adminCards = [
    {
      icon: Shield,
      title: t('admin.permissions.title'),
      description: t('admin.permissions.description'),
      href: "/settings",
      permission: "users.manage"
    },
    {
      icon: FileText,
      title: t('admin.content.title'),
      description: t('admin.content.description'),
      href: "/admin/content",
      permission: "content.manage"
    },
    {
      icon: Clock,
      title: "Demandes en attente",
      description: "Traiter les demandes d'accès et Abonnements",
      href: "/admin/access-requests",
      permission: "requests.manage"
    },
    {
      icon: Scale,
      title: t('admin.legal.deposit.title'),
      description: t('admin.legal.deposit.description'),
      href: "/admin/legal-deposit",
      permission: "legal_deposit.manage"
    },
    {
      icon: Archive,
      title: t('admin.archiving.title'),
      description: t('admin.archiving.description'),
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
      icon: Settings,
      title: t('admin.bnrm.tariffs.title'),
      description: t('admin.bnrm.tariffs.description'),
      href: "/admin/bnrm-tariffs",
      permission: "content.manage"
    },
    {
      icon: Library,
      title: "Bibliothèque Numérique",
      description: "Gestion des documents numérisés et leurs permissions",
      href: "/admin/digital-library",
      permission: "content.manage"
    },
    {
      icon: UserCog,
      title: "Demandes Professionnelles",
      description: "Inviter et valider les inscriptions des professionnels",
      href: "/admin/professional-management",
      permission: "users.manage"
    },
    {
      icon: MapPin,
      title: "Gestion des Visites Guidées",
      description: "Gérer les créneaux et réservations de visites guidées",
      href: "/admin/guided-tours",
      permission: "content.manage"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">{t('admin.settings.title')}</h2>
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
                  onClick={() => navigate(card.href)}
                >
                  {t('common.view')}
                </Button>
              </CardContent>
            </Card>
          </PermissionGuard>
        ))}
      </div>
    </div>
  );
}