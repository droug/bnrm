import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { RubElHizb } from "@/components/RubElHizb";
import bibliothequeNumerique from "@/assets/bibliotheque-numerique.jpg";
import kitabBackground from "@/assets/kitab-background.jpg";
import manuscritsBackground from "@/assets/manuscrits-background.jpg";
import culturalActivitiesBackground from "@/assets/cultural-activities-background.jpg";
import cbmBackground from "@/assets/cbm-background.jpg";

interface PlatformsSectionProps {
  language: string;
}

export const PlatformsSection = ({ language }: PlatformsSectionProps) => {
  const navigate = useNavigate();

  const mainPlatform = {
    title: language === 'ar' ? 'المكتبة الرقمية' : 'Bibliothèque Numérique',
    description: language === 'ar' 
      ? 'استكشف مجموعاتنا الرقمية الغنية من الكتب والمخطوطات والوثائق التاريخية المتاحة للاستشارة عبر الإنترنت'
      : 'Explorez nos riches collections numériques de livres, manuscrits et documents historiques disponibles en consultation en ligne',
    path: '/digital-library',
    image: bibliothequeNumerique,
    number: '01'
  };

  const secondaryPlatforms = [
    {
      title: language === 'ar' ? 'مخطوطات' : 'Manuscrits',
      path: '/plateforme-manuscrits',
      image: manuscritsBackground,
      number: '02'
    },
    {
      title: 'Kitab',
      path: '/kitab',
      image: kitabBackground,
      number: '03'
    },
    {
      title: language === 'ar' ? 'الأنشطة الثقافية' : 'Activités Culturelles',
      path: '/cultural-activities',
      image: culturalActivitiesBackground,
      number: '04'
    },
    {
      title: 'CBM',
      path: '/cbm',
      image: cbmBackground,
      number: '05'
    }
  ];

  return (
    <div className="relative py-20 my-12 overflow-hidden bg-[rgb(32,45,94)] rounded-lg">
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-12">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-wide mb-2">
            BNRM
          </p>
          <h2 className="text-4xl font-bold text-white mb-4">
            {language === 'ar' ? 'منصاتنا الرئيسية' : 'Nos Principales Plateformes'}
          </h2>
          <div className="w-24 h-1 bg-orange-500 mb-4"></div>
          <p className="text-white/80">
            {language === 'ar' 
              ? 'اكتشف منصاتنا الرقمية'
              : 'Découvrez nos plateformes numériques'
            }
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr,auto] gap-8 items-start">
          {/* Main Platform - Book Cover */}
          <div 
            className="relative cursor-pointer group"
            onClick={() => navigate(mainPlatform.path)}
            style={{ 
              perspective: '2000px',
              transformStyle: 'preserve-3d'
            }}
          >
            <div 
              className="relative w-full h-[600px] transition-all duration-500 ease-out"
              style={{
                transform: 'rotateY(-5deg)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Book Cover Front */}
              <div className="absolute inset-0 rounded-r-lg overflow-hidden shadow-2xl group-hover:shadow-3xl transition-all duration-500"
                   style={{
                     background: 'linear-gradient(to right, rgba(0,0,0,0.1) 0%, transparent 5%)',
                   }}>
                
                {/* Cover Image */}
                <img 
                  src={mainPlatform.image}
                  alt={mainPlatform.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
                
                {/* Number Badge */}
                <div className="absolute top-8 right-8 z-10">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <RubElHizb className="absolute inset-0 w-full h-full" color="#f97316" />
                    <span className="relative z-10 font-bold text-2xl text-white drop-shadow-lg">
                      {mainPlatform.number}
                    </span>
                  </div>
                </div>
                
                {/* Book Title and Description */}
                <div className="absolute inset-0 p-12 flex flex-col justify-between">
                  <div>
                    <h3 className="text-5xl font-bold text-white mb-6 drop-shadow-2xl leading-tight">
                      {mainPlatform.title}
                    </h3>
                  </div>
                  
                  <div>
                    <p className="text-white/95 text-lg leading-relaxed drop-shadow-lg mb-8">
                      {mainPlatform.description}
                    </p>
                    
                    {/* Decorative line */}
                    <div className="w-32 h-1 bg-primary/80 rounded-full" />
                  </div>
                </div>
                
                {/* Book spine shadow effect */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/30 to-transparent" />
                
                {/* Book edge highlight */}
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-white/20 to-transparent" />
              </div>
              
              {/* Book thickness/spine */}
              <div 
                className="absolute -left-4 top-0 bottom-0 w-4 bg-gradient-to-r from-[#5a3921] to-[#8B6F47] rounded-l-sm"
                style={{
                  transform: 'rotateY(-90deg)',
                  transformOrigin: 'right',
                }}
              />
            </div>
          </div>

          {/* Bookshelf - Secondary Platforms as Books */}
          <div className="relative h-[600px] flex flex-col justify-end">
            {/* Bookshelf */}
            <div className="flex gap-2 items-end pb-4 relative">
              {secondaryPlatforms.map((platform, index) => {
                const bookColors = [
                  'from-[#8B4513] to-[#654321]', // Marron cuir
                  'from-[#1e3a5f] to-[#0d1b2a]', // Bleu nuit
                  'from-[#2d5016] to-[#1a3009]', // Vert forêt
                  'from-[#7c2d12] to-[#5a1f0a]', // Bordeaux
                ];
                
                const heights = ['h-[550px]', 'h-[550px]', 'h-[550px]', 'h-[550px]'];
                
                return (
                  <div
                    key={platform.number}
                    className={`relative ${heights[index]} w-28 cursor-pointer group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}
                    onClick={() => navigate(platform.path)}
                    style={{ 
                      transformStyle: 'preserve-3d',
                      perspective: '1000px'
                    }}
                  >
                    {/* Book spine */}
                    <div className={`absolute inset-0 bg-gradient-to-b ${bookColors[index]} rounded-sm shadow-lg`}>
                      {/* Book texture overlay */}
                      <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.1) 50%, transparent 100%)`
                      }} />
                      
                      {/* Pattern overlay */}
                      <img 
                        src={platform.image}
                        alt={platform.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay"
                      />
                      
                      {/* Book binding lines */}
                      <div className="absolute top-0 left-0 w-1 h-full bg-black/20" />
                      <div className="absolute top-0 right-0 w-1 h-full bg-white/10" />
                      
                      {/* Number badge on spine */}
                      <div className="absolute top-6 left-1/2 -translate-x-1/2">
                        <div className="relative w-8 h-8 flex items-center justify-center">
                          <RubElHizb className="absolute inset-0 w-full h-full" color="#f97316" />
                          <span className="relative z-10 font-bold text-xs text-white drop-shadow-md">
                            {platform.number}
                          </span>
                        </div>
                      </div>
                      
                      {/* Book title - vertical */}
                      <div className="absolute top-20 bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center">
                        <div className="transform -rotate-90 origin-center whitespace-nowrap">
                          <span className="text-white font-bold text-sm tracking-widest uppercase drop-shadow-md">
                            {platform.title}
                          </span>
                        </div>
                      </div>
                      
                      {/* Book edge highlight */}
                      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                    
                    {/* Book top edge (visible when hovering) */}
                    <div className={`absolute -top-1 inset-x-0 h-2 bg-gradient-to-r ${bookColors[index]} opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm`} />
                  </div>
                );
              })}
            </div>
            
            {/* Shelf */}
            <div className="w-full h-3 bg-gradient-to-b from-[#8B7355] to-[#6B5845] rounded-sm shadow-md relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
            <div className="w-full h-8 bg-gradient-to-b from-[#6B5845] to-[#4A3933] shadow-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
