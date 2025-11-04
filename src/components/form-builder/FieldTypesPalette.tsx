import { Card } from "@/components/ui/card";
import { FIELD_TYPES } from "@/types/formBuilder";
import { useDraggable } from "@dnd-kit/core";

interface FieldTypesPaletteProps {
  language: "fr" | "ar";
}

function DraggableFieldType({ fieldType, language }: { fieldType: typeof FIELD_TYPES[0]; language: "fr" | "ar" }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `field-type-${fieldType.type}`,
    data: { fieldType },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center gap-3 p-3 bg-white hover:bg-muted/50 border-2 border-border rounded-lg cursor-grab active:cursor-grabbing transition-colors"
    >
      <div className="text-2xl">{fieldType.icon}</div>
      <div className="text-sm font-medium text-foreground">
        {language === "fr" ? fieldType.label_fr : fieldType.label_ar}
      </div>
    </div>
  );
}

export function FieldTypesPalette({ language }: FieldTypesPaletteProps) {
  return (
    <Card className="p-4 bg-background border-2 border-border">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Types de champs</h3>
      <div className="space-y-2">
        {FIELD_TYPES.map((fieldType) => (
          <DraggableFieldType key={fieldType.type} fieldType={fieldType} language={language} />
        ))}
      </div>
    </Card>
  );
}
