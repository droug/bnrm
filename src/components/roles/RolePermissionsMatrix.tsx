import { useState, useMemo, useCallback } from "react";
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
  BarChart3,
  Loader2,
  Save,
  RefreshCw
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database as DBTypes } from "@/integrations/supabase/types";

type UserRole = DBTypes['public']['Enums']['user_role'];

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

// Liste des 17 rôles enum du système
const SYSTEM_ROLES: { id: UserRole; name: string; color: string; description: string }[] = [
  { id: "admin", name: "Administrateur", color: "bg-red-500", description: "Accès complet" },
  { id: "librarian", name: "Bibliothécaire", color: "bg-blue-500", description: "Gestion bibliothèque" },
  { id: "validateur", name: "Validateur DL", color: "bg-fuchsia-500", description: "Validation dépôt légal" },
  { id: "dac", name: "DAC", color: "bg-rose-500", description: "Affaires culturelles" },
  { id: "comptable", name: "Comptable", color: "bg-lime-500", description: "Gestion financière" },
  { id: "direction", name: "Direction", color: "bg-sky-500", description: "Direction BNRM" },
  { id: "editor", name: "Éditeur", color: "bg-purple-500", description: "Maison d'édition" },
  { id: "printer", name: "Imprimeur", color: "bg-pink-500", description: "Imprimerie" },
  { id: "producer", name: "Producteur", color: "bg-orange-500", description: "Production AV" },
  { id: "author", name: "Auteur", color: "bg-cyan-500", description: "Auteur/Écrivain" },
  { id: "researcher", name: "Chercheur", color: "bg-emerald-500", description: "Recherche" },
  { id: "subscriber", name: "Abonné", color: "bg-violet-500", description: "Abonné premium" },
  { id: "partner", name: "Partenaire", color: "bg-amber-500", description: "Institution partenaire" },
  { id: "visitor", name: "Visiteur", color: "bg-gray-400", description: "Lecture seule" },
  { id: "public_user", name: "Grand Public", color: "bg-teal-500", description: "Utilisateur inscrit" },
  { id: "distributor", name: "Distributeur", color: "bg-indigo-500", description: "Distribution" },
  { id: "read_only", name: "Lecture Seule", color: "bg-slate-500", description: "Accès restreint" },
];

export function RolePermissionsMatrix({ searchQuery, selectedPlatform }: RolePermissionsMatrixProps) {
  const queryClient = useQueryClient();
  const [pendingChanges, setPendingChanges] = useState<Map<string, { roleCode: UserRole; permissionId: string; granted: boolean }>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  // Charger les permissions depuis la base
  const { data: dbPermissions = [], isLoading: loadingDbPermissions } = useQuery({
    queryKey: ['db-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('category')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Charger les affectations role_permissions
  const { data: rolePermissionsData = [], isLoading: loadingRolePerms, refetch: refetchRolePerms } = useQuery({
    queryKey: ['all-role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('granted', true);
      if (error) throw error;
      return data;
    },
  });

  // Créer un index pour vérifier rapidement les permissions
  const permissionsIndex = useMemo(() => {
    const index = new Map<string, boolean>();
    rolePermissionsData.forEach(rp => {
      const key = `${rp.role}:${rp.permission_id}`;
      index.set(key, rp.granted);
    });
    // Appliquer les changements en attente
    pendingChanges.forEach((change, key) => {
      index.set(key, change.granted);
    });
    return index;
  }, [rolePermissionsData, pendingChanges]);

  const hasPermission = useCallback((roleId: UserRole, permissionId: string) => {
    const key = `${roleId}:${permissionId}`;
    return permissionsIndex.get(key) || false;
  }, [permissionsIndex]);

  const togglePermission = useCallback((roleId: UserRole, permissionId: string) => {
    const key = `${roleId}:${permissionId}`;
    const currentValue = hasPermission(roleId, permissionId);
    
    setPendingChanges(prev => {
      const next = new Map(prev);
      next.set(key, { roleCode: roleId, permissionId, granted: !currentValue });
      return next;
    });
  }, [hasPermission]);

  // Sauvegarder les changements
  const saveChanges = async () => {
    if (pendingChanges.size === 0) return;
    
    setIsSaving(true);
    try {
      for (const [key, change] of pendingChanges) {
        // Vérifier si l'entrée existe déjà
        const { data: existing } = await supabase
          .from('role_permissions')
          .select('id')
          .eq('role', change.roleCode)
          .eq('permission_id', change.permissionId)
          .single();

        if (existing) {
          // Mettre à jour
          await supabase
            .from('role_permissions')
            .update({ granted: change.granted })
            .eq('id', existing.id);
        } else if (change.granted) {
          // Insérer seulement si on accorde la permission
          await supabase
            .from('role_permissions')
            .insert({
              role: change.roleCode,
              permission_id: change.permissionId,
              granted: true,
            });
        }
      }
      
      toast.success("Permissions enregistrées", {
        description: `${pendingChanges.size} modification(s) sauvegardée(s)`,
      });
      setPendingChanges(new Map());
      refetchRolePerms();
    } catch (error: any) {
      toast.error("Erreur", {
        description: error.message || "Impossible de sauvegarder les permissions",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Grouper les permissions par catégorie pour l'affichage
  const permissionsByCategory = useMemo(() => {
    const grouped: Record<string, typeof dbPermissions> = {};
    dbPermissions.forEach(p => {
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category].push(p);
    });
    return grouped;
  }, [dbPermissions]);

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
    },
    {
      id: "vexpo360",
      name: "VExpo360 - Expositions Virtuelles",
      icon: Database,
      color: "bg-violet-500",
      modules: [
        {
          id: "vexpo_exhibitions",
          name: "Expositions",
          description: "Gestion des expositions virtuelles 360°",
          icon: Database,
          permissions: [
            { id: "vexpo.view", name: "Consulter", description: "Voir les expositions", icon: Eye },
            { id: "vexpo.create", name: "Créer", description: "Créer des expositions", icon: Edit },
            { id: "vexpo.edit", name: "Modifier", description: "Modifier les expositions", icon: Edit },
            { id: "vexpo.publish", name: "Publier", description: "Publier les expositions", icon: Upload },
            { id: "vexpo.delete", name: "Supprimer", description: "Supprimer des expositions", icon: Trash },
          ]
        },
        {
          id: "vexpo_galleries",
          name: "Galeries",
          description: "Gestion des galeries d'exposition",
          icon: Database,
          permissions: [
            { id: "vexpo_galleries.view", name: "Consulter", description: "Voir les galeries", icon: Eye },
            { id: "vexpo_galleries.manage", name: "Gérer", description: "Gérer les galeries", icon: Settings },
          ]
        },
        {
          id: "vexpo_media",
          name: "Médias",
          description: "Gestion des médias d'exposition",
          icon: Upload,
          permissions: [
            { id: "vexpo_media.upload", name: "Téléverser", description: "Ajouter des médias", icon: Upload },
            { id: "vexpo_media.manage", name: "Gérer", description: "Gérer les médias", icon: Settings },
          ]
        },
        {
          id: "vexpo_roles",
          name: "Rôles VExpo",
          description: "Gestion des rôles super_admin, editor, reviewer",
          icon: Shield,
          permissions: [
            { id: "vexpo_roles.view", name: "Consulter", description: "Voir les rôles VExpo", icon: Eye },
            { id: "vexpo_roles.assign", name: "Attribuer", description: "Attribuer des rôles", icon: UserCheck },
            { id: "vexpo_roles.manage", name: "Gérer", description: "Gérer les rôles", icon: Settings },
          ]
        }
      ]
    },
    {
      id: "cbn",
      name: "Catalogue Bibliothèque Nationale",
      icon: Database,
      color: "bg-teal-500",
      modules: [
        {
          id: "cbn_catalog",
          name: "Catalogue CBN",
          description: "Catalogue général",
          icon: Database,
          permissions: [
            { id: "cbn.view", name: "Consulter", description: "Voir le catalogue", icon: Eye },
            { id: "cbn.create", name: "Créer", description: "Créer des notices", icon: Edit },
            { id: "cbn.edit", name: "Modifier", description: "Modifier des notices", icon: Edit },
            { id: "cbn.validate", name: "Valider", description: "Valider des notices", icon: FileCheck },
            { id: "cbn.delete", name: "Supprimer", description: "Supprimer des notices", icon: Trash },
          ]
        },
        {
          id: "cbn_acquisitions",
          name: "Acquisitions",
          description: "Gestion des acquisitions",
          icon: Database,
          permissions: [
            { id: "cbn_acquisitions.propose", name: "Proposer", description: "Proposer des acquisitions", icon: Edit },
            { id: "cbn_acquisitions.approve", name: "Approuver", description: "Approuver des acquisitions", icon: Check },
            { id: "cbn_acquisitions.manage", name: "Gérer", description: "Gérer les acquisitions", icon: Settings },
          ]
        },
        {
          id: "cbn_periodicals",
          name: "Périodiques",
          description: "Gestion des périodiques et abonnements",
          icon: FileText,
          permissions: [
            { id: "cbn_periodicals.view", name: "Consulter", description: "Voir les périodiques", icon: Eye },
            { id: "cbn_periodicals.manage", name: "Gérer", description: "Gérer les abonnements", icon: Settings },
          ]
        }
      ]
    }
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

  const isLoading = loadingDbPermissions || loadingRolePerms;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barre d'actions avec indicateur de changements */}
      {pendingChanges.size > 0 && (
        <Card className="border-amber-500/50 bg-amber-50/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-700">
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                  {pendingChanges.size} modification(s) en attente
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPendingChanges(new Map())}
                >
                  Annuler
                </Button>
                <Button 
                  size="sm"
                  onClick={saveChanges}
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Enregistrer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                          <div className="min-w-full overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-3 px-4 font-semibold sticky left-0 bg-background z-10">Permission</th>
                                  {SYSTEM_ROLES.slice(0, 8).map((role) => (
                                    <th key={role.id} className="text-center py-3 px-2 min-w-[100px]">
                                      <Badge className={`${role.color} text-white text-xs`}>
                                        {role.name}
                                      </Badge>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {module.permissions.map((permission) => {
                                  const PermIcon = permission.icon;
                                  // Trouver le permission_id dans la base
                                  const dbPerm = dbPermissions.find(p => p.name === permission.id);
                                  
                                  return (
                                    <tr key={permission.id} className="border-b hover:bg-muted/50">
                                      <td className="py-3 px-4 sticky left-0 bg-background z-10">
                                        <div className="flex items-center gap-3">
                                          <PermIcon className="h-4 w-4 text-muted-foreground" />
                                          <div>
                                            <code className="text-xs bg-muted px-1 py-0.5 rounded">{permission.id}</code>
                                            <div className="text-xs text-muted-foreground mt-1">
                                              {permission.description}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      {SYSTEM_ROLES.slice(0, 8).map((role) => (
                                        <td key={role.id} className="py-3 px-2 text-center">
                                          <Switch
                                            checked={dbPerm ? hasPermission(role.id, dbPerm.id) : false}
                                            onCheckedChange={() => dbPerm && togglePermission(role.id, dbPerm.id)}
                                            disabled={!dbPerm}
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

      {/* Section avec les permissions de la base (par catégorie) */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="flex items-center gap-3">
            <Database className="h-6 w-6 text-primary" />
            Permissions Base de Données
          </CardTitle>
          <CardDescription>
            Toutes les permissions configurées dans la base ({dbPermissions.length})
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Accordion type="multiple" className="w-full">
            {Object.entries(permissionsByCategory).map(([category, perms]) => (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="px-6 hover:bg-muted/50">
                  <div className="flex items-center gap-3 text-left">
                    <FileCheck className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold capitalize">{category.replace(/_/g, ' ')}</div>
                      <div className="text-sm text-muted-foreground">{perms.length} permissions</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <ScrollArea className="w-full">
                    <div className="min-w-full overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold sticky left-0 bg-background z-10">Permission</th>
                            {SYSTEM_ROLES.slice(0, 8).map((role) => (
                              <th key={role.id} className="text-center py-3 px-2 min-w-[90px]">
                                <Badge className={`${role.color} text-white text-xs`}>
                                  {role.name.substring(0, 6)}
                                </Badge>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {perms.map((perm) => (
                            <tr key={perm.id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4 sticky left-0 bg-background z-10">
                                <div>
                                  <code className="text-xs bg-muted px-1 py-0.5 rounded">{perm.name}</code>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {perm.description}
                                  </div>
                                </div>
                              </td>
                              {SYSTEM_ROLES.slice(0, 8).map((role) => (
                                <td key={role.id} className="py-3 px-2 text-center">
                                  <Switch
                                    checked={hasPermission(role.id, perm.id)}
                                    onCheckedChange={() => togglePermission(role.id, perm.id)}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {filteredPlatforms.length === 0 && Object.keys(permissionsByCategory).length === 0 && (
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
