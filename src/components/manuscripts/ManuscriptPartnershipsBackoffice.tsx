import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Eye, Mail, Phone, Globe, Building2, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CustomSelect } from "@/components/ui/custom-select";

interface PartnerCollection {
  id: string;
  institution_name: string;
  legal_representative: string | null;
  contact_person: string;
  contact_email: string;
  contact_phone: string | null;
  description: string | null;
  website_url: string | null;
  is_approved: boolean | null;
  approved_at: string | null;
  created_at: string | null;
}

const ManuscriptPartnershipsBackoffice = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<PartnerCollection | null>(null);
  const [dialogType, setDialogType] = useState<"view" | "reject" | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ["partner-collections", filterStatus],
    queryFn: async () => {
      let query = supabase
        .from("partner_collections")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus === "pending") query = query.is("is_approved", null);
      else if (filterStatus === "approved") query = query.eq("is_approved", true);
      else if (filterStatus === "rejected") query = query.eq("is_approved", false);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PartnerCollection[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("partner_collections")
        .update({ is_approved: true, approved_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Demande approuvée", description: "La demande de partenariat a été approuvée." });
      queryClient.invalidateQueries({ queryKey: ["partner-collections"] });
      queryClient.invalidateQueries({ queryKey: ["manuscripts-pending-partnerships"] });
      setSelected(null);
      setDialogType(null);
    },
    onError: () => toast({ title: "Erreur", description: "Impossible d'approuver la demande.", variant: "destructive" }),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("partner_collections")
        .update({ is_approved: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Demande rejetée", description: "La demande de partenariat a été rejetée." });
      queryClient.invalidateQueries({ queryKey: ["partner-collections"] });
      queryClient.invalidateQueries({ queryKey: ["manuscripts-pending-partnerships"] });
      setSelected(null);
      setDialogType(null);
      setRejectReason("");
    },
    onError: () => toast({ title: "Erreur", description: "Impossible de rejeter la demande.", variant: "destructive" }),
  });

  const getStatusBadge = (is_approved: boolean | null) => {
    if (is_approved === null) return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
    if (is_approved) return <Badge className="bg-green-100 text-green-800">Approuvé</Badge>;
    return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-amber-200/60">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-xl border-b border-amber-200/40 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-amber-600" />
              Demandes de partenariat — Plateforme Manuscrits
            </CardTitle>
            <CustomSelect
              value={filterStatus}
              onValueChange={setFilterStatus}
              options={[
                { value: "all", label: "Tous les statuts" },
                { value: "pending", label: "En attente" },
                { value: "approved", label: "Approuvé" },
                { value: "rejected", label: "Rejeté" },
              ]}
              placeholder="Filtrer par statut"
              className="w-[180px]"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold">Institution</TableHead>
                  <TableHead className="font-semibold">Représentant</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Statut</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                      Aucune demande de partenariat trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  collections.map((col) => (
                    <TableRow key={col.id} className="hover:bg-amber-50/30 transition-colors">
                      <TableCell className="font-medium">{col.institution_name}</TableCell>
                      <TableCell className="text-muted-foreground">{col.legal_representative || "—"}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <User className="h-3 w-3" />
                            {col.contact_person}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {col.contact_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(col.is_approved)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {col.created_at
                          ? format(new Date(col.created_at), "dd MMM yyyy", { locale: fr })
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setSelected(col); setDialogType("view"); }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {col.is_approved === null && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => approveMutation.mutate(col.id)}
                                disabled={approveMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => { setSelected(col); setDialogType("reject"); }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Détails */}
      <Dialog open={dialogType === "view"} onOpenChange={(o) => !o && setDialogType(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-amber-600" />
              Détails — {selected?.institution_name}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Institution</p>
                  <p className="font-medium">{selected.institution_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Représentant légal</p>
                  <p className="font-medium">{selected.legal_representative || "—"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><User className="h-3 w-3" /> Contact</p>
                  <p>{selected.contact_person}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Mail className="h-3 w-3" /> Email</p>
                  <p>{selected.contact_email}</p>
                </div>
              </div>
              {selected.contact_phone && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Phone className="h-3 w-3" /> Téléphone</p>
                  <p>{selected.contact_phone}</p>
                </div>
              )}
              {selected.website_url && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Globe className="h-3 w-3" /> Site web</p>
                  <a href={selected.website_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{selected.website_url}</a>
                </div>
              )}
              {selected.description && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Description / Objectifs</p>
                  <p className="bg-muted/30 rounded p-2 text-sm">{selected.description}</p>
                </div>
              )}
              <div className="flex items-center gap-2 pt-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground text-xs">
                  Soumis le {selected.created_at ? format(new Date(selected.created_at), "dd MMMM yyyy", { locale: fr }) : "—"}
                </span>
                <span className="ml-auto">{getStatusBadge(selected.is_approved)}</span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 flex-row justify-end">
            {selected?.is_approved === null && (
              <>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => selected && approveMutation.mutate(selected.id)}
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Approuver
                </Button>
                <Button
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => setDialogType("reject")}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Rejeter
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={() => setDialogType(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Rejet */}
      <Dialog open={dialogType === "reject"} onOpenChange={(o) => !o && setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Motif du rejet</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Veuillez indiquer la raison du rejet</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Motif du rejet..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogType(null)}>Annuler</Button>
            <Button
              variant="destructive"
              onClick={() => selected && rejectMutation.mutate(selected.id)}
              disabled={rejectMutation.isPending}
            >
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManuscriptPartnershipsBackoffice;
