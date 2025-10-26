import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Home, 
  User, 
  Building2, 
  Calendar, 
  Hash, 
  FileText, 
  Globe, 
  Tag,
  ChevronRight,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MapPin,
  Library
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import ReservationModal from "@/components/cbn/ReservationModal";
import NoticeHead from "@/components/cbn/NoticeHead";

interface NoticeDocument {
  id: string;
  title: string;
  title_ar?: string;
  author: string;
  authors_secondary?: string[];
  publisher?: string;
  publication_place?: string;
  publication_year?: string;
  isbn?: string;
  issn?: string;
  cote?: string;
  document_type: string;
  support_type: string;
  language: string;
  summary?: string;
  table_of_contents?: string;
  keywords?: string[];
  collection?: string;
  series?: string;
  physical_description?: string;
  access_status: 'libre_acces' | 'acces_restreint' | 'consultation_physique';
  support_status: 'numerise' | 'non_numerise' | 'libre_acces';
  is_free_access: boolean;
  allow_physical_consultation: boolean;
  bn_link?: string;
  created_at: string;
}

interface UserReservation {
  id: string;
  document_title: string;
  created_at: string;
  statut: string;
}

export default function CBNNoticeDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [document, setDocument] = useState<NoticeDocument | null>(null);
  const [relatedDocuments, setRelatedDocuments] = useState<NoticeDocument[]>([]);
  const [userReservations, setUserReservations] = useState<UserReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReservationModal, setShowReservationModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDocumentDetails();
      if (user) {
        fetchUserReservations();
      }
    }
  }, [id, user]);

  const fetchDocumentDetails = async () => {
    try {
      setLoading(true);
      
      // Simuler les données pour l'instant
      // TODO: Remplacer par l'appel réel à l'API CBN
      const mockDocument: NoticeDocument = {
        id: id || "",
        title: "Histoire de la littérature marocaine moderne",
        title_ar: "تاريخ الأدب المغربي الحديث",
        author: "Ahmed Benjelloun",
        authors_secondary: ["Mohammed Tazi", "Fatima El Alaoui"],
        publisher: "Éditions de la Pensée",
        publication_place: "Rabat",
        publication_year: "2023",
        isbn: "978-9954-123-456-7",
        cote: "MAR-LIT-2023-001",
        document_type: "Livre",
        support_type: "Imprimé",
        language: "Français",
        summary: "Cet ouvrage propose une analyse approfondie de l'évolution de la littérature marocaine contemporaine, depuis les années 1950 jusqu'à nos jours. Il examine les courants littéraires, les thèmes récurrents et les auteurs majeurs qui ont marqué cette période.",
        table_of_contents: "Introduction\nChapitre 1 : Les années 1950-1970\nChapitre 2 : L'émergence de nouvelles voix\nChapitre 3 : La littérature contemporaine\nConclusion",
        keywords: ["Littérature marocaine", "Histoire littéraire", "Auteurs contemporains", "Analyse critique"],
        collection: "Études Littéraires Maghrébines",
        physical_description: "450 pages ; 24 cm",
        access_status: "acces_restreint",
        support_status: "numerise",
        is_free_access: false,
        allow_physical_consultation: true,
        bn_link: "https://bn.bnrm.ma/notice/12345",
        created_at: new Date().toISOString()
      };

      setDocument(mockDocument);

      // Charger les documents liés
      fetchRelatedDocuments(mockDocument.author, mockDocument.collection);
    } catch (error: any) {
      console.error("Erreur lors du chargement de la notice:", error);
      toast.error("Erreur lors du chargement des détails");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedDocuments = async (author: string, collection?: string) => {
    // TODO: Implémenter la récupération des documents liés
    const mockRelated: NoticeDocument[] = [
      {
        id: "2",
        title: "Poésie contemporaine maghrébine",
        author: "Ahmed Benjelloun",
        publisher: "Éditions Atlas",
        publication_year: "2021",
        document_type: "Livre",
        support_type: "Imprimé",
        language: "Français",
        access_status: "libre_acces",
        support_status: "libre_acces",
        is_free_access: true,
        allow_physical_consultation: true,
        created_at: new Date().toISOString()
      }
    ];
    setRelatedDocuments(mockRelated);
  };

  const fetchUserReservations = async () => {
    try {
      const { data, error } = await supabase
        .from("reservations_ouvrages")
        .select("id, document_title, created_at, statut")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setUserReservations(data || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des réservations:", error);
    }
  };

  const handleReservation = () => {
    if (!document) return;

    if (document.is_free_access && document.bn_link) {
      window.open(document.bn_link, '_blank');
      return;
    }

    if (document.support_status === 'numerise' && !document.allow_physical_consultation) {
      toast.error("Cet ouvrage est exclusivement consultable en ligne.");
      return;
    }

    setShowReservationModal(true);
  };

  const getAccessStatusBadge = (status: string) => {
    switch (status) {
      case 'libre_acces':
        return <Badge className="bg-green-500/10 text-green-700 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" />Libre accès</Badge>;
      case 'acces_restreint':
        return <Badge className="bg-accent/10 text-accent border-accent/30"><AlertCircle className="h-3 w-3 mr-1" />Accès restreint</Badge>;
      case 'consultation_physique':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/30"><XCircle className="h-3 w-3 mr-1" />Consultation physique</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-lg text-muted-foreground">Chargement de la notice...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Notice introuvable</CardTitle>
              <CardDescription>La notice demandée n'existe pas ou a été supprimée.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/cbn")}>Retour au catalogue</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NoticeHead 
        title={document.title}
        author={document.author}
        summary={document.summary}
        keywords={document.keywords}
        isbn={document.isbn}
      />
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
                <Link to="/cbn">Catalogue CBN</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Notice détaillée</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* En-tête de la notice */}
            <Card>
              <CardHeader className="border-b border-border/30">
                <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-primary mb-2 uppercase">{document.title}</h1>
                      {document.title_ar && (
                        <h2 className="text-xl text-muted-foreground mb-4 font-arabic" dir="rtl">{document.title_ar}</h2>
                      )}
                    </div>
                    {getAccessStatusBadge(document.access_status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Auteur:</span>
                      <Link to={`/cbn?author=${document.author}`} className="text-primary hover:underline">
                        {document.author}
                      </Link>
                    </div>

                    {document.publisher && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Éditeur:</span>
                        <span>{document.publisher}</span>
                      </div>
                    )}

                    {document.publication_year && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Année:</span>
                        <span>{document.publication_year}</span>
                      </div>
                    )}

                    {document.publication_place && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Lieu:</span>
                        <span>{document.publication_place}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {document.document_type}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {document.support_type}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {document.language}
                    </Badge>
                    {document.isbn && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        ISBN: {document.isbn}
                      </Badge>
                    )}
                    {document.cote && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Library className="h-3 w-3" />
                        Cote: {document.cote}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Résumé */}
                {document.summary && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Résumé
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{document.summary}</p>
                  </div>
                )}

                {/* Sommaire */}
                {document.table_of_contents && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Sommaire</h3>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">{document.table_of_contents}</pre>
                    </div>
                  </div>
                )}

                {/* Mots-clés */}
                {document.keywords && document.keywords.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Tag className="h-5 w-5 text-primary" />
                      Mots-clés
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {document.keywords.map((keyword, index) => (
                        <Link
                          key={index}
                          to={`/cbn?keyword=${keyword}`}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                        >
                          {keyword}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collection / Série */}
                {document.collection && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Collection</h3>
                    <Link
                      to={`/cbn?collection=${document.collection}`}
                      className="text-primary hover:underline flex items-center gap-2"
                    >
                      {document.collection}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Détails bibliographiques (Accordéon) */}
            <Card>
              <CardHeader>
                <CardTitle>Détails bibliographiques</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="authors">
                    <AccordionTrigger>Auteurs</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">Auteur principal:</span> {document.author}
                        </div>
                        {document.authors_secondary && document.authors_secondary.length > 0 && (
                          <div>
                            <span className="font-medium">Auteurs secondaires:</span>
                            <ul className="list-disc list-inside ml-4">
                              {document.authors_secondary.map((author, index) => (
                                <li key={index}>{author}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="publication">
                    <AccordionTrigger>Publication</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div><span className="font-medium">Éditeur:</span> {document.publisher}</div>
                        <div><span className="font-medium">Lieu:</span> {document.publication_place}</div>
                        <div><span className="font-medium">Année:</span> {document.publication_year}</div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="physical">
                    <AccordionTrigger>Description physique</AccordionTrigger>
                    <AccordionContent>
                      <p>{document.physical_description || "Non spécifié"}</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="identifiers">
                    <AccordionTrigger>Identifiants</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {document.isbn && <div><span className="font-medium">ISBN:</span> {document.isbn}</div>}
                        {document.issn && <div><span className="font-medium">ISSN:</span> {document.issn}</div>}
                        {document.cote && <div><span className="font-medium">Cote:</span> {document.cote}</div>}
                        <div><span className="font-medium">Identifiant interne:</span> {document.id}</div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Documents liés */}
            {relatedDocuments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Documents liés</CardTitle>
                  <CardDescription>Autres ouvrages du même auteur ou de la même collection</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatedDocuments.map((related) => (
                      <Card key={related.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/cbn/notice/${related.id}`)}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{related.title}</CardTitle>
                          <CardDescription className="text-sm">{related.author} • {related.publication_year}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button variant="outline" size="sm" className="w-full">
                            Voir la notice
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Disponibilité et accès */}
            <Card className="sticky top-4">
              <CardHeader className="border-b border-border/30">
                <CardTitle className="flex items-center gap-2">
                  <Library className="h-5 w-5" />
                  Disponibilité et accès
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Type de support:</span>
                    <Badge variant="outline">{document.support_type}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Statut:</span>
                    <Badge variant="outline">
                      {document.support_status === 'numerise' ? 'Numérisé' :
                       document.support_status === 'libre_acces' ? 'Libre accès' : 'Non numérisé'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Consultation physique:</span>
                    <Badge variant={document.allow_physical_consultation ? "default" : "secondary"}>
                      {document.allow_physical_consultation ? 'Autorisée' : 'Non autorisée'}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/30">
                  {document.is_free_access && document.bn_link ? (
                    <Button 
                      className="w-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" 
                      onClick={handleReservation}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Consulter en ligne
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-gradient-to-br from-gold to-amber-600 hover:from-gold/90 hover:to-amber-700" 
                      onClick={handleReservation}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Réserver cet ouvrage
                    </Button>
                  )}
                </div>

                {!document.is_free_access && document.support_status === 'non_numerise' && (
                  <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Disponible en salle de consultation à la BNRM</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Historique utilisateur */}
            {user && userReservations.length > 0 && (
              <Card>
                <CardHeader className="border-b border-border/30">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4" />
                    Votre historique
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="text-sm space-y-2">
                    <p><span className="font-medium">Réservations totales:</span> {userReservations.length}</p>
                    <p><span className="font-medium">En attente:</span> {userReservations.filter(r => r.statut === 'soumise' || r.statut === 'en_cours').length}</p>
                  </div>

                  <div className="pt-3 border-t border-border/30">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Dernières réservations:</p>
                    <div className="space-y-2">
                      {userReservations.slice(0, 3).map((reservation) => (
                        <div key={reservation.id} className="text-xs">
                          <p className="font-medium truncate">{reservation.document_title}</p>
                          <p className="text-muted-foreground">
                            {format(new Date(reservation.created_at), "dd/MM/yyyy", { locale: fr })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/mon-compte/reservations")}>
                    Voir toutes mes réservations
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Modale de réservation */}
      {document && (
        <ReservationModal
          open={showReservationModal}
          onOpenChange={setShowReservationModal}
          document={{
            id: document.id,
            title: document.title,
            author: document.author,
            support_type: document.support_type,
            support_status: document.support_status,
            is_free_access: document.is_free_access,
            allow_physical_consultation: document.allow_physical_consultation
          }}
        />
      )}
    </div>
  );
}
