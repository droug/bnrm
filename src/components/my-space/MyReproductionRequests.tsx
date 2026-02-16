import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Clock, Download, Eye, History, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ActivityTimeline } from "./ActivityTimeline";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { WorkflowSteps, getStepRoleInfo } from "@/components/reproduction/WorkflowSteps";
import { useLanguage } from "@/hooks/useLanguage";

interface ReproductionRequest {
  id: string;
  request_number: string;
  status: string;
  created_at: string;
  user_notes: string | null;
  reproduction_modality: string;
  metadata: any;
}

export function MyReproductionRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [requests, setRequests] = useState<ReproductionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedRequests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reproduction_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setRequests(data);
    } catch (error) {
      console.error('Error fetching reproduction requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      brouillon: { label: "Brouillon", variant: "outline" },
      soumise: { label: "Soumise", variant: "default" },
      validee_service: { label: "Validée", variant: "secondary" },
      en_traitement: { label: "En traitement", variant: "default" },
      terminee: { label: "Terminée", variant: "secondary" },
      rejetee: { label: "Rejetée", variant: "destructive" }
    };

    const config = statusConfig[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demandes de reproduction</CardTitle>
        <CardDescription>
          Suivez vos demandes de reproduction de documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune demande de reproduction pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{request.request_number}</h3>
                        {request.metadata?.projet && (
                          <p className="text-sm text-muted-foreground">{request.metadata.projet}</p>
                        )}
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    {/* Workflow Steps - Progress visualization */}
                    <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                      <WorkflowSteps currentStatus={request.status} compact />
                      {request.status !== 'terminee' && request.status !== 'refusee' && (
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          {language === "ar" ? "في انتظار:" : "En attente de:"}{" "}
                          <span className="font-medium">{getStepRoleInfo(request.status, language).canValidate}</span>
                        </p>
                      )}
                    </div>

                    {request.user_notes && (
                      <p className="text-sm mb-3 line-clamp-2">{request.user_notes}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(request.created_at)}
                      </span>
                      {request.reproduction_modality && (
                        <Badge variant="outline">
                          {request.reproduction_modality === 'numerique_mail' ? 'Par E-mail' : 
                           request.reproduction_modality === 'numerique_espace' ? 'Mon espace' : 
                           request.reproduction_modality === 'support_physique' ? 'Retrait sur place' :
                           request.reproduction_modality === 'papier' ? 'Papier' :
                           request.reproduction_modality}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2 mb-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/reproduction/details/${request.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir détails
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleExpand(request.id)}
                      >
                        <History className="h-4 w-4 mr-1" />
                        Historique
                        {expandedRequests.has(request.id) ? (
                          <ChevronUp className="h-4 w-4 ml-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 ml-1" />
                        )}
                      </Button>
                    </div>

                    {/* Timeline des opérations */}
                    <Collapsible open={expandedRequests.has(request.id)}>
                      <CollapsibleContent className="pt-2 border-t">
                        <ActivityTimeline 
                          resourceType="reproduction" 
                          resourceId={request.id} 
                          compact 
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
