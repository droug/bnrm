import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FieldSelect, FieldSelectItem } from "@/components/ui/field-select";
import { customFieldConfigSchema, CustomFieldConfig } from "@/schemas/customFieldSchema";
import { CustomField } from "@/types/formBuilder";
import { Loader2 } from "lucide-react";

interface FieldConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldType?: string;
  existingField?: CustomField | null;
  sections: Array<{ key: string; label_fr: string; label_ar?: string }>;
  existingFields: CustomField[];
  formName?: string;
  onSave: (fieldData: Partial<CustomField>) => Promise<void>;
}

export function FieldConfigDialog({
  open,
  onOpenChange,
  fieldType,
  existingField,
  sections,
  existingFields,
  formName,
  onSave,
}: FieldConfigDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CustomFieldConfig>({
    resolver: zodResolver(customFieldConfigSchema),
    defaultValues: existingField
      ? {
          field_key: existingField.field_key,
          field_type: existingField.field_type as any,
          section_key: existingField.section_key,
          order_index: existingField.order_index,
          label_fr: existingField.label_fr,
          label_ar: existingField.label_ar || "",
          description_fr: existingField.description_fr || "",
          description_ar: existingField.description_ar || "",
          is_required: existingField.is_required,
          is_visible: existingField.is_visible,
          is_readonly: existingField.is_readonly,
          default_value: existingField.default_value || "",
          validation_rules: existingField.validation_rules as any,
          visibility_conditions: existingField.visibility_conditions as any,
          config: existingField.config,
        }
      : {
          field_key: "",
          field_type: fieldType as any,
          section_key: sections[0]?.key || "",
          order_index: existingFields.length,
          label_fr: "",
          label_ar: "",
          description_fr: "",
          description_ar: "",
          is_required: false,
          is_visible: true,
          is_readonly: false,
          default_value: "",
        },
  });

  // Reset form when existingField changes
  useEffect(() => {
    if (existingField) {
      form.reset({
        field_key: existingField.field_key,
        field_type: existingField.field_type as any,
        section_key: existingField.section_key,
        order_index: existingField.order_index,
        label_fr: existingField.label_fr,
        label_ar: existingField.label_ar || "",
        description_fr: existingField.description_fr || "",
        description_ar: existingField.description_ar || "",
        is_required: existingField.is_required,
        is_visible: existingField.is_visible,
        is_readonly: existingField.is_readonly,
        default_value: existingField.default_value || "",
        validation_rules: existingField.validation_rules as any,
        visibility_conditions: existingField.visibility_conditions as any,
        config: existingField.config,
      });
    } else {
      form.reset({
        field_key: "",
        field_type: fieldType as any,
        section_key: sections[0]?.key || "",
        order_index: existingFields.length,
        label_fr: "",
        label_ar: "",
        description_fr: "",
        description_ar: "",
        is_required: false,
        is_visible: true,
        is_readonly: false,
        default_value: "",
      });
    }
  }, [existingField, fieldType, sections, existingFields, form]);

  const handleSubmit = async (data: CustomFieldConfig) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error saving field:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingField 
              ? `Modifier le champ${formName ? ` - ${formName}` : ""}` 
              : `Ajouter un champ${formName ? ` - ${formName}` : ""}`
            }
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Informations de base */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                Informations de base
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="label_fr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Label français <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nom du champ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="label_ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label arabe</FormLabel>
                      <FormControl>
                        <Input placeholder="اسم الحقل" {...field} dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="field_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Clé technique <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="nom_champ" 
                        {...field}
                        disabled={!!existingField}
                      />
                    </FormControl>
                    <FormMessage />
                    {existingField && (
                      <p className="text-xs text-muted-foreground">
                        La clé technique ne peut pas être modifiée après création
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="field_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Type de champ <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <FieldSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Sélectionner un type"
                      >
                        <FieldSelectItem value="text">Texte sur seule ligne</FieldSelectItem>
                        <FieldSelectItem value="textarea">Texte multiligne</FieldSelectItem>
                        <FieldSelectItem value="number">Nombre</FieldSelectItem>
                        <FieldSelectItem value="date">Date</FieldSelectItem>
                        <FieldSelectItem value="select">Liste système</FieldSelectItem>
                        <FieldSelectItem value="multiselect">Multiple sélection</FieldSelectItem>
                        <FieldSelectItem value="boolean">Oui/Non (checkbox)</FieldSelectItem>
                        <FieldSelectItem value="file">Fichier</FieldSelectItem>
                        <FieldSelectItem value="link">Lien (URL)</FieldSelectItem>
                        <FieldSelectItem value="location">Emplacement</FieldSelectItem>
                        <FieldSelectItem value="coordinates">Latitude/Longitude</FieldSelectItem>
                        <FieldSelectItem value="reference">Référence</FieldSelectItem>
                        <FieldSelectItem value="group">Groupe de champs</FieldSelectItem>
                      </FieldSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                Description
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="description_fr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description française</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Texte d'aide pour l'utilisateur" 
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description_ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description arabe</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="نص المساعدة للمستخدم" 
                          {...field}
                          dir="rtl"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Règles de gestion */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                Règles de gestion
              </h3>
              
              <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                <FormField
                  control={form.control}
                  name="is_required"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-x-4">
                      <div className="space-y-0.5">
                        <FormLabel>Champ obligatoire</FormLabel>
                        <p className="text-xs text-muted-foreground">
                          L'utilisateur doit remplir ce champ
                        </p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_visible"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-x-4">
                      <div className="space-y-0.5">
                        <FormLabel>Champ visible</FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Afficher ce champ dans le formulaire
                        </p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_readonly"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-x-4">
                      <div className="space-y-0.5">
                        <FormLabel>Lecture seule</FormLabel>
                        <p className="text-xs text-muted-foreground">
                          L'utilisateur ne peut pas modifier ce champ
                        </p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="default_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valeur par défaut</FormLabel>
                    <FormControl>
                      <Input placeholder="Valeur pré-remplie" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
