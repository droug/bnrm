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
  Heart
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocation } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();
  const location = useLocation();
  
  // Check if we're on a Kitab page
  const isKitabPage = location.pathname.startsWith('/kitab');

  const quickLinks = [
    { title: t('header.catalog'), href: "#catalogue" },
    { title: t('header.collections'), href: "#collections" },
    { title: t('footer.hours'), href: "#horaires" },
    { title: t('footer.about'), href: "#inscription" },
    { title: t('header.services'), href: "#depot-legal" },
    { title: t('footer.contact'), href: "#contact" }
  ];

  const legalLinks = [
    { title: "Paramètres du site", href: "/settings" },
    { title: "Empreinte carbone du site", href: "#empreinte-carbone" },
    { title: "Marché public", href: "#marche-public" },
    { title: "Nous rejoindre", href: "#recrutement" },
    { title: "Conditions d'utilisation", href: "#conditions" },
    { title: "Mentions légales", href: "#mentions" },
    { title: "Flux RSS", href: "#rss" },
    { title: "Confidentialité", href: "#confidentialite" }
  ];

  const supportLinks = [
    { title: "FAQ", href: "#faq" },
    { title: "Règlements", href: "#reglements" },
    { title: "Contacts", href: "#contacts" },
    { title: "Chatbot d'assistance", href: "#chatbot" }
  ];

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, href: "#facebook", label: "Facebook" },
    { icon: <Twitter className="h-5 w-5" />, href: "#twitter", label: "Twitter" },
    { icon: <Youtube className="h-5 w-5" />, href: "#youtube", label: "YouTube" },
    { icon: <Instagram className="h-5 w-5" />, href: "#instagram", label: "Instagram" }
  ];

  return (
    <footer className={isKitabPage 
      ? "bg-orange-50 text-foreground border-t border-orange-100" 
      : "bg-primary text-primary-foreground"
    }>
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Organization info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className={isKitabPage 
                ? "w-12 h-12 bg-[hsl(var(--kitab-accent))]/10 rounded-full flex items-center justify-center"
                : "w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center"
              }>
                <Book className={isKitabPage ? "h-6 w-6 text-[hsl(var(--kitab-accent))]" : "h-6 w-6 text-accent-foreground"} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{isKitabPage ? "Kitab" : "BNRM"}</h3>
                <p className="text-sm opacity-80">
                  {isKitabPage ? "Plateforme Nationale de l'Édition" : "Bibliothèque Nationale"}
                </p>
              </div>
            </div>
            <p className="opacity-90 mb-6 leading-relaxed">
              {isKitabPage 
                ? "Kitab, la plateforme digitale dédiée à l'édition marocaine et à la promotion de l'industrie nationale du livre."
                : "La Bibliothèque Nationale du Royaume du Maroc, gardienne du patrimoine écrit et promotrice du savoir au service de tous."
              }
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <Button 
                  key={index}
                  variant="ghost" 
                  size="sm" 
                  className={isKitabPage 
                    ? "opacity-70 hover:opacity-100 hover:bg-muted p-2"
                    : "opacity-70 hover:opacity-100 hover:bg-white/10 p-2"
                  }
                  aria-label={social.label}
                >
                  {social.icon}
                </Button>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="opacity-80 hover:opacity-100 transition-colors"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support and Help */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Aide et support</h4>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="opacity-80 hover:opacity-100 transition-colors"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">{t('footer.contact')}</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className={`h-5 w-5 mt-0.5 ${isKitabPage ? 'text-[hsl(var(--kitab-accent))]' : 'text-accent'}`} />
                <div className="opacity-80">
                  <p>{t('footer.location')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className={`h-5 w-5 ${isKitabPage ? 'text-[hsl(var(--kitab-accent))]' : 'text-accent'}`} />
                <span className="opacity-80">{t('footer.phone')}: +212 537 27 16 33</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className={`h-5 w-5 ${isKitabPage ? 'text-[hsl(var(--kitab-accent))]' : 'text-accent'}`} />
                <span className="opacity-80">
                  {t('footer.email')}: {isKitabPage ? 'kitab@bnrm.ma' : 'contact@bnrm.ma'}
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className={`h-5 w-5 mt-0.5 ${isKitabPage ? 'text-[hsl(var(--kitab-accent))]' : 'text-accent'}`} />
                <div className="opacity-80">
                  <p>{t('footer.monday')}</p>
                  <p>{t('footer.saturday')}</p>
                  <p>{t('footer.sunday')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Nous suivre</h4>
            <p className="opacity-80 mb-4">
              Newsletter - Restez informé de nos actualités et nouvelles acquisitions.
            </p>
            <div className="space-y-3">
              <Input 
                type="email" 
                placeholder="Votre email"
                className={isKitabPage
                  ? "bg-background border-input"
                  : "bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
                }
              />
              <Button 
                className={isKitabPage 
                  ? "w-full bg-[hsl(var(--kitab-accent))] hover:bg-[hsl(var(--kitab-accent))]/90 text-white font-medium" 
                  : "w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
                }
              >
                S'abonner
              </Button>
            </div>
            <p className="text-xs opacity-60 mt-3">
              En vous abonnant, vous acceptez de recevoir nos communications.
            </p>
          </div>
        </div>

        <Separator className={isKitabPage ? "bg-border mb-8" : "bg-white/20 mb-8"} />

        {/* Bottom section */}
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
          {/* Copyright */}
          <div className="text-center lg:text-left">
            <p className="opacity-80">
              © {currentYear} {isKitabPage ? "Kitab - BNRM" : t('header.title')}. {t('footer.rights')}
            </p>
          </div>

          {/* Legal links */}
          <div className="flex flex-wrap justify-center lg:justify-end gap-6">
            {legalLinks.map((link, index) => (
              <a 
                key={index}
                href={link.href}
                className="text-sm opacity-70 hover:opacity-100 transition-colors"
              >
                {link.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;