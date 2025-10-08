import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, UserPlus, Copy, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Invitation {
  id: string;
  email: string;
  professional_type: string;
  last_deposit_number: string;
  status: string;
  invited_at: string;
  expires_at: string;
  invitation_token: string;
}

export function ProfessionalInvitationsManager() {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [newInvitation, setNewInvitation] = useState({
    email: '',
    professional_type: 'editor',
    last_deposit_number: ''
  });

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    const { data, error } = await supabase
      .from('professional_invitations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les invitations',
        variant: 'destructive'
      });
      return;
    }

    setInvitations(data || []);
  };

  const createInvitation = async () => {
    if (!newInvitation.email || !newInvitation.last_deposit_number) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('professional_invitations')
      .insert([newInvitation]);

    if (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Succès',
        description: 'Invitation créée avec succès'
      });
      setNewInvitation({ email: '', professional_type: 'editor', last_deposit_number: '' });
      loadInvitations();
    }

    setLoading(false);
  };

  const sendInvitationEmail = async (invitation: Invitation) => {
    const invitationUrl = `${window.location.origin}/professional-signup?token=${invitation.invitation_token}`;
    
    toast({
      title: 'URL d\'invitation copiée',
      description: 'Le lien a été copié dans le presse-papiers'
    });

    navigator.clipboard.writeText(invitationUrl);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      pending: 'default',
      used: 'secondary',
      expired: 'destructive'
    };

    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getProfessionalTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      editor: 'Éditeur',
      printer: 'Imprimeur',
      producer: 'Producteur',
      distributor: 'Distributeur'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Gestion des Invitations Professionnelles
          </CardTitle>
          <CardDescription>
            Invitez des professionnels connus de la BNRM à créer leur compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Créer une invitation</TabsTrigger>
              <TabsTrigger value="list">Liste des invitations</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email du professionnel</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemple.com"
                    value={newInvitation.email}
                    onChange={(e) => setNewInvitation({ ...newInvitation, email: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="type">Type de professionnel</Label>
                  <Select
                    value={newInvitation.professional_type}
                    onValueChange={(value) => setNewInvitation({ ...newInvitation, professional_type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Éditeur</SelectItem>
                      <SelectItem value="printer">Imprimeur</SelectItem>
                      <SelectItem value="producer">Producteur</SelectItem>
                      <SelectItem value="distributor">Distributeur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="deposit">Dernier numéro de dépôt (DL/ISSN)</Label>
                  <Input
                    id="deposit"
                    placeholder="DL-2024-000123"
                    value={newInvitation.last_deposit_number}
                    onChange={(e) => setNewInvitation({ ...newInvitation, last_deposit_number: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Ce numéro sera utilisé pour vérifier l'identité du professionnel
                  </p>
                </div>

                <Button onClick={createInvitation} disabled={loading} className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Créer l'invitation
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="list">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>N° Dépôt</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Créée le</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-medium">{invitation.email}</TableCell>
                        <TableCell>{getProfessionalTypeLabel(invitation.professional_type)}</TableCell>
                        <TableCell className="font-mono text-sm">{invitation.last_deposit_number}</TableCell>
                        <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                        <TableCell>{new Date(invitation.invited_at).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>
                          {invitation.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => sendInvitationEmail(invitation)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copier le lien
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
