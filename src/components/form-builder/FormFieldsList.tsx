import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
}

function SortableField({ field, language, onEdit, onDelete }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

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
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">
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

function DroppableSection({ section, fields, language, onEdit, onDelete }: any) {
  const { setNodeRef, isOver } = useDroppable({
    id: `section-${section.key}`,
    data: { sectionKey: section.key },
  });

  const sectionFields = fields.filter((f: CustomField) => f.section_key === section.key);

  return (
    <div
      ref={setNodeRef}
      className={`p-4 border-2 rounded-lg transition-colors ${
        isOver ? "border-primary bg-primary/5" : "border-border bg-background"
      }`}
    >
      <h4 className="text-base font-semibold mb-3 text-foreground">
        {language === "fr" ? section.label_fr : section.label_ar || section.label_fr}
      </h4>
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
}: FormFieldsListProps) {
  return (
    <Card className="p-4 bg-background border-2 border-border">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        {formName ? `Les champs du formulaire : ${formName}` : "Les champs du formulaire"}
      </h3>
      <div className="space-y-4">
        {sections.map((section) => (
          <DroppableSection
            key={section.key}
            section={section}
            fields={fields}
            language={language}
            onEdit={onEditField}
            onDelete={onDeleteField}
          />
        ))}
      </div>
    </Card>
  );
}
