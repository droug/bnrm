import { Button } from "@/components/ui/button";
import { Search, Eye } from "lucide-react";
import heroImage from "@/assets/bnrm-hero.jpg";
import { useLanguage } from "@/hooks/useLanguage";
import { Link } from "react-router-dom";

// Composant pour le "O" stylisé avec icône foot
const StyledO = ({ variant = "default" }: { variant?: "default" | "red" | "green" }) => {
  const colors = {
    default: { outer: "#FFFFFF", inner: "#C4A052" },
    red: { outer: "#C41E3A", inner: "#C4A052" },
    green: { outer: "#006233", inner: "#C4A052" }
  };
  const color = colors[variant];
  
  return (
    <span className="inline-flex items-center justify-center w-[0.85em] h-[0.85em] relative align-middle mx-[0.02em]">
      <svg viewBox="0 0 24 24" className="w-full h-full">
        {/* Ballon de foot stylisé */}
        <circle cx="12" cy="12" r="11" fill={color.outer} stroke={color.inner} strokeWidth="0.5"/>
        <circle cx="12" cy="12" r="4" fill={color.inner}/>
        {/* Pentagones */}
        <path d="M12 1 L14 5 L12 8 L10 5 Z" fill={color.inner} opacity="0.8"/>
        <path d="M23 12 L19 14 L16 12 L19 10 Z" fill={color.inner} opacity="0.8"/>
        <path d="M12 23 L10 19 L12 16 L14 19 Z" fill={color.inner} opacity="0.8"/>
        <path d="M1 12 L5 10 L8 12 L5 14 Z" fill={color.inner} opacity="0.8"/>
      </svg>
    </span>
  );
};

const Hero = () => {
  const { language, isRTL } = useLanguage();
  
  const content = {
    fr: {
      tag: "Patrimoine National Marocain",
      description: "Préservation et valorisation du patrimoine manuscrit marocain. Découvrez des milliers de manuscrits anciens numérisés avec la technologie IIIF dans un cadre architectural exceptionnel.",
      exploreBtn: "Explorer les collections",
      viewerBtn: "Visionneuse de manuscrits"
    },
    ar: {
      tag: "التراث الوطني المغربي",
      description: "الحفاظ على التراث المخطوط المغربي وتثمينه. اكتشف آلاف المخطوطات القديمة الرقمية بتقنية IIIF في إطار معماري استثنائي.",
      exploreBtn: "استكشف المجموعات",
      viewerBtn: "عارض المخطوطات"
    }
  };

  const t = content[language as keyof typeof content] || content.fr;

  return (
    <section className="relative min-h-[75vh] flex items-center overflow-hidden">
      {/* Background avec image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${heroImage})`,
        }}
      >
        {/* Overlay sombre léger pour lisibilité */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Content */}
      <div className={`relative z-10 container mx-auto px-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className="max-w-4xl">
          {/* Tag */}
          <div className="mb-6 animate-fade-in">
            <span className="inline-block bg-primary text-white px-6 py-2 text-sm font-medium rounded">
              {t.tag}
            </span>
          </div>

          {/* Main title avec les O stylisés */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in tracking-wide">
            {language === 'ar' ? (
              <>
                المكتبة <StyledO /> الوطنية
                <br />
                للمملكة المغربية
              </>
            ) : (
              <>
                BIBLI<StyledO />THÈQUE NATI<StyledO />NALE
                <br />
                DU R<StyledO />YAUME DU MAR<StyledO variant="red" /><span className="text-morocco-green">C</span>
              </>
            )}
          </h1>

          {/* Description */}
          <p className="text-base md:text-lg text-white/90 mb-8 max-w-2xl leading-relaxed animate-fade-in">
            {t.description}
          </p>

          {/* Action buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'justify-end' : 'justify-start'} items-start sm:items-center animate-fade-in`}>
            <Link to="/digital-library">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-base font-medium rounded shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Search className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t.exploreBtn}
              </Button>
            </Link>
            <Link to="/plateforme-manuscrits">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-base font-medium rounded shadow-lg transition-all duration-300"
              >
                <Eye className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t.viewerBtn}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
