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
  Scan,
  Package
} from "lucide-react";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import { ServicePageBackground } from "@/components/ServicePageBackground";
import { DailyPassForm } from "@/components/daily-pass/DailyPassForm";

export default function PaymentServices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
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
      id: "bnrm-services",
      title: language === 'ar' ? "الاشتراكات في المكتبة الوطنية" : "Abonnements à la BNRM",
      description: language === 'ar' ? "الوصول إلى جميع اشتراكات المكتبة الوطنية" : "Accédez à l'ensemble des abonnements de la BNRM",
      icon: Building,
      color: "from-orange-500 to-orange-600",
      features: language === 'ar' ? [
        "تسعير شفاف",
        "خدمات متنوعة",
        "دفع مرن",
        "دعم العملاء"
      ] : [
        "Tarification transparente",
        "Services variés",
        "Paiement flexible",
        "Support client"
      ],
      action: () => navigate("/abonnements?platform=portal&type=abonnements"),
      available: true
    },
    {
      id: "wallet",
      title: language === 'ar' ? "المحفظة الإلكترونية" : "e-Wallet BNRM",
      description: language === 'ar' ? "محفظة إلكترونية آمنة لجميع مدفوعاتك" : "Portefeuille électronique sécurisé pour tous vos paiements BNRM",
      icon: Wallet,
      color: "from-blue-500 to-blue-600",
      features: language === 'ar' ? [
        "شحن فوري",
        "سجل المعاملات",
        "دفع سريع بدون تلامس",
        "آمن مع التشفير"
      ] : [
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
      title: language === 'ar' ? "بطاقة يومية" : "Pass journalier",
      description: language === 'ar' ? "وصول غير محدود للمكتبة الوطنية ليوم واحد" : "Accès illimité à la bibliothèque nationale pour une journée",
      icon: CreditCard,
      color: "from-indigo-500 to-indigo-600",
      features: language === 'ar' ? [
        "الوصول لجميع قاعات القراءة",
        "مساحات العمل متضمنة",
        "100٪ مجاني",
        "محدود لمرة واحدة في السنة"
      ] : [
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
      title: language === 'ar' ? "نسخ الوثائق" : "Reproduction de documents",
      description: language === 'ar' ? "اطلب نسخ الوثائق والمخطوطات" : "Demandez la reproduction de documents et manuscrits",
      icon: FileText,
      color: "from-green-500 to-green-600",
      features: language === 'ar' ? [
        "طلب عبر الإنترنت",
        "دفع آمن",
        "تتبع الطلب",
        "توصيل سريع"
      ] : [
        "Demande en ligne",
        "Paiement sécurisé",
        "Suivi de commande",
        "Livraison rapide"
      ],
      action: () => navigate("/demande-reproduction"),
      available: true
    },
    {
      id: "restoration",
      title: language === 'ar' ? "طلب الترميم" : "Demande de restauration",
      description: language === 'ar' ? "عهد إلينا بترميم وثائقك وأعمالك الثمينة" : "Confiez-nous la restauration de vos documents et œuvres précieuses",
      icon: Wrench,
      color: "from-amber-500 to-amber-600",
      features: language === 'ar' ? [
        "خبرة مؤهلة",
        "تقنيات حديثة",
        "الحفاظ على التراث",
        "عرض سعر شخصي"
      ] : [
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
      title: language === 'ar' ? "طلب الرقمنة" : "Demande de numérisation",
      description: language === 'ar' ? "اطلب رقمنة وثائقك بتنسيقات مختلفة" : "Demandez la numérisation de vos documents dans différents formats",
      icon: Scan,
      color: "from-cyan-500 to-cyan-600",
      features: language === 'ar' ? [
        "دقة عالية",
        "تنسيقات متعددة",
        "توصيل سريع",
        "أسعار تنافسية"
      ] : [
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
      title: language === 'ar' ? "حجز وثيقة" : "Réserver un document",
      description: language === 'ar' ? "احجز وثائقك واطلع عليها في المكان أو عبر الإنترنت" : "Réservez vos documents et consultez-les sur place ou en ligne",
      icon: BookOpen,
      color: "from-teal-500 to-teal-600",
      features: language === 'ar' ? [
        "حجز عبر الإنترنت",
        "استشارة في المكان",
        "وصول رقمي",
        "إخطار فوري"
      ] : [
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
      title: language === 'ar' ? "الإيداع القانوني" : "Dépôt légal",
      description: language === 'ar' ? "قم بإجراءات الإيداع القانوني عبر الإنترنت" : "Effectuez vos démarches de dépôt légal en ligne",
      icon: Book,
      color: "from-purple-500 to-purple-600",
      features: language === 'ar' ? [
        "إسناد ISBN/ISSN/ISMN",
        "مصادقة سريعة",
        "دفع عبر الإنترنت",
        "شهادة رقمية"
      ] : [
        "Attribution ISBN/ISSN/ISMN",
        "Validation rapide",
        "Paiement en ligne",
        "Certificat numérique"
      ],
      action: () => navigate("/depot-legal"),
      available: user ? true : false
    },
    {
      id: "cultural-activities",
      title: language === 'ar' ? "حجز الفضاءات الثقافية" : "Réservation des espaces culturels",
      description: language === 'ar' ? "احجز فضاءاتنا لفعالياتك الثقافية" : "Réservez nos espaces pour vos événements culturels",
      icon: Theater,
      color: "from-pink-500 to-pink-600",
      features: language === 'ar' ? [
        "مساحات قابلة للتعديل",
        "معدات احترافية",
        "خدمات تكميلية",
        "تسعير متكيف"
      ] : [
        "Espaces modulables",
        "Équipements professionnels",
        "Services complémentaires",
        "Tarification adaptée"
      ],
      action: () => navigate("/cultural-activities-booking"),
      available: true
    },
    {
      id: "location-services",
      title: language === 'ar' ? "الإيجار حسب الطلب" : "Location à la demande",
      description: language === 'ar' ? "استأجر مساحاتنا ومعداتنا لاحتياجاتك" : "Louez nos espaces et équipements pour vos besoins",
      icon: Package,
      color: "from-blue-500 to-blue-600",
      features: language === 'ar' ? [
        "قاعة مجهزة",
        "قاعة المؤتمرات",
        "مساحة الأطفال",
        "حجز صندوق"
      ] : [
        "Auditorium équipé",
        "Salle de conférence",
        "Espace enfants",
        "Réservation de Box"
      ],
      action: () => navigate("/services-location?type=location"),
      available: true
    }
  ];

  const paymentMethods = [
    {
      name: language === 'ar' ? "بطاقة بنكية" : "Carte bancaire",
      icon: CreditCard,
      description: language === 'ar' ? "Visa, Mastercard, CMI" : "Visa, Mastercard, CMI",
      secure: true
    },
    {
      name: language === 'ar' ? "المحفظة الإلكترونية" : "e-Wallet BNRM",
      icon: Wallet,
      description: language === 'ar' ? "محفظة إلكترونية" : "Portefeuille électronique",
      secure: true
    },
    {
      name: language === 'ar' ? "تحويل بنكي" : "Virement bancaire",
      icon: Building,
      description: language === 'ar' ? "تحويل آمن" : "Transfert sécurisé",
      secure: true
    }
  ];

  return (
    <div className="min-h-screen flex flex-col relative">
      <ServicePageBackground />
      <Header />
      
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-primary-dark to-secondary text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block mb-6">
                <Badge variant="secondary" className="text-lg px-6 py-2 bg-white/20 hover:bg-white/30">
                  <Shield className="h-5 w-5 mr-2" />
                  {language === 'ar' ? "مدفوعات آمنة" : "Paiements sécurisés"}
                </Badge>
              </div>
              <h1 className="text-5xl font-bold mb-6">
                {language === 'ar' ? "خدمات المكتبة الوطنية" : "Services de la BNRM"}
              </h1>
              <p className="text-xl opacity-90 mb-8 leading-relaxed">
                {language === 'ar' 
                  ? "اكتشف حلول الدفع الآمنة لجميع احتياجاتك المتعلقة بخدمات المكتبة الوطنية للمملكة المغربية"
                  : "Découvrez nos solutions de paiement sécurisées pour tous vos besoins liés aux services de la Bibliothèque Nationale du Royaume du Maroc"
                }
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>{language === 'ar' ? "دفع آمن SSL" : "Paiement sécurisé SSL"}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>{language === 'ar' ? "مطابقة PCI DSS" : "Conformité PCI DSS"}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>{language === 'ar' ? "حماية البيانات" : "Protection des données"}</span>
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
                <h2 className="text-3xl font-bold mb-4">
                  {language === 'ar' ? "خدماتنا" : "Nos services"}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {language === 'ar' ? "اختر الخدمة المناسبة لاحتياجاتك" : "Choisissez le service adapté à vos besoins"}
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
                              {language === 'ar' ? "متاح" : "Disponible"}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              {language === 'ar' ? "يتطلب تسجيل الدخول" : "Connexion requise"}
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
                          {language === 'ar' ? "الوصول للخدمة" : "Accéder au service"}
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
                <h2 className="text-3xl font-bold mb-4">
                  {language === 'ar' ? "وسائل الدفع المقبولة" : "Moyens de paiement acceptés"}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {language === 'ar' ? "ادفع بأمان بالطرق التي تختارها" : "Payez en toute sécurité avec les méthodes de votre choix"}
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
                            {language === 'ar' ? "آمن" : "Sécurisé"}
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
                {language === 'ar' ? "مدفوعاتك بأمان تام" : "Vos paiements en toute sécurité"}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {language === 'ar'
                  ? "أمان معاملاتك هو أولويتنا المطلقة. نستخدم أحدث التقنيات لحماية بياناتك."
                  : "La sécurité de vos transactions est notre priorité absolue. Nous utilisons les technologies les plus avancées pour protéger vos données."
                }
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center">
                  <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">
                    {language === 'ar' ? "تشفير SSL/TLS" : "Cryptage SSL/TLS"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? "جميع بياناتك مشفرة من طرف إلى طرف" : "Toutes vos données sont cryptées de bout en bout"}
                  </p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">
                    {language === 'ar' ? "أمان ثلاثي الأبعاد" : "3D Secure"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? "حماية إضافية لمدفوعاتك بالبطاقة" : "Protection supplémentaire pour vos paiements par carte"}
                  </p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">
                    {language === 'ar' ? "معالجة فورية" : "Traitement instantané"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? "مدفوعات معتمدة في الوقت الفعلي" : "Paiements validés en temps réel"}
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
                  {language === 'ar' ? "هل أنت مستعد للبدء؟" : "Prêt à commencer ?"}
                </h2>
                <p className="text-xl opacity-90 mb-8">
                  {language === 'ar' 
                    ? "أنشئ حسابك واحصل على جميع خدمات الدفع"
                    : "Créez votre compte et accédez à tous nos services de paiement"
                  }
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
                      {language === 'ar' ? "الوصول لمحفظتي الإلكترونية" : "Accéder à mon e-Wallet"}
                    </Button>
                  ) : (
                    <>
                      <Button 
                        size="lg" 
                        variant="secondary"
                        onClick={() => navigate("/auth")}
                      >
                        {language === 'ar' ? "تسجيل الدخول" : "Se connecter"}
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        onClick={() => navigate("/signup")}
                      >
                        {language === 'ar' ? "إنشاء حساب" : "Créer un compte"}
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
