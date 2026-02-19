import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Shield, FileText, Clock, Archive, Scale, ArrowLeft, Edit, DollarSign, BookOpen, Users, Database, Copy, Library, ShieldCheck, UserCog, Newspaper, ClockAlert, ArchiveRestore, PenSquare, Coins, BookMarked, DatabaseZap, FileImage, BookOpenCheck, Languages, Mail, GitBranch, List, Sliders, FolderTree, Wrench, Home, FormInput, Network, MapPin, Bell, Activity, ScrollText, Heart, CreditCard } from "lucide-react";
import { PermissionGuard } from "@/hooks/usePermissions";
import { WatermarkContainer } from "@/components/ui/watermark";
import { AdminHeader } from "@/components/AdminHeader";
import { useNavigate } from "react-router-dom";
import { CreateTestDepositButton } from "@/components/admin/CreateTestDepositButton";
import { ExternalSystemsConfig } from "@/components/admin/ExternalSystemsConfig";
import { SmtpConfigCard } from "@/components/admin/SmtpConfigCard";
import logoImage from "@/assets/logo-bnrm-officiel.png";

export default function AdminSettings() {
  const navigate = useNavigate();
  const [showInterconnections, setShowInterconnections] = useState(false);
  
  // Cartes de gestion des demandes
  const requestCards = [
    {
      icon: ClockAlert,
      title: "Demandes Accès en attente",
      description: "Traiter les demandes d'accès et Abonnements",
      href: "/admin/access-requests",
      permission: "requests.manage",
      gradient: "from-orange-500 to-amber-600"
    },
    {
      icon: BookOpenCheck,
      title: "Gestion des Réservations d'Ouvrages",
      description: "Gérer les réservations d'ouvrages, Validation et traitement",
      href: "/admin/reservations-ouvrages",
      permission: "requests.manage",
      gradient: "from-indigo-500 to-blue-600"
    },
    {
      icon: MapPin,
      title: "Demandes de Locations",
      description: "Gérer les demandes de location d'espaces et la disponibilité",
      href: "/admin/rental-management",
      permission: "requests.manage",
      gradient: "from-teal-500 to-cyan-600"
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
      icon: UserCog,
      title: "Demandes Professionnelles",
      description: "Inviter et valider les inscriptions des professionnels",
      href: "/admin/professional-management",
      permission: "users.manage",
      gradient: "from-indigo-500 to-indigo-600"
    },
    {
      icon: Wrench,
      title: "Demandes de restauration",
      description: "Gestion des demandes de restauration de manuscrits",
      href: "/admin/restoration-requests",
      permission: "content.manage",
      gradient: "from-orange-500 to-orange-600"
    }
  ];

  // Autres cartes de paramétrage
  const otherCards = [
    {
      icon: BookMarked,
      title: "Gestion du Dépôt Légal",
      description: "Interface complète de gestion du dépôt légal BNRM",
      href: "/admin/depot-legal",
      permission: "legal_deposit.manage",
      gradient: "from-emerald-500 to-emerald-600"
    },
    {
      icon: Heart,
      title: "Gestion du Mécénat",
      description: "Gérer les donateurs, donations et propositions de dons",
      href: "/admin/mecenat",
      permission: "content.manage",
      gradient: "from-gold-primary to-amber-600"
    },
    {
      icon: Activity,
      title: "Monitoring & Analytics",
      description: "Surveiller l'état des services, métriques de performance et statistiques en temps réel",
      href: "/admin/monitoring",
      permission: "content.manage",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      icon: ScrollText,
      title: "Journalisation & Traçabilité",
      description: "Historique complet des actions, audit trail et rapports de conformité",
      href: "/admin/audit-logs",
      permission: "content.manage",
      gradient: "from-slate-600 to-zinc-700"
    },
    {
      icon: Bell,
      title: "Paramètres de Notifications",
      description: "Configurer les notifications par email, système et SMS pour toutes les actions",
      href: "/admin/notifications",
      permission: "content.manage",
      gradient: "from-rose-500 to-pink-600"
    },
    {
      icon: CreditCard,
      title: "Paiement Électronique",
      description: "Paramétrage de l'interconnexion CMI et Stripe",
      href: "/admin/payment-gateway",
      permission: "content.manage",
      gradient: "from-primary to-primary"
    },
    {
      icon: ShieldCheck,
      title: "Gestion des Droits et Permissions",
      description: "Gérer les rôles et les permissions d'accès au système",
      href: "/admin/roles",
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
      href: "/admin/content-management-portail-BNRM",
      permission: "content.manage",
      gradient: "from-blue-500 to-blue-600"
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
      icon: Coins,
      title: "Gestion des Tarifs BNRM",
      description: "Gérer les tarifs et services de la Bibliothèque Nationale",
      href: "/admin/bnrm-tariffs",
      permission: "content.manage",
      gradient: "from-yellow-500 to-yellow-600"
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
      icon: Languages,
      title: "Gestion des Traductions",
      description: "Traduire automatiquement le contenu dans les 4 langues avec validation",
      href: "/admin/translations",
      permission: "content.manage",
      gradient: "from-violet-500 to-purple-600"
    },
    {
      icon: Mail,
      title: "Gestion des Emails",
      description: "Gérer les campagnes de mailing de masse et les modèles d'emails",
      href: "/admin/email-management",
      permission: "content.manage",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: GitBranch,
      title: "Moteur de Workflows BPM",
      description: "Gérer les workflows et circuits de validation inter-modules",
      href: "/admin/workflow-bpm",
      permission: "content.manage",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: List,
      title: "Gestion des listes système",
      description: "Paramétrer les listes déroulantes et leurs valeurs",
      href: "/admin/system-lists",
      permission: "content.manage",
      gradient: "from-slate-500 to-gray-600"
    },
    {
      icon: Sliders,
      title: "Règles et variables système",
      description: "Configuration des paramètres globaux de toutes les plateformes",
      href: "/admin/activites-culturelles/regles-systeme",
      permission: "content.manage",
      gradient: "from-amber-500 to-amber-600"
    },
    {
      icon: FolderTree,
      title: "Catégories générales",
      description: "Gestion des catégories transversales utilisées dans toutes les plateformes",
      href: "/admin/activites-culturelles/categories",
      permission: "content.manage",
      gradient: "from-rose-500 to-rose-600"
    },
    {
      icon: BookMarked,
      title: "Gestion des Cotes",
      description: "Collections, villes et nomenclatures de fichiers BNRM",
      href: "/admin/cote-management",
      permission: "content.manage",
      gradient: "from-amber-500 to-amber-600"
    },
    {
      icon: FormInput,
      title: "Gestion des champs",
      description: "Builder universel pour ajouter et configurer des champs sur les formulaires",
      href: "/admin/form-builder",
      permission: "content.manage",
      gradient: "from-teal-500 to-teal-600"
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
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <Settings className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Administration et Paramétrage</h1>
                  <p className="text-muted-foreground mt-2">
                    Gérez les paramètres système et les fonctionnalités administratives
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/my-space')}
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <Home className="h-5 w-5" />
                Mon Espace
              </Button>
            </div>
            
            {/* Bouton de création de test */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>🧪 Environnement de Test</CardTitle>
                  <CardDescription>
                    Créer des données de test pour le système de dépôt légal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreateTestDepositButton />
                </CardContent>
              </Card>
            </div>
            
            {/* Interconnexions avec systèmes externes */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Network className="h-6 w-6" />
                        Interconnexions
                      </CardTitle>
                      <CardDescription>
                        Configuration des interconnexions avec les systèmes externes (SIGB, DBM-600, Catalogues, Z39.50, OAI-PMH, Active Directory, KOHA)
                      </CardDescription>
                    </div>
                    <Button 
                      variant={showInterconnections ? "secondary" : "default"}
                      onClick={() => setShowInterconnections(!showInterconnections)}
                    >
                      {showInterconnections ? 'Masquer' : 'Configurer'}
                    </Button>
                  </div>
                </CardHeader>
                {showInterconnections && (
                  <CardContent>
                    <ExternalSystemsConfig />
                  </CardContent>
                )}
              </Card>
            </div>
            
            {/* Configuration Notification Mail - SMTP */}
            <div className="mb-8">
              <SmtpConfigCard />
            </div>
            
            {/* Section Gestion des Demandes */}
            <div className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <ClockAlert className="h-6 w-6 text-orange-500" />
                  Gestion des Demandes
                </h2>
                <p className="text-muted-foreground mt-1">
                  Traiter et gérer toutes les demandes des usagers
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {requestCards.map((card) => (
                  <PermissionGuard key={card.title} permission={card.permission}>
                     <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/40 flex flex-col">
                       <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                       <CardHeader className="relative flex-grow">
                         <CardTitle className="flex items-center space-x-3">
                           <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300 flex items-center justify-center`}>
                             <img src={logoImage} alt="BNRM" className="h-8 w-8 object-contain brightness-0 invert" />
                           </div>
                           <span className="text-lg group-hover:text-primary transition-colors">{card.title}</span>
                         </CardTitle>
                         <CardDescription className="text-base leading-relaxed mt-2">
                          {card.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="relative mt-auto">
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

            {/* Section Autres Paramètres */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Settings className="h-6 w-6 text-primary" />
                  Autres Paramètres
                </h2>
                <p className="text-muted-foreground mt-1">
                  Configuration et gestion des différents modules du système
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {otherCards.map((card) => (
                  <PermissionGuard key={card.title} permission={card.permission}>
                     <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/40 flex flex-col">
                       <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                       <CardHeader className="relative flex-grow">
                         <CardTitle className="flex items-center space-x-3">
                           <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300 flex items-center justify-center`}>
                             <img src={logoImage} alt="BNRM" className="h-8 w-8 object-contain brightness-0 invert" />
                           </div>
                           <span className="text-lg group-hover:text-primary transition-colors">{card.title}</span>
                         </CardTitle>
                         <CardDescription className="text-base leading-relaxed mt-2">
                          {card.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="relative mt-auto">
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
          </div>
        </main>
      </div>
    </WatermarkContainer>
  );
}