import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PortalSelect } from "@/components/ui/portal-select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Building, BookOpen, Shield } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
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

interface FormData {
  first_name: string;
  last_name: string;
  phone: string;
  institution: string;
  research_field: string;
  role: "visitor" | "admin" | "librarian" | "partner" | "researcher" | "subscriber" | "public_user";
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
  
  const { register, handleSubmit, setValue, watch, reset } = useForm<FormData>({
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      phone: user?.phone || "",
      institution: user?.institution || "",
      research_field: user?.research_field || "",
      role: (user?.role as any) || "visitor",
      subscription_type: user?.subscription_type || "",
      partner_organization: user?.partner_organization || "",
      is_approved: user?.is_approved || false,
    }
  });

  // Reset form when user changes
  React.useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        institution: user.institution || "",
        research_field: user.research_field || "",
        role: (user.role as any) || "visitor",
        subscription_type: user.subscription_type || "",
        partner_organization: user.partner_organization || "",
        is_approved: user.is_approved || false,
      });
    }
  }, [user, reset]);

  const selectedRole = watch("role");
  const isApproved = watch("is_approved");

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name.trim(),
          last_name: data.last_name.trim(),
          phone: data.phone.trim() || null,
          institution: data.institution.trim() || null,
          research_field: data.research_field.trim() || null,
          role: data.role,
          subscription_type: data.subscription_type.trim() || null,
          partner_organization: data.partner_organization.trim() || null,
          is_approved: data.is_approved,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
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

  const roleLabels: Record<string, string> = {
    admin: "Administrateur",
    librarian: "Bibliothécaire",
    partner: "Partenaire Institutionnel",
    researcher: "Chercheur",
    subscriber: "Abonné Premium",
    public_user: "Grand Public",
    visitor: "Visiteur (Legacy)"
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'librarian': return 'default';
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
                <PortalSelect 
                  value={selectedRole} 
                  onChange={(value) => setValue("role", value as any)}
                  options={[
                    { value: "admin", label: "Administrateur" },
                    { value: "librarian", label: "Bibliothécaire" },
                    { value: "partner", label: "Partenaire Institutionnel" },
                    { value: "researcher", label: "Chercheur" },
                    { value: "subscriber", label: "Abonné Premium" },
                    { value: "public_user", label: "Grand Public" },
                    { value: "visitor", label: "Visiteur (Legacy)" },
                  ]}
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

            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={getRoleBadgeVariant(selectedRole)}>
                  {roleLabels[selectedRole]}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Rôle sélectionné
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedRole === 'admin' && "Accès complet à toutes les fonctionnalités d'administration"}
                {selectedRole === 'librarian' && "Gestion des contenus, manuscrits et collections"}
                {selectedRole === 'partner' && "Accès privilégié pour les partenaires institutionnels"}
                {selectedRole === 'researcher' && "Accès étendu pour la recherche académique"}
                {selectedRole === 'subscriber' && "Abonnement premium avec fonctionnalités avancées"}
                {selectedRole === 'public_user' && "Accès standard pour le grand public"}
                {selectedRole === 'visitor' && "Accès limité de base"}
              </p>
            </div>
          </div>

          {/* Informations spécialisées selon le rôle */}
          {(selectedRole === 'partner' || selectedRole === 'subscriber') && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Informations spécialisées</h3>
              
              {selectedRole === 'partner' && (
                <div className="space-y-2">
                  <Label htmlFor="partner_organization">Organisation partenaire</Label>
                  <Input
                    id="partner_organization"
                    {...register("partner_organization")}
                    placeholder="Nom de l'organisation partenaire"
                  />
                </div>
              )}
              
              {selectedRole === 'subscriber' && (
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