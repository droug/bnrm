import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FileText, Plus, Pencil, Trash2, Search, Calendar, Clock, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface AppelOffre {
  id: string;
  titre: string;
  reference: string;
  datePublication: string;
  dateLimite: string;
  statut: "ouvert" | "clos";
  categorie: string;
  description: string;
  documentUrl?: string;
}

const defaultData: AppelOffre[] = [
  {
    id: "1",
    titre: "Acquisition de matériel informatique pour la salle de lecture",
    reference: "AO-BNRM-2026-001",
    datePublication: "2026-02-10",
    dateLimite: "2026-03-15",
    statut: "ouvert",
    categorie: "Fournitures",
    description: "La BNRM lance un appel d'offres pour l'acquisition de matériel informatique destiné à équiper la salle de lecture numérique.",
  },
  {
    id: "2",
    titre: "Travaux de rénovation de l'espace d'exposition",
    reference: "AO-BNRM-2026-002",
    datePublication: "2026-02-05",
    dateLimite: "2026-03-10",
    statut: "ouvert",
    categorie: "Travaux",
    description: "Rénovation et aménagement de l'espace d'exposition permanente de la Bibliothèque Nationale.",
  },
  {
    id: "3",
    titre: "Prestation de numérisation de fonds anciens",
    reference: "AO-BNRM-2025-045",
    datePublication: "2025-12-01",
    dateLimite: "2026-01-15",
    statut: "clos",
    categorie: "Services",
    description: "Numérisation haute résolution de manuscrits et ouvrages rares du fonds patrimonial.",
  },
];

export default function CmsAppelsOffresManager() {
  const [items, setItems] = useState<AppelOffre[]>(defaultData);
  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState<AppelOffre | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [form, setForm] = useState({
    titre: "",
    reference: "",
    datePublication: "",
    dateLimite: "",
    statut: "ouvert" as "ouvert" | "clos",
    categorie: "",
    description: "",
    documentUrl: "",
  });

  const resetForm = () => {
    setForm({ titre: "", reference: "", datePublication: "", dateLimite: "", statut: "ouvert", categorie: "", description: "", documentUrl: "" });
    setEditingItem(null);
  };

  const openCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEdit = (item: AppelOffre) => {
    setEditingItem(item);
    setForm({
      titre: item.titre,
      reference: item.reference,
      datePublication: item.datePublication,
      dateLimite: item.dateLimite,
      statut: item.statut,
      categorie: item.categorie,
      description: item.description,
      documentUrl: item.documentUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.titre || !form.reference) {
      toast.error("Le titre et la référence sont obligatoires");
      return;
    }
    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? { ...i, ...form } : i));
      toast.success("Appel d'offres modifié");
    } else {
      setItems([...items, { id: Date.now().toString(), ...form }]);
      toast.success("Appel d'offres créé");
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(i => i.id !== id));
    toast.success("Appel d'offres supprimé");
  };

  const filtered = items.filter(i =>
    i.titre.toLowerCase().includes(search.toLowerCase()) ||
    i.reference.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-500" />
              Gestion des Appels d'offres
            </CardTitle>
            <CardDescription>Gérez les marchés publics affichés sur la page /appels-offres</CardDescription>
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
                  <Badge variant={item.statut === "ouvert" ? "default" : "secondary"} className="text-xs">
                    {item.statut === "ouvert" ? "Ouvert" : "Clos"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{item.categorie}</Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono">{item.reference}</p>
                <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
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
            <p className="text-center text-muted-foreground py-8">Aucun appel d'offres trouvé</p>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Modifier l'appel d'offres" : "Nouvel appel d'offres"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Titre *</Label><Input value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} /></div>
              <div><Label>Référence *</Label><Input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="AO-BNRM-2026-XXX" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Date de publication</Label><Input type="date" value={form.datePublication} onChange={e => setForm({ ...form, datePublication: e.target.value })} /></div>
                <div><Label>Date limite</Label><Input type="date" value={form.dateLimite} onChange={e => setForm({ ...form, dateLimite: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <Label>Catégorie</Label>
                  <Select value={form.categorie} onValueChange={v => setForm({ ...form, categorie: v })}>
                    <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fournitures">Fournitures</SelectItem>
                      <SelectItem value="Travaux">Travaux</SelectItem>
                      <SelectItem value="Services">Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
              <div><Label>URL du document</Label><Input value={form.documentUrl} onChange={e => setForm({ ...form, documentUrl: e.target.value })} placeholder="https://..." /></div>
              <Button onClick={handleSave} className="w-full">{editingItem ? "Enregistrer" : "Créer"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
