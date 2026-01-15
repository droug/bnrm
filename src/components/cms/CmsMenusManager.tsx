import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Edit, Trash2, Menu, GripVertical, Loader2, ExternalLink, ChevronRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface MenuItem {
  id: string;
  label_fr: string;
  label_ar?: string;
  url: string;
  target?: string;
  order: number;
  children?: MenuItem[];
}

interface CmsMenu {
  id: string;
  menu_code: string;
  menu_name: string;
  items: MenuItem[] | null;
  is_active: boolean;
  created_at: string | null;
}

export default function CmsMenusManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<CmsMenu | null>(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [currentMenuId, setCurrentMenuId] = useState<string | null>(null);
  
  const [menuFormData, setMenuFormData] = useState({
    menu_code: "",
    menu_name: "",
    is_active: true
  });
  
  const [itemFormData, setItemFormData] = useState({
    label_fr: "",
    label_ar: "",
    url: "",
    target: "_self"
  });

  const { data: menus = [], isLoading } = useQuery({
    queryKey: ['cms-menus'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_menus')
        .select('*')
        .order('menu_name');
      if (error) throw error;
      return (data || []).map(menu => ({
        ...menu,
        items: (Array.isArray(menu.items) ? menu.items : null) as unknown as MenuItem[] | null
      })) as CmsMenu[];
    }
  });

  const saveMenuMutation = useMutation({
    mutationFn: async (data: typeof menuFormData & { id?: string }) => {
      const payload = {
        menu_code: data.menu_code,
        menu_name: data.menu_name,
        is_active: data.is_active
      };

      if (data.id) {
        const { error } = await supabase
          .from('cms_menus')
          .update(payload)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cms_menus')
          .insert({ ...payload, items: [] });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-menus'] });
      toast({ title: editingMenu ? "Menu mis à jour" : "Menu créé" });
      resetMenuForm();
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const deleteMenuMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cms_menus')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-menus'] });
      toast({ title: "Menu supprimé" });
    }
  });

  const updateMenuItemsMutation = useMutation({
    mutationFn: async ({ menuId, items }: { menuId: string, items: MenuItem[] }) => {
      const { error } = await supabase
        .from('cms_menus')
        .update({ items: items as unknown as any })
        .eq('id', menuId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-menus'] });
      toast({ title: "Éléments du menu mis à jour" });
    }
  });

  const toggleMenuActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string, is_active: boolean }) => {
      const { error } = await supabase
        .from('cms_menus')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-menus'] });
    }
  });

  const resetMenuForm = () => {
    setMenuFormData({ menu_code: "", menu_name: "", is_active: true });
    setEditingMenu(null);
    setIsDialogOpen(false);
  };

  const resetItemForm = () => {
    setItemFormData({ label_fr: "", label_ar: "", url: "", target: "_self" });
    setEditingItem(null);
    setIsItemDialogOpen(false);
  };

  const handleEditMenu = (menu: CmsMenu) => {
    setEditingMenu(menu);
    setMenuFormData({
      menu_code: menu.menu_code,
      menu_name: menu.menu_name,
      is_active: menu.is_active
    });
    setIsDialogOpen(true);
  };

  const handleAddItem = (menuId: string) => {
    setCurrentMenuId(menuId);
    setEditingItem(null);
    setItemFormData({ label_fr: "", label_ar: "", url: "", target: "_self" });
    setIsItemDialogOpen(true);
  };

  const handleEditItem = (menuId: string, item: MenuItem) => {
    setCurrentMenuId(menuId);
    setEditingItem(item);
    setItemFormData({
      label_fr: item.label_fr,
      label_ar: item.label_ar || "",
      url: item.url,
      target: item.target || "_self"
    });
    setIsItemDialogOpen(true);
  };

  const handleSaveItem = () => {
    if (!currentMenuId) return;
    
    const menu = menus.find(m => m.id === currentMenuId);
    if (!menu) return;
    
    const currentItems: MenuItem[] = (menu.items as MenuItem[]) || [];
    
    if (editingItem) {
      // Update existing item
      const updatedItems = currentItems.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...itemFormData }
          : item
      );
      updateMenuItemsMutation.mutate({ menuId: currentMenuId, items: updatedItems });
    } else {
      // Add new item
      const newItem: MenuItem = {
        id: crypto.randomUUID(),
        ...itemFormData,
        order: currentItems.length
      };
      updateMenuItemsMutation.mutate({ menuId: currentMenuId, items: [...currentItems, newItem] });
    }
    
    resetItemForm();
  };

  const handleDeleteItem = (menuId: string, itemId: string) => {
    const menu = menus.find(m => m.id === menuId);
    if (!menu) return;
    
    const currentItems: MenuItem[] = (menu.items as MenuItem[]) || [];
    const updatedItems = currentItems.filter(item => item.id !== itemId);
    updateMenuItemsMutation.mutate({ menuId, items: updatedItems });
  };

  const handleMoveItem = (menuId: string, itemId: string, direction: 'up' | 'down') => {
    const menu = menus.find(m => m.id === menuId);
    if (!menu) return;
    
    const currentItems: MenuItem[] = [...((menu.items as MenuItem[]) || [])];
    const index = currentItems.findIndex(item => item.id === itemId);
    
    if (direction === 'up' && index > 0) {
      [currentItems[index], currentItems[index - 1]] = [currentItems[index - 1], currentItems[index]];
    } else if (direction === 'down' && index < currentItems.length - 1) {
      [currentItems[index], currentItems[index + 1]] = [currentItems[index + 1], currentItems[index]];
    }
    
    // Update order numbers
    currentItems.forEach((item, i) => { item.order = i; });
    
    updateMenuItemsMutation.mutate({ menuId, items: currentItems });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Menu className="h-5 w-5" />
            Gestion des Menus
          </CardTitle>
          <CardDescription>
            Configurez la navigation et les menus bilingues
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetMenuForm(); else setIsDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau menu
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMenu ? "Modifier le menu" : "Nouveau menu"}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={(e) => { e.preventDefault(); saveMenuMutation.mutate({ ...menuFormData, id: editingMenu?.id }); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Code du menu *</Label>
                <Input
                  value={menuFormData.menu_code}
                  onChange={(e) => setMenuFormData(prev => ({ ...prev, menu_code: e.target.value }))}
                  placeholder="header-main, footer-links..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Nom du menu *</Label>
                <Input
                  value={menuFormData.menu_name}
                  onChange={(e) => setMenuFormData(prev => ({ ...prev, menu_name: e.target.value }))}
                  placeholder="Menu principal, Liens footer..."
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Actif</Label>
                <Switch
                  checked={menuFormData.is_active}
                  onCheckedChange={(checked) => setMenuFormData(prev => ({ ...prev, is_active: checked }))}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetMenuForm}>Annuler</Button>
                <Button type="submit" disabled={saveMenuMutation.isPending}>
                  {saveMenuMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : menus.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Aucun menu configuré</p>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {menus.map((menu) => (
              <AccordionItem key={menu.id} value={menu.id} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{menu.menu_name}</span>
                    <Badge variant="outline" className="font-mono text-xs">{menu.menu_code}</Badge>
                    {menu.is_active ? (
                      <Badge className="bg-green-500">Actif</Badge>
                    ) : (
                      <Badge variant="secondary">Inactif</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {((menu.items as MenuItem[]) || []).length} élément(s)
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleAddItem(menu.id)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Ajouter
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditMenu(menu)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer ce menu ?</AlertDialogTitle>
                              <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMenuMutation.mutate(menu.id)}>Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    
                    {((menu.items as MenuItem[]) || []).length > 0 && (
                      <div className="border rounded-lg divide-y">
                        {((menu.items as MenuItem[]) || []).sort((a, b) => a.order - b.order).map((item, index) => (
                          <div key={item.id} className="p-3 flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                disabled={index === 0}
                                onClick={() => handleMoveItem(menu.id, item.id, 'up')}
                              >
                                <ChevronRight className="h-3 w-3 -rotate-90" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                disabled={index === ((menu.items as MenuItem[]) || []).length - 1}
                                onClick={() => handleMoveItem(menu.id, item.id, 'down')}
                              >
                                <ChevronRight className="h-3 w-3 rotate-90" />
                              </Button>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{item.label_fr}</div>
                              {item.label_ar && <div className="text-sm text-muted-foreground" dir="rtl">{item.label_ar}</div>}
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                {item.url}
                                {item.target === "_blank" && <ExternalLink className="h-3 w-3" />}
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleEditItem(menu.id, item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(menu.id, item.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        
        {/* Item Dialog */}
        <Dialog open={isItemDialogOpen} onOpenChange={(open) => { if (!open) resetItemForm(); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Modifier l'élément" : "Nouvel élément"}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Libellé (FR) *</Label>
                <Input
                  value={itemFormData.label_fr}
                  onChange={(e) => setItemFormData(prev => ({ ...prev, label_fr: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Libellé (AR)</Label>
                <Input
                  dir="rtl"
                  value={itemFormData.label_ar}
                  onChange={(e) => setItemFormData(prev => ({ ...prev, label_ar: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>URL *</Label>
                <Input
                  value={itemFormData.url}
                  onChange={(e) => setItemFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="/page ou https://..."
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Ouvrir dans un nouvel onglet</Label>
                <Switch
                  checked={itemFormData.target === "_blank"}
                  onCheckedChange={(checked) => setItemFormData(prev => ({ ...prev, target: checked ? "_blank" : "_self" }))}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetItemForm}>Annuler</Button>
              <Button onClick={handleSaveItem}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
