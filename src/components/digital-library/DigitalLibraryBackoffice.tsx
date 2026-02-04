import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, Trash2, Eye, EyeOff, Download, Share2, Mail, AlertCircle, FileText, Library, Ban, Shield, Calendar, BarChart3, Image, Copy, BookOpen, Users, Sparkles, FileImage, ShieldCheck, CalendarClock, UploadCloud, Lock, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

export default function DigitalLibraryBackoffice() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showRestrictDialog, setShowRestrictDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  // Fetch digital library documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['digital-library-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .in('content_type', ['page', 'news'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch download restrictions
  const { data: restrictions } = useQuery({
    queryKey: ['download-restrictions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('download_restrictions')
        .select('*, content(title)');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch documents with expiring copyright
  const { data: expiringDocs } = useQuery({
    queryKey: ['expiring-copyrights'],
    queryFn: async () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 3);
      
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .in('content_type', ['page', 'news'])
        .not('copyright_expires_at', 'is', null)
        .lte('copyright_expires_at', futureDate.toISOString())
        .order('copyright_expires_at', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Toggle document visibility
  const toggleVisibility = useMutation({
    mutationFn: async ({ id, isVisible }: { id: string; isVisible: boolean }) => {
      const { error } = await supabase
        .from('content')
        .update({ is_visible: !isVisible })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
      toast({ title: "Visibilité mise à jour" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de modifier la visibilité", variant: "destructive" });
    }
  });

  // Toggle download
  const toggleDownload = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('content')
        .update({ download_enabled: !enabled })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
      toast({ title: "Téléchargement mis à jour" });
    }
  });

  // Toggle social sharing
  const toggleSocialShare = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('content')
        .update({ social_share_enabled: !enabled })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
      toast({ title: "Partage social mis à jour" });
    }
  });

  // Toggle email sharing
  const toggleEmailShare = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('content')
        .update({ email_share_enabled: !enabled })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
      toast({ title: "Partage par email mis à jour" });
    }
  });

  // Delete document
  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
      toast({ title: "Document supprimé" });
    }
  });

  // Add download restriction
  const addRestriction = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('download_restrictions')
        .insert(data);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['download-restrictions'] });
      setShowRestrictDialog(false);
      toast({ title: "Restriction ajoutée" });
    }
  });

  const menuCards = [
    {
      icon: FileText,
      title: "Système de Gestion de Contenu",
      description: "CMS complet pour créer et gérer tout le contenu de la plateforme",
      count: documents?.length || 0,
      action: () => navigate('/admin/content-management-BN'),
      gradient: "from-violet-500 to-purple-600"
    },
    {
      icon: Globe,
      title: "CMS Exposition 360°",
      description: "Gérer les expositions virtuelles 360° avec panoramas et hotspots interactifs",
      count: null,
      action: () => navigate('/admin/vexpo360'),
      gradient: "from-teal-500 to-cyan-600"
    },
    {
      icon: BookOpen,
      title: "Gestion des documents numérisés",
      description: "Ajout/suppression de documents, gestion des permissions et visibilité",
      count: documents?.length || 0,
      action: () => navigate('/admin/digital-library/documents'),
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "Gestion des comptes utilisateurs",
      description: "Création de comptes, gestion des droits d'accès et modification des profils",
      count: null,
      action: () => navigate('/admin/digital-library/users'),
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: Sparkles,
      title: "Gestion des expositions virtuelles",
      description: "Créer et gérer les expositions virtuelles avec suivi des visiteurs",
      count: null,
      action: () => navigate('/admin/digital-library/exhibitions'),
      gradient: "from-pink-500 to-rose-600"
    },
    {
      icon: BarChart3,
      title: "Statistiques et Rapports",
      description: "Statistiques détaillées et export de rapports d'utilisation",
      count: null,
      action: () => navigate('/admin/digital-library/analytics'),
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: FileImage,
      title: "Gestion des documents de reproduction",
      description: "Enregistrement, suivi et validation des documents de reproduction",
      count: null,
      action: () => navigate('/admin/digital-library/reproduction'),
      gradient: "from-orange-500 to-amber-600"
    },
    {
      icon: ShieldCheck,
      title: "Restrictions de téléchargement",
      description: "Restreindre l'accès pour des utilisateurs spécifiques en cas d'abus",
      count: restrictions?.length || 0,
      action: () => navigate('/admin/digital-library/restrictions'),
      gradient: "from-red-500 to-red-600"
    },
    {
      icon: CalendarClock,
      title: "Suivi des droits d'auteur",
      description: "Documents avec accès limité et alertes d'expiration",
      count: expiringDocs?.length || 0,
      action: () => navigate('/admin/digital-library/copyright'),
      gradient: "from-indigo-500 to-indigo-600"
    },
    {
      icon: UploadCloud,
      title: "Import en masse",
      description: "Importer plusieurs documents avec métadonnées (CSV/Excel)",
      count: null,
      action: () => navigate('/admin/digital-library/bulk-import'),
      gradient: "from-cyan-500 to-teal-600"
    },
    {
      icon: Globe,
      title: "Gestion des Bouquets électroniques",
      description: "Configurer les abonnements aux ressources électroniques externes (JSTOR, Elsevier...)",
      count: null,
      action: () => navigate('/admin/digital-library/electronic-bundles'),
      gradient: "from-sky-500 to-blue-600"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion Bibliothèque Numérique</h1>
          <p className="text-muted-foreground">Gestion centralisée des documents numérisés</p>
        </div>
      </div>

      {/* Cards Menu */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {menuCards.map((card) => (
          <Card 
            key={card.title} 
            className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/40"
            onClick={card.action}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="h-7 w-7 text-white" />
                </div>
                {card.count !== null && (
                  <Badge 
                    variant="secondary" 
                    className="text-lg px-4 py-1.5 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
                  >
                    {card.count}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl mt-4 group-hover:text-primary transition-colors">
                {card.title}
              </CardTitle>
              <CardDescription className="text-sm mt-2 leading-relaxed">
                {card.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>Accès direct aux fonctionnalités principales</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un document
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV/Excel
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter la liste
          </Button>
        </CardContent>
      </Card>

      {/* Recent Documents Preview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Documents Récents</CardTitle>
              <CardDescription>Aperçu des derniers documents ajoutés</CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate('/admin/digital-library/documents')}>
              Voir tout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Chargement...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Visible</TableHead>
                  <TableHead>Téléchargement</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents?.slice(0, 5).map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.file_type || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      {doc.is_visible ? (
                        <Badge variant="default">Visible</Badge>
                      ) : (
                        <Badge variant="secondary">Masqué</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {doc.download_enabled ? (
                        <Badge variant="default">Activé</Badge>
                      ) : (
                        <Badge variant="destructive">Désactivé</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Copyright Alerts Preview */}
      {expiringDocs && expiringDocs.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <CardTitle className="text-destructive">Alertes Droits d'auteur</CardTitle>
                <CardDescription>Documents nécessitant votre attention</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Expire le</TableHead>
                  <TableHead>Jours restants</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiringDocs.slice(0, 3).map((doc) => {
                  const daysLeft = Math.ceil((new Date(doc.copyright_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.title}</TableCell>
                      <TableCell>{new Date(doc.copyright_expires_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={daysLeft < 30 ? 'destructive' : daysLeft < 60 ? 'secondary' : 'default'}>
                          {daysLeft} jours
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}