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

  const platforms = [
    {
      title: language === 'ar' ? 'المكتبة الرقمية' : 'Bibliothèque Numérique',
      description: language === 'ar' 
        ? 'استكشف مجموعاتنا الرقمية الغنية من الكتب والمخطوطات والوثائق التاريخية'
        : 'Explorez nos riches collections numériques de livres, manuscrits et documents historiques',
      path: '/digital-library',
      image: zelligePattern5,
      number: '01',
      isMain: true
    },
    {
      title: language === 'ar' ? 'مخطوطات' : 'Manuscrits',
      path: '/plateforme-manuscrits',
      image: zelligePattern1,
      number: '02',
      isMain: false
    },
    {
      title: 'Kitab',
      path: '/kitab',
      image: zelligePattern6,
      number: '03',
      isMain: false
    },
    {
      title: language === 'ar' ? 'الأنشطة الثقافية' : 'Activités Culturelles',
      path: '/cultural-activities',
      image: zelligePattern3,
      number: '04',
      isMain: false
    },
    {
      title: 'CBM',
      path: '/cbm',
      image: zelligePattern2,
      number: '05',
      isMain: false
    }
  ];

  const bookColors = [
    'from-[#1e3a5f] to-[#0d1b2a]', // Bleu nuit pour Bibliothèque Numérique
    'from-[#8B4513] to-[#654321]', // Marron cuir
    'from-[#1e3a5f] to-[#0d1b2a]', // Bleu nuit
    'from-[#2d5016] to-[#1a3009]', // Vert forêt
    'from-[#7c2d12] to-[#5a1f0a]', // Bordeaux
  ];
  
  const heights = ['h-[450px]', 'h-[380px]', 'h-[420px]', 'h-[400px]', 'h-[390px]'];

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

        {/* Bookshelf - All Platforms as Books */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Bookshelf */}
            <div className="flex gap-2 items-end pb-4 relative">
              {platforms.map((platform, index) => (
                <div
                  key={platform.number}
                  className={`relative ${heights[index]} ${platform.isMain ? 'w-36' : 'w-28'} cursor-pointer group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}
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
                      <div className={`bg-white/90 text-gray-800 font-bold ${platform.isMain ? 'text-base w-10 h-10' : 'text-sm w-8 h-8'} rounded-full flex items-center justify-center shadow-md`}>
                        {platform.number}
                      </div>
                    </div>
                    
                    {/* Book title - vertical */}
                    <div className="absolute top-24 bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center px-2">
                      <div className="transform -rotate-90 origin-center whitespace-nowrap">
                        <span className={`text-white font-bold ${platform.isMain ? 'text-base' : 'text-sm'} tracking-widest uppercase drop-shadow-md`}>
                          {platform.title}
                        </span>
                        {platform.isMain && platform.description && (
                          <span className="block text-xs text-white/80 mt-2 normal-case tracking-normal max-w-[200px] line-clamp-2">
                            {platform.description}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Book edge highlight */}
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                  
                  {/* Book top edge (visible when hovering) */}
                  <div className={`absolute -top-1 inset-x-0 h-2 bg-gradient-to-r ${bookColors[index]} opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm`} />
                </div>
              ))}
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
