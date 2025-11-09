import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Wallet, 
  CreditCard, 
  FileText, 
  Book,
  BookOpen,
  Building,
  CheckCircle,
  Theater,
  ArrowRight,
  Shield,
  Lock,
  Zap,
  Wrench,
  Scan
} from "lucide-react";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import { DailyPassForm } from "@/components/daily-pass/DailyPassForm";

export default function PaymentServices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [isDailyPassFormOpen, setIsDailyPassFormOpen] = useState(false);

  // Ouvrir automatiquement le formulaire si le paramètre URL est présent
  useEffect(() => {
    if (searchParams.get('open') === 'daily-pass') {
      setIsDailyPassFormOpen(true);
    }
  }, [searchParams]);

  const services = [
    {
      id: "wallet",
      title: "e-Wallet BNRM",
      description: "Portefeuille électronique sécurisé pour tous vos paiements BNRM",
      icon: Wallet,
      color: "from-blue-500 to-blue-600",
      features: [
        "Rechargement instantané",
        "Historique des transactions",
        "Paiement rapide sans contact",
        "Sécurisé avec cryptage"
      ],
      action: () => navigate("/wallet"),
      available: true
    },
    {
      id: "daily-pass",
      title: "Pass journalier",
      description: "Accès illimité à la bibliothèque nationale pour une journée",
      icon: CreditCard,
      color: "from-indigo-500 to-indigo-600",
      features: [
        "Accès toutes salles de lecture",
        "Espaces de travail inclus",
        "100% GRATUIT",
        "Limité à 1 fois par an"
      ],
      action: () => setIsDailyPassFormOpen(true),
      available: true
    },
    {
      id: "reproduction",
      title: "Reproduction de documents",
      description: "Demandez la reproduction de documents et manuscrits",
      icon: FileText,
      color: "from-green-500 to-green-600",
      features: [
        "Demande en ligne",
        "Paiement sécurisé",
        "Suivi de commande",
        "Livraison rapide"
      ],
      action: () => navigate("/cbm/demande-reproduction"),
      available: true
    },
    {
      id: "restoration",
      title: "Demande de restauration",
      description: "Confiez-nous la restauration de vos documents et œuvres précieuses",
      icon: Wrench,
      color: "from-amber-500 to-amber-600",
      features: [
        "Expertise qualifiée",
        "Techniques modernes",
        "Préservation du patrimoine",
        "Devis personnalisé"
      ],
      action: () => navigate("/demande-restauration"),
      available: true
    },
    {
      id: "digitization",
      title: "Demande de numérisation",
      description: "Demandez la numérisation de vos documents dans différents formats",
      icon: Scan,
      color: "from-cyan-500 to-cyan-600",
      features: [
        "Haute résolution",
        "Formats multiples",
        "Livraison rapide",
        "Tarification compétitive"
      ],
      action: () => navigate("/demande-numerisation"),
      available: true
    },
    {
      id: "book-reservation",
      title: "Réserver un document",
      description: "Réservez vos documents et consultez-les sur place ou en ligne",
      icon: BookOpen,
      color: "from-teal-500 to-teal-600",
      features: [
        "Réservation en ligne",
        "Consultation sur place",
        "Accès numérique",
        "Notification instantanée"
      ],
      action: () => navigate("/cbm/recherche-avancee"),
      available: true
    },
    {
      id: "legal-deposit",
      title: "Dépôt légal",
      description: "Effectuez vos démarches de dépôt légal en ligne",
      icon: Book,
      color: "from-purple-500 to-purple-600",
      features: [
        "Attribution ISBN/ISSN/ISMN",
        "Validation rapide",
        "Paiement en ligne",
        "Certificat numérique"
      ],
      action: () => navigate("/admin/legal-deposit"),
      available: user ? true : false
    },
    {
      id: "bnrm-services",
      title: "Services BNRM",
      description: "Accédez à l'ensemble des services de la BNRM",
      icon: Building,
      color: "from-orange-500 to-orange-600",
      features: [
        "Tarification transparente",
        "Services variés",
        "Paiement flexible",
        "Support client"
      ],
      action: () => navigate("/tarifs-bnrm"),
      available: true
    },
    {
      id: "cultural-activities",
      title: "Réservation des espaces culturels",
      description: "Réservez nos espaces pour vos événements culturels",
      icon: Theater,
      color: "from-pink-500 to-pink-600",
      features: [
        "Espaces modulables",
        "Équipements professionnels",
        "Services complémentaires",
        "Tarification adaptée"
      ],
      action: () => navigate("/cultural-activities-booking"),
      available: true
    }
  ];

  const paymentMethods = [
    {
      name: "Carte bancaire",
      icon: CreditCard,
      description: "Visa, Mastercard, CMI",
      secure: true
    },
    {
      name: "e-Wallet BNRM",
      icon: Wallet,
      description: "Portefeuille électronique",
      secure: true
    },
    {
      name: "Virement bancaire",
      icon: Building,
      description: "Transfert sécurisé",
      secure: true
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-primary-dark to-secondary text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block mb-6">
                <Badge variant="secondary" className="text-lg px-6 py-2 bg-white/20 hover:bg-white/30">
                  <Shield className="h-5 w-5 mr-2" />
                  Paiements sécurisés
                </Badge>
              </div>
              <h1 className="text-5xl font-bold mb-6">
                Services de la BNRM
              </h1>
              <p className="text-xl opacity-90 mb-8 leading-relaxed">
                Découvrez nos solutions de paiement sécurisées pour tous vos besoins 
                liés aux services de la Bibliothèque Nationale du Royaume du Maroc
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Paiement sécurisé SSL</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Conformité PCI DSS</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Protection des données</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Cards */}
        <section className="py-16 bg-accent/5">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Nos services</h2>
                <p className="text-muted-foreground text-lg">
                  Choisissez le service adapté à vos besoins
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {services.map((service) => {
                  const Icon = service.icon;
                  return (
                    <Card key={service.id} className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-4 rounded-2xl bg-gradient-to-br ${service.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="h-8 w-8" />
                          </div>
                          {service.available ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Disponible
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              Connexion requise
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-2xl">{service.title}</CardTitle>
                        <CardDescription className="text-base">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3 mb-6">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-3 text-sm">
                              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button 
                          className="w-full group-hover:translate-x-1 transition-transform"
                          size="lg"
                          onClick={service.action}
                          disabled={!service.available}
                        >
                          Accéder au service
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Moyens de paiement acceptés</h2>
                <p className="text-muted-foreground text-lg">
                  Payez en toute sécurité avec les méthodes de votre choix
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <Card key={method.name} className="text-center hover:shadow-lg transition-shadow">
                      <CardContent className="pt-8">
                        <div className="flex justify-center mb-4">
                          <div className="p-4 rounded-full bg-primary/10">
                            <Icon className="h-10 w-10 text-primary" />
                          </div>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{method.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {method.description}
                        </p>
                        {method.secure && (
                          <Badge variant="outline" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Sécurisé
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-6">
                Vos paiements en toute sécurité
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                La sécurité de vos transactions est notre priorité absolue. 
                Nous utilisons les technologies les plus avancées pour protéger vos données.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center">
                  <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Cryptage SSL/TLS</h3>
                  <p className="text-sm text-muted-foreground">
                    Toutes vos données sont cryptées de bout en bout
                  </p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">3D Secure</h3>
                  <p className="text-sm text-muted-foreground">
                    Protection supplémentaire pour vos paiements par carte
                  </p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Traitement instantané</h3>
                  <p className="text-sm text-muted-foreground">
                    Paiements validés en temps réel
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary-dark text-white border-0">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Prêt à commencer ?
                </h2>
                <p className="text-xl opacity-90 mb-8">
                  Créez votre compte et accédez à tous nos services de paiement
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {user ? (
                    <Button 
                      size="lg" 
                      variant="secondary"
                      className="gap-2"
                      onClick={() => navigate("/wallet")}
                    >
                      <Wallet className="h-5 w-5" />
                      Accéder à mon e-Wallet
                    </Button>
                  ) : (
                    <>
                      <Button 
                        size="lg" 
                        variant="secondary"
                        onClick={() => navigate("/auth")}
                      >
                        Se connecter
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        onClick={() => navigate("/signup")}
                      >
                        Créer un compte
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
      
      {/* Dialog pour le formulaire Pass journalier */}
      <Dialog open={isDailyPassFormOpen} onOpenChange={setIsDailyPassFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DailyPassForm onClose={() => setIsDailyPassFormOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Outils globaux (Accessibilité + Chatbot) */}
      <GlobalAccessibilityTools />
    </div>
  );
}
