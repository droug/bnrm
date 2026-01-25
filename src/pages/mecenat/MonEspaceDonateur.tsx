import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingButtons } from "@/components/FloatingButtons";
import { useAuth } from "@/hooks/useAuth";
import { useMyDonorProfile, useDonorDonations, useMyProposals, useMecenatMutations } from "@/hooks/useMecenat";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, 
  BookOpen, 
  FileText, 
  User, 
  Plus, 
  Calendar, 
  Package,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  Edit,
  LogIn
} from "lucide-react";
import { motion } from "framer-motion";

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  submitted: { label: "Soumise", icon: Clock, color: "bg-blue-100 text-blue-800" },
  under_review: { label: "En cours d'examen", icon: Clock, color: "bg-amber-100 text-amber-800" },
  accepted: { label: "Acceptée", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  rejected: { label: "Refusée", icon: XCircle, color: "bg-red-100 text-red-800" },
  converted: { label: "Convertie en donation", icon: CheckCircle, color: "bg-primary/20 text-primary" },
  pending: { label: "En attente", icon: Clock, color: "bg-amber-100 text-amber-800" },
  cataloged: { label: "Cataloguée", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  archived: { label: "Archivée", icon: Package, color: "bg-gray-100 text-gray-800" }
};

const supportTypeLabels: Record<string, string> = {
  manuscripts: "Manuscrits",
  books: "Livres",
  periodicals: "Périodiques",
  archives: "Archives",
  photos: "Photographies",
  audiovisual: "Audiovisuel",
  other: "Autre"
};

export default function MonEspaceDonateur() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const { data: donorProfile, isLoading: profileLoading } = useMyDonorProfile();
  const { data: donations = [] } = useDonorDonations(donorProfile?.id);
  const { data: proposals = [] } = useMyProposals();
  const { updateDonor } = useMecenatMutations();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    biography: donorProfile?.biography || '',
    phone: donorProfile?.phone || '',
    address: donorProfile?.address || ''
  });

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <LogIn className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
              <p className="text-muted-foreground mb-6">
                Veuillez vous connecter pour accéder à votre espace donateur
              </p>
              <Button onClick={() => navigate('/auth')}>
                Se connecter
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSaveProfile = async () => {
    if (donorProfile) {
      await updateDonor.mutateAsync({
        id: donorProfile.id,
        ...editForm
      });
      setIsEditing(false);
    }
  };

  const displayName = donorProfile?.donor_type === 'individual'
    ? `${donorProfile?.first_name} ${donorProfile?.last_name}`
    : donorProfile?.organization_name || user.email;

  const initials = donorProfile?.donor_type === 'individual'
    ? `${donorProfile?.first_name?.[0] || ''}${donorProfile?.last_name?.[0] || ''}`
    : donorProfile?.organization_name?.substring(0, 2) || user.email?.substring(0, 2)?.toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <Avatar className="h-20 w-20 border-2 border-primary/20">
            <AvatarImage src={donorProfile?.photo_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{displayName}</h1>
            <p className="text-muted-foreground">
              {donorProfile 
                ? `Donateur depuis ${new Date(donorProfile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
                : 'Futur donateur'
              }
            </p>
          </div>
          <Button onClick={() => navigate('/offrir-collections')}>
            <Plus className="mr-2 h-4 w-4" />
            Proposer un don
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{donations.length}</div>
                <div className="text-sm text-muted-foreground">Donations</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{proposals.length}</div>
                <div className="text-sm text-muted-foreground">Propositions</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {donations.reduce((sum, d) => sum + (d.estimated_quantity || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Œuvres données</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {donations.filter(d => d.status === 'cataloged').length}
                </div>
                <div className="text-sm text-muted-foreground">Cataloguées</div>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="donations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="donations" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Mes Donations
            </TabsTrigger>
            <TabsTrigger value="proposals" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Mes Propositions
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Mon Profil
            </TabsTrigger>
          </TabsList>

          {/* Donations */}
          <TabsContent value="donations">
            <Card>
              <CardHeader>
                <CardTitle>Historique de mes donations</CardTitle>
                <CardDescription>
                  Retrouvez l'ensemble de vos contributions à la BNRM
                </CardDescription>
              </CardHeader>
              <CardContent>
                {donations.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-4">Vous n'avez pas encore de donations enregistrées</p>
                    <Button onClick={() => navigate('/offrir-collections')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Proposer un don
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {donations.map((donation) => {
                      const status = statusConfig[donation.status] || statusConfig.pending;
                      const StatusIcon = status.icon;
                      return (
                        <motion.div
                          key={donation.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <Card className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold">{donation.title}</h4>
                                  <Badge variant="outline" className={status.color}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {status.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {donation.description}
                                </p>
                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Package className="h-3 w-3" />
                                    {supportTypeLabels[donation.support_type] || donation.support_type}
                                  </span>
                                  {donation.estimated_quantity && (
                                    <span>• {donation.estimated_quantity} œuvres</span>
                                  )}
                                  {donation.donation_date && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(donation.donation_date).toLocaleDateString('fr-FR')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Badge variant="secondary" className="ml-4">
                                {donation.donation_number}
                              </Badge>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Propositions */}
          <TabsContent value="proposals">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Mes propositions de dons</CardTitle>
                  <CardDescription>
                    Suivez l'avancement de vos propositions
                  </CardDescription>
                </div>
                <Button onClick={() => navigate('/offrir-collections')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle proposition
                </Button>
              </CardHeader>
              <CardContent>
                {proposals.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-4">Aucune proposition en cours</p>
                    <Button onClick={() => navigate('/offrir-collections')}>
                      Soumettre une proposition
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proposals.map((proposal) => {
                      const status = statusConfig[proposal.status] || statusConfig.submitted;
                      const StatusIcon = status.icon;
                      return (
                        <motion.div
                          key={proposal.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <Card className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary">{proposal.proposal_number}</Badge>
                                  <Badge variant="outline" className={status.color}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {status.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {proposal.collection_description}
                                </p>
                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Package className="h-3 w-3" />
                                    {supportTypeLabels[proposal.support_type] || proposal.support_type}
                                  </span>
                                  {proposal.estimated_books_count && (
                                    <span>• ~{proposal.estimated_books_count} ouvrages</span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(proposal.created_at).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                                {proposal.review_notes && (
                                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                                    <strong>Note de l'équipe :</strong> {proposal.review_notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Mon profil donateur</CardTitle>
                  <CardDescription>
                    Gérez vos informations personnelles
                  </CardDescription>
                </div>
                {donorProfile && !isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {!donorProfile ? (
                  <div className="text-center py-12">
                    <User className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Vous n'avez pas encore de profil donateur. 
                      Celui-ci sera créé automatiquement lorsque votre première proposition de don sera acceptée.
                    </p>
                    <Button onClick={() => navigate('/offrir-collections')}>
                      Proposer un don
                    </Button>
                  </div>
                ) : isEditing ? (
                  <div className="space-y-4 max-w-xl">
                    <div>
                      <Label>Biographie</Label>
                      <Textarea
                        value={editForm.biography}
                        onChange={(e) => setEditForm({ ...editForm, biography: e.target.value })}
                        rows={4}
                        placeholder="Parlez-nous de vous..."
                      />
                    </div>
                    <div>
                      <Label>Téléphone</Label>
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Adresse</Label>
                      <Input
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} disabled={updateDonor.isPending}>
                        Enregistrer
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Nom</Label>
                        <p className="font-medium">{displayName}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Email</Label>
                        <p className="font-medium">{donorProfile.email}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Téléphone</Label>
                        <p className="font-medium">{donorProfile.phone || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Ville</Label>
                        <p className="font-medium">{donorProfile.city || '-'}</p>
                      </div>
                    </div>
                    {donorProfile.biography && (
                      <div>
                        <Label className="text-muted-foreground">Biographie</Label>
                        <p className="mt-1">{donorProfile.biography}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
      <FloatingButtons />
    </div>
  );
}
