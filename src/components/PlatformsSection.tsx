import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import zelligePattern1 from "@/assets/zellige-pattern-1.jpg";
import zelligePattern2 from "@/assets/zellige-pattern-2.jpg";
import zelligePattern3 from "@/assets/zellige-pattern-3.jpg";
import zelligePattern5 from "@/assets/zellige-pattern-5.jpg";
import zelligePattern6 from "@/assets/zellige-pattern-6.jpg";

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
    image: zelligePattern5,
    number: '01'
  };

  const secondaryPlatforms = [
    {
      title: language === 'ar' ? 'مخطوطات' : 'Manuscrits',
      path: '/plateforme-manuscrits',
      image: zelligePattern1,
      number: '02'
    },
    {
      title: 'Kitab',
      path: '/kitab',
      image: zelligePattern6,
      number: '03'
    },
    {
      title: language === 'ar' ? 'الأنشطة الثقافية' : 'Activités Culturelles',
      path: '/cultural-activities',
      image: zelligePattern3,
      number: '04'
    },
    {
      title: 'CBM',
      path: '/cbm',
      image: zelligePattern2,
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
          {/* Main Platform - Left Side */}
          <div className="relative bg-white rounded-lg overflow-hidden shadow-xl cursor-pointer group hover:shadow-2xl transition-all"
               onClick={() => navigate(mainPlatform.path)}>
            <div className="absolute top-6 left-0 z-10">
              <div className="bg-primary text-primary-foreground font-bold text-3xl px-8 py-4 clip-path-arrow">
                {mainPlatform.number}
              </div>
            </div>
            
            <div className="p-8 pt-24">
              <h3 className="text-4xl font-bold text-foreground mb-4">
                {mainPlatform.title}
              </h3>
              <p className="text-muted-foreground mb-8 leading-relaxed text-base">
                {mainPlatform.description}
              </p>
              
              <div className="relative h-72 rounded-lg overflow-hidden">
                <img 
                  src={mainPlatform.image}
                  alt={mainPlatform.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Vertical text on left edge */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-100 px-2 py-8">
              <div className="transform -rotate-90 origin-center whitespace-nowrap text-sm font-bold text-gray-600">
                {mainPlatform.title}
              </div>
            </div>
          </div>

          {/* Bookshelf - Secondary Platforms as Books */}
          <div className="relative">
            {/* Bookshelf */}
            <div className="flex gap-2 items-end pb-4 relative">
              {secondaryPlatforms.map((platform, index) => {
                const bookColors = [
                  'from-[#8B4513] to-[#654321]', // Marron cuir
                  'from-[#1e3a5f] to-[#0d1b2a]', // Bleu nuit
                  'from-[#2d5016] to-[#1a3009]', // Vert forêt
                  'from-[#7c2d12] to-[#5a1f0a]', // Bordeaux
                ];
                
                const heights = ['h-[380px]', 'h-[420px]', 'h-[400px]', 'h-[390px]'];
                
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
                        <div className="bg-white/90 text-gray-800 font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                          {platform.number}
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
