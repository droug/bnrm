import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserPlus, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  FileText,
  AlertCircle
} from "lucide-react";

interface CommitteeMember {
  id: string;
  member_id: string;
  role: 'president' | 'member' | 'secretary';
  specialization?: string;
  is_active: boolean;
  appointed_date: string;
  profiles?: {
    first_name: string;
    last_name: string;
    institution?: string;
  };
}

interface CommitteeReview {
  id: string;
  request_id: string;
  committee_member_id: string;
  review_status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  review_date?: string;
  comments?: string;
  decision_rationale?: string;
  committee_member?: CommitteeMember;
  request?: {
    request_number: string;
    title: string;
    status: string;
  };
}

export const CommitteeManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [reviews, setReviews] = useState<CommitteeReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  useEffect(() => {
    fetchCommitteeMembers();
    fetchPendingReviews();
  }, []);

  const fetchCommitteeMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_deposit_validation_committee')
        .select('*')
        .order('appointed_date', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately for each member
      const membersWithProfiles = await Promise.all(
        (data || []).map(async (member: any) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, institution')
            .eq('user_id', member.member_id)
            .single();
          
          return {
            ...member,
            profiles: profileData
          };
        })
      );

      setMembers(membersWithProfiles as CommitteeMember[]);
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les membres du comité",
        variant: "destructive"
      });
    }
  };

  const fetchPendingReviews = async () => {
    try {
      const { data: reviewsData, error } = await supabase
        .from('legal_deposit_committee_reviews')
        .select('*')
        .eq('review_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch related data separately
      const reviewsWithDetails = await Promise.all(
        (reviewsData || []).map(async (review: any) => {
          const { data: committeeMember } = await supabase
            .from('legal_deposit_validation_committee')
            .select('*')
            .eq('id', review.committee_member_id)
            .single();

          const { data: request } = await supabase
            .from('legal_deposit_requests')
            .select('request_number, title, status')
            .eq('id', review.request_id)
            .single();

          let memberProfiles = null;
          if (committeeMember) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('user_id', committeeMember.member_id)
              .single();
            memberProfiles = profileData;
          }

          return {
            ...review,
            committee_member: committeeMember ? {
              ...committeeMember,
              profiles: memberProfiles
            } : undefined,
            request
          };
        })
      );

      setReviews(reviewsWithDetails as CommitteeReview[]);
    } catch (error) {
      console.error('Erreur lors du chargement des évaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCommitteeMember = async (memberData: {
    member_id: string;
    role: string;
    specialization?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('legal_deposit_validation_committee')
        .insert({
          ...memberData,
          appointed_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Membre ajouté",
        description: "Le membre a été ajouté au comité avec succès"
      });

      setIsAddMemberOpen(false);
      fetchCommitteeMembers();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du membre:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le membre au comité",
        variant: "destructive"
      });
    }
  };

  const toggleMemberStatus = async (memberId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('legal_deposit_validation_committee')
        .update({ is_active: !currentStatus })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `Membre ${!currentStatus ? 'activé' : 'désactivé'} avec succès`
      });

      fetchCommitteeMembers();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const submitReview = async (reviewId: string, status: 'approved' | 'rejected', comments: string, rationale: string) => {
    try {
      const { error } = await supabase
        .from('legal_deposit_committee_reviews')
        .update({
          review_status: status,
          review_date: new Date().toISOString(),
          comments,
          decision_rationale: rationale
        })
        .eq('id', reviewId);

      if (error) throw error;

      // Vérifier si tous les membres ont voté
      const review = reviews.find(r => r.id === reviewId);
      if (review) {
        await checkAndUpdateRequestStatus(review.request_id);
      }

      toast({
        title: "Évaluation enregistrée",
        description: `Demande ${status === 'approved' ? 'approuvée' : 'rejetée'} avec succès`
      });

      fetchPendingReviews();
    } catch (error) {
      console.error('Erreur lors de l\'évaluation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer l'évaluation",
        variant: "destructive"
      });
    }
  };

  const checkAndUpdateRequestStatus = async (requestId: string) => {
    try {
      const { data: isApproved, error } = await supabase
        .rpc('check_committee_approval', { request_uuid: requestId });

      if (error) throw error;

      // Mettre à jour le statut de la demande en fonction du résultat
      const newStatus = isApproved ? 'valide_par_comite' : 'rejete_par_comite';
      
      await supabase
        .from('legal_deposit_requests')
        .update({ status: newStatus as any })
        .eq('id', requestId);

    } catch (error) {
      console.error('Erreur lors de la vérification de l\'approbation:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const config = {
      president: { label: "Président", color: "bg-purple-500" },
      secretary: { label: "Secrétaire", color: "bg-blue-500" },
      member: { label: "Membre", color: "bg-gray-500" }
    };
    return config[role as keyof typeof config] || config.member;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: "En attente", color: "bg-yellow-500", icon: Clock },
      approved: { label: "Approuvé", color: "bg-green-500", icon: CheckCircle },
      rejected: { label: "Rejeté", color: "bg-red-500", icon: XCircle },
      needs_revision: { label: "Révision requise", color: "bg-orange-500", icon: AlertCircle }
    };
    const statusConfig = config[status as keyof typeof config] || config.pending;
    const Icon = statusConfig.icon;
    return (
      <Badge className={`${statusConfig.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {statusConfig.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Comité de Validation</h1>
          <p className="text-muted-foreground">Gestion du comité de validation des demandes de dépôt légal</p>
        </div>
        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter un membre
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un membre au comité</DialogTitle>
            </DialogHeader>
            <AddMemberForm onSubmit={addCommitteeMember} onCancel={() => setIsAddMemberOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Membres du comité
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <FileText className="h-4 w-4 mr-2" />
            Évaluations en cours
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Membres du comité de validation</CardTitle>
              <CardDescription>
                Liste des membres désignés pour la validation des demandes de dépôt légal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Spécialisation</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Date de nomination</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Chargement des membres...
                      </TableCell>
                    </TableRow>
                  ) : members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Aucun membre dans le comité
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.profiles?.first_name} {member.profiles?.last_name}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getRoleBadge(member.role).color} text-white`}>
                            {getRoleBadge(member.role).label}
                          </Badge>
                        </TableCell>
                        <TableCell>{member.specialization || '-'}</TableCell>
                        <TableCell>{member.profiles?.institution || '-'}</TableCell>
                        <TableCell>
                          {new Date(member.appointed_date).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.is_active ? "default" : "secondary"}>
                            {member.is_active ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleMemberStatus(member.id, member.is_active)}
                          >
                            {member.is_active ? 'Désactiver' : 'Activer'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Évaluations en attente</CardTitle>
              <CardDescription>
                Demandes soumises au comité de validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune évaluation en attente
                  </div>
                ) : (
                  reviews.map((review) => (
                    <ReviewCard 
                      key={review.id} 
                      review={review} 
                      onSubmit={submitReview}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const AddMemberForm = ({ onSubmit, onCancel }: { 
  onSubmit: (data: any) => void; 
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    member_id: '',
    role: 'member',
    specialization: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="member_id">ID Utilisateur</Label>
        <Input
          id="member_id"
          value={formData.member_id}
          onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rôle</Label>
        <Select 
          value={formData.role} 
          onValueChange={(value) => setFormData({ ...formData, role: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="president">Président</SelectItem>
            <SelectItem value="secretary">Secrétaire</SelectItem>
            <SelectItem value="member">Membre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialization">Spécialisation</Label>
        <Input
          id="specialization"
          value={formData.specialization}
          onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">Ajouter</Button>
      </div>
    </form>
  );
};

const ReviewCard = ({ 
  review, 
  onSubmit 
}: { 
  review: CommitteeReview; 
  onSubmit: (id: string, status: 'approved' | 'rejected', comments: string, rationale: string) => void;
}) => {
  const [comments, setComments] = useState('');
  const [rationale, setRationale] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {review.request?.request_number} - {review.request?.title}
            </CardTitle>
            <CardDescription>
              Évaluateur: {review.committee_member?.profiles?.first_name} {review.committee_member?.profiles?.last_name}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showDetails ? 'Masquer' : 'Voir détails'}
          </Button>
        </div>
      </CardHeader>
      {showDetails && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`comments-${review.id}`}>Commentaires</Label>
            <Textarea
              id={`comments-${review.id}`}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Vos commentaires sur la demande..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`rationale-${review.id}`}>Justification de la décision</Label>
            <Textarea
              id={`rationale-${review.id}`}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Justification détaillée de votre décision..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                onSubmit(review.id, 'rejected', comments, rationale);
                setComments('');
                setRationale('');
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
            <Button
              variant="default"
              onClick={() => {
                onSubmit(review.id, 'approved', comments, rationale);
                setComments('');
                setRationale('');
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approuver
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
