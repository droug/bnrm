import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Edit, Trash2, GripVertical } from "lucide-react";
import { CustomField, FormSection } from "@/types/formBuilder";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface FormFieldsListProps {
  sections: FormSection[];
  fields: CustomField[];
  language: "fr" | "ar";
  formName?: string;
  onEditField: (field: CustomField) => void;
  onDeleteField: (fieldId: string) => void;
  onToggleVisibility?: (fieldId: string, isVisible: boolean) => void;
}

function SortableField({ field, language, onEdit, onDelete, onToggleVisibility }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: field.id,
    data: { sectionKey: field.section_key }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white border-2 border-border rounded-lg"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>
      
      {/* Checkbox pour la visibilité */}
      <div className="flex items-center">
        <Checkbox
          id={`visibility-${field.id}`}
          checked={field.is_visible}
          onCheckedChange={(checked) => onToggleVisibility?.(field.id, !!checked)}
          className="h-5 w-5"
        />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`font-medium ${field.is_visible ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
            {language === "fr" ? field.label_fr : field.label_ar || field.label_fr}
          </span>
          <Badge variant="outline" className="text-xs">
            {field.field_type}
          </Badge>
          {field.is_required && (
            <Badge variant="destructive" className="text-xs">
              Obligatoire
            </Badge>
          )}
          {!field.is_visible && (
            <Badge variant="secondary" className="text-xs">
              Masqué
            </Badge>
          )}
        </div>
        {field.description_fr && (
          <p className="text-sm text-muted-foreground mt-1">
            {language === "fr" ? field.description_fr : field.description_ar || field.description_fr}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(field)}
          className="hover:bg-muted"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(field.id)}
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function DroppableSection({ section, fields, language, onEdit, onDelete, onToggleVisibility }: any) {
  const { setNodeRef, isOver } = useDroppable({
    id: `section-${section.key}`,
    data: { sectionKey: section.key },
  });

  const sectionFields = fields.filter((f: CustomField) => f.section_key === section.key);

  return (
    <div
      ref={setNodeRef}
      className={`transition-colors ${
        isOver ? "bg-primary/5" : ""
      }`}
    >
      <div className="space-y-2">
        {sectionFields.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
            Glissez un champ ici
          </div>
        ) : (
          sectionFields.map((field: CustomField) => (
            <SortableField
              key={field.id}
              field={field}
              language={language}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleVisibility={onToggleVisibility}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function FormFieldsList({
  sections,
  fields,
  language,
  formName,
  onEditField,
  onDeleteField,
  onToggleVisibility,
}: FormFieldsListProps) {
  return (
    <Card className="p-4 bg-background border-2 border-border">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        {formName ? `Les champs du formulaire : ${formName}` : "Les champs du formulaire"}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Cochez ou décochez les cases pour afficher ou masquer les options dans le formulaire.
      </p>
      
      <Accordion type="multiple" className="space-y-2" defaultValue={sections.map((s) => s.key)}>
        {sections.map((section) => {
          const sectionFields = fields.filter((f) => f.section_key === section.key);
          
          return (
            <AccordionItem 
              key={section.key} 
              value={section.key}
              className="border-2 border-border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-3 text-left">
                  <div className="flex-1">
                    <span className="font-semibold text-foreground">
                      {language === "fr" ? section.label_fr : section.label_ar || section.label_fr}
                    </span>
                    {section.label_ar && language === "fr" && (
                      <span className="text-sm text-muted-foreground ml-2" dir="rtl">
                        ({section.label_ar})
                      </span>
                    )}
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {sectionFields.length} {sectionFields.length > 1 ? "champs" : "champ"}
                  </Badge>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="px-4 pb-4 pt-2">
                <DroppableSection
                  section={section}
                  fields={fields}
                  language={language}
                  onEdit={onEditField}
                  onDelete={onDeleteField}
                  onToggleVisibility={onToggleVisibility}
                />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </Card>
  );
}
