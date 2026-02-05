import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Menu, Loader2, ExternalLink, ChevronRight, FolderTree, Link as LinkIcon, Info, ChevronDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface MenuSubItem {
  id: string;
  label_fr: string;
  label_ar?: string;
  url: string;
  target?: string;
  order: number;
  description_fr?: string;
  description_ar?: string;
}

interface MenuCategory {
  id: string;
  label_fr: string;
  label_ar?: string;
  order: number;
  isCategory?: boolean;
  children?: MenuSubItem[];
}

type MenuItem = MenuCategory | MenuSubItem;

interface CmsMenu {
  id: string;
  menu_code: string;
  menu_name: string;
  items: MenuItem[] | null;
  is_active: boolean;
  created_at: string | null;
}

// Check if item is a category (has children)
function isCategory(item: MenuItem): item is MenuCategory {
  return 'isCategory' in item && item.isCategory === true;
}

// Helper to identify menu type based on menu_code
function getMenuType(menuCode: string): 'header' | 'footer' | 'other' {
  if (menuCode.startsWith('header-')) return 'header';
  if (menuCode.startsWith('footer-')) return 'footer';
  return 'other';
}

export default function CmsMenusManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<CmsMenu | null>(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuSubItem | null>(null);
  const [currentMenuId, setCurrentMenuId] = useState<string | null>(null);
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const [menuFormData, setMenuFormData] = useState({
    menu_code: "",
    menu_name: "",
    is_active: true
  });
  
  const [itemFormData, setItemFormData] = useState({
    label_fr: "",
    label_ar: "",
    url: "",
    target: "_self",
    description_fr: "",
    description_ar: ""
  });
  
  const [categoryFormData, setCategoryFormData] = useState({
    label_fr: "",
    label_ar: ""
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

  // Group menus by type
  const headerMenus = menus.filter(m => getMenuType(m.menu_code) === 'header');
  const footerMenus = menus.filter(m => getMenuType(m.menu_code) === 'footer');
  const otherMenus = menus.filter(m => getMenuType(m.menu_code) === 'other');

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
      toast({ title: "Menu mis à jour" });
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
    setItemFormData({ label_fr: "", label_ar: "", url: "", target: "_self", description_fr: "", description_ar: "" });
    setEditingItem(null);
    setIsItemDialogOpen(false);
    setCurrentCategoryId(null);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({ label_fr: "", label_ar: "" });
    setEditingCategory(null);
    setIsCategoryDialogOpen(false);
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

  // Category management
  const handleAddCategory = (menuId: string) => {
    setCurrentMenuId(menuId);
    setEditingCategory(null);
    setCategoryFormData({ label_fr: "", label_ar: "" });
    setIsCategoryDialogOpen(true);
  };

  const handleEditCategory = (menuId: string, category: MenuCategory) => {
    setCurrentMenuId(menuId);
    setEditingCategory(category);
    setCategoryFormData({
      label_fr: category.label_fr,
      label_ar: category.label_ar || ""
    });
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = () => {
    if (!currentMenuId) return;
    
    const menu = menus.find(m => m.id === currentMenuId);
    if (!menu) return;
    
    const currentItems: MenuItem[] = (menu.items as MenuItem[]) || [];
    
    if (editingCategory) {
      // Update existing category
      const updatedItems = currentItems.map(item => 
        item.id === editingCategory.id 
          ? { ...item, label_fr: categoryFormData.label_fr, label_ar: categoryFormData.label_ar }
          : item
      );
      updateMenuItemsMutation.mutate({ menuId: currentMenuId, items: updatedItems });
    } else {
      // Add new category
      const newCategory: MenuCategory = {
        id: crypto.randomUUID(),
        label_fr: categoryFormData.label_fr,
        label_ar: categoryFormData.label_ar,
        order: currentItems.length,
        isCategory: true,
        children: []
      };
      updateMenuItemsMutation.mutate({ menuId: currentMenuId, items: [...currentItems, newCategory] });
    }
    
    resetCategoryForm();
  };

  const handleDeleteCategory = (menuId: string, categoryId: string) => {
    const menu = menus.find(m => m.id === menuId);
    if (!menu) return;
    
    const currentItems: MenuItem[] = (menu.items as MenuItem[]) || [];
    const updatedItems = currentItems.filter(item => item.id !== categoryId);
    updateMenuItemsMutation.mutate({ menuId, items: updatedItems });
  };

  // Item management (for items inside categories or flat items)
  const handleAddItem = (menuId: string, categoryId?: string) => {
    setCurrentMenuId(menuId);
    setCurrentCategoryId(categoryId || null);
    setEditingItem(null);
    setItemFormData({ label_fr: "", label_ar: "", url: "", target: "_self", description_fr: "", description_ar: "" });
    setIsItemDialogOpen(true);
  };

  const handleEditItem = (menuId: string, item: MenuSubItem, categoryId?: string) => {
    setCurrentMenuId(menuId);
    setCurrentCategoryId(categoryId || null);
    setEditingItem(item);
    setItemFormData({
      label_fr: item.label_fr,
      label_ar: item.label_ar || "",
      url: item.url,
      target: item.target || "_self",
      description_fr: item.description_fr || "",
      description_ar: item.description_ar || ""
    });
    setIsItemDialogOpen(true);
  };

  const handleSaveItem = () => {
    if (!currentMenuId) return;
    
    const menu = menus.find(m => m.id === currentMenuId);
    if (!menu) return;
    
    const currentItems: MenuItem[] = [...((menu.items as MenuItem[]) || [])];
    
    if (currentCategoryId) {
      // Adding/editing item inside a category
      const categoryIndex = currentItems.findIndex(item => item.id === currentCategoryId);
      if (categoryIndex !== -1 && isCategory(currentItems[categoryIndex])) {
        const category = currentItems[categoryIndex] as MenuCategory;
        const children = [...(category.children || [])];
        
        if (editingItem) {
          // Update existing item
          const itemIndex = children.findIndex(c => c.id === editingItem.id);
          if (itemIndex !== -1) {
            children[itemIndex] = { ...children[itemIndex], ...itemFormData };
          }
        } else {
          // Add new item
          const newItem: MenuSubItem = {
            id: crypto.randomUUID(),
            ...itemFormData,
            order: children.length
          };
          children.push(newItem);
        }
        
        currentItems[categoryIndex] = { ...category, children };
      }
    } else {
      // Flat item (not in a category)
      if (editingItem) {
        const itemIndex = currentItems.findIndex(item => item.id === editingItem.id);
        if (itemIndex !== -1) {
          currentItems[itemIndex] = { ...currentItems[itemIndex], ...itemFormData } as MenuItem;
        }
      } else {
        const newItem: MenuSubItem = {
          id: crypto.randomUUID(),
          ...itemFormData,
          order: currentItems.length
        };
        currentItems.push(newItem);
      }
    }
    
    updateMenuItemsMutation.mutate({ menuId: currentMenuId, items: currentItems });
    resetItemForm();
  };

  const handleDeleteItem = (menuId: string, itemId: string, categoryId?: string) => {
    const menu = menus.find(m => m.id === menuId);
    if (!menu) return;
    
    const currentItems: MenuItem[] = [...((menu.items as MenuItem[]) || [])];
    
    if (categoryId) {
      // Delete item from category
      const categoryIndex = currentItems.findIndex(item => item.id === categoryId);
      if (categoryIndex !== -1 && isCategory(currentItems[categoryIndex])) {
        const category = currentItems[categoryIndex] as MenuCategory;
        const children = (category.children || []).filter(c => c.id !== itemId);
        currentItems[categoryIndex] = { ...category, children };
      }
    } else {
      // Delete flat item
      const filteredItems = currentItems.filter(item => item.id !== itemId);
      updateMenuItemsMutation.mutate({ menuId, items: filteredItems });
      return;
    }
    
    updateMenuItemsMutation.mutate({ menuId, items: currentItems });
  };

  const toggleCategoryExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const countTotalItems = (items: MenuItem[] | null): number => {
    if (!items) return 0;
    return items.reduce((acc, item) => {
      if (isCategory(item)) {
        return acc + 1 + (item.children?.length || 0);
      }
      return acc + 1;
    }, 0);
  };

  const renderMenuItems = (menu: CmsMenu) => {
    const items = (menu.items as MenuItem[]) || [];
    const hasCategories = items.some(isCategory);

    return (
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Aucun élément dans ce menu
          </div>
        ) : (
          items.sort((a, b) => a.order - b.order).map((item) => {
            if (isCategory(item)) {
              const category = item as MenuCategory;
              const isExpanded = expandedCategories.has(category.id);
              
              return (
                <div key={category.id} className="border rounded-lg overflow-hidden bg-muted/30">
                  <div 
                    className="p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleCategoryExpand(category.id)}
                  >
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform text-muted-foreground",
                      isExpanded && "rotate-180"
                    )} />
                    <FolderTree className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{category.label_fr}</div>
                      {category.label_ar && (
                        <div className="text-xs text-muted-foreground" dir="rtl">{category.label_ar}</div>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.children?.length || 0} liens
                    </Badge>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleAddItem(menu.id, category.id)}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditCategory(menu.id, category)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteCategory(menu.id, category.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  {isExpanded && category.children && category.children.length > 0 && (
                    <div className="border-t bg-background">
                      {category.children.sort((a, b) => a.order - b.order).map((child) => (
                        <div key={child.id} className="p-3 pl-10 flex items-center gap-3 border-b last:border-b-0 hover:bg-muted/30">
                          <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{child.label_fr}</div>
                            {child.label_ar && <div className="text-xs text-muted-foreground truncate" dir="rtl">{child.label_ar}</div>}
                            <div className="text-xs text-blue-600 truncate flex items-center gap-1">
                              {child.url}
                              {child.target === "_blank" && <ExternalLink className="h-3 w-3" />}
                            </div>
                            {child.description_fr && (
                              <div className="text-xs text-muted-foreground truncate mt-0.5">{child.description_fr}</div>
                            )}
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditItem(menu.id, child, category.id)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteItem(menu.id, child.id, category.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else {
              // Flat item (not in a category)
              const flatItem = item as MenuSubItem;
              return (
                <div key={flatItem.id} className="p-3 flex items-center gap-3 border rounded-lg hover:bg-muted/30">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{flatItem.label_fr}</div>
                    {flatItem.label_ar && <div className="text-xs text-muted-foreground" dir="rtl">{flatItem.label_ar}</div>}
                    <div className="text-xs text-blue-600 flex items-center gap-1">
                      {flatItem.url}
                      {flatItem.target === "_blank" && <ExternalLink className="h-3 w-3" />}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditItem(menu.id, flatItem)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteItem(menu.id, flatItem.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            }
          })
        )}
      </div>
    );
  };

  const renderMenuAccordion = (menusList: CmsMenu[], title: string, description: string, icon: React.ReactNode) => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {menusList.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Aucun menu dans cette catégorie</p>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {menusList.map((menu) => (
              <AccordionItem key={menu.id} value={menu.id} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3 w-full">
                    <span className="font-medium">{menu.menu_name}</span>
                    <Badge variant="outline" className="font-mono text-xs">{menu.menu_code}</Badge>
                    {menu.is_active ? (
                      <Badge className="bg-green-500 text-xs">Actif</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Inactif</Badge>
                    )}
                    <Badge variant="outline" className="ml-auto text-xs">
                      {countTotalItems(menu.items)} éléments
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center gap-2 flex-wrap">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleAddCategory(menu.id)}>
                          <FolderTree className="h-4 w-4 mr-1" />
                          Ajouter catégorie
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleAddItem(menu.id)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Ajouter lien
                        </Button>
                      </div>
                      <div className="flex gap-2">
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
                    
                    {renderMenuItems(menu)}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card className="border-none bg-gradient-to-br from-cyan-500/10 via-blue-400/5 to-background">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Menu className="h-5 w-5 text-cyan-600" />
              Gestion des Menus du Portail
            </CardTitle>
            <CardDescription className="mt-1">
              Configurez la navigation du portail BNRM avec support des sous-catégories et descriptions bilingues
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
                    placeholder="header-discover, footer-links..."
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Préfixe avec "header-" pour menus d'en-tête ou "footer-" pour le pied de page
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Nom du menu *</Label>
                  <Input
                    value={menuFormData.menu_name}
                    onChange={(e) => setMenuFormData(prev => ({ ...prev, menu_name: e.target.value }))}
                    placeholder="Menu Découvrir, Footer - Liens..."
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
      </Card>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* Header Menus */}
          {renderMenuAccordion(
            headerMenus,
            "Menus d'en-tête (Header)",
            "Navigation principale du portail - Découvrir, Services, Actualités, Mécénat",
            <Menu className="h-5 w-5 text-blue-500" />
          )}

          {/* Footer Menus */}
          {renderMenuAccordion(
            footerMenus,
            "Menus du Footer",
            "Liens du pied de page - Aide, Liens rapides, Mentions légales, Paiements",
            <ChevronRight className="h-5 w-5 text-slate-500" />
          )}

          {/* Other Menus */}
          {otherMenus.length > 0 && renderMenuAccordion(
            otherMenus,
            "Autres menus",
            "Menus personnalisés",
            <FolderTree className="h-5 w-5 text-purple-500" />
          )}
        </>
      )}
      
      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={(open) => { if (!open) resetCategoryForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              {editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Libellé (FR) *</Label>
              <Input
                value={categoryFormData.label_fr}
                onChange={(e) => setCategoryFormData(prev => ({ ...prev, label_fr: e.target.value }))}
                placeholder="Informations pratiques"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Libellé (AR)</Label>
              <Input
                dir="rtl"
                value={categoryFormData.label_ar}
                onChange={(e) => setCategoryFormData(prev => ({ ...prev, label_ar: e.target.value }))}
                placeholder="معلومات عملية"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetCategoryForm}>Annuler</Button>
            <Button onClick={handleSaveCategory} disabled={!categoryFormData.label_fr}>
              {editingCategory ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={(open) => { if (!open) resetItemForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              {editingItem ? "Modifier le lien" : "Nouveau lien"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Libellé (FR) *</Label>
                <Input
                  value={itemFormData.label_fr}
                  onChange={(e) => setItemFormData(prev => ({ ...prev, label_fr: e.target.value }))}
                  placeholder="Horaires et accès"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Libellé (AR)</Label>
                <Input
                  dir="rtl"
                  value={itemFormData.label_ar}
                  onChange={(e) => setItemFormData(prev => ({ ...prev, label_ar: e.target.value }))}
                  placeholder="المواعيد والوصول"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>URL *</Label>
              <Input
                value={itemFormData.url}
                onChange={(e) => setItemFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="/practical-info ou https://..."
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Description (FR)</Label>
                <Textarea
                  value={itemFormData.description_fr}
                  onChange={(e) => setItemFormData(prev => ({ ...prev, description_fr: e.target.value }))}
                  placeholder="Description courte du lien"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (AR)</Label>
                <Textarea
                  dir="rtl"
                  value={itemFormData.description_ar}
                  onChange={(e) => setItemFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                  placeholder="وصف مختصر للرابط"
                  rows={2}
                />
              </div>
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
            <Button onClick={handleSaveItem} disabled={!itemFormData.label_fr || !itemFormData.url}>
              {editingItem ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
