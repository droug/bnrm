import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMyDonorProfile, useDonorDonations, useMyProposals, useMecenatMutations } from "@/hooks/useMecenat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Edit,
  Save
} from "lucide-react";
import { motion } from "framer-motion";

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  submitted: { label: "Soumise", icon: Clock, color: "bg-blue-50 text-blue-700 border-blue-300" },
  under_review: { label: "En cours d'examen", icon: Clock, color: "bg-amber-50 text-amber-700 border-amber-300" },
  accepted: { label: "Acceptée", icon: CheckCircle, color: "bg-green-50 text-green-700 border-green-300" },
  rejected: { label: "Refusée", icon: XCircle, color: "bg-red-50 text-red-700 border-red-300" },
  converted: { label: "Convertie en donation", icon: CheckCircle, color: "bg-primary/10 text-primary border-primary/30" },
  pending: { label: "En attente", icon: Clock, color: "bg-amber-50 text-amber-700 border-amber-300" },
  cataloged: { label: "Cataloguée", icon: CheckCircle, color: "bg-green-50 text-green-700 border-green-300" },
  archived: { label: "Archivée", icon: Package, color: "bg-muted text-muted-foreground border-muted" }
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

export function MyDonorSpace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: donorProfile, isLoading: profileLoading } = useMyDonorProfile();
  const { data: donations = [] } = useDonorDonations(donorProfile?.id);
  const { data: proposals = [] } = useMyProposals();
  const { updateDonor } = useMecenatMutations();
  const [activeTab, setActiveTab] = useState("donations");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    biography: donorProfile?.biography || '',
    phone: donorProfile?.phone || '',
    address: donorProfile?.address || ''
  });

  if (profileLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
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
    : donorProfile?.organization_name || user?.email;

  const initials = donorProfile?.donor_type === 'individual'
    ? `${donorProfile?.first_name?.[0] || ''}${donorProfile?.last_name?.[0] || ''}`
    : donorProfile?.organization_name?.substring(0, 2) || user?.email?.substring(0, 2)?.toUpperCase();

  // Render stats
  const renderStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="p-4 border-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-50">
            <Heart className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{donations.length}</div>
            <div className="text-sm text-muted-foreground">Donations</div>
          </div>
        </div>
      </Card>
      <Card className="p-4 border-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50">
            <FileText className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{proposals.length}</div>
            <div className="text-sm text-muted-foreground">Propositions</div>
          </div>
        </div>
      </Card>
      <Card className="p-4 border-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50">
            <BookOpen className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {donations.reduce((sum, d) => sum + (d.estimated_quantity || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Œuvres données</div>
          </div>
        </div>
      </Card>
      <Card className="p-4 border-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <CheckCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {donations.filter(d => d.status === 'cataloged').length}
            </div>
            <div className="text-sm text-muted-foreground">Cataloguées</div>
          </div>
        </div>
      </Card>
    </div>
  );

  // Render donations list
  const renderDonations = () => (
    <ScrollArea className="h-[400px] pr-4">
      {donations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-rose-50 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-rose-300" />
          </div>
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas encore de donations enregistrées
          </p>
          <Button onClick={() => navigate('/offrir-collections')} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Proposer un don
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {donations.map((donation) => {
            const status = statusConfig[donation.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const supportType = supportTypeLabels[donation.support_type] || donation.support_type;
            return (
              <motion.div
                key={donation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="p-4 border-l-4 border-l-primary/20 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{donation.title}</h4>
                        <Badge variant="outline" className={`border ${status.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      {donation.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {donation.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {supportType}
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
    </ScrollArea>
  );

  // Render proposals list
  const renderProposals = () => (
    <ScrollArea className="h-[400px] pr-4">
      {proposals.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-amber-300" />
          </div>
          <p className="text-muted-foreground mb-4">
            Aucune proposition en cours
          </p>
          <Button onClick={() => navigate('/offrir-collections')} size="sm">
            Soumettre une proposition
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => {
            const status = statusConfig[proposal.status] || statusConfig.submitted;
            const StatusIcon = status.icon;
            return (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="p-4 border-l-4 border-l-amber-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">
                          {proposal.donor_type === 'individual' 
                            ? `${proposal.first_name} ${proposal.last_name}`
                            : proposal.organization_name}
                        </h4>
                        <Badge variant="outline" className={`border ${status.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      {proposal.collection_description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {proposal.collection_description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Soumise le {new Date(proposal.created_at).toLocaleDateString('fr-FR')}
                        </span>
                        {proposal.estimated_books_count && (
                          <span>• ~{proposal.estimated_books_count} documents estimés</span>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-4">
                      {proposal.proposal_number}
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </ScrollArea>
  );

  // Render profile
  const renderProfile = () => (
    <div className="space-y-6">
      {donorProfile ? (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarImage src={donorProfile.photo_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{displayName}</h3>
                <p className="text-sm text-muted-foreground">
                  Donateur depuis {new Date(donorProfile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Annuler' : 'Modifier'}
            </Button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label>Biographie</Label>
                <Textarea
                  value={editForm.biography}
                  onChange={(e) => setEditForm({ ...editForm, biography: e.target.value })}
                  placeholder="Quelques mots sur vous ou votre organisation..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Téléphone</Label>
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+212..."
                  />
                </div>
                <div>
                  <Label>Adresse</Label>
                  <Input
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    placeholder="Votre adresse"
                  />
                </div>
              </div>
              <Button onClick={handleSaveProfile} disabled={updateDonor.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {donorProfile.biography && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Biographie</h4>
                  <p className="text-foreground">{donorProfile.biography}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
                  <p className="text-foreground">{donorProfile.email}</p>
                </div>
                {donorProfile.phone && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Téléphone</h4>
                    <p className="text-foreground">{donorProfile.phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-primary/50" />
          </div>
          <h3 className="font-semibold mb-2">Pas encore donateur ?</h3>
          <p className="text-muted-foreground mb-4">
            Proposez un don pour créer votre profil donateur
          </p>
          <Button onClick={() => navigate('/offrir-collections')}>
            <Plus className="mr-2 h-4 w-4" />
            Proposer un don
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              Espace Mécénat
            </CardTitle>
            <CardDescription>
              Gérez vos donations et propositions de dons
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/offrir-collections')} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Proposer un don
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {renderStats()}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="donations" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Donations
              {donations.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {donations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="proposals" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Propositions
              {proposals.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {proposals.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="donations">
            {renderDonations()}
          </TabsContent>

          <TabsContent value="proposals">
            {renderProposals()}
          </TabsContent>

          <TabsContent value="profile">
            {renderProfile()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
