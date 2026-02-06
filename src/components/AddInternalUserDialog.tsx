import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UserPlus, User, Mail, Building, BookOpen, Check, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSystemRoles } from "@/hooks/useSystemRoles";
import { cn } from "@/lib/utils";

interface AddInternalUserDialogProps {
  onUserAdded: () => void;
}

export default function AddInternalUserDialog({ onUserAdded }: AddInternalUserDialogProps) {
  const { toast } = useToast();
  const { availableRoles, loading: rolesLoading } = useSystemRoles();
  const [open, setOpen] = useState(false);
  const [rolePopoverOpen, setRolePopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    institution: '',
    researchField: '',
    role: '',
    notes: ''
  });

  // Grouper les rôles par catégorie
  const rolesByCategory = useMemo(() => {
    const grouped: Record<string, typeof availableRoles> = {};
    availableRoles.forEach(role => {
      const category = role.role_category || 'Autre';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(role);
    });
    return grouped;
  }, [availableRoles]);

  const selectedRoleInfo = useMemo(() => {
    return availableRoles.find(r => r.role_code === selectedRole);
  }, [availableRoles, selectedRole]);

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      institution: '',
      researchField: '',
      role: '',
      notes: ''
    });
    setSelectedRole('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Créer l'utilisateur avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      });

      if (authError) {
        throw new Error(`Erreur lors de la création du compte : ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Aucun utilisateur créé');
      }

      // 2. Mettre à jour le profil avec les informations complètes
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone || null,
          institution: formData.institution || null,
          research_field: formData.researchField || null,
          is_approved: true, // Les utilisateurs internes sont automatiquement approuvés
          updated_at: new Date().toISOString()
        })
        .eq('user_id', authData.user.id);

      if (profileError) {
        console.warn('Erreur lors de la mise à jour du profil:', profileError);
      }

      // 3. Attribuer le rôle système sélectionné
      if (selectedRoleInfo) {
        // Insérer dans user_system_roles (nouveau système dynamique)
        const { error: systemRoleError } = await supabase
          .from('user_system_roles')
          .insert({
            user_id: authData.user.id,
            role_id: selectedRoleInfo.id,
          });

        if (systemRoleError) {
          console.warn('Erreur lors de l\'attribution du rôle système:', systemRoleError);
        }

        // Également insérer dans user_roles (ancien système enum) pour la compatibilité
        // avec les vérifications de sécurité et les Edge Functions
        const enumRoles = [
          'admin', 'librarian', 'researcher', 'partner', 'subscriber', 'visitor',
          'public_user', 'editor', 'printer', 'producer', 'distributor', 'author',
          'validateur', 'direction', 'dac', 'comptable', 'read_only'
        ];
        
        if (enumRoles.includes(selectedRoleInfo.role_code)) {
          const { error: enumRoleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role: selectedRoleInfo.role_code as any,
            });

          if (enumRoleError) {
            console.warn('Erreur lors de l\'attribution du rôle enum:', enumRoleError);
          }
        }
      }

      // 4. Log de l'activité
      await supabase
        .from('activity_logs')
        .insert({
          action: 'create_internal_user',
          resource_type: 'user',
          resource_id: authData.user.id,
          details: {
            role: formData.role,
            role_name: selectedRoleInfo?.role_name,
            created_by_admin: true,
            notes: formData.notes
          }
        });

      toast({
        title: "Utilisateur créé avec succès",
        description: `${formData.firstName} ${formData.lastName} a été ajouté avec le rôle ${selectedRoleInfo?.role_name || formData.role}`,
      });

      resetForm();
      setOpen(false);
      onUserAdded();

    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'utilisateur",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      'Interne': 'Rôles Internes',
      'Externe': 'Rôles Externes',
      'Professionnel': 'Rôles Professionnels',
      'Autre': 'Autres Rôles'
    };
    return labels[category] || category;
  };

  const getCategoryBadgeVariant = (category: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (category) {
      case 'Interne': return 'destructive';
      case 'Professionnel': return 'default';
      case 'Externe': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Ajouter un Utilisateur Interne
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Créer un Utilisateur Interne
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Informations Personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Mot de passe temporaire *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="Minimum 6 caractères"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Informations professionnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Building className="h-4 w-4" />
                Informations Professionnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="institution">Institution/Organisation</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="researchField">Domaine de recherche/spécialité</Label>
                <Input
                  id="researchField"
                  value={formData.researchField}
                  onChange={(e) => setFormData({ ...formData, researchField: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Rôle et permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Rôle et Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="role">Rôle *</Label>
                <Popover open={rolePopoverOpen} onOpenChange={setRolePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={rolePopoverOpen}
                      className="w-full justify-between font-normal"
                      disabled={rolesLoading}
                    >
                      {selectedRoleInfo ? (
                        <span className="flex items-center gap-2">
                          <Badge variant={getCategoryBadgeVariant(selectedRoleInfo.role_category)} className="text-xs">
                            {selectedRoleInfo.role_category}
                          </Badge>
                          {selectedRoleInfo.role_name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {rolesLoading ? "Chargement des rôles..." : "Sélectionner un rôle"}
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Rechercher un rôle..." />
                      <CommandList>
                        <CommandEmpty>Aucun rôle trouvé.</CommandEmpty>
                        {Object.entries(rolesByCategory).map(([category, roles]) => (
                          <CommandGroup key={category} heading={getCategoryLabel(category)}>
                            {roles.map((role) => (
                              <CommandItem
                                key={role.role_code}
                                value={`${role.role_name} ${role.role_code} ${role.description}`}
                                onSelect={() => {
                                  setSelectedRole(role.role_code);
                                  setFormData({ ...formData, role: role.role_code });
                                  setRolePopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedRole === role.role_code ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{role.role_name}</span>
                                  {role.description && (
                                    <span className="text-xs text-muted-foreground line-clamp-1">
                                      {role.description}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {selectedRoleInfo && (
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={getCategoryBadgeVariant(selectedRoleInfo.role_category)}>
                      {selectedRoleInfo.role_name}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ({selectedRoleInfo.role_code})
                    </span>
                  </div>
                  {selectedRoleInfo.description && (
                    <p className="text-sm text-muted-foreground">
                      {selectedRoleInfo.description}
                    </p>
                  )}
                </div>
              )}
              
              <div>
                <Label htmlFor="notes">Notes internes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes administratives (optionnel)"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.role}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  Création...
                </div>
              ) : (
                'Créer l\'utilisateur'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}