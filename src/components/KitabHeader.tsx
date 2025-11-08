import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe, User, LogIn, Accessibility, Bot, ChevronDown } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import SmartChatBot from "@/components/SmartChatBot";
import { AccessibilityToolkit } from "@/components/AccessibilityToolkit";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoImage from "@/assets/logo-kitab.png";

const KitabHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b-2 shadow-lg bg-background/95 backdrop-blur-lg border-[hsl(var(--kitab-primary))]/20">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex justify-between items-center py-2 border-b border-[hsl(var(--kitab-primary))]/20">
          {/* Logo + Titre */}
          <Link to="/kitab" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logoImage} alt="Logo Kitab" className="h-12 w-auto" />
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Accessibilité */}
            <AccessibilityToolkit />

            {/* Langue */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{language === 'fr' ? 'AR' : 'FR'}</span>
            </Button>

            {/* Chatbot */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChatBotOpen(true)}
              className="gap-2"
            >
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">Assistant</span>
            </Button>

            {/* Utilisateur */}
            {user ? (
              <Link to="/profile">
                <Button variant="outline" size="sm" className="gap-2 border-[hsl(var(--kitab-primary))]/40">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{profile?.first_name || 'Profil'}</span>
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="gap-2 border-[hsl(var(--kitab-primary))]/40">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Connexion</span>
                </Button>
              </Link>
            )}

            {/* Menu mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center justify-center gap-1 py-2">
          <Link to="/kitab">
            <Button variant="ghost" size="sm" className="hover:text-[hsl(var(--kitab-primary))] hover:bg-[hsl(var(--kitab-primary))]/10">
              Accueil Kitab
            </Button>
          </Link>
          <Link to="/kitab/about">
            <Button variant="ghost" size="sm" className="hover:text-[hsl(var(--kitab-primary))] hover:bg-[hsl(var(--kitab-primary))]/10">
              À Propos
            </Button>
          </Link>
          <Link to="/kitab/new-publications">
            <Button variant="ghost" size="sm" className="hover:text-[hsl(var(--kitab-primary))] hover:bg-[hsl(var(--kitab-primary))]/10">
              Nouvelles Parutions
            </Button>
          </Link>
          <Link to="/bibliographies" state={{ fromKitab: true }}>
            <Button variant="ghost" size="sm" className="hover:text-[hsl(var(--kitab-primary))] hover:bg-[hsl(var(--kitab-primary))]/10">
              Bibliographie Nationale
            </Button>
          </Link>
          <Link to="/kitab/rapports-edition">
            <Button variant="ghost" size="sm" className="hover:text-[hsl(var(--kitab-primary))] hover:bg-[hsl(var(--kitab-primary))]/10">
              Rapports d'édition
            </Button>
          </Link>
          <Link to="/kitab/upcoming">
            <Button variant="ghost" size="sm" className="hover:text-[hsl(var(--kitab-primary))] hover:bg-[hsl(var(--kitab-primary))]/10">
              À Paraître
            </Button>
          </Link>
          
          {/* Menu Répertoires */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:text-[hsl(var(--kitab-primary))] hover:bg-[hsl(var(--kitab-primary))]/10 gap-1">
                Répertoires
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-background border-[hsl(var(--kitab-primary))]/20">
              <DropdownMenuItem asChild>
                <Link to="/kitab/repertoire-editeurs" className="w-full cursor-pointer">
                  Répertoire des éditeurs
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/kitab/repertoire-auteurs" className="w-full cursor-pointer">
                  Répertoire des auteurs
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/kitab/repertoire-imprimeurs" className="w-full cursor-pointer">
                  Répertoire des imprimeurs
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/kitab/repertoire-distributeurs" className="w-full cursor-pointer">
                  Répertoire des distributeurs
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link to="/kitab/faq">
            <Button variant="ghost" size="sm" className="hover:text-[hsl(var(--kitab-primary))] hover:bg-[hsl(var(--kitab-primary))]/10">
              Contact
            </Button>
          </Link>
          <div className="h-6 w-px bg-border mx-2" />
          <Link to="/">
            <Button variant="outline" size="sm" className="border-[hsl(var(--kitab-primary))]/40 hover:bg-[hsl(var(--kitab-primary))]/10">
              Retour BNRM
            </Button>
          </Link>
        </nav>

        {/* Navigation Mobile */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-[hsl(var(--kitab-primary))]/20 space-y-2">
            <Link to="/kitab" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                Accueil Kitab
              </Button>
            </Link>
            <Link to="/kitab/about" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                À Propos
              </Button>
            </Link>
            <Link to="/kitab/new-publications" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                Nouvelles Parutions
              </Button>
            </Link>
            <Link to="/bibliographies" state={{ fromKitab: true }} onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                Bibliographie Nationale
              </Button>
            </Link>
            <Link to="/kitab/rapports-edition" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                Rapports d'édition
              </Button>
            </Link>
            <Link to="/kitab/upcoming" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                À Paraître
              </Button>
            </Link>
            
            {/* Répertoires Mobile */}
            <div className="border-t border-[hsl(var(--kitab-primary))]/20 my-2" />
            <div className="text-xs font-semibold text-muted-foreground px-3 py-2">Répertoires</div>
            <Link to="/kitab/repertoire-editeurs" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start pl-6">
                Répertoire des éditeurs
              </Button>
            </Link>
            <Link to="/kitab/repertoire-auteurs" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start pl-6">
                Répertoire des auteurs
              </Button>
            </Link>
            <Link to="/kitab/repertoire-imprimeurs" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start pl-6">
                Répertoire des imprimeurs
              </Button>
            </Link>
            <Link to="/kitab/repertoire-distributeurs" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start pl-6">
                Répertoire des distributeurs
              </Button>
            </Link>
            
            <div className="border-t border-[hsl(var(--kitab-primary))]/20 my-2" />
            <Link to="/kitab/faq" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                Contact
              </Button>
            </Link>
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              <Button variant="outline" size="sm" className="w-full justify-start border-[hsl(var(--kitab-primary))]/40">
                Retour BNRM
              </Button>
            </Link>
          </nav>
        )}
      </div>

      {/* ChatBot */}
      <SmartChatBot isOpen={isChatBotOpen} onClose={() => setIsChatBotOpen(false)} />
    </header>
  );
};

export default KitabHeader;
