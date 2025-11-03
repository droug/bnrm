import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle, Clock, DollarSign, FileText, Package, Wrench } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect } from "react";

interface RestorationRequest {
  id: string;
  request_number: string;
  manuscript_title: string;
  manuscript_cote: string;
  damage_description: string;
  urgency_level: string;
  status: string;
  submitted_at: string;
  quote_amount?: number;
  estimated_duration?: number;
  restoration_report?: string;
}

export function MyRestorationRequests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['my-restoration-requests', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('[MyRestorationRequests] No user logged in');
        return [];
      }
      
      console.log('[MyRestorationRequests] Fetching requests for user:', user.id);
      
      const { data, error } = await supabase
        .from('restoration_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('[MyRestorationRequests] Error fetching requests:', error);
        throw error;
      }
      
      console.log('[MyRestorationRequests] Fetched requests:', data);
      return data as RestorationRequest[];
    },
    enabled: !!user
  });

  // Subscribe to real-time updates for restoration requests
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('my-restoration-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restoration_requests',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Restoration request change detected:', payload);
          // Refresh requests when any change occurs
          queryClient.invalidateQueries({ queryKey: ['my-restoration-requests', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      'soumise': { label: 'En attente', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
      'autorisee': { label: 'Autorisée', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
      'refusee_direction': { label: 'Refusée', variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
      'diagnostic_en_cours': { label: 'Diagnostic en cours', variant: 'default', icon: <FileText className="h-3 w-3" /> },
      'devis_en_attente': { label: 'Devis en attente', variant: 'secondary', icon: <DollarSign className="h-3 w-3" /> },
      'devis_refuse': { label: 'Devis refusé', variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
      'paiement_en_attente': { label: 'Paiement en attente', variant: 'secondary', icon: <DollarSign className="h-3 w-3" /> },
      'paiement_valide': { label: 'Paiement validé', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
      'restauration_en_cours': { label: 'Restauration en cours', variant: 'default', icon: <Wrench className="h-3 w-3" /> },
      'terminee': { label: 'Terminée', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
      'cloturee': { label: 'Clôturée', variant: 'outline', icon: <Package className="h-3 w-3" /> },
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' as const, icon: null };
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getUrgencyBadge = (level: string) => {
    const colors = {
      'faible': 'bg-green-100 text-green-800',
      'moyenne': 'bg-yellow-100 text-yellow-800',
      'haute': 'bg-orange-100 text-orange-800',
      'critique': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mes demandes de restauration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes demandes de restauration</CardTitle>
      </CardHeader>
      <CardContent>
        {!requests || requests.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Vous n'avez aucune demande de restauration pour le moment
          </p>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-base">
                            {request.manuscript_title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Cote: {request.manuscript_cote}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Demande N° {request.request_number}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          {getStatusBadge(request.status)}
                          {getUrgencyBadge(request.urgency_level)}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Soumise le {format(new Date(request.submitted_at), "d MMMM yyyy", { locale: fr })}
                        </span>
                      </div>

                      {request.quote_amount && (
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold">Montant: {request.quote_amount} DH</span>
                        </div>
                      )}

                      {request.estimated_duration && (
                        <div className="text-sm text-muted-foreground">
                          Durée estimée: {request.estimated_duration} jours
                        </div>
                      )}

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full">
                            Voir les détails
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Détails de la demande {request.request_number}</DialogTitle>
                            <DialogDescription>
                              Informations complètes sur votre demande de restauration
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Manuscrit</h4>
                              <p className="text-sm">{request.manuscript_title}</p>
                              <p className="text-sm text-muted-foreground">Cote: {request.manuscript_cote}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Description des dommages</h4>
                              <p className="text-sm">{request.damage_description}</p>
                            </div>
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <h4 className="font-semibold mb-2">Statut</h4>
                                {getStatusBadge(request.status)}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold mb-2">Urgence</h4>
                                {getUrgencyBadge(request.urgency_level)}
                              </div>
                            </div>
                            {request.restoration_report && (
                              <div>
                                <h4 className="font-semibold mb-2">Rapport de restauration</h4>
                                <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                                  {request.restoration_report}
                                </p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
