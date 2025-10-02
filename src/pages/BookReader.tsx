import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { useParams, useNavigate } from "react-router-dom";
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
  ChevronDown
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BookReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  
  const totalPages = 245;
  
  const bookInfo = {
    title: "Manuscrit andalou du XIIe siècle",
    author: "Ibn Rushd (Averroès)",
    collection: "Manuscrits",
    date: "1195",
    description: "Commentaire philosophique majeur sur les œuvres d'Aristote",
    language: "Arabe classique",
    pages: totalPages,
    format: "PDF Haute résolution",
    size: "45.3 MB"
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <a href="/" className="hover:text-primary">Accueil</a>
            <ChevronRight className="h-4 w-4" />
            <a href="/digital-library" className="hover:text-primary">Bibliothèque Numérique</a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Consultation Ouvrage</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Sidebar - Book Info */}
        <aside className="w-80 bg-muted/30 border-r p-6 overflow-y-auto">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mb-6 w-full"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>

          <div className="space-y-6">
            {/* Thumbnail */}
            <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
              <FileText className="h-24 w-24 text-primary/40" />
            </div>

            {/* Book Details */}
            <div>
              <Badge variant="secondary" className="mb-3">{bookInfo.collection}</Badge>
              <h2 className="text-2xl font-bold mb-2">{bookInfo.title}</h2>
              <p className="text-muted-foreground mb-4">{bookInfo.author}</p>
              <p className="text-sm text-muted-foreground">{bookInfo.description}</p>
            </div>

            <Separator />

            {/* Metadata */}
            <div className="space-y-3 text-sm">
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
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-2">
              <h3 className="font-semibold mb-3">Actions</h3>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Bookmark className="h-4 w-4 mr-2" />
                Marque-page
              </Button>
            </div>

            <Separator />

            {/* Legal Notices */}
            <div className="text-xs text-muted-foreground space-y-2">
              <h4 className="font-semibold text-foreground">Conditions d'utilisation</h4>
              <p>• Paramètres du site</p>
              <p>• Empreinte carbone</p>
              <p>• Flux RSS</p>
            </div>

            <Separator />

            {/* Additional Info */}
            <div className="text-xs text-muted-foreground space-y-2">
              <h4 className="font-semibold text-foreground">Confidentialité</h4>
              <p>• Politique de confidentialité</p>
              <p>• Gestion des données</p>
              <p>• Conditions légales</p>
            </div>

            <Separator />

            <div className="text-xs text-muted-foreground space-y-2">
              <h4 className="font-semibold text-foreground">Marché public</h4>
              <p>• Marchés publics</p>
              <p>• Appels d'offres</p>
            </div>
          </div>
        </aside>

        {/* Main Content - Book Viewer */}
        <main className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-muted/30 border-b p-4">
            <div className="flex items-center justify-between">
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
                  <input 
                    type="number" 
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Math.min(totalPages, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-16 text-center border rounded px-2 py-1 text-sm"
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

              {/* View Controls */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleRotate}>
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Maximize className="h-4 w-4" />
                </Button>
                
                {/* Reading Mode Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Lecture Audio/Liseuse
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Volume2 className="h-4 w-4 mr-2" />
                      Mode Audio
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="h-4 w-4 mr-2" />
                      Mode Liseuse
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Book Display Area */}
          <div className="flex-1 overflow-auto bg-muted/10 p-8">
            <div className="max-w-5xl mx-auto">
              <Card>
                <CardContent className="p-0">
                  <div 
                    className="aspect-[3/4] bg-gradient-to-br from-background to-muted flex items-center justify-center relative overflow-hidden"
                    style={{ 
                      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                      transformOrigin: 'center',
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    {/* Simulated page content */}
                    <div className="absolute inset-0 p-12 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <FileText className="h-32 w-32 text-muted-foreground/20 mx-auto" />
                        <p className="text-2xl font-serif text-muted-foreground">
                          Page {currentPage}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Contenu de la page simulé
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Page Progress */}
          <div className="bg-muted/30 border-t p-4">
            <Slider 
              value={[currentPage]} 
              max={totalPages}
              step={1}
              onValueChange={(value) => setCurrentPage(value[0])}
              className="w-full"
            />
          </div>
        </main>

        {/* Right Sidebar - Tools */}
        <aside className="w-20 bg-muted/30 border-l flex flex-col items-center py-6 space-y-6">
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-3">
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs">Chat</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-3">
            <Info className="h-5 w-5" />
            <span className="text-xs">Info</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-3">
            <Download className="h-5 w-5" />
            <span className="text-xs">Export</span>
          </Button>
        </aside>
      </div>

      <Footer />
    </div>
  );
};

export default BookReader;
