import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  BookOpen, 
  Calendar, 
  User, 
  FileText, 
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Home
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Reservation {
  id: string;
  document_id: string;
  document_title: string;
  document_author?: string;
  document_year?: string;
  document_cote?: string;
  support_type: string;
  support_status: string;
  routed_to: string;
  statut: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  user_type?: string;
  requested_date?: string;
  comments?: string;
  is_student_pfe?: boolean;
  pfe_theme?: string;
  created_at: string;
  processed_at?: string;
  reason_refus?: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  soumise: { label: "Soumise", icon: AlertCircle, color: "text-blue-600 bg-blue-50 border-blue-200" },
  en_cours: { label: "En cours", icon: Clock, color: "text-orange-600 bg-orange-50 border-orange-200" },
  validee: { label: "Validée", icon: CheckCircle, color: "text-green-600 bg-green-50 border-green-200" },
  refusee: { label: "Refusée", icon: XCircle, color: "text-red-600 bg-red-50 border-red-200" },
  archivee: { label: "Archivée", icon: FileText, color: "text-gray-600 bg-gray-50 border-gray-200" },
};

export default function ReservationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (id) {
      fetchReservation();
    }
  }, [user, id, navigate]);

  const fetchReservation = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("reservations_ouvrages")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Vérifier que l'utilisateur a accès à cette réservation
      if (data.user_id && data.user_id !== user?.id) {
        navigate("/digital-library/my-reservations");
        return;
      }

      setReservation(data);
    } catch (error) {
      console.error("Error fetching reservation:", error);
      navigate("/digital-library/my-reservations");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des détails...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Réservation introuvable</CardTitle>
              <CardDescription>
                Cette réservation n'existe pas ou vous n'avez pas les droits pour y accéder.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/digital-library/my-reservations")}>
                Retour à mes réservations
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[reservation.statut] || STATUS_CONFIG.soumise;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Accueil
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/digital-library/my-reservations">Mes Réservations</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Détails</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* En-tête */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate("/digital-library/my-reservations")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à mes réservations
          </Button>
          
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-primary">Détails de la réservation</h1>
              <p className="text-muted-foreground">
                N° {reservation.id.slice(0, 8)}...
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${statusConfig.color}`}>
              <StatusIcon className="h-5 w-5" />
              <span className="font-semibold">{statusConfig.label}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Informations sur l'ouvrage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Informations sur l'ouvrage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Titre</p>
                <p className="font-medium">{reservation.document_title}</p>
              </div>
              
              {reservation.document_author && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Auteur</p>
                  <p>{reservation.document_author}</p>
                </div>
              )}

              {reservation.document_year && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Année</p>
                  <p>{reservation.document_year}</p>
                </div>
              )}

              {reservation.document_cote && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cote</p>
                  <p className="font-mono text-primary">{reservation.document_cote}</p>
                </div>
              )}

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Type de support</p>
                <Badge variant="outline">{reservation.support_type}</Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Statut du support</p>
                <Badge variant="outline">
                  {reservation.support_status === "numerise" ? "Numérisé" : "Non numérisé"}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Routage</p>
                <Badge>
                  {reservation.routed_to === "bibliotheque_numerique" 
                    ? "Bibliothèque Numérique" 
                    : "Responsable Support"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Détails de la demande */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Détails de la demande
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date de soumission</p>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(reservation.created_at), "PPP 'à' HH:mm", { locale: fr })}
                </p>
              </div>

              {reservation.requested_date && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date souhaitée</p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(reservation.requested_date), "PPP", { locale: fr })}
                  </p>
                </div>
              )}

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Demandeur</p>
                <p className="font-medium">{reservation.user_name}</p>
                <p className="text-sm text-muted-foreground">{reservation.user_email}</p>
                {reservation.user_phone && (
                  <p className="text-sm text-muted-foreground">{reservation.user_phone}</p>
                )}
              </div>

              {reservation.user_type && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Type d'utilisateur</p>
                  <Badge variant="secondary" className="capitalize">{reservation.user_type}</Badge>
                </div>
              )}

              {reservation.is_student_pfe && reservation.pfe_theme && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Étudiant PFE</p>
                    <Badge variant="secondary">Oui</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Thème PFE</p>
                    <p className="text-sm p-2 bg-muted rounded">{reservation.pfe_theme}</p>
                  </div>
                </>
              )}

              {reservation.comments && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Commentaires</p>
                    <p className="text-sm p-2 bg-muted rounded">{reservation.comments}</p>
                  </div>
                </>
              )}

              {reservation.reason_refus && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-destructive font-medium mb-1">Raison du refus</p>
                    <p className="text-sm p-2 bg-destructive/10 rounded">{reservation.reason_refus}</p>
                  </div>
                </>
              )}

              {reservation.processed_at && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date de traitement</p>
                  <p className="text-sm">
                    {format(new Date(reservation.processed_at), "PPP 'à' HH:mm", { locale: fr })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Prochaines étapes */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Que faire ensuite ?
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reservation.statut === "soumise" && (
              <p className="text-sm text-muted-foreground">
                Votre demande a été soumise avec succès. Elle sera traitée par notre équipe dans les plus brefs délais. 
                Vous recevrez une notification par email dès qu'une décision sera prise.
              </p>
            )}
            {reservation.statut === "en_cours" && (
              <p className="text-sm text-muted-foreground">
                Votre demande est en cours de traitement. Nous vérifions la disponibilité du document et préparons 
                votre accès. Vous serez informé(e) par email dès que votre réservation sera validée.
              </p>
            )}
            {reservation.statut === "validee" && (
              <div className="space-y-2">
                <p className="text-sm text-green-700 font-medium">
                  ✓ Votre réservation a été validée !
                </p>
                <p className="text-sm text-muted-foreground">
                  {reservation.routed_to === "bibliotheque_numerique" 
                    ? "Vous pouvez maintenant accéder au document via la Bibliothèque Numérique."
                    : "Vous pouvez venir consulter le document sur place. Veuillez contacter le service pour plus de détails."}
                </p>
              </div>
            )}
            {reservation.statut === "refusee" && (
              <p className="text-sm text-muted-foreground">
                Votre demande a été refusée. Veuillez consulter la raison du refus ci-dessus. 
                Si vous avez des questions, n'hésitez pas à contacter notre équipe.
              </p>
            )}
            {reservation.statut === "archivee" && (
              <p className="text-sm text-muted-foreground">
                Cette réservation a été archivée. Elle n'est plus active.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/digital-library/my-reservations")}
          >
            Voir toutes mes réservations
          </Button>
          {reservation.statut === "validee" && reservation.routed_to === "bibliotheque_numerique" && (
            <Button asChild>
              <Link to={`/cbn/notice/${reservation.document_id}`}>
                Accéder au document
              </Link>
            </Button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
