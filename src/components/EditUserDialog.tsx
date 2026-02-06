import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PortalSelect } from "@/components/ui/portal-select";
import { SimpleRoleSelector } from "@/components/workflow/SimpleRoleSelector";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, Building, BookOpen, Shield, Mail } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Enums']['user_role'];

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string | null;
  institution: string | null;
  research_field: string | null;
  role: string;
  is_approved: boolean;
  subscription_type?: string | null;
  partner_organization?: string | null;
  research_specialization?: string[] | null;
}

interface EditUserDialogProps {
  user: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

interface SystemRole {
  id: string;
  role_name: string;
  role_code: string;
}

interface FormData {
  first_name: string;
  last_name: string;
  phone: string;
  institution: string;
  research_field: string;
  role: string;
  subscription_type: string;
  partner_organization: string;
  is_approved: boolean;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  user,
  open,
  onOpenChange,
  onUserUpdated
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<SystemRole[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  
  const { register, handleSubmit, setValue, watch, reset } = useForm<FormData>({
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      phone: user?.phone || "",
      institution: user?.institution || "",
      research_field: user?.research_field || "",
      role: "",
      subscription_type: user?.subscription_type || "",
      partner_organization: user?.partner_organization || "",
      is_approved: user?.is_approved || false,
    }
  });

  // Charger tous les rôles système disponibles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('system_roles')
          .select('id, role_name, role_code')
          .eq('is_active', true)
          .order('role_name', { ascending: true });

        if (error) throw error;
        setAvailableRoles(data || []);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    if (open) {
      fetchRoles();
    }
  }, [open]);

  // Charger le rôle actuel de l'utilisateur depuis user_roles ou profile.role
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.user_id || availableRoles.length === 0) return;

      try {
        let foundRole: string | null = null;

        // 1. D'abord chercher dans user_roles (enum-based)
        const { data: userRoleData, error: userRoleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.user_id)
          .maybeSingle();

        if (!userRoleError && userRoleData?.role) {
          // Mapper le role enum vers l'ID du system_role correspondant
          const matchingRole = availableRoles.find(r => r.role_code === userRoleData.role);
          if (matchingRole) {
            foundRole = matchingRole.id;
          }
        }

        // 2. Si pas trouvé, chercher dans user_system_roles
        if (!foundRole) {
          const { data: systemRoleData, error: systemRoleError } = await supabase
            .from('user_system_roles')
            .select('role_id')
            .eq('user_id', user.user_id)
            .eq('is_active', true)
            .maybeSingle();

          if (!systemRoleError && systemRoleData?.role_id) {
            foundRole = systemRoleData.role_id;
          }
        }

        // 3. Si toujours pas trouvé, utiliser le profile.role comme fallback
        if (!foundRole && user.role) {
          const matchingRole = availableRoles.find(r => r.role_code === user.role);
          if (matchingRole) {
            foundRole = matchingRole.id;
          }
        }

        // 4. Appliquer le rôle trouvé ou laisser vide
        if (foundRole) {
          setCurrentUserRole(foundRole);
          setValue("role", foundRole);
        } else {
          // Pas de rôle trouvé - laisser vide pour forcer la sélection
          setCurrentUserRole("");
          setValue("role", "");
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    if (user && availableRoles.length > 0 && open) {
      fetchUserRole();
    }
  }, [user, availableRoles, open, setValue]);

  // Réinitialiser le rôle quand l'utilisateur change
  useEffect(() => {
    if (user?.id) {
      // Reset currentUserRole quand un nouvel utilisateur est sélectionné
      setCurrentUserRole("");
    }
  }, [user?.id]);

  // Reset form when user changes - mais ne pas inclure currentUserRole comme dépendance
  // car il est mis à jour séparément par fetchUserRole
  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        institution: user.institution || "",
        research_field: user.research_field || "",
        role: "", // Sera mis à jour par fetchUserRole
        subscription_type: user.subscription_type || "",
        partner_organization: user.partner_organization || "",
        is_approved: user.is_approved || false,
      });
    }
  }, [user, reset]);

  const selectedRole = watch("role");
  const isApproved = watch("is_approved");

  // Obtenir le code du rôle sélectionné
  const selectedRoleData = availableRoles.find(r => r.id === selectedRole);
  const selectedRoleCode = selectedRoleData?.role_code || "";

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Trouver le rôle sélectionné
      const roleData = availableRoles.find(r => r.id === data.role);
      const roleCode = roleData?.role_code || "visitor";

      // 1. Mettre à jour le profil (avec le role_code legacy)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name.trim(),
          last_name: data.last_name.trim(),
          phone: data.phone.trim() || null,
          institution: data.institution.trim() || null,
          research_field: data.research_field.trim() || null,
          role: roleCode,
          subscription_type: data.subscription_type.trim() || null,
          partner_organization: data.partner_organization.trim() || null,
          is_approved: data.is_approved,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Mettre à jour user_roles (enum-based)
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.user_id);

      const { error: userRoleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.user_id,
          role: roleCode as UserRole
        });

      if (userRoleError) {
        console.error('Error updating user_roles:', userRoleError);
      }

      // 3. Mettre à jour user_system_roles (dynamic roles)
      await supabase
        .from('user_system_roles')
        .delete()
        .eq('user_id', user.user_id);

      const { error: systemRoleError } = await supabase
        .from('user_system_roles')
        .insert({
          user_id: user.user_id,
          role_id: data.role,
          is_active: true
        });

      if (systemRoleError) {
        console.error('Error updating user_system_roles:', systemRoleError);
      }

      toast({
        title: "Utilisateur mis à jour",
        description: "Les informations de l'utilisateur ont été modifiées avec succès",
      });

      onUserUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'utilisateur",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeVariant = (roleCode: string) => {
    switch (roleCode) {
      case 'admin': return 'destructive';
      case 'librarian': return 'default';
      case 'validateur': return 'default';
      case 'partner': return 'secondary';
      case 'researcher': return 'outline';
      default: return 'outline';
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Modifier l'utilisateur
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations et les permissions de l'utilisateur
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Informations personnelles
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom *</Label>
                <Input
                  id="first_name"
                  {...register("first_name", { required: true })}
                  placeholder="Prénom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom *</Label>
                <Input
                  id="last_name"
                  {...register("last_name", { required: true })}
                  placeholder="Nom"
                />
              </div>
            </div>

            {/* Email (lecture seule) */}
            {user?.email && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email
                </Label>
                <Input
                  value={user.email}
                  readOnly
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="+212 6XX XXX XXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="institution" className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  Institution
                </Label>
                <Input
                  id="institution"
                  {...register("institution")}
                  placeholder="Nom de l'institution"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="research_field" className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                Domaine de recherche
              </Label>
              <Textarea
                id="research_field"
                {...register("research_field")}
                placeholder="Décrivez le domaine de recherche"
                rows={2}
              />
            </div>
          </div>

          {/* Permissions et rôle */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissions et statut
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Rôle *</Label>
                <SimpleRoleSelector
                  value={selectedRole}
                  onChange={(value) => setValue("role", value)}
                  roles={availableRoles.map(r => ({ id: r.id, role_name: r.role_name }))}
                  placeholder="Sélectionner un rôle..."
                />
              </div>

              <div className="space-y-2">
                <Label>Statut d'approbation</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={isApproved ? "default" : "secondary"}>
                    {isApproved ? "Approuvé" : "En attente"}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue("is_approved", !isApproved)}
                  >
                    {isApproved ? "Révoquer" : "Approuver"}
                  </Button>
                </div>
              </div>
            </div>

            {selectedRoleData && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getRoleBadgeVariant(selectedRoleCode)}>
                    {selectedRoleData.role_name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Rôle sélectionné
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedRoleCode === 'admin' && "Accès complet à toutes les fonctionnalités d'administration"}
                  {selectedRoleCode === 'librarian' && "Gestion des contenus, manuscrits et collections"}
                  {selectedRoleCode === 'validateur' && "Validation des demandes et arbitrages"}
                  {selectedRoleCode === 'partner' && "Accès privilégié pour les partenaires institutionnels"}
                  {selectedRoleCode === 'researcher' && "Accès étendu pour la recherche académique"}
                  {selectedRoleCode === 'subscriber' && "Abonnement premium avec fonctionnalités avancées"}
                  {selectedRoleCode === 'public_user' && "Accès standard pour le grand public"}
                  {selectedRoleCode === 'visitor' && "Accès limité de base"}
                  {!['admin', 'librarian', 'validateur', 'partner', 'researcher', 'subscriber', 'public_user', 'visitor'].includes(selectedRoleCode) && "Rôle spécialisé"}
                </p>
              </div>
            )}
          </div>

          {/* Informations spécialisées selon le rôle */}
          {(selectedRoleCode === 'partner' || selectedRoleCode === 'subscriber') && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Informations spécialisées</h3>
              
              {selectedRoleCode === 'partner' && (
                <div className="space-y-2">
                  <Label htmlFor="partner_organization">Organisation partenaire</Label>
                  <Input
                    id="partner_organization"
                    {...register("partner_organization")}
                    placeholder="Nom de l'organisation partenaire"
                  />
                </div>
              )}
              
              {selectedRoleCode === 'subscriber' && (
                <div className="space-y-2">
                  <Label htmlFor="subscription_type">Type d'abonnement</Label>
                  <PortalSelect 
                    value={watch("subscription_type")} 
                    onChange={(value) => setValue("subscription_type", value)}
                    placeholder="Sélectionnez un type d'abonnement"
                    options={[
                      { value: "monthly", label: "Mensuel" },
                      { value: "yearly", label: "Annuel" },
                      { value: "lifetime", label: "À vie" },
                    ]}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};