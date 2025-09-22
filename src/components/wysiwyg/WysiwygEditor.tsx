import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Type, 
  Image, 
  Square, 
  Mouse, 
  Save, 
  Eye, 
  Undo, 
  Redo,
  Palette,
  Layout,
  Settings,
  Heading1,
  Container,
  Trash2,
  Edit
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import ContentEditable from 'react-contenteditable';

export interface ElementData {
  id: string;
  type: 'text' | 'image' | 'button' | 'container' | 'heading';
  content: string;
  styles: {
    backgroundColor?: string;
    color?: string;
    fontSize?: string;
    fontWeight?: string;
    padding?: string;
    margin?: string;
    borderRadius?: string;
    border?: string;
    width?: string;
    height?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
}

// Composant de la barre latérale des composants
const ComponentToolbar: React.FC<{ onAddElement: (type: ElementData['type']) => void }> = ({ onAddElement }) => {
  const components = [
    { type: 'heading' as const, label: 'Titre', icon: Heading1, description: 'Ajouter un titre' },
    { type: 'text' as const, label: 'Texte', icon: Type, description: 'Ajouter du texte' },
    { type: 'button' as const, label: 'Bouton', icon: Mouse, description: 'Ajouter un bouton' },
    { type: 'image' as const, label: 'Image', icon: Image, description: 'Ajouter une image' },
    { type: 'container' as const, label: 'Conteneur', icon: Container, description: 'Ajouter un conteneur' }
  ];

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm text-muted-foreground mb-3">
        Cliquez pour ajouter des composants
      </h3>
      
      {components.map((component) => (
        <Card 
          key={component.type}
          className="p-3 cursor-pointer hover:bg-accent transition-colors border-l-4 border-l-primary/20 hover:border-l-primary"
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
          💡 Astuce : Cliquez sur un élément pour le sélectionner et modifier ses propriétés.
        </p>
      </div>
    </div>
  );
};

// Composant d'un élément éditable
const EditableElement: React.FC<{
  element: ElementData;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<ElementData>) => void;
  onDelete: () => void;
  previewMode: boolean;
}> = ({ element, isSelected, onSelect, onUpdate, onDelete, previewMode }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleContentChange = (evt: any) => {
    onUpdate({ content: evt.target.value });
  };

  const elementStyle = {
    ...element.styles,
    position: 'relative' as const,
    cursor: previewMode ? 'default' : 'pointer',
    minHeight: element.type === 'container' ? '100px' : 'auto',
    border: isSelected && !previewMode ? '2px solid #3b82f6' : element.styles.border || 'none',
    outline: 'none'
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
          <div style={elementStyle} className="inline-block">
            <ContentEditable
              html={element.content}
              onChange={handleContentChange}
              disabled={previewMode}
              tagName="button"
              className="px-4 py-2 outline-none cursor-pointer"
              style={{ backgroundColor: element.styles.backgroundColor, color: element.styles.color, borderRadius: element.styles.borderRadius }}
            />
          </div>
        );
      
      case 'image':
        return (
          <div style={elementStyle} className="overflow-hidden">
            <img
              src={element.content}
              alt="Element"
              style={{
                width: element.styles.width || '300px',
                height: element.styles.height || '200px',
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
            {element.content || 'Conteneur vide - Cliquez pour éditer'}
          </div>
        );
      
      default:
        return <div style={elementStyle}>{element.content}</div>;
    }
  };

  return (
    <div
      className={`relative group mb-4 ${isSelected && !previewMode ? 'ring-2 ring-primary rounded' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        if (!previewMode) onSelect();
      }}
    >
      {renderElement()}
      
      {/* Contrôles d'édition */}
      {isSelected && !previewMode && (
        <div className="absolute -top-8 right-0 flex gap-1 bg-primary text-primary-foreground rounded p-1 shadow-lg z-10">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-primary-foreground/20"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(!isEditing);
            }}
            title="Éditer"
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
            title="Supprimer"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

// Panneau de propriétés
const PropertiesPanel: React.FC<{
  selectedElement: ElementData | null;
  onUpdateElement: (id: string, updates: Partial<ElementData>) => void;
}> = ({ selectedElement, onUpdateElement }) => {
  if (!selectedElement) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Sélectionnez un élément pour modifier ses propriétés</p>
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Contenu</Label>
        <Input
          value={selectedElement.content}
          onChange={(e) => updateContent(e.target.value)}
          placeholder="Tapez votre contenu..."
        />
      </div>

      <div className="space-y-2">
        <Label>Couleur de fond</Label>
        <Input
          type="color"
          value={selectedElement.styles.backgroundColor || '#ffffff'}
          onChange={(e) => updateStyle('backgroundColor', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Couleur du texte</Label>
        <Input
          type="color"
          value={selectedElement.styles.color || '#000000'}
          onChange={(e) => updateStyle('color', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Taille de police</Label>
        <Input
          value={selectedElement.styles.fontSize || '16px'}
          onChange={(e) => updateStyle('fontSize', e.target.value)}
          placeholder="16px"
        />
      </div>

      <div className="space-y-2">
        <Label>Padding</Label>
        <Input
          value={selectedElement.styles.padding || '16px'}
          onChange={(e) => updateStyle('padding', e.target.value)}
          placeholder="16px"
        />
      </div>

      <div className="space-y-2">
        <Label>Bordure arrondie</Label>
        <Input
          value={selectedElement.styles.borderRadius || '0px'}
          onChange={(e) => updateStyle('borderRadius', e.target.value)}
          placeholder="8px"
        />
      </div>
    </div>
  );
};

// Composant principal
const WysiwygEditor = () => {
  const [elements, setElements] = useState<ElementData[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [history, setHistory] = useState<ElementData[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const addElement = useCallback((type: ElementData['type']) => {
    const newElement: ElementData = {
      id: `element-${Date.now()}`,
      type,
      content: type === 'text' ? 'Nouveau texte - cliquez pour éditer' : 
               type === 'heading' ? 'Nouveau titre' :
               type === 'button' ? 'Bouton' :
               type === 'image' ? 'https://via.placeholder.com/300x200?text=Image' : 
               type === 'container' ? 'Conteneur' : 'Contenu',
      styles: {
        padding: '16px',
        margin: '8px',
        backgroundColor: type === 'button' ? '#3b82f6' : 'transparent',
        color: type === 'button' ? '#ffffff' : '#000000',
        fontSize: type === 'heading' ? '24px' : type === 'text' ? '16px' : '14px',
        fontWeight: type === 'heading' ? 'bold' : 'normal',
        borderRadius: type === 'button' ? '8px' : '0px',
        textAlign: 'left',
        width: type === 'image' ? '300px' : 'auto',
        height: type === 'image' ? '200px' : 'auto'
      }
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedElement(newElement.id);
    updateHistory(newElements);
  }, [elements]);

  const updateElement = useCallback((id: string, updates: Partial<ElementData>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
    updateHistory(newElements);
  }, [elements]);

  const deleteElement = useCallback((id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    updateHistory(newElements);
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  }, [elements, selectedElement]);

  const updateHistory = useCallback((newElements: ElementData[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  }, [historyIndex, history]);

  const exportDesign = () => {
    const design = {
      elements,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(design, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedElementData = selectedElement ? 
    elements.find(el => el.id === selectedElement) : null;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Barre d'outils principale */}
      <div className="border-b bg-card p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Éditeur WYSIWYG</h1>
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={previewMode ? "default" : "ghost"}
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-1" />
            {previewMode ? 'Éditer' : 'Aperçu'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={exportDesign}
          >
            <Save className="h-4 w-4 mr-1" />
            Exporter
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Barre latérale des composants */}
        {!previewMode && (
          <div className="w-64 border-r bg-card">
            <Tabs defaultValue="components" className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="components">
                  <Layout className="h-4 w-4 mr-1" />
                  Composants
                </TabsTrigger>
                <TabsTrigger value="styles">
                  <Palette className="h-4 w-4 mr-1" />
                  Styles
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="components" className="p-4">
                <ComponentToolbar onAddElement={addElement} />
              </TabsContent>
              
              <TabsContent value="styles" className="p-4">
                <PropertiesPanel
                  selectedElement={selectedElementData}
                  onUpdateElement={updateElement}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Zone de conception principale */}
        <div className="flex-1 flex flex-col">
          <div 
            className={`flex-1 overflow-auto ${previewMode ? 'bg-background' : 'bg-muted/30'}`}
            onClick={() => !previewMode && setSelectedElement(null)}
          >
            <div className={`min-h-full ${previewMode ? 'p-4' : 'p-8'}`}>
              {elements.length === 0 ? (
                !previewMode && (
                  <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <div className="text-lg font-medium mb-2">Zone de conception vide</div>
                      <div className="text-sm">
                        Cliquez sur les composants dans la barre latérale pour commencer
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-2">
                  {elements.map((element) => (
                    <EditableElement
                      key={element.id}
                      element={element}
                      isSelected={selectedElement === element.id}
                      onSelect={() => setSelectedElement(element.id)}
                      onUpdate={(updates) => updateElement(element.id, updates)}
                      onDelete={() => deleteElement(element.id)}
                      previewMode={previewMode}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panneau de propriétés à droite */}
        {!previewMode && (
          <div className="w-80 border-l bg-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-4 w-4" />
              <h3 className="font-semibold">Propriétés</h3>
            </div>
            <PropertiesPanel
              selectedElement={selectedElementData}
              onUpdateElement={updateElement}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default WysiwygEditor;