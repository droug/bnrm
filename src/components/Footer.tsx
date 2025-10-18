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
import logoBnrm from "@/assets/logo-bnrm.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  // Check if we're on a Kitab page
  const isKitabPage = location.pathname.startsWith('/kitab');

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
    { title: t('header.catalog'), href: "#catalogue" },
    { title: t('header.collections'), href: "#collections" },
    { title: t('footer.hours'), href: "/practical-info" },
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

  const paymentLinks = [
    { title: "e-Wallet BNRM", href: "/wallet" },
    { title: "Services BNRM", href: "/bnrm" },
    { title: "Reproduction", href: "/reproduction" },
    { title: "Dépôt légal", href: "/admin/legal-deposit" }
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
      : "bg-primary text-primary-foreground"
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
                ? "Kitab, la plateforme digitale dédiée à l'édition marocaine et à la promotion de l'industrie nationale du livre."
                : "La Bibliothèque Nationale du Royaume du Maroc, gardienne du patrimoine écrit et promotrice du savoir au service de tous."
              }
            </p>
            
            <div className="flex items-center space-x-3">
              {socialLinks.map((social, index) => (
                <Button 
                  key={index}
                  variant="ghost" 
                  size="icon"
                  className={isKitabPage 
                    ? "opacity-70 hover:opacity-100 hover:bg-muted"
                    : "opacity-70 hover:opacity-100 hover:bg-white/10"
                  }
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
              <span className={`w-1 h-6 mr-3 rounded ${isKitabPage ? 'bg-[hsl(var(--kitab-accent))]' : 'bg-accent'}`}></span>
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-sm opacity-80 hover:opacity-100 hover:translate-x-1 transition-all inline-block"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Aide et support */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center">
              <span className={`w-1 h-6 mr-3 rounded ${isKitabPage ? 'bg-[hsl(var(--kitab-accent))]' : 'bg-accent'}`}></span>
              Aide et support
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-sm opacity-80 hover:opacity-100 hover:translate-x-1 transition-all inline-block"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Paiements & Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center">
              <span className={`w-1 h-6 mr-3 rounded ${isKitabPage ? 'bg-[hsl(var(--kitab-accent))]' : 'bg-accent'}`}></span>
              Paiements
            </h4>
            <ul className="space-y-3">
              {paymentLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-sm opacity-80 hover:opacity-100 hover:translate-x-1 transition-all inline-block"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center">
              <span className={`w-1 h-6 mr-3 rounded ${isKitabPage ? 'bg-[hsl(var(--kitab-accent))]' : 'bg-accent'}`}></span>
              {t('footer.contact')}
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className={`h-4 w-4 mt-1 flex-shrink-0 ${isKitabPage ? 'text-[hsl(var(--kitab-accent))]' : 'text-accent'}`} />
                <p className="text-sm opacity-80 leading-relaxed">{t('footer.location')}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className={`h-4 w-4 flex-shrink-0 ${isKitabPage ? 'text-[hsl(var(--kitab-accent))]' : 'text-accent'}`} />
                <span className="text-sm opacity-80">+212 537 27 16 33</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className={`h-4 w-4 flex-shrink-0 ${isKitabPage ? 'text-[hsl(var(--kitab-accent))]' : 'text-accent'}`} />
                <span className="text-sm opacity-80">
                  {isKitabPage ? 'kitab@bnrm.ma' : 'contact@bnrm.ma'}
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className={`h-4 w-4 mt-1 flex-shrink-0 ${isKitabPage ? 'text-[hsl(var(--kitab-accent))]' : 'text-accent'}`} />
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
              <span className={`w-1 h-6 mr-3 rounded ${isKitabPage ? 'bg-[hsl(var(--kitab-accent))]' : 'bg-accent'}`}></span>
              Nous suivre
            </h4>
            <p className="text-sm opacity-80 mb-4 leading-relaxed">
              Restez informé de nos actualités et nouvelles acquisitions.
            </p>
            <form onSubmit={handleNewsletterSubscribe} className="space-y-3">
              <Input 
                type="email" 
                placeholder="Votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
                className={isKitabPage
                  ? "bg-background border-input text-sm"
                  : "bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 text-sm"
                }
              />
              <Button 
                type="submit"
                disabled={isSubscribing}
                className={isKitabPage 
                  ? "w-full bg-[hsl(var(--kitab-accent))] hover:bg-[hsl(var(--kitab-accent))]/90 text-white font-medium text-sm" 
                  : "w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium text-sm"
                }
              >
                {isSubscribing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Abonnement...
                  </>
                ) : (
                  "S'abonner"
                )}
              </Button>
            </form>
            <p className="text-xs opacity-60 mt-3 leading-relaxed">
              En vous abonnant, vous acceptez de recevoir nos communications.
            </p>
          </div>
        </div>

        <Separator className={isKitabPage ? "bg-border mb-8" : "bg-white/20 mb-8"} />

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
                {link.title}
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