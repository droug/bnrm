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
  Loader2
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoDigitalLibrary from "@/assets/Logo_BN.png";

const DigitalLibraryFooter = () => {
  const currentYear = new Date().getFullYear();
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

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
    { title_fr: "Accueil", title_ar: "الرئيسية", href: "/digital-library" },
    { title_fr: "Collections", title_ar: "المجموعات", href: "/digital-library/collections" },
    { title_fr: "Manuscrits", title_ar: "المخطوطات", href: "/digital-library/collections/manuscripts" },
    { title_fr: "Périodiques", title_ar: "الدوريات", href: "/digital-library/collections/periodicals" },
    { title_fr: "Recherche", title_ar: "البحث", href: "/search" },
    { title_fr: "Aide", title_ar: "المساعدة", href: "/help" }
  ];

  const legalLinks = [
    { title_fr: "Conditions d'utilisation", title_ar: "شروط الاستخدام", href: "#conditions" },
    { title_fr: "Mentions légales", title_ar: "الإشعارات القانونية", href: "#mentions" },
    { title_fr: "Politique de confidentialité", title_ar: "سياسة الخصوصية", href: "#confidentialite" },
    { title_fr: "Accessibilité", title_ar: "إمكانية الوصول", href: "#accessibilite" }
  ];

  const supportLinks = [
    { title_fr: "FAQ", title_ar: "الأسئلة الشائعة", href: "/help" },
    { title_fr: "Guide d'utilisation", title_ar: "دليل الاستخدام", href: "/help" },
    { title_fr: "Demande de numérisation", title_ar: "طلب الرقمنة", href: "/digital-library" },
    { title_fr: "Contact", title_ar: "اتصل بنا", href: "#contact" }
  ];

  const servicesLinks = [
    { title_fr: "Espace personnel", title_ar: "المساحة الشخصية", href: "/digital-library/my-space" },
    { title_fr: "Réservations", title_ar: "الحجوزات", href: "/digital-library/mes-demandes" },
    { title_fr: "Prêts numériques", title_ar: "الإعارة الرقمية", href: "/digital-library/my-loans" },
    { title_fr: "Annotations", title_ar: "التعليقات", href: "/digital-library/my-notes" }
  ];

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, href: "#facebook", label: "Facebook" },
    { icon: <Twitter className="h-5 w-5" />, href: "#twitter", label: "Twitter" },
    { icon: <Youtube className="h-5 w-5" />, href: "#youtube", label: "YouTube" },
    { icon: <Instagram className="h-5 w-5" />, href: "#instagram", label: "Instagram" }
  ];

  return (
    <footer className="bg-gradient-to-br from-bn-blue-primary/5 via-gold-bn-primary/5 to-bn-blue-deep/5 text-foreground border-t border-gold-bn-primary/20">
      <div className="container mx-auto px-4 py-16">
        {/* Section principale - Informations et liens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          
          {/* Col 1: À propos - Logo BN */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center space-x-3">
              <img 
                src={logoDigitalLibrary} 
                alt="Ibn Battuta - Bibliothèque Numérique" 
                className="h-20 w-auto object-contain"
              />
            </div>
            
            <p className="text-sm opacity-90 leading-relaxed">
              {language === 'ar'
                ? "المكتبة الرقمية للمغرب - ابن بطوطة. منصة رقمية تتيح الوصول إلى التراث المكتوب المغربي من مخطوطات ودوريات ووثائق نادرة."
                : "Bibliothèque Numérique du Maroc - Ibn Battuta. Plateforme digitale donnant accès au patrimoine écrit marocain : manuscrits, périodiques et documents rares."
              }
            </p>
            
            <div className="flex items-center space-x-3">
              {socialLinks.map((social, index) => (
                <Button 
                  key={index}
                  variant="ghost" 
                  size="icon"
                  className="opacity-70 hover:opacity-100 hover:bg-gold-bn-primary/10 text-bn-blue-primary"
                  aria-label={social.label}
                >
                  {social.icon}
                </Button>
              ))}
            </div>
          </div>

          {/* Col 2: Liens rapides */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center text-bn-blue-primary">
              <span className="w-1 h-6 mr-3 rounded bg-gold-bn-primary"></span>
              {language === 'ar' ? 'روابط سريعة' : 'Liens rapides'}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-sm opacity-80 hover:opacity-100 hover:text-gold-bn-primary hover:translate-x-1 transition-all inline-block"
                  >
                    {language === 'ar' ? link.title_ar : link.title_fr}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Aide et support */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center text-bn-blue-primary">
              <span className="w-1 h-6 mr-3 rounded bg-gold-bn-primary"></span>
              {language === 'ar' ? 'المساعدة والدعم' : 'Aide et support'}
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-sm opacity-80 hover:opacity-100 hover:text-gold-bn-primary hover:translate-x-1 transition-all inline-block"
                  >
                    {language === 'ar' ? link.title_ar : link.title_fr}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center text-bn-blue-primary">
              <span className="w-1 h-6 mr-3 rounded bg-gold-bn-primary"></span>
              {language === 'ar' ? 'الخدمات' : 'Services'}
            </h4>
            <ul className="space-y-3">
              {servicesLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-sm opacity-80 hover:opacity-100 hover:text-gold-bn-primary hover:translate-x-1 transition-all inline-block"
                  >
                    {language === 'ar' ? link.title_ar : link.title_fr}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center text-bn-blue-primary">
              <span className="w-1 h-6 mr-3 rounded bg-gold-bn-primary"></span>
              {language === 'ar' ? 'اتصل بنا' : 'Contact'}
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-gold-bn-primary" />
                <p className="text-sm opacity-80 leading-relaxed">
                  {language === 'ar' 
                    ? 'شارع ابن بطوطة، الرباط، المغرب'
                    : 'Avenue Ibn Battouta, Rabat, Maroc'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 flex-shrink-0 text-gold-bn-primary" />
                <span className="text-sm opacity-80">+212 537 27 16 33</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 flex-shrink-0 text-gold-bn-primary" />
                <span className="text-sm opacity-80">bn@bnrm.ma</span>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-4 w-4 mt-1 flex-shrink-0 text-gold-bn-primary" />
                <div className="text-sm opacity-80 space-y-1">
                  <p>{language === 'ar' ? 'الإثنين - الجمعة: 9:00 - 18:00' : 'Lun - Ven: 9h00 - 18h00'}</p>
                  <p>{language === 'ar' ? 'السبت: 9:00 - 13:00' : 'Sam: 9h00 - 13h00'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Col 6: Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center text-bn-blue-primary">
              <span className="w-1 h-6 mr-3 rounded bg-gold-bn-primary"></span>
              {language === 'ar' ? 'النشرة الإخبارية' : 'Newsletter'}
            </h4>
            <p className="text-sm opacity-80 mb-4 leading-relaxed">
              {language === 'ar'
                ? 'ابق على اطلاع بآخر المستجدات والمجموعات الجديدة.'
                : 'Restez informé des dernières actualités et nouvelles collections.'
              }
            </p>
            <form onSubmit={handleNewsletterSubscribe} className="space-y-3">
              <Input 
                type="email" 
                placeholder={language === 'ar' ? 'بريدك الإلكتروني' : 'Votre email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
                className="bg-background border-gold-bn-primary/30 focus:border-gold-bn-primary text-sm"
              />
              <Button 
                type="submit"
                disabled={isSubscribing}
                className="w-full bg-gold-bn-primary hover:bg-gold-bn-primary-dark text-white font-medium text-sm"
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
          </div>
        </div>

        <Separator className="bg-gold-bn-primary/20 mb-8" />

        {/* Section du bas - Copyright et liens légaux */}
        <div className="space-y-6">
          {/* Liens légaux */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {legalLinks.map((link, index) => (
              <a 
                key={index}
                href={link.href}
                className="text-xs opacity-70 hover:opacity-100 hover:text-gold-bn-primary transition-opacity"
              >
                {language === 'ar' ? link.title_ar : link.title_fr}
              </a>
            ))}
          </div>
          
          {/* Copyright */}
          <div className="text-center">
            <p className="text-sm opacity-80">
              © {currentYear} {language === 'ar' ? 'المكتبة الرقمية للمغرب - ابن بطوطة' : 'Bibliothèque Numérique du Maroc - Ibn Battuta'}. {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DigitalLibraryFooter;
