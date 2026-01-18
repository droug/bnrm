import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Save, Plus, Trash2, Loader2, GripVertical, Eye, EyeOff, Link as LinkIcon, Image } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface DigitalService {
  id: string;
  title_fr: string;
  title_ar: string | null;
  description_fr: string | null;
  description_ar: string | null;
  category_fr: string | null;
  category_ar: string | null;
  image_url: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
}

function SortableServiceItem({ 
  service, 
  onUpdate, 
  onDelete 
}: { 
  service: DigitalService;
  onUpdate: (id: string, updates: Partial<DigitalService>) => void;
  onDelete: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="border rounded-lg bg-background"
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-3 p-4">
          <button
            className="cursor-grab active:cursor-grabbing p-1"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>

          {service.image_url && (
            <div className="w-16 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
              <img 
                src={service.image_url} 
                alt={service.title_fr}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{service.title_fr || "Sans titre"}</h4>
            <p className="text-sm text-muted-foreground truncate">{service.category_fr || "Sans catégorie"}</p>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={service.is_active}
              onCheckedChange={(checked) => onUpdate(service.id, { is_active: checked })}
            />
            {service.is_active ? (
              <Eye className="h-4 w-4 text-green-500" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(service.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon">
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent>
          <div className="px-4 pb-4 pt-2 border-t space-y-4">
            <Tabs defaultValue="fr" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fr">Français</TabsTrigger>
                <TabsTrigger value="ar">العربية</TabsTrigger>
              </TabsList>

              <TabsContent value="fr" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Titre</Label>
                    <Input
                      value={service.title_fr}
                      onChange={(e) => onUpdate(service.id, { title_fr: e.target.value })}
                      placeholder="Nom du service"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Input
                      value={service.category_fr || ""}
                      onChange={(e) => onUpdate(service.id, { category_fr: e.target.value })}
                      placeholder="Ex: Service Essentiel"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={service.description_fr || ""}
                    onChange={(e) => onUpdate(service.id, { description_fr: e.target.value })}
                    placeholder="Description du service..."
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="ar" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>العنوان</Label>
                    <Input
                      dir="rtl"
                      value={service.title_ar || ""}
                      onChange={(e) => onUpdate(service.id, { title_ar: e.target.value })}
                      placeholder="اسم الخدمة"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الفئة</Label>
                    <Input
                      dir="rtl"
                      value={service.category_ar || ""}
                      onChange={(e) => onUpdate(service.id, { category_ar: e.target.value })}
                      placeholder="مثال: خدمة أساسية"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>الوصف</Label>
                  <Textarea
                    dir="rtl"
                    value={service.description_ar || ""}
                    onChange={(e) => onUpdate(service.id, { description_ar: e.target.value })}
                    placeholder="وصف الخدمة..."
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  URL de l'image
                </Label>
                <Input
                  value={service.image_url || ""}
                  onChange={(e) => onUpdate(service.id, { image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Lien (URL de destination)
                </Label>
                <Input
                  value={service.link_url || ""}
                  onChange={(e) => onUpdate(service.id, { link_url: e.target.value })}
                  placeholder="/services/exemple ou https://..."
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default function CmsDigitalServicesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [services, setServices] = useState<DigitalService[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { isLoading } = useQuery({
    queryKey: ['cms-digital-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_digital_services')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      setServices(data || []);
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Delete removed services
      const { data: existingServices } = await supabase
        .from('cms_digital_services')
        .select('id');
      
      const existingIds = (existingServices || []).map(s => s.id);
      const currentIds = services.map(s => s.id);
      const toDelete = existingIds.filter(id => !currentIds.includes(id));
      
      if (toDelete.length > 0) {
        await supabase
          .from('cms_digital_services')
          .delete()
          .in('id', toDelete);
      }

      // Upsert all current services
      for (let i = 0; i < services.length; i++) {
        const service = services[i];
        const { error } = await supabase
          .from('cms_digital_services')
          .upsert({
            ...service,
            sort_order: i,
            updated_at: new Date().toISOString()
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-digital-services'] });
      toast({ title: "Services sauvegardés avec succès" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setServices((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addService = () => {
    const newService: DigitalService = {
      id: crypto.randomUUID(),
      title_fr: "Nouveau service",
      title_ar: null,
      description_fr: null,
      description_ar: null,
      category_fr: "Service",
      category_ar: null,
      image_url: null,
      link_url: null,
      sort_order: services.length,
      is_active: true
    };
    setServices([...services, newService]);
  };

  const updateService = (id: string, updates: Partial<DigitalService>) => {
    setServices(services.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gestion des Services Numériques
          </CardTitle>
          <CardDescription>
            Gérez les services affichés dans le carousel "Nos Services Numériques"
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addService}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un service
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Sauvegarder
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {services.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun service configuré.</p>
            <p className="text-sm">Cliquez sur "Ajouter un service" pour commencer.</p>
            <p className="text-sm mt-2">Les services par défaut du code seront affichés.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={services.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {services.map((service) => (
                  <SortableServiceItem
                    key={service.id}
                    service={service}
                    onUpdate={updateService}
                    onDelete={deleteService}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Si aucun service n'est configuré ici, les services par défaut définis dans le code seront affichés. 
            Ajoutez des services ici pour les personnaliser.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}