import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Database, RefreshCw, Settings, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DocumentCopy {
  id: string;
  document_id: string;
  copy_number: string;
  cote: string;
  barcode?: string;
  location?: string;
  availability_status: string;
  unavailability_reason?: string;
  unavailable_until?: string;
  sigb_copy_id?: string;
  last_sync_date?: string;
  notes?: string;
  created_at: string;
}

interface SIGBConfig {
  id: string;
  system_name: string;
  api_endpoint: string;
  sync_enabled: boolean;
  last_sync_date?: string;
  is_active: boolean;
}

export function SIGBConfigurationTab() {
  const [copies, setCopies] = useState<DocumentCopy[]>([]);
  const [sigbConfig, setSigbConfig] = useState<SIGBConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedCopy, setSelectedCopy] = useState<DocumentCopy | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Charger les copies de documents
      const { data: copiesData, error: copiesError } = await supabase
        .from("document_copies")
        .select("*")
        .order("document_id", { ascending: true })
        .order("copy_number", { ascending: true });

      if (copiesError) throw copiesError;
      setCopies(copiesData || []);

      // Charger la configuration SIGB
      const { data: configData, error: configError } = await supabase
        .from("sigb_configuration")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (configError && configError.code !== 'PGRST116') throw configError;
      setSigbConfig(configData);

    } catch (error: any) {
      console.error("Erreur de chargement:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      toast.info("Synchronisation en cours...");

      const { data, error } = await supabase.functions.invoke("sigb-metadata-sync", {
        body: {
          sigbUrl: sigbConfig?.api_endpoint || "https://sigb.example.com/api/v1/items",
          mode: "manual",
        },
      });

      if (error) throw error;

      toast.success(`Synchronisation réussie! ${data?.imported || 0} enregistrements importés.`);
      loadData();
    } catch (error: any) {
      console.error("Erreur de synchronisation:", error);
      toast.error("Échec de la synchronisation: " + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      disponible: { variant: "default" as const, icon: CheckCircle2, label: "Disponible" },
      emprunte: { variant: "destructive" as const, icon: XCircle, label: "Emprunté" },
      en_restauration: { variant: "secondary" as const, icon: AlertCircle, label: "Restauration" },
      en_reliure: { variant: "secondary" as const, icon: AlertCircle, label: "Reliure" },
      reserve: { variant: "outline" as const, icon: AlertCircle, label: "Réservé" },
      en_traitement: { variant: "outline" as const, icon: AlertCircle, label: "Traitement" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "outline" as const,
      icon: AlertCircle,
      label: status,
    };

    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration SIGB */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle>Configuration de l'interconnexion SIGB</CardTitle>
            </div>
            {sigbConfig && (
              <Badge variant={sigbConfig.is_active ? "default" : "outline"}>
                {sigbConfig.is_active ? "Actif" : "Inactif"}
              </Badge>
            )}
          </div>
          <CardDescription>
            Gestion de la connexion au Système Intégré de Gestion de Bibliothèque
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sigbConfig ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Système</Label>
                  <Input value={sigbConfig.system_name} disabled />
                </div>
                <div>
                  <Label>Endpoint API</Label>
                  <Input value={sigbConfig.api_endpoint} disabled />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch checked={sigbConfig.sync_enabled} disabled />
                  <Label>Synchronisation automatique</Label>
                </div>
                {sigbConfig.last_sync_date && (
                  <p className="text-sm text-muted-foreground">
                    Dernière synchro: {format(new Date(sigbConfig.last_sync_date), "PPp", { locale: fr })}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSync}
                  disabled={isSyncing || !sigbConfig.is_active}
                  className="gap-2"
                >
                  <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
                  Synchroniser maintenant
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune configuration SIGB trouvée</p>
              <p className="text-sm">Veuillez configurer la connexion au SIGB</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des copies de documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Copies de documents disponibles
          </CardTitle>
          <CardDescription>
            Statut de disponibilité des différentes copies d'ouvrages synchronisées avec le SIGB
          </CardDescription>
        </CardHeader>
        <CardContent>
          {copies.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Copie</TableHead>
                    <TableHead>Cote</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Disponible jusqu'à</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {copies.map((copy) => (
                    <TableRow key={copy.id}>
                      <TableCell className="font-medium">{copy.document_id}</TableCell>
                      <TableCell>{copy.copy_number}</TableCell>
                      <TableCell className="font-mono text-sm">{copy.cote}</TableCell>
                      <TableCell>{copy.location || "-"}</TableCell>
                      <TableCell>{getStatusBadge(copy.availability_status)}</TableCell>
                      <TableCell>
                        {copy.unavailable_until ? (
                          format(new Date(copy.unavailable_until), "P", { locale: fr })
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCopy(copy);
                            setShowDetailsDialog(true);
                          }}
                        >
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune copie de document trouvée</p>
              <p className="text-sm">Les copies apparaîtront ici après la synchronisation avec le SIGB</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog détails copie */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de la copie</DialogTitle>
            <DialogDescription>
              Informations détaillées sur cette copie d'ouvrage
            </DialogDescription>
          </DialogHeader>

          {selectedCopy && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Document</Label>
                <p className="text-sm">{selectedCopy.document_id}</p>
              </div>

              <div className="grid gap-2">
                <Label>Numéro de copie</Label>
                <p className="text-sm">{selectedCopy.copy_number}</p>
              </div>

              <div className="grid gap-2">
                <Label>Cote</Label>
                <p className="font-mono text-sm">{selected Copy.cote}</p>
              </div>

              {selectedCopy.barcode && (
                <div className="grid gap-2">
                  <Label>Code-barre</Label>
                  <p className="font-mono text-sm">{selectedCopy.barcode}</p>
                </div>
              )}

              <div className="grid gap-2">
                <Label>Localisation</Label>
                <p className="text-sm">{selectedCopy.location || "Non spécifiée"}</p>
              </div>

              <div className="grid gap-2">
                <Label>Statut de disponibilité</Label>
                {getStatusBadge(selectedCopy.availability_status)}
              </div>

              {selectedCopy.unavailability_reason && (
                <div className="grid gap-2">
                  <Label>Motif d'indisponibilité</Label>
                  <p className="text-sm text-muted-foreground">{selectedCopy.unavailability_reason}</p>
                </div>
              )}

              {selectedCopy.unavailable_until && (
                <div className="grid gap-2">
                  <Label>Disponible le</Label>
                  <p className="text-sm">
                    {format(new Date(selectedCopy.unavailable_until), "PPP", { locale: fr })}
                  </p>
                </div>
              )}

              {selectedCopy.notes && (
                <div className="grid gap-2">
                  <Label>Notes</Label>
                  <p className="text-sm text-muted-foreground">{selectedCopy.notes}</p>
                </div>
              )}

              {selectedCopy.sigb_copy_id && (
                <div className="grid gap-2">
                  <Label>ID SIGB</Label>
                  <p className="font-mono text-xs text-muted-foreground">{selectedCopy.sigb_copy_id}</p>
                </div>
              )}

              {selectedCopy.last_sync_date && (
                <div className="grid gap-2">
                  <Label>Dernière synchronisation</Label>
                  <p className="text-sm">
                    {format(new Date(selectedCopy.last_sync_date), "PPp", { locale: fr })}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
