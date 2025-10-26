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
                <Button variant="ghost" size="sm" className={`gap-2 h-11 text-base font-medium ${isHomePage ? 'text-white hover:bg-white/20' : ''}`}>
                  <Building className="h-4 w-4" />
                  <span className="hidden md:inline">Portails</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-popover z-50">
                <DropdownMenuItem asChild className="text-base font-medium">
                  <Link to="/" className="cursor-pointer">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Portail Principal
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-base font-medium">
                  <Link to="/digital-library" className="cursor-pointer">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Bibliothèque Numérique
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-base font-medium">
                  <Link to="/plateforme-manuscrits" className="cursor-pointer">
                    <FileText className="h-4 w-4 mr-2" />
                    Manuscrits Numérisés
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-base font-medium">
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
                <Button variant="ghost" size="sm" className={`gap-1 px-2 h-11 text-base font-medium ${isHomePage ? 'text-white hover:bg-white/20' : ''}`}>
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {language === 'ar' && 'ع'}
                    {language === 'ber' && 'ⵣ'}
                    {language === 'fr' && 'FR'}
                    {language === 'en' && 'EN'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover border border-primary/20 z-50">
                <DropdownMenuItem onClick={() => setLanguage('ar')} className="cursor-pointer text-base font-medium">
                  🇲🇦 العربية
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ber')} className="cursor-pointer text-base font-medium">
                  ⵣ ⵜⴰⵎⴰⵣⵉⵖⵜ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('fr')} className="cursor-pointer text-base font-medium">
                  🇫🇷 Français
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer text-base font-medium">
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
                    <Button variant="ghost" size="sm" className={`gap-1 px-2 h-11 text-base font-medium ${isHomePage ? 'text-white hover:bg-white/20' : ''}`}>
                      <User className="h-4 w-4" />
                      <span className="hidden md:inline max-w-[80px] truncate">
                        {profile?.first_name || 'Compte'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border border-primary/20 z-50">
                    <DropdownMenuItem asChild className="cursor-pointer text-base font-medium">
                      <Link to="/my-library-space" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Mon Espace
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer text-base font-medium">
                      <Link to="/wallet" className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        e-Wallet
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer text-base font-medium">
                      <Link to="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Mon Profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer text-base font-medium">
                      <Link to="/dashboard" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Tableau de bord
                      </Link>
                    </DropdownMenuItem>
                    {(profile?.role === 'admin' || profile?.role === 'librarian') && (
                      <DropdownMenuItem asChild className="cursor-pointer text-base font-medium">
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
                <NavigationMenuTrigger className={`bg-transparent hover:bg-primary/10 h-11 text-base font-medium px-3 ${isHomePage ? 'text-white hover:text-white' : ''}`} title={t('nav.discover')}>
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span className="hidden lg:inline">{t('nav.discover')}</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="z-50">
                  <div className="grid gap-2 p-4 w-[650px] lg:grid-cols-2 bg-popover border border-primary/20 shadow-xl">
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-primary mb-2">Informations pratiques</h4>
                      <NavigationMenuLink asChild>
                        <Link to="/practical-info" className="block p-3 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded border-l-2 border-transparent hover:border-primary">
                          <div className="font-semibold">Horaires et accès</div>
                          <div className="text-xs text-muted-foreground mt-1">Consultez nos horaires d'ouverture et comment nous rejoindre</div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/services-tarifs" className="block p-3 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded border-l-2 border-transparent hover:border-primary">
                          <div className="font-semibold">Catalogue de services et tarifs</div>
                          <div className="text-xs text-muted-foreground mt-1">Découvrez nos services et leurs tarifs</div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/visites-virtuelles" className="block p-3 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded border-l-2 border-transparent hover:border-primary">
                          <div className="font-semibold">Visites virtuelles</div>
                          <div className="text-xs text-muted-foreground mt-1">Explorez la bibliothèque depuis chez vous</div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/donateurs" className="block p-3 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded border-l-2 border-transparent hover:border-primary">
                          <div className="font-semibold">Nos donateurs</div>
                          <div className="text-xs text-muted-foreground mt-1">Recherchez par donateurs ou par œuvre</div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-primary mb-2">Histoire et missions</h4>
                      <NavigationMenuLink asChild>
                        <Link to="/histoire" className="block p-3 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded border-l-2 border-transparent hover:border-primary">
                          <div className="font-semibold">Histoire de la bibliothèque</div>
                          <div className="text-xs text-muted-foreground mt-1">Missions et valeurs prônées</div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/mot-direction" className="block p-3 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded border-l-2 border-transparent hover:border-primary">
                          <div className="font-semibold">Mot de la Direction</div>
                          <div className="text-xs text-muted-foreground mt-1">Message du directeur de la BNRM</div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/organigramme" className="block p-3 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded border-l-2 border-transparent hover:border-primary">
                          <div className="font-semibold">Organigramme</div>
                          <div className="text-xs text-muted-foreground mt-1">Structure organisationnelle de la BNRM</div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Services */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={`bg-transparent hover:bg-primary/10 h-11 text-base font-medium px-3 ${isHomePage ? 'text-white hover:text-white' : ''}`} title={t('nav.services')}>
                  <Users className="w-4 h-4 mr-1" />
                  <span className="hidden lg:inline">{t('nav.services')}</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="z-50">
                  <div className="grid gap-2 p-4 w-[650px] lg:grid-cols-2 bg-popover border border-primary/20 shadow-xl">
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-primary mb-2">Services aux usagers</h4>
                      <NavigationMenuLink asChild>
                        <Link to="/auth?action=signup" className="block p-3 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded border-l-2 border-transparent hover:border-primary">
                          <div className="font-semibold">Inscription en ligne / Réinscription</div>
                          <div className="text-xs text-muted-foreground mt-1">Créez votre compte ou renouvelez votre abonnement</div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/digital-library" className="block p-3 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded border-l-2 border-transparent hover:border-primary">
                          <div className="font-semibold">Consulter la Bibliothèque Nationale</div>
                          <div className="text-xs text-muted-foreground mt-1">Accédez à notre bibliothèque numérique</div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/cbm/notice-example" className="block p-3 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded border-l-2 border-transparent hover:border-primary">
                          <div className="font-semibold">Réserver un ouvrage</div>
                          <div className="text-xs text-muted-foreground mt-1">Réservez un document pour consultation</div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/my-library-space" className="block p-3 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded border-l-2 border-transparent hover:border-primary">
                          <div className="font-semibold">Réserver nos espaces</div>
                          <div className="text-xs text-muted-foreground mt-1">Réservez un espace de travail ou une salle</div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-primary mb-2">Services spécialisés</h4>
                      <NavigationMenuLink asChild>
                        <Link to="/legal-deposit" className="block p-3 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded border-l-2 border-transparent hover:border-primary">
                          <div className="font-semibold">Dépôt légal</div>
                          <div className="text-xs text-muted-foreground mt-1">Service obligatoire selon le Dahir n° 1-60-050 (1960)</div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/demande-reproduction" className="block p-3 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded border-l-2 border-transparent hover:border-primary">
                          <div className="font-semibold">Demande de reproduction</div>
                          <div className="text-xs text-muted-foreground mt-1">Commandez des reproductions de documents</div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/my-library-space" className="block p-3 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded border-l-2 border-transparent hover:border-primary">
                          <div className="font-semibold">Demande de restauration</div>
                          <div className="text-xs text-muted-foreground mt-1">Service de restauration de documents anciens</div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Explorer */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={`bg-transparent hover:bg-primary/10 h-11 text-base font-medium px-3 ${isHomePage ? 'text-white hover:text-white' : ''}`} title={t('nav.explore')}>
                  <Book className="w-4 h-4 mr-1" />
                  <span className="hidden lg:inline">{t('nav.explore')}</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="z-50">
                  <div className="grid gap-3 p-5 w-[900px] lg:grid-cols-3 bg-popover border border-primary/20 shadow-xl">
                    {/* Colonne 1 - Galerie et Collections */}
                    <div className="space-y-2">
                      <NavigationMenuLink asChild>
                        <Link to="/galerie-medias" className="block p-3 text-base font-semibold text-primary hover:bg-primary/10 rounded border-l-2 border-primary">
                          Galerie des médias
                        </Link>
                      </NavigationMenuLink>
                      
                      <div className="pt-2">
                        <h4 className="text-sm font-bold text-primary mb-2 px-2">Collections</h4>
                        <NavigationMenuLink asChild>
                          <Link to="/collections-specialisees" className="block p-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded">
                            Collections spécialisées
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="/collections-numerisees" className="block p-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded">
                            Collections numérisées
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="/collections-offertes" className="block p-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded">
                            Collections offertes
                          </Link>
                        </NavigationMenuLink>
                        <div className="ml-3 mt-1 space-y-1">
                          <NavigationMenuLink asChild>
                            <Link to="/plateforme-manuscrits" className="block p-1.5 text-xs text-muted-foreground hover:text-primary rounded">
                              • Manuscrits
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link to="/monographies" className="block p-1.5 text-xs text-muted-foreground hover:text-primary rounded">
                              • Monographies
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link to="/periodiques" className="block p-1.5 text-xs text-muted-foreground hover:text-primary rounded">
                              • Périodiques
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link to="/bouquets-abonnements" className="block p-1.5 text-xs text-muted-foreground hover:text-primary rounded">
                              • Bouquets des abonnements
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link to="/audiovisuelles" className="block p-1.5 text-xs text-muted-foreground hover:text-primary rounded">
                              • Audiovisuelles et multimédias
                            </Link>
                          </NavigationMenuLink>
                        </div>
                      </div>
                    </div>

                    {/* Colonne 2 - Catalogue général */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-primary mb-2 px-2">Catalogue général en ligne</h4>
                      
                      <div>
                        <p className="text-xs font-semibold text-foreground px-2 mb-1">Lire, écouter et voir</p>
                        <NavigationMenuLink asChild>
                          <Link to="/bibliographies" className="block p-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded">
                            Bibliographies
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="/rapports-activites" className="block p-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded">
                            Rapport d'activités
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="/tresors" className="block p-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded">
                            Trésors
                          </Link>
                        </NavigationMenuLink>
                      </div>

                      <div className="pt-2">
                        <NavigationMenuLink asChild>
                          <Link to="/archives-manuscrits" className="block p-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded">
                            Archives et manuscrits
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="/autres-catalogues" className="block p-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded">
                            Autres catalogues et bases
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="/digital-library" className="block p-2 text-sm font-medium text-primary hover:bg-primary/10 rounded border-l-2 border-primary/50">
                            📚 Catalogue numérisé (Plateforme BN)
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </div>

                    {/* Colonne 3 - Recherche avancée */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-primary mb-2 px-2">Chercher un document</h4>
                      <NavigationMenuLink asChild>
                        <Link to="/recherche-avancee" className="block p-2 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded bg-accent/30">
                          🔍 Recherche avancée
                        </Link>
                      </NavigationMenuLink>
                      
                      <div className="pt-2 space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground px-2 mb-2">Documents en accès libre :</p>
                        <NavigationMenuLink asChild>
                          <Link to="/recherche-avancee?type=livres-periodiques" className="block p-2 text-xs text-foreground hover:bg-primary/10 hover:text-primary rounded">
                            • Livres et périodiques conservés
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="/recherche-avancee?type=manuscrits-archives" className="block p-2 text-xs text-foreground hover:bg-primary/10 hover:text-primary rounded">
                            • Manuscrits modernes et archives
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="/recherche-avancee?type=iconographiques" className="block p-2 text-xs text-foreground hover:bg-primary/10 hover:text-primary rounded">
                            • Documents iconographiques (estampes, photos, affiches)
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="/recherche-avancee?type=periodiques-extraits" className="block p-2 text-xs text-foreground hover:bg-primary/10 hover:text-primary rounded">
                            • Périodiques (extraits)
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Consulter nos actualités */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={`bg-transparent hover:bg-primary/10 h-11 text-base font-medium px-3 ${isHomePage ? 'text-white hover:text-white' : ''}`}>
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className="hidden lg:inline">{t('nav.consult.news')}</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="z-50">
                  <div className="grid gap-3 p-5 w-[700px] lg:grid-cols-2 bg-popover border border-primary/20 shadow-xl">
                    {/* Colonne 1 - Actualités */}
                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-primary mb-2">Actualités</h4>
                      <NavigationMenuLink asChild>
                        <Link to="/news" className="block p-3 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded border-l-2 border-transparent hover:border-primary">
                          <div className="font-semibold">Actualités et publications</div>
                          <div className="text-xs text-muted-foreground mt-1">Nouvelles acquisitions et actualités du fonds documentaire</div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/ils-parlent-de-nous" className="block p-3 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded border-l-2 border-transparent hover:border-primary">
                          <div className="font-semibold">Ils parlent de nous</div>
                          <div className="text-xs text-muted-foreground mt-1">La BNRM dans les médias et publications</div>
                        </Link>
                      </NavigationMenuLink>
                    </div>

                    {/* Colonne 2 - Programmation culturelle */}
                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-primary mb-2">Notre programmation culturelle</h4>
                      <NavigationMenuLink asChild>
                        <Link to="/programmation-culturelle" className="block p-3 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded border-l-2 border-transparent hover:border-primary">
                          <div className="font-semibold">Programmation culturelle</div>
                          <div className="text-xs text-muted-foreground mt-1">Découvrez nos activités culturelles</div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/agenda" className="block p-3 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded border-l-2 border-transparent hover:border-primary">
                          <div className="font-semibold">Agenda</div>
                          <div className="text-xs text-muted-foreground mt-1">Calendrier de nos événements</div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/expositions" className="block p-3 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded border-l-2 border-transparent hover:border-primary">
                          <div className="font-semibold">Nos expositions</div>
                          <div className="text-xs text-muted-foreground mt-1">Expositions actuelles et passées</div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Collaborer avec nous */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={`bg-transparent hover:bg-primary/10 h-11 text-base font-medium px-3 ${isHomePage ? 'text-white hover:text-white' : ''}`}>
                  <Building className="w-4 h-4 mr-1" />
                  <span className="hidden lg:inline">{t('nav.collaborate')}</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="z-50">
                  <div className="grid gap-2 p-4 w-[500px] bg-popover border border-primary/20 shadow-xl">
                    <NavigationMenuLink asChild>
                      <a href="/collaborations-nationales" className="block p-2 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded">
                        <div className="font-medium">{t('nav.national.collaborations')}</div>
                        <p className="text-sm text-muted-foreground">
                          {t('nav.national.collaborations.desc')}
                        </p>
                      </a>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <a href="/collaborations-internationales" className="block p-2 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded">
                        <div className="font-medium">{t('nav.international.collaborations')}</div>
                        <p className="text-sm text-muted-foreground">
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
              
              <a href="/services" className="flex items-center gap-3 py-3 px-4 text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded-xl border border-transparent hover:border-primary/20">
                <Users className="w-5 h-5" />
                <span className="font-medium">{t('nav.services')}</span>
              </a>
              
              <a href="/collections" className="flex items-center gap-3 py-3 px-4 text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded-xl border border-transparent hover:border-primary/20">
                <Book className="w-5 h-5" />
                <span className="font-medium">{t('nav.explore')}</span>
              </a>
              
              <a href="/news" className="flex items-center gap-3 py-3 px-4 text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded-xl border border-transparent hover:border-primary/20">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">{t('nav.consult.news')}</span>
              </a>
              
              <a href="/collaboration" className="flex items-center gap-3 py-3 px-4 text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded-xl border border-transparent hover:border-primary/20">
                <Building className="w-5 h-5" />
                <span className="font-medium">{t('nav.collaborate')}</span>
              </a>
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