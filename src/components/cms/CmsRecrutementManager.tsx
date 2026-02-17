import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, Plus, Pencil, Trash2, Search, MapPin, Calendar, Clock, Briefcase } from "lucide-react";
import { toast } from "sonner";

interface OffreEmploi {
  id: string;
  titre: string;
  departement: string;
  lieu: string;
  type: string;
  datePublication: string;
  dateLimite: string;
  statut: "ouvert" | "clos";
  description: string;
}

const defaultData: OffreEmploi[] = [
  {
    id: "1",
    titre: "Bibliothécaire spécialisé(e) en catalogage",
    departement: "Département du traitement documentaire",
    lieu: "Rabat",
    type: "CDI",
    datePublication: "2026-02-12",
    dateLimite: "2026-03-20",
    statut: "ouvert",
    description: "La BNRM recrute un(e) bibliothécaire spécialisé(e) en catalogage UNIMARC et gestion des fonds documentaires.",
  },
  {
    id: "2",
    titre: "Ingénieur(e) en systèmes d'information",
    departement: "Direction des systèmes d'information",
    lieu: "Rabat",
    type: "CDI",
    datePublication: "2026-02-08",
    dateLimite: "2026-03-15",
    statut: "ouvert",
    description: "Poste d'ingénieur SI pour la gestion et l'évolution du SIGB.",
  },
  {
    id: "3",
    titre: "Restaurateur(trice) de documents anciens",
    departement: "Département de la conservation",
    lieu: "Rabat",
    type: "CDI",
    datePublication: "2025-12-01",
    dateLimite: "2026-01-10",
    statut: "clos",
    description: "Restauration et conservation de manuscrits, ouvrages rares et documents patrimoniaux.",
  },
];

export default function CmsRecrutementManager() {
  const [items, setItems] = useState<OffreEmploi[]>(defaultData);
  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState<OffreEmploi | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [form, setForm] = useState({
    titre: "",
    departement: "",
    lieu: "Rabat",
    type: "CDI",
    datePublication: "",
    dateLimite: "",
    statut: "ouvert" as "ouvert" | "clos",
    description: "",
  });

  const resetForm = () => {
    setForm({ titre: "", departement: "", lieu: "Rabat", type: "CDI", datePublication: "", dateLimite: "", statut: "ouvert", description: "" });
    setEditingItem(null);
  };

  const openCreate = () => { resetForm(); setIsDialogOpen(true); };

  const openEdit = (item: OffreEmploi) => {
    setEditingItem(item);
    setForm({
      titre: item.titre,
      departement: item.departement,
      lieu: item.lieu,
      type: item.type,
      datePublication: item.datePublication,
      dateLimite: item.dateLimite,
      statut: item.statut,
      description: item.description,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.titre || !form.departement) {
      toast.error("Le titre et le département sont obligatoires");
      return;
    }
    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? { ...i, ...form } : i));
      toast.success("Offre modifiée");
    } else {
      setItems([...items, { id: Date.now().toString(), ...form }]);
      toast.success("Offre créée");
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(i => i.id !== id));
    toast.success("Offre supprimée");
  };

  const filtered = items.filter(i =>
    i.titre.toLowerCase().includes(search.toLowerCase()) ||
    i.departement.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-rose-500" />
              Gestion du Recrutement
            </CardTitle>
            <CardDescription>Gérez les offres d'emploi affichées sur la page /recrutement</CardDescription>
          </div>
          <Button onClick={openCreate} size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.titre}</span>
                  <Badge variant="outline" className="text-xs">{item.type}</Badge>
                  <Badge variant={item.statut === "ouvert" ? "default" : "secondary"} className="text-xs">
                    {item.statut === "ouvert" ? "Ouvert" : "Clos"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.departement}</p>
                <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.lieu}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Publié: {item.datePublication}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Limite: {item.dateLimite}</span>
                </div>
              </div>
              <div className="flex gap-1 ml-3">
                <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Aucune offre trouvée</p>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Modifier l'offre" : "Nouvelle offre d'emploi"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Titre du poste *</Label><Input value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} /></div>
              <div><Label>Département *</Label><Input value={form.departement} onChange={e => setForm({ ...form, departement: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Lieu</Label><Input value={form.lieu} onChange={e => setForm({ ...form, lieu: e.target.value })} /></div>
                <div>
                  <Label>Type de contrat</Label>
                  <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDI">CDI</SelectItem>
                      <SelectItem value="CDD">CDD</SelectItem>
                      <SelectItem value="Stage">Stage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Date de publication</Label><Input type="date" value={form.datePublication} onChange={e => setForm({ ...form, datePublication: e.target.value })} /></div>
                <div><Label>Date limite</Label><Input type="date" value={form.dateLimite} onChange={e => setForm({ ...form, dateLimite: e.target.value })} /></div>
              </div>
              <div>
                <Label>Statut</Label>
                <Select value={form.statut} onValueChange={v => setForm({ ...form, statut: v as "ouvert" | "clos" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ouvert">Ouvert</SelectItem>
                    <SelectItem value="clos">Clos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
              <Button onClick={handleSave} className="w-full">{editingItem ? "Enregistrer" : "Créer"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
