import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Type, 
  Image, 
  Square, 
  MousePointer,
  Heading1,
  Container
} from 'lucide-react';
import { ElementData } from './WysiwygEditor';

interface ComponentToolbarProps {
  onAddElement: (type: ElementData['type']) => void;
}

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
        <Card 
          key={component.type}
          className="p-3 cursor-pointer hover:bg-accent transition-colors"
          onClick={() => onAddElement(component.type)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
              <component.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium text-sm">{component.label}</div>
              <div className="text-xs text-muted-foreground">
                {component.description}
              </div>
            </div>
          </div>
        </Card>
      ))}
      
      <div className="mt-6 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 Astuce : Cliquez sur un élément pour le sélectionner et modifier ses propriétés dans le panneau de droite.
        </p>
      </div>
    </div>
  );
};