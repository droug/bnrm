import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { initializeLegalDepositMonographForm } from "@/utils/initializeLegalDepositForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FIELD_TYPES } from "@/types/formBuilder";

export default function ManageSectionFields() {
  const { user } = useAuth();
  const { isAdmin, isLibrarian, loading: rolesLoading } = useSecureRoles();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedFormKey, setSelectedFormKey] = useState<string>("legal_deposit_monograph");
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newField, setNewField] = useState({
    field_key: "",
    field_type: "text",
    label_fr: "",
    label_ar: "",
    is_required: false,
  });

  if (rolesLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (!user || (!isAdmin && !isLibrarian)) {
    return <Navigate to="/auth" replace />;
  }

  // Initialiser le formulaire au chargement
  useEffect(() => {
    const init = async () => {
      await initializeLegalDepositMonographForm();
    };
    init();
  }, []);

  // Charger le formulaire et sa version
  const { data: formVersion, isLoading: formLoading } = useQuery({
    queryKey: ["form-version", selectedFormKey],
    queryFn: async () => {
      // Charger le formulaire
      const { data: formData, error: formError } = await supabase
        .from("configurable_forms")
        .select("*")
        .eq("form_key", selectedFormKey)
        .single();

      if (formError) throw formError;

      // Charger la dernière version
      const { data: versionData, error: versionError } = await supabase
        .from("form_versions")
        .select("*")
        .eq("form_id", formData.id)
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

      if (versionError) throw versionError;
      return versionData;
    },
    enabled: !!selectedFormKey,
  });

  // Récupérer les sections depuis la structure
  const structure = formVersion?.structure as any;
  const sections = structure?.sections || [];

  // Charger les champs de la section sélectionnée
  const { data: sectionFields, isLoading: fieldsLoading } = useQuery({
    queryKey: ["section-fields", formVersion?.id, selectedSectionKey],
    queryFn: async () => {
      if (!formVersion?.id || !selectedSectionKey) return [];

      const { data, error } = await supabase
        .from("custom_fields")
        .select("*")
        .eq("form_version_id", formVersion.id)
        .eq("section_key", selectedSectionKey)
        .is("deleted_at", null)
        .order("order_index");

      if (error) throw error;
      return data || [];
    },
    enabled: !!formVersion?.id && !!selectedSectionKey,
  });

  // Mutation pour créer un champ
  const createFieldMutation = useMutation({
    mutationFn: async () => {
      if (!formVersion?.id || !selectedSectionKey) return;

      const maxOrder = sectionFields?.reduce((max, f) => Math.max(max, f.order_index || 0), -1) || -1;

      const { data, error } = await supabase
        .from("custom_fields")
        .insert({
          form_version_id: formVersion.id,
          section_key: selectedSectionKey,
          field_key: newField.field_key,
          field_type: newField.field_type,
          label_fr: newField.label_fr,
          label_ar: newField.label_ar,
          is_required: newField.is_required,
          is_visible: true,
          order_index: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Champ ajouté avec succès");
      queryClient.invalidateQueries({ queryKey: ["section-fields"] });
      setShowAddDialog(false);
      setNewField({
        field_key: "",
        field_type: "text",
        label_fr: "",
        label_ar: "",
        is_required: false,
      });
    },
    onError: (error) => {
      console.error("Error creating field:", error);
      toast.error("Erreur lors de l'ajout du champ");
    },
  });

  // Mutation pour supprimer un champ
  const deleteFieldMutation = useMutation({
    mutationFn: async (fieldId: string) => {
      const { error } = await supabase
        .from("custom_fields")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", fieldId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Champ supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["section-fields"] });
    },
    onError: (error) => {
      console.error("Error deleting field:", error);
      toast.error("Erreur lors de la suppression du champ");
    },
  });

  const handleDeleteField = (fieldId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce champ ?")) {
      deleteFieldMutation.mutate(fieldId);
    }
  };

  const selectedSection = sections.find((s: any) => s.key === selectedSectionKey);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Gestion des champs par section
            </h1>
            <p className="text-muted-foreground">
              Ajoutez des champs personnalisés aux sections des formulaires existants
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Sélectionner une section</CardTitle>
              <CardDescription>
                Choisissez le formulaire "Dépôt légal - Monographies" puis une section
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Formulaire</Label>
                <div className="font-medium">Dépôt légal - Monographies</div>
              </div>

              {formLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="section-select">Section</Label>
                  <Select value={selectedSectionKey} onValueChange={setSelectedSectionKey}>
                    <SelectTrigger id="section-select">
                      <SelectValue placeholder="Sélectionner une section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section: any) => (
                        <SelectItem key={section.key} value={section.key}>
                          {section.label_fr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedSectionKey && selectedSection && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedSection.label_fr}</CardTitle>
                    <CardDescription>
                      Les champs personnalisés seront affichés à la fin de cette section
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un champ
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {fieldsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : sectionFields && sectionFields.length > 0 ? (
                  <div className="space-y-2">
                    {sectionFields.map((field: any) => (
                      <div
                        key={field.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{field.label_fr}</div>
                          <div className="text-sm text-muted-foreground">
                            Clé: {field.field_key} • Type: {field.field_type}
                            {field.is_required && " • Requis"}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteField(field.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun champ personnalisé. Cliquez sur "Ajouter un champ" pour commencer.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un champ personnalisé</DialogTitle>
            <DialogDescription>
              Le champ sera ajouté à la section "{selectedSection?.label_fr}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="field_key">Clé technique *</Label>
              <Input
                id="field_key"
                value={newField.field_key}
                onChange={(e) => setNewField({ ...newField, field_key: e.target.value })}
                placeholder="ex: custom_field_1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field_type">Type de champ *</Label>
              <Select
                value={newField.field_type}
                onValueChange={(value) => setNewField({ ...newField, field_type: value })}
              >
                <SelectTrigger id="field_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((type) => (
                    <SelectItem key={type.type} value={type.type}>
                      {type.label_fr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="label_fr">Label (Français) *</Label>
              <Input
                id="label_fr"
                value={newField.label_fr}
                onChange={(e) => setNewField({ ...newField, label_fr: e.target.value })}
                placeholder="ex: Champ personnalisé"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="label_ar">Label (Arabe)</Label>
              <Input
                id="label_ar"
                value={newField.label_ar}
                onChange={(e) => setNewField({ ...newField, label_ar: e.target.value })}
                placeholder="ex: حقل مخصص"
                dir="rtl"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_required"
                checked={newField.is_required}
                onChange={(e) => setNewField({ ...newField, is_required: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="is_required">Champ obligatoire</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => createFieldMutation.mutate()}
              disabled={!newField.field_key || !newField.label_fr || createFieldMutation.isPending}
            >
              {createFieldMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
