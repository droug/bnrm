import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate } from "react-router-dom";
import { AdminPageWrapper, AdminSectionCard } from "@/components/digital-library/admin/AdminPageWrapper";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Icon } from "@iconify/react";

export default function DigitalLibraryCopyright() {
  const { user } = useAuth();
  const { isAdmin, isLibrarian, loading: rolesLoading } = useSecureRoles();

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

  const getBadgeVariant = (daysLeft: number): "default" | "secondary" | "destructive" | "outline" => {
    if (daysLeft < 0) return 'destructive';
    if (daysLeft < 30) return 'destructive';
    if (daysLeft < 60) return 'secondary';
    return 'default';
  };

  // Early returns AFTER all hooks are called
  if (rolesLoading) {
    return (
      <AdminPageWrapper
        title="Droits d'auteur"
        description="Gestion des droits"
        icon="mdi:copyright"
        iconColor="text-orange-600"
        iconBgColor="bg-orange-500/10"
        loading={true}
      >
        <div />
      </AdminPageWrapper>
    );
  }

  if (!user || (!isAdmin && !isLibrarian)) {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminPageWrapper
      title="Suivi des droits d'auteur"
      description="Documents avec protection des droits d'auteur et dates d'expiration"
      icon="mdi:copyright"
      iconColor="text-orange-600"
      iconBgColor="bg-orange-500/10"
    >
      {/* Alert for expiring documents */}
      {expiringDocs && expiringDocs.length > 0 && (
        <Alert className="border-destructive/50 bg-destructive/5">
          <Icon icon="mdi:alert-circle" className="h-4 w-4 text-destructive" />
          <AlertTitle className="text-destructive">Alertes d'expiration</AlertTitle>
          <AlertDescription>
            {expiringDocs.length} document(s) arrivent à expiration dans les 3 prochains mois
          </AlertDescription>
        </Alert>
      )}

      {/* Documents table */}
      <AdminSectionCard
        title="Documents protégés"
        description="Liste de tous les documents avec des restrictions de droits d'auteur"
        icon="mdi:file-lock"
        iconBgColor="bg-orange-100 text-orange-600"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-bn-blue-primary"></div>
          </div>
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
          <div className="text-center py-12 text-muted-foreground">
            <Icon icon="mdi:calendar-clock" className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p>Aucun document avec protection des droits d'auteur</p>
          </div>
        )}
      </AdminSectionCard>
    </AdminPageWrapper>
  );
}
