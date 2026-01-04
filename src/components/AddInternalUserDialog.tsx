import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PortalSelect } from "@/components/ui/portal-select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, User, Mail, Building, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddInternalUserDialogProps {
  onUserAdded: () => void;
}

const INTERNAL_ROLES = {
  admin: {
    name: 'Administrateur',
    permissions: ['Gestion complète du système', 'Gestion des utilisateurs', 'Configuration'],
    description: 'Accès complet à toutes les fonctionnalités administratives',
    color: 'destructive' as const
  },
  librarian: {
    name: 'Bibliothécaire',
    permissions: ['Gestion des manuscrits', 'Approbation des demandes', 'Gestion des collections'],
    description: 'Gestion des ressources documentaires et approbation des accès',
    color: 'default' as const
  },
  partner: {
    name: 'Partenaire Institutionnel',
    permissions: ['Accès prioritaire', 'Collaboration inter-institutionnelle', 'Projets spéciaux'],
    description: 'Accès privilégié pour les partenaires institutionnels',
    color: 'secondary' as const
  }
};

export default function AddInternalUserDialog({ onUserAdded }: AddInternalUserDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
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
          role: formData.role as any,
          is_approved: true, // Les utilisateurs internes sont automatiquement approuvés
          updated_at: new Date().toISOString()
        })
        .eq('user_id', authData.user.id);

      if (profileError) {
        console.warn('Erreur lors de la mise à jour du profil:', profileError);
        // On continue car le profil sera créé par le trigger
      }

      // 3. Log de l'activité
      await supabase
        .from('activity_logs')
        .insert({
          action: 'create_internal_user',
          resource_type: 'user',
          resource_id: authData.user.id,
          details: {
            role: formData.role,
            created_by_admin: true,
            notes: formData.notes
          }
        });

      toast({
        title: "Utilisateur créé avec succès",
        description: `${formData.firstName} ${formData.lastName} a été ajouté avec le rôle ${INTERNAL_ROLES[formData.role as keyof typeof INTERNAL_ROLES]?.name}`,
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

  const selectedRoleInfo = selectedRole ? INTERNAL_ROLES[selectedRole as keyof typeof INTERNAL_ROLES] : null;

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
                <PortalSelect
                  value={formData.role}
                  onChange={(value) => {
                    setFormData({ ...formData, role: value });
                    setSelectedRole(value);
                  }}
                  placeholder="Sélectionner un rôle"
                  options={Object.entries(INTERNAL_ROLES).map(([key, role]) => ({
                    value: key,
                    label: role.name
                  }))}
                />
              </div>

              {selectedRoleInfo && (
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedRoleInfo.color}>
                      {selectedRoleInfo.name}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedRoleInfo.description}
                  </p>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Permissions incluses :</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedRoleInfo.permissions.map((permission, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {permission}
                        </li>
                      ))}
                    </ul>
                  </div>
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