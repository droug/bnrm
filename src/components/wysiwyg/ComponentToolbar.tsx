import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Type, 
  Image, 
  Square, 
  MousePointer,
  Heading1,
  Container,
  GripVertical
} from 'lucide-react';
import { ElementData } from './WysiwygEditor';

interface ComponentToolbarProps {
  onAddElement: (type: ElementData['type']) => void;
}

const DraggableComponent: React.FC<{
  type: ElementData['type'];
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  onAddElement: (type: ElementData['type']) => void;
}> = ({ type, label, icon: Icon, description, onAddElement }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `toolbar-${type}`,
    data: { type }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`p-3 cursor-pointer hover:bg-accent transition-colors ${isDragging ? 'z-50' : ''}`}
      onClick={() => onAddElement(type)}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm">{label}</div>
          <div className="text-xs text-muted-foreground">
            {description}
          </div>
        </div>
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
    </Card>
  );
};

export const ComponentToolbar: React.FC<ComponentToolbarProps> = ({ onAddElement }) => {
  const components = [
    {
      type: 'heading' as const,
      label: 'Titre',
      icon: Heading1,
      description: 'Ajouter un titre'
    },
    {
      type: 'text' as const,
      label: 'Texte',
      icon: Type,
      description: 'Ajouter du texte'
    },
    {
      type: 'button' as const,
      label: 'Bouton',
      icon: MousePointer,
      description: 'Ajouter un bouton'
    },
    {
      type: 'image' as const,
      label: 'Image',
      icon: Image,
      description: 'Ajouter une image'
    },
    {
      type: 'container' as const,
      label: 'Conteneur',
      icon: Container,
      description: 'Ajouter un conteneur'
    }
  ];

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm text-muted-foreground mb-3">
        Glissez les composants sur la zone de conception
      </h3>
      
      {components.map((component) => (
        <DraggableComponent
          key={component.type}
          type={component.type}
          label={component.label}
          icon={component.icon}
          description={component.description}
          onAddElement={onAddElement}
        />
      ))}
      
      <div className="mt-6 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 Astuce : Cliquez sur un élément pour le sélectionner et modifier ses propriétés dans le panneau de droite.
        </p>
      </div>
    </div>
  );
};