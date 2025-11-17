import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GripVertical, Trash2, Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface CmsSectionItemProps {
  section: any;
  index: number;
  onUpdate: (section: any) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const sectionTypeLabels: Record<string, string> = {
  hero: '🦸 Hero',
  richtext: '📝 Texte Riche',
  grid: '📊 Grille',
  cardList: '🃏 Liste de Cartes',
  banner: '🎯 Bannière',
  faq: '❓ FAQ',
  eventList: '📅 Liste d\'Événements',
  image: '🖼️ Image',
  video: '🎥 Vidéo',
  callout: '💡 Encadré',
  statBlocks: '📈 Blocs de Stats'
};

export default function CmsSectionItem({ section, index, onUpdate, onDelete, onDuplicate }: CmsSectionItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id || section.tempId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const toggleVisibility = () => {
    onUpdate({ ...section, is_visible: !section.is_visible });
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className={!section.is_visible ? 'opacity-50' : ''}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="cursor-grab active:cursor-grabbing"
                {...listeners}
              >
                <GripVertical className="h-4 w-4" />
              </Button>
              <CollapsibleTrigger asChild>
                <Button type="button" variant="ghost" className="font-semibold">
                  <Badge variant="outline" className="mr-2">#{index + 1}</Badge>
                  {sectionTypeLabels[section.section_type] || section.section_type}
                </Button>
              </CollapsibleTrigger>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleVisibility}
              >
                {section.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDuplicate}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="space-y-4">
              <Tabs defaultValue="fr">
                <TabsList>
                  <TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
                  <TabsTrigger value="ar">🇲🇦 العربية</TabsTrigger>
                </TabsList>

                <TabsContent value="fr" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Titre (FR)</Label>
                    <Input
                      value={section.title_fr || ''}
                      onChange={(e) => onUpdate({ ...section, title_fr: e.target.value })}
                      placeholder="Titre de la section"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contenu (FR)</Label>
                    <Textarea
                      value={section.content_fr || ''}
                      onChange={(e) => onUpdate({ ...section, content_fr: e.target.value })}
                      placeholder="Contenu de la section"
                      rows={5}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="ar" className="space-y-4">
                  <div className="space-y-2">
                    <Label>العنوان (AR)</Label>
                    <Input
                      value={section.title_ar || ''}
                      onChange={(e) => onUpdate({ ...section, title_ar: e.target.value })}
                      placeholder="عنوان القسم"
                      dir="rtl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>المحتوى (AR)</Label>
                    <Textarea
                      value={section.content_ar || ''}
                      onChange={(e) => onUpdate({ ...section, content_ar: e.target.value })}
                      placeholder="محتوى القسم"
                      rows={5}
                      dir="rtl"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Props spécifiques selon le type */}
              <div className="space-y-2">
                <Label>Configuration JSON (props)</Label>
                <Textarea
                  value={JSON.stringify(section.props || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const props = JSON.parse(e.target.value);
                      onUpdate({ ...section, props });
                    } catch (error) {
                      // Invalid JSON, ignore
                    }
                  }}
                  placeholder='{"key": "value"}'
                  rows={4}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Propriétés spécifiques pour ce type de section (JSON)
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}
