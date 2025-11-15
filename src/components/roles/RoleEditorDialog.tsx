import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Shield, Info } from "lucide-react";

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  is_system?: boolean;
}

interface RoleEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  onSave: (role: Partial<Role>) => void;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface PermissionCategory {
  id: string;
  name: string;
  icon: string;
  permissions: Permission[];
}

export function RoleEditorDialog({ open, onOpenChange, role, onSave }: RoleEditorDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("bg-gray-500");
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  const colors = [
    { value: "bg-red-500", label: "Rouge" },
    { value: "bg-blue-500", label: "Bleu" },
    { value: "bg-green-500", label: "Vert" },
    { value: "bg-yellow-500", label: "Jaune" },
    { value: "bg-purple-500", label: "Violet" },
    { value: "bg-pink-500", label: "Rose" },
    { value: "bg-indigo-500", label: "Indigo" },
    { value: "bg-gray-500", label: "Gris" },
  ];

  const permissionCategories: PermissionCategory[] = [
    {
      id: "users",
      name: "Gestion des Utilisateurs",
      icon: "👥",
      permissions: [
        { id: "users.view", name: "Consulter", description: "Voir les utilisateurs", enabled: false },
        { id: "users.create", name: "Créer", description: "Créer des utilisateurs", enabled: false },
        { id: "users.edit", name: "Modifier", description: "Modifier les utilisateurs", enabled: false },
        { id: "users.delete", name: "Supprimer", description: "Supprimer des utilisateurs", enabled: false },
        { id: "users.manage_roles", name: "Gérer les rôles", description: "Attribuer des rôles", enabled: false },
      ],
    },
    {
      id: "content",
      name: "Gestion de Contenu",
      icon: "📝",
      permissions: [
        { id: "content.view", name: "Consulter", description: "Voir le contenu", enabled: false },
        { id: "content.create", name: "Créer", description: "Créer du contenu", enabled: false },
        { id: "content.edit", name: "Modifier", description: "Modifier le contenu", enabled: false },
        { id: "content.delete", name: "Supprimer", description: "Supprimer le contenu", enabled: false },
        { id: "content.publish", name: "Publier", description: "Publier le contenu", enabled: false },
        { id: "content.archive", name: "Archiver", description: "Archiver le contenu", enabled: false },
      ],
    },
    {
      id: "library",
      name: "Bibliothèque Numérique",
      icon: "📚",
      permissions: [
        { id: "library.view", name: "Consulter", description: "Voir les documents", enabled: false },
        { id: "library.upload", name: "Téléverser", description: "Ajouter des documents", enabled: false },
        { id: "library.edit", name: "Modifier", description: "Modifier les métadonnées", enabled: false },
        { id: "library.delete", name: "Supprimer", description: "Supprimer des documents", enabled: false },
        { id: "library.download", name: "Télécharger", description: "Télécharger les fichiers", enabled: false },
      ],
    },
    {
      id: "manuscripts",
      name: "Plateforme Manuscrits",
      icon: "📜",
      permissions: [
        { id: "manuscripts.view", name: "Consulter", description: "Voir les manuscrits", enabled: false },
        { id: "manuscripts.create", name: "Créer", description: "Créer des fiches", enabled: false },
        { id: "manuscripts.edit", name: "Modifier", description: "Modifier les fiches", enabled: false },
        { id: "manuscripts.approve_requests", name: "Approuver demandes", description: "Valider les demandes d'accès", enabled: false },
      ],
    },
    {
      id: "cbm",
      name: "Plateforme CBM",
      icon: "🏛️",
      permissions: [
        { id: "cbm.view", name: "Consulter", description: "Voir le réseau", enabled: false },
        { id: "cbm.manage_members", name: "Gérer membres", description: "Gérer les membres", enabled: false },
        { id: "cbm.catalog", name: "Catalogue", description: "Gérer le catalogue", enabled: false },
      ],
    },
    {
      id: "cultural",
      name: "Activités Culturelles",
      icon: "🎭",
      permissions: [
        { id: "cultural.view", name: "Consulter", description: "Voir les événements", enabled: false },
        { id: "cultural.create", name: "Créer", description: "Créer des événements", enabled: false },
        { id: "cultural.manage_bookings", name: "Gérer réservations", description: "Valider les réservations", enabled: false },
      ],
    },
    {
      id: "system",
      name: "Administration Système",
      icon: "⚙️",
      permissions: [
        { id: "system.settings", name: "Paramètres", description: "Modifier les paramètres", enabled: false },
        { id: "system.analytics", name: "Statistiques", description: "Voir les statistiques", enabled: false },
        { id: "system.logs", name: "Logs", description: "Consulter les logs", enabled: false },
      ],
    },
  ];

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description);
      setColor(role.color);
      // Charger les permissions du rôle
    } else {
      setName("");
      setDescription("");
      setColor("bg-gray-500");
      setPermissions({});
    }
  }, [role, open]);

  const handleSave = () => {
    onSave({
      name,
      description,
      color,
    });
  };

  const togglePermission = (permissionId: string) => {
    setPermissions(prev => ({
      ...prev,
      [permissionId]: !prev[permissionId]
    }));
  };

  const toggleCategory = (category: PermissionCategory, enabled: boolean) => {
    const updates: Record<string, boolean> = {};
    category.permissions.forEach(perm => {
      updates[perm.id] = enabled;
    });
    setPermissions(prev => ({
      ...prev,
      ...updates
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {role ? `Modifier le rôle: ${role.name}` : "Créer un nouveau rôle"}
          </DialogTitle>
          <DialogDescription>
            {role 
              ? "Modifiez les informations et les permissions du rôle"
              : "Définissez les informations et les permissions du nouveau rôle"
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom du rôle *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Gestionnaire de contenu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez les responsabilités de ce rôle..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label>Couleur du badge</Label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setColor(c.value)}
                      className={`w-12 h-12 rounded-md ${c.value} transition-transform hover:scale-110 ${
                        color === c.value ? "ring-2 ring-offset-2 ring-primary" : ""
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Aperçu du badge:</p>
                    <Badge className={`${color} text-white`}>
                      {name || "Nom du rôle"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="text-sm">
                    <span className="font-medium">
                      {Object.values(permissions).filter(Boolean).length}
                    </span>
                    {" "}permissions sélectionnées
                  </div>
                </div>

                <Accordion type="multiple" className="w-full">
                  {permissionCategories.map((category) => (
                    <AccordionItem key={category.id} value={category.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{category.icon}</span>
                            <span className="font-semibold">{category.name}</span>
                          </div>
                          <Badge variant="secondary">
                            {category.permissions.filter(p => permissions[p.id]).length}/{category.permissions.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between px-4 py-2 bg-muted/50 rounded">
                            <span className="text-sm font-medium">Tout sélectionner</span>
                            <Switch
                              checked={category.permissions.every(p => permissions[p.id])}
                              onCheckedChange={(checked) => toggleCategory(category, checked)}
                            />
                          </div>
                          <Separator />
                          {category.permissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 rounded transition-colors"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-sm">{permission.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {permission.description}
                                </div>
                              </div>
                              <Switch
                                checked={permissions[permission.id] || false}
                                onCheckedChange={() => togglePermission(permission.id)}
                              />
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {role ? "Enregistrer" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
