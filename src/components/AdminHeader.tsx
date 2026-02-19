import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, Settings, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logoImage from "@/assets/FINAL_LOGO_3.png";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  showNotifications?: boolean;
  showSettings?: boolean;
  backPath?: string;
}

export function AdminHeader({ 
  title, 
  subtitle, 
  badgeText, 
  showNotifications = true, 
  showSettings = true,
  backPath = '/dashboard'
}: AdminHeaderProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Bouton Retour */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(backPath)}
            className="flex items-center space-x-2 hover:bg-accent transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Retour</span>
          </Button>
          
          {/* Logo BNRM cliquable */}
          <Link to="/" className="flex items-center hover:scale-105 transition-all duration-300 group">
            <div className="w-12 h-12 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all duration-300"></div>
              <img 
                src={logoImage} 
                alt="Logo BNRM" 
                className="h-10 w-auto object-contain relative z-10 drop-shadow-lg"
              />
            </div>
          </Link>
          
          {/* Titre et badge */}
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">{title}</span>
            {badgeText && (
              <Badge variant="outline" className="ml-2">
                {badgeText}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Informations utilisateur */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium hidden sm:inline">
              {profile?.first_name} {profile?.last_name}
            </span>
            <Badge variant="default">
              {profile?.role === 'admin' ? 'Administrateur' : 
               profile?.role === 'librarian' ? 'Bibliothécaire' : 
               'Agent DL'}
            </Badge>
          </div>
          
          {/* Boutons d'action */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/my-space')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Mon Espace</span>
          </Button>
          
          {showNotifications && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/admin/settings')}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full"></span>
            </Button>
          )}
          
          {showSettings && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/admin/settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Paramètres</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* Sous-titre si présent */}
      {subtitle && (
        <div className="border-t bg-muted/50 px-4 py-2">
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        </div>
      )}
    </header>
  );
}