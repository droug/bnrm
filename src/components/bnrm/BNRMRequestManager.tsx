import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Eye, 
  Download, 
  Send,
  UserCheck,
  Edit,
  Filter,
  Plus,
  BookOpen,
  Newspaper,
  Database,
  Archive
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DepositRequest {
  id: string;
  deposit_number?: string;
  submitter_id: string;
  deposit_type: 'monographie' | 'periodique' | 'audiovisuel' | 'numerique';
  status: 'brouillon' | 'soumis' | 'en_attente_validation_b' | 'valide_par_b' | 'rejete_par_b' | 'en_cours' | 'receptionne' | 'traite';
  submission_date: string;
  acknowledgment_date?: string;
  metadata: {
    declarant?: {
      name: string;
      type: 'editeur' | 'imprimeur' | 'auteur';
      organization: string;
      address: string;
      phone: string;
      email: string;
    };
    publication?: {
      title: string;
      author: string;
      isbn_issn?: string;
      publication_date: string;
      language: string;
      pages: number;
      format: string;
      edition: string;
    };
    validation?: {
      validator_id?: string;
      validation_date?: string;
      comments?: string;
      rejection_reason?: string;
    };
  };
  created_at: string;
  updated_at: string;
}

interface DepositForm {
  deposit_type: 'monographie' | 'periodique' | 'audiovisuel' | 'numerique';
  declarant: {
    name: string;
    type: 'editeur' | 'imprimeur' | 'auteur';
    organization: string;
    address: string;
    phone: string;
    email: string;
  };
  publication: {
    title: string;
    author: string;
    isbn_issn?: string;
    publication_date: string;
    language: string;
    pages: number;
    format: string;
    edition: string;
  };
  documents: string[];
}

export const BNRMRequestManager = () => {
  const [requests, setRequests] = useState<DepositRequest[]>([
    {
      id: "1",
      deposit_number: "DL-2025-001234",
      submitter_id: "user1",
      deposit_type: 'monographie',
      status: 'soumis',
      submission_date: "2025-01-15T10:30:00Z",
      metadata: {
        declarant: {
          name: "Ahmed Ben Ali",
          type: 'editeur',
          organization: "Éditions Al-Maarifa",
          address: "45 Avenue Mohammed V, Rabat",
          phone: "+212 5 37 12 34 56",
          email: "a.benali@almaarifa.ma"
        },
        publication: {
          title: "Histoire du Maroc Contemporain",
          author: "Dr. Fatima Zahra El Mansouri",
          isbn_issn: "978-9954-123-456-7",
          publication_date: "2025-01-10",
          language: "fr",
          pages: 324,
          format: "16x24 cm",
          edition: "1ère édition"
        }
      },
      created_at: "2025-01-15T10:30:00Z",
      updated_at: "2025-01-15T10:30:00Z"
    },
    {
      id: "2",
      deposit_number: "DL-2025-001235",
      submitter_id: "user2",
      deposit_type: 'periodique',
      status: 'soumis',
      submission_date: "2025-01-10T14:20:00Z",
      metadata: {
        declarant: {
          name: "Société de Presse Maghreb",
          type: 'editeur',
          organization: "Maghreb Media Group",
          address: "12 Rue des Journalistes, Casablanca",
          phone: "+212 5 22 98 76 54",
          email: "depot@maghrebmedia.ma"
        },
        publication: {
          title: "Revue Économique Marocaine - Janvier 2025",
          author: "Collectif",
          isbn_issn: "ISSN 2345-6789",
          publication_date: "2025-01-01",
          language: "fr",
          pages: 64,
          format: "21x29.7 cm",
          edition: "Vol. 12 N°1"
        }
      },
      created_at: "2025-01-10T14:20:00Z",
      updated_at: "2025-01-10T14:20:00Z"
    },
    {
      id: "3",
      deposit_number: "DL-2025-001236",
      submitter_id: "user3",
      deposit_type: 'monographie',
      status: 'valide_par_b',
      submission_date: "2025-01-05T11:00:00Z",
      acknowledgment_date: "2025-01-18T16:30:00Z",
      metadata: {
        declarant: {
          name: "Imprimerie Nationale",
          type: 'imprimeur',
          organization: "Imprimerie Nationale du Maroc",
          address: "Avenue Annakhil, Hay Riad, Rabat",
          phone: "+212 5 37 57 12 34",
          email: "depot@imprimerienationale.ma"
        },
        publication: {
          title: "Recueil des Textes Législatifs 2024",
          author: "Royaume du Maroc",
          publication_date: "2024-12-31",
          language: "fr",
          pages: 856,
          format: "A4",
          edition: "Édition officielle 2024"
        },
        validation: {
          validator_id: "admin1",
          validation_date: "2025-01-08T10:00:00Z",
          comments: "Publication officielle validée"
        }
      },
      created_at: "2025-01-05T11:00:00Z",
      updated_at: "2025-01-18T16:30:00Z"
    },
    {
      id: "4",
      deposit_number: "DL-2025-001237",
      submitter_id: "user4",
      deposit_type: 'audiovisuel',
      status: 'soumis',
      submission_date: "2025-01-18T09:45:00Z",
      metadata: {
        declarant: {
          name: "Productions Atlas Films",
          type: 'editeur',
          organization: "Atlas Films & Media",
          address: "Zone Industrielle Ain Sebaâ, Casablanca",
          phone: "+212 5 22 34 56 78",
          email: "depot@atlasfilms.ma"
        },
        publication: {
          title: "Documentaire: Patrimoine Architectural Marocain",
          author: "Réalisé par Youssef Bennani",
          publication_date: "2025-01-15",
          language: "ar",
          pages: 0,
          format: "DVD - 90 minutes",
          edition: "Version originale"
        }
      },
      created_at: "2025-01-18T09:45:00Z",
      updated_at: "2025-01-18T09:45:00Z"
    },
    {
      id: "5",
      deposit_number: "DL-2025-001238",
      submitter_id: "user5",
      deposit_type: 'numerique',
      status: 'soumis',
      submission_date: "2025-01-19T15:20:00Z",
      metadata: {
        declarant: {
          name: "Hassan Tazi",
          type: 'auteur',
          organization: "Auteur indépendant",
          address: "34 Rue Oued Souss, Agadir",
          phone: "+212 6 12 34 56 78",
          email: "h.tazi@email.ma"
        },
        publication: {
          title: "Guide Numérique du Tourisme Durable au Maroc",
          author: "Hassan Tazi",
          isbn_issn: "978-9954-789-012-3",
          publication_date: "2025-01-15",
          language: "fr",
          pages: 0,
          format: "E-book PDF",
          edition: "1ère édition numérique"
        }
      },
      created_at: "2025-01-19T15:20:00Z",
      updated_at: "2025-01-19T15:20:00Z"
    },
    {
      id: "6",
      deposit_number: "DL-2025-001239",
      submitter_id: "user6",
      deposit_type: 'monographie',
      status: 'soumis',
      submission_date: "2025-01-20T08:15:00Z",
      metadata: {
        declarant: {
          name: "Laila Benjelloun",
          type: 'editeur',
          organization: "Éditions Toubkal",
          address: "23 Rue Tarik Ibn Ziad, Casablanca",
          phone: "+212 5 22 44 55 66",
          email: "contact@editionstoubkal.ma"
        },
        publication: {
          title: "Poésie Contemporaine Marocaine",
          author: "Anthologie dirigée par Abdellatif Laâbi",
          publication_date: "2025-01-18",
          language: "ar",
          pages: 256,
          format: "14x21 cm",
          edition: "1ère édition"
        }
      },
      created_at: "2025-01-20T08:15:00Z",
      updated_at: "2025-01-20T08:15:00Z"
    },
    {
      id: "7",
      deposit_number: "DL-2025-001240",
      submitter_id: "user7",
      deposit_type: 'periodique',
      status: 'soumis',
      submission_date: "2025-01-20T11:30:00Z",
      metadata: {
        declarant: {
          name: "Mohamed Rachidi",
          type: 'editeur',
          organization: "Magazine Sciences & Vie Maroc",
          address: "15 Boulevard Zerktouni, Casablanca",
          phone: "+212 5 22 77 88 99",
          email: "redaction@sciencesvie.ma"
        },
        publication: {
          title: "Sciences & Vie Maroc - Février 2025",
          author: "Équipe de rédaction",
          isbn_issn: "ISSN 2458-7890",
          publication_date: "2025-02-01",
          language: "fr",
          pages: 98,
          format: "20x27 cm",
          edition: "N° 145"
        }
      },
      created_at: "2025-01-20T11:30:00Z",
      updated_at: "2025-01-20T11:30:00Z"
    },
    {
      id: "8",
      deposit_number: "DL-2025-001241",
      submitter_id: "user8",
      deposit_type: 'monographie',
      status: 'soumis',
      submission_date: "2025-01-20T14:45:00Z",
      metadata: {
        declarant: {
          name: "Karim El Fassi",
          type: 'auteur',
          organization: "Auto-édition",
          address: "78 Rue des FAR, Rabat",
          phone: "+212 6 61 23 45 67",
          email: "k.elfassi@gmail.com"
        },
        publication: {
          title: "L'Architecture Traditionnelle de Fès",
          author: "Karim El Fassi",
          publication_date: "2025-01-15",
          language: "fr",
          pages: 412,
          format: "21x29.7 cm",
          edition: "1ère édition"
        }
      },
      created_at: "2025-01-20T14:45:00Z",
      updated_at: "2025-01-20T14:45:00Z"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<DepositRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [validationComments, setValidationComments] = useState("");
  const [newRequestForm, setNewRequestForm] = useState<DepositForm>({
    deposit_type: 'monographie',
    declarant: {
      name: '',
      type: 'editeur',
      organization: '',
      address: '',
      phone: '',
      email: ''
    },
    publication: {
      title: '',
      author: '',
      isbn_issn: '',
      publication_date: '',
      language: 'fr',
      pages: 0,
      format: '',
      edition: ''
    },
    documents: []
  });
  const { toast } = useToast();

  useEffect(() => {
    // On ne charge pas depuis la base de données pour l'instant, on garde les données mockées
    // fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("legal_deposit_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Mapper les données de la base vers l'interface DepositRequest si nécessaire
      // Pour l'instant, on ne fait rien pour garder les données mockées
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewRequest = async () => {
    try {
      // Pour l'instant, on ajoute localement sans sauvegarder dans la base
      const user = await supabase.auth.getUser();
      const newRequest: DepositRequest = {
        id: `temp-${Date.now()}`,
        deposit_number: `DL-2025-${String(requests.length + 1).padStart(6, '0')}`,
        deposit_type: newRequestForm.deposit_type,
        status: 'brouillon',
        submitter_id: user.data.user?.id || 'anonymous',
        submission_date: new Date().toISOString(),
        metadata: {
          declarant: newRequestForm.declarant,
          publication: newRequestForm.publication
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setRequests(prev => [newRequest, ...prev]);
      setIsNewRequestOpen(false);
      setNewRequestForm({
        deposit_type: 'monographie',
        declarant: {
          name: '',
          type: 'editeur',
          organization: '',
          address: '',
          phone: '',
          email: ''
        },
        publication: {
          title: '',
          author: '',
          isbn_issn: '',
          publication_date: '',
          language: 'fr',
          pages: 0,
          format: '',
          edition: ''
        },
        documents: []
      });
      
      toast({
        title: "Succès",
        description: "Nouvelle demande créée avec succès",
      });
    } catch (error) {
      console.error("Error creating request:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la demande",
        variant: "destructive",
      });
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string, comments?: string) => {
    try {
      const user = await supabase.auth.getUser();
      
      // Mise à jour locale
      setRequests(prev => prev.map(req => {
        if (req.id === requestId) {
          const updatedMetadata = { ...req.metadata };
          
          if (comments || newStatus === 'valide_par_b' || newStatus === 'rejete_par_b') {
            updatedMetadata.validation = {
              validator_id: user.data.user?.id,
              validation_date: new Date().toISOString(),
              comments: comments,
              rejection_reason: newStatus === 'rejete_par_b' ? comments : undefined
            };
          }
          
          return {
            ...req,
            status: newStatus as DepositRequest['status'],
            acknowledgment_date: newStatus === 'receptionne' ? new Date().toISOString() : req.acknowledgment_date,
            metadata: updatedMetadata,
            updated_at: new Date().toISOString()
          };
        }
        return req;
      }));
      
      setValidationComments("");
      setIsDetailsOpen(false);
      
      toast({
        title: "Succès",
        description: "Statut mis à jour avec succès",
      });
    } catch (error) {
      console.error("Error updating request:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      brouillon: { color: "bg-gray-100 text-gray-800", label: "Brouillon", icon: FileText },
      soumis: { color: "bg-blue-100 text-blue-800", label: "Soumis", icon: Clock },
      en_attente_validation_b: { color: "bg-orange-100 text-orange-800", label: "En attente", icon: Clock },
      valide_par_b: { color: "bg-yellow-100 text-yellow-800", label: "Validé", icon: CheckCircle },
      en_cours: { color: "bg-indigo-100 text-indigo-800", label: "En cours", icon: Clock },
      receptionne: { color: "bg-purple-100 text-purple-800", label: "Réceptionné", icon: CheckCircle },
      traite: { color: "bg-green-100 text-green-800", label: "Traité", icon: CheckCircle },
      processed: { color: "bg-green-100 text-green-800", label: "Traité", icon: CheckCircle },
      rejete_par_b: { color: "bg-red-100 text-red-800", label: "Rejeté", icon: XCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.brouillon;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} font-medium`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getDepositTypeIcon = (type: string) => {
    switch (type) {
      case 'monographie': return BookOpen;
      case 'periodique': return Newspaper;
      case 'audiovisuel': return Database;
      case 'numerique': return Archive;
      default: return FileText;
    }
  };

  const getDepositTypeLabel = (type: string) => {
    const labels = {
      monographie: 'Monographie',
      periodique: 'Périodique',
      audiovisuel: 'Audiovisuel',
      numerique: 'Numérique'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchTerm === "" || 
      request.metadata?.publication?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.metadata?.declarant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.deposit_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesType = typeFilter === "all" || request.deposit_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des Demandes de Dépôt Légal</h2>
          <p className="text-muted-foreground">
            Gérer les demandes de dépôt légal selon les types de supports
          </p>
        </div>
        
        <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle demande
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle demande de dépôt légal</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Type de dépôt */}
              <div className="space-y-2">
                <Label htmlFor="deposit_type">Type de support</Label>
                <Select 
                  value={newRequestForm.deposit_type} 
                  onValueChange={(value: any) => setNewRequestForm(prev => ({ ...prev, deposit_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monographie">Monographie</SelectItem>
                    <SelectItem value="periodique">Périodique</SelectItem>
                    <SelectItem value="audiovisuel">Audiovisuel</SelectItem>
                    <SelectItem value="numerique">Numérique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Informations du déclarant */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations du déclarant</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="declarant_name">Nom complet</Label>
                    <Input
                      id="declarant_name"
                      value={newRequestForm.declarant.name}
                      onChange={(e) => setNewRequestForm(prev => ({
                        ...prev,
                        declarant: { ...prev.declarant, name: e.target.value }
                      }))}
                      placeholder="Nom du déclarant"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="declarant_type">Qualité</Label>
                    <Select 
                      value={newRequestForm.declarant.type} 
                      onValueChange={(value: any) => setNewRequestForm(prev => ({
                        ...prev,
                        declarant: { ...prev.declarant, type: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="editeur">Éditeur</SelectItem>
                        <SelectItem value="imprimeur">Imprimeur</SelectItem>
                        <SelectItem value="auteur">Auteur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organisation</Label>
                    <Input
                      id="organization"
                      value={newRequestForm.declarant.organization}
                      onChange={(e) => setNewRequestForm(prev => ({
                        ...prev,
                        declarant: { ...prev.declarant, organization: e.target.value }
                      }))}
                      placeholder="Nom de l'organisation"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={newRequestForm.declarant.phone}
                      onChange={(e) => setNewRequestForm(prev => ({
                        ...prev,
                        declarant: { ...prev.declarant, phone: e.target.value }
                      }))}
                      placeholder="Numéro de téléphone"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newRequestForm.declarant.email}
                    onChange={(e) => setNewRequestForm(prev => ({
                      ...prev,
                      declarant: { ...prev.declarant, email: e.target.value }
                    }))}
                    placeholder="Adresse email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse complète</Label>
                  <Textarea
                    id="address"
                    value={newRequestForm.declarant.address}
                    onChange={(e) => setNewRequestForm(prev => ({
                      ...prev,
                      declarant: { ...prev.declarant, address: e.target.value }
                    }))}
                    placeholder="Adresse complète du déclarant"
                    rows={3}
                  />
                </div>
              </div>

              {/* Informations de la publication */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations de la publication</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="publication_title">Titre de la publication</Label>
                    <Input
                      id="publication_title"
                      value={newRequestForm.publication.title}
                      onChange={(e) => setNewRequestForm(prev => ({
                        ...prev,
                        publication: { ...prev.publication, title: e.target.value }
                      }))}
                      placeholder="Titre complet"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="author">Auteur</Label>
                    <Input
                      id="author"
                      value={newRequestForm.publication.author}
                      onChange={(e) => setNewRequestForm(prev => ({
                        ...prev,
                        publication: { ...prev.publication, author: e.target.value }
                      }))}
                      placeholder="Nom de l'auteur"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="isbn_issn">ISBN/ISSN (si disponible)</Label>
                    <Input
                      id="isbn_issn"
                      value={newRequestForm.publication.isbn_issn}
                      onChange={(e) => setNewRequestForm(prev => ({
                        ...prev,
                        publication: { ...prev.publication, isbn_issn: e.target.value }
                      }))}
                      placeholder="ISBN ou ISSN"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="publication_date">Date de publication</Label>
                    <Input
                      id="publication_date"
                      type="date"
                      value={newRequestForm.publication.publication_date}
                      onChange={(e) => setNewRequestForm(prev => ({
                        ...prev,
                        publication: { ...prev.publication, publication_date: e.target.value }
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
                    <Select 
                      value={newRequestForm.publication.language} 
                      onValueChange={(value) => setNewRequestForm(prev => ({
                        ...prev,
                        publication: { ...prev.publication, language: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="ar">Arabe</SelectItem>
                        <SelectItem value="ber">Amazigh</SelectItem>
                        <SelectItem value="en">Anglais</SelectItem>
                        <SelectItem value="es">Espagnol</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pages">Nombre de pages</Label>
                    <Input
                      id="pages"
                      type="number"
                      value={newRequestForm.publication.pages}
                      onChange={(e) => setNewRequestForm(prev => ({
                        ...prev,
                        publication: { ...prev.publication, pages: parseInt(e.target.value) || 0 }
                      }))}
                      placeholder="Nombre de pages"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="format">Format</Label>
                    <Input
                      id="format"
                      value={newRequestForm.publication.format}
                      onChange={(e) => setNewRequestForm(prev => ({
                        ...prev,
                        publication: { ...prev.publication, format: e.target.value }
                      }))}
                      placeholder="Format (ex: 21x29.7cm)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edition">Édition</Label>
                    <Input
                      id="edition"
                      value={newRequestForm.publication.edition}
                      onChange={(e) => setNewRequestForm(prev => ({
                        ...prev,
                        publication: { ...prev.publication, edition: e.target.value }
                      }))}
                      placeholder="Numéro d'édition"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsNewRequestOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={createNewRequest}>
                  <Send className="w-4 h-4 mr-2" />
                  Créer la demande
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre, déclarant ou numéro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="brouillon">Brouillon</SelectItem>
            <SelectItem value="soumis">Soumis</SelectItem>
            <SelectItem value="en_attente_validation_b">En attente</SelectItem>
            <SelectItem value="valide_par_b">Validé</SelectItem>
            <SelectItem value="en_cours">En cours</SelectItem>
            <SelectItem value="receptionne">Réceptionné</SelectItem>
            <SelectItem value="traite">Traité</SelectItem>
            <SelectItem value="rejete_par_b">Rejeté</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="monographie">Monographie</SelectItem>
            <SelectItem value="periodique">Périodique</SelectItem>
            <SelectItem value="audiovisuel">Audiovisuel</SelectItem>
            <SelectItem value="numerique">Numérique</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Liste des demandes ({filteredRequests.length})</span>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Dépôt</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Déclarant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => {
                  const TypeIcon = getDepositTypeIcon(request.deposit_type);
                  return (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-sm">
                        {request.deposit_number || "En attente"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{getDepositTypeLabel(request.deposit_type)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {request.metadata?.publication?.title || "Sans titre"}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {request.metadata?.declarant?.name || "Non spécifié"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {request.metadata?.declarant?.organization}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(request.submission_date), "dd/MM/yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {request.status === 'soumis' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setIsDetailsOpen(true);
                                }}
                                title="Valider"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateRequestStatus(request.id, 'rejete_par_b', 'Demande incomplète')}
                                title="Rejeter"
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Détails de la demande - {selectedRequest?.deposit_number || "N° en attente"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList>
                <TabsTrigger value="details">Détails</TabsTrigger>
                <TabsTrigger value="validation">Validation</TabsTrigger>
                <TabsTrigger value="workflow">Workflow</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Informations du déclarant</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <strong>Nom:</strong> {selectedRequest.metadata?.declarant?.name}
                      </div>
                      <div>
                        <strong>Qualité:</strong> {selectedRequest.metadata?.declarant?.type}
                      </div>
                      <div>
                        <strong>Organisation:</strong> {selectedRequest.metadata?.declarant?.organization}
                      </div>
                      <div>
                        <strong>Email:</strong> {selectedRequest.metadata?.declarant?.email}
                      </div>
                      <div>
                        <strong>Téléphone:</strong> {selectedRequest.metadata?.declarant?.phone}
                      </div>
                      <div>
                        <strong>Adresse:</strong> {selectedRequest.metadata?.declarant?.address}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Informations de la publication</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <strong>Titre:</strong> {selectedRequest.metadata?.publication?.title}
                      </div>
                      <div>
                        <strong>Auteur:</strong> {selectedRequest.metadata?.publication?.author}
                      </div>
                      <div>
                        <strong>ISBN/ISSN:</strong> {selectedRequest.metadata?.publication?.isbn_issn || "Non attribué"}
                      </div>
                      <div>
                        <strong>Date de publication:</strong> {selectedRequest.metadata?.publication?.publication_date}
                      </div>
                      <div>
                        <strong>Langue:</strong> {selectedRequest.metadata?.publication?.language}
                      </div>
                      <div>
                        <strong>Pages:</strong> {selectedRequest.metadata?.publication?.pages}
                      </div>
                      <div>
                        <strong>Format:</strong> {selectedRequest.metadata?.publication?.format}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="validation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Statut de validation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Statut actuel:</span>
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                    
                    {selectedRequest.metadata?.validation && (
                      <div className="space-y-2">
                        <div>
                          <strong>Validé le:</strong> {selectedRequest.metadata.validation.validation_date && format(new Date(selectedRequest.metadata.validation.validation_date), "dd/MM/yyyy HH:mm", { locale: fr })}
                        </div>
                        {selectedRequest.metadata.validation.comments && (
                          <div>
                            <strong>Commentaires:</strong> {selectedRequest.metadata.validation.comments}
                          </div>
                        )}
                        {selectedRequest.metadata.validation.rejection_reason && (
                          <div>
                            <strong>Raison du rejet:</strong> {selectedRequest.metadata.validation.rejection_reason}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {(selectedRequest.status === 'soumis' || selectedRequest.status === 'en_attente_validation_b') && (
                      <div className="space-y-4 pt-4 border-t mt-4">
                        <h4 className="font-semibold text-lg">Actions de validation</h4>
                        <div className="space-y-2">
                          <Label htmlFor="validation-comments">Commentaire (optionnel)</Label>
                          <Textarea 
                            placeholder="Ajouter un commentaire de validation..."
                            id="validation-comments"
                            value={validationComments}
                            onChange={(e) => setValidationComments(e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            onClick={() => {
                              updateRequestStatus(selectedRequest.id, 'valide_par_b', validationComments);
                              setValidationComments("");
                              setIsDetailsOpen(false);
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Valider la demande
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => {
                              updateRequestStatus(selectedRequest.id, 'rejete_par_b', validationComments || 'Demande rejetée');
                              setValidationComments("");
                              setIsDetailsOpen(false);
                            }}
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rejeter la demande
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="workflow" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Progression du workflow</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">Demande soumise</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(selectedRequest.submission_date), "dd/MM/yyyy HH:mm", { locale: fr })}
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex items-center space-x-3 ${selectedRequest.status === 'valide_par_b' || selectedRequest.status === 'en_cours' || selectedRequest.status === 'traite' || selectedRequest.status === 'receptionne' ? '' : 'opacity-50'}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${selectedRequest.status === 'valide_par_b' || selectedRequest.status === 'en_cours' || selectedRequest.status === 'traite' || selectedRequest.status === 'receptionne' ? 'bg-green-500' : 'bg-gray-300'}`}>
                          {selectedRequest.status === 'valide_par_b' || selectedRequest.status === 'en_cours' || selectedRequest.status === 'traite' || selectedRequest.status === 'receptionne' ? (
                            <CheckCircle className="w-3 h-3 text-white" />
                          ) : (
                            <Clock className="w-3 h-3 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">Validation de la demande</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedRequest.metadata?.validation?.validation_date ? 
                              format(new Date(selectedRequest.metadata.validation.validation_date), "dd/MM/yyyy HH:mm", { locale: fr }) :
                              "En attente"
                            }
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex items-center space-x-3 ${selectedRequest.status === 'en_cours' || selectedRequest.status === 'traite' || selectedRequest.status === 'receptionne' ? '' : 'opacity-50'}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${selectedRequest.status === 'en_cours' || selectedRequest.status === 'traite' || selectedRequest.status === 'receptionne' ? 'bg-green-500' : 'bg-gray-300'}`}>
                          {selectedRequest.status === 'en_cours' || selectedRequest.status === 'traite' || selectedRequest.status === 'receptionne' ? (
                            <CheckCircle className="w-3 h-3 text-white" />
                          ) : (
                            <Clock className="w-3 h-3 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">Attribution des numéros</div>
                          <div className="text-sm text-muted-foreground">En attente</div>
                        </div>
                      </div>
                      
                      <div className={`flex items-center space-x-3 ${selectedRequest.status === 'receptionne' ? '' : 'opacity-50'}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${selectedRequest.status === 'receptionne' ? 'bg-green-500' : 'bg-gray-300'}`}>
                          {selectedRequest.status === 'receptionne' ? (
                            <CheckCircle className="w-3 h-3 text-white" />
                          ) : (
                            <Clock className="w-3 h-3 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">Accusé de réception envoyé</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedRequest.acknowledgment_date ? 
                              format(new Date(selectedRequest.acknowledgment_date), "dd/MM/yyyy HH:mm", { locale: fr }) :
                              "En attente"
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};