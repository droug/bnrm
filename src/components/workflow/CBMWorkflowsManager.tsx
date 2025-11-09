import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  GraduationCap,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  FileText,
  UserCheck,
  AlertTriangle,
  Send
} from "lucide-react";

export function CBMWorkflowsManager() {
  const { toast } = useToast();
  const [activeWorkflow, setActiveWorkflow] = useState("adhesions");

  // Workflow pour les demandes d'adhésion
  const adhesionWorkflow = {
    name: "Gestion Demandes Adhérents",
    description: "Circuit de validation des demandes d'adhésion au réseau CBM",
    steps: [
      {
        id: 1,
        name: "Soumission de la demande",
        description: "Le demandeur soumet sa demande d'adhésion avec les documents requis",
        actor: "Demandeur",
        icon: Send,
        status: "completed",
        duration: "Immédiat"
      },
      {
        id: 2,
        name: "Vérification des documents",
        description: "Vérification de la complétude et de la conformité des documents",
        actor: "Agent CBM",
        icon: FileText,
        status: "active",
        duration: "1-2 jours"
      },
      {
        id: 3,
        name: "Validation technique",
        description: "Validation des critères techniques et des capacités de la bibliothèque",
        actor: "Responsable Technique",
        icon: UserCheck,
        status: "pending",
        duration: "2-3 jours"
      },
      {
        id: 4,
        name: "Approbation finale",
        description: "Décision finale sur l'adhésion au réseau",
        actor: "Directeur CBM",
        icon: CheckCircle,
        status: "pending",
        duration: "1-2 jours"
      },
      {
        id: 5,
        name: "Notification",
        description: "Notification du demandeur de la décision (acceptation ou rejet)",
        actor: "Système",
        icon: Send,
        status: "pending",
        duration: "Immédiat"
      }
    ],
    statistics: {
      total: 45,
      pending: 12,
      approved: 28,
      rejected: 5,
      avgDuration: "5.2 jours"
    }
  };

  // Workflow pour les demandes de formation
  const formationWorkflow = {
    name: "Gestion Demandes de Formation",
    description: "Circuit de validation et d'organisation des formations",
    steps: [
      {
        id: 1,
        name: "Soumission de la demande",
        description: "La bibliothèque soumet une demande de formation avec les besoins identifiés",
        actor: "Bibliothèque",
        icon: Send,
        status: "completed",
        duration: "Immédiat"
      },
      {
        id: 2,
        name: "Analyse des besoins",
        description: "Analyse et évaluation des besoins en formation",
        actor: "Responsable Formation",
        icon: FileText,
        status: "active",
        duration: "1-2 jours"
      },
      {
        id: 3,
        name: "Planification",
        description: "Élaboration du programme et planification des sessions",
        actor: "Coordinateur Pédagogique",
        icon: UserCheck,
        status: "pending",
        duration: "3-5 jours"
      },
      {
        id: 4,
        name: "Validation budgétaire",
        description: "Validation du budget et des ressources nécessaires",
        actor: "Responsable Administratif",
        icon: CheckCircle,
        status: "pending",
        duration: "2-3 jours"
      },
      {
        id: 5,
        name: "Approbation finale",
        description: "Approbation finale et programmation de la formation",
        actor: "Directeur CBM",
        icon: CheckCircle,
        status: "pending",
        duration: "1-2 jours"
      },
      {
        id: 6,
        name: "Notification et confirmation",
        description: "Notification de la bibliothèque avec dates et modalités",
        actor: "Système",
        icon: Send,
        status: "pending",
        duration: "Immédiat"
      }
    ],
    statistics: {
      total: 62,
      pending: 18,
      approved: 38,
      rejected: 6,
      avgDuration: "7.5 jours"
    }
  };

  const currentWorkflow = activeWorkflow === "adhesions" ? adhesionWorkflow : formationWorkflow;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "active":
        return "bg-blue-500";
      case "pending":
        return "bg-gray-300";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "active":
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
      case "pending":
        return <Clock className="h-5 w-5 text-gray-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleActivateWorkflow = () => {
    toast({
      title: "Workflow activé",
      description: `Le workflow "${currentWorkflow.name}" est maintenant actif.`,
    });
  };

  const handleExportWorkflow = () => {
    toast({
      title: "Export réussi",
      description: "Le workflow a été exporté au format BPMN 2.0.",
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-cbm-primary" />
            Workflows CBM - Catalogue Bibliographique Marocain
          </CardTitle>
          <CardDescription>
            Gestion des circuits de validation pour les demandes d'adhésion et de formation
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeWorkflow} onValueChange={setActiveWorkflow}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="adhesions" className="gap-2">
            <Users className="h-4 w-4" />
            Demandes Adhérents
          </TabsTrigger>
          <TabsTrigger value="formations" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Demandes de Formation
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeWorkflow} className="space-y-6">
          {/* Statistiques */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total</CardDescription>
                <CardTitle className="text-3xl">{currentWorkflow.statistics.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>En attente</CardDescription>
                <CardTitle className="text-3xl text-amber-600">
                  {currentWorkflow.statistics.pending}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Approuvées</CardDescription>
                <CardTitle className="text-3xl text-green-600">
                  {currentWorkflow.statistics.approved}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Rejetées</CardDescription>
                <CardTitle className="text-3xl text-red-600">
                  {currentWorkflow.statistics.rejected}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Délai moyen</CardDescription>
                <CardTitle className="text-2xl">{currentWorkflow.statistics.avgDuration}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Circuit de validation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{currentWorkflow.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {currentWorkflow.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExportWorkflow}>
                    <FileText className="h-4 w-4 mr-2" />
                    Exporter BPMN
                  </Button>
                  <Button onClick={handleActivateWorkflow}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Activer
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {currentWorkflow.steps.map((step, index) => (
                  <div key={step.id} className="mb-8 last:mb-0">
                    <div className="flex gap-4">
                      {/* Timeline */}
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full ${getStatusColor(step.status)} flex items-center justify-center text-white`}>
                          {step.id}
                        </div>
                        {index < currentWorkflow.steps.length - 1 && (
                          <div className={`w-0.5 h-20 ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'} mt-2`} />
                        )}
                      </div>

                      {/* Contenu */}
                      <Card className="flex-1">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <step.icon className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <h3 className="font-semibold text-lg">{step.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {step.description}
                                </p>
                              </div>
                            </div>
                            {getStatusIcon(step.status)}
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <Badge variant="outline" className="gap-1">
                              <Users className="h-3 w-3" />
                              {step.actor}
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              <Clock className="h-3 w-3" />
                              {step.duration}
                            </Badge>
                            {step.status === "active" && (
                              <Badge className="bg-blue-500 gap-1">
                                <ArrowRight className="h-3 w-3" />
                                En cours
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alertes et recommandations */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="h-5 w-5" />
                Recommandations
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-900">
              <ul className="list-disc list-inside space-y-2">
                <li>
                  Vérifier régulièrement les demandes en attente pour maintenir un délai de traitement optimal
                </li>
                <li>
                  Assurer la communication avec les demandeurs à chaque étape importante du processus
                </li>
                <li>
                  Documenter les raisons de rejet pour améliorer la qualité des futures demandes
                </li>
                {activeWorkflow === "formations" && (
                  <li>
                    Planifier les formations au moins 2 semaines à l'avance pour optimiser la logistique
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
