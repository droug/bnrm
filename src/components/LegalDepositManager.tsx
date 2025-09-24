import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText, CheckCircle, XCircle, Clock, AlertCircle, Eye, Download, ArrowRight, Check, Circle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import logigrammeImage from "@/assets/logigramme-depot-legal.png";

interface LegalDeposit {
  id: string;
  deposit_number: string;
  content_id: string;
  submitter_id: string;
  deposit_type: string;
  status: string;
  submission_date: string;
  acknowledgment_date?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface DepositRequest {
  id: string;
  declarant_name: string;
  publication_title: string;
  publication_type: 'monographie' | 'periodique';
  isbn_issn?: string;
  status: 'pending' | 'validated' | 'rejected' | 'processed';
  submission_date: string;
  documents_deposited: boolean;
  dl_number?: string;
  metadata: any;
}

const LegalDepositWorkflow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const workflowSteps = [
    {
      id: "E0",
      title: "Réception de la Demande",
      description: "Le déclarant soumet sa demande de dépôt légal",
      details: [
        "Vérification de la complétude du formulaire",
        "Contrôle des informations obligatoires",
        "Validation de l'identité du déclarant"
      ],
      status: "completed"
    },
    {
      id: "E1",
      title: "Traitement de la Demande",
      description: "Validation et saisie système des informations",
      details: [
        "Saisie des métadonnées dans le système",
        "Validation du contenu de la demande",
        "Vérification de la conformité réglementaire"
      ],
      status: "completed"
    },
    {
      id: "E2",
      title: "Attribution N° DL et ISBN/ISSN",
      description: "Attribution des identifiants officiels",
      details: [
        "Génération du numéro de dépôt légal",
        "Attribution ISBN pour les monographies",
        "Attribution ISSN pour les périodiques",
        "Enregistrement dans la base nationale"
      ],
      status: "current"
    },
    {
      id: "E3",
      title: "Notification au Déclarant",
      description: "Envoi de l'accusé de réception avec numéros",
      details: [
        "Préparation de l'accusé de réception",
        "Envoi des identifiants au déclarant",
        "Archivage de la correspondance"
      ],
      status: "pending"
    },
    {
      id: "E4",
      title: "Attente des Documents",
      description: "Réception des exemplaires physiques ou numériques",
      details: [
        "Surveillance des délais de dépôt",
        "Réception des exemplaires",
        "Contrôle de conformité"
      ],
      status: "pending"
    },
    {
      id: "E5",
      title: "Vérification Conformité",
      description: "Contrôle de la conformité des documents déposés",
      details: [
        "Vérification de la correspondance avec la demande",
        "Contrôle qualité des exemplaires",
        "Validation des métadonnées"
      ],
      status: "pending"
    },
    {
      id: "E6",
      title: "Traitement Catalogage",
      description: "Catalogage et indexation des documents",
      details: [
        "Création de la notice bibliographique",
        "Indexation matière",
        "Attribution des cotes de classement"
      ],
      status: "pending"
    },
    {
      id: "E7",
      title: "Archivage Physique",
      description: "Stockage et conservation des exemplaires",
      details: [
        "Étiquetage et conditionnement",
        "Rangement en magasin",
        "Mise à jour des localisations"
      ],
      status: "pending"
    },
    {
      id: "E8",
      title: "Finalisation",
      description: "Clôture du processus de dépôt légal",
      details: [
        "Validation finale du dossier",
        "Archivage des documents administratifs",
        "Mise à disposition au public"
      ],
      status: "pending"
    }
  ];

  const getStepIcon = (step: any, index: number) => {
    if (step.status === "completed") {
      return <Check className="w-5 h-5 text-white" />;
    } else if (step.status === "current") {
      return <Circle className="w-5 h-5 text-white fill-current" />;
    } else {
      return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStepColor = (step: any) => {
    switch (step.status) {
      case "completed":
        return "bg-green-500";
      case "current":
        return "bg-blue-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stepper Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workflow de Dépôt Légal</h3>
          <p className="text-sm text-muted-foreground">
            Étape {workflowSteps.findIndex(s => s.status === "current") + 1} sur {workflowSteps.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground">Terminé</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground">En cours</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-xs text-muted-foreground">En attente</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${((workflowSteps.findIndex(s => s.status === "current") + 1) / workflowSteps.length) * 100}%` }}
        ></div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {workflowSteps.map((step, index) => (
          <div key={step.id} className="flex gap-4">
            {/* Step Icon */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStepColor(step)}`}>
                {getStepIcon(step, index)}
              </div>
              {index < workflowSteps.length - 1 && (
                <div className="w-px h-12 bg-gray-200 mt-2"></div>
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 pb-8">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold">{step.id}: {step.title}</h4>
                <Badge variant={step.status === "completed" ? "default" : step.status === "current" ? "secondary" : "outline"}>
                  {step.status === "completed" ? "Terminé" : step.status === "current" ? "En cours" : "En attente"}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mb-3">{step.description}</p>
              
              {/* Step Details */}
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Activités :</p>
                <ul className="space-y-1">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="text-xs text-muted-foreground flex items-center gap-2">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          Dernière mise à jour: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr })}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter le processus
          </Button>
          <Button size="sm">
            Avancer à l'étape suivante
          </Button>
        </div>
      </div>
    </div>
  );
};

const LegalDepositManager = () => {
  const [deposits, setDeposits] = useState<LegalDeposit[]>([]);
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedDeposit, setSelectedDeposit] = useState<LegalDeposit | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const { data, error } = await supabase
        .from("legal_deposits")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDeposits(data || []);
    } catch (error) {
      console.error("Error fetching deposits:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les dépôts légaux",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDepositStatus = async (depositId: string, newStatus: string, metadata?: any) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'acknowledged') {
        updateData.acknowledgment_date = new Date().toISOString();
      }
      
      if (metadata) {
        updateData.metadata = metadata;
      }

      const { error } = await supabase
        .from("legal_deposits")
        .update(updateData)
        .eq("id", depositId);

      if (error) throw error;

      await fetchDeposits();
      toast({
        title: "Succès",
        description: "Statut mis à jour avec succès",
      });
    } catch (error) {
      console.error("Error updating deposit:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const generateDepositNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_deposit_number');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error generating deposit number:", error);
      return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: { color: "bg-blue-100 text-blue-800", label: "Soumis", icon: Clock },
      validated: { color: "bg-yellow-100 text-yellow-800", label: "Validé", icon: AlertCircle },
      processed: { color: "bg-green-100 text-green-800", label: "Traité", icon: CheckCircle },
      acknowledged: { color: "bg-purple-100 text-purple-800", label: "Accusé", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejeté", icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      monographie: { color: "bg-emerald-100 text-emerald-800", label: "Monographie" },
      periodique: { color: "bg-orange-100 text-orange-800", label: "Périodique" },
      document: { color: "bg-gray-100 text-gray-800", label: "Document" },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.document;

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const filteredDeposits = deposits.filter((deposit) => {
    const matchesSearch = 
      deposit.deposit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.deposit_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || deposit.status === statusFilter;
    const matchesType = typeFilter === "all" || deposit.deposit_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des dépôts légaux...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion du Dépôt Légal</h2>
          <p className="text-muted-foreground">
            Système de gestion des demandes et procédures de dépôt légal BNRM
          </p>
        </div>
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="requests">Demandes</TabsTrigger>
          <TabsTrigger value="process">Processus</TabsTrigger>
          <TabsTrigger value="deposits">Dépôts</TabsTrigger>
          <TabsTrigger value="statistics">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Demandes de Dépôt Légal
              </CardTitle>
              <CardDescription>
                Gestion des demandes selon le processus E0-E1 (Réception et traitement)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par numéro de dépôt, type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="submitted">Soumis</SelectItem>
                    <SelectItem value="validated">Validé</SelectItem>
                    <SelectItem value="processed">Traité</SelectItem>
                    <SelectItem value="acknowledged">Accusé</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="monographie">Monographie</SelectItem>
                    <SelectItem value="periodique">Périodique</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Dépôt</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date de soumission</TableHead>
                      <TableHead>Date d'accusé</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeposits.map((deposit) => (
                      <TableRow key={deposit.id}>
                        <TableCell className="font-medium">
                          {deposit.deposit_number || "En attente"}
                        </TableCell>
                        <TableCell>{getTypeBadge(deposit.deposit_type)}</TableCell>
                        <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                        <TableCell>
                          {format(new Date(deposit.submission_date), "dd/MM/yyyy HH:mm", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          {deposit.acknowledgment_date 
                            ? format(new Date(deposit.acknowledgment_date), "dd/MM/yyyy HH:mm", { locale: fr })
                            : "-"
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedDeposit(deposit)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    Détails du dépôt {selectedDeposit?.deposit_number}
                                  </DialogTitle>
                                </DialogHeader>
                                {selectedDeposit && (
                                  <DepositDetails 
                                    deposit={selectedDeposit} 
                                    onStatusUpdate={updateDepositStatus}
                                  />
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            {deposit.status === 'submitted' && (
                              <Button
                                size="sm"
                                onClick={() => updateDepositStatus(deposit.id, 'validated')}
                              >
                                Valider
                              </Button>
                            )}
                            
                            {deposit.status === 'validated' && (
                              <Button
                                size="sm"
                                onClick={() => updateDepositStatus(deposit.id, 'processed')}
                              >
                                Traiter
                              </Button>
                            )}
                            
                            {deposit.status === 'processed' && (
                              <Button
                                size="sm"
                                onClick={() => updateDepositStatus(deposit.id, 'acknowledged')}
                              >
                                Accusé
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="process" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow du Processus de Dépôt Légal</CardTitle>
              <CardDescription>
                Processus complet de gestion du dépôt légal selon la procédure BNRM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LegalDepositWorkflow />
              
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Logigramme de référence :</h3>
                <div className="text-center">
                  <img 
                    src={logigrammeImage} 
                    alt="Logigramme du processus de dépôt légal"
                    className="max-w-full h-auto mx-auto border rounded-lg shadow-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Dépôts</CardTitle>
              <CardDescription>
                Consultation de tous les dépôts légaux traités
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-2xl font-bold">{deposits.length}</p>
                        </div>
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">En attente</p>
                          <p className="text-2xl font-bold">
                            {deposits.filter(d => d.status === 'submitted').length}
                          </p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Traités</p>
                          <p className="text-2xl font-bold">
                            {deposits.filter(d => d.status === 'processed').length}
                          </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Accusés</p>
                          <p className="text-2xl font-bold">
                            {deposits.filter(d => d.status === 'acknowledged').length}
                          </p>
                        </div>
                        <Download className="w-8 h-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques du Dépôt Légal</CardTitle>
              <CardDescription>
                Analyse et métriques des dépôts légaux
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Module de statistiques en cours de développement</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Composant pour les détails d'un dépôt
const DepositDetails = ({ 
  deposit, 
  onStatusUpdate 
}: { 
  deposit: LegalDeposit;
  onStatusUpdate: (id: string, status: string, metadata?: any) => void;
}) => {
  const [comments, setComments] = useState("");
  const [isbnIssn, setIsbnIssn] = useState("");

  const handleAttributeNumber = async () => {
    const newMetadata = {
      ...deposit.metadata,
      isbn_issn: isbnIssn,
      attribution_date: new Date().toISOString(),
      comments
    };
    
    await onStatusUpdate(deposit.id, 'processed', newMetadata);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: { color: "bg-blue-100 text-blue-800", label: "Soumis", icon: Clock },
      validated: { color: "bg-yellow-100 text-yellow-800", label: "Validé", icon: AlertCircle },
      processed: { color: "bg-green-100 text-green-800", label: "Traité", icon: CheckCircle },
      acknowledged: { color: "bg-purple-100 text-purple-800", label: "Accusé", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejeté", icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Numéro de dépôt</Label>
          <p className="text-sm">{deposit.deposit_number || "En attente d'attribution"}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Type</Label>
          <p className="text-sm">{deposit.deposit_type}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Statut actuel</Label>
          <div className="mt-1">{getStatusBadge(deposit.status)}</div>
        </div>
        <div>
          <Label className="text-sm font-medium">Date de soumission</Label>
          <p className="text-sm">
            {format(new Date(deposit.submission_date), "dd/MM/yyyy HH:mm", { locale: fr })}
          </p>
        </div>
      </div>

      {deposit.status === 'validated' && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-medium">Attribution ISBN/ISSN</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="isbn-issn">Numéro ISBN/ISSN</Label>
              <Input
                id="isbn-issn"
                value={isbnIssn}
                onChange={(e) => setIsbnIssn(e.target.value)}
                placeholder="Saisir le numéro ISBN ou ISSN"
              />
            </div>
            <div>
              <Label htmlFor="comments">Commentaires</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Commentaires optionnels"
                rows={3}
              />
            </div>
            <Button onClick={handleAttributeNumber} className="w-full">
              Attribuer le numéro et traiter
            </Button>
          </div>
        </div>
      )}

      {deposit.metadata && Object.keys(deposit.metadata).length > 0 && (
        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">Métadonnées</h3>
          <pre className="text-xs bg-muted p-3 rounded overflow-auto">
            {JSON.stringify(deposit.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default LegalDepositManager;