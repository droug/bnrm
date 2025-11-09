import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Settings, 
  Database, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Edit,
  Trash2,
  Plus,
  Copy as CopyIcon
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface SIGBConfig {
  id: string;
  config_name: string;
  sigb_type: string;
  api_url: string;
  api_key?: string;
  sync_enabled: boolean;
  sync_frequency: string;
  last_sync_at?: string;
  auto_update_availability: boolean;
  sync_all_locations: boolean;
}

interface DocumentCopy {
  id: string;
  document_id: string;
  copy_number: string;
  cote: string;
  barcode?: string;
  location: string;
  availability_status: string;
  unavailability_reason?: string;
  unavailable_until?: string;
  sigb_copy_id?: string;
  last_sync_date?: string;
  notes?: string;
}

export function SIGBConfigurationTab() {
  const [config, setConfig] = useState<SIGBConfig | null>(null);
  const [copies, setCopies] = useState<DocumentCopy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [editingCopy, setEditingCopy] = useState<DocumentCopy | null>(null);
  const [newCopy, setNewCopy] = useState({
    document_id: "",
    copy_number: "",
    cote: "",
    barcode: "",
    location: "",
    availability_status: "disponible",
    unavailability_reason: "",
    notes: ""
  });

  useEffect(() => {
    loadConfig();
    loadCopies();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("sigb_configuration")
        .select("*")
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      setConfig(data as any);
    } catch (error: any) {
      console.error("Erreur chargement config:", error);
      toast.error("Erreur lors du chargement de la configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCopies = async () => {
    try {
      const { data, error } = await supabase
        .from("document_copies" as any)
        .select("*")
        .order("document_id", { ascending: true })
        .order("copy_number", { ascending: true });

      if (error) throw error;
      setCopies((data || []) as any);
    } catch (error: any) {
      console.error("Erreur chargement copies:", error);
      toast.error("Erreur lors du chargement des copies");
    }
  };

  const handleSync = async () => {
    if (!config) return;

    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sigb-metadata-sync", {
        body: {
          sigbUrl: config.api_url,
          mode: "manual"
        }
      });

      if (error) throw error;

      toast.success("Synchronisation SIGB réussie", {
        description: `${data.imported || 0} enregistrements synchronisés`
      });

      await loadCopies();
      await loadConfig();
    } catch (error: any) {
      console.error("Erreur synchronisation:", error);
      toast.error("Erreur lors de la synchronisation SIGB");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveCopy = async () => {
    try {
      if (editingCopy) {
        const { error } = await supabase
          .from("document_copies" as any)
          .update(newCopy)
          .eq("id", editingCopy.id);

        if (error) throw error;
        toast.success("Copie mise à jour");
      } else {
        const { error } = await supabase
          .from("document_copies" as any)
          .insert([newCopy]);

        if (error) throw error;
        toast.success("Copie ajoutée");
      }

      setShowCopyDialog(false);
      setEditingCopy(null);
      setNewCopy({
        document_id: "",
        copy_number: "",
        cote: "",
        barcode: "",
        location: "",
        availability_status: "disponible",
        unavailability_reason: "",
        notes: ""
      });
      loadCopies();
    } catch (error: any) {
      console.error("Erreur sauvegarde copie:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleDeleteCopy = async (copyId: string) => {
    try {
      const { error } = await supabase
        .from("document_copies" as any)
        .delete()
        .eq("id", copyId);

      if (error) throw error;
      toast.success("Copie supprimée");
      loadCopies();
    } catch (error: any) {
      console.error("Erreur suppression copie:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "disponible":
        return <Badge className="bg-green-500/10 text-green-700 border-green-500/30">Disponible</Badge>;
      case "emprunte":
        return <Badge className="bg-orange-500/10 text-orange-700 border-orange-500/30">Emprunté</Badge>;
      case "en_restauration":
        return <Badge className="bg-purple-500/10 text-purple-700 border-purple-500/30">En restauration</Badge>;
      case "en_reliure":
        return <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/30">En reliure</Badge>;
      case "reserve":
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30">Réservé</Badge>;
      case "en_traitement":
        return <Badge className="bg-indigo-500/10 text-indigo-700 border-indigo-500/30">En traitement</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration du SIGB
              </CardTitle>
              <CardDescription>
                Paramètres de connexion et synchronisation avec le système de gestion de bibliothèque
              </CardDescription>
            </div>
            {config && (
              <div className="flex gap-2">
                <Button
                  onClick={handleSync}
                  disabled={isSyncing}
                  variant="outline"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  Synchroniser
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {config ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Type de SIGB</Label>
                <p className="text-base font-medium">{config.sigb_type}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">URL API</Label>
                <p className="text-base font-medium truncate">{config.api_url}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Synchronisation</Label>
                <div className="flex items-center gap-2">
                  {config.sync_enabled ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>{config.sync_enabled ? "Activée" : "Désactivée"}</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Fréquence</Label>
                <p className="text-base font-medium">{config.sync_frequency}</p>
              </div>
              {config.last_sync_at && (
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Dernière synchronisation</Label>
                  <p className="text-base font-medium">
                    {format(new Date(config.last_sync_at), "PPP 'à' HH:mm", { locale: fr })}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Aucune configuration SIGB trouvée</p>
              <p className="text-sm text-muted-foreground mt-2">
                Contactez votre administrateur système pour configurer l'interconnexion
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CopyIcon className="h-5 w-5" />
                Copies de documents
              </CardTitle>
              <CardDescription>
                Gestion des copies physiques et leur disponibilité
              </CardDescription>
            </div>
            <Button onClick={() => {
              setEditingCopy(null);
              setShowCopyDialog(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une copie
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document ID</TableHead>
                <TableHead>N° Copie</TableHead>
                <TableHead>Cote</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>Disponible jusqu'au</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {copies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Aucune copie enregistrée
                  </TableCell>
                </TableRow>
              ) : (
                copies.map((copy) => (
                  <TableRow key={copy.id}>
                    <TableCell className="font-mono text-sm">{copy.document_id}</TableCell>
                    <TableCell>{copy.copy_number}</TableCell>
                    <TableCell className="font-mono">{copy.cote}</TableCell>
                    <TableCell>{copy.location}</TableCell>
                    <TableCell>{getStatusBadge(copy.availability_status)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {copy.unavailability_reason || "-"}
                    </TableCell>
                    <TableCell>
                      {copy.unavailable_until 
                        ? format(new Date(copy.unavailable_until), "PPP", { locale: fr })
                        : "-"
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCopy(copy);
                            setNewCopy({
                              document_id: copy.document_id,
                              copy_number: copy.copy_number,
                              cote: copy.cote,
                              barcode: copy.barcode || "",
                              location: copy.location,
                              availability_status: copy.availability_status,
                              unavailability_reason: copy.unavailability_reason || "",
                              notes: copy.notes || ""
                            });
                            setShowCopyDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCopy(copy.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCopy ? "Modifier la copie" : "Ajouter une copie"}
            </DialogTitle>
            <DialogDescription>
              Renseignez les informations de la copie du document
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="document_id">ID Document *</Label>
                <Input
                  id="document_id"
                  value={newCopy.document_id}
                  onChange={(e) => setNewCopy({...newCopy, document_id: e.target.value})}
                  placeholder="DOC001"
                />
              </div>
              <div>
                <Label htmlFor="copy_number">N° Copie *</Label>
                <Input
                  id="copy_number"
                  value={newCopy.copy_number}
                  onChange={(e) => setNewCopy({...newCopy, copy_number: e.target.value})}
                  placeholder="Copie 1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cote">Cote *</Label>
                <Input
                  id="cote"
                  value={newCopy.cote}
                  onChange={(e) => setNewCopy({...newCopy, cote: e.target.value})}
                  placeholder="A.123.456.C1"
                />
              </div>
              <div>
                <Label htmlFor="barcode">Code-barre</Label>
                <Input
                  id="barcode"
                  value={newCopy.barcode}
                  onChange={(e) => setNewCopy({...newCopy, barcode: e.target.value})}
                  placeholder="123456789"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Localisation *</Label>
                <Input
                  id="location"
                  value={newCopy.location}
                  onChange={(e) => setNewCopy({...newCopy, location: e.target.value})}
                  placeholder="Magasin Principal"
                />
              </div>
              <div>
                <Label htmlFor="availability_status">Statut *</Label>
                <Select
                  value={newCopy.availability_status}
                  onValueChange={(value) => setNewCopy({...newCopy, availability_status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponible">Disponible</SelectItem>
                    <SelectItem value="emprunte">Emprunté</SelectItem>
                    <SelectItem value="en_restauration">En restauration</SelectItem>
                    <SelectItem value="en_reliure">En reliure</SelectItem>
                    <SelectItem value="reserve">Réservé</SelectItem>
                    <SelectItem value="en_traitement">En traitement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="unavailability_reason">Motif d'indisponibilité</Label>
              <Input
                id="unavailability_reason"
                value={newCopy.unavailability_reason}
                onChange={(e) => setNewCopy({...newCopy, unavailability_reason: e.target.value})}
                placeholder="Raison de l'indisponibilité"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newCopy.notes}
                onChange={(e) => setNewCopy({...newCopy, notes: e.target.value})}
                placeholder="Notes internes sur cette copie"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCopyDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveCopy}>
              {editingCopy ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
