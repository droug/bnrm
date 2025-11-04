import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FormSection } from "@/types/formBuilder";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface SectionManagerProps {
  sections: FormSection[];
  onSectionsUpdate: (sections: FormSection[]) => Promise<void>;
}

export function SectionManager({ sections, onSectionsUpdate }: SectionManagerProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingSection, setEditingSection] = useState<FormSection | null>(null);
  const [formData, setFormData] = useState({
    key: "",
    label_fr: "",
    label_ar: "",
  });

  const handleOpenDialog = (section?: FormSection) => {
    if (section) {
      setEditingSection(section);
      setFormData({
        key: section.key,
        label_fr: section.label_fr,
        label_ar: section.label_ar || "",
      });
    } else {
      setEditingSection(null);
      setFormData({ key: "", label_fr: "", label_ar: "" });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.key || !formData.label_fr) {
      toast.error("La clé et le label français sont obligatoires");
      return;
    }

    try {
      let updatedSections: FormSection[];

      if (editingSection) {
        // Modifier une section existante
        updatedSections = sections.map((s) =>
          s.key === editingSection.key
            ? { ...s, ...formData }
            : s
        );
      } else {
        // Ajouter une nouvelle section
        const newSection: FormSection = {
          key: formData.key,
          label_fr: formData.label_fr,
          label_ar: formData.label_ar,
          order_index: sections.length,
          fields: [],
        };
        updatedSections = [...sections, newSection];
      }

      await onSectionsUpdate(updatedSections);
      setShowDialog(false);
      toast.success(editingSection ? "Section modifiée" : "Section ajoutée");
    } catch (error) {
      console.error("Error saving section:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (sectionKey: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette section ?")) {
      return;
    }

    try {
      const updatedSections = sections
        .filter((s) => s.key !== sectionKey)
        .map((s, index) => ({ ...s, order_index: index }));

      await onSectionsUpdate(updatedSections);
      toast.success("Section supprimée");
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleReorder = async (sectionKey: string, direction: "up" | "down") => {
    const currentIndex = sections.findIndex((s) => s.key === sectionKey);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === sections.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const updatedSections = [...sections];
    const temp = updatedSections[currentIndex];
    updatedSections[currentIndex] = updatedSections[newIndex];
    updatedSections[newIndex] = temp;

    // Mettre à jour les order_index
    const reorderedSections = updatedSections.map((s, index) => ({
      ...s,
      order_index: index,
    }));

    try {
      await onSectionsUpdate(reorderedSections);
      toast.success("Ordre modifié");
    } catch (error) {
      console.error("Error reordering sections:", error);
      toast.error("Erreur lors du réordonnancement");
    }
  };

  return (
    <Card className="p-4 mb-6 border-2 border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Sections du formulaire</h3>
        <Button onClick={() => handleOpenDialog()} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une section
        </Button>
      </div>

      <div className="space-y-2">
        {sections.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
            Aucune section. Cliquez sur "Ajouter une section" pour commencer.
          </div>
        ) : (
          sections.map((section, index) => (
            <div
              key={section.key}
              className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg"
            >
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleReorder(section.key, "up")}
                  disabled={index === 0}
                >
                  <GripVertical className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleReorder(section.key, "down")}
                  disabled={index === sections.length - 1}
                >
                  <GripVertical className="w-3 h-3" />
                </Button>
              </div>

              <div className="flex-1">
                <div className="font-medium text-foreground">{section.label_fr}</div>
                <div className="text-sm text-muted-foreground" dir="rtl">
                  {section.label_ar}
                </div>
                <div className="text-xs text-muted-foreground">Clé: {section.key}</div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenDialog(section)}
                  className="hover:bg-muted"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(section.key)}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSection ? "Modifier la section" : "Ajouter une section"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="section-key">
                Clé technique (slug unique) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="section-key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="identification_auteur"
                disabled={!!editingSection}
              />
            </div>

            <div>
              <Label htmlFor="section-label-fr">
                Label français <span className="text-destructive">*</span>
              </Label>
              <Input
                id="section-label-fr"
                value={formData.label_fr}
                onChange={(e) => setFormData({ ...formData, label_fr: e.target.value })}
                placeholder="Identification de l'auteur"
              />
            </div>

            <div>
              <Label htmlFor="section-label-ar">Label arabe</Label>
              <Input
                id="section-label-ar"
                value={formData.label_ar}
                onChange={(e) => setFormData({ ...formData, label_ar: e.target.value })}
                placeholder="تعريف المؤلف"
                dir="rtl"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
