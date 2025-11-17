import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import CmsSectionItem from "./CmsSectionItem";
import CmsSectionTypeSelector from "./CmsSectionTypeSelector";

interface CmsSectionBuilderProps {
  sections: any[];
  onChange: (sections: any[]) => void;
}

export default function CmsSectionBuilder({ sections, onChange }: CmsSectionBuilderProps) {
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id || s.tempId === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id || s.tempId === over.id);
      onChange(arrayMove(sections, oldIndex, newIndex));
    }
  };

  const handleAddSection = (type: string) => {
    const newSection = {
      tempId: `temp-${Date.now()}`,
      section_type: type,
      title_fr: '',
      title_ar: '',
      content_fr: '',
      content_ar: '',
      props: {},
      is_visible: true
    };
    onChange([...sections, newSection]);
    setShowTypeSelector(false);
  };

  const handleUpdateSection = (index: number, updatedSection: any) => {
    const newSections = [...sections];
    newSections[index] = updatedSection;
    onChange(newSections);
  };

  const handleDeleteSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    onChange(newSections);
  };

  const handleDuplicateSection = (index: number) => {
    const sectionToDuplicate = sections[index];
    const duplicated = {
      ...sectionToDuplicate,
      id: undefined,
      tempId: `temp-${Date.now()}`
    };
    onChange([...sections, duplicated]);
  };

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map(s => s.id || s.tempId)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section, index) => (
            <CmsSectionItem
              key={section.id || section.tempId}
              section={section}
              index={index}
              onUpdate={(updated) => handleUpdateSection(index, updated)}
              onDelete={() => handleDeleteSection(index)}
              onDuplicate={() => handleDuplicateSection(index)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {showTypeSelector ? (
        <CmsSectionTypeSelector
          onSelect={handleAddSection}
          onCancel={() => setShowTypeSelector(false)}
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setShowTypeSelector(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une section
        </Button>
      )}
    </div>
  );
}
