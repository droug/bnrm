import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { ElementData } from './WysiwygEditor';

interface PropertiesPanelProps {
  selectedElement: ElementData | null;
  onUpdateElement: (id: string, updates: Partial<ElementData>) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElement,
  onUpdateElement
}) => {
  if (!selectedElement) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <div className="text-sm">Sélectionnez un élément pour modifier ses propriétés</div>
      </div>
    );
  }

  const updateStyle = (key: keyof ElementData['styles'], value: string) => {
    onUpdateElement(selectedElement.id, {
      styles: { ...selectedElement.styles, [key]: value }
    });
  };

  const updateContent = (content: string) => {
    onUpdateElement(selectedElement.id, { content });
  };

  return (
    <div className="space-y-6">
      {/* Contenu */}
      <div>
        <Label className="text-sm font-medium">Contenu</Label>
        <div className="mt-2">
          {selectedElement.type === 'image' ? (
            <Input
              value={selectedElement.content}
              onChange={(e) => updateContent(e.target.value)}
              placeholder="URL de l'image"
            />
          ) : (
            <Input
              value={selectedElement.content}
              onChange={(e) => updateContent(e.target.value)}
              placeholder="Contenu de l'élément"
            />
          )}
        </div>
      </div>

      <Separator />

      {/* Typographie */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Typographie</Label>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Taille de police</Label>
            <Input
              value={selectedElement.styles.fontSize || '16px'}
              onChange={(e) => updateStyle('fontSize', e.target.value)}
              placeholder="16px"
            />
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground">Poids de police</Label>
            <Select
              value={selectedElement.styles.fontWeight || 'normal'}
              onValueChange={(value) => updateStyle('fontWeight', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="bold">Gras</SelectItem>
                <SelectItem value="lighter">Léger</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Alignement</Label>
            <Select
              value={selectedElement.styles.textAlign || 'left'}
              onValueChange={(value) => updateStyle('textAlign', value as 'left' | 'center' | 'right')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Gauche</SelectItem>
                <SelectItem value="center">Centre</SelectItem>
                <SelectItem value="right">Droite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Couleurs */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Couleurs</Label>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Couleur du texte</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={selectedElement.styles.color || '#000000'}
                onChange={(e) => updateStyle('color', e.target.value)}
                className="w-12 h-8 p-0 border-0"
              />
              <Input
                value={selectedElement.styles.color || '#000000'}
                onChange={(e) => updateStyle('color', e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground">Couleur de fond</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={selectedElement.styles.backgroundColor || '#ffffff'}
                onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                className="w-12 h-8 p-0 border-0"
              />
              <Input
                value={selectedElement.styles.backgroundColor || '#ffffff'}
                onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Espacement */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Espacement</Label>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Padding intérieur</Label>
            <Input
              value={selectedElement.styles.padding || '16px'}
              onChange={(e) => updateStyle('padding', e.target.value)}
              placeholder="16px"
            />
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground">Margin extérieur</Label>
            <Input
              value={selectedElement.styles.margin || '8px'}
              onChange={(e) => updateStyle('margin', e.target.value)}
              placeholder="8px"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Dimensions */}
      {(selectedElement.type === 'image' || selectedElement.type === 'container') && (
        <>
          <div>
            <Label className="text-sm font-medium mb-3 block">Dimensions</Label>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Largeur</Label>
                <Input
                  value={selectedElement.styles.width || 'auto'}
                  onChange={(e) => updateStyle('width', e.target.value)}
                  placeholder="auto"
                />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">Hauteur</Label>
                <Input
                  value={selectedElement.styles.height || 'auto'}
                  onChange={(e) => updateStyle('height', e.target.value)}
                  placeholder="auto"
                />
              </div>
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Bordure */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Bordure & Style</Label>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Bordure</Label>
            <Input
              value={selectedElement.styles.border || 'none'}
              onChange={(e) => updateStyle('border', e.target.value)}
              placeholder="1px solid #000000"
            />
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground">Rayon de bordure</Label>
            <Input
              value={selectedElement.styles.borderRadius || '0px'}
              onChange={(e) => updateStyle('borderRadius', e.target.value)}
              placeholder="0px"
            />
          </div>
        </div>
      </div>

      {/* Raccourcis de style rapide */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Styles rapides</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              updateStyle('backgroundColor', '#3b82f6');
              updateStyle('color', '#ffffff');
              updateStyle('padding', '12px 24px');
              updateStyle('borderRadius', '8px');
            }}
          >
            Bouton bleu
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              updateStyle('backgroundColor', 'transparent');
              updateStyle('border', '2px solid #3b82f6');
              updateStyle('color', '#3b82f6');
              updateStyle('padding', '12px 24px');
              updateStyle('borderRadius', '8px');
            }}
          >
            Contour bleu
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              updateStyle('fontSize', '24px');
              updateStyle('fontWeight', 'bold');
              updateStyle('color', '#1f2937');
            }}
          >
            Titre principal
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              updateStyle('backgroundColor', '#f3f4f6');
              updateStyle('padding', '24px');
              updateStyle('borderRadius', '12px');
              updateStyle('border', '1px solid #e5e7eb');
            }}
          >
            Carte
          </Button>
        </div>
      </div>
    </div>
  );
};