import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomDialog, CustomDialogContent, CustomDialogHeader, CustomDialogTitle, CustomDialogDescription, CustomDialogClose } from "@/components/ui/custom-portal-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, BookOpen, Calendar, Users, FileText, Star, Sparkles, Gift } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import emblemeMaroc from "@/assets/embleme-maroc.png";

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomePopup = ({ isOpen, onClose }: WelcomePopupProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  console.log('WelcomePopup rendered, isOpen:', isOpen);

  const handleClose = () => {
    console.log('WelcomePopup handleClose called');
    // Toujours marquer comme vu pour cette session
    sessionStorage.setItem('bnrm-welcome-popup-dismissed', 'true');
    onClose();
  };

  const handleActionClick = (path: string) => {
    handleClose();
    navigate(path);
  };

  const quickActions = [
    {
      icon: BookOpen,
      title: "Explorer les Collections",
      description: "Découvrez nos manuscrits et ouvrages patrimoniaux",
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/25",
      path: "/mediatheque"
    },
    {
      icon: FileText,
      title: "Dépôt Légal",
      description: "Effectuez votre dépôt légal en ligne",
      color: "text-accent",
      bg: "bg-accent/10",
      border: "border-accent/25",
      path: "/depot-legal"
    },
    {
      icon: Users,
      title: "Inscription",
      description: "Rejoignez notre communauté de chercheurs",
      color: "text-highlight",
      bg: "bg-highlight/10",
      border: "border-highlight/25",
      path: "/auth"
    },
    {
      icon: Calendar,
      title: "Événements",
      description: "Découvrez nos expositions et conférences",
      color: "text-gold",
      bg: "bg-gold/10",
      border: "border-gold/25",
      path: "/agenda"
    }
  ];

  return (
    <CustomDialog open={isOpen} onOpenChange={handleClose} modal={false}>
      <CustomDialogContent
        showOverlay={false}
        portal={false}
        position="relative"
        centered={false}
        className="mx-auto mt-4 !z-[9999] !max-h-none !overflow-visible max-w-4xl p-0 border-2 border-gold/30 shadow-lg bg-background rounded-lg"
      >
        <CustomDialogClose onClose={handleClose} />
        <div className="relative overflow-hidden bg-gradient-zellige-main p-6 text-white">
          <div className="absolute inset-0 bg-pattern-zellige-complex opacity-30"></div>
          <div className="absolute inset-0 bg-pattern-moroccan-stars opacity-20"></div>
          
          <div className="relative z-10">
            <CustomDialogHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img src={emblemeMaroc} alt="Emblème du Maroc" className="h-10 w-10 object-contain drop-shadow-lg" />
                  <CustomDialogTitle className="text-2xl font-moroccan font-bold text-white">
                    Bienvenue à la BNRM
                  </CustomDialogTitle>
                  <img src={emblemeMaroc} alt="Emblème du Maroc" className="h-10 w-10 object-contain drop-shadow-lg" />
                </div>
              </div>
              
              <CustomDialogDescription className="text-white/95 text-lg font-elegant italic text-center">
                "Découvrez les trésors du patrimoine marocain millénaire"
              </CustomDialogDescription>
              
              <div className="flex justify-center space-x-1 mt-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-gold fill-gold animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </CustomDialogHeader>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Announcements Section */}
          <Card className="relative overflow-hidden border-3 border-primary/20 shadow-zellige">
            <div className="absolute inset-0 bg-pattern-filigrane opacity-10"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center space-x-2 mb-4">
                <Gift className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-moroccan font-bold text-foreground">Nouveautés & Annonces</h3>
                <Badge variant="secondary" className="bg-gold/20 text-gold border border-gold/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Nouveau
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-mosaique p-4 rounded-lg border border-gold/20">
                  <h4 className="font-semibold text-foreground mb-2">📚 Nouvelle Collection Numérique</h4>
                  <p className="text-muted-foreground text-sm">
                    Découvrez plus de 5000 manuscrits anciens désormais disponibles en ligne avec une navigation interactive et des outils de recherche avancés.
                  </p>
                </div>
                
                <div className="bg-gradient-primary/10 p-4 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-foreground mb-2">🎭 Exposition Temporaire</h4>
                  <p className="text-muted-foreground text-sm">
                    "L'Art de la Calligraphie Marocaine" - Du 15 janvier au 30 mars 2024. Découvrez l'évolution de l'écriture arabe au Maroc à travers les siècles.
                  </p>
                </div>
                
                <div className="bg-gradient-accent/10 p-4 rounded-lg border border-accent/20">
                  <h4 className="font-semibold text-foreground mb-2">💻 Services Numériques Améliorés</h4>
                  <p className="text-muted-foreground text-sm">
                    Nouveau système de réservation en ligne, téléchargement haute définition et assistant IA pour vous aider dans vos recherches.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="relative overflow-hidden border-3 border-gold/20 shadow-mosaique">
            <div className="absolute inset-0 bg-pattern-zellige-tiles opacity-15"></div>
            <CardContent className="p-6 relative z-10">
              <h3 className="text-xl font-moroccan font-bold text-foreground mb-4 text-center">
                Actions Rapides
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleActionClick(action.path)}
                    className={`p-4 rounded-lg ${action.bg} border-2 ${action.border} hover:shadow-zellige transition-all duration-300 transform hover:scale-105 cursor-pointer group relative overflow-hidden text-left w-full`}
                  >
                    <div className="absolute inset-0 bg-pattern-filigrane opacity-5 group-hover:opacity-15 transition-opacity duration-300"></div>
                    <div className="flex items-start space-x-3 relative z-10">
                      <action.icon className={`h-6 w-6 ${action.color} mt-1 group-hover:scale-110 transition-transform duration-300`} />
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{action.title}</h4>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t border-border">
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleClose}>
                Fermer
              </Button>
              <Button onClick={handleClose} className="bg-gradient-neutral hover:bg-gradient-neutral/90">
                Commencer l'exploration
              </Button>
            </div>
          </div>
        </div>
      </CustomDialogContent>
    </CustomDialog>
  );
};

export default WelcomePopup;