import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  onSave: (fieldData: Partial<CustomField>) => Promise<void>;
}

export function FieldConfigDialog({
  open,
  onOpenChange,
  fieldType,
  existingField,
  sections,
  existingFields,
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
          insert_after: existingField.insert_after || "__start__",
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
          insert_after: "__start__",
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

  const handleSubmit = async (data: CustomFieldConfig) => {
    setIsSubmitting(true);
    try {
      // Convert __start__ back to undefined for storage
      const submitData = {
        ...data,
        insert_after: data.insert_after === "__start__" ? undefined : data.insert_after,
      };
      await onSave(submitData);
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
            {existingField ? "Modifier le champ" : "Ajouter un champ de projet"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="label_fr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Label <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Libellé" {...field} />
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
                    <FormLabel className="flex items-center gap-1">
                      Étiquette en arabe <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="التسمية بالعربية" {...field} dir="rtl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description_fr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description:</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="field_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clé technique (slug unique)</FormLabel>
                  <FormControl>
                    <Input placeholder="mon_champ_personnalise" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="section_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Type de projet: <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Type de projet" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sections.map((section) => (
                          <SelectItem key={section.key} value={section.key}>
                            {section.label_fr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="insert_after"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insérer après le champ</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="En tête de section" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__start__">En tête de section</SelectItem>
                        {existingFields
                          .filter((f) => f.section_key === form.watch("section_key"))
                          .map((f) => (
                            <SelectItem key={f.id} value={f.field_key}>
                              {f.label_fr}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="is_required"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-x-4">
                    <FormLabel>Obligatoire</FormLabel>
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
                    <FormLabel>Visible</FormLabel>
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
                    <FormLabel>Lecture seule</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
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
