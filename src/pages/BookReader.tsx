import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { useParams, useNavigate } from "react-router-dom";
import manuscriptPage1 from "@/assets/manuscript-page-1.jpg";
import manuscriptPage2 from "@/assets/manuscript-page-2.jpg";
import manuscriptPage3 from "@/assets/manuscript-page-3.jpg";
import manuscriptPage4 from "@/assets/manuscript-page-4.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Volume2,
  FileText,
  Info,
  MessageCircle,
  ChevronDown,
  BookOpen,
  Copy,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  BookMarked,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Minimize,
  Languages,
  Eye,
  EyeOff,
  MousePointerClick
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const BookReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, setLanguage } = useLanguage();
  
  // Display states
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<"single" | "double">("single");
  const [readingMode, setReadingMode] = useState<"book" | "audio">("book");
  
  // Security settings (paramétrable)
  const [blockScreenCapture, setBlockScreenCapture] = useState(false);
  const [blockRightClick, setBlockRightClick] = useState(false);
  const [allowDownload, setAllowDownload] = useState(true);
  
  // Bookmarks
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  
  // Audio states
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [audioPosition, setAudioPosition] = useState(0);
  const [audioBookmarks, setAudioBookmarks] = useState<number[]>([]);
  
  // Share dialog
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  
  const totalPages = 245;
  
  // Fictional manuscript pages
  const manuscriptPages = [
    manuscriptPage1,
    manuscriptPage2,
    manuscriptPage3,
    manuscriptPage4,
  ];
  
  const getCurrentPageImage = (page: number) => {
    // Cycle through the 4 manuscript images
    return manuscriptPages[(page - 1) % manuscriptPages.length];
  };
  
  const bookInfo = {
    title: "Manuscrit andalou du XIIe siècle",
    author: "Ibn Rushd (Averroès)",
    collection: "Manuscrits",
    date: "1195",
    description: "Commentaire philosophique majeur sur les œuvres d'Aristote",
    language: "Arabe classique",
    pages: totalPages,
    format: "PDF Haute résolution",
    size: "45.3 MB",
    hasAudio: true,
    audioDuration: "5h 23min",
    permalink: `https://bnrm.ma/reader/${id}`
  };

  const chapters = [
    { name: "Introduction", page: 1 },
    { name: "Chapitre I - La métaphysique", page: 15 },
    { name: "Chapitre II - La logique", page: 45 },
    { name: "Chapitre III - La physique", page: 89 },
    { name: "Chapitre IV - L'éthique", page: 145 },
    { name: "Chapitre V - La politique", page: 189 },
    { name: "Conclusion", page: 230 }
  ];

  // Block right click
  useEffect(() => {
    if (blockRightClick) {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        toast.error("Le clic droit est désactivé pour ce document");
      };
      document.addEventListener("contextmenu", handleContextMenu);
      return () => document.removeEventListener("contextmenu", handleContextMenu);
    }
  }, [blockRightClick]);

  // Block screen capture
  useEffect(() => {
    if (blockScreenCapture) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "PrintScreen" || (e.ctrlKey && e.shiftKey && e.key === "S")) {
          e.preventDefault();
          toast.error("Les captures d'écran sont désactivées pour ce document");
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [blockScreenCapture]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(viewMode === "double" ? Math.max(1, currentPage - 2) : currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(viewMode === "double" ? Math.min(totalPages, currentPage + 2) : currentPage + 1);
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

  const toggleBookmark = (page: number) => {
    if (bookmarks.includes(page)) {
      setBookmarks(bookmarks.filter(p => p !== page));
      toast.success("Marque-page retiré");
    } else {
      setBookmarks([...bookmarks, page]);
      toast.success("Marque-page ajouté");
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    toast.success(`Navigation vers la page ${page}`);
  };

  const handleDownload = (format: string) => {
    if (!allowDownload) {
      toast.error("Le téléchargement est désactivé pour ce document");
      return;
    }
    toast.success(`Téléchargement en cours (${format})...`);
  };

  const handlePrint = () => {
    toast.success("Préparation de l'impression...");
    window.print();
  };

  const handleShare = (platform: string) => {
    const url = bookInfo.permalink;
    const text = `${bookInfo.title} - ${bookInfo.author}`;
    
    switch(platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
        break;
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast.success("Lien copié dans le presse-papier");
        break;
    }
    setShowShareDialog(false);
  };

  const handleSendEmail = () => {
    if (!emailAddress) {
      toast.error("Veuillez entrer une adresse email");
      return;
    }
    toast.success(`Email envoyé à ${emailAddress}`);
    setShowEmailDialog(false);
    setEmailAddress("");
  };

  // Audio controls
  const toggleAudioPlay = () => {
    setIsPlaying(!isPlaying);
    toast.success(isPlaying ? "Lecture en pause" : "Lecture en cours");
  };

  const toggleAudioBookmark = () => {
    const pos = audioPosition;
    if (audioBookmarks.includes(pos)) {
      setAudioBookmarks(audioBookmarks.filter(p => p !== pos));
      toast.success("Marque-page audio retiré");
    } else {
      setAudioBookmarks([...audioBookmarks, pos]);
      toast.success("Marque-page audio ajouté");
    }
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang as "fr" | "ar" | "en");
    toast.success(`Langue changée: ${lang === "fr" ? "Français" : lang === "ar" ? "العربية" : "English"}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Breadcrumb with Language Selector */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <a href="/" className="hover:text-primary">Accueil</a>
              <ChevronRight className="h-4 w-4" />
              <a href="/digital-library" className="hover:text-primary">Bibliothèque Numérique</a>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">Consultation Ouvrage</span>
            </div>
            
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Languages className="h-4 w-4 mr-2" />
                  Langue
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

      <div className="flex-1 flex">
        {/* Left Sidebar - Book Info & Navigation */}
        <aside className="w-80 bg-muted/30 border-r overflow-y-auto">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="w-full"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>

              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="chapters">Chapitres</TabsTrigger>
                  <TabsTrigger value="bookmarks">
                    <Bookmark className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-6 mt-6">
                  {/* Thumbnail */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                    <FileText className="h-24 w-24 text-primary/40" />
                  </div>

                  {/* Book Details */}
                  <div>
                    <Badge variant="secondary" className="mb-3">{bookInfo.collection}</Badge>
                    <h2 className="text-xl font-bold mb-2">{bookInfo.title}</h2>
                    <p className="text-muted-foreground mb-2">{bookInfo.author}</p>
                    <p className="text-sm text-muted-foreground">{bookInfo.description}</p>
                  </div>

                  <Separator />

                  {/* Metadata */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{bookInfo.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Langue:</span>
                      <span className="font-medium">{bookInfo.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pages:</span>
                      <span className="font-medium">{bookInfo.pages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Format:</span>
                      <span className="font-medium">{bookInfo.format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taille:</span>
                      <span className="font-medium">{bookInfo.size}</span>
                    </div>
                    {bookInfo.hasAudio && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Audio:</span>
                        <span className="font-medium">{bookInfo.audioDuration}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Permalink */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Permalien</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={bookInfo.permalink} 
                        readOnly 
                        className="text-xs"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(bookInfo.permalink);
                          toast.success("Lien copié!");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm mb-3">Actions</h3>
                    
                    <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full justify-start" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Partager
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

                    <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full justify-start" size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          Envoyer par email
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
                              placeholder="destinataire@email.com"
                              value={emailAddress}
                              onChange={(e) => setEmailAddress(e.target.value)}
                            />
                          </div>
                          <Button onClick={handleSendEmail} className="w-full">
                            Envoyer
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      size="sm"
                      onClick={handlePrint}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimer
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-start" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Format de téléchargement</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDownload("PDF")}>
                          PDF Haute résolution
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload("PDF-low")}>
                          PDF Basse résolution
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload("JPEG")}>
                          JPEG (Pages)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload("EPUB")}>
                          EPUB (eBook)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      size="sm"
                      onClick={() => toggleBookmark(currentPage)}
                    >
                      <Bookmark 
                        className={`h-4 w-4 mr-2 ${bookmarks.includes(currentPage) ? "fill-current" : ""}`} 
                      />
                      {bookmarks.includes(currentPage) ? "Retirer marque-page" : "Ajouter marque-page"}
                    </Button>
                  </div>

                  <Separator />

                  {/* Security Settings (Admin) */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm mb-3">Paramètres de sécurité</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Téléchargement</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setAllowDownload(!allowDownload)}
                      >
                        {allowDownload ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Capture d'écran</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setBlockScreenCapture(!blockScreenCapture)}
                      >
                        {blockScreenCapture ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Clic droit</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setBlockRightClick(!blockRightClick)}
                      >
                        {blockRightClick ? <EyeOff className="h-4 w-4" /> : <MousePointerClick className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="chapters" className="space-y-2 mt-6">
                  <h3 className="font-semibold mb-3">Table des matières</h3>
                  {chapters.map((chapter, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      className="w-full justify-between text-left"
                      size="sm"
                      onClick={() => goToPage(chapter.page)}
                    >
                      <span className="text-sm truncate">{chapter.name}</span>
                      <span className="text-xs text-muted-foreground">p.{chapter.page}</span>
                    </Button>
                  ))}
                </TabsContent>

                <TabsContent value="bookmarks" className="space-y-2 mt-6">
                  <h3 className="font-semibold mb-3">Marque-pages ({bookmarks.length})</h3>
                  {bookmarks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Aucun marque-page
                    </p>
                  ) : (
                    bookmarks.sort((a, b) => a - b).map((page) => (
                      <Button
                        key={page}
                        variant="ghost"
                        className="w-full justify-between"
                        size="sm"
                        onClick={() => goToPage(page)}
                      >
                        <span>Page {page}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(page);
                          }}
                        >
                          ✕
                        </Button>
                      </Button>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content - Book Viewer */}
        <main className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-muted/30 border-b p-3">
            <div className="flex items-center justify-between gap-4">
              {/* Navigation Controls */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={currentPage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setCurrentPage(Math.min(totalPages, Math.max(1, val)));
                    }}
                    className="w-16 text-center h-9 text-sm"
                  />
                  <span className="text-sm text-muted-foreground">/ {totalPages}</span>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium w-16 text-center">{zoom}%</span>
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-2">
                <Button 
                  variant={viewMode === "single" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("single")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Simple
                </Button>
                <Button 
                  variant={viewMode === "double" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("double")}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Double
                </Button>
              </div>

              {/* View Controls */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleRotate}>
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </div>

              {/* Reading Mode */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {readingMode === "book" ? <FileText className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
                    {readingMode === "book" ? "Liseuse" : "Audio"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setReadingMode("book")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Mode Liseuse
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setReadingMode("audio")} disabled={!bookInfo.hasAudio}>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Mode Audio
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Book Display Area */}
          {readingMode === "book" ? (
            <div className="flex-1 overflow-auto bg-muted/10 p-8">
              <div className={`${viewMode === "double" ? "max-w-7xl" : "max-w-4xl"} mx-auto`}>
                <div className={`grid ${viewMode === "double" ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  {/* Page 1 or Single Page */}
                  <Card className="shadow-2xl">
                    <CardContent className="p-0">
                      <div 
                        className="aspect-[3/4] bg-gradient-to-br from-background to-muted flex items-center justify-center relative overflow-hidden"
                        style={{ 
                          transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                          transformOrigin: 'center',
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        <img 
                          src={getCurrentPageImage(currentPage)}
                          alt={`Page ${currentPage}`}
                          className="w-full h-full object-contain"
                        />
                        {bookmarks.includes(currentPage) && (
                          <Badge className="absolute top-4 right-4 bg-primary/90">
                            <Bookmark className="h-3 w-3 mr-1 fill-current" />
                            Marqué
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Page 2 (Double page mode only) */}
                  {viewMode === "double" && currentPage < totalPages && (
                    <Card className="shadow-2xl">
                      <CardContent className="p-0">
                        <div 
                          className="aspect-[3/4] bg-gradient-to-br from-background to-muted flex items-center justify-center relative overflow-hidden"
                          style={{ 
                            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                            transformOrigin: 'center',
                            transition: 'transform 0.3s ease'
                          }}
                        >
                          <img 
                            src={getCurrentPageImage(currentPage + 1)}
                            alt={`Page ${currentPage + 1}`}
                            className="w-full h-full object-contain"
                          />
                          {bookmarks.includes(currentPage + 1) && (
                            <Badge className="absolute top-4 right-4 bg-primary/90">
                              <Bookmark className="h-3 w-3 mr-1 fill-current" />
                              Marqué
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Audio Mode
            <div className="flex-1 overflow-auto bg-muted/10 p-8">
              <div className="max-w-3xl mx-auto space-y-6">
                <Card>
                  <CardContent className="p-8">
                    <div className="text-center space-y-6">
                      <div className="aspect-square max-w-sm mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                        <Volume2 className="h-32 w-32 text-primary/40" />
                      </div>

                      <div>
                        <h2 className="text-2xl font-bold mb-2">{bookInfo.title}</h2>
                        <p className="text-muted-foreground">{bookInfo.author}</p>
                      </div>

                      {/* Audio Player Controls */}
                      <div className="space-y-4">
                        <Slider 
                          value={[audioPosition]} 
                          max={100}
                          step={1}
                          onValueChange={(value) => setAudioPosition(value[0])}
                          className="w-full"
                        />
                        
                        <div className="flex items-center justify-center gap-4">
                          <Button variant="outline" size="icon">
                            <SkipBack className="h-5 w-5" />
                          </Button>
                          <Button size="icon" className="h-14 w-14" onClick={toggleAudioPlay}>
                            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                          </Button>
                          <Button variant="outline" size="icon">
                            <SkipForward className="h-5 w-5" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-center gap-4">
                          <Button variant="outline" size="sm" onClick={toggleAudioBookmark}>
                            <BookMarked className="h-4 w-4 mr-2" />
                            Marquer
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                Vitesse: {audioSpeed}x
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => setAudioSpeed(0.5)}>0.5x</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setAudioSpeed(0.75)}>0.75x</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setAudioSpeed(1)}>1x (Normal)</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setAudioSpeed(1.25)}>1.25x</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setAudioSpeed(1.5)}>1.5x</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setAudioSpeed(2)}>2x</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Audio Bookmarks */}
                        {audioBookmarks.length > 0 && (
                          <div className="mt-6 space-y-2">
                            <h4 className="font-semibold text-sm">Marque-pages audio</h4>
                            <div className="flex flex-wrap gap-2">
                              {audioBookmarks.map((pos) => (
                                <Badge 
                                  key={pos}
                                  variant="secondary"
                                  className="cursor-pointer"
                                  onClick={() => setAudioPosition(pos)}
                                >
                                  {Math.floor(pos / 60)}:{(pos % 60).toString().padStart(2, '0')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Page Progress (Book mode only) */}
          {readingMode === "book" && (
            <div className="bg-muted/30 border-t p-4">
              <Slider 
                value={[currentPage]} 
                max={totalPages}
                step={1}
                onValueChange={(value) => setCurrentPage(value[0])}
                className="w-full"
              />
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default BookReader;
