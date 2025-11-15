import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Shield, 
  Check, 
  X,
  Library,
  BookOpen,
  Calendar,
  Archive,
  FileText,
  Users,
  Settings,
  Eye,
  Edit,
  Trash,
  Download,
  Upload,
  Search,
  Share2,
  Lock,
  Unlock,
  Database,
  FileCheck,
  UserCheck,
  Mail,
  Bell,
  BarChart3
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Permission {
  id: string;
  name: string;
  description: string;
  icon: any;
}

interface Module {
  id: string;
  name: string;
  description: string;
  icon: any;
  permissions: Permission[];
}

interface Platform {
  id: string;
  name: string;
  icon: any;
  color: string;
  modules: Module[];
}

interface RolePermissionsMatrixProps {
  searchQuery: string;
  selectedPlatform: string;
}

export function RolePermissionsMatrix({ searchQuery, selectedPlatform }: RolePermissionsMatrixProps) {
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});

  // Structure complète des plateformes, modules et permissions
  const platforms: Platform[] = [
    {
      id: "bnrm",
      name: "Portail BNRM",
      icon: Library,
      color: "bg-blue-500",
      modules: [
        {
          id: "content",
          name: "Gestion de Contenu",
          description: "Articles, actualités, publications",
          icon: FileText,
          permissions: [
            { id: "content.view", name: "Consulter", description: "Voir le contenu", icon: Eye },
            { id: "content.create", name: "Créer", description: "Créer du contenu", icon: Edit },
            { id: "content.edit", name: "Modifier", description: "Modifier le contenu", icon: Edit },
            { id: "content.delete", name: "Supprimer", description: "Supprimer le contenu", icon: Trash },
            { id: "content.publish", name: "Publier", description: "Publier le contenu", icon: Upload },
            { id: "content.archive", name: "Archiver", description: "Archiver le contenu", icon: Archive },
          ]
        },
        {
          id: "users",
          name: "Gestion Utilisateurs",
          description: "Comptes et profils utilisateurs",
          icon: Users,
          permissions: [
            { id: "users.view", name: "Consulter", description: "Voir les utilisateurs", icon: Eye },
            { id: "users.manage", name: "Gérer", description: "Gérer les utilisateurs", icon: Settings },
            { id: "users.roles", name: "Rôles", description: "Modifier les rôles", icon: Shield },
            { id: "users.delete", name: "Supprimer", description: "Supprimer des utilisateurs", icon: Trash },
          ]
        },
        {
          id: "analytics",
          name: "Statistiques et Rapports",
          description: "Analyse et reporting",
          icon: BarChart3,
          permissions: [
            { id: "analytics.view", name: "Consulter", description: "Voir les statistiques", icon: Eye },
            { id: "analytics.export", name: "Exporter", description: "Exporter les rapports", icon: Download },
            { id: "analytics.advanced", name: "Avancé", description: "Analyses avancées", icon: BarChart3 },
          ]
        },
        {
          id: "settings",
          name: "Paramètres Système",
          description: "Configuration globale",
          icon: Settings,
          permissions: [
            { id: "settings.view", name: "Consulter", description: "Voir les paramètres", icon: Eye },
            { id: "settings.edit", name: "Modifier", description: "Modifier les paramètres", icon: Edit },
            { id: "settings.security", name: "Sécurité", description: "Paramètres de sécurité", icon: Lock },
          ]
        }
      ]
    },
    {
      id: "digital_library",
      name: "Bibliothèque Numérique",
      icon: BookOpen,
      color: "bg-green-500",
      modules: [
        {
          id: "documents",
          name: "Documents Numériques",
          description: "Gestion des documents numérisés",
          icon: FileText,
          permissions: [
            { id: "documents.view", name: "Consulter", description: "Voir les documents", icon: Eye },
            { id: "documents.upload", name: "Téléverser", description: "Ajouter des documents", icon: Upload },
            { id: "documents.edit", name: "Modifier", description: "Modifier les métadonnées", icon: Edit },
            { id: "documents.delete", name: "Supprimer", description: "Supprimer des documents", icon: Trash },
            { id: "documents.download", name: "Télécharger", description: "Télécharger les fichiers", icon: Download },
            { id: "documents.share", name: "Partager", description: "Partager les documents", icon: Share2 },
          ]
        },
        {
          id: "cataloging",
          name: "Catalogage",
          description: "Métadonnées et classifications",
          icon: Database,
          permissions: [
            { id: "cataloging.view", name: "Consulter", description: "Voir le catalogue", icon: Eye },
            { id: "cataloging.create", name: "Créer", description: "Créer des notices", icon: Edit },
            { id: "cataloging.edit", name: "Modifier", description: "Modifier les notices", icon: Edit },
            { id: "cataloging.delete", name: "Supprimer", description: "Supprimer des notices", icon: Trash },
            { id: "cataloging.validate", name: "Valider", description: "Valider les notices", icon: FileCheck },
          ]
        },
        {
          id: "access_control",
          name: "Contrôle d'Accès",
          description: "Gestion des droits d'accès",
          icon: Lock,
          permissions: [
            { id: "access.view", name: "Consulter", description: "Voir les permissions", icon: Eye },
            { id: "access.manage", name: "Gérer", description: "Gérer les accès", icon: Settings },
            { id: "access.grant", name: "Accorder", description: "Accorder des permissions", icon: Unlock },
            { id: "access.revoke", name: "Révoquer", description: "Révoquer des permissions", icon: Lock },
          ]
        },
        {
          id: "search",
          name: "Recherche Avancée",
          description: "Moteur de recherche",
          icon: Search,
          permissions: [
            { id: "search.basic", name: "Basique", description: "Recherche simple", icon: Search },
            { id: "search.advanced", name: "Avancée", description: "Recherche avancée", icon: Search },
            { id: "search.export", name: "Exporter", description: "Exporter les résultats", icon: Download },
          ]
        }
      ]
    },
    {
      id: "manuscripts",
      name: "Plateforme Manuscrits",
      icon: FileText,
      color: "bg-amber-500",
      modules: [
        {
          id: "manuscripts_catalog",
          name: "Catalogue Manuscrits",
          description: "Inventaire et description",
          icon: BookOpen,
          permissions: [
            { id: "manuscripts.view", name: "Consulter", description: "Voir les manuscrits", icon: Eye },
            { id: "manuscripts.create", name: "Créer", description: "Créer des fiches", icon: Edit },
            { id: "manuscripts.edit", name: "Modifier", description: "Modifier les fiches", icon: Edit },
            { id: "manuscripts.delete", name: "Supprimer", description: "Supprimer des fiches", icon: Trash },
            { id: "manuscripts.digitize", name: "Numériser", description: "Gérer la numérisation", icon: Upload },
          ]
        },
        {
          id: "manuscripts_conservation",
          name: "Conservation",
          description: "État et restauration",
          icon: Shield,
          permissions: [
            { id: "conservation.view", name: "Consulter", description: "Voir l'état", icon: Eye },
            { id: "conservation.update", name: "Mettre à jour", description: "Mettre à jour l'état", icon: Edit },
            { id: "conservation.restore", name: "Restaurer", description: "Gérer la restauration", icon: Settings },
          ]
        },
        {
          id: "manuscripts_access",
          name: "Demandes d'Accès",
          description: "Gestion des demandes",
          icon: UserCheck,
          permissions: [
            { id: "manuscripts.request", name: "Demander", description: "Faire une demande", icon: Mail },
            { id: "manuscripts.approve", name: "Approuver", description: "Approuver les demandes", icon: Check },
            { id: "manuscripts.reject", name: "Rejeter", description: "Rejeter les demandes", icon: X },
          ]
        },
        {
          id: "manuscripts_research",
          name: "Recherche Scientifique",
          description: "Outils de recherche",
          icon: Search,
          permissions: [
            { id: "research.access", name: "Accès", description: "Accès aux outils", icon: Eye },
            { id: "research.collaborate", name: "Collaborer", description: "Collaboration", icon: Users },
            { id: "research.publish", name: "Publier", description: "Publier des recherches", icon: Upload },
          ]
        }
      ]
    },
    {
      id: "cbm",
      name: "Plateforme CBM",
      icon: Archive,
      color: "bg-purple-500",
      modules: [
        {
          id: "cbm_network",
          name: "Réseau CBM",
          description: "Gestion du réseau de bibliothèques",
          icon: Users,
          permissions: [
            { id: "cbm.view", name: "Consulter", description: "Voir le réseau", icon: Eye },
            { id: "cbm.manage_members", name: "Gérer Membres", description: "Gérer les membres", icon: Users },
            { id: "cbm.approve", name: "Approuver", description: "Approuver les adhésions", icon: Check },
          ]
        },
        {
          id: "cbm_catalog",
          name: "Catalogue Collectif",
          description: "Catalogue partagé",
          icon: Database,
          permissions: [
            { id: "cbm_catalog.view", name: "Consulter", description: "Voir le catalogue", icon: Eye },
            { id: "cbm_catalog.contribute", name: "Contribuer", description: "Ajouter des notices", icon: Upload },
            { id: "cbm_catalog.edit", name: "Modifier", description: "Modifier les notices", icon: Edit },
            { id: "cbm_catalog.validate", name: "Valider", description: "Valider les notices", icon: FileCheck },
          ]
        },
        {
          id: "cbm_training",
          name: "Formation",
          description: "Programmes de formation",
          icon: BookOpen,
          permissions: [
            { id: "cbm_training.view", name: "Consulter", description: "Voir les formations", icon: Eye },
            { id: "cbm_training.register", name: "S'inscrire", description: "S'inscrire aux formations", icon: UserCheck },
            { id: "cbm_training.manage", name: "Gérer", description: "Gérer les formations", icon: Settings },
          ]
        },
        {
          id: "cbm_resources",
          name: "Ressources Partagées",
          description: "Partage de ressources",
          icon: Share2,
          permissions: [
            { id: "cbm_resources.access", name: "Accéder", description: "Accéder aux ressources", icon: Eye },
            { id: "cbm_resources.share", name: "Partager", description: "Partager des ressources", icon: Share2 },
            { id: "cbm_resources.manage", name: "Gérer", description: "Gérer les ressources", icon: Settings },
          ]
        }
      ]
    },
    {
      id: "kitab",
      name: "Plateforme Kitab",
      icon: BookOpen,
      color: "bg-rose-500",
      modules: [
        {
          id: "kitab_legal_deposit",
          name: "Dépôt Légal",
          description: "Gestion du dépôt légal",
          icon: FileCheck,
          permissions: [
            { id: "kitab.deposit", name: "Déposer", description: "Faire un dépôt", icon: Upload },
            { id: "kitab.validate", name: "Valider", description: "Valider les dépôts", icon: Check },
            { id: "kitab.manage", name: "Gérer", description: "Gérer les dépôts", icon: Settings },
            { id: "kitab.export", name: "Exporter", description: "Exporter les données", icon: Download },
          ]
        },
        {
          id: "kitab_isbn",
          name: "ISBN/ISSN",
          description: "Attribution d'identifiants",
          icon: Database,
          permissions: [
            { id: "isbn.request", name: "Demander", description: "Demander un ISBN", icon: Mail },
            { id: "isbn.assign", name: "Attribuer", description: "Attribuer des ISBN", icon: Check },
            { id: "isbn.manage", name: "Gérer", description: "Gérer les ISBN", icon: Settings },
          ]
        },
        {
          id: "kitab_publishers",
          name: "Éditeurs",
          description: "Gestion des éditeurs",
          icon: Users,
          permissions: [
            { id: "publishers.view", name: "Consulter", description: "Voir les éditeurs", icon: Eye },
            { id: "publishers.register", name: "Enregistrer", description: "Enregistrer des éditeurs", icon: UserCheck },
            { id: "publishers.manage", name: "Gérer", description: "Gérer les éditeurs", icon: Settings },
          ]
        },
        {
          id: "kitab_statistics",
          name: "Statistiques Édition",
          description: "Statistiques du secteur",
          icon: BarChart3,
          permissions: [
            { id: "kitab_stats.view", name: "Consulter", description: "Voir les statistiques", icon: Eye },
            { id: "kitab_stats.generate", name: "Générer", description: "Générer des rapports", icon: BarChart3 },
            { id: "kitab_stats.export", name: "Exporter", description: "Exporter les données", icon: Download },
          ]
        }
      ]
    },
    {
      id: "cultural",
      name: "Activités Culturelles",
      icon: Calendar,
      color: "bg-cyan-500",
      modules: [
        {
          id: "events",
          name: "Événements",
          description: "Gestion des événements",
          icon: Calendar,
          permissions: [
            { id: "events.view", name: "Consulter", description: "Voir les événements", icon: Eye },
            { id: "events.create", name: "Créer", description: "Créer des événements", icon: Edit },
            { id: "events.edit", name: "Modifier", description: "Modifier les événements", icon: Edit },
            { id: "events.delete", name: "Supprimer", description: "Supprimer des événements", icon: Trash },
            { id: "events.publish", name: "Publier", description: "Publier les événements", icon: Upload },
          ]
        },
        {
          id: "spaces",
          name: "Espaces Culturels",
          description: "Gestion des espaces",
          icon: Library,
          permissions: [
            { id: "spaces.view", name: "Consulter", description: "Voir les espaces", icon: Eye },
            { id: "spaces.manage", name: "Gérer", description: "Gérer les espaces", icon: Settings },
            { id: "spaces.book", name: "Réserver", description: "Réserver des espaces", icon: Calendar },
          ]
        },
        {
          id: "bookings",
          name: "Réservations",
          description: "Gestion des réservations",
          icon: UserCheck,
          permissions: [
            { id: "bookings.view", name: "Consulter", description: "Voir les réservations", icon: Eye },
            { id: "bookings.create", name: "Créer", description: "Créer des réservations", icon: Edit },
            { id: "bookings.approve", name: "Approuver", description: "Approuver les réservations", icon: Check },
            { id: "bookings.reject", name: "Rejeter", description: "Rejeter les réservations", icon: X },
          ]
        },
        {
          id: "activities",
          name: "Programmes Culturels",
          description: "Activités et programmes",
          icon: Calendar,
          permissions: [
            { id: "activities.view", name: "Consulter", description: "Voir les activités", icon: Eye },
            { id: "activities.create", name: "Créer", description: "Créer des activités", icon: Edit },
            { id: "activities.manage", name: "Gérer", description: "Gérer les activités", icon: Settings },
            { id: "activities.report", name: "Rapporter", description: "Générer des rapports", icon: BarChart3 },
          ]
        },
        {
          id: "notifications",
          name: "Notifications",
          description: "Communication avec le public",
          icon: Bell,
          permissions: [
            { id: "notifications.send", name: "Envoyer", description: "Envoyer des notifications", icon: Mail },
            { id: "notifications.manage", name: "Gérer", description: "Gérer les notifications", icon: Settings },
          ]
        }
      ]
    }
  ];

  const roles = [
    { id: "admin", name: "Administrateur", color: "bg-red-500", description: "Accès complet" },
    { id: "librarian", name: "Bibliothécaire", color: "bg-blue-500", description: "Gestion bibliothèque" },
    { id: "cataloger", name: "Catalogueur", color: "bg-green-500", description: "Catalogage" },
    { id: "editor", name: "Éditeur", color: "bg-purple-500", description: "Gestion contenu" },
    { id: "researcher", name: "Chercheur", color: "bg-amber-500", description: "Recherche" },
    { id: "reader", name: "Lecteur", color: "bg-gray-500", description: "Consultation" },
  ];

  // Filtrer les plateformes selon la sélection
  const filteredPlatforms = useMemo(() => {
    let filtered = selectedPlatform === "all" ? platforms : platforms.filter(p => p.id === selectedPlatform);
    
    if (searchQuery) {
      filtered = filtered.map(platform => ({
        ...platform,
        modules: platform.modules.filter(module => 
          module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          module.permissions.some(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
      })).filter(platform => platform.modules.length > 0);
    }
    
    return filtered;
  }, [selectedPlatform, searchQuery]);

  const togglePermission = (roleId: string, permissionId: string) => {
    setPermissions(prev => ({
      ...prev,
      [roleId]: {
        ...(prev[roleId] || {}),
        [permissionId]: !(prev[roleId]?.[permissionId] || false)
      }
    }));
  };

  const hasPermission = (roleId: string, permissionId: string) => {
    return permissions[roleId]?.[permissionId] || false;
  };

  return (
    <div className="space-y-6">
      {/* Platforms and Modules */}
      {filteredPlatforms.map((platform) => {
        const PlatformIcon = platform.icon;
        return (
          <Card key={platform.id}>
            <CardHeader className={`${platform.color} text-white`}>
              <CardTitle className="flex items-center gap-3">
                <PlatformIcon className="h-6 w-6" />
                {platform.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion type="multiple" className="w-full">
                {platform.modules.map((module) => {
                  const ModuleIcon = module.icon;
                  return (
                    <AccordionItem key={module.id} value={module.id}>
                      <AccordionTrigger className="px-6 hover:bg-muted/50">
                        <div className="flex items-center gap-3 text-left">
                          <ModuleIcon className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-semibold">{module.name}</div>
                            <div className="text-sm text-muted-foreground">{module.description}</div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <ScrollArea className="w-full">
                          <div className="min-w-full">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-3 px-4 font-semibold">Permission</th>
                                  {roles.map((role) => (
                                    <th key={role.id} className="text-center py-3 px-4">
                                      <Badge className={`${role.color} text-white`}>
                                        {role.name}
                                      </Badge>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {module.permissions.map((permission) => {
                                  const PermIcon = permission.icon;
                                  return (
                                    <tr key={permission.id} className="border-b hover:bg-muted/50">
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                          <PermIcon className="h-4 w-4 text-muted-foreground" />
                                          <div>
                                            <div className="font-medium">{permission.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                              {permission.description}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      {roles.map((role) => (
                                        <td key={role.id} className="py-3 px-4 text-center">
                                          <Switch
                                            checked={hasPermission(role.id, permission.id)}
                                            onCheckedChange={() => togglePermission(role.id, permission.id)}
                                          />
                                        </td>
                                      ))}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        );
      })}

      {filteredPlatforms.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Aucun résultat trouvé pour "{searchQuery}"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
