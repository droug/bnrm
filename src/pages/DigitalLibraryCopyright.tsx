import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarClock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DigitalLibraryCopyright() {
  const { user } = useAuth();
  const { isAdmin, isLibrarian, loading: rolesLoading } = useSecureRoles();
  const navigate = useNavigate();

  // Fetch documents with copyright information - MUST be called unconditionally
  const { data: documents, isLoading } = useQuery({
    queryKey: ['copyright-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .not('copyright_expires_at', 'is', null)
        .order('copyright_expires_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !rolesLoading && !!user && (isAdmin || isLibrarian)
  });

  // Calculate documents expiring soon (within 3 months)
  const expiringDocs = documents?.filter(doc => {
    const expiresAt = new Date(doc.copyright_expires_at);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiresAt <= threeMonthsFromNow && expiresAt > new Date();
  });

  const getDaysRemaining = (expiresAt: string) => {
    return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const getBadgeVariant = (daysLeft: number) => {
    if (daysLeft < 0) return 'destructive';
    if (daysLeft < 30) return 'destructive';
    if (daysLeft < 60) return 'secondary';
    return 'default';
  };

  // Early returns AFTER all hooks are called
  if (rolesLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (!user || (!isAdmin && !isLibrarian)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/digital-library")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
                <CalendarClock className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Suivi des droits d'auteur</CardTitle>
                <CardDescription>
                  Documents avec protection des droits d'auteur et dates d'expiration
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Alert for expiring documents */}
        {expiringDocs && expiringDocs.length > 0 && (
          <Alert className="mb-6 border-destructive/50">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertTitle className="text-destructive">Alertes d'expiration</AlertTitle>
            <AlertDescription>
              {expiringDocs.length} document(s) arrivent à expiration dans les 3 prochains mois
            </AlertDescription>
          </Alert>
        )}

        {/* Documents table */}
        <Card>
          <CardHeader>
            <CardTitle>Documents protégés</CardTitle>
            <CardDescription>
              Liste de tous les documents avec des restrictions de droits d'auteur
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Chargement...</p>
            ) : documents && documents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date d'expiration</TableHead>
                    <TableHead>Jours restants</TableHead>
                    <TableHead>Dérogation</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => {
                    const daysLeft = getDaysRemaining(doc.copyright_expires_at);
                    const isExpired = daysLeft < 0;
                    
                    return (
                      <TableRow key={doc.id} className={isExpired ? 'bg-destructive/5' : ''}>
                        <TableCell className="font-medium">{doc.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {doc.content_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(doc.copyright_expires_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getBadgeVariant(daysLeft)}>
                            {isExpired 
                              ? `Expiré depuis ${Math.abs(daysLeft)} jours`
                              : `${daysLeft} jours`
                            }
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {doc.copyright_derogation ? (
                            <Badge variant="secondary">Avec dérogation</Badge>
                          ) : (
                            <Badge variant="outline">Sans dérogation</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {doc.status === 'published' ? (
                            <Badge variant="default">Publié</Badge>
                          ) : (
                            <Badge variant="secondary">{doc.status}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarClock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun document avec protection des droits d'auteur</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
