import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Users, Download, Search, Headphones, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  max_manuscript_requests: number;
  max_downloads_per_month: number;
  has_advanced_search: boolean;
  has_priority_support: boolean;
  created_at: string;
}

export default function SubscriptionPlansManager() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les plans d'abonnement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? "Gratuit" : `${price.toFixed(2)} €`;
  };

  const getPlanBadgeColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'gratuit': return 'outline';
      case 'chercheur': return 'secondary';
      case 'institution': return 'default';
      case 'premium': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Plans d'Abonnement
          </CardTitle>
          <CardDescription>
            Gestion des différents profils d'abonnement et leurs privilèges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Tarification</TableHead>
                  <TableHead>Demandes/mois</TableHead>
                  <TableHead>Téléchargements</TableHead>
                  <TableHead>Fonctionnalités</TableHead>
                  <TableHead>Support</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getPlanBadgeColor(plan.name)}>
                            {plan.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {plan.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {formatPrice(plan.price_monthly)}/mois
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatPrice(plan.price_yearly)}/an
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {plan.max_manuscript_requests === 999 ? "Illimité" : plan.max_manuscript_requests}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {plan.max_downloads_per_month === 999 ? "Illimité" : plan.max_downloads_per_month}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          {plan.has_advanced_search ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">Recherche avancée</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {plan.has_priority_support ? (
                          <>
                            <Headphones className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">Prioritaire</span>
                          </>
                        ) : (
                          <>
                            <Headphones className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Standard</span>
                          </>
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

      {/* Résumé des profils différenciés */}
      <Card>
        <CardHeader>
          <CardTitle>Profils Différenciés - Système de Permissions</CardTitle>
          <CardDescription>
            Vue d'ensemble des différents types d'utilisateurs et leurs privilèges d'accès
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-2 border-blue-200">
              <CardHeader className="pb-2">
                <Badge variant="outline" className="w-fit">Grand Public</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Accès gratuit de base</p>
                <ul className="text-xs space-y-1">
                  <li>• Manuscrits publics</li>
                  <li>• 5 demandes d'accès/mois</li>
                  <li>• Consultation en ligne</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardHeader className="pb-2">
                <Badge variant="secondary" className="w-fit">Chercheurs</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Accès académique étendu</p>
                <ul className="text-xs space-y-1">
                  <li>• 50 demandes d'accès/mois</li>
                  <li>• Téléchargements autorisés</li>
                  <li>• Recherche avancée</li>
                  <li>• Manuscrits restreints</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200">
              <CardHeader className="pb-2">
                <Badge variant="secondary" className="w-fit">Abonnés Premium</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Services premium</p>
                <ul className="text-xs space-y-1">
                  <li>• 100 demandes d'accès/mois</li>
                  <li>• Support prioritaire</li>
                  <li>• Fonctionnalités avancées</li>
                  <li>• Notifications personnalisées</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200">
              <CardHeader className="pb-2">
                <Badge variant="default" className="w-fit">Partenaires</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Accès institutionnel</p>
                <ul className="text-xs space-y-1">
                  <li>• 200 demandes d'accès/mois</li>
                  <li>• Traitement prioritaire</li>
                  <li>• Projets collaboratifs</li>
                  <li>• API d'accès</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardHeader className="pb-2">
                <Badge variant="default" className="w-fit">Bibliothécaires</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Gestion des ressources</p>
                <ul className="text-xs space-y-1">
                  <li>• Gestion des manuscrits</li>
                  <li>• Approbation des demandes</li>
                  <li>• Catalogage</li>
                  <li>• Statistiques d'usage</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-200">
              <CardHeader className="pb-2">
                <Badge variant="destructive" className="w-fit">Administrateurs</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Accès complet</p>
                <ul className="text-xs space-y-1">
                  <li>• Gestion des utilisateurs</li>
                  <li>• Configuration système</li>
                  <li>• Rapports avancés</li>
                  <li>• Sécurité et audit</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}