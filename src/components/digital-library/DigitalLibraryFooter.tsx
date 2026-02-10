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
import logoDigitalLibrary from "@/assets/FINAL_LOGO_3.png";

interface FooterLink {
  title_fr: string;
  title_ar: string;
  title_en?: string;
  title_es?: string;
  title_amz?: string;
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
        { title_fr: "Portail BNRM", title_ar: "بوابة المكتبة الوطنية", title_en: "BNRM Portal", title_es: "Portal BNRM", title_amz: "ⴰⵖⵔⴰⴱ BNRM", href: "/" },
        { title_fr: "Plateforme Manuscrits", title_ar: "منصة المخطوطات", title_en: "Manuscripts Platform", title_es: "Plataforma Manuscritos", title_amz: "ⴰⵙⵓⵔⵉⴼ ⵏ ⵉⵎⵙⴽⵜⴰⵢⵏ", href: "/manuscripts" },
        { title_fr: "Plateforme Kitab", title_ar: "منصة كتاب", title_en: "Kitab Platform", title_es: "Plataforma Kitab", title_amz: "ⴰⵙⵓⵔⵉⴼ Kitab", href: "/kitab" },
        { title_fr: "Plateforme Activités culturelles", title_ar: "منصة الأنشطة الثقافية", title_en: "Cultural Activities Platform", title_es: "Plataforma Actividades culturales", title_amz: "ⴰⵙⵓⵔⵉⴼ ⵏ ⵉⵎⵓⵙⵙⵓⵜⵏ ⵉⴷⵍⵙⴰⵏⵏ", href: "/activites-culturelles" },
        { title_fr: "Plateforme CBM", title_ar: "منصة الفهرس البيبليوغرافي", title_en: "CBM Platform", title_es: "Plataforma CBM", title_amz: "ⴰⵙⵓⵔⵉⴼ CBM", href: "/portail-cbm" }
      ]
    },
    {
      id: "world-reservoirs",
      title_fr: "Réservoirs mondiaux",
      title_ar: "الخزانات العالمية",
      links: [
        { title_fr: "Réseau Francophone Numérique", title_ar: "الشبكة الفرنكوفونية الرقمية", title_en: "Francophone Digital Network", title_es: "Red Francófona Digital", title_amz: "ⴰⵥⴻⵟⵟⴰ ⴰⴼⵔⴰⵏⴽⵓⴼⵓⵏ ⴰⵏⵓⵎⴰⵏ", href: "https://rfnum.org", external: true },
        { title_fr: "Patrimoine culturel numérique européen", title_ar: "التراث الثقافي الرقمي الأوروبي", title_en: "European Digital Cultural Heritage", title_es: "Patrimonio cultural digital europeo", title_amz: "ⴰⵢⴷⴰ ⴰⴷⵍⵙⴰⵏ ⴰⵏⵓⵎⴰⵏ ⴰⵡⵕⵓⴱⴱⵉ", href: "https://www.europeana.eu", external: true },
        { title_fr: "World Digital Library", title_ar: "المكتبة الرقمية العالمية", title_en: "World Digital Library", title_es: "Biblioteca Digital Mundial", title_amz: "ⵜⴰⵙⴷⵍⵉⵙⵜ ⵜⴰⵏⵓⵎⴰⵏⵜ ⵜⴰⵎⴰⴹⵍⴰⵏⵜ", href: "https://www.loc.gov/collections/world-digital-library", external: true }
      ]
    },
    {
      id: "support",
      title_fr: "Aide et support",
      title_ar: "المساعدة والدعم",
      links: [
        { title_fr: "Aide et FAQ", title_ar: "المساعدة والأسئلة الشائعة", title_en: "Help & FAQ", title_es: "Ayuda y FAQ", title_amz: "ⵜⴰⵡⵉⵙⵉ ⴷ FAQ", href: "/digital-library/help" },
        { title_fr: "Guide d'utilisation", title_ar: "دليل الاستخدام", title_en: "User Guide", title_es: "Guía de uso", title_amz: "ⴰⵎⵔⵙⵉ ⵏ ⵓⵙⵎⵔⵙ", href: "/digital-library/help#guide" }
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
    { title_fr: "Conditions d'utilisation", title_ar: "شروط الاستخدام", title_en: "Terms of Use", title_es: "Condiciones de uso", title_amz: "ⵜⵉⵡⵜⵉⵍⵉⵏ ⵏ ⵓⵙⵎⵔⵙ", href: "#conditions" },
    { title_fr: "Mentions légales", title_ar: "الإشعارات القانونية", title_en: "Legal Notice", title_es: "Aviso legal", title_amz: "ⵉⵏⵏⴰⵏ ⵉⵣⵔⴼⴰⵏⵏ", href: "#mentions" },
    { title_fr: "Politique de confidentialité", title_ar: "سياسة الخصوصية", title_en: "Privacy Policy", title_es: "Política de privacidad", title_amz: "ⵜⴰⵙⵔⵜⵉⵜ ⵏ ⵜⵉⵏⵏⵓⵜⵍⴰ", href: "#confidentialite" },
    { title_fr: "Accessibilité", title_ar: "إمكانية الوصول", title_en: "Accessibility", title_es: "Accesibilidad", title_amz: "ⴰⵏⴼⴰⴷ", href: "#accessibilite" }
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

  const ml = (fr: string, ar: string, en: string, es: string, amz?: string) => {
    const map: Record<string, string> = { fr, ar, en, es, amz: amz || fr };
    return map[language] || fr;
  };

  // Helper for link titles with full multilingual support
  const linkText = (link: FooterLink) => {
    const map: Record<string, string | undefined> = {
      fr: link.title_fr,
      ar: link.title_ar,
      en: link.title_en,
      es: link.title_es,
      amz: link.title_amz,
    };
    return map[language] || link.title_fr;
  };

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
      toast.error(ml("Veuillez entrer une adresse email valide", "يرجى إدخال عنوان بريد إلكتروني صالح", "Please enter a valid email address", "Por favor, introduzca un correo electrónico válido", "ⵙⵙⴽⵜⵉ ⵢⴰⵜ ⵜⴰⵏⵙⴰ ⵏ ⵉⵎⴰⵢⵍ ⵉⵖⵓⴷⴰⵏ"));
      return;
    }

    setIsSubscribing(true);

    try {
      const { data, error } = await supabase.functions.invoke('subscribe-newsletter', {
        body: { email }
      });

      if (error) throw error;

      toast.success(data.message || ml("Merci pour votre abonnement !", "شكراً لاشتراكك!", "Thank you for subscribing!", "¡Gracias por su suscripción!", "ⵜⴰⵏⵎⵎⵉⵔⵜ ⵖⴼ ⵓⵎⵜⵜⴰⵡ ⵏⵏⴽ!"));
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error(ml("Erreur lors de l'abonnement. Veuillez réessayer.", "خطأ أثناء الاشتراك. يرجى المحاولة مرة أخرى.", "Subscription error. Please try again.", "Error de suscripción. Inténtelo de nuevo.", "ⵜⴰⵣⴳⵍⵜ ⴳ ⵓⵎⵜⵜⴰⵡ. ⴰⵍⵙ ⵜⴰⵔⵎⵉⵜ."));
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-12 mb-12 items-start">
          
          {/* Col 1: À propos - Logo BN (agrandi et aligné avec les titres de section) */}
          <div className="lg:col-span-2 flex flex-col">
            {/* Logo aligné sur la même ligne de base que les titres des autres sections */}
            <div className="mb-6 flex items-start">
              <img
                src={logoDigitalLibrary}
                alt="Bibliothèque Numérique Marocaine — Ibn Battûta"
                className="h-24 md:h-28 w-auto object-contain"
                loading="lazy"
              />
            </div>
            
            <p className="text-sm opacity-90 leading-relaxed mb-4">
              {ml(
                settings.description_fr,
                settings.description_ar,
                "Digital Library of Morocco - Ibn Battuta. A digital platform providing access to Moroccan written heritage: manuscripts, periodicals and rare documents.",
                "Biblioteca Digital de Marruecos - Ibn Battuta. Plataforma digital que da acceso al patrimonio escrito marroquí: manuscritos, periódicos y documentos raros.",
                "ⵜⴰⵙⴷⵍⵉⵙⵜ ⵜⴰⵏⵓⵎⴰⵏⵜ ⵏ ⵍⵎⵖⵔⵉⴱ - ⵉⴱⵏ ⴱⴰⵟⵟⵓⵟⴰ. ⴰⵙⵓⵔⵉⴼ ⴰⵏⵓⵎⴰⵏ ⵏ ⵓⵢⴷⴰ ⴰⵎⵉⵔⴰ ⴰⵎⵖⵔⵉⴱⵉ."
              )}
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
                {ml(quickLinks.title_fr, quickLinks.title_ar, 'Quick Links', 'Enlaces rápidos', 'ⵉⵣⴷⴰⵢⵏ ⵉⵎⴰⵍⴰⵙⵏ')}
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
                      {linkText(link)}
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
                {ml(worldReservoirs.title_fr, worldReservoirs.title_ar, 'World Repositories', 'Repositorios mundiales', 'ⵉⵙⴰⴳⵎⵏ ⵉⵎⴰⴹⵍⴰⵏⵏ')}
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
                      {linkText(link)}
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
                {ml(supportSection.title_fr, supportSection.title_ar, 'Help & Support', 'Ayuda y soporte', 'ⵜⴰⵡⵉⵙⵉ ⴷ ⵓⵙⵎⴽⵍ')}
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
                      {linkText(link)}
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
              {ml('Contact', 'اتصل بنا', 'Contact', 'Contacto', 'ⴰⵎⵢⴰⵡⴰⴹ')}
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-gold-bn-primary" />
                <p className="text-sm opacity-80 leading-relaxed">
                  {ml(settings.contact.address_fr, settings.contact.address_ar, "Ibn Battouta Avenue, Rabat, Morocco", "Avenida Ibn Battouta, Rabat, Marruecos", "ⴰⴱⵔⵉⴷ ⵏ ⵉⴱⵏ ⴱⴰⵟⵟⵓⵟⴰ, ⵕⵕⴱⴰⵟ, ⵍⵎⵖⵔⵉⴱ")}
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
                  {ml(settings.contact.hours_fr, settings.contact.hours_ar, "Mon - Fri: 9:00 AM - 6:00 PM | Sat: 9:00 AM - 1:00 PM", "Lun - Vie: 9:00 - 18:00 | Sáb: 9:00 - 13:00", "ⴰⵢⵏⴰⵙ - ⴰⵙⵉⵎⵡⴰⵙ: 9:00 - 18:00 | ⴰⵙⵉⴹⵢⴰⵙ: 9:00 - 13:00")}
                </p>
              </div>
            </div>
          </div>

          {/* Col 6: Newsletter */}
          <div className="flex flex-col">
            <h4 className="text-lg font-semibold mb-6 flex items-start text-bn-blue-primary min-h-[3.5rem]">
              <span className="w-1 h-6 mr-3 rounded bg-gold-bn-primary"></span>
              {ml('Newsletter', 'النشرة الإخبارية', 'Newsletter', 'Boletín', 'ⵜⴰⴱⵔⴰⵜ ⵏ ⵉⵙⴰⵍⵏ')}
            </h4>
            <div>
              <p className="text-sm opacity-80 mb-4 leading-relaxed">
                {ml(
                  'Restez informé des dernières actualités et nouvelles collections.',
                  'ابق على اطلاع بآخر المستجدات والمجموعات الجديدة.',
                  'Stay informed about the latest news and new collections.',
                  'Manténgase informado de las últimas novedades y nuevas colecciones.',
                  'ⵇⵇⵉⵎ ⵙ ⵜⵎⵓⵙⵙⵏⴰ ⵖⴼ ⵉⵙⴰⵍⵏ ⵉⵎⴳⴳⵓⵔⴰ ⴷ ⵜⵉⴳⵔⴰⵡⵉⵏ ⵜⵉⵎⴰⵢⵏⵓⵜⵉⵏ.'
                )}
              </p>
              <form onSubmit={handleNewsletterSubscribe} className="space-y-3">
                <Input 
                  type="email" 
                  placeholder={ml('Votre email', 'بريدك الإلكتروني', 'Your email', 'Su correo electrónico', 'ⵉⵎⴰⵢⵍ ⵏⵏⴽ')}
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
                      {ml('Abonnement...', 'جارٍ الاشتراك...', 'Subscribing...', 'Suscribiendo...', 'ⴰⵎⵜⵜⴰⵡ...')}
                    </>
                  ) : (
                    ml("S'abonner", 'اشترك', 'Subscribe', 'Suscribirse', 'ⵜⵜⴰⵡ')
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
                {linkText(link)}
              </a>
            ))}
          </div>
          
          {/* Copyright */}
          <div className="text-center">
            <p className="text-sm opacity-80">
              © {currentYear} {ml(settings.copyright_fr, settings.copyright_ar, "Digital Library of Morocco - Ibn Battuta", "Biblioteca Digital de Marruecos - Ibn Battuta", "ⵜⴰⵙⴷⵍⵉⵙⵜ ⵜⴰⵏⵓⵎⴰⵏⵜ ⵏ ⵍⵎⵖⵔⵉⴱ - ⵉⴱⵏ ⴱⴰⵟⵟⵓⵟⴰ")}. {ml('Tous droits réservés.', 'جميع الحقوق محفوظة.', 'All rights reserved.', 'Todos los derechos reservados.', 'ⵎⴰⵕⵕⴰ ⵉⵣⵔⴼⴰⵏ ⵜⵜⵓⵃⵟⵟⵓⵏ.')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DigitalLibraryFooter;
