import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, Book, Globe, Users, User, LogIn, BookOpen, FileText, Calendar, Building, Download, Phone, MapPin, Mail, UserCheck, Archive, ChevronDown } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { WatermarkContainer } from "@/components/ui/watermark";
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
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { user, profile } = useAuth();

  return (
    <WatermarkContainer 
      watermarkProps={{ 
        text: "BNRM Portal - Bibliothèque Nationale", 
        variant: "subtle", 
        position: "corner",
        opacity: 0.03
      }}
    >
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-elegant">
      <div className="container mx-auto px-4">
        {/* Top bar with language and contact */}
        <div className="flex justify-between items-center py-2 text-sm border-b border-border/50">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">{t('header.title')}</span>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Globe className="h-4 w-4" />
                  {language === 'ar' && 'العربية'}
                  {language === 'ber' && 'ⵜⴰⵎⴰⵣⵉⵖⵜ'}
                  {language === 'fr' && 'Français'}
                  {language === 'en' && 'English'}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card border border-border shadow-moroccan">
                <DropdownMenuItem 
                  onClick={() => setLanguage('ar')}
                  className={`cursor-pointer ${language === 'ar' ? 'bg-accent text-accent-foreground' : ''}`}
                >
                  العربية
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('ber')}
                  className={`cursor-pointer ${language === 'ber' ? 'bg-accent text-accent-foreground' : ''}`}
                >
                  ⵜⴰⵎⴰⵣⵉⵖⵜ
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('fr')}
                  className={`cursor-pointer ${language === 'fr' ? 'bg-accent text-accent-foreground' : ''}`}
                >
                  Français
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('en')}
                  className={`cursor-pointer ${language === 'en' ? 'bg-accent text-accent-foreground' : ''}`}
                >
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {user ? (
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {profile?.first_name || 'Dashboard'}
                  </span>
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="flex items-center space-x-2">
                  <LogIn className="h-4 w-4" />
                  <span>Connexion</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Main navigation */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-moroccan">
              <Book className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">BNRM</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Bibliothèque Nationale</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="space-x-6">
              {/* Découvrir la Bibliothèque */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50 text-foreground hover:text-primary font-medium">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Découvrir la Bibliothèque
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[600px] md:w-[700px] lg:grid-cols-2 bg-card border border-border rounded-lg shadow-moroccan">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-primary mb-3">Informations pratiques</h4>
                      <NavigationMenuLink asChild>
                        <a href="/informations-pratiques" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Horaires et accès</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Heures d'ouverture et plan d'accès
                          </p>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/services-tarifs" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Catalogue de services et tarifs</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Services proposés et grilles tarifaires
                          </p>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/visites-virtuelles" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Visites virtuelles</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Découverte virtuelle de nos espaces
                          </p>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/donateurs" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Nos donateurs</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Recherche par donateur/œuvre
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-primary mb-3">Histoire et missions</h4>
                      <NavigationMenuLink asChild>
                        <a href="/histoire" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Histoire de la bibliothèque</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Missions et valeurs prônées
                          </p>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/mot-direction" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Mot de la Direction</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Message de notre directeur
                          </p>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/organigramme" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Organigramme</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
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
                <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50 text-foreground hover:text-primary font-medium">
                  <Users className="w-4 h-4 mr-2" />
                  Accéder à nos services
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[600px] md:w-[700px] lg:grid-cols-2 bg-card border border-border rounded-lg shadow-moroccan">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-primary mb-3">Inscription et accès</h4>
                      <NavigationMenuLink asChild>
                        <a href="/inscription" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Inscription en ligne / réinscription</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Parcours "je m'inscris"
                          </p>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/consulter-bn" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Consulter la Bibliothèque Nationale</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Accès aux collections de référence
                          </p>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/reserver-ouvrage" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Réserver un ouvrage</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Réservation en ligne de documents
                          </p>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/reserver-espaces" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Réserver nos espaces</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Réservation d'espaces de travail
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-primary mb-3">Services spécialisés</h4>
                      <NavigationMenuLink asChild>
                        <a href="/depot-legal" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Dépôt légal
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Description du service et texte de loi
                          </p>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/demande-reproduction" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none flex items-center">
                            <Download className="w-4 h-4 mr-2" />
                            Demande de reproduction
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Reproduction de documents
                          </p>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/demande-restauration" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Demande de restauration</div>
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
                <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50 text-foreground hover:text-primary font-medium">
                  <Book className="w-4 h-4 mr-2" />
                  Explorer le patrimoine
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[700px] md:w-[900px] lg:grid-cols-3 bg-card border border-border rounded-lg shadow-moroccan">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-primary mb-3">Collections</h4>
                      <NavigationMenuLink asChild>
                        <a href="/collections-specialisees" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Collections spécialisées</div>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/collections-numerisees" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Collections numérisées</div>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/collections-offertes" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Collections offertes</div>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/manuscripts" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Manuscrits</div>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/monographies" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Monographies</div>
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
                <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50 text-foreground hover:text-primary font-medium">
                  <Calendar className="w-4 h-4 mr-2" />
                  Consulter nos actualités
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[500px] md:w-[600px] lg:grid-cols-2 bg-card border border-border rounded-lg shadow-moroccan">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-primary mb-3">Actualités</h4>
                      <NavigationMenuLink asChild>
                        <a href="/news" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Actualités et publications</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Nouvelles acquisitions, actualités du fonds
                          </p>
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="/ils-parlent-de-nous" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Ils parlent de nous</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Revue de presse et mentions
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-primary mb-3">Culture</h4>
                      <NavigationMenuLink asChild>
                        <a href="/programmation-culturelle" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Notre programmation culturelle</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Agenda, expositions
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Collaborer avec nous */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50 text-foreground hover:text-primary font-medium">
                  <Building className="w-4 h-4 mr-2" />
                  Collaborer avec nous
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[400px] bg-card border border-border rounded-lg shadow-moroccan">
                    <NavigationMenuLink asChild>
                      <a href="/collaborations-nationales" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Collaborations nationales</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Partenariats avec les institutions marocaines
                        </p>
                      </a>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <a href="/collaborations-internationales" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Collaborations internationales</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Échanges et coopération internationale
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Search and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block">
              <Input
                type="search"
                placeholder={t('header.search')}
                className="w-64 pl-10 pr-4 bg-background border-border focus:border-primary"
              />
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
            </div>
            
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

        {/* Mobile Search */}
        <div className="pb-4 sm:hidden">
          <div className="relative">
            <Input
              type="search"
              placeholder={t('header.searchMobile')}
              className="w-full pl-10 pr-4 bg-background border-border focus:border-primary"
            />
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-card border-t border-border shadow-elegant animate-fade-in">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <a href="#accueil" className="block py-2 text-foreground hover:text-primary transition-colors font-medium">
              {t('header.home')}
            </a>
            <a href="#catalogue" className="block py-2 text-foreground hover:text-primary transition-colors font-medium">
              {t('header.catalog')}
            </a>
            <a href="#collections" className="block py-2 text-foreground hover:text-primary transition-colors font-medium">
              {t('header.collections')}
            </a>
            <a href="#services" className="block py-2 text-foreground hover:text-primary transition-colors font-medium">
              {t('header.services')}
            </a>
            <a href="#patrimoine" className="block py-2 text-foreground hover:text-primary transition-colors font-medium">
              {t('header.heritage')}
            </a>
            <a href="#contact" className="block py-2 text-foreground hover:text-primary transition-colors font-medium">
              {t('header.contact')}
            </a>
          </nav>
        </div>
      )}
      </header>
    </WatermarkContainer>
  );
};

export default Header;