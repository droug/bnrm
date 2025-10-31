import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAccessControl } from "@/hooks/useAccessControl";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { PageFlipBook } from "@/components/book-reader/PageFlipBook";
import manuscriptPage1 from "@/assets/manuscript-page-1.jpg";
import manuscriptPage2 from "@/assets/manuscript-page-2.jpg";
import manuscriptPage3 from "@/assets/manuscript-page-3.jpg";
import manuscriptPage4 from "@/assets/manuscript-page-4.jpg";
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Share2, 
  Bookmark,
  Printer,
  RotateCw,
  Maximize,
  Minimize,
  Languages,
  Mail,
  Copy,
  BookOpen,
  BookMarked,
  Facebook,
  Twitter,
  Linkedin,
  Eye,
  EyeOff,
  MousePointerClick,
  Search,
  HelpCircle,
  FileText,
  Tag,
  MapPin,
  Archive,
  Shield,
  Info,
  Globe,
  Hash
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/hooks/useLanguage";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Manuscript {
  id: string;
  title: string;
  author: string;
  description: string;
  language: string;
  period: string;
  material: string;
  institution: string;
  access_level: string;
  permalink: string;
  page_count: number;
  file_url: string;
  thumbnail_url: string;
  pages_data: any[];
  has_ocr: boolean;
  block_right_click: boolean;
  block_screenshot: boolean;
  allow_download: boolean;
  allow_print: boolean;
  allow_email_share: boolean;
}

interface Bookmark {
  id: string;
  page_number: number;
  note: string | null;
  created_at: string;
}

export function ManuscriptViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkDownload } = useAccessControl();
  const { setLanguage } = useLanguage();

  const [manuscript, setManuscript] = useState<Manuscript | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<"single" | "double">("single");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [manuscriptImage, setManuscriptImage] = useState<string>("");
  
  // Fictional manuscript pages (fallback)
  const manuscriptPages = [
    manuscriptPage1,
    manuscriptPage2,
    manuscriptPage3,
    manuscriptPage4,
  ];

  useEffect(() => {
    if (id) {
      fetchManuscript();
      if (user) {
        fetchBookmarks();
      }
    }
  }, [id, user]);

  // Protection contre le clic droit
  useEffect(() => {
    if (manuscript?.block_right_click) {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        toast.error("Le clic droit est désactivé pour ce manuscrit");
      };
      document.addEventListener("contextmenu", handleContextMenu);
      return () => document.removeEventListener("contextmenu", handleContextMenu);
    }
  }, [manuscript?.block_right_click]);

  // Protection contre les captures d'écran
  useEffect(() => {
    if (manuscript?.block_screenshot) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "PrintScreen" || (e.ctrlKey && e.shiftKey && (e.key === "S" || e.key === "s"))) {
          e.preventDefault();
          toast.error("Les captures d'écran sont désactivées pour ce manuscrit");
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [manuscript?.block_screenshot]);

  const fetchManuscript = async () => {
    try {
      const { data, error } = await supabase
        .from('manuscripts')
        .select('id, title, author, description, language, period, material, dimensions, page_count, thumbnail_url, digital_copy_url, access_level, status, has_ocr, block_right_click, block_screenshot, allow_download, allow_print, allow_email_share, created_at, permalink, condition_notes, inventory_number, genre, cote, source, historical_period')
        .or(`id.eq.${id},permalink.eq.${id}`)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        setLoading(false);
        return;
      }
      
      // Assurer que toutes les propriétés requises existent  
      const manuscriptData: Manuscript = {
        id: data.id,
        title: data.title,
        author: data.author,
        description: data.description,
        language: data.language,
        period: data.period,
        material: data.material,
        access_level: data.access_level,
        permalink: data.permalink,
        institution: (data as any).institution || 'BNRM',
        page_count: (data as any).page_count || 100,
        file_url: (data as any).file_url || '',
        thumbnail_url: data.thumbnail_url || '',
        pages_data: Array.isArray((data as any).pages_data) ? (data as any).pages_data : [],
        has_ocr: (data as any).has_ocr || false,
        block_right_click: (data as any).block_right_click || false,
        block_screenshot: (data as any).block_screenshot || false,
        allow_download: (data as any).allow_download !== false,
        allow_print: (data as any).allow_print !== false,
        allow_email_share: (data as any).allow_email_share !== false,
      };
      
      // Set manuscript image
      const titleImageMap: { [key: string]: string } = {
        "Archives Photographiques du Maroc Colonial": "/src/assets/digital-library/archives-photo-maroc.jpg",
        "Collection de Cartes Anciennes": "/src/assets/digital-library/cartes-anciennes.jpg",
        "Logiciel Patrimoine": "/src/assets/digital-library/logiciel-patrimoine.jpg",
        "Manuscrits Andalous": "/src/assets/digital-library/manuscrits-andalous.jpg",
        "Documents Administratifs Historiques": "/src/assets/digital-library/documents-administratifs.jpg",
      };

      setManuscriptImage(
        titleImageMap[data.title] || 
        data.thumbnail_url || 
        data.digital_copy_url || 
        manuscriptPage1
      );
      
      setManuscript(manuscriptData);
    } catch (error: any) {
      toast.error("Erreur lors du chargement du manuscrit");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    if (!manuscript) return;
    
    try {
      const { data, error } = await supabase
        .from('manuscript_bookmarks')
        .select('*')
        .eq('manuscript_id', manuscript.id)
        .order('page_number', { ascending: true });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des marque-pages:", error);
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour ajouter des marque-pages");
      return;
    }

    const existing = bookmarks.find(b => b.page_number === currentPage);
    
    if (existing) {
      try {
        const { error } = await supabase
          .from('manuscript_bookmarks')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
        setBookmarks(bookmarks.filter(b => b.id !== existing.id));
        toast.success("Marque-page retiré");
      } catch (error: any) {
        toast.error("Erreur lors de la suppression du marque-page");
      }
    } else {
      try {
        const { data, error } = await supabase
          .from('manuscript_bookmarks')
          .insert([{
            user_id: user.id,
            manuscript_id: manuscript?.id,
            page_number: currentPage,
            note: null
          }])
          .select()
          .single();

        if (error) throw error;
        setBookmarks([...bookmarks, data]);
        toast.success("Marque-page ajouté");
      } catch (error: any) {
        toast.error("Erreur lors de l'ajout du marque-page");
      }
    }
  };

  const handleDownload = async (format: string) => {
    if (!manuscript?.allow_download) {
      toast.error("Le téléchargement est désactivé pour ce manuscrit");
      return;
    }

    if (!checkDownload()) {
      toast.error("Vous n'avez pas la permission de télécharger");
      return;
    }

    toast.success(`Téléchargement en cours (${format})...`);
  };

  const handlePrint = () => {
    if (!manuscript?.allow_print) {
      toast.error("L'impression est désactivée pour ce manuscrit");
      return;
    }
    toast.success("Préparation de l'impression...");
    window.print();
  };

  const handleShare = (platform: string) => {
    const url = `${window.location.origin}/manuscrit/${manuscript?.permalink}`;
    const text = `${manuscript?.title} - ${manuscript?.author}`;
    
    switch(platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
        break;
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast.success("Lien copié dans le presse-papier");
        break;
    }
    setShowShareDialog(false);
  };

  const handleSendEmail = async () => {
    if (!manuscript?.allow_email_share) {
      toast.error("Le partage par email est désactivé pour ce manuscrit");
      return;
    }

    if (!emailAddress) {
      toast.error("Veuillez entrer une adresse email");
      return;
    }

    toast.success(`Email envoyé à ${emailAddress}`);
    setShowEmailDialog(false);
    setEmailAddress("");
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(viewMode === "double" ? Math.max(1, currentPage - 2) : currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const maxPage = manuscript?.page_count || 1;
    if (currentPage < maxPage) {
      setCurrentPage(viewMode === "double" ? Math.min(maxPage, currentPage + 2) : currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    if (zoom < 200) setZoom(zoom + 10);
  };

  const handleZoomOut = () => {
    if (zoom > 50) setZoom(zoom - 10);
  };

  const handleRotate = () => {
    setRotation((rotation + 90) % 360);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const goToPage = (page: number) => {
    const maxPage = manuscript?.page_count || 1;
    if (page >= 1 && page <= maxPage) {
      setCurrentPage(page);
      toast.success(`Page ${page}`);
    }
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang as "fr" | "ar" | "en");
    toast.success(`Langue changée: ${lang === "fr" ? "Français" : lang === "ar" ? "العربية" : "English"}`);
  };

  const getCurrentPageImage = () => {
    if (manuscriptImage) {
      return manuscriptImage;
    }
    return manuscriptPages[(currentPage - 1) % manuscriptPages.length];
  };

  const generatePageImages = () => {
    const images = [];
    const pageCount = manuscript?.page_count || 100;
    for (let i = 0; i < pageCount; i++) {
      images.push(manuscriptImage || manuscriptPages[i % manuscriptPages.length]);
    }
    return images;
  };

  const isPageBookmarked = bookmarks.some(b => b.page_number === currentPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du manuscrit...</p>
        </div>
      </div>
    );
  }

  if (!manuscript) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Manuscrit non trouvé</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-muted/30 border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Back button and title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="font-semibold text-sm truncate">{manuscript.title}</h1>
                <p className="text-xs text-muted-foreground truncate">{manuscript.author}</p>
              </div>
            </div>

            {/* Right: Actions and language selector */}
            <div className="flex items-center gap-2">
              {/* Help Button */}
              <Button variant="ghost" size="sm" asChild>
                <Link to="/manuscripts/help">
                  <HelpCircle className="h-4 w-4" />
                </Link>
              </Button>
              
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Languages className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => changeLanguage("fr")}>
                    🇫🇷 Français
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage("ar")}>
                    🇲🇦 العربية
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage("en")}>
                    🇬🇧 English
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Info & Bookmarks */}
        <aside className="w-80 bg-muted/30 border-r overflow-y-auto hidden lg:block">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              <Tabs defaultValue="info">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="bookmarks">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Marques ({bookmarks.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4 mt-4">
                  {/* Thumbnail */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg overflow-hidden">
                    {manuscriptImage ? (
                      <img 
                        src={manuscriptImage} 
                        alt={manuscript.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-24 w-24 text-primary/40" />
                      </div>
                    )}
                  </div>

                  <div>
                    <Badge variant="secondary" className="mb-3">{manuscript.institution}</Badge>
                    <h2 className="text-lg font-bold mb-2">{manuscript.title}</h2>
                    <p className="text-sm text-muted-foreground mb-3">{manuscript.author}</p>
                    <p className="text-sm text-muted-foreground">{manuscript.description}</p>
                  </div>

                  <Separator />

                  {/* Accordion pour les métadonnées détaillées */}
                  <Accordion type="multiple" defaultValue={["basic", "classification"]} className="w-full">
                    {/* Informations de base */}
                    <AccordionItem value="basic">
                      <AccordionTrigger className="text-sm font-semibold">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Informations de base
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Langue:</span>
                            <span className="font-medium">{manuscript.language || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Période:</span>
                            <span className="font-medium">{manuscript.period || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pages:</span>
                            <span className="font-medium">{manuscript.page_count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Niveau d'accès:</span>
                            <Badge
                              variant={
                                manuscript.access_level === 'public' ? 'default' :
                                manuscript.access_level === 'restricted' ? 'secondary' :
                                'destructive'
                              }
                              className="text-xs"
                            >
                              {manuscript.access_level === 'public' ? 'Public' :
                               manuscript.access_level === 'restricted' ? 'Restreint' :
                               'Confidentiel'}
                            </Badge>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Classification */}
                    <AccordionItem value="classification">
                      <AccordionTrigger className="text-sm font-semibold">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Classification
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 text-sm">
                          {(manuscript as any).genre && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Genre:</span>
                              <span className="font-medium">{(manuscript as any).genre}</span>
                            </div>
                          )}
                          {(manuscript as any).cote && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Cote:</span>
                              <span className="font-medium">{(manuscript as any).cote}</span>
                            </div>
                          )}
                          {(manuscript as any).historical_period && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Période historique:</span>
                              <span className="font-medium">{(manuscript as any).historical_period}</span>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Description physique */}
                    <AccordionItem value="physical">
                      <AccordionTrigger className="text-sm font-semibold">
                        <div className="flex items-center gap-2">
                          <Archive className="h-4 w-4" />
                          Description physique
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Matériau:</span>
                            <span className="font-medium">{manuscript.material || "N/A"}</span>
                          </div>
                          {(manuscript as any).dimensions && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Dimensions:</span>
                              <span className="font-medium">{(manuscript as any).dimensions}</span>
                            </div>
                          )}
                          {(manuscript as any).condition_notes && (
                            <div className="flex flex-col gap-1">
                              <span className="text-muted-foreground">État:</span>
                              <span className="text-xs">{(manuscript as any).condition_notes}</span>
                            </div>
                          )}
                          {(manuscript as any).inventory_number && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">N° inventaire:</span>
                              <span className="font-medium text-xs">{(manuscript as any).inventory_number}</span>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Provenance */}
                    {((manuscript as any).source || (manuscript as any).institution) && (
                      <AccordionItem value="provenance">
                        <AccordionTrigger className="text-sm font-semibold">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Provenance
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 text-sm">
                            {(manuscript as any).source && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Source:</span>
                                <span className="font-medium">{(manuscript as any).source}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Institution:</span>
                              <span className="font-medium">{manuscript.institution}</span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* Sécurité et protection */}
                    {(manuscript.has_ocr || manuscript.block_right_click || manuscript.block_screenshot) && (
                      <AccordionItem value="security">
                        <AccordionTrigger className="text-sm font-semibold">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Sécurité et accès
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {manuscript.has_ocr && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">OCR disponible:</span>
                                <Badge variant="secondary" className="text-xs">Oui</Badge>
                              </div>
                            )}
                            {manuscript.block_right_click && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Clic droit:</span>
                                <Badge variant="outline" className="text-xs">Bloqué</Badge>
                              </div>
                            )}
                            {manuscript.block_screenshot && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Captures d'écran:</span>
                                <Badge variant="outline" className="text-xs">Bloquées</Badge>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Téléchargement:</span>
                              <Badge variant={manuscript.allow_download ? "default" : "destructive"} className="text-xs">
                                {manuscript.allow_download ? "Autorisé" : "Désactivé"}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Impression:</span>
                              <Badge variant={manuscript.allow_print ? "default" : "destructive"} className="text-xs">
                                {manuscript.allow_print ? "Autorisée" : "Désactivée"}
                              </Badge>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Permalien</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={`${window.location.origin}/manuscrit/${manuscript.permalink}`} 
                        readOnly 
                        className="text-xs"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/manuscrit/${manuscript.permalink}`);
                          toast.success("Lien copié!");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="bookmarks" className="space-y-2 mt-4">
                  {bookmarks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucun marque-page
                    </p>
                  ) : (
                    bookmarks.map((bookmark) => (
                      <Button
                        key={bookmark.id}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => goToPage(bookmark.page_number)}
                      >
                        <BookMarked className="h-4 w-4 mr-2" />
                        Page {bookmark.page_number}
                      </Button>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </aside>

        {/* Center - Viewer */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Viewer Toolbar */}
          <div className="bg-muted/50 border-b px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
            {/* Pagination */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage <= 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  value={currentPage}
                  onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                  className="w-16 h-8 text-center text-sm"
                  min={1}
                  max={manuscript.page_count}
                />
                <span className="text-sm text-muted-foreground">/ {manuscript.page_count}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextPage} 
                disabled={currentPage >= manuscript.page_count}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              {/* View Mode */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <BookOpen className="h-4 w-4 mr-2" />
                    {viewMode === "single" ? "Simple" : "Double"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setViewMode("single")}>
                    Simple page
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewMode("double")}>
                    Double page
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Zoom */}
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground w-12 text-center">{zoom}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>

              {/* Rotation */}
              <Button variant="outline" size="sm" onClick={handleRotate}>
                <RotateCw className="h-4 w-4" />
              </Button>

              {/* Fullscreen */}
              <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Bookmark */}
              <Button 
                variant={isPageBookmarked ? "default" : "outline"} 
                size="sm"
                onClick={toggleBookmark}
              >
                <Bookmark className="h-4 w-4" fill={isPageBookmarked ? "currentColor" : "none"} />
              </Button>

              {/* Search */}
              {manuscript.has_ocr && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSearch(!showSearch)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}

              {/* Download */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={!manuscript.allow_download || !checkDownload()}>
                    <Download className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Format de téléchargement</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDownload("PDF")}>
                    PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload("JPEG")}>
                    JPEG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload("PNG")}>
                    PNG
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Print */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrint}
                disabled={!manuscript.allow_print}
              >
                <Printer className="h-4 w-4" />
              </Button>

              {/* Share */}
              <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Partager sur les réseaux sociaux</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Button onClick={() => handleShare("facebook")} variant="outline">
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </Button>
                    <Button onClick={() => handleShare("twitter")} variant="outline">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                    <Button onClick={() => handleShare("linkedin")} variant="outline">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </Button>
                    <Button onClick={() => handleShare("copy")} variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Copier lien
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Email */}
              {manuscript.allow_email_share && (
                <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Envoyer par email</DialogTitle>
                      <DialogDescription>
                        Entrez l'adresse email du destinataire
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          placeholder="exemple@email.com"
                        />
                      </div>
                      <Button onClick={handleSendEmail} className="w-full">
                        Envoyer
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Security indicators */}
              <div className="flex items-center gap-1 ml-2 border-l pl-2">
                {manuscript.block_right_click && (
                  <Badge variant="secondary" className="text-xs">
                    <MousePointerClick className="h-3 w-3 mr-1" />
                    Protégé
                  </Badge>
                )}
                {manuscript.block_screenshot && (
                  <Badge variant="secondary" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Protégé
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && manuscript.has_ocr && (
            <div className="bg-muted/30 border-b px-4 py-2">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher dans le texte..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="sm">
                  Suivant
                </Button>
              </div>
            </div>
          )}

          {/* Page Display Area */}
          <div className="flex-1 overflow-hidden bg-muted/20 flex items-center justify-center p-8">
            <div className="max-w-6xl mx-auto w-full h-full flex items-center justify-center">
              {viewMode === "double" ? (
                <PageFlipBook 
                  images={generatePageImages()}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  zoom={zoom}
                  rotation={rotation}
                />
              ) : (
                <div 
                  className="bg-white shadow-2xl"
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transition: "transform 0.2s ease-out"
                  }}
                >
                  <div className="aspect-[3/4] w-[600px] overflow-hidden">
                    <img 
                      src={getCurrentPageImage()} 
                      alt={`Page ${currentPage}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}