import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate } from "react-router-dom";
import { AdminPageWrapper, AdminSectionCard } from "@/components/digital-library/admin/AdminPageWrapper";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function DigitalLibraryRestrictions() {
  const { user, profile } = useAuth();
  const { isAdmin, isLibrarian, loading: rolesLoading } = useSecureRoles();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [restrictionType, setRestrictionType] = useState("temporary");
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // All hooks MUST be called before any conditional returns
  const { data: restrictions, isLoading } = useQuery({
    queryKey: ['download-restrictions'],
    queryFn: async () => {
      const { data: restrictionsData, error } = await supabase
        .from('download_restrictions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const userIds = restrictionsData?.map(r => r.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles_public')
        .select('id, first_name, last_name')
        .in('id', userIds);
      
      return restrictionsData?.map(restriction => ({
        ...restriction,
        user_profile: profiles?.find(p => p.id === restriction.user_id)
      }));
    },
    enabled: !rolesLoading && !!user && (isAdmin || isLibrarian)
  });

  const { data: users } = useQuery({
    queryKey: ['users-for-restriction'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles_public')
        .select('id, first_name, last_name')
        .order('first_name');
      
      if (error) throw error;
      return data;
    },
    enabled: !rolesLoading && !!user && (isAdmin || isLibrarian)
  });

  const addRestrictionMutation = useMutation({
    mutationFn: async () => {
      const restrictionData: any = {
        user_id: selectedUserId,
        restriction_type: restrictionType,
        reason: reason,
        created_by: profile.id
      };

      if (restrictionType === 'temporary' && expiresAt) {
        restrictionData.expires_at = expiresAt;
      }

      const { error } = await supabase
        .from('download_restrictions')
        .insert(restrictionData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['download-restrictions'] });
      setShowAddDialog(false);
      setSelectedUserId("");
      setReason("");
      setExpiresAt("");
      toast({ title: "Restriction ajoutée avec succès" });
    },
    onError: () => {
      toast({ 
        title: "Erreur", 
        description: "Impossible d'ajouter la restriction",
        variant: "destructive" 
      });
    }
  });

  const deleteRestrictionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('download_restrictions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['download-restrictions'] });
      toast({ title: "Restriction supprimée" });
    },
    onError: () => {
      toast({ 
        title: "Erreur", 
        description: "Impossible de supprimer la restriction",
        variant: "destructive" 
      });
    }
  });

  // Conditional returns AFTER all hooks
  if (rolesLoading) {
    return (
      <AdminPageWrapper
        title="Restrictions de téléchargement"
        description="Gérer les restrictions d'accès"
        icon="mdi:download-off"
        iconColor="text-red-600"
        loading={true}
      >
        <div />
      </AdminPageWrapper>
    );
  }

  if (!user || (!isAdmin && !isLibrarian)) {
    return <Navigate to="/" replace />;
  }

  const AddButton = (
    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
      <DialogTrigger asChild>
        <Button className="bg-bn-blue-primary hover:bg-bn-blue-dark gap-2">
          <Icon icon="mdi:plus" className="h-4 w-4" />
          Ajouter une restriction
        </Button>
      </DialogTrigger>
      <DialogContent className="z-[10001]">
        <DialogHeader>
          <DialogTitle>Ajouter une restriction</DialogTitle>
          <DialogDescription>
            Restreindre l'accès au téléchargement pour un utilisateur
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="user">Utilisateur</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un utilisateur" />
              </SelectTrigger>
              <SelectContent className="z-[10100]">
                {users?.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.first_name} {u.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="type">Type de restriction</Label>
            <Select value={restrictionType} onValueChange={setRestrictionType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[10100]">
                <SelectItem value="temporary">Temporaire</SelectItem>
                <SelectItem value="permanent">Permanente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {restrictionType === 'temporary' && (
            <div>
              <Label htmlFor="expires">Date d'expiration</Label>
              <Input
                id="expires"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          )}
          <div>
            <Label htmlFor="reason">Raison</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Décrire la raison de la restriction..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAddDialog(false)}>
            Annuler
          </Button>
          <Button 
            onClick={() => addRestrictionMutation.mutate()}
            disabled={!selectedUserId || !reason}
            className="bg-bn-blue-primary hover:bg-bn-blue-dark"
          >
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <AdminPageWrapper
      title="Restrictions de téléchargement"
      description="Gérer les restrictions d'accès pour les utilisateurs en cas d'abus"
      icon="mdi:download-off"
      iconColor="text-red-600"
      actions={AddButton}
    >
      <AdminSectionCard
        title="Utilisateurs restreints"
        description="Liste des restrictions actives"
        icon="mdi:account-off"
        iconBgColor="bg-red-100 text-red-600"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-bn-blue-primary"></div>
          </div>
        ) : restrictions && restrictions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Raison</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>Expire le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restrictions.map((restriction) => (
                <TableRow key={restriction.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {restriction.user_profile?.first_name} {restriction.user_profile?.last_name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={restriction.restriction_type === 'permanent' ? 'destructive' : 'secondary'}>
                      {restriction.restriction_type === 'permanent' ? 'Permanente' : 'Temporaire'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{restriction.reason}</TableCell>
                  <TableCell>
                    {new Date(restriction.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {restriction.expires_at 
                      ? new Date(restriction.expires_at).toLocaleDateString()
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRestrictionMutation.mutate(restriction.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Icon icon="mdi:trash-can" className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Icon icon="mdi:check-circle" className="h-12 w-12 mx-auto mb-4 opacity-40 text-green-500" />
            <p>Aucune restriction de téléchargement</p>
            <p className="text-sm mt-1">Tous les utilisateurs ont un accès normal</p>
          </div>
        )}
      </AdminSectionCard>
    </AdminPageWrapper>
  );
}
