import React, { useState, useCallback } from 'react';
import { DndContext, closestCenter, DragEndEvent, DragOverEvent, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
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
  Settings
} from 'lucide-react';
import { ComponentToolbar } from './ComponentToolbar';
import { DesignCanvas } from './DesignCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { useLanguage } from '@/hooks/useLanguage';

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
  children?: ElementData[];
}

const WysiwygEditor = () => {
  const [elements, setElements] = useState<ElementData[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [history, setHistory] = useState<ElementData[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const { t } = useLanguage();

  const addElement = useCallback((type: ElementData['type']) => {
    const newElement: ElementData = {
      id: `element-${Date.now()}`,
      type,
      content: type === 'text' ? 'Nouveau texte' : 
               type === 'heading' ? 'Nouveau titre' :
               type === 'button' ? 'Bouton' :
               type === 'image' ? 'https://via.placeholder.com/300x200' : '',
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    // Si on fait glisser un composant depuis la toolbar
    if (active.id.toString().startsWith('toolbar-')) {
      const componentType = active.id.toString().replace('toolbar-', '') as ElementData['type'];
      addElement(componentType);
      return;
    }

    // Si on réorganise les éléments existants
    if (active.id !== over.id) {
      const oldIndex = elements.findIndex(el => el.id === active.id);
      const newIndex = elements.findIndex(el => el.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newElements = arrayMove(elements, oldIndex, newIndex);
        setElements(newElements);
        updateHistory(newElements);
      }
    }
  };

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
            variant="ghost"
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
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={elements.map(el => el.id)} strategy={verticalListSortingStrategy}>
              <DesignCanvas
                elements={elements}
                selectedElement={selectedElement}
                onSelectElement={setSelectedElement}
                onUpdateElement={updateElement}
                onDeleteElement={deleteElement}
                previewMode={previewMode}
              />
            </SortableContext>
          </DndContext>
        </div>

        {/* Panneau de propriétés à droite */}
        {!previewMode && selectedElementData && (
          <div className="w-80 border-l bg-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-4 w-4" />
              <h3 className="font-semibold">Propriétés de l'élément</h3>
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