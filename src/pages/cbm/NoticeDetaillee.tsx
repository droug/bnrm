import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookReservationDialog } from "@/components/cbn/BookReservationDialog";
import { ReproductionRequestDialog } from "@/components/cbn/ReproductionRequestDialog";
import { DigitizationRequestDialog } from "@/components/digital-library/DigitizationRequestDialog";
import { CartDialog } from "@/components/cbm/CartDialog";
import { SubscriptionDialog } from "@/components/cbm/SubscriptionDialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import NoticeHead from "@/components/cbn/NoticeHead";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  BookOpen, Calendar, MapPin, Library, User, Hash, ArrowLeft, Share2, Eye,
  Building2, FileText, Tag, BookMarked, Globe, Users, Clock, ExternalLink,
  ShoppingCart, LogIn, Scan
} from "lucide-react";
import { toast } from "sonner";
import { getDocumentById } from "@/data/mockDocuments";

interface DocumentData {
  id: string;
  title: string;
  titleAr?: string;
  author: string;
  secondaryAuthors?: string[];
  year: string;
  publisher: string;
  publishPlace?: string;
  pages?: number;
  isbn?: string;
  issn?: string;
  cote: string;
  internalId?: string;
  supportType: string;
  supportStatus: "numerise" | "non_numerise" | "libre_acces";
  isFreeAccess: boolean;
  allowPhysicalConsultation?: boolean;
  description: string;
  summary?: string;
  tableOfContents?: string[];
  keywords?: string[];
  collection?: string;
  language?: string;
  physicalDescription?: string;
  noticeOrigin?: string;
  digitalLink?: string;
}

interface RelatedDocument {
  id: string;
  title: string;
  author: string;
  year: string;
}

interface UserReservation {
  id: string;
  document_title: string;
  status: string;
  created_at: string;
}

export default function NoticeDetaillee() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isReproductionOpen, setIsReproductionOpen] = useState(false);
  const [isDigitizationOpen, setIsDigitizationOpen] = useState(false);
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [relatedDocuments, setRelatedDocuments] = useState<RelatedDocument[]>([]);
  const [userReservations, setUserReservations] = useState<UserReservation[]>([]);
  const [reservationStats, setReservationStats] = useState({ total: 0, pending: 0, lastConsultation: "" });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [cartItems, setCartItems] = useState<Array<{id: string, title: string, author: string, cote: string}>>([]);

  useEffect(() => {
    // Récupérer les données du document depuis l'état de navigation ou charger depuis l'API
    if (location.state?.document) {
      const doc = location.state.document;
      setDocumentData({
        ...doc,
        pages: doc.pages || 342,
        isbn: doc.isbn || "978-9954-123-456-7",
        allowPhysicalConsultation: doc.allowPhysicalConsultation ?? true,
        titleAr: doc.titleAr,
        secondaryAuthors: doc.secondaryAuthors || ["Co-auteur 1", "Co-auteur 2"],
        publishPlace: doc.publishPlace || "Rabat",
        summary: doc.summary || "Cet ouvrage propose une étude approfondie de l'évolution de la littérature marocaine moderne.",
        tableOfContents: doc.tableOfContents || [
          "Introduction à la littérature marocaine",
          "Les courants littéraires post-indépendance",
          "Les auteurs majeurs et leurs œuvres",
          "Thèmes récurrents et symboles",
          "Conclusion et perspectives"
        ],
        keywords: doc.keywords || ["Littérature marocaine", "Histoire littéraire", "Analyse culturelle"],
        collection: doc.collection || "Patrimoine Littéraire",
        language: doc.language || "Français",
        physicalDescription: doc.physicalDescription || "342 p. : ill. ; 24 cm",
        noticeOrigin: doc.noticeOrigin || "Bibliothèque Nationale du Royaume du Maroc",
        digitalLink: doc.digitalLink
      });
    } else {
      // Essayer de charger depuis les données mockées
      const mockDoc = getDocumentById(id || "DOC-2024-001");
      if (mockDoc) {
        setDocumentData(mockDoc);
      } else {
        // Fallback sur des données par défaut
        setDocumentData({
          id: id || "DOC-2024-001",
          title: "Histoire de la littérature marocaine moderne",
          titleAr: "تاريخ الأدب المغربي الحديث",
          author: "Ahmed Ben Mohammed",
          secondaryAuthors: ["Co-auteur 1", "Co-auteur 2"],
          year: "2023",
          publisher: "Éditions Atlas",
          publishPlace: "Rabat",
          pages: 342,
          isbn: "978-9954-123-456-7",
          cote: "840.MAR.BEN",
          internalId: "BNM-2024-001",
          supportType: "Livre",
          supportStatus: "numerise",
          isFreeAccess: false,
          allowPhysicalConsultation: true,
          description: "Cet ouvrage propose une étude approfondie de l'évolution de la littérature marocaine moderne, de l'indépendance à nos jours. Il analyse les principaux courants littéraires, les auteurs majeurs et les thèmes récurrents qui caractérisent cette période riche en productions.",
          summary: "Cet ouvrage propose une étude approfondie de l'évolution de la littérature marocaine moderne.",
          tableOfContents: [
            "Introduction à la littérature marocaine",
            "Les courants littéraires post-indépendance",
            "Les auteurs majeurs et leurs œuvres",
            "Thèmes récurrents et symboles",
            "Conclusion et perspectives"
          ],
          keywords: ["Littérature marocaine", "Histoire littéraire", "Analyse culturelle"],
          collection: "Patrimoine Littéraire",
          language: "Français",
          physicalDescription: "342 p. : ill. ; 24 cm",
          noticeOrigin: "Bibliothèque Nationale du Royaume du Maroc"
        });
      }
    }

    // Charger les documents liés
    loadRelatedDocuments();

    // Si l'utilisateur est connecté, charger son historique
    if (user) {
      loadUserReservations();
    }
  }, [id, location.state, user]);

  const loadRelatedDocuments = async () => {
    // TODO: Charger depuis l'API
    // Pour l'instant, données d'exemple
    setRelatedDocuments([
      { id: "DOC-001", title: "Littérature contemporaine du Maghreb", author: "Ahmed Ben Mohammed", year: "2022" },
      { id: "DOC-002", title: "Poésie marocaine moderne", author: "Ahmed Ben Mohammed", year: "2021" },
      { id: "DOC-003", title: "Romans du Maroc indépendant", author: "Fatima El Alaoui", year: "2020" },
    ]);
  };

  const loadUserReservations = async () => {
    if (!user) return;

    try {
      // TODO: Adapter selon votre schéma de base de données
      // Pour l'instant, utilisation de données d'exemple
      const mockReservations: UserReservation[] = [
        {
          id: "1",
          document_title: "Histoire de la littérature marocaine",
          status: "pending",
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "2",
          document_title: "Poésie andalouse classique",
          status: "approved",
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setUserReservations(mockReservations);
      const total = mockReservations.length;
      const pending = mockReservations.filter((r) => r.status === "pending").length;
      const lastDoc = mockReservations[0];
      
      setReservationStats({
        total,
        pending,
        lastConsultation: lastDoc ? `${lastDoc.document_title} (${new Date(lastDoc.created_at).toLocaleDateString("fr-FR")})` : ""
      });

      /* Code à activer quand la table sera prête
      const { data, error } = await supabase
        .from("book_reservations")
        .select("id, document_title, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      if (data) {
        setUserReservations(data);
        const total = data.length;
        const pending = data.filter((r) => r.status === "pending").length;
        const lastDoc = data[0];
        
        setReservationStats({
          total,
          pending,
          lastConsultation: lastDoc ? `${lastDoc.document_title} (${new Date(lastDoc.created_at).toLocaleDateString("fr-FR")})` : ""
        });
      }
      */
    } catch (error) {
      console.error("Erreur lors du chargement des réservations:", error);
    }
  };

  const handleOpenReservation = () => {
    if (!documentData) return;

    // Si c'est un document libre d'accès, rediriger directement
    if (documentData.isFreeAccess) {
      if (documentData.digitalLink) {
        window.open(documentData.digitalLink, "_blank");
      } else {
        window.open("/digital-library", "_blank");
      }
      toast.success("Redirection vers la Bibliothèque Numérique", {
        description: "Ce document est en libre accès"
      });
      return;
    }
    setIsReservationOpen(true);
  };

  const handleConsult = () => {
    if (!documentData) return;

    // Rediriger vers le lecteur de livres avec l'ID du document
    // Pour les documents numérisés, ouvrir le book-reader
    if (documentData.supportStatus === "numerise" || documentData.isFreeAccess) {
      navigate(`/book-reader/${documentData.id}`);
    } else {
      toast.info("Document non numérisé", {
        description: "Ce document n'est pas encore disponible en version numérique"
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: documentData?.title,
        text: `${documentData?.title} - ${documentData?.author}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papiers");
    }
  };

  if (!documentData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Library className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Chargement...</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusBadge = () => {
    if (documentData?.isFreeAccess) {
      return (
        <Badge className="bg-success/10 text-success border-success/20">
          🟢 Libre accès
        </Badge>
      );
    }
    if (documentData?.supportStatus === "numerise") {
      return (
        <Badge className="bg-warning/10 text-warning border-warning/20">
          🟠 Accès restreint
        </Badge>
      );
    }
    return (
      <Badge className="bg-destructive/10 text-destructive border-destructive/20">
        🔴 Consultation physique
      </Badge>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {documentData && (
        <NoticeHead 
          title={documentData.title}
          author={documentData.author}
          summary={documentData.summary}
          keywords={documentData.keywords}
          isbn={documentData.isbn}
        />
      )}
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {/* Bouton retour */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => {
            // Si on vient de la recherche, restaurer l'état de recherche
            if (location.state?.searchState) {
              let targetRoute = '/cbm/recherche-avancee';
              if (location.state?.fromReproduction) {
                targetRoute = '/demande-reproduction';
              } else if (location.state?.fromDigitization) {
                targetRoute = '/demande-numerisation';
              }
              navigate(targetRoute, { state: { searchState: location.state.searchState } });
            } else {
              navigate(-1);
            }
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        {/* Layout à 2 colonnes */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Colonne principale - Contenu */}
          <div className="lg:col-span-2 space-y-6">
            {/* A. En-tête de la notice */}
            <Card className="shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="space-y-4">
                  {/* Titre en français et arabe */}
                  <div>
                    <CardTitle className="text-3xl mb-2 uppercase">{documentData.title}</CardTitle>
                    {documentData.titleAr && (
                      <CardTitle className="text-2xl text-right" dir="rtl">{documentData.titleAr}</CardTitle>
                    )}
                  </div>

                  {/* Auteurs */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Button variant="link" className="h-auto p-0 text-base font-semibold">
                      {documentData.author}
                    </Button>
                    {documentData.secondaryAuthors && documentData.secondaryAuthors.length > 0 && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        {documentData.secondaryAuthors.map((author, idx) => (
                          <Button key={idx} variant="link" className="h-auto p-0 text-sm">
                            {author}
                          </Button>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Ligne compacte: Éditeur / Lieu / Année */}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{documentData.publisher}</span>
                    </div>
                    {documentData.publishPlace && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{documentData.publishPlace}</span>
                        </div>
                      </>
                    )}
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{documentData.year}</span>
                    </div>
                  </div>

                  {/* Identifiants */}
                  <div className="flex items-center gap-4 flex-wrap text-sm">
                    {documentData.isbn && (
                      <Badge variant="outline">
                        <Hash className="h-3 w-3 mr-1" />
                        ISBN: {documentData.isbn}
                      </Badge>
                    )}
                    {documentData.issn && (
                      <Badge variant="outline">
                        <Hash className="h-3 w-3 mr-1" />
                        ISSN: {documentData.issn}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      <Hash className="h-3 w-3 mr-1" />
                      Cote: {documentData.cote}
                    </Badge>
                    {documentData.internalId && (
                      <Badge variant="outline">
                        <Hash className="h-3 w-3 mr-1" />
                        ID: {documentData.internalId}
                      </Badge>
                    )}
                  </div>

                  {/* Type / Support / Langue */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {documentData.supportType}
                    </Badge>
                    {documentData.language && (
                      <Badge variant="secondary">
                        <Globe className="h-3 w-3 mr-1" />
                        {documentData.language}
                      </Badge>
                    )}
                    {getStatusBadge()}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* B. Résumé et description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Résumé et description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {documentData.summary && (
                  <div>
                    <h4 className="font-semibold mb-2">🧾 Résumé</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {documentData.summary}
                    </p>
                  </div>
                )}

                {documentData.description && (
                  <div>
                    <h4 className="font-semibold mb-2">📝 Note de contenu</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {documentData.description}
                    </p>
                  </div>
                )}

                {documentData.tableOfContents && documentData.tableOfContents.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">📚 Sommaire</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {documentData.tableOfContents.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {documentData.keywords && documentData.keywords.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">🗂 Indexation thématique</h4>
                    <div className="flex flex-wrap gap-2">
                      {documentData.keywords.map((keyword, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="h-auto py-1 px-3"
                          onClick={() => navigate(`/cbm/recherche-avancee?keyword=${encodeURIComponent(keyword)}`)}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {keyword}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {documentData.collection && (
                  <div>
                    <h4 className="font-semibold mb-2">🧭 Collection / Série</h4>
                    <Button
                      variant="link"
                      className="h-auto p-0"
                      onClick={() => navigate(`/cbm/recherche-avancee?collection=${encodeURIComponent(documentData.collection)}`)}
                    >
                      {documentData.collection}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* C. Détails bibliographiques (accordéon) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5" />
                  Détails bibliographiques
                </CardTitle>
                <CardDescription>Informations détaillées selon UNIMARC</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="zone-100">
                    <AccordionTrigger>Zone 100 - Auteur principal</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">
                        <strong>Auteur:</strong> {documentData.author}
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="zone-210">
                    <AccordionTrigger>Zone 210 - Publication / Éditeur</AccordionTrigger>
                    <AccordionContent className="space-y-2 text-sm text-muted-foreground">
                      <p><strong>Éditeur:</strong> {documentData.publisher}</p>
                      {documentData.publishPlace && <p><strong>Lieu:</strong> {documentData.publishPlace}</p>}
                      <p><strong>Année:</strong> {documentData.year}</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="zone-300">
                    <AccordionTrigger>Zone 300 - Description matérielle</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">
                        {documentData.physicalDescription || `${documentData.pages} p.`}
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="zone-330">
                    <AccordionTrigger>Zone 330 - Résumé</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">
                        {documentData.summary || documentData.description}
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="zone-606">
                    <AccordionTrigger>Zone 606 - Mots-clés</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2">
                        {documentData.keywords?.map((keyword, idx) => (
                          <Badge key={idx} variant="secondary">{keyword}</Badge>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {documentData.secondaryAuthors && documentData.secondaryAuthors.length > 0 && (
                    <AccordionItem value="zone-700">
                      <AccordionTrigger>Zone 700 - Auteurs secondaires</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {documentData.secondaryAuthors.map((author, idx) => (
                            <li key={idx}>{author}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  <AccordionItem value="zone-801">
                    <AccordionTrigger>Zone 801 - Origine de la notice</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">
                        {documentData.noticeOrigin}
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="zone-995">
                    <AccordionTrigger>Zone 995 - Cote et exemplaires</AccordionTrigger>
                    <AccordionContent className="space-y-2 text-sm text-muted-foreground">
                      <p><strong>Cote:</strong> {documentData.cote}</p>
                      <p><strong>Exemplaires disponibles:</strong> 1</p>
                      <p><strong>Localisation:</strong> Salle de consultation BNRM</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Documents liés */}
            {relatedDocuments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Documents liés / Voir aussi
                  </CardTitle>
                  <CardDescription>Autres ouvrages du même auteur ou de la même collection</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedDocuments.map((doc) => (
                      <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/cbm/notice/${doc.id}`)}>
                        <CardContent className="pt-4 space-y-2">
                          <h4 className="font-semibold text-sm line-clamp-2">{doc.title}</h4>
                          <p className="text-xs text-muted-foreground">{doc.author}</p>
                          <p className="text-xs text-muted-foreground">{doc.year}</p>
                          <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                            Voir notice →
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Colonne latérale - Fiche */}
          <div className="space-y-6">
            {/* D. Disponibilité et accès */}
            <Card className="sticky top-4">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Library className="h-5 w-5" />
                  Disponibilité et accès
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold mb-1">Type de support</p>
                    <p className="text-muted-foreground">{documentData.supportType}</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-1">Statut du support</p>
                    {getStatusBadge()}
                  </div>

                  <div>
                    <p className="font-semibold mb-1">Consultation physique</p>
                    <p className="text-muted-foreground">
                      {documentData.allowPhysicalConsultation ? "✅ Autorisée" : "❌ Non autorisée"}
                    </p>
                  </div>

                  {!documentData.isFreeAccess && documentData.supportStatus !== "numerise" && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        📍 {documentData.allowPhysicalConsultation 
                          ? "Disponible en salle de consultation BNRM"
                          : "Disponible en salle de consultation BNRM pour chercheur"
                        }
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t space-y-3">
                  {documentData.isFreeAccess ? (
                    // Libre d'accès - Consulter en ligne directement
                    <Button
                      size="lg"
                      variant="default"
                      className="w-full"
                      onClick={handleOpenReservation}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Consulter en ligne
                    </Button>
                  ) : (
                    // Accès restreint
                    <>
                      {/* Si numérisé et utilisateur connecté : Consulter en ligne */}
                      {documentData.supportStatus === "numerise" && user && (
                        <Button
                          size="lg"
                          variant="default"
                          className="w-full"
                          onClick={handleConsult}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Consulter en ligne
                        </Button>
                      )}

                      {/* Si non connecté : Se connecter/S'inscrire */}
                      {!user && (
                        <Button
                          size="lg"
                          variant="default"
                          className="w-full"
                          onClick={() => navigate("/auth")}
                        >
                          <LogIn className="mr-2 h-4 w-4" />
                          Se connecter / S'inscrire
                        </Button>
                      )}

                      {/* Si connecté et pas libre accès : Réserver (sauf si numérisé) - uniquement depuis le contexte réservation */}
                      {user && documentData.supportStatus !== "numerise" && location.state?.fromReservation && (
                        <Button
                          size="lg"
                          variant="default"
                          className="w-full"
                          onClick={handleOpenReservation}
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Réserver cet Ouvrage
                        </Button>
                      )}

                      {/* Si connecté : Panier et Adhérer */}
                      {user && (
                        <>
                          <Button
                            size="lg"
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              if (documentData) {
                                setCartItems(prev => [...prev, {
                                  id: documentData.id,
                                  title: documentData.title,
                                  author: documentData.author,
                                  cote: documentData.cote
                                }]);
                                setIsCartOpen(true);
                              }
                            }}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Ajouter au panier
                          </Button>
                          <Button
                            size="lg"
                            variant="secondary"
                            className="w-full"
                            onClick={() => setIsSubscriptionOpen(true)}
                          >
                            Adhérer
                          </Button>
                        </>
                      )}
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleShare}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Partager
                  </Button>

                  {/* Bouton reproduction uniquement depuis le contexte reproduction */}
                  {location.state?.fromReproduction && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={() => setIsReproductionOpen(true)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Demande de reproduction
                    </Button>
                  )}

                  {/* Bouton numérisation uniquement depuis le contexte numérisation */}
                  {location.state?.fromDigitization && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={() => setIsDigitizationOpen(true)}
                    >
                      <Scan className="mr-2 h-4 w-4" />
                      Demande de numérisation
                    </Button>
                  )}
                </div>

                {documentData.isFreeAccess && (
                  <div className="bg-success/10 p-3 rounded-lg border border-success/20">
                    <p className="text-xs text-success">
                      💡 Ce document est en libre accès. Aucune réservation n'est nécessaire.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Historique utilisateur */}
            {user && (
              <Card>
                <CardHeader className="bg-muted/30">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Votre historique
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ouvrages réservés</span>
                    <Badge variant="secondary">{reservationStats.total}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">En attente</span>
                    <Badge variant="secondary">{reservationStats.pending}</Badge>
                  </div>
                  {reservationStats.lastConsultation && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Dernière consultation</p>
                      <p className="text-xs font-medium">{reservationStats.lastConsultation}</p>
                    </div>
                  )}
                  <Button
                    variant="link"
                    size="sm"
                    className="w-full h-auto p-0 text-xs mt-2"
                    onClick={() => navigate("/user/book-reservations")}
                  >
                    Voir toutes mes réservations →
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

      </main>

      <Footer />

      {/* Dialogue de réservation */}
      <BookReservationDialog
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        documentId={documentData.id}
        documentTitle={documentData.title}
        documentAuthor={documentData.author}
        documentYear={documentData.year}
        supportType={documentData.supportType}
        supportStatus={documentData.supportStatus}
        isFreeAccess={documentData.isFreeAccess}
        allowPhysicalConsultation={documentData.allowPhysicalConsultation}
        onReserve={() => {
          toast.success("Réservation effectuée avec succès");
        }}
      />

      {/* Dialogue du panier */}
      <CartDialog
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={(id) => setCartItems(prev => prev.filter(item => item.id !== id))}
        onClearCart={() => setCartItems([])}
      />

      {/* Dialogue d'adhésion */}
      <SubscriptionDialog
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
      />

      {/* Dialogue de demande de reproduction */}
      {documentData && (
        <ReproductionRequestDialog
          isOpen={isReproductionOpen}
          onClose={() => setIsReproductionOpen(false)}
          document={{
            id: documentData.id,
            title: documentData.title,
            author: documentData.author,
            cote: documentData.cote,
            year: documentData.year
          }}
        />
      )}

      {/* Dialogue de demande de numérisation */}
      {documentData && user && profile && (
        <DigitizationRequestDialog
          isOpen={isDigitizationOpen}
          onClose={() => setIsDigitizationOpen(false)}
          documentId={documentData.id}
          documentTitle={documentData.title}
          documentCote={documentData.cote}
          userProfile={{
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            email: profile.email || user.email || ""
          }}
        />
      )}
    </div>
  );
}
