import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, FileText, Send, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Header from "@/components/Header";

interface Manuscript {
  id: string;
  title: string;
  author: string;
  inventory_number: string;
}

interface AccessRequest {
  id: string;
  manuscript_id: string;
  request_type: string;
  purpose: string;
  requested_date: string;
  status: string;
  notes: string;
  created_at: string;
  manuscripts: Manuscript;
}

export default function AccessRequest() {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  
  // Form state
  const [selectedManuscript, setSelectedManuscript] = useState("");
  const [requestType, setRequestType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [requestedDate, setRequestedDate] = useState<Date>();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data state
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [userRequests, setUserRequests] = useState<AccessRequest[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch available manuscripts
      const { data: manuscriptsData, error: manuscriptsError } = await supabase
        .from('manuscripts')
        .select('id, title, author, inventory_number')
        .eq('status', 'available')
        .order('title');

      if (manuscriptsError) throw manuscriptsError;
      setManuscripts(manuscriptsData || []);

      // Fetch user's existing requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('access_requests')
        .select(`
          *,
          manuscripts:manuscript_id (
            id,
            title,
            author,
            inventory_number
          )
        `)
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      setUserRequests(requestsData || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedManuscript || !requestType || !purpose || !requestedDate) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('access_requests')
        .insert({
          user_id: profile?.id,
          manuscript_id: selectedManuscript,
          request_type: requestType,
          purpose,
          requested_date: format(requestedDate, 'yyyy-MM-dd'),
          notes,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Demande envoyée",
        description: "Votre demande d'accès a été soumise avec succès",
      });

      // Reset form
      setSelectedManuscript("");
      setRequestType("");
      setPurpose("");
      setRequestedDate(undefined);
      setNotes("");
      
      // Refresh requests
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Rejetée';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 border-yellow-200';
      case 'approved': return 'bg-green-50 border-green-200';
      case 'rejected': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile?.is_approved) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <main className="container py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Compte en attente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Votre compte doit être approuvé par un administrateur avant de pouvoir faire des demandes d'accès.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Demande d'Accès
          </h1>
          <p className="text-muted-foreground mt-2">
            Demandez l'accès à un manuscrit ou une reproduction
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Formulaire de demande */}
          <Card>
            <CardHeader>
              <CardTitle>Nouvelle Demande</CardTitle>
              <CardDescription>
                Remplissez le formulaire ci-dessous pour soumettre votre demande
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="manuscript">Manuscrit *</Label>
                  <Select value={selectedManuscript} onValueChange={setSelectedManuscript}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un manuscrit" />
                    </SelectTrigger>
                    <SelectContent>
                      {manuscripts.map((manuscript) => (
                        <SelectItem key={manuscript.id} value={manuscript.id}>
                          {manuscript.title} - {manuscript.author}
                          {manuscript.inventory_number && ` (${manuscript.inventory_number})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="request-type">Type de demande *</Label>
                  <Select value={requestType} onValueChange={setRequestType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de demande" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation sur place</SelectItem>
                      <SelectItem value="reproduction">Reproduction numérique</SelectItem>
                      <SelectItem value="prêt">Prêt inter-établissements</SelectItem>
                      <SelectItem value="recherche">Projet de recherche</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Objet de la demande *</Label>
                  <Textarea
                    id="purpose"
                    placeholder="Décrivez l'objet de votre demande..."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date souhaitée *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {requestedDate ? format(requestedDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={requestedDate}
                        onSelect={setRequestedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes supplémentaires</Label>
                  <Textarea
                    id="notes"
                    placeholder="Informations complémentaires..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer la demande
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Historique des demandes */}
          <Card>
            <CardHeader>
              <CardTitle>Mes Demandes</CardTitle>
              <CardDescription>
                Historique de vos demandes d'accès
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune demande trouvée
                  </p>
                ) : (
                  userRequests.map((request) => (
                    <div key={request.id} className={`p-4 rounded-lg border ${getStatusColor(request.status)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">{request.manuscripts?.title}</h4>
                          {request.manuscripts?.author && (
                            <p className="text-xs text-muted-foreground">{request.manuscripts.author}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          {getStatusIcon(request.status)}
                          {getStatusLabel(request.status)}
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><strong>Type:</strong> {request.request_type}</p>
                        <p><strong>Date demandée:</strong> {format(new Date(request.requested_date), "PPP", { locale: fr })}</p>
                        <p><strong>Objet:</strong> {request.purpose}</p>
                        {request.notes && <p><strong>Notes:</strong> {request.notes}</p>}
                        <p><strong>Créée le:</strong> {format(new Date(request.created_at), "PPP", { locale: fr })}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}