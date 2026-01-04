import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import InteractiveMap from "@/components/InteractiveMap";
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Info,
  Download,
  Users,
  BookOpen,
  FileText,
  Building2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const PracticalInfo = () => {
  const navigate = useNavigate();

  const openingHours = [
    {
      space: "Accueil et Inscription",
      icon: Users,
      regular: "Lundi au vendredi : 09h - 19h\nSamedi : 10h - 16h",
      ramadan: "Lundi au vendredi : 09h - 17h\nSamedi : 10h - 14h",
      summer: "Lundi au vendredi : 08h30 - 19h\nSamedi : 09h - 14h",
      notes: null
    },
    {
      space: "Espace grand public",
      icon: BookOpen,
      regular: "Lundi au vendredi : 09h - 19h\nSamedi : 10h - 16h",
      ramadan: "Lundi au vendredi : 09h - 17h\nSamedi : 10h - 14h",
      summer: "Lundi au vendredi : 08h30 - 19h\nSamedi : 09h - 14h",
      notes: null
    },
    {
      space: "Espace chercheurs",
      icon: Users,
      regular: "Lundi au vendredi : 09h - 19h\nSamedi : 10h - 16h",
      ramadan: "Lundi au vendredi : 09h - 17h\nSamedi : 10h - 14h",
      summer: "Lundi au vendredi : 08h30 - 19h\nSamedi : 09h - 14h",
      notes: "Arrêt des communications : 17h30 (12h30 samedi)\nFermé pendant le mois d'août"
    },
    {
      space: "Espace collections spécialisées",
      icon: FileText,
      regular: "Lundi au vendredi : 09h - 19h",
      ramadan: "Lundi au vendredi : 09h - 15h",
      summer: null,
      notes: "Fermé samedi\nArrêt des communications : 15h30\nFermé pendant le mois d'août"
    },
    {
      space: "Espaces audiovisuels et malvoyants",
      icon: Users,
      regular: "Lundi au vendredi : 09h - 19h",
      ramadan: "Lundi au vendredi : 09h - 15h",
      summer: null,
      notes: "Fermé samedi\nArrêt des communications : 15h30\nFermé pendant le mois d'août"
    },
    {
      space: "Site Ibn Batouta",
      icon: Building2,
      regular: "Lundi au jeudi : 09h - 15h\nVendredi : 09h - 12h30",
      ramadan: "Lundi au jeudi : 09h - 13h\nVendredi : 09h - 12h",
      summer: null,
      notes: "Fermé samedi"
    }
  ];

  const registrationDocs = [
    {
      category: "Nouvelle inscription",
      docs: [
        "Photocopie de la CIN ou du passeport",
        "1 photo d'identité récente",
        "Justificatif de résidence (facture d'eau, électricité...)",
        "Attestation de travail ou carte d'étudiant (si applicable)"
      ]
    },
    {
      category: "Réinscription",
      docs: [
        "Ancienne carte de lecteur",
        "Photocopie de la CIN ou du passeport",
        "1 photo d'identité récente"
      ]
    }
  ];

  const services = [
    {
      title: "Reproduction de documents",
      description: "Service de reproduction numérique et photocopie selon les conditions de conservation",
      icon: FileText
    },
    {
      title: "Formation des usagers",
      description: "Sessions de formation sur l'utilisation des ressources et des catalogues",
      icon: Users
    },
    {
      title: "Services aux publics à besoins spécifiques",
      description: "Espaces adaptés et équipements spécialisés pour les malvoyants",
      icon: Users
    },
    {
      title: "Consultation sur place",
      description: "Accès gratuit aux collections et ressources numériques",
      icon: BookOpen
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&h=400&fit=crop')"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-royal/85"></div>
          <div className="absolute inset-0 bg-pattern-zellige opacity-5"></div>
        </div>

        <div className="relative h-full container mx-auto px-4 flex items-center">
          <div className="max-w-3xl animate-fade-in">
            <Button
              variant="ghost"
              onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}
              className="text-white hover:bg-white/10 mb-6 -ml-2"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour
            </Button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-gold border border-white/20">
                <Info className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-gold/20 text-white border-gold/30 backdrop-blur-sm">
                Guide pratique
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
              Informations <span className="text-gold">Pratiques</span>
            </h1>
            
            <div className="w-32 h-1.5 bg-gradient-accent mb-8 rounded-full shadow-glow"></div>
            
            <p className="text-xl md:text-2xl text-white/95 leading-relaxed font-light">
              Tout ce que vous devez savoir pour profiter pleinement des services de la Bibliothèque Nationale
            </p>
          </div>
        </div>

        <div className="absolute top-10 right-10 w-32 h-32 bg-gold/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-coral/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </section>

      {/* Contact rapide */}
      <section className="py-8 bg-accent/5 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p className="font-semibold">Avenue Al Atlas, Hay Ryad, Rabat</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-semibold">+212 537 77 71 90</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">contact@bnrm.ma</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Horaires d'ouverture */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-soft">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Horaires d'ouverture</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {openingHours.map((schedule, index) => {
                      const Icon = schedule.icon;
                      return (
                        <div key={index} className="border-b last:border-0 pb-6 last:pb-0">
                          <div className="flex items-center gap-2 mb-4">
                            <Icon className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-lg">{schedule.space}</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div className="bg-accent/10 p-4 rounded-lg">
                              <p className="text-sm font-semibold text-primary mb-2">Horaires normaux</p>
                              <p className="text-sm whitespace-pre-line">{schedule.regular}</p>
                            </div>
                            <div className="bg-accent/10 p-4 rounded-lg">
                              <p className="text-sm font-semibold text-primary mb-2">Ramadan</p>
                              <p className="text-sm whitespace-pre-line">{schedule.ramadan}</p>
                            </div>
                            {schedule.summer && (
                              <div className="bg-accent/10 p-4 rounded-lg">
                                <p className="text-sm font-semibold text-primary mb-2">Été</p>
                                <p className="text-sm whitespace-pre-line">{schedule.summer}</p>
                              </div>
                            )}
                          </div>
                          
                          {schedule.notes && (
                            <div className="flex items-start gap-2 mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-amber-800 dark:text-amber-200 whitespace-pre-line">{schedule.notes}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Modalités d'inscription */}
              <Card className="shadow-soft">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Modalités d'inscription</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {registrationDocs.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-lg font-semibold">
                          {item.category}
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2">
                            {item.docs.map((doc, docIndex) => (
                              <li key={docIndex} className="flex items-start gap-2">
                                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <span>{doc}</span>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Informations importantes
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground ml-6">
                      <li>• L'inscription est gratuite</li>
                      <li>• La carte est valable 1 an</li>
                      <li>• Le renouvellement se fait chaque année</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Services disponibles */}
              <Card className="shadow-soft">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Services disponibles</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service, index) => {
                      const Icon = service.icon;
                      return (
                        <div key={index} className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold mb-1">{service.title}</h4>
                              <p className="text-sm text-muted-foreground">{service.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Documents utiles */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" />
                    Documents utiles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="https://www.bnrm.ma/bnrm/media/Reglement_du_bon_usager.pdf" target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      Règlement du bon usager
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="https://www.bnrm.ma/bnrm/images/guide_depot_legal.pdf" target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      Guide Dépôt Légal
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/help')}>
                    <Info className="mr-2 h-4 w-4" />
                    Guide d'utilisation
                  </Button>
                </CardContent>
              </Card>

              {/* Plan d'accès */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Plan d'accès
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] rounded-lg mb-4 overflow-hidden">
                    <InteractiveMap
                      center={[-6.8395, 33.9808]}
                      zoom={15}
                      markerTitle="Bibliothèque Nationale du Royaume du Maroc"
                      markerDescription="Avenue Al Atlas, Hay Ryad, Rabat"
                    />
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold">Bibliothèque Nationale du Royaume du Maroc</p>
                    <p className="text-muted-foreground">Avenue Al Atlas, Hay Ryad</p>
                    <p className="text-muted-foreground">Rabat, Maroc</p>
                    <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                      <a 
                        href="https://www.google.com/maps/dir/?api=1&destination=33.9808,-6.8395" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        Obtenir l'itinéraire
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Contact */}
              <Card className="bg-gradient-primary text-primary-foreground shadow-moroccan">
                <CardContent className="p-6 text-center">
                  <Phone className="h-12 w-12 mx-auto mb-4 opacity-90" />
                  <h3 className="text-xl font-bold mb-3">
                    Une question ?
                  </h3>
                  <p className="text-primary-foreground/90 text-sm mb-4">
                    Notre équipe est à votre disposition
                  </p>
                  <Button variant="secondary" className="w-full">
                    Nous contacter
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PracticalInfo;