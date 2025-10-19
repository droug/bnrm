import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, Book, Globe, Users, User, LogIn, BookOpen, FileText, Calendar, Building, Download, Phone, MapPin, Mail, UserCheck, Archive, ChevronDown, Accessibility, Bot, MessageCircle, Shield, HelpCircle, Network } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SmartChatBot from "@/components/SmartChatBot";
import { AccessibilityToolkit } from "@/components/AccessibilityToolkit";
// import { WatermarkContainer, Watermark } from "@/components/ui/watermark"; // Removed to fix runtime error
import logoImage from "@/assets/logo-bnrm.png";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  
  // Pages d'accueil principales (pas de bouton retour)
  const isDigitalLibraryHome = location.pathname === "/digital-library";
  const isManuscriptsPlatformHome = location.pathname === "/plateforme-manuscrits" || location.pathname === "/manuscripts-platform";
  
  // Vérifier si on est sur une des plateformes spéciales
  const isDigitalLibrary = location.pathname.startsWith("/digital-library");
  const isManuscriptsPlatform = location.pathname === "/plateforme-manuscrits" || location.pathname === "/manuscripts-platform";
  const isManuscriptsHelp = location.pathname === "/manuscripts/help" || location.pathname === "/aide-manuscrits";
  const isBackoffice = location.pathname.startsWith("/admin/manuscripts-backoffice") || location.pathname.startsWith("/admin/digital-library");
  const isCBMPortal = location.pathname.startsWith("/cbm");
  const hideNavigation = isDigitalLibrary || isManuscriptsPlatform || isManuscriptsHelp || isBackoffice || isCBMPortal;
  
  // Afficher le bouton retour sur toutes les pages SAUF les pages d'accueil principales
  const showBackButton = !isHomePage && !isDigitalLibraryHome && !isManuscriptsPlatformHome;

  return (
    <header className={`sticky top-0 z-50 border-b-2 shadow-lg ${isHomePage ? 'bg-transparent border-transparent' : 'bg-background/95 backdrop-blur-lg border-primary/20'}`}>
      <div className={`container mx-auto px-4 ${isHomePage ? 'text-white' : ''}`}>
        {/* Bannière ultra-compacte */}
        <div className={`flex justify-between items-center py-2 ${isHomePage ? 'border-b border-white/20' : 'border-b border-primary/20'}`}>
          {/* Logo + Titre compact */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logoImage} alt="Logo BNRM" className="h-10 w-auto" />
            <span className="font-bold text-sm hidden lg:inline">
              {t('header.title')}
            </span>
          </Link>
          
          {/* Bouton de gestion pour les plateformes spéciales (admin/librarian uniquement) */}
          {(profile?.role === 'admin' || profile?.role === 'librarian') && (
            <>
              {isManuscriptsPlatform && (
                <Link to="/admin/manuscripts-backoffice">
                  <Button variant="outline" size="sm" className={`gap-2 ${isHomePage ? 'border-white/40 text-white hover:bg-white/20' : 'border-gold/40 hover:border-gold hover:bg-gold/10'}`}>
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Gestion Manuscrits Numérisés</span>
                    <span className="sm:hidden">Gestion</span>
                  </Button>
                </Link>
              )}
              {isDigitalLibrary && (
                <Link to="/admin/digital-library">
                  <Button variant="outline" size="sm" className={`gap-2 ${isHomePage ? 'border-white/40 text-white hover:bg-white/20' : 'border-gold/40 hover:border-gold hover:bg-gold/10'}`}>
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Gestion Bibliothèque Numérique</span>
                    <span className="sm:hidden">Gestion</span>
                  </Button>
                </Link>
              )}
            </>
          )}

          {/* Mon Espace pour la plateforme des manuscrits */}
          {isManuscriptsPlatform && user && (
            <Link to="/mon-espace-manuscrits">
              <Button variant="outline" size="sm" className={`gap-2 ${isHomePage ? 'border-white/40 text-white hover:bg-white/20' : ''}`}>
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Mon Espace</span>
              </Button>
            </Link>
          )}

          {/* Actions compactes */}
          <div className="flex items-center gap-2">
            {/* Navigation Portails */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={`gap-2 ${isHomePage ? 'text-white hover:bg-white/20' : ''}`}>
                  <Building className="h-4 w-4" />
                  <span className="hidden md:inline">Portails</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem asChild>
                  <Link to="/" className="cursor-pointer">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Portail Principal
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/digital-library" className="cursor-pointer">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Bibliothèque Numérique
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/plateforme-manuscrits" className="cursor-pointer">
                    <FileText className="h-4 w-4 mr-2" />
                    Manuscrits Numérisés
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/cbm" className="cursor-pointer">
                    <Network className="h-4 w-4 mr-2" />
                    Portail CBM
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Langue - icône seulement sur mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={`gap-1 px-2 ${isHomePage ? 'text-white hover:bg-white/20' : ''}`}>
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">
                    {language === 'ar' && 'ع'}
                    {language === 'ber' && 'ⵣ'}
                    {language === 'fr' && 'FR'}
                    {language === 'en' && 'EN'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border border-primary/20 z-50">
                <DropdownMenuItem onClick={() => setLanguage('ar')} className="cursor-pointer text-sm">
                  🇲🇦 العربية
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ber')} className="cursor-pointer text-sm">
                  ⵣ ⵜⴰⵎⴰⵣⵉⵖⵜ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('fr')} className="cursor-pointer text-sm">
                  🇫🇷 Français
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer text-sm">
                  🇺🇸 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Accessibilité - icône seulement */}
            <AccessibilityToolkit />
            
            {/* Chatbot - icône seulement */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChatBotOpen(!isChatBotOpen)}
              className={`px-2 relative ${isChatBotOpen ? 'bg-primary/10' : ''} ${isHomePage ? 'text-white hover:bg-white/20' : ''}`}
              title="Assistant IA"
            >
              <Bot className="h-4 w-4" />
              {!isChatBotOpen && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </Button>
            
            {/* Utilisateur */}
            {user ? (
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className={`gap-1 px-2 ${isHomePage ? 'text-white hover:bg-white/20' : ''}`}>
                      <User className="h-4 w-4" />
                      <span className="hidden md:inline text-xs max-w-[80px] truncate">
                        {profile?.first_name || 'Compte'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border border-primary/20 z-50">
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/my-library-space" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Mon Espace
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/wallet" className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        e-Wallet
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Mon Profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/dashboard" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Tableau de bord
                      </Link>
                    </DropdownMenuItem>
                    {(profile?.role === 'admin' || profile?.role === 'librarian') && (
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link to="/admin/settings" className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Administration
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className={`px-2 ${isHomePage ? 'text-white hover:bg-white/20' : 'hover:bg-destructive/10 text-destructive'}`}
                  title="Déconnexion"
                >
                  <LogIn className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button size="sm" className={`gap-1 px-3 ${isHomePage ? 'bg-white text-primary hover:bg-white/90' : ''}`}>
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">{t('nav.login')}</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Bouton Retour - affiché sur toutes les pages sauf les pages d'accueil principales */}
        {showBackButton && (
          <div className="border-b py-2">
            <div className="container mx-auto px-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="gap-2 hover:bg-accent transition-all duration-300"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Retour</span>
              </Button>
            </div>
          </div>
        )}

        {/* Navigation principale ultra-compacte - cachée sur certaines plateformes */}
        {!hideNavigation && (
          <div className="flex items-center justify-between py-2">

          {/* Navigation Desktop compacte avec icônes */}
          <NavigationMenu className="hidden md:flex flex-1 justify-center">
            <NavigationMenuList className="space-x-1">
              {/* Découvrir */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={`bg-transparent hover:bg-primary/10 text-sm px-3 py-2 ${isHomePage ? 'text-white hover:text-white' : ''}`} title={t('nav.discover')}>
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span className="hidden lg:inline">{t('nav.discover')}</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="z-50">
                  <div className="grid gap-2 p-4 w-[500px] lg:grid-cols-2 bg-background border border-primary/20 shadow-xl">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-primary mb-1 pb-1">{t('nav.practical.info')}</h4>
                      <NavigationMenuLink asChild>
                        <Link to="/practical-info" className="block p-2 text-xs text-foreground hover:bg-primary/10 hover:text-primary rounded">
                          {t('nav.schedules.access')}
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/services-tarifs" className="block p-2 text-xs text-foreground hover:bg-primary/10 hover:text-primary rounded">
                          {t('nav.services.catalog')}
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/help" className="block p-2 text-xs text-foreground hover:bg-primary/10 hover:text-primary rounded">
                          {language === 'ar' ? 'مركز المساعدة' : 'Centre d\'Aide'}
                        </Link>
                      </NavigationMenuLink>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-primary mb-1 pb-1">{t('nav.history.missions')}</h4>
                      <NavigationMenuLink asChild>
                        <Link to="/histoire" className="block p-2 text-xs text-foreground hover:bg-primary/10 hover:text-primary rounded">
                          {t('nav.library.history')}
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/mot-direction" className="block p-2 text-xs text-foreground hover:bg-primary/10 hover:text-primary rounded">
                          {t('nav.management.message')}
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Services */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={`bg-transparent hover:bg-primary/10 text-sm px-3 py-2 ${isHomePage ? 'text-white hover:text-white' : ''}`} title={t('nav.services')}>
                  <Users className="w-4 h-4 mr-1" />
                  <span className="hidden lg:inline">{t('nav.services')}</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="z-50">
                  <div className="grid gap-2 p-4 w-[400px] bg-background border border-primary/20 shadow-xl">
                    <div className="space-y-1">
                      <NavigationMenuLink asChild>
                        <Link to="/digital-library" className="block p-2 text-xs text-foreground hover:bg-primary/10 hover:text-primary rounded">
                          {t('nav.consult.national.library')}
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/legal-deposit" className="block p-2 text-xs text-foreground hover:bg-primary/10 hover:text-primary rounded">
                          {t('nav.legal.deposit')}
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/demande-reproduction" className="block p-2 text-xs text-foreground hover:bg-primary/10 hover:text-primary rounded">
                          {t('nav.reproduction.request')}
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Explorer */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={`bg-transparent hover:bg-primary/10 text-sm px-3 py-2 ${isHomePage ? 'text-white hover:text-white' : ''}`} title={t('nav.explore')}>
                  <Book className="w-4 h-4 mr-1" />
                  <span className="hidden lg:inline">{t('nav.explore')}</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="z-50">
                  <div className="grid gap-2 p-4 w-[450px] lg:grid-cols-2 bg-background border border-primary/20 shadow-xl">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-primary mb-1">{t('nav.collections')}</h4>
                      <NavigationMenuLink asChild>
                        <Link to="/plateforme-manuscrits" className="block p-2 text-xs text-foreground hover:bg-primary/10 hover:text-primary rounded bg-accent/50 font-semibold">
                          📜 Plateforme Manuscrits (BNRM & Partenaires)
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/manuscripts" className="block p-2 text-xs text-foreground hover:bg-primary/10 hover:text-primary rounded">
                          {t('nav.manuscripts')}
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/collections-numerisees" className="block p-2 text-xs text-foreground hover:bg-primary/10 hover:text-primary rounded">
                          {t('nav.digitized.collections')}
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/news" className="block p-2 text-xs text-foreground hover:bg-primary/10 hover:text-primary rounded">
                          {t('nav.news.events')}
                        </Link>
                      </NavigationMenuLink>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-primary mb-1">Ressources</h4>
                      <NavigationMenuLink asChild>
                        <a href="/catalogue-general" className="block p-2 text-xs text-foreground hover:bg-primary/10 hover:text-primary rounded">
                          Catalogue général
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/bibliographies" className="block p-2 text-xs text-foreground hover:bg-primary/10 hover:text-primary rounded">
                          Bibliographies
                        </a>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Consulter nos actualités */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={`bg-transparent hover:bg-primary/10 font-semibold text-lg px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-primary/20 ${isHomePage ? 'text-white hover:text-white' : 'text-foreground hover:text-primary'}`}>
                  <Calendar className="w-5 h-5 mr-3" />
                  {t('nav.consult.news')}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-4 p-8 w-[600px] md:w-[700px] lg:grid-cols-2 bg-background/95 backdrop-blur-lg border-2 border-primary/20 rounded-2xl shadow-2xl">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-primary mb-3">{t('nav.news.section')}</h4>
                      <NavigationMenuLink asChild>
                        <Link to="/news" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-foreground">
                          <div className="text-sm font-medium leading-none">{t('nav.news.publications')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {t('nav.news.publications.desc')}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/ils-parlent-de-nous" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-foreground">
                          <div className="text-sm font-medium leading-none">{t('nav.they.talk.about.us')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {t('nav.they.talk.about.us.desc')}
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-primary mb-3">{t('nav.culture.section')}</h4>
                      <NavigationMenuLink asChild>
                        <a href="/programmation-culturelle" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-foreground">
                          <div className="text-sm font-medium leading-none">{t('nav.cultural.programming')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {t('nav.cultural.programming.desc')}
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Collaborer avec nous */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={`bg-transparent hover:bg-primary/10 font-semibold text-lg px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-primary/20 ${isHomePage ? 'text-white hover:text-white' : 'text-foreground hover:text-primary'}`}>
                  <Building className="w-5 h-5 mr-3" />
                  {t('nav.collaborate')}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-4 p-8 w-[500px] bg-background/95 backdrop-blur-lg border-2 border-primary/20 rounded-2xl shadow-2xl">
                    <NavigationMenuLink asChild>
                      <a href="/collaborations-nationales" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-foreground">
                        <div className="text-sm font-medium leading-none">{t('nav.national.collaborations')}</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          {t('nav.national.collaborations.desc')}
                        </p>
                      </a>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <a href="/collaborations-internationales" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-foreground">
                        <div className="text-sm font-medium leading-none">{t('nav.international.collaborations')}</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          {t('nav.international.collaborations.desc')}
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Outils et Actions - Barre de recherche avancée et outils d'accessibilité */}
          <div className="flex items-center space-x-4">
            {/* Barre de recherche avancée - toujours visible */}
            <div className="hidden sm:block w-80">
              <SearchBar 
                variant="compact"
                showSuggestions={true}
                className="w-full border-2 border-primary/20 rounded-xl hover:border-primary/40 transition-all duration-300 shadow-sm focus-within:shadow-md"
                placeholder="Recherche avancée dans nos collections..."
              />
            </div>
            
            {/* Outils d'accessibilité et assistance */}
            <div className="flex items-center space-x-2">
              {/* Toolkit d'accessibilité */}
              <AccessibilityToolkit />
              
              {/* Assistant IA / Chatbot */}
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsChatBotOpen(!isChatBotOpen)}
                className={`text-foreground border-2 border-primary/30 hover:border-primary bg-background/80 backdrop-blur-sm hover:bg-primary/10 flex items-center gap-2 px-4 py-2 transition-all duration-300 hover:scale-105 relative ${
                  isChatBotOpen ? 'bg-primary/20 border-primary' : ''
                }`}
                title="Assistant IA - Aide et recherche intelligente"
              >
                <Bot className="h-5 w-5" />
                <span className="font-medium hidden md:inline">
                  Assistant IA
                </span>
                {!isChatBotOpen && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border border-green-600"></div>
                )}
              </Button>
            </div>
            
            {/* Menu mobile toggle */}
            <Button
              variant="outline"
              size="lg"
              className="md:hidden border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 hover:scale-105"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        )}

        {/* Barre de recherche mobile - toujours accessible */}
        {!hideNavigation && (
          <div className="pb-6 sm:hidden">
            <SearchBar 
              variant="compact"
              showSuggestions={true}
              className="w-full border-2 border-primary/20 rounded-xl shadow-sm"
              placeholder="Recherche avancée..."
            />
          </div>
        )}
      </div>

      {/* Menu Mobile Navigation amélioré */}
      {!hideNavigation && isMenuOpen && (
        <div className="md:hidden bg-background/98 backdrop-blur-lg border-t-4 border-primary/30 shadow-2xl animate-slide-in-right">
          <nav className="container mx-auto px-6 py-8 space-y-6">
            {/* Liens principaux avec icônes */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary border-b border-primary/20 pb-2">Navigation</h3>
              
              <Link to="/" className="flex items-center gap-3 py-3 px-4 text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded-xl border border-transparent hover:border-primary/20">
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">{t('nav.discover')}</span>
              </Link>
              
              <Link to="/services" className="flex items-center gap-3 py-3 px-4 text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded-xl border border-transparent hover:border-primary/20">
                <Users className="w-5 h-5" />
                <span className="font-medium">{t('nav.services')}</span>
              </Link>
              
              <Link to="/collections" className="flex items-center gap-3 py-3 px-4 text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded-xl border border-transparent hover:border-primary/20">
                <Book className="w-5 h-5" />
                <span className="font-medium">{t('nav.explore')}</span>
              </Link>
              
              <Link to="/news" className="flex items-center gap-3 py-3 px-4 text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded-xl border border-transparent hover:border-primary/20">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">{t('nav.consult.news')}</span>
              </Link>
              
              <Link to="/collaboration" className="flex items-center gap-3 py-3 px-4 text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded-xl border border-transparent hover:border-primary/20">
                <Building className="w-5 h-5" />
                <span className="font-medium">{t('nav.collaborate')}</span>
              </Link>
            </div>

            {/* Outils d'assistance mobile */}
            <div className="space-y-3 pt-4 border-t border-primary/20">
              <h4 className="text-base font-semibold text-primary">Outils d'assistance</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Assistant IA et Accessibilité disponibles dans la barre du haut</span>
              </div>
            </div>

            {/* Section contact rapide */}
            <div className="space-y-3 pt-4 border-t border-primary/20">
              <h4 className="text-base font-semibold text-primary">Contact rapide</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+212 5 37 77 30 01</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>contact@bnrm.ma</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Rabat, Maroc</span>
              </div>
            </div>
          </nav>
        </div>
      )}
      
      {/* Chatbot intelligent */}
      {isChatBotOpen && (
        <SmartChatBot 
          isOpen={isChatBotOpen} 
          onClose={() => setIsChatBotOpen(false)} 
        />
      )}
      </header>
  );
};

export default Header;