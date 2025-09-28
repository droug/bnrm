import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  Building, 
  Mail,
  Phone,
  MapPin,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Professional {
  id: string;
  professional_type: 'editeur' | 'producteur' | 'imprimeur';
  company_name: string;
  contact_person: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  registration_number?: string;
  last_dl_number?: string;
  is_verified: boolean;
  verification_date?: string;
  created_at: string;
  updated_at: string;
}

const professionalTypeLabels = {
  editeur: "Éditeur",
  producteur: "Producteur", 
  imprimeur: "Imprimeur"
};

export const ProfessionalRegistryManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    professional_type: "",
    is_verified: "",
    city: ""
  });

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    editeurs: 0,
    producteurs: 0,
    imprimeurs: 0,
    verified: 0,
    pending: 0
  });

  useEffect(() => {
    fetchProfessionals();
    fetchStats();
  }, [filters]);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('professional_registry')
        .select('*')
        .order('created_at', { ascending: false });

      // Appliquer les filtres
      if (filters.search) {
        query = query.or(`company_name.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }
      
      if (filters.professional_type) {
        query = query.eq('professional_type', filters.professional_type as any);
      }
      
      if (filters.is_verified) {
        query = query.eq('is_verified', filters.is_verified === 'true');
      }
      
      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des professionnels:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le référentiel des professionnels",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('professional_registry')
        .select('professional_type, is_verified');

      if (error) throw error;

      const newStats = {
        total: data?.length || 0,
        editeurs: data?.filter(p => p.professional_type === 'editeur').length || 0,
        producteurs: data?.filter(p => p.professional_type === 'producteur').length || 0,
        imprimeurs: data?.filter(p => p.professional_type === 'imprimeur').length || 0,
        verified: data?.filter(p => p.is_verified).length || 0,
        pending: data?.filter(p => !p.is_verified).length || 0
      };

      setStats(newStats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const updateProfessionalVerification = async (professionalId: string, isVerified: boolean) => {
    try {
      const { error } = await supabase
        .from('professional_registry')
        .update({ 
          is_verified: isVerified,
          verification_date: isVerified ? new Date().toISOString() : null
        })
        .eq('id', professionalId);

      if (error) throw error;

      toast({
        title: isVerified ? "Professionnel vérifié" : "Vérification révoquée",
        description: `Le statut de vérification a été mis à jour`,
      });

      fetchProfessionals();
      fetchStats();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de vérification",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Référentiel National des Professionnels</h2>
          <p className="text-muted-foreground">Gestion des éditeurs, producteurs et imprimeurs</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchProfessionals} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un professionnel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau professionnel</DialogTitle>
              </DialogHeader>
              <CreateProfessionalForm 
                onSuccess={() => {
                  setIsCreateDialogOpen(false);
                  fetchProfessionals();
                  fetchStats();
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Éditeurs</CardTitle>
            <Building className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.editeurs}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Producteurs</CardTitle>
            <Building className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.producteurs}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Imprimeurs</CardTitle>
            <Building className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.imprimeurs}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vérifiés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <XCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres de recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <Select 
              value={filters.professional_type} 
              onValueChange={(value) => setFilters({ ...filters, professional_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type de professionnel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les types</SelectItem>
                <SelectItem value="editeur">Éditeur</SelectItem>
                <SelectItem value="producteur">Producteur</SelectItem>
                <SelectItem value="imprimeur">Imprimeur</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.is_verified} 
              onValueChange={(value) => setFilters({ ...filters, is_verified: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Statut de vérification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous</SelectItem>
                <SelectItem value="true">Vérifiés</SelectItem>
                <SelectItem value="false">En attente</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Ville"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            />
            
            <Button 
              onClick={() => setFilters({ search: "", professional_type: "", is_verified: "", city: "" })}
              variant="outline"
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des professionnels */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des professionnels</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Société</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Chargement des professionnels...
                  </TableCell>
                </TableRow>
              ) : professionals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucun professionnel trouvé
                  </TableCell>
                </TableRow>
              ) : (
                professionals.map((professional) => (
                  <TableRow key={professional.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{professional.company_name}</p>
                        <p className="text-sm text-muted-foreground">{professional.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{professional.contact_person}</p>
                        {professional.phone && (
                          <p className="text-sm text-muted-foreground">{professional.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {professionalTypeLabels[professional.professional_type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {professional.city && <p>{professional.city}</p>}
                        {professional.postal_code && (
                          <p className="text-muted-foreground">{professional.postal_code}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={professional.is_verified ? "default" : "secondary"}
                        className={professional.is_verified ? "bg-green-500" : "bg-orange-500"}
                      >
                        {professional.is_verified ? "Vérifié" : "En attente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(professional.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedProfessional(professional)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Détails du professionnel</DialogTitle>
                            </DialogHeader>
                            <ProfessionalDetailsModal 
                              professional={professional} 
                              onUpdateVerification={updateProfessionalVerification}
                            />
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant={professional.is_verified ? "secondary" : "default"}
                          size="sm"
                          onClick={() => updateProfessionalVerification(professional.id, !professional.is_verified)}
                        >
                          {professional.is_verified ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Composant pour créer un nouveau professionnel
const CreateProfessionalForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    professional_type: '',
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    registration_number: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('professional_registry')
        .insert([formData as any]);

      if (error) throw error;

      toast({
        title: "Professionnel ajouté",
        description: "Le nouveau professionnel a été ajouté au référentiel",
      });

      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le professionnel",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="professional_type">Type de professionnel *</Label>
          <Select 
            value={formData.professional_type} 
            onValueChange={(value) => setFormData({ ...formData, professional_type: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner le type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="editeur">Éditeur</SelectItem>
              <SelectItem value="producteur">Producteur</SelectItem>
              <SelectItem value="imprimeur">Imprimeur</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="company_name">Nom de la société *</Label>
          <Input
            id="company_name"
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="contact_person">Personne de contact *</Label>
          <Input
            id="contact_person"
            value={formData.contact_person}
            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
            required
          />
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
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="registration_number">Numéro d'enregistrement</Label>
          <Input
            id="registration_number"
            value={formData.registration_number}
            onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
            placeholder="Ex: CNDP..."
          />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="address">Adresse</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="city">Ville</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="postal_code">Code postal</Label>
          <Input
            id="postal_code"
            value={formData.postal_code}
            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button type="submit">Créer le professionnel</Button>
      </div>
    </form>
  );
};

// Composant pour afficher les détails d'un professionnel
const ProfessionalDetailsModal = ({ 
  professional, 
  onUpdateVerification 
}: { 
  professional: Professional;
  onUpdateVerification: (id: string, verified: boolean) => void;
}) => {
  return (
    <Tabs defaultValue="details">
      <TabsList>
        <TabsTrigger value="details">Informations</TabsTrigger>
        <TabsTrigger value="deposits">Dépôts légaux</TabsTrigger>
        <TabsTrigger value="verification">Vérification</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Informations générales</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Société:</strong> {professional.company_name}</p>
              <p><strong>Type:</strong> {professionalTypeLabels[professional.professional_type]}</p>
              <p><strong>Contact:</strong> {professional.contact_person}</p>
              <p><strong>Email:</strong> {professional.email}</p>
              {professional.phone && <p><strong>Téléphone:</strong> {professional.phone}</p>}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Localisation</h4>
            <div className="space-y-2 text-sm">
              {professional.address && <p><strong>Adresse:</strong> {professional.address}</p>}
              {professional.city && <p><strong>Ville:</strong> {professional.city}</p>}
              {professional.postal_code && <p><strong>Code postal:</strong> {professional.postal_code}</p>}
              {professional.registration_number && (
                <p><strong>N° d'enregistrement:</strong> {professional.registration_number}</p>
              )}
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="deposits">
        <p className="text-muted-foreground">Historique des dépôts légaux de ce professionnel...</p>
      </TabsContent>
      
      <TabsContent value="verification" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Statut de vérification</h4>
            <p className="text-sm text-muted-foreground">
              {professional.is_verified ? "Ce professionnel a été vérifié" : "Ce professionnel n'a pas encore été vérifié"}
            </p>
          </div>
          <Button 
            variant={professional.is_verified ? "secondary" : "default"}
            onClick={() => onUpdateVerification(professional.id, !professional.is_verified)}
          >
            {professional.is_verified ? "Révoquer la vérification" : "Vérifier ce professionnel"}
          </Button>
        </div>
        
        {professional.verification_date && (
          <p className="text-sm text-muted-foreground">
            Vérifié le {new Date(professional.verification_date).toLocaleDateString('fr-FR')}
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ProfessionalRegistryManager;