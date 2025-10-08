import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, Edit } from "lucide-react";


interface Template {
  id: string;
  name: string;
  subject: string;
  subject_ar: string | null;
  html_content: string;
  html_content_ar: string | null;
  template_type: string;
  is_active: boolean;
  created_at: string;
}

export function EmailTemplatesManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    subject_ar: "",
    html_content: "",
    html_content_ar: "",
    template_type: "newsletter",
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (editingTemplate) {
      setFormData({
        name: editingTemplate.name,
        subject: editingTemplate.subject,
        subject_ar: editingTemplate.subject_ar || "",
        html_content: editingTemplate.html_content,
        html_content_ar: editingTemplate.html_content_ar || "",
        template_type: editingTemplate.template_type,
      });
    }
  }, [editingTemplate]);

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching templates:", error);
      return;
    }

    setTemplates(data || []);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.subject || !formData.html_content) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from("email_templates")
          .update({
            name: formData.name,
            subject: formData.subject,
            subject_ar: formData.subject_ar || null,
            html_content: formData.html_content,
            html_content_ar: formData.html_content_ar || null,
            template_type: formData.template_type,
          })
          .eq("id", editingTemplate.id);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Modèle mis à jour avec succès",
        });
      } else {
        const { error } = await supabase
          .from("email_templates")
          .insert([{
            name: formData.name,
            subject: formData.subject,
            subject_ar: formData.subject_ar || null,
            html_content: formData.html_content,
            html_content_ar: formData.html_content_ar || null,
            template_type: formData.template_type,
          }]);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Modèle créé avec succès",
        });
      }

      setIsCreating(false);
      setEditingTemplate(null);
      setFormData({
        name: "",
        subject: "",
        subject_ar: "",
        html_content: "",
        html_content_ar: "",
        template_type: "newsletter",
      });
      fetchTemplates();
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce modèle ?")) {
      return;
    }

    const { error } = await supabase
      .from("email_templates")
      .delete()
      .eq("id", templateId);

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Succès",
      description: "Modèle supprimé",
    });

    fetchTemplates();
  };

  const handleToggleActive = async (template: Template) => {
    const { error } = await supabase
      .from("email_templates")
      .update({ is_active: !template.is_active })
      .eq("id", template.id);

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    fetchTemplates();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Modèles d'Email</h2>
          <p className="text-muted-foreground">
            Créez et gérez vos modèles d'emails réutilisables
          </p>
        </div>
        <Dialog open={isCreating || !!editingTemplate} onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setEditingTemplate(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Modèle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Modifier le modèle" : "Nouveau modèle d'email"}
              </DialogTitle>
              <DialogDescription>
                Créez un modèle d'email réutilisable pour vos campagnes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du modèle *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Newsletter mensuelle"
                />
              </div>
              <div>
                <Label htmlFor="template_type">Type de modèle</Label>
                <Select
                  value={formData.template_type}
                  onValueChange={(value) => setFormData({ ...formData, template_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="workflow">Workflow (Dépôt légal)</SelectItem>
                    <SelectItem value="custom">Personnalisé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Objet (Français) *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Objet de l'email"
                  />
                </div>
                <div>
                  <Label htmlFor="subject_ar">Objet (Arabe)</Label>
                  <Input
                    id="subject_ar"
                    value={formData.subject_ar}
                    onChange={(e) => setFormData({ ...formData, subject_ar: e.target.value })}
                    placeholder="عنوان البريد الإلكتروني"
                    dir="rtl"
                  />
                </div>
              </div>
              <div>
                <Label>Contenu HTML (Français) *</Label>
                <Textarea
                  value={formData.html_content}
                  onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                  placeholder="Contenu de l'email en HTML..."
                  rows={10}
                />
              </div>
              <div>
                <Label>Contenu HTML (Arabe)</Label>
                <Textarea
                  value={formData.html_content_ar}
                  onChange={(e) => setFormData({ ...formData, html_content_ar: e.target.value })}
                  placeholder="محتوى البريد الإلكتروني بصيغة HTML..."
                  rows={10}
                  dir="rtl"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsCreating(false);
                  setEditingTemplate(null);
                }}>
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modèles</CardTitle>
          <CardDescription>
            Liste de tous vos modèles d'emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Objet</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{template.template_type}</Badge>
                  </TableCell>
                  <TableCell>{template.subject}</TableCell>
                  <TableCell>
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingTemplate(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(template)}
                      >
                        {template.is_active ? "Désactiver" : "Activer"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {templates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Aucun modèle
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
