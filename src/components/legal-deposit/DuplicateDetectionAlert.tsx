import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Eye, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DuplicateRequest {
  id: string;
  request_number: string;
  title: string;
  author_name: string;
  support_type: string;
  status: string;
  created_at: string;
  metadata?: {
    author_type?: string;
    author_lastname?: string;
    author_firstname?: string;
    publisher_name?: string;
    printer_name?: string;
  };
}

interface DuplicateGroup {
  title: string;
  requests: DuplicateRequest[];
}

interface DuplicateDetectionAlertProps {
  currentRequest: DuplicateRequest;
  duplicates: DuplicateRequest[];
}

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    brouillon: { label: "Brouillon", variant: "outline" },
    soumis: { label: "Soumis", variant: "secondary" },
    en_attente_validation_b: { label: "En attente B", variant: "default" },
    en_attente_comite_validation: { label: "En attente Comité", variant: "default" },
    valide_par_b: { label: "Validé par B", variant: "secondary" },
    valide_par_comite: { label: "Validé", variant: "default" },
    rejete: { label: "Rejeté", variant: "destructive" },
  };

  const config = statusConfig[status] || { label: status, variant: "outline" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getSubmitterType = (request: DuplicateRequest): string => {
  if (request.metadata?.author_type === "morale") {
    return "Éditeur";
  } else if (request.metadata?.printer_name) {
    return "Imprimeur";
  } else if (request.metadata?.author_type === "physique") {
    return "Auteur";
  }
  return "Non spécifié";
};

export function DuplicateDetectionAlert({ currentRequest, duplicates }: DuplicateDetectionAlertProps) {
  if (duplicates.length === 0) return null;

  return (
    <Alert variant="destructive" className="mb-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-900 dark:text-amber-100 font-semibold">
        Attention : Demande potentiellement en double
      </AlertTitle>
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        <p className="mb-3">
          {duplicates.length === 1 
            ? "Une autre demande avec un titre identique a été détectée."
            : `${duplicates.length} autres demandes avec un titre identique ont été détectées.`}
        </p>
        <p className="text-sm mb-3">
          Il s'agit peut-être du même ouvrage soumis par différentes parties (éditeur, imprimeur, auteur).
          Veuillez vérifier avant de poursuivre la validation.
        </p>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="bg-background hover:bg-accent">
              <Eye className="h-4 w-4 mr-2" />
              Voir les demandes similaires ({duplicates.length})
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Demandes avec titre identique
              </DialogTitle>
              <DialogDescription>
                Titre : <span className="font-semibold">"{currentRequest.title}"</span>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              {/* Demande actuelle */}
              <Card className="border-primary bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Demande actuelle</span>
                    <Badge variant="outline" className="ml-2">Actuelle</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">N° de demande :</span>
                      <p className="font-medium">{currentRequest.request_number}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Statut :</span>
                      <div className="mt-1">{getStatusBadge(currentRequest.status)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">Type de demandeur :</span>
                      <p className="font-medium flex items-center gap-1 mt-1">
                        <Users className="h-3 w-3" />
                        {getSubmitterType(currentRequest)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Support :</span>
                      <p className="font-medium">{currentRequest.support_type}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date de soumission :</span>
                    <p className="font-medium flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(currentRequest.created_at), "dd MMMM yyyy à HH:mm", { locale: fr })}
                    </p>
                  </div>
                  {currentRequest.metadata?.publisher_name && (
                    <div>
                      <span className="text-muted-foreground">Éditeur :</span>
                      <p className="font-medium">{currentRequest.metadata.publisher_name}</p>
                    </div>
                  )}
                  {currentRequest.metadata?.printer_name && (
                    <div>
                      <span className="text-muted-foreground">Imprimeur :</span>
                      <p className="font-medium">{currentRequest.metadata.printer_name}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Demandes similaires */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Demandes similaires détectées
                </h4>
                {duplicates.map((duplicate) => (
                  <Card key={duplicate.id} className="border-amber-200 dark:border-amber-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span>{duplicate.request_number}</span>
                        {getStatusBadge(duplicate.status)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-muted-foreground">Type de demandeur :</span>
                          <p className="font-medium flex items-center gap-1 mt-1">
                            <Users className="h-3 w-3" />
                            {getSubmitterType(duplicate)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Support :</span>
                          <p className="font-medium">{duplicate.support_type}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date de soumission :</span>
                        <p className="font-medium flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(duplicate.created_at), "dd MMMM yyyy à HH:mm", { locale: fr })}
                        </p>
                      </div>
                      {duplicate.metadata?.publisher_name && (
                        <div>
                          <span className="text-muted-foreground">Éditeur :</span>
                          <p className="font-medium">{duplicate.metadata.publisher_name}</p>
                        </div>
                      )}
                      {duplicate.metadata?.printer_name && (
                        <div>
                          <span className="text-muted-foreground">Imprimeur :</span>
                          <p className="font-medium">{duplicate.metadata.printer_name}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-900 dark:text-blue-100">Recommandation</AlertTitle>
                <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Vérifiez si les demandes concernent le même ouvrage</li>
                    <li>Contactez les parties concernées pour confirmer</li>
                    <li>En cas de doublon confirmé, ne validez qu'une seule demande</li>
                    <li>Rejetez les demandes en double avec une note explicative</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </DialogContent>
        </Dialog>
      </AlertDescription>
    </Alert>
  );
}
