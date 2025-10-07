import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Shield, FileText, Clock, Archive, Scale, ArrowLeft, Edit, DollarSign, BookOpen, Users, Database, Copy, Library, ShieldCheck, UserCog, Newspaper, ClockAlert, ArchiveRestore, PenSquare, Coins, BookMarked, DatabaseZap, FileImage, BookOpenCheck, Languages } from "lucide-react";
import { PermissionGuard } from "@/hooks/usePermissions";
import { WatermarkContainer } from "@/components/ui/watermark";
import { AdminHeader } from "@/components/AdminHeader";
import { useNavigate } from "react-router-dom";

export default function AdminSettings() {
  const navigate = useNavigate();
  const adminCards = [
    {
      icon: ShieldCheck,
      title: "Gestion des Droits et Permissions",
      description: "Gérer les rôles et les permissions d'accès au système",
      href: "/settings",
      permission: "users.permissions",
      gradient: "from-indigo-500 to-indigo-600"
    },
    {
      icon: UserCog,
      title: "Gestion des Utilisateurs",
      description: "Administrer les comptes utilisateurs, rôles et approbations",
      href: "/admin/users",
      permission: "users.manage",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: Newspaper,
      title: "Gestion de contenu",
      description: "Créer et modérer les actualités, événements et expositions",
      href: "/admin/content",
      permission: "content.manage",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: ClockAlert,
      title: "Demandes en attente",
      description: "Traiter les demandes d'accès aux manuscrits",
      href: "/admin/access-requests",
      permission: "requests.manage",
      gradient: "from-orange-500 to-amber-600"
    },
    {
      icon: ArchiveRestore,
      title: "Archivage",
      description: "Configurer l'archivage automatique du contenu",
      href: "/admin/archiving",
      permission: "content.archive",
      gradient: "from-slate-500 to-slate-600"
    },
    {
      icon: PenSquare,
      title: "Éditeur WYSIWYG",
      description: "Éditeur visuel pour créer et modifier du contenu",
      href: "/admin/wysiwyg",
      permission: "content.manage",
      gradient: "from-pink-500 to-rose-600"
    },
    {
      icon: Coins,
      title: "Gestion des Tarifs BNRM",
      description: "Gérer les tarifs et services de la Bibliothèque Nationale",
      href: "/admin/bnrm-tariffs",
      permission: "content.manage",
      gradient: "from-yellow-500 to-yellow-600"
    },
    {
      icon: BookMarked,
      title: "Gestion du Dépôt Légal",
      description: "Interface complète de gestion du dépôt légal BNRM",
      href: "/admin/bnrm-backoffice",
      permission: "legal_deposit.manage",
      gradient: "from-emerald-500 to-emerald-600"
    },
    {
      icon: DatabaseZap,
      title: "Catalogue en Ligne - Métadonnées",
      description: "Gérer les métadonnées du catalogue, imports SIGB et exports",
      href: "/admin/catalog-metadata",
      permission: "content.manage",
      gradient: "from-cyan-500 to-teal-600"
    },
    {
      icon: FileImage,
      title: "Demandes de Reproduction",
      description: "Gérer les demandes de reproduction de documents - Validation et workflow",
      href: "/admin/reproduction",
      permission: "requests.manage",
      gradient: "from-red-500 to-red-600"
    },
    {
      icon: Languages,
      title: "Gestion des Traductions",
      description: "Traduire automatiquement le contenu dans les 4 langues avec validation",
      href: "/admin/translations",
      permission: "content.manage",
      gradient: "from-violet-500 to-purple-600"
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
                  <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/40">
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    <CardHeader className="relative">
                      <CardTitle className="flex items-center space-x-3">
                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <card.icon className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-lg group-hover:text-primary transition-colors">{card.title}</span>
                      </CardTitle>
                      <CardDescription className="text-base leading-relaxed mt-2">
                        {card.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <Button 
                        className="w-full group-hover:scale-105 transition-transform" 
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