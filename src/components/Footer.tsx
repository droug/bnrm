import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Twitter, 
  Youtube, 
  Instagram,
  Book,
  Heart,
  Loader2
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoBnrm from "@/assets/bnrm-portal-logo.gif";

const Footer = ({ forceKitabStyle = false }: { forceKitabStyle?: boolean } = {}) => {
  const currentYear = new Date().getFullYear();
  const { t, language } = useLanguage();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  const isKitabPage = location.pathname.startsWith('/kitab') || forceKitabStyle;

  // Multilingual helper
  const ml = (fr: string, ar: string, en: string, es: string) => {
    const map: Record<string, string> = { fr, ar, en, es };
    return map[language] || fr;
  };

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error(ml(
        "Veuillez entrer une adresse email valide",
        "يرجى إدخال عنوان بريد إلكتروني صالح",
        "Please enter a valid email address",
        "Por favor, introduzca una dirección de correo electrónico válida"
      ));
      return;
    }

    setIsSubscribing(true);

    try {
      const { data, error } = await supabase.functions.invoke('subscribe-newsletter', {
        body: { email }
      });

      if (error) throw error;

      toast.success(data.message || ml(
        "Merci pour votre abonnement !",
        "شكراً لاشتراكك!",
        "Thank you for subscribing!",
        "¡Gracias por su suscripción!"
      ));
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error(ml(
        "Erreur lors de l'abonnement. Veuillez réessayer.",
        "خطأ أثناء الاشتراك. يرجى المحاولة مرة أخرى.",
        "Subscription error. Please try again.",
        "Error durante la suscripción. Por favor, inténtelo de nuevo."
      ));
    } finally {
      setIsSubscribing(false);
    }
  };

  const quickLinks = [
    { label: ml("Catalogue", "الفهرس", "Catalogue", "Catálogo"), href: "#catalogue" },
    { label: ml("Collections", "المجموعات", "Collections", "Colecciones"), href: "#collections" },
    { label: ml("Horaires", "المواعيد", "Opening Hours", "Horarios"), href: "/practical-info" },
    { label: ml("À propos", "حول", "About", "Acerca de"), href: "#inscription" },
    { label: ml("Services", "الخدمات", "Services", "Servicios"), href: "#depot-legal" },
    { label: ml("Contact", "اتصل بنا", "Contact", "Contacto"), href: "#contact" }
  ];

  const legalLinks = [
    { label: ml("Conditions d'utilisation", "شروط الاستخدام", "Terms of Use", "Condiciones de uso"), href: "#conditions" },
    { label: ml("Mentions légales", "الإشعارات القانونية", "Legal Notice", "Aviso legal"), href: "#mentions" },
    { label: ml("Flux RSS", "تغذية RSS", "RSS Feed", "Feed RSS"), href: "#rss" },
    { label: ml("Confidentialité", "الخصوصية", "Privacy", "Privacidad"), href: "#confidentialite" }
  ];

  const supportLinks = [
    { label: ml("FAQ", "الأسئلة الشائعة", "FAQ", "Preguntas frecuentes"), href: "#faq" },
    { label: ml("Règlements", "اللوائح", "Regulations", "Reglamentos"), href: "#reglements" },
    { label: ml("Contacts", "الاتصالات", "Contacts", "Contactos"), href: "#contacts" },
    { label: ml("Chatbot d'assistance", "روبوت المساعدة", "Support Chatbot", "Chatbot de asistencia"), href: "#chatbot" }
  ];

  const paymentLinks = [
    { label: ml("e-Wallet BNRM", "المحفظة الإلكترونية", "e-Wallet BNRM", "e-Wallet BNRM"), href: "/wallet" },
    { label: ml("Services BNRM", "خدمات المكتبة", "BNRM Services", "Servicios BNRM"), href: "/tarifs-bnrm" },
    { label: ml("Reproduction", "النسخ", "Reproduction", "Reproducción"), href: "/reproduction" },
    { label: ml("Dépôt légal", "الإيداع القانوني", "Legal Deposit", "Depósito legal"), href: "/depot-legal" }
  ];

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, href: "#facebook", label: "Facebook" },
    { icon: <Twitter className="h-5 w-5" />, href: "#twitter", label: "Twitter" },
    { icon: <Youtube className="h-5 w-5" />, href: "#youtube", label: "YouTube" },
    { icon: <Instagram className="h-5 w-5" />, href: "#instagram", label: "Instagram" }
  ];

  return (
    <footer className={isKitabPage 
      ? "bg-gradient-to-br from-orange-50 via-orange-50/80 to-rose-50 text-foreground border-t border-orange-100" 
      : "bg-white text-foreground border-t"
    }>
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          
          {/* Col 1: À propos */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center space-x-3">
              <img 
                src={logoBnrm} 
                alt={isKitabPage ? "Logo Kitab" : "Logo BNRM"} 
                className="h-16 w-auto object-contain"
              />
            </div>
            
            <p className="text-sm opacity-90 leading-relaxed">
              {isKitabPage 
                ? ml(
                    "Kitab, la plateforme digitale dédiée à l'édition marocaine et à la promotion de l'industrie nationale du livre.",
                    "كتاب، المنصة الرقمية المخصصة للنشر المغربي وتعزيز الصناعة الوطنية للكتاب.",
                    "Kitab, the digital platform dedicated to Moroccan publishing and the promotion of the national book industry.",
                    "Kitab, la plataforma digital dedicada a la edición marroquí y a la promoción de la industria nacional del libro."
                  )
                : ml(
                    "La Bibliothèque Nationale du Royaume du Maroc, gardienne du patrimoine écrit et promotrice du savoir au service de tous.",
                    "المكتبة الوطنية للمملكة المغربية، حارسة التراث المكتوب ومروجة المعرفة في خدمة الجميع.",
                    "The National Library of the Kingdom of Morocco, guardian of written heritage and promoter of knowledge for all.",
                    "La Biblioteca Nacional del Reino de Marruecos, guardiana del patrimonio escrito y promotora del saber al servicio de todos."
                  )
              }
            </p>
            
            <div className="flex items-center space-x-3">
              {socialLinks.map((social, index) => (
                <Button 
                  key={index}
                  variant="ghost" 
                  size="icon"
                  className="opacity-70 hover:opacity-100 hover:bg-muted"
                  aria-label={social.label}
                >
                  {social.icon}
                </Button>
              ))}
            </div>
          </div>

          {/* Col 2: Liens rapides */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center">
              <span className={`w-1 h-6 mr-3 rounded ${isKitabPage ? 'bg-[hsl(var(--kitab-accent))]' : 'bg-primary'}`}></span>
              {ml('Liens Rapides', 'روابط سريعة', 'Quick Links', 'Enlaces Rápidos')}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-sm opacity-80 hover:opacity-100 hover:translate-x-1 transition-all inline-block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Aide et support */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center">
              <span className={`w-1 h-6 mr-3 rounded ${isKitabPage ? 'bg-[hsl(var(--kitab-accent))]' : 'bg-primary'}`}></span>
              {ml('Aide et support', 'المساعدة والدعم', 'Help & Support', 'Ayuda y soporte')}
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-sm opacity-80 hover:opacity-100 hover:translate-x-1 transition-all inline-block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Paiements & Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center">
              <span className={`w-1 h-6 mr-3 rounded ${isKitabPage ? 'bg-[hsl(var(--kitab-accent))]' : 'bg-primary'}`}></span>
              {ml('Paiements', 'المدفوعات', 'Payments', 'Pagos')}
            </h4>
            <ul className="space-y-3">
              {paymentLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-sm opacity-80 hover:opacity-100 hover:translate-x-1 transition-all inline-block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center">
              <span className={`w-1 h-6 mr-3 rounded ${isKitabPage ? 'bg-[hsl(var(--kitab-accent))]' : 'bg-primary'}`}></span>
              {ml('Contacto', 'اتصل بنا', 'Contact', 'Contacto')}
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className={`h-4 w-4 mt-1 flex-shrink-0 ${isKitabPage ? 'text-[hsl(var(--kitab-accent))]' : 'text-primary'}`} />
                <p className="text-sm opacity-80 leading-relaxed">
                  {ml(
                    "Avenida Ibn Battuta, Rabat",
                    "شارع ابن بطوطة، الرباط",
                    "Ibn Battuta Avenue, Rabat",
                    "Avenida Ibn Battuta, Rabat"
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className={`h-4 w-4 flex-shrink-0 ${isKitabPage ? 'text-[hsl(var(--kitab-accent))]' : 'text-primary'}`} />
                <span className="text-sm opacity-80">+212 537 27 16 33</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className={`h-4 w-4 flex-shrink-0 ${isKitabPage ? 'text-[hsl(var(--kitab-accent))]' : 'text-primary'}`} />
                <span className="text-sm opacity-80">
                  {isKitabPage ? 'kitab@bnrm.ma' : 'contact@bnrm.ma'}
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className={`h-4 w-4 mt-1 flex-shrink-0 ${isKitabPage ? 'text-[hsl(var(--kitab-accent))]' : 'text-primary'}`} />
                <div className="text-sm opacity-80 space-y-1">
                  <p>{ml('Lun-Ven: 9h - 18h', 'الإثنين-الجمعة: 9ص - 6م', 'Mon-Fri: 9am - 6pm', 'Lun-Vie: 9h - 18h')}</p>
                  <p>{ml('Samedi: 9h - 13h', 'السبت: 9ص - 1م', 'Saturday: 9am - 1pm', 'Sábado: 9h - 13h')}</p>
                  <p>{ml('Dimanche: Fermé', 'الأحد: مغلق', 'Sunday: Closed', 'Domingo: Cerrado')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Col 6: Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center">
              <span className={`w-1 h-6 mr-3 rounded ${isKitabPage ? 'bg-[hsl(var(--kitab-accent))]' : 'bg-primary'}`}></span>
              {ml('Nous suivre', 'تابعنا', 'Follow Us', 'Síguenos')}
            </h4>
            <p className="text-sm opacity-80 mb-4 leading-relaxed">
              {ml(
                'Restez informé de nos actualités et nouvelles acquisitions.',
                'ابق على اطلاع بأخبارنا والمقتنيات الجديدة.',
                'Stay informed about our news and new acquisitions.',
                'Manténgase informado de nuestras novedades y nuevas adquisiciones.'
              )}
            </p>
            <form onSubmit={handleNewsletterSubscribe} className="space-y-3">
              <Input 
                type="email" 
                placeholder={ml('Votre email', 'بريدك الإلكتروني', 'Your email', 'Su correo electrónico')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
                className="bg-background border-input text-sm"
              />
              <Button 
                type="submit"
                disabled={isSubscribing}
                className={isKitabPage 
                  ? "w-full bg-[hsl(var(--kitab-accent))] hover:bg-[hsl(var(--kitab-accent))]/90 text-white font-medium text-sm" 
                  : "w-full bnrm-btn-primary font-medium text-sm"
                }
              >
                {isSubscribing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {ml('Abonnement...', 'جارٍ الاشتراك...', 'Subscribing...', 'Suscribiendo...')}
                  </>
                ) : (
                  ml("S'abonner", 'اشترك', 'Subscribe', 'Suscribirse')
                )}
              </Button>
            </form>
            <p className="text-xs opacity-60 mt-3 leading-relaxed">
              {ml(
                'En vous abonnant, vous acceptez de recevoir nos communications.',
                'من خلال الاشتراك، فإنك توافق على تلقي اتصالاتنا.',
                'By subscribing, you agree to receive our communications.',
                'Al suscribirse, acepta recibir nuestras comunicaciones.'
              )}
            </p>
          </div>
        </div>

        <Separator className="bg-border mb-8" />

        {/* Section du bas - Copyright et liens légaux */}
        <div className="space-y-6">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {legalLinks.map((link, index) => (
              <a 
                key={index}
                href={link.href}
                className="text-xs opacity-70 hover:opacity-100 transition-opacity"
              >
                {link.label}
              </a>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-sm opacity-80">
              © {currentYear} {isKitabPage ? "Kitab - BNRM" : t('header.title')}. {ml('Tous droits réservés.', 'جميع الحقوق محفوظة.', 'All rights reserved.', 'Todos los derechos reservados.')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;