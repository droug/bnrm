import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FieldTypesPalette } from "@/components/form-builder/FieldTypesPalette";
import { FormFieldsList } from "@/components/form-builder/FormFieldsList";
import { FieldConfigDialog } from "@/components/form-builder/FieldConfigDialog";
import { SectionManager } from "@/components/form-builder/SectionManager";
import { FormGenerator } from "@/components/form-builder/FormGenerator";
import { useFormBuilder } from "@/hooks/useFormBuilder";
import { FormFilter, CustomField } from "@/types/formBuilder";
import { Loader2, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import { initializeLegalDepositMonographForm } from "@/utils/initializeLegalDepositForm";

export default function FormBuilder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isLibrarian, loading: rolesLoading } = useSecureRoles();
  const [filter, setFilter] = useState<FormFilter>({
    platform: "bnrm",
    module: "",
    formKey: "",
    language: "fr",
  });
  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const [selectedFieldType, setSelectedFieldType] = useState<string | undefined>();
  const [editingField, setEditingField] = useState<CustomField | null>(null);

  const {
    loading,
    currentForm,
    currentStructure,
    customFields,
    availableModules,
    availableForms,
    loadFormStructure,
    loadModulesByPlatform,
    loadFormsByPlatformAndModule,
    createField,
    updateField,
    deleteField,
    publishVersion,
    reorderFields,
    updateSections,
    generateCompleteForm,
  } = useFormBuilder();

  // Charger les modules quand la plateforme change
  const handlePlatformChange = async (platform: string) => {
    setFilter({ ...filter, platform, module: "", formKey: "" });
    await loadModulesByPlatform(platform);
  };

  // Charger les formulaires quand le module change
  const handleModuleChange = async (module: string) => {
    setFilter({ ...filter, module, formKey: "" });
    await loadFormsByPlatformAndModule(filter.platform, module);
  };

  // Initialiser le formulaire au chargement
  useEffect(() => {
    const init = async () => {
      await initializeLegalDepositMonographForm();
    };
    init();
  }, []);

  if (rolesLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (!user || (!isAdmin && !isLibrarian)) {
    return <Navigate to="/auth" replace />;
  }

  const handleLoadForm = async () => {
    if (!filter.platform || !filter.module || !filter.formKey) {
      toast.error("Veuillez remplir tous les champs de filtre");
      return;
    }
    await loadFormStructure(filter);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Nouveau champ glissé depuis la palette
    if (active.id.toString().startsWith("field-type-")) {
      const fieldType = active.data.current?.fieldType.type;
      setSelectedFieldType(fieldType);
      setEditingField(null);
      setShowFieldDialog(true);
    }
    // Réordonnancement de champs existants
    else if (active.id !== over.id) {
      // Trouver la section du champ actif
      const activeField = customFields.find((f) => f.id === active.id);
      // Trouver la section du champ survolé (ou depuis les données de over)
      const overField = customFields.find((f) => f.id === over.id);
      const sectionKey = over.data.current?.sectionKey || overField?.section_key;
      
      if (sectionKey && activeField?.section_key === sectionKey) {
        const sectionFields = customFields
          .filter((f) => f.section_key === sectionKey)
          .sort((a, b) => a.order_index - b.order_index)
          .map((f) => f.id);
        
        const oldIndex = sectionFields.indexOf(active.id as string);
        const newIndex = sectionFields.indexOf(over.id as string);
        
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const newOrder = [...sectionFields];
          newOrder.splice(oldIndex, 1);
          newOrder.splice(newIndex, 0, active.id as string);
          reorderFields(sectionKey, newOrder);
          toast.success("Champ réordonné avec succès");
        }
      }
    }
  };

  const handleSaveField = async (fieldData: Partial<CustomField>) => {
    if (editingField) {
      await updateField(editingField.id, fieldData);
    } else {
      await createField(fieldData);
    }
  };

  const handleEditField = (field: CustomField) => {
    setEditingField(field);
    setSelectedFieldType(field.field_type);
    setShowFieldDialog(true);
  };

  const handleToggleVisibility = async (fieldId: string, isVisible: boolean) => {
    await updateField(fieldId, { is_visible: isVisible });
  };

  // Récupérer les sections réelles depuis la structure du formulaire
  const formSections = currentStructure?.structure?.sections || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Gestion des champs</h1>
              <p className="text-muted-foreground">
                Personnalisez vos formulaires en ajoutant ou modifiant des champs
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/admin/import-form-fields")}
            >
              <Download className="mr-2 h-4 w-4" />
              Importer des champs
            </Button>
          </div>
        </div>

        {/* Filtres */}
        <Card className="p-6 mb-6 border-2 border-border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="platform">Plateforme</Label>
              <Select
                value={filter.platform}
                onValueChange={handlePlatformChange}
              >
                <SelectTrigger id="platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bnrm">BNRM</SelectItem>
                  <SelectItem value="depot_legal">Dépôt légal</SelectItem>
                  <SelectItem value="bn">Bibliothèque Numérique</SelectItem>
                  <SelectItem value="activites_culturelles">Activités culturelles</SelectItem>
                  <SelectItem value="cbn">CBN</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="module">Module</Label>
              <Select
                value={filter.module || undefined}
                onValueChange={handleModuleChange}
                disabled={availableModules.length === 0}
              >
                <SelectTrigger id="module">
                  <SelectValue placeholder="Sélectionner un module" />
                </SelectTrigger>
                <SelectContent>
                  {availableModules.map((module) => (
                    <SelectItem key={module} value={module}>
                      {module.charAt(0).toUpperCase() + module.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="formKey">Formulaire</Label>
              <Select
                value={filter.formKey || undefined}
                onValueChange={(value) => setFilter({ ...filter, formKey: value })}
                disabled={availableForms.length === 0}
              >
                <SelectTrigger id="formKey">
                  <SelectValue placeholder="Sélectionner un formulaire" />
                </SelectTrigger>
                <SelectContent>
                  {availableForms.map((form) => (
                    <SelectItem key={form.id} value={form.form_key}>
                      {form.form_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">Langue</Label>
              <Select
                value={filter.language}
                onValueChange={(value) => setFilter({ ...filter, language: value as "fr" | "ar" })}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleLoadForm} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Charger
          </Button>
        </Card>

        {/* Statut et actions */}
        {currentForm && (
          <Card className="p-4 mb-6 border-2 border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Formulaire:</span>
                  <span className="ml-2 font-semibold text-foreground">{currentForm.form_name}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Version:</span>
                  <span className="ml-2 font-semibold text-foreground">{currentForm.current_version}</span>
                </div>
                {currentStructure && !currentStructure.is_published && (
                  <Badge variant="outline">Brouillon non publié</Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Prévisualiser</Button>
                <Button onClick={publishVersion} disabled={!currentStructure || currentStructure.is_published}>
                  <Upload className="mr-2 h-4 w-4" />
                  Publier
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Générateur automatique de formulaire */}
        {currentForm && currentStructure && formSections.length === 0 && (
          <FormGenerator
            formKey={currentForm.form_key}
            formName={currentForm.form_name}
            onGenerate={() => generateCompleteForm(currentForm.form_key)}
          />
        )}

        {/* Gestionnaire de sections */}
        {currentForm && currentStructure && formSections.length > 0 && (
          <SectionManager
            sections={formSections}
            onSectionsUpdate={updateSections}
          />
        )}

        {/* Interface drag-and-drop */}
        {currentForm && (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <FieldTypesPalette language={filter.language} />
              </div>

              <div className="lg:col-span-3">
                <SortableContext items={customFields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  <FormFieldsList
                    sections={formSections}
                    fields={customFields}
                    language={filter.language}
                    formName={currentForm.form_name}
                    onEditField={handleEditField}
                    onDeleteField={deleteField}
                    onToggleVisibility={handleToggleVisibility}
                  />
                </SortableContext>
              </div>
            </div>
          </DndContext>
        )}

        {/* Dialog de configuration */}
        <FieldConfigDialog
          open={showFieldDialog}
          onOpenChange={setShowFieldDialog}
          fieldType={selectedFieldType}
          existingField={editingField}
          sections={formSections}
          existingFields={customFields}
          formName={currentForm?.form_name}
          onSave={handleSaveField}
        />
      </main>

      <Footer />
    </div>
  );
}
