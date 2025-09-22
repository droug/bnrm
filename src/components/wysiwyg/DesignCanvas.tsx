import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ContentEditable from 'react-contenteditable';
import { Button } from '@/components/ui/button';
import { Trash2, Move, Edit } from 'lucide-react';
import { ElementData } from './WysiwygEditor';

interface DesignCanvasProps {
  elements: ElementData[];
  selectedElement: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<ElementData>) => void;
  onDeleteElement: (id: string) => void;
  previewMode: boolean;
}

const SortableElement: React.FC<{
  element: ElementData;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<ElementData>) => void;
  onDelete: () => void;
  previewMode: boolean;
}> = ({ element, isSelected, onSelect, onUpdate, onDelete, previewMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleContentChange = (evt: any) => {
    onUpdate({ content: evt.target.value });
  };

  const handleStyleChange = (newStyles: Partial<ElementData['styles']>) => {
    onUpdate({ styles: { ...element.styles, ...newStyles } });
  };

  const elementStyle = {
    ...element.styles,
    position: 'relative' as const,
    cursor: previewMode ? 'default' : 'pointer',
    minHeight: element.type === 'container' ? '100px' : 'auto',
    border: isSelected && !previewMode ? '2px solid #3b82f6' : element.styles.border || 'none',
  };

  const renderElement = () => {
    switch (element.type) {
      case 'heading':
        return (
          <ContentEditable
            html={element.content}
            onChange={handleContentChange}
            disabled={previewMode}
            tagName="h1"
            style={elementStyle}
            className="outline-none"
          />
        );
      
      case 'text':
        return (
          <ContentEditable
            html={element.content}
            onChange={handleContentChange}
            disabled={previewMode}
            tagName="p"
            style={elementStyle}
            className="outline-none"
          />
        );
      
      case 'button':
        return (
          <button
            style={elementStyle}
            className="px-4 py-2 outline-none"
            onClick={previewMode ? undefined : onSelect}
          >
            <ContentEditable
              html={element.content}
              onChange={handleContentChange}
              disabled={previewMode}
              tagName="span"
              className="outline-none"
            />
          </button>
        );
      
      case 'image':
        return (
          <div style={elementStyle} className="overflow-hidden">
            <img
              src={element.content}
              alt="Element"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image';
              }}
            />
          </div>
        );
      
      case 'container':
        return (
          <div
            style={elementStyle}
            className="min-h-20 flex items-center justify-center text-muted-foreground border-2 border-dashed border-border"
          >
            {element.content || 'Conteneur vide - Ajoutez du contenu'}
          </div>
        );
      
      default:
        return <div style={elementStyle}>{element.content}</div>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative group ${isSelected && !previewMode ? 'ring-2 ring-primary' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        if (!previewMode) onSelect();
      }}
    >
      {renderElement()}
      
      {/* Contrôles d'édition */}
      {isSelected && !previewMode && (
        <div className="absolute -top-8 left-0 flex gap-1 bg-primary text-primary-foreground rounded p-1 shadow-lg">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-primary-foreground/20"
            {...listeners}
          >
            <Move className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-primary-foreground/20"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(!isEditing);
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export const DesignCanvas: React.FC<DesignCanvasProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  previewMode
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'design-canvas'
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex-1 overflow-auto ${previewMode ? 'bg-background' : 'bg-muted/30'} ${
        isOver && !previewMode ? 'bg-primary/10 border-2 border-dashed border-primary' : ''
      }`}
      onClick={() => !previewMode && onSelectElement(null)}
    >
      <div className={`min-h-full ${previewMode ? '' : 'p-8'}`}>
        {elements.length === 0 ? (
          !previewMode && (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-lg m-8">
              <div className="text-center text-muted-foreground">
                <div className="text-lg font-medium mb-2">Zone de conception vide</div>
                <div className="text-sm">
                  {isOver ? '🎯 Déposez le composant ici' : 'Glissez et déposez des composants depuis la barre latérale pour commencer'}
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-4">
            {elements.map((element) => (
              <SortableElement
                key={element.id}
                element={element}
                isSelected={selectedElement === element.id}
                onSelect={() => onSelectElement(element.id)}
                onUpdate={(updates) => onUpdateElement(element.id, updates)}
                onDelete={() => onDeleteElement(element.id)}
                previewMode={previewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};