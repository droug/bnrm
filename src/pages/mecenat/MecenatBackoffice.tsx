import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { 
  useDonors, 
  useDonations, 
  useDonationProposals, 
  useMecenatMutations,
  type Donor,
  type Donation,
  type DonationProposal
} from "@/hooks/useMecenat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { 
  Search, 
  Users, 
  Heart, 
  FileText, 
  Filter, 
  Plus, 
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Calendar,
  Building2,
  User,
  ArrowLeft,
  Award,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: "En attente", icon: Clock, color: "bg-amber-100 text-amber-800" },
  accepted: { label: "Acceptée", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  cataloged: { label: "Cataloguée", icon: Package, color: "bg-blue-100 text-blue-800" },
  rejected: { label: "Refusée", icon: XCircle, color: "bg-red-100 text-red-800" },
  archived: { label: "Archivée", icon: Package, color: "bg-gray-100 text-gray-800" },
  submitted: { label: "Soumise", icon: Clock, color: "bg-blue-100 text-blue-800" },
  under_review: { label: "En examen", icon: Clock, color: "bg-amber-100 text-amber-800" },
  converted: { label: "Convertie", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  active: { label: "Actif", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  inactive: { label: "Inactif", icon: XCircle, color: "bg-gray-100 text-gray-800" }
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

function DonorsTab() {
  const { data: donors = [], isLoading } = useDonors();
  const { updateDonor } = useMecenatMutations();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  const filteredDonors = donors.filter(d => {
    const matchesSearch = !search || 
      d.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.organization_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase());
    const matchesType = !filterType || d.donor_type === filterType;
    const matchesStatus = !filterStatus || d.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleToggleFeatured = async (donor: Donor) => {
    await updateDonor.mutateAsync({ id: donor.id, is_featured: !donor.is_featured });
  };

  const getDisplayName = (donor: Donor) => 
    donor.donor_type === 'individual' 
      ? `${donor.first_name} ${donor.last_name}` 
      : donor.organization_name;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Référentiel des donateurs
            </CardTitle>
            <CardDescription>{donors.length} donateurs enregistrés</CardDescription>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un donateur
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les types</SelectItem>
              <SelectItem value="individual">Particulier</SelectItem>
              <SelectItem value="institution">Institution</SelectItem>
              <SelectItem value="association">Association</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les statuts</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donateur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Mécène d'honneur</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonors.map((donor) => {
                  const status = statusConfig[donor.status] || statusConfig.active;
                  return (
                    <TableRow key={donor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={donor.photo_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {donor.donor_type === 'individual'
                                ? `${donor.first_name?.[0]}${donor.last_name?.[0]}`
                                : donor.organization_name?.substring(0, 2)
                              }
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{getDisplayName(donor)}</div>
                            <div className="text-xs text-muted-foreground">{donor.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {donor.donor_type === 'individual' ? <User className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                          <span className="text-sm capitalize">{donor.donor_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={status.color}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={donor.is_featured}
                          onCheckedChange={() => handleToggleFeatured(donor)}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(donor.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedDonor(donor)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DonationsTab() {
  const { data: donations = [], isLoading } = useDonations();
  const { updateDonation } = useMecenatMutations();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");

  const filteredDonations = donations.filter(d => {
    const matchesSearch = !search || 
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.donation_number?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filterStatus || d.status === filterStatus;
    const matchesType = !filterType || d.support_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getDisplayName = (donor: Donor) => 
    donor.donor_type === 'individual' 
      ? `${donor.first_name} ${donor.last_name}` 
      : donor.organization_name;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Référentiel des donations
            </CardTitle>
            <CardDescription>{donations.length} donations enregistrées</CardDescription>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Enregistrer une donation
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre ou numéro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type de support" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les types</SelectItem>
              {Object.entries(supportTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="accepted">Acceptée</SelectItem>
              <SelectItem value="cataloged">Cataloguée</SelectItem>
              <SelectItem value="rejected">Refusée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Donation</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Donateur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonations.map((donation) => {
                  const status = statusConfig[donation.status] || statusConfig.pending;
                  return (
                    <TableRow key={donation.id}>
                      <TableCell>
                        <Badge variant="secondary">{donation.donation_number}</Badge>
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {donation.title}
                      </TableCell>
                      <TableCell>
                        {donation.donor && getDisplayName(donation.donor)}
                      </TableCell>
                      <TableCell>
                        {supportTypeLabels[donation.support_type] || donation.support_type}
                      </TableCell>
                      <TableCell>{donation.estimated_quantity || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={status.color}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {donation.donation_date 
                          ? new Date(donation.donation_date).toLocaleDateString('fr-FR')
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProposalsTab() {
  const { data: proposals = [], isLoading } = useDonationProposals();
  const { updateProposal } = useMecenatMutations();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedProposal, setSelectedProposal] = useState<DonationProposal | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const filteredProposals = proposals.filter(p => {
    const matchesSearch = !search || 
      p.first_name.toLowerCase().includes(search.toLowerCase()) ||
      p.last_name.toLowerCase().includes(search.toLowerCase()) ||
      p.proposal_number?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filterStatus || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (proposal: DonationProposal, newStatus: string) => {
    await updateProposal.mutateAsync({
      id: proposal.id,
      status: newStatus as DonationProposal['status'],
      review_notes: reviewNotes,
      reviewed_at: new Date().toISOString()
    });
    setSelectedProposal(null);
    setReviewNotes("");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Propositions de dons
              </CardTitle>
              <CardDescription>
                {proposals.filter(p => p.status === 'submitted').length} propositions en attente de traitement
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="submitted">Soumise</SelectItem>
                <SelectItem value="under_review">En examen</SelectItem>
                <SelectItem value="accepted">Acceptée</SelectItem>
                <SelectItem value="rejected">Refusée</SelectItem>
                <SelectItem value="converted">Convertie</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <div className="space-y-4">
              {filteredProposals.map((proposal) => {
                const status = statusConfig[proposal.status] || statusConfig.submitted;
                const StatusIcon = status.icon;
                return (
                  <motion.div
                    key={proposal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="p-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{proposal.proposal_number}</Badge>
                            <Badge variant="outline" className={status.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                          <h4 className="font-medium">
                            {proposal.first_name} {proposal.last_name}
                            {proposal.organization_name && ` - ${proposal.organization_name}`}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {proposal.collection_description}
                          </p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {supportTypeLabels[proposal.support_type] || proposal.support_type}
                            </span>
                            {proposal.estimated_books_count && (
                              <span>~{proposal.estimated_books_count} ouvrages</span>
                            )}
                            {proposal.oldest_item_date && (
                              <span>Ouvrage le plus ancien: {proposal.oldest_item_date}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(proposal.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedProposal(proposal)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Examiner
                          </Button>
                          {proposal.status === 'submitted' && (
                            <>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleUpdateStatus(proposal, 'under_review')}
                              >
                                Prendre en charge
                              </Button>
                            </>
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

      {/* Review Dialog */}
      <Dialog open={!!selectedProposal} onOpenChange={() => setSelectedProposal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Examiner la proposition {selectedProposal?.proposal_number}</DialogTitle>
          </DialogHeader>
          {selectedProposal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Proposant</Label>
                  <p className="font-medium">
                    {selectedProposal.first_name} {selectedProposal.last_name}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Contact</Label>
                  <p>{selectedProposal.email}</p>
                  <p>{selectedProposal.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type de support</Label>
                  <p>{supportTypeLabels[selectedProposal.support_type]}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Volumétrie estimée</Label>
                  <p>{selectedProposal.estimated_books_count || '-'} ouvrages</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Description de la collection</Label>
                <p className="mt-1">{selectedProposal.collection_description}</p>
              </div>
              {selectedProposal.historical_value && (
                <div>
                  <Label className="text-muted-foreground">Valeur historique</Label>
                  <p className="mt-1">{selectedProposal.historical_value}</p>
                </div>
              )}
              <div>
                <Label>Notes d'examen</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Ajoutez vos observations..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedProposal(null)}>
              Fermer
            </Button>
            {selectedProposal?.status !== 'rejected' && selectedProposal?.status !== 'accepted' && (
              <>
                <Button 
                  variant="destructive"
                  onClick={() => selectedProposal && handleUpdateStatus(selectedProposal, 'rejected')}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Refuser
                </Button>
                <Button 
                  onClick={() => selectedProposal && handleUpdateStatus(selectedProposal, 'accepted')}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Accepter
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function MecenatBackoffice() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { hasRole } = useSecureRoles();
  const { data: donors = [] } = useDonors();
  const { data: donations = [] } = useDonations();
  const { data: proposals = [] } = useDonationProposals();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || (!hasRole('admin') && !hasRole('librarian'))) {
    navigate('/');
    return null;
  }

  const pendingProposals = proposals.filter(p => p.status === 'submitted' || p.status === 'under_review');

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/settings')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'administration
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Heart className="h-8 w-8 text-primary" />
            Gestion du Mécénat
          </h1>
          <p className="text-muted-foreground mt-1">
            Référentiel des donateurs, donations et propositions de dons
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{donors.length}</div>
                <div className="text-sm text-muted-foreground">Donateurs</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Award className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {donors.filter(d => d.is_featured).length}
                </div>
                <div className="text-sm text-muted-foreground">Mécènes d'honneur</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-500/5 to-green-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Heart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{donations.length}</div>
                <div className="text-sm text-muted-foreground">Donations</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{pendingProposals.length}</div>
                <div className="text-sm text-muted-foreground">Propositions en attente</div>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="donors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="donors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Donateurs
            </TabsTrigger>
            <TabsTrigger value="donations" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Donations
            </TabsTrigger>
            <TabsTrigger value="proposals" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Propositions
              {pendingProposals.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {pendingProposals.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="donors">
            <DonorsTab />
          </TabsContent>

          <TabsContent value="donations">
            <DonationsTab />
          </TabsContent>

          <TabsContent value="proposals">
            <ProposalsTab />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
