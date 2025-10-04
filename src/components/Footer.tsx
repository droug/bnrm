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

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

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
    <footer className="bg-primary text-primary-foreground">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Organization info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center">
                <Book className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold">BNRM</h3>
                <p className="text-sm text-primary-foreground/80">Bibliothèque Nationale</p>
              </div>
            </div>
            <p className="text-primary-foreground/90 mb-6 leading-relaxed">
              La Bibliothèque Nationale du Royaume du Maroc, gardienne du patrimoine écrit 
              et promotrice du savoir au service de tous.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <Button 
                  key={index}
                  variant="ghost" 
                  size="sm" 
                  className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10 p-2"
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
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
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
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
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
                <MapPin className="h-5 w-5 mt-0.5 text-accent" />
                <div className="text-primary-foreground/80">
                  <p>{t('footer.location')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-accent" />
                <span className="text-primary-foreground/80">{t('footer.phone')}: +212 537 27 16 33</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-accent" />
                <span className="text-primary-foreground/80">{t('footer.email')}: contact@bnrm.ma</span>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 mt-0.5 text-accent" />
                <div className="text-primary-foreground/80">
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
            <p className="text-primary-foreground/80 mb-4">
              Newsletter - Restez informé de nos actualités et nouvelles acquisitions.
            </p>
            <div className="space-y-3">
              <Input 
                type="email" 
                placeholder="Votre email"
                className="bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/60 focus:border-accent"
              />
              <Button 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
              >
                S'abonner
              </Button>
            </div>
            <p className="text-xs text-primary-foreground/60 mt-3">
              En vous abonnant, vous acceptez de recevoir nos communications.
            </p>
          </div>
        </div>

        <Separator className="bg-white/20 mb-8" />

        {/* Bottom section */}
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
          {/* Copyright */}
          <div className="text-center lg:text-left">
            <p className="text-primary-foreground/80">
              © {currentYear} {t('header.title')}. {t('footer.rights')}
            </p>
          </div>

          {/* Legal links */}
          <div className="flex flex-wrap justify-center lg:justify-end gap-6">
            {legalLinks.map((link, index) => (
              <a 
                key={index}
                href={link.href}
                className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
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