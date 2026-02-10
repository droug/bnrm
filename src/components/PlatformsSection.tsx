import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Book3D } from "@/components/Book3D";
import { useState } from "react";
import bibliothequeNumerique from "@/assets/bibliotheque-numerique.jpg";
import kitabBackground from "@/assets/kitab-book.jpg";
import manuscritsBackground from "@/assets/manuscrits-background.jpg";
import culturalActivitiesBackground from "@/assets/cultural-activities-background.jpg";
import cbmBackground from "@/assets/cbm-background.jpg";
import platformsBg from "@/assets/platforms-bg.jpg";

interface PlatformsSectionProps {
  language: string;
}

export const PlatformsSection = ({ language }: PlatformsSectionProps) => {
  const navigate = useNavigate();
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);

  const ml = (fr: string, ar: string, en: string, es: string, amz?: string) => {
    const map: Record<string, string> = { fr, ar, en, es, amz: amz || fr };
    return map[language] || fr;
  };

  const mainPlatform = {
    title: ml('Bibliothèque Numérique', 'المكتبة الرقمية', 'Digital Library', 'Biblioteca Digital'),
    description: ml(
      'Explorez nos riches collections numériques de livres, manuscrits et documents historiques disponibles en consultation en ligne',
      'استكشف مجموعاتنا الرقمية الغنية من الكتب والمخطوطات والوثائق التاريخية المتاحة للاستشارة عبر الإنترنت',
      'Explore our rich digital collections of books, manuscripts and historical documents available for online consultation',
      'Explore nuestras ricas colecciones digitales de libros, manuscritos y documentos históricos disponibles en consulta en línea'
    ),
    tooltip: ml(
      'Plus de 50 000 documents numérisés • Accès gratuit 24h/24 • Recherche avancée',
      'أكثر من 50,000 وثيقة رقمية • وصول مجاني على مدار الساعة • بحث متقدم',
      'Over 50,000 digitized documents • Free 24/7 access • Advanced search',
      'Más de 50.000 documentos digitalizados • Acceso gratuito 24h/24 • Búsqueda avanzada'
    ),
    path: '/digital-library',
    image: bibliothequeNumerique,
    number: '01'
  };

  const secondaryPlatforms = [
    {
      title: ml('Manuscrits', 'مخطوطات', 'Manuscripts', 'Manuscritos'),
      description: ml(
        'Découvrez les trésors des manuscrits arabes et amazighes rares',
        'اكتشف كنوز المخطوطات العربية والأمازيغية النادرة',
        'Discover the treasures of rare Arabic and Amazigh manuscripts',
        'Descubra los tesoros de manuscritos árabes y amazighes raros'
      ),
      path: '/plateforme-manuscrits',
      image: manuscritsBackground,
      number: '02'
    },
    {
      title: 'Kitab',
      description: ml(
        'Le catalogue national unifié des bibliothèques marocaines',
        'الفهرس الوطني الموحد للمكتبات المغربية',
        'The unified national catalog of Moroccan libraries',
        'El catálogo nacional unificado de las bibliotecas marroquíes'
      ),
      path: '/kitab',
      image: kitabBackground,
      number: '03'
    },
    {
      title: ml('Activités Culturelles', 'الأنشطة الثقافية', 'Cultural Activities', 'Actividades Culturales'),
      description: ml(
        'Expositions, conférences, ateliers et événements culturels variés',
        'معارض، محاضرات، ورشات عمل وفعاليات ثقافية متنوعة',
        'Exhibitions, conferences, workshops and various cultural events',
        'Exposiciones, conferencias, talleres y eventos culturales variados'
      ),
      path: '/cultural-activities',
      image: culturalActivitiesBackground,
      number: '04'
    },
    {
      title: 'CBM',
      description: ml(
        'Le Catalogue Bibliographique Marocain complet',
        'الفهرس الببليوغرافي المغربي الشامل',
        'The complete Moroccan Bibliographic Catalog',
        'El Catálogo Bibliográfico Marroquí completo'
      ),
      path: '/cbm',
      image: cbmBackground,
      number: '05'
    }
  ];

  return (
    <div className="relative py-20 overflow-hidden">
      {/* Background image with blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center blur-sm scale-105"
        style={{ 
          backgroundImage: `url(${platformsBg})`,
        }}
      />
      
      {/* Overlay for content readability */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-12">
          <p className="bnrm-caption uppercase tracking-widest text-black bg-[#BFDBFE] inline-block px-4 py-1.5 rounded-md mb-2">
            BNRM
          </p>
          <h2 className="bnrm-section-title text-white mb-4">
            {ml('Nos Plateformes', 'منصاتنا', 'Our Platforms', 'Nuestras Plataformas')}
          </h2>
          <div className="w-24 h-1 bg-primary mb-4"></div>
          <p className="bnrm-section-subtitle text-white/80">
            {ml('Découvrez nos plateformes numériques', 'اكتشف منصاتنا الرقمية', 'Discover our digital platforms', 'Descubra nuestras plataformas digitales')}
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
              <div className="relative bg-white rounded-2xl shadow-2xl p-5 max-w-[320px] border border-gray-200">
                {/* Arrow */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-gray-200" />
                
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white font-bold text-lg">01</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base mb-1">{mainPlatform.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{mainPlatform.tooltip}</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-primary font-medium">
                    {ml('Cliquez pour explorer', 'انقر للاستكشاف', 'Click to explore', 'Haga clic para explorar')}
                  </span>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-primary/70 animate-pulse delay-75" />
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse delay-150" />
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
            <div className="flex gap-1 items-end pb-0 relative">
              {secondaryPlatforms.map((platform, index) => {
                const heights = ['h-[545px]', 'h-[552px]', 'h-[550px]', 'h-[555px]'];
                
                return (
                  <div
                    key={platform.number}
                    className={`relative ${heights[index]} w-[120px] cursor-pointer group transition-all duration-300 hover:-translate-y-3`}
                    onClick={() => navigate(platform.path)}
                    onMouseEnter={() => setHoveredPlatform(platform.number)}
                    onMouseLeave={() => setHoveredPlatform(null)}
                    style={{ 
                      zIndex: hoveredPlatform === platform.number ? 50 : 10 - index,
                      boxShadow: '4px 4px 15px rgba(0,0,0,0.4)',
                    }}
                  >
                    {/* Tooltip Bubble */}
                    <div className={`absolute -top-4 left-1/2 -translate-x-1/2 -translate-y-full z-[100] transition-all duration-300 ${
                      hoveredPlatform === platform.number ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                    }`}>
                      <div className="relative bg-white rounded-xl shadow-2xl p-4 w-[220px] border border-gray-100">
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100" />
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-[#7B1E1E] flex items-center justify-center flex-shrink-0 shadow-md">
                            <span className="text-white font-bold text-xs">{platform.number}</span>
                          </div>
                          <h4 className="font-bold text-gray-900 text-sm">{platform.title}</h4>
                        </div>
                        <p className="text-gray-600 text-xs leading-relaxed mb-2">{platform.description}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-xs text-primary font-medium">
                            {ml('Découvrir →', 'اكتشف المزيد →', 'Discover →', 'Descubrir →')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Book spine - dark red/maroon like reference */}
                    <div className="absolute inset-0 rounded-[4px] overflow-hidden border-2 border-[#5A1010]" style={{ backgroundColor: '#7B1E1E' }}>
                      {/* Subtle leather texture */}
                      <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)`
                      }} />
                      
                      {/* Top decorative panel */}
                      <div className="absolute top-4 left-2 right-2 h-[110px] rounded-sm overflow-hidden border border-[#C9984F]/50">
                        <div className="w-full h-full" style={{
                          background: `
                            radial-gradient(circle at 50% 50%, #C9984F 2px, transparent 2px),
                            radial-gradient(circle at 0% 0%, #C9984F 2px, transparent 2px),
                            radial-gradient(circle at 100% 0%, #C9984F 2px, transparent 2px),
                            radial-gradient(circle at 0% 100%, #C9984F 2px, transparent 2px),
                            radial-gradient(circle at 100% 100%, #C9984F 2px, transparent 2px),
                            linear-gradient(45deg, #1e3a5f 25%, transparent 25%),
                            linear-gradient(-45deg, #1e3a5f 25%, transparent 25%),
                            linear-gradient(135deg, #1e3a5f 25%, transparent 25%),
                            linear-gradient(-135deg, #1e3a5f 25%, transparent 25%)
                          `,
                          backgroundSize: '20px 20px',
                          backgroundColor: '#1a4a6e',
                        }} />
                        <div className="absolute inset-0 border-2 border-[#C9984F]/30 rounded-sm" />
                      </div>
                      
                      {/* Gold decorative flourish */}
                      <div className="absolute top-[122px] left-3 right-3 flex justify-center">
                        <svg width="80" height="24" viewBox="0 0 80 24" className="text-[#C9984F] opacity-70">
                          <path d="M0 12 Q10 0 20 12 Q30 24 40 12 Q50 0 60 12 Q70 24 80 12" fill="none" stroke="currentColor" strokeWidth="1.2"/>
                          <circle cx="40" cy="12" r="3" fill="currentColor" opacity="0.5"/>
                        </svg>
                      </div>

                      {/* Title - centered horizontally on book */}
                      <div className="absolute top-[80px] bottom-[260px] left-0 right-0 flex items-center justify-center px-1">
                        <div
                          className={`text-white font-bold text-[13px] leading-[1.3] tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center ${
                            language === 'ar' ? '' : 'uppercase'
                          }`}
                          style={{ 
                            textShadow: '0 0 10px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.9)',
                          }}
                        >
                          {platform.title}
                        </div>
                      </div>

                      {/* Middle decorative panel */}
                      <div className="absolute top-[48%] -translate-y-1/4 left-2 right-2 h-[110px] rounded-sm overflow-hidden border border-[#C9984F]/50">
                        <div className="w-full h-full" style={{
                          background: `
                            radial-gradient(circle at 50% 50%, #C9984F 2px, transparent 2px),
                            radial-gradient(circle at 0% 0%, #C9984F 2px, transparent 2px),
                            radial-gradient(circle at 100% 0%, #C9984F 2px, transparent 2px),
                            radial-gradient(circle at 0% 100%, #C9984F 2px, transparent 2px),
                            radial-gradient(circle at 100% 100%, #C9984F 2px, transparent 2px),
                            linear-gradient(45deg, #8B4513 25%, transparent 25%),
                            linear-gradient(-45deg, #8B4513 25%, transparent 25%),
                            linear-gradient(135deg, #8B4513 25%, transparent 25%),
                            linear-gradient(-135deg, #8B4513 25%, transparent 25%)
                          `,
                          backgroundSize: '18px 18px',
                          backgroundColor: '#1a4a6e',
                        }} />
                        <div className="absolute inset-0 border-2 border-[#C9984F]/30 rounded-sm" />
                      </div>

                      {/* Bottom decorative panel */}
                      <div className="absolute bottom-4 left-2 right-2 h-[110px] rounded-sm overflow-hidden border border-[#C9984F]/50">
                        <div className="w-full h-full" style={{
                          background: `
                            radial-gradient(circle at 50% 50%, #C9984F 2px, transparent 2px),
                            radial-gradient(circle at 0% 0%, #C9984F 2px, transparent 2px),
                            radial-gradient(circle at 100% 0%, #C9984F 2px, transparent 2px),
                            radial-gradient(circle at 0% 100%, #C9984F 2px, transparent 2px),
                            radial-gradient(circle at 100% 100%, #C9984F 2px, transparent 2px),
                            linear-gradient(45deg, #1e3a5f 25%, transparent 25%),
                            linear-gradient(-45deg, #1e3a5f 25%, transparent 25%),
                            linear-gradient(135deg, #1e3a5f 25%, transparent 25%),
                            linear-gradient(-135deg, #1e3a5f 25%, transparent 25%)
                          `,
                          backgroundSize: '20px 20px',
                          backgroundColor: '#1a4a6e',
                        }} />
                        <div className="absolute inset-0 border-2 border-[#C9984F]/30 rounded-sm" />
                      </div>

                      {/* Spine binding lines */}
                      <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-r from-black/30 to-transparent" />
                      <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-l from-black/20 to-transparent" />
                      
                      {/* Inner gold border */}
                      <div className="absolute inset-1.5 border border-[#C9984F]/25 rounded-[3px] pointer-events-none" />
                    </div>
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
