import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Search, 
  Download, 
  Users, 
  Clock, 
  MapPin, 
  Smartphone,
  Shield
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

import moroccanPatternBg from "@/assets/moroccan-pattern-bg.jpg";

const Services = () => {
  const { t } = useLanguage();
  const services = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: t('services.consultation.title'),
      description: t('services.consultation.desc'),
      features: ["Salles de lecture spécialisées", "Assistance bibliographique", "Accès WiFi gratuit"]
    },
    {
      icon: <Download className="h-8 w-8" />,
      title: t('services.digitization.title'),
      description: t('services.digitization.desc'),
      features: ["Manuscrits numérisés", "Livres rares", "Documents patrimoniaux"]
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: t('services.research.title'),
      description: t('services.research.desc'),
      features: ["Catalogue en ligne", "Recherche multicritères", "Alertes personnalisées"]
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: t('services.legal.title'),
      description: t('services.legal.desc'),
      features: ["Dépôt obligatoire", "ISBN/ISSN", "Conservation légale"]
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: t('services.training.title'),
      description: t('services.training.desc'),
      features: ["Ateliers étudiants", "Formation professionnelle", "Visites guidées"]
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: t('services.exhibitions.title'),
      description: t('services.exhibitions.desc'),
      features: ["Exposition permanente", "Manifestations culturelles", "Événements"]
    }
  ];

  const quickServices = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: t('footer.hours'),
      description: `${t('footer.monday')}\n${t('footer.saturday')}`
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Localisation",
      description: t('footer.location')
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Inscription",
      description: "Gratuite pour tous\nles citoyens"
    }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t('services.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('services.subtitle')}
          </p>
        </div>

        {/* Quick info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {quickServices.map((service, index) => (
            <Card key={index} className="bg-card border-border shadow-elegant hover:shadow-moroccan transition-all duration-300 animate-slide-in relative overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}>
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url(${moroccanPatternBg})` }}
              ></div>
              <CardContent className="p-6 text-center relative z-10">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary-foreground">{service.icon}</div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{service.title}</h3>
                <p className="text-muted-foreground whitespace-pre-line">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="bg-card border-border shadow-elegant hover:shadow-moroccan transition-all duration-300 group animate-fade-in relative overflow-hidden"
                  style={{ animationDelay: `${(index + 3) * 0.1}s` }}>
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-15 group-hover:opacity-25 transition-opacity duration-300"
                style={{ backgroundImage: `url(${moroccanPatternBg})` }}
              ></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-16 h-16 bg-gradient-accent rounded-lg flex items-center justify-center mb-6 group-hover:animate-glow">
                  <div className="text-accent-foreground">{service.icon}</div>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {service.title}
                </h3>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {service.description}
                </p>
                
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant="outline" 
                  className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  En savoir plus
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16 animate-fade-in">
          <Card className="bg-gradient-primary border-0 shadow-moroccan max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-primary-foreground mb-4">
                Prêt à commencer votre recherche ?
              </h3>
              <p className="text-primary-foreground/90 mb-6">
                Inscrivez-vous gratuitement et accédez à toutes nos ressources
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="font-medium">
                  S'inscrire maintenant
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Planifier une visite
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Services;