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
  
  // Check if we're on a Kitab page or if Kitab style is forced
  const isKitabPage = location.pathname.startsWith('/kitab') || forceKitabStyle;

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }

    setIsSubscribing(true);

    try {
      const { data, error } = await supabase.functions.invoke('subscribe-newsletter', {
        body: { email }
      });

      if (error) throw error;

      toast.success(data.message || "Merci pour votre abonnement !");
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error("Erreur lors de l'abonnement. Veuillez réessayer.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const quickLinks = [
    { title_fr: "Catalogue", title_ar: "الفهرس", href: "#catalogue" },
    { title_fr: "Collections", title_ar: "المجموعات", href: "#collections" },
    { title_fr: "Horaires", title_ar: "المواعيد", href: "/practical-info" },
    { title_fr: "À propos", title_ar: "حول", href: "#inscription" },
    { title_fr: "Services", title_ar: "الخدمات", href: "#depot-legal" },
    { title_fr: "Contact", title_ar: "اتصل بنا", href: "#contact" }
  ];

  const legalLinks = [
    { title_fr: "Conditions d'utilisation", title_ar: "شروط الاستخدام", href: "#conditions" },
    { title_fr: "Mentions légales", title_ar: "الإشعارات القانونية", href: "#mentions" },
    { title_fr: "Flux RSS", title_ar: "تغذية RSS", href: "#rss" },
    { title_fr: "Confidentialité", title_ar: "الخصوصية", href: "#confidentialite" }
  ];

  const supportLinks = [
    { title_fr: "FAQ", title_ar: "الأسئلة الشائعة", href: "#faq" },
    { title_fr: "Règlements", title_ar: "اللوائح", href: "#reglements" },
    { title_fr: "Contacts", title_ar: "الاتصالات", href: "#contacts" },
    { title_fr: "Chatbot d'assistance", title_ar: "روبوت المساعدة", href: "#chatbot" }
  ];

  const paymentLinks = [
    { title_fr: "e-Wallet BNRM", title_ar: "المحفظة الإلكترونية", href: "/wallet" },
    { title_fr: "Services BNRM", title_ar: "خدمات المكتبة", href: "/tarifs-bnrm" },
    { title_fr: "Reproduction", title_ar: "النسخ", href: "/reproduction" },
    { title_fr: "Dépôt légal", title_ar: "الإيداع القانوني", href: "/depot-legal" }
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
        {/* Section principale - Informations et liens */}
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
                ? (language === 'ar' 
                    ? "كتاب، المنصة الرقمية المخصصة للنشر المغربي وتعزيز الصناعة الوطنية للكتاب."
                    : "Kitab, la plateforme digitale dédiée à l'édition marocaine et à la promotion de l'industrie nationale du livre.")
                : (language === 'ar'
                    ? "المكتبة الوطنية للمملكة المغربية، حارسة التراث المكتوب ومروجة المعرفة في خدمة الجميع."
                    : "La Bibliothèque Nationale du Royaume du Maroc, gardienne du patrimoine écrit et promotrice du savoir au service de tous.")
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
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-sm opacity-80 hover:opacity-100 hover:translate-x-1 transition-all inline-block"
                  >
                    {language === 'ar' ? link.title_ar : link.title_fr}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Aide et support */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center">
              <span className={`w-1 h-6 mr-3 rounded ${isKitabPage ? 'bg-[hsl(var(--kitab-accent))]' : 'bg-primary'}`}></span>
              {language === 'ar' ? 'المساعدة والدعم' : 'Aide et support'}
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-sm opacity-80 hover:opacity-100 hover:translate-x-1 transition-all inline-block"
                  >
                    {language === 'ar' ? link.title_ar : link.title_fr}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Paiements & Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center">
              <span className={`w-1 h-6 mr-3 rounded ${isKitabPage ? 'bg-[hsl(var(--kitab-accent))]' : 'bg-primary'}`}></span>
              {language === 'ar' ? 'المدفوعات' : 'Paiements'}
            </h4>
            <ul className="space-y-3">
              {paymentLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-sm opacity-80 hover:opacity-100 hover:translate-x-1 transition-all inline-block"
                  >
                    {language === 'ar' ? link.title_ar : link.title_fr}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center">
              <span className={`w-1 h-6 mr-3 rounded ${isKitabPage ? 'bg-[hsl(var(--kitab-accent))]' : 'bg-primary'}`}></span>
              {t('footer.contact')}
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className={`h-4 w-4 mt-1 flex-shrink-0 ${isKitabPage ? 'text-[hsl(var(--kitab-accent))]' : 'text-primary'}`} />
                <p className="text-sm opacity-80 leading-relaxed">{t('footer.location')}</p>
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
                  <p>{t('footer.monday')}</p>
                  <p>{t('footer.saturday')}</p>
                  <p>{t('footer.sunday')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Col 6: Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center">
              <span className={`w-1 h-6 mr-3 rounded ${isKitabPage ? 'bg-[hsl(var(--kitab-accent))]' : 'bg-primary'}`}></span>
              {language === 'ar' ? 'تابعنا' : 'Nous suivre'}
            </h4>
            <p className="text-sm opacity-80 mb-4 leading-relaxed">
              {language === 'ar'
                ? 'ابق على اطلاع بأخبارنا والمقتنيات الجديدة.'
                : 'Restez informé de nos actualités et nouvelles acquisitions.'
              }
            </p>
            <form onSubmit={handleNewsletterSubscribe} className="space-y-3">
              <Input 
                type="email" 
                placeholder={language === 'ar' ? 'بريدك الإلكتروني' : 'Votre email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
                className={isKitabPage
                  ? "bg-background border-input text-sm"
                  : "bg-background border-input text-sm"
                }
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
                    {language === 'ar' ? 'جارٍ الاشتراك...' : 'Abonnement...'}
                  </>
                ) : (
                  language === 'ar' ? 'اشترك' : "S'abonner"
                )}
              </Button>
            </form>
            <p className="text-xs opacity-60 mt-3 leading-relaxed">
              {language === 'ar'
                ? 'من خلال الاشتراك، فإنك توافق على تلقي اتصالاتنا.'
                : 'En vous abonnant, vous acceptez de recevoir nos communications.'
              }
            </p>
          </div>
        </div>

        <Separator className={isKitabPage ? "bg-border mb-8" : "bg-border mb-8"} />

        {/* Section du bas - Copyright et liens légaux */}
        <div className="space-y-6">
          {/* Liens légaux */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {legalLinks.map((link, index) => (
              <a 
                key={index}
                href={link.href}
                className="text-xs opacity-70 hover:opacity-100 transition-opacity"
              >
                {language === 'ar' ? link.title_ar : link.title_fr}
              </a>
            ))}
          </div>
          
          {/* Copyright */}
          <div className="text-center">
            <p className="text-sm opacity-80">
              © {currentYear} {isKitabPage ? "Kitab - BNRM" : t('header.title')}. {t('footer.rights')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;