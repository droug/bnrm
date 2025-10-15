import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  const [dontShowAgain, setDontShowAgain] = useState(false);

  console.log('WelcomePopup rendered, isOpen:', isOpen);

  const handleClose = () => {
    console.log('WelcomePopup handleClose called, dontShowAgain:', dontShowAgain);
    if (dontShowAgain) {
      localStorage.setItem('bnrm-welcome-popup-dismissed', 'true');
    }
    onClose();
  };

  const quickActions = [
    {
      icon: BookOpen,
      title: "Explorer les Collections",
      description: "Découvrez nos manuscrits et ouvrages patrimoniaux",
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/25"
    },
    {
      icon: FileText,
      title: "Dépôt Légal",
      description: "Effectuez votre dépôt légal en ligne",
      color: "text-accent",
      bg: "bg-accent/10",
      border: "border-accent/25"
    },
    {
      icon: Users,
      title: "Inscription",
      description: "Rejoignez notre communauté de chercheurs",
      color: "text-highlight",
      bg: "bg-highlight/10",
      border: "border-highlight/25"
    },
    {
      icon: Calendar,
      title: "Événements",
      description: "Découvrez nos expositions et conférences",
      color: "text-gold",
      bg: "bg-gold/10",
      border: "border-gold/25"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} modal={true}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-3 border-gold/30 shadow-mosaique" style={{ zIndex: 9999999 }}>
        {/* Header with Moroccan design */}
        <div className="relative overflow-hidden bg-gradient-zellige-main p-6 text-white">
          <div className="absolute inset-0 bg-pattern-zellige-complex opacity-30"></div>
          <div className="absolute inset-0 bg-pattern-moroccan-stars opacity-20"></div>
          
          <div className="relative z-10">
            <DialogHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img src={emblemeMaroc} alt="Emblème du Maroc" className="h-10 w-10 object-contain drop-shadow-lg" />
                  <DialogTitle className="text-2xl font-moroccan font-bold text-white">
                    Bienvenue à la BNRM
                  </DialogTitle>
                  <img src={emblemeMaroc} alt="Emblème du Maroc" className="h-10 w-10 object-contain drop-shadow-lg" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-white/80 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <DialogDescription className="text-white/95 text-lg font-elegant italic text-center">
                "Découvrez les trésors du patrimoine marocain millénaire"
              </DialogDescription>
              
              <div className="flex justify-center space-x-1 mt-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-gold fill-gold animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </DialogHeader>
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
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${action.bg} border-2 ${action.border} hover:shadow-zellige transition-all duration-300 transform hover:scale-105 cursor-pointer group relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-pattern-filigrane opacity-5 group-hover:opacity-15 transition-opacity duration-300"></div>
                    <div className="flex items-start space-x-3 relative z-10">
                      <action.icon className={`h-6 w-6 ${action.color} mt-1 group-hover:scale-110 transition-transform duration-300`} />
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{action.title}</h4>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dontShowAgain"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked === true)}
              />
              <label htmlFor="dontShowAgain" className="text-sm text-muted-foreground cursor-pointer">
                Ne plus afficher ce message d'accueil
              </label>
            </div>
            
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
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;