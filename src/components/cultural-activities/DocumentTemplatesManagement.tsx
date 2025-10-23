import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/ui/custom-select";
import { 
  Edit, 
  Eye,
  Plus,
  Trash2
} from "lucide-react";

interface DocumentTemplate {
  id: string;
  template_name: string;
  template_code: string;
  document_type: string;
  module: string;
  content_template: string;
  header_content: string | null;
  footer_content: string | null;
  variables: any;
  signature_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const DocumentTemplatesManagement = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    template_name: "",
    template_code: "",
    document_type: "lettre_confirmation",
    module: "reservations",
    content_template: "",
    header_content: "",
    footer_content: "",
    signature_required: true,
    is_active: true,
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("document_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les modèles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      template_name: template.template_name,
      template_code: template.template_code,
      document_type: template.document_type,
      module: template.module,
      content_template: template.content_template,
      header_content: template.header_content || "",
      footer_content: template.footer_content || "",
      signature_required: template.signature_required,
      is_active: template.is_active,
    });
    setEditDialog(true);
  };

  const handleNew = () => {
    setSelectedTemplate(null);
    setFormData({
      template_name: "",
      template_code: "",
      document_type: "lettre_confirmation",
      module: "reservations",
      content_template: "",
      header_content: "",
      footer_content: "",
      signature_required: true,
      is_active: true,
    });
    setEditDialog(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.template_name.trim() || !formData.template_code.trim() || !formData.content_template.trim()) {
        toast({
          title: "Attention",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (selectedTemplate) {
        // Update existing template
        const { error } = await supabase
          .from("document_templates")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedTemplate.id);

        if (error) throw error;

        toast({
          title: "Modèle mis à jour",
          description: "Le modèle de document a été mis à jour avec succès",
        });
      } else {
        // Create new template
        const { error } = await supabase
          .from("document_templates")
          .insert({
            ...formData,
            created_by: user?.id,
          } as any);

        if (error) throw error;

        toast({
          title: "Modèle créé",
          description: "Le modèle de document a été créé avec succès",
        });
      }

      fetchTemplates();
      setEditDialog(false);
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder le modèle",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;

    try {
      const { error } = await supabase
        .from("document_templates")
        .delete()
        .eq("id", selectedTemplate.id);

      if (error) throw error;

      toast({
        title: "Modèle supprimé",
        description: "Le modèle de document a été supprimé",
      });

      fetchTemplates();
      setDeleteDialog(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le modèle",
        variant: "destructive",
      });
    }
  };

  const getTypeBadge = (type: string) => {
    const config: Record<string, { label: string; className: string }> = {
      lettre_confirmation: { label: "Lettre confirmation", className: "bg-green-100 text-green-800" },
      lettre_rejet: { label: "Lettre rejet", className: "bg-red-100 text-red-800" },
      contrat: { label: "Contrat", className: "bg-blue-100 text-blue-800" },
      facture: { label: "Facture", className: "bg-yellow-100 text-yellow-800" },
      etat_lieux: { label: "État des lieux", className: "bg-purple-100 text-purple-800" },
      compte_rendu: { label: "Compte rendu", className: "bg-indigo-100 text-indigo-800" },
    };

    const { label, className } = config[type] || { label: type, className: "bg-gray-100 text-gray-800" };
    return <Badge className={className}>{label}</Badge>;
  };

  const getModuleBadge = (module: string) => {
    const modules: Record<string, string> = {
      reservations: "Réservations",
      visites: "Visites guidées",
      partenariats: "Partenariats",
      programmation: "Programmation",
    };

    return <Badge variant="outline">{modules[module] || module}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Modèles de documents</CardTitle>
          <Button onClick={handleNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau modèle
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Nom du modèle</TableHead>
                  <TableHead className="font-semibold">Code</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Module</TableHead>
                  <TableHead className="font-semibold">Statut</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun modèle de document
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template) => (
                    <TableRow key={template.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{template.template_name}</TableCell>
                      <TableCell className="font-mono text-sm">{template.template_code}</TableCell>
                      <TableCell>{getTypeBadge(template.document_type)}</TableCell>
                      <TableCell>{getModuleBadge(template.module)}</TableCell>
                      <TableCell>
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setViewDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setDeleteDialog(true);
                            }}
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
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aperçu du modèle</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.template_name}
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Code</Label>
                  <p className="font-mono text-sm">{selectedTemplate.template_code}</p>
                </div>
                <div>
                  <Label className="font-semibold">Type</Label>
                  <p>{getTypeBadge(selectedTemplate.document_type)}</p>
                </div>
                <div>
                  <Label className="font-semibold">Module</Label>
                  <p>{getModuleBadge(selectedTemplate.module)}</p>
                </div>
                <div>
                  <Label className="font-semibold">Signature requise</Label>
                  <p>{selectedTemplate.signature_required ? "Oui" : "Non"}</p>
                </div>
              </div>

              <div>
                <Label className="font-semibold">Contenu du modèle</Label>
                <pre className="mt-2 p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                  {selectedTemplate.content_template}
                </pre>
              </div>

              {selectedTemplate.header_content && (
                <div>
                  <Label className="font-semibold">En-tête personnalisé</Label>
                  <pre className="mt-2 p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                    {selectedTemplate.header_content}
                  </pre>
                </div>
              )}

              {selectedTemplate.footer_content && (
                <div>
                  <Label className="font-semibold">Pied de page personnalisé</Label>
                  <pre className="mt-2 p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                    {selectedTemplate.footer_content}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialog(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? "Modifier" : "Créer"} un modèle</DialogTitle>
            <DialogDescription>
              Remplissez les informations du modèle de document
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom du modèle *</Label>
                <Input
                  value={formData.template_name}
                  onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                  placeholder="Ex: Lettre de confirmation"
                />
              </div>
              <div>
                <Label>Code *</Label>
                <Input
                  value={formData.template_code}
                  onChange={(e) => setFormData({ ...formData, template_code: e.target.value })}
                  placeholder="Ex: reservation_confirmation"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type de document</Label>
                <CustomSelect
                  value={formData.document_type}
                  onValueChange={(value) => setFormData({ ...formData, document_type: value })}
                  options={[
                    { value: "lettre_confirmation", label: "Lettre de confirmation" },
                    { value: "lettre_rejet", label: "Lettre de rejet" },
                    { value: "contrat", label: "Contrat" },
                    { value: "facture", label: "Facture" },
                    { value: "etat_lieux", label: "État des lieux" },
                    { value: "compte_rendu", label: "Compte rendu" },
                  ]}
                />
              </div>
              <div>
                <Label>Module</Label>
                <CustomSelect
                  value={formData.module}
                  onValueChange={(value) => setFormData({ ...formData, module: value })}
                  options={[
                    { value: "reservations", label: "Réservations" },
                    { value: "visites", label: "Visites guidées" },
                    { value: "partenariats", label: "Partenariats" },
                    { value: "programmation", label: "Programmation" },
                  ]}
                />
              </div>
            </div>

            <div>
              <Label>Contenu du modèle *</Label>
              <Textarea
                value={formData.content_template}
                onChange={(e) => setFormData({ ...formData, content_template: e.target.value })}
                placeholder="Utilisez {{variable}} pour les valeurs dynamiques"
                rows={10}
                className="font-mono"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Utilisez la syntaxe {`{{nom_variable}}`} pour insérer des données dynamiques
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="signature_required"
                  checked={formData.signature_required}
                  onChange={(e) => setFormData({ ...formData, signature_required: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="signature_required">Signature requise</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_active">Actif</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>Annuler</Button>
            <Button onClick={handleSave}>
              {selectedTemplate ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce modèle ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};