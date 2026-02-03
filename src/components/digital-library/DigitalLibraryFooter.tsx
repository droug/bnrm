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
import { useQuery } from "@tanstack/react-query";
import logoDigitalLibrary from "@/assets/BN_LOGO_FINAL.png";

interface FooterLink {
  title_fr: string;
  title_ar: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  id: string;
  title_fr: string;
  title_ar: string;
  links: FooterLink[];
}

interface SocialLink {
  platform: string;
  url: string;
  is_active: boolean;
}

interface ContactInfo {
  address_fr: string;
  address_ar: string;
  phone: string;
  email: string;
  hours_fr: string;
  hours_ar: string;
}

interface FooterSettings {
  description_fr: string;
  description_ar: string;
  sections: FooterSection[];
  social_links: SocialLink[];
  contact: ContactInfo;
  legal_links: FooterLink[];
  copyright_fr: string;
  copyright_ar: string;
}

// Default values (fallback if CMS not configured)
const defaultSettings: FooterSettings = {
  description_fr: "Bibliothèque Numérique du Maroc - Ibn Battuta. Plateforme digitale donnant accès au patrimoine écrit marocain : manuscrits, périodiques et documents rares.",
  description_ar: "المكتبة الرقمية للمغرب - ابن بطوطة. منصة رقمية تتيح الوصول إلى التراث المكتوب المغربي من مخطوطات ودوريات ووثائق نادرة.",
  sections: [
    {
      id: "quick-links",
      title_fr: "Liens rapides",
      title_ar: "روابط سريعة",
      links: [
        { title_fr: "Portail BNRM", title_ar: "بوابة المكتبة الوطنية", href: "/" },
        { title_fr: "Plateforme Manuscrits", title_ar: "منصة المخطوطات", href: "/manuscripts" },
        { title_fr: "Plateforme Kitab", title_ar: "منصة كتاب", href: "/kitab" },
        { title_fr: "Plateforme Activités culturelles", title_ar: "منصة الأنشطة الثقافية", href: "/activites-culturelles" },
        { title_fr: "Plateforme CBM", title_ar: "منصة الفهرس البيبليوغرافي", href: "/portail-cbm" }
      ]
    },
    {
      id: "world-reservoirs",
      title_fr: "Réservoirs mondiaux",
      title_ar: "الخزانات العالمية",
      links: [
        { title_fr: "Réseau Francophone Numérique", title_ar: "الشبكة الفرنكوفونية الرقمية", href: "https://rfnum.org", external: true },
        { title_fr: "Patrimoine culturel numérique européen", title_ar: "التراث الثقافي الرقمي الأوروبي", href: "https://www.europeana.eu", external: true },
        { title_fr: "World Digital Library", title_ar: "المكتبة الرقمية العالمية", href: "https://www.loc.gov/collections/world-digital-library", external: true }
      ]
    },
    {
      id: "support",
      title_fr: "Aide et support",
      title_ar: "المساعدة والدعم",
      links: [
        { title_fr: "Aide et FAQ", title_ar: "المساعدة والأسئلة الشائعة", href: "/digital-library/help" },
        { title_fr: "Guide d'utilisation", title_ar: "دليل الاستخدام", href: "/digital-library/help#guide" }
      ]
    }
  ],
  social_links: [
    { platform: "facebook", url: "", is_active: true },
    { platform: "twitter", url: "", is_active: true },
    { platform: "youtube", url: "", is_active: true },
    { platform: "instagram", url: "", is_active: true }
  ],
  contact: {
    address_fr: "Avenue Ibn Battouta, Rabat, Maroc",
    address_ar: "شارع ابن بطوطة، الرباط، المغرب",
    phone: "+212 537 27 16 33",
    email: "bn@bnrm.ma",
    hours_fr: "Lun - Ven: 9h00 - 18h00 | Sam: 9h00 - 13h00",
    hours_ar: "الإثنين - الجمعة: 9:00 - 18:00 | السبت: 9:00 - 13:00"
  },
  legal_links: [
    { title_fr: "Conditions d'utilisation", title_ar: "شروط الاستخدام", href: "#conditions" },
    { title_fr: "Mentions légales", title_ar: "الإشعارات القانونية", href: "#mentions" },
    { title_fr: "Politique de confidentialité", title_ar: "سياسة الخصوصية", href: "#confidentialite" },
    { title_fr: "Accessibilité", title_ar: "إمكانية الوصول", href: "#accessibilite" }
  ],
  copyright_fr: "Bibliothèque Numérique du Maroc - Ibn Battuta",
  copyright_ar: "المكتبة الرقمية للمغرب - ابن بطوطة"
};

const socialIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="h-5 w-5" />,
  twitter: <Twitter className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
  instagram: <Instagram className="h-5 w-5" />,
};

const DigitalLibraryFooter = () => {
  const currentYear = new Date().getFullYear();
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Fetch footer settings from CMS
  const { data: cmsSettings } = useQuery({
    queryKey: ['bn-footer-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_portal_settings')
        .select('*')
        .eq('setting_key', 'bn_footer')
        .maybeSingle();
      
      if (error) throw error;
      return data?.setting_value as unknown as FooterSettings | null;
    }
  });

  // Use CMS settings or fallback to defaults
  const settings = cmsSettings || defaultSettings;

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

  // Get sections by id
  const getSection = (id: string) => settings.sections.find(s => s.id === id);
  const quickLinks = getSection('quick-links');
  const worldReservoirs = getSection('world-reservoirs');
  const supportSection = getSection('support');

  // Filter active social links
  const activeSocialLinks = settings.social_links.filter(s => s.is_active);

  return (
    <footer className="bg-gradient-to-br from-bn-blue-primary/5 via-gold-bn-primary/5 to-bn-blue-deep/5 text-foreground border-t border-gold-bn-primary/20">
      <div className="container mx-auto px-4 py-16">
        {/* Section principale - Informations et liens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12 items-start">
          
          {/* Col 1: À propos - Logo BN */}
          <div className="lg:col-span-1 flex flex-col">
            {/* Logo aligné sur la même ligne de base que les titres des autres sections */}
            <div className="mb-6 flex items-start min-h-[3.5rem]">
              <img
                src={logoDigitalLibrary}
                alt="Ibn Battuta - Bibliothèque Numérique"
                className="h-20 w-auto object-contain -mt-2"
              />
            </div>
            
            <p className="text-sm opacity-90 leading-relaxed mb-4">
              {language === 'ar' ? settings.description_ar : settings.description_fr}
            </p>
            
            <div className="flex items-center space-x-3 mt-auto">
              {activeSocialLinks.map((social, index) => (
                <Button 
                  key={index}
                  variant="ghost" 
                  size="icon"
                  className="opacity-70 hover:opacity-100 hover:bg-gold-bn-primary/10 text-bn-blue-primary"
                  aria-label={social.platform}
                  asChild={social.url ? true : undefined}
                >
                  {social.url ? (
                    <a href={social.url} target="_blank" rel="noopener noreferrer">
                      {socialIcons[social.platform]}
                    </a>
                  ) : (
                    socialIcons[social.platform]
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Col 2: Liens rapides */}
          {quickLinks && (
            <div className="flex flex-col">
              <h4 className="text-lg font-semibold mb-6 flex items-start text-bn-blue-primary min-h-[3.5rem]">
                <span className="w-1 h-6 mr-3 rounded bg-gold-bn-primary"></span>
                {language === 'ar' ? quickLinks.title_ar : quickLinks.title_fr}
              </h4>
              <ul className="space-y-3">
                {quickLinks.links.map((link, index) => (
                  <li key={index} className="leading-relaxed">
                    <a 
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-sm opacity-80 hover:opacity-100 hover:text-gold-bn-primary hover:translate-x-1 transition-all inline-block"
                    >
                      {language === 'ar' ? link.title_ar : link.title_fr}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Col 3: Réservoirs mondiaux */}
          {worldReservoirs && (
            <div className="flex flex-col">
              <h4 className="text-lg font-semibold mb-6 flex items-start text-bn-blue-primary min-h-[3.5rem]">
                <span className="w-1 h-6 mr-3 rounded bg-gold-bn-primary"></span>
                {language === 'ar' ? worldReservoirs.title_ar : worldReservoirs.title_fr}
              </h4>
              <ul className="space-y-3">
                {worldReservoirs.links.map((link, index) => (
                  <li key={index} className="leading-relaxed">
                    <a 
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-sm opacity-80 hover:opacity-100 hover:text-gold-bn-primary hover:translate-x-1 transition-all inline-block"
                    >
                      {language === 'ar' ? link.title_ar : link.title_fr}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Col 4: Aide et support */}
          {supportSection && (
            <div className="flex flex-col">
              <h4 className="text-lg font-semibold mb-6 flex items-start text-bn-blue-primary min-h-[3.5rem]">
                <span className="w-1 h-6 mr-3 rounded bg-gold-bn-primary"></span>
                {language === 'ar' ? supportSection.title_ar : supportSection.title_fr}
              </h4>
              <ul className="space-y-3">
                {supportSection.links.map((link, index) => (
                  <li key={index} className="leading-relaxed">
                    <a 
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-sm opacity-80 hover:opacity-100 hover:text-gold-bn-primary hover:translate-x-1 transition-all inline-block"
                    >
                      {language === 'ar' ? link.title_ar : link.title_fr}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Col 5: Contact */}
          <div className="flex flex-col">
            <h4 className="text-lg font-semibold mb-6 flex items-start text-bn-blue-primary min-h-[3.5rem]">
              <span className="w-1 h-6 mr-3 rounded bg-gold-bn-primary"></span>
              {language === 'ar' ? 'اتصل بنا' : 'Contact'}
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-gold-bn-primary" />
                <p className="text-sm opacity-80 leading-relaxed">
                  {language === 'ar' ? settings.contact.address_ar : settings.contact.address_fr}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 flex-shrink-0 text-gold-bn-primary" />
                <span className="text-sm opacity-80">{settings.contact.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 flex-shrink-0 text-gold-bn-primary" />
                <span className="text-sm opacity-80">{settings.contact.email}</span>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-4 w-4 mt-1 flex-shrink-0 text-gold-bn-primary" />
                <p className="text-sm opacity-80">
                  {language === 'ar' ? settings.contact.hours_ar : settings.contact.hours_fr}
                </p>
              </div>
            </div>
          </div>

          {/* Col 6: Newsletter */}
          <div className="flex flex-col">
            <h4 className="text-lg font-semibold mb-6 flex items-start text-bn-blue-primary min-h-[3.5rem]">
              <span className="w-1 h-6 mr-3 rounded bg-gold-bn-primary"></span>
              {language === 'ar' ? 'النشرة الإخبارية' : 'Newsletter'}
            </h4>
            <div>
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
        </div>

        <Separator className="bg-gold-bn-primary/20 mb-8" />

        {/* Section du bas - Copyright et liens légaux */}
        <div className="space-y-6">
          {/* Liens légaux */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {settings.legal_links.map((link, index) => (
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
              © {currentYear} {language === 'ar' ? settings.copyright_ar : settings.copyright_fr}. {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DigitalLibraryFooter;
