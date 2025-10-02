import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, Book, Globe, Users, User, LogIn, BookOpen, FileText, Calendar, Building, Download, Phone, MapPin, Mail, UserCheck, Archive, ChevronDown, Accessibility, Bot, MessageCircle, Shield } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import ChatBot from "@/components/ChatBot";
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
  const { user, profile } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b-4 border-primary/30 shadow-2xl">
      <div className="container mx-auto px-4">
        {/* Bannière réduite et plus compacte */}
        <div className="flex justify-between items-center py-3 text-base bg-gradient-to-r from-primary/20 via-secondary/15 to-primary/20 border-b-2 border-primary/30 relative overflow-hidden">
          {/* Effet de fond décoratif */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 animate-pulse"></div>
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-secondary/10 rounded-full blur-2xl"></div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="flex flex-col">
              <span className="text-foreground font-bold text-2xl tracking-wide mb-1 animate-fade-in">
                {t('header.title')}
              </span>
              <span className="text-muted-foreground text-sm italic">
                Bibliothèque Nationale du Royaume du Maroc
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6 relative z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-foreground border-primary/30 hover:border-primary bg-background/80 backdrop-blur-sm hover:bg-primary/10 flex items-center gap-2 px-4 py-2 transition-all duration-300 hover:scale-105"
                >
                  <Globe className="h-5 w-5" />
                  <span className="font-medium">
                    {language === 'ar' && 'العربية'}
                    {language === 'ber' && 'ⵜⴰⵎⴰⵣⵉⵖⵜ'}
                    {language === 'fr' && 'Français'}
                    {language === 'en' && 'English'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/95 backdrop-blur-lg border border-primary/20 shadow-2xl min-w-[180px] z-50">
                <DropdownMenuItem 
                  onClick={() => setLanguage('ar')}
                  className={`cursor-pointer p-3 text-base transition-all duration-200 hover:bg-primary/10 ${language === 'ar' ? 'bg-primary/20 text-primary font-medium' : ''}`}
                >
                  <span className="mr-3">🇲🇦</span>
                  العربية
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('ber')}
                  className={`cursor-pointer p-3 text-base transition-all duration-200 hover:bg-primary/10 ${language === 'ber' ? 'bg-primary/20 text-primary font-medium' : ''}`}
                >
                  <span className="mr-3">ⵣ</span>
                  ⵜⴰⵎⴰⵣⵉⵖⵜ
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('fr')}
                  className={`cursor-pointer p-3 text-base transition-all duration-200 hover:bg-primary/10 ${language === 'fr' ? 'bg-primary/20 text-primary font-medium' : ''}`}
                >
                  <span className="mr-3">🇫🇷</span>
                  Français
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('en')}
                  className={`cursor-pointer p-3 text-base transition-all duration-200 hover:bg-primary/10 ${language === 'en' ? 'bg-primary/20 text-primary font-medium' : ''}`}
                >
                  <span className="mr-3">🇺🇸</span>
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Outils d'assistance et d'accessibilité */}
            <div className="flex items-center space-x-3">
              {/* Toolkit d'accessibilité */}
              <AccessibilityToolkit />
              
              {/* Chatbot intelligent */}
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsChatBotOpen(!isChatBotOpen)}
                className={`text-foreground border-primary/30 hover:border-primary bg-background/80 backdrop-blur-sm hover:bg-primary/10 flex items-center gap-2 px-4 py-2 transition-all duration-300 hover:scale-105 relative ${
                  isChatBotOpen ? 'bg-primary/20 border-primary' : ''
                }`}
                title="Assistant IA - Aide et recherche intelligente"
              >
                <Bot className="h-5 w-5" />
                <span className="font-medium hidden lg:inline">
                  Assistant IA
                </span>
                {!isChatBotOpen && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border border-green-600"></div>
                )}
              </Button>
            </div>
            
            {/* Connexion utilisateur */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/my-library-space">
                  <Button variant="outline" size="lg" className="flex items-center gap-2 px-4 py-2 transition-all duration-300 hover:scale-105 hover:shadow-lg border-primary/30 hover:border-primary">
                    <BookOpen className="h-5 w-5" />
                    <span className="hidden lg:inline font-medium">
                      Mon Espace
                    </span>
                  </Button>
                </Link>
                
                {/* Menu utilisateur avec dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" size="lg" className="flex items-center gap-2 px-6 py-2 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                      <User className="h-5 w-5" />
                      <span className="hidden sm:inline font-medium">
                        {profile?.first_name || 'Mon Compte'}
                      </span>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-lg border border-primary/20 shadow-2xl z-50">
                    <DropdownMenuItem asChild className="cursor-pointer p-3 text-base transition-all duration-200 hover:bg-primary/10">
                      <Link to="/profile" className="flex items-center gap-3">
                        <User className="h-4 w-4" />
                        <span>Mon Profil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer p-3 text-base transition-all duration-200 hover:bg-primary/10">
                      <Link to="/dashboard" className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4" />
                        <span>Tableau de bord</span>
                      </Link>
                    </DropdownMenuItem>
                    {(profile?.role === 'admin' || profile?.role === 'librarian') && (
                      <DropdownMenuItem asChild className="cursor-pointer p-3 text-base transition-all duration-200 hover:bg-primary/10">
                        <Link to="/admin/settings" className="flex items-center gap-3">
                          <Shield className="h-4 w-4" />
                          <span>Administration</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link to="/auth">
                <Button size="lg" className="flex items-center gap-2 px-6 py-2 transition-all duration-300 hover:scale-105 hover:shadow-lg bg-primary hover:bg-primary/90">
                  <LogIn className="h-5 w-5" />
                  <span className="font-medium">{t('nav.login')}</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Navigation principale compacte */}
        <div className="flex items-center justify-between py-4 relative">
          {/* Bouton Retour + Logo BNRM */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 hover:bg-accent transition-all duration-300"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Retour</span>
            </Button>
            
            {/* Logo compact avec effet hover */}
            <Link to="/" className="flex items-center hover:scale-105 transition-all duration-300 group">
              <div className="w-20 h-20 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all duration-300"></div>
                <img 
                  src={logoImage} 
                  alt="Logo BNRM" 
                  className="h-16 w-auto object-contain relative z-10 drop-shadow-lg"
                />
              </div>
            </Link>
          </div>

          {/* Navigation Desktop agrandie et améliorée */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="space-x-8">
              {/* Découvrir la Bibliothèque */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-primary/10 text-foreground hover:text-primary font-semibold text-lg px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-primary/20">
                  <BookOpen className="w-5 h-5 mr-3" />
                  {t('nav.discover')}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-4 p-8 w-[700px] md:w-[800px] lg:grid-cols-2 bg-background/95 backdrop-blur-lg border-2 border-primary/20 rounded-2xl shadow-2xl">
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-primary mb-4 border-b border-primary/20 pb-2">{t('nav.practical.info')}</h4>
                      <NavigationMenuLink asChild>
                        <a href="/informations-pratiques" className="block select-none space-y-2 rounded-xl p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:scale-102 border border-transparent hover:border-primary/20">
                          <div className="text-base font-semibold leading-none">{t('nav.schedules.access')}</div>
                          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                            Heures d'ouverture et plan d'accès
                          </p>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/services-tarifs" className="block select-none space-y-2 rounded-xl p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:scale-102 border border-transparent hover:border-primary/20">
                          <div className="text-base font-semibold leading-none">{t('nav.services.catalog')}</div>
                          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                            Services proposés et grilles tarifaires
                          </p>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/visites-virtuelles" className="block select-none space-y-2 rounded-xl p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:scale-102 border border-transparent hover:border-primary/20">
                          <div className="text-base font-semibold leading-none">{t('nav.virtual.tours')}</div>
                          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                            Découverte virtuelle de nos espaces
                          </p>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/donateurs" className="block select-none space-y-2 rounded-xl p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:scale-102 border border-transparent hover:border-primary/20">
                          <div className="text-base font-semibold leading-none">{t('nav.donors')}</div>
                          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                            Recherche par donateur/œuvre
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-primary mb-4 border-b border-primary/20 pb-2">{t('nav.history.missions')}</h4>
                      <NavigationMenuLink asChild>
                        <a href="/histoire" className="block select-none space-y-2 rounded-xl p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:scale-102 border border-transparent hover:border-primary/20">
                          <div className="text-base font-semibold leading-none">{t('nav.library.history')}</div>
                          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                            Missions et valeurs prônées
                          </p>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/mot-direction" className="block select-none space-y-2 rounded-xl p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:scale-102 border border-transparent hover:border-primary/20">
                          <div className="text-base font-semibold leading-none">{t('nav.management.message')}</div>
                          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                            Message de notre directeur
                          </p>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/organigramme" className="block select-none space-y-2 rounded-xl p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:scale-102 border border-transparent hover:border-primary/20">
                          <div className="text-base font-semibold leading-none">{t('nav.organization.chart')}</div>
                          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                            Structure organisationnelle
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Accéder à nos services */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-primary/10 text-foreground hover:text-primary font-semibold text-lg px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-primary/20">
                  <Users className="w-5 h-5 mr-3" />
                  {t('nav.services')}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-4 p-8 w-[700px] md:w-[800px] lg:grid-cols-2 bg-background/95 backdrop-blur-lg border-2 border-primary/20 rounded-2xl shadow-2xl">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-primary mb-3">{t('nav.inscription.access')}</h4>
                      <NavigationMenuLink asChild>
                        <a href="/inscription" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">{t('nav.online.registration')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Parcours "je m'inscris"
                          </p>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/digital-library" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">{t('nav.consult.national.library')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Accès à la Bibliothèque Numérique
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/reserver-ouvrage" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">{t('nav.reserve.book')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Réservation en ligne de documents
                          </p>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/reserver-espaces" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">{t('nav.reserve.spaces')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Réservation d'espaces de travail
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-primary mb-3">Services spécialisés</h4>
                      <NavigationMenuLink asChild>
                        <Link to="/depot-legal" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            {t('nav.legal.deposit')}
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Description du service et texte de loi
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/demande-reproduction" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none flex items-center">
                            <Download className="w-4 h-4 mr-2" />
                            {t('nav.reproduction.request')}
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Reproduction de documents
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/demande-restauration" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">{t('nav.restoration.request')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Restauration de documents anciens
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Explorer le patrimoine */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-primary/10 text-foreground hover:text-primary font-semibold text-lg px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-primary/20">
                  <Book className="w-5 h-5 mr-3" />
                  {t('nav.explore')}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-4 p-8 w-[800px] md:w-[1000px] lg:grid-cols-3 bg-background/95 backdrop-blur-lg border-2 border-primary/20 rounded-2xl shadow-2xl">
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-primary mb-4 border-b border-primary/20 pb-2">{t('nav.collections')}</h4>
                      <NavigationMenuLink asChild>
                        <a href="/collections-specialisees" className="block select-none space-y-2 rounded-xl p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:scale-102 border border-transparent hover:border-primary/20">
                          <div className="text-base font-semibold leading-none">{t('nav.specialized.collections')}</div>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/collections-numerisees" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">{t('nav.digitized.collections')}</div>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/collections-offertes" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">{t('nav.donated.collections')}</div>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/manuscripts" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">{t('nav.manuscripts')}</div>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/monographies" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">{t('nav.monographs')}</div>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/periodiques" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Périodiques</div>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/audiovisuels" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Audiovisuels et multimédias</div>
                        </a>
                      </NavigationMenuLink>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-primary mb-3">Catalogues</h4>
                      <NavigationMenuLink asChild>
                        <a href="/catalogue-general" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Catalogue général en ligne</div>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/archives-manuscrits" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Archives et manuscrits</div>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/autres-catalogues" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Autres catalogues et bases</div>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/catalogue-numerise" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Catalogue numérisé</div>
                        </a>
                      </NavigationMenuLink>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-primary mb-3">Ressources</h4>
                      <NavigationMenuLink asChild>
                        <a href="/galerie-medias" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Galerie des médias</div>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/lire-ecouter-voir" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Lire écouter et voir</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Bibliographies, rapports, trésors
                          </p>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/chercher-document" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none flex items-center">
                            <Search className="w-4 h-4 mr-2" />
                            Chercher un document
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Recherche avancée
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Consulter nos actualités */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-primary/10 text-foreground hover:text-primary font-semibold text-lg px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-primary/20">
                  <Calendar className="w-5 h-5 mr-3" />
                  {t('nav.consult.news')}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-4 p-8 w-[600px] md:w-[700px] lg:grid-cols-2 bg-background/95 backdrop-blur-lg border-2 border-primary/20 rounded-2xl shadow-2xl">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-primary mb-3">{t('nav.news.section')}</h4>
                      <NavigationMenuLink asChild>
                        <a href="/news" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">{t('nav.news.publications')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {t('nav.news.publications.desc')}
                          </p>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/ils-parlent-de-nous" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
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
                        <a href="/programmation-culturelle" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
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
                <NavigationMenuTrigger className="bg-transparent hover:bg-primary/10 text-foreground hover:text-primary font-semibold text-lg px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-primary/20">
                  <Building className="w-5 h-5 mr-3" />
                  {t('nav.collaborate')}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-4 p-8 w-[500px] bg-background/95 backdrop-blur-lg border-2 border-primary/20 rounded-2xl shadow-2xl">
                    <NavigationMenuLink asChild>
                      <a href="/collaborations-nationales" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">{t('nav.national.collaborations')}</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          {t('nav.national.collaborations.desc')}
                        </p>
                      </a>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <a href="/collaborations-internationales" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
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

        {/* Barre de recherche mobile - toujours accessible */}
        <div className="pb-6 sm:hidden">
          <SearchBar 
            variant="compact"
            showSuggestions={true}
            className="w-full border-2 border-primary/20 rounded-xl shadow-sm"
            placeholder="Recherche avancée..."
          />
        </div>
      </div>

      {/* Menu Mobile Navigation amélioré */}
      {isMenuOpen && (
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
        <ChatBot 
          isOpen={isChatBotOpen} 
          onClose={() => setIsChatBotOpen(false)} 
        />
      )}
      </header>
  );
};

export default Header;