import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CustomField, FormSection } from "@/types/formBuilder";
import { DynamicField } from "./DynamicField";

interface DynamicFormRendererProps {
  formKey: string;
  language?: "fr" | "ar";
  onSubmit: (data: any) => Promise<void>;
  initialData?: Record<string, any>;
  submitLabel?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function DynamicFormRenderer({
  formKey,
  language = "fr",
  onSubmit,
  initialData = {},
  submitLabel = "Soumettre",
  showBackButton = false,
  onBack,
}: DynamicFormRendererProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sections, setSections] = useState<FormSection[]>([]);
  const [fields, setFields] = useState<CustomField[]>([]);
  const [formTitle, setFormTitle] = useState("");

  const form = useForm({
    defaultValues: initialData,
  });

  useEffect(() => {
    loadFormStructure();
  }, [formKey]);

  const loadFormStructure = async () => {
    try {
      setLoading(true);

      // Charger le formulaire
      const formsResponse = await (supabase as any)
        .from("forms")
        .select("*")
        .eq("form_key", formKey)
        .maybeSingle();

      if (formsResponse.error) throw formsResponse.error;
      if (!formsResponse.data) {
        throw new Error("Formulaire non trouvé");
      }
      setFormTitle(formsResponse.data.form_name || "");

      // Charger la dernière version publiée
      const versionsResponse = await (supabase as any)
        .from("form_versions")
        .select("*")
        .eq("form_id", formsResponse.data.id)
        .eq("is_published", true)
        .order("version_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (versionsResponse.error) throw versionsResponse.error;
      if (!versionsResponse.data) {
        throw new Error("Aucune version publiée trouvée");
      }

      // Extraire les sections de la structure
      const structure = versionsResponse.data.structure as any;
      setSections(structure?.sections || []);

      // Charger les champs personnalisés
      const fieldsResponse = await (supabase as any)
        .from("custom_fields")
        .select("*")
        .eq("form_version_id", versionsResponse.data.id)
        .is("deleted_at", null)
        .order("order_index");

      if (fieldsResponse.error) throw fieldsResponse.error;
      console.log("Custom fields loaded:", fieldsResponse.data);
      setFields(fieldsResponse.data || []);

    } catch (error) {
      console.error("Erreur lors du chargement du formulaire:", error);
      toast.error("Impossible de charger le formulaire");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      await onSubmit(data);
      toast.success("Formulaire soumis avec succès");
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      toast.error("Erreur lors de la soumission du formulaire");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const visibleSections = sections.filter(section => {
    const sectionFields = fields.filter(f => f.section_key === section.key);
    console.log(`Section ${section.key}: ${sectionFields.length} fields, visible: ${sectionFields.some(f => f.is_visible)}`);
    return sectionFields.some(f => f.is_visible);
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{formTitle}</CardTitle>
        <CardDescription>
          Veuillez remplir tous les champs requis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Accordion type="multiple" defaultValue={visibleSections.map(s => s.key)} className="space-y-4">
              {visibleSections.map((section) => {
                const sectionFields = fields
                  .filter((f) => f.section_key === section.key && f.is_visible)
                  .sort((a, b) => a.order_index - b.order_index);

                console.log(`Rendering section ${section.key} with ${sectionFields.length} fields:`, sectionFields.map(f => f.field_key));

                if (sectionFields.length === 0) return null;

                const sectionLabel = language === "fr" 
                  ? section.label_fr 
                  : (section.label_ar || section.label_fr);

                return (
                  <AccordionItem 
                    key={section.key} 
                    value={section.key}
                    className="border-2 border-border rounded-lg"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                      <h3 className="text-lg font-semibold text-foreground">
                        {sectionLabel}
                      </h3>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sectionFields.map((field) => (
                          <div
                            key={field.id}
                            className={cn(
                              field.field_type === "textarea" && "md:col-span-2"
                            )}
                          >
                            <DynamicField
                              field={field}
                              control={form.control}
                              language={language}
                            />
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            <div className="flex gap-4 justify-end pt-4 border-t">
              {showBackButton && onBack && (
                <Button type="button" variant="outline" onClick={onBack}>
                  Retour
                </Button>
              )}
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitLabel}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
