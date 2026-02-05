import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Book3D } from "@/components/Book3D";
import { useState } from "react";
import bibliothequeNumerique from "@/assets/bibliotheque-numerique.jpg";
import kitabBackground from "@/assets/kitab-book.jpg";
import manuscritsBackground from "@/assets/manuscrits-background.jpg";
import culturalActivitiesBackground from "@/assets/cultural-activities-background.jpg";
import cbmBackground from "@/assets/cbm-background.jpg";
import islamicPattern from "@/assets/islamic-calligraphy-pattern.jpg";

interface PlatformsSectionProps {
  language: string;
}

export const PlatformsSection = ({ language }: PlatformsSectionProps) => {
  const navigate = useNavigate();
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);

  const mainPlatform = {
    title: language === 'ar' ? 'المكتبة الرقمية' : 'Bibliothèque Numérique',
    description: language === 'ar' 
      ? 'استكشف مجموعاتنا الرقمية الغنية من الكتب والمخطوطات والوثائق التاريخية المتاحة للاستشارة عبر الإنترنت'
      : 'Explorez nos riches collections numériques de livres, manuscrits et documents historiques disponibles en consultation en ligne',
    tooltip: language === 'ar'
      ? 'أكثر من 50,000 وثيقة رقمية • وصول مجاني على مدار الساعة • بحث متقدم'
      : 'Plus de 50 000 documents numérisés • Accès gratuit 24h/24 • Recherche avancée',
    path: '/digital-library',
    image: bibliothequeNumerique,
    number: '01'
  };

  const secondaryPlatforms = [
    {
      title: language === 'ar' ? 'مخطوطات' : 'Manuscrits',
      description: language === 'ar' 
        ? 'اكتشف كنوز المخطوطات العربية والأمازيغية النادرة'
        : 'Découvrez les trésors des manuscrits arabes et amazighes rares',
      path: '/plateforme-manuscrits',
      image: manuscritsBackground,
      number: '02'
    },
    {
      title: 'Kitab',
      description: language === 'ar'
        ? 'الفهرس الوطني الموحد للمكتبات المغربية'
        : 'Le catalogue national unifié des bibliothèques marocaines',
      path: '/kitab',
      image: kitabBackground,
      number: '03'
    },
    {
      title: language === 'ar' ? 'الأنشطة الثقافية' : 'Activités Culturelles',
      description: language === 'ar'
        ? 'معارض، محاضرات، ورشات عمل وفعاليات ثقافية متنوعة'
        : 'Expositions, conférences, ateliers et événements culturels variés',
      path: '/cultural-activities',
      image: culturalActivitiesBackground,
      number: '04'
    },
    {
      title: 'CBM',
      description: language === 'ar'
        ? 'الفهرس الببليوغرافي المغربي الشامل'
        : 'Le Catalogue Bibliographique Marocain complet',
      path: '/cbm',
      image: cbmBackground,
      number: '05'
    }
  ];

  return (
    <div className="relative py-20 my-12 overflow-hidden rounded-lg">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${islamicPattern})`,
        }}
      />
      
      {/* Light overlay for content readability */}
      <div className="absolute inset-0 bg-black/20" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-12">
          <p className="bnrm-caption uppercase tracking-widest text-orange-500 mb-2">
            BNRM
          </p>
          <h2 className="bnrm-section-title text-white mb-4">
            {language === 'ar' ? 'منصاتنا' : 'Nos Plateformes'}
          </h2>
          <div className="w-24 h-1 bg-orange-500 mb-4"></div>
          <p className="bnrm-body-text text-white/80">
            {language === 'ar' 
              ? 'اكتشف منصاتنا الرقمية'
              : 'Découvrez nos plateformes numériques'
            }
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr,auto] gap-8 items-start">
          {/* Main Platform - Book Front Cover View */}
          <div 
            className="relative cursor-pointer group transition-transform duration-300 hover:scale-[1.02]"
            onClick={() => navigate(mainPlatform.path)}
            onMouseEnter={() => setHoveredPlatform('main')}
            onMouseLeave={() => setHoveredPlatform(null)}
          >
            {/* Tooltip Bubble */}
            <div className={`absolute -top-4 left-1/2 -translate-x-1/2 -translate-y-full z-50 transition-all duration-300 ${
              hoveredPlatform === 'main' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}>
              <div className="relative bg-white rounded-2xl shadow-2xl p-5 max-w-[320px] border border-orange-100">
                {/* Arrow */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-orange-100" />
                
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white font-bold text-lg">01</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base mb-1">{mainPlatform.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{mainPlatform.tooltip}</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-orange-600 font-medium">
                    {language === 'ar' ? 'انقر للاستكشاف' : 'Cliquez pour explorer'}
                  </span>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-orange-300 animate-pulse delay-75" />
                    <span className="w-2 h-2 rounded-full bg-orange-200 animate-pulse delay-150" />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-[550px] w-[380px] flex">
              {/* Book Spine (left edge) */}
              <div className="w-6 h-full bg-gradient-to-r from-[#1a3a5c] via-[#2a5a8c] to-[#1a3a5c] rounded-l-sm shadow-inner flex-shrink-0">
                <div className="absolute left-0 top-0 w-6 h-full bg-gradient-to-r from-black/30 to-transparent" />
              </div>
              
              {/* Book Cover */}
              <div 
                className="relative flex-1 rounded-r-sm overflow-hidden"
                style={{
                  boxShadow: '8px 8px 20px rgba(0,0,0,0.4), 2px 2px 8px rgba(0,0,0,0.3), inset -2px 0 4px rgba(0,0,0,0.1)'
                }}
              >
                {/* Cover Image */}
                <img 
                  src={mainPlatform.image} 
                  alt={mainPlatform.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
                
                {/* Cover edge highlight (right side) */}
                <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-l from-white/20 to-transparent" />
                
                {/* Page edge effect (right side) */}
                <div className="absolute top-2 bottom-2 right-0 w-1.5 bg-gradient-to-l from-gray-200/30 to-gray-100/10 rounded-r-sm" />
                
                {/* Number badge */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2">
                  <div className="relative w-20 h-20">
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-lg">
                      <polygon points="50,5 82,18 95,50 82,82 50,95 18,82 5,50 18,18" className="fill-white/95" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-gray-900 font-bold text-3xl">
                      {mainPlatform.number}
                    </div>
                  </div>
                </div>
                
                {/* Title and Description */}
                <div className="absolute inset-x-0 bottom-0 p-8 text-center">
                  <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-lg tracking-wide">
                    {mainPlatform.title}
                  </h3>
                  <div className="w-16 h-0.5 bg-white/60 mx-auto mb-4" />
                  <p className="text-white/85 text-sm leading-relaxed drop-shadow-md px-4">
                    {mainPlatform.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bookshelf - Secondary Platforms as Books */}
          <div className="relative h-[600px] flex flex-col justify-end">
            {/* Bookshelf */}
            <div className="flex gap-0 items-end pb-0 relative">
              {secondaryPlatforms.map((platform, index) => {
                const bookColors = [
                  'from-[#C9984F] to-[#8B6F47]', // Or ancien
                  'from-[#1e3a5f] to-[#0d1b2a]', // Bleu nuit
                  'from-[#B87333] to-[#8B5A2B]', // Cuivre
                  'from-[#CD853F] to-[#8B5E3C]', // Bois doré
                ];
                
                // Slightly varied heights for natural look
                const heights = ['h-[545px]', 'h-[552px]', 'h-[550px]', 'h-[555px]'];
                
                // Natural tilt angles - books lean against each other realistically
                const tiltAngles = ['3.5deg', '1.2deg', '-1.5deg', '2deg'];
                
                // Subtle vertical offsets for depth (index 2 fixed to sit on shelf)
                const translateY = ['-3px', '2px', '0px', '0px'];
                
                // Books slightly pulled forward/back from shelf
                const translateX = ['2px', '-1px', '1px', '-2px'];
                
                // Shadow depths for 3D effect
                const shadowDepths = [
                  '0 8px 25px -5px rgba(0,0,0,0.3), 0 4px 10px -5px rgba(0,0,0,0.2)',
                  '0 4px 15px -3px rgba(0,0,0,0.25)',
                  '0 12px 30px -8px rgba(0,0,0,0.35), 0 6px 12px -4px rgba(0,0,0,0.2)',
                  '0 6px 20px -4px rgba(0,0,0,0.28)'
                ];
                
                // Negative margins to make books touch/overlap slightly
                const margins = index > 0 ? '-ml-0.5' : '';
                
                return (
                  <div
                    key={platform.number}
                    className={`relative ${heights[index]} w-28 cursor-pointer group transition-all duration-300 hover:-translate-y-3 ${margins}`}
                    onClick={() => navigate(platform.path)}
                    onMouseEnter={() => setHoveredPlatform(platform.number)}
                    onMouseLeave={() => setHoveredPlatform(null)}
                    style={{ 
                      transformStyle: 'preserve-3d',
                      perspective: '1000px',
                      transform: `rotate(${tiltAngles[index]}) translateY(${translateY[index]}) translateX(${translateX[index]})`,
                      transformOrigin: 'bottom center',
                      zIndex: hoveredPlatform === platform.number ? 50 : 10 - index,
                      boxShadow: shadowDepths[index]
                    }}
                  >
                    {/* Tooltip Bubble */}
                    <div className={`absolute -top-4 left-1/2 -translate-x-1/2 -translate-y-full z-[100] transition-all duration-300 ${
                      hoveredPlatform === platform.number ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                    }`} style={{ transform: `rotate(-${tiltAngles[index]}) translateX(-50%) translateY(-100%)` }}>
                      <div className="relative bg-white rounded-xl shadow-2xl p-4 w-[220px] border border-gray-100">
                        {/* Arrow */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100" />
                        
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${bookColors[index]} flex items-center justify-center flex-shrink-0 shadow-md`}>
                            <span className="text-white font-bold text-xs">{platform.number}</span>
                          </div>
                          <h4 className="font-bold text-gray-900 text-sm">{platform.title}</h4>
                        </div>
                        
                        <p className="text-gray-600 text-xs leading-relaxed mb-2">
                          {platform.description}
                        </p>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-xs text-primary font-medium">
                            {language === 'ar' ? 'اكتشف المزيد →' : 'Découvrir →'}
                          </span>
                        </div>
                      </div>
                    </div>

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
                        className={`absolute inset-0 w-full h-full object-cover ${index === 1 ? 'opacity-100' : index === 3 ? 'opacity-50 mix-blend-overlay' : 'opacity-10 mix-blend-overlay'}`}
                      />
                      
                      {/* Book binding lines */}
                      <div className="absolute top-0 left-0 w-1 h-full bg-black/20" />
                      <div className="absolute top-0 right-0 w-1 h-full bg-white/10" />
                      
                      {/* Number badge on spine - Octagon shape */}
                      <div className="absolute top-6 left-1/2 -translate-x-1/2">
                        <div className="relative w-14 h-14">
                          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-md">
                            <polygon points="50,5 82,18 95,50 82,82 50,95 18,82 5,50 18,18" className="fill-white/95" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-gray-900 font-bold text-xl">
                            {platform.number}
                          </div>
                        </div>
                      </div>
                      
                      {/* Book title - vertical on spine (kept inside book bounds) */}
                      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center justify-center w-full px-2">
                        <div
                          className={`max-h-[280px] overflow-hidden text-white font-bold text-sm leading-tight tracking-[0.14em] drop-shadow-xl ${
                            language === 'ar' ? '' : 'uppercase'
                          }`}
                          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                          title={platform.title}
                        >
                          {platform.title}
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
