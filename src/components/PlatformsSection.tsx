import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import bibliothequeNumerique from "@/assets/bibliotheque-numerique.jpg";
import kitabBackground from "@/assets/kitab-book.jpg";
import manuscritsBackground from "@/assets/manuscrits-background.jpg";
import culturalActivitiesBackground from "@/assets/cultural-activities-background.jpg";
import cbmBackground from "@/assets/cbm-background.jpg";
import platformsBg from "@/assets/platforms-bg.jpg";
import ornamentGold from "@/assets/ornament-gold.png";

interface PlatformsSectionProps {
  language: string;
}

interface Platform {
  title: string;
  description: string;
  path: string;
  image: string;
  number: string;
  spineColor: string;
  spineDark: string;
  spineLabel: string;
}

export const PlatformsSection = ({ language }: PlatformsSectionProps) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  const ml = (fr: string, ar: string, en: string, es: string, amz?: string) => {
    const map: Record<string, string> = { fr, ar, en, es, amz: amz || fr };
    return map[language] || fr;
  };

  const platforms: Platform[] = [
    {
      title: ml('Bibliothèque Numérique', 'المكتبة الرقمية', 'Digital Library', 'Biblioteca Digital'),
      description: ml(
        'Explorez nos riches collections numériques de livres, manuscrits et documents historiques disponibles en consultation en ligne. Plus de 50 000 documents numérisés accessibles gratuitement.',
        'استكشف مجموعاتنا الرقمية الغنية من الكتب والمخطوطات والوثائق التاريخية المتاحة للاستشارة عبر الإنترنت.',
        'Explore our rich digital collections of books, manuscripts and historical documents available for online consultation.',
        'Explore nuestras ricas colecciones digitales de libros, manuscritos y documentos históricos.'
      ),
      path: '/digital-library',
      image: bibliothequeNumerique,
      number: '01',
      spineColor: '#7B1E1E',
      spineDark: '#5A1010',
      spineLabel: ml('BIBLIOTHÈQUE NUMÉRIQUE', 'المكتبة الرقمية', 'DIGITAL LIBRARY', 'BIBLIOTECA DIGITAL'),
    },
    {
      title: ml('Plateforme des Manuscrits', 'منصة المخطوطات', 'Manuscripts Platform', 'Plataforma de Manuscritos'),
      description: ml(
        'Découvrez les trésors des manuscrits arabes et amazighes rares conservés à la Bibliothèque Nationale. Une collection unique de patrimoine écrit marocain.',
        'اكتشف كنوز المخطوطات العربية والأمازيغية النادرة المحفوظة في المكتبة الوطنية.',
        'Discover the treasures of rare Arabic and Amazigh manuscripts preserved at the National Library.',
        'Descubra los tesoros de manuscritos árabes y amazighes raros.'
      ),
      path: '/plateforme-manuscrits',
      image: manuscritsBackground,
      number: '02',
      spineColor: '#1B4332',
      spineDark: '#0F2B1F',
      spineLabel: ml('PLATEFORME DES MANUSCRITS', 'منصة المخطوطات', 'MANUSCRIPTS PLATFORM', 'PLATAFORMA MANUSCRITOS'),
    },
    {
      title: ml('Activités Culturelles', 'الأنشطة الثقافية', 'Cultural Activities', 'Actividades Culturales'),
      description: ml(
        'Expositions, conférences, ateliers et événements culturels variés organisés tout au long de l\'année par la BNRM. Un espace vivant de partage culturel.',
        'معارض ومحاضرات وورشات عمل وفعاليات ثقافية متنوعة.',
        'Exhibitions, conferences, workshops and various cultural events organized throughout the year.',
        'Exposiciones, conferencias, talleres y eventos culturales variados.'
      ),
      path: '/cultural-activities',
      image: culturalActivitiesBackground,
      number: '03',
      spineColor: '#8B6914',
      spineDark: '#6B4F0A',
      spineLabel: ml('ACTIVITÉS CULTURELLES', 'الأنشطة الثقافية', 'CULTURAL ACTIVITIES', 'ACTIVIDADES CULTURALES'),
    },
  ];

  const activePlatform = platforms[activeIndex];

  const handleSpineClick = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    <div className="relative py-20 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm scale-105"
        style={{ backgroundImage: `url(${platformsBg})` }}
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="mb-12">
          <p className="bnrm-caption uppercase tracking-widest text-black bg-[#BFDBFE] inline-block px-4 py-1.5 rounded-md mb-2">
            BNRM
          </p>
          <h2 className="bnrm-section-title text-white mb-4">
            {ml('Nos Plateformes', 'منصاتنا', 'Our Platforms', 'Nuestras Plataformas')}
          </h2>
          <div className="w-24 h-1 bg-primary mb-4" />
          <p className="bnrm-section-subtitle text-white/80">
            {ml('Découvrez nos plateformes numériques', 'اكتشف منصاتنا الرقمية', 'Discover our digital platforms', 'Descubra nuestras plataformas digitales')}
          </p>
        </div>

        {/* Interactive Container */}
        <div className="flex flex-col gap-0 items-stretch max-w-6xl mx-auto">
          {/* LEFT: Active Content Card */}
          <div className="relative flex-1 bg-white rounded-t-xl shadow-2xl overflow-hidden min-h-[520px] flex">
            {/* Vertical rotated label on left border */}
            <div className="hidden lg:flex w-12 bg-gradient-to-b from-[#1E3A8A] to-[#1E40AF] items-center justify-center flex-shrink-0 relative">
              <span
                className="text-white text-xs font-semibold tracking-[0.3em] uppercase whitespace-nowrap"
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                }}
              >
                {ml('PLATEFORMES BNRM', 'منصات BNRM', 'BNRM PLATFORMS', 'PLATAFORMAS BNRM')}
              </span>
            </div>

            {/* Content area */}
            <div className="flex-1 relative p-8 lg:p-10 flex flex-col">
              {/* Blue ribbon badge */}
              <div className="absolute top-0 left-0 lg:left-auto lg:top-0 lg:right-auto">
                <div className="relative">
                  <div className="bg-[#1E3A8A] text-white font-bold text-xl px-5 py-3 rounded-br-xl shadow-lg">
                    {activePlatform.number}
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="flex-1 flex flex-col pt-12"
                >
                  {/* Title */}
                  <h3
                    className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4"
                    style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                  >
                    {activePlatform.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed text-base mb-6 max-w-lg">
                    {activePlatform.description}
                  </p>

                  {/* CTA */}
                  <button
                    onClick={() => navigate(activePlatform.path)}
                    className="self-start mb-6 px-6 py-2.5 bg-[#1E3A8A] text-white rounded-lg font-medium hover:bg-[#1E40AF] transition-colors shadow-md"
                  >
                    {ml('Explorer la plateforme', 'استكشاف المنصة', 'Explore platform', 'Explorar plataforma')} →
                  </button>

                  {/* Image */}
                  <div className="flex-1 min-h-[200px] rounded-xl overflow-hidden shadow-lg">
                    <motion.img
                      key={activePlatform.image}
                      src={activePlatform.image}
                      alt={activePlatform.title}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT: Horizontal Book Spine Navigation */}
          <div className="flex flex-row w-full lg:w-auto overflow-x-auto lg:overflow-visible">
            {platforms.map((platform, index) => {
              const isActive = activeIndex === index;
              return (
                <button
                  key={index}
                  onClick={() => handleSpineClick(index)}
                  className={`relative group transition-all duration-300 flex-1
                    ${isActive ? 'h-[120px]' : 'h-[100px]'}
                  `}
                  style={{
                    minWidth: '120px',
                  }}
                >
                  {/* Spine body */}
                  <div
                    className="absolute inset-0 transition-all duration-300"
                    style={{
                      backgroundColor: platform.spineColor,
                      boxShadow: isActive
                        ? 'inset 0 0 20px rgba(0,0,0,0.3), 4px 0 15px rgba(0,0,0,0.4)'
                        : 'inset 0 0 10px rgba(0,0,0,0.2), 2px 0 8px rgba(0,0,0,0.3)',
                      borderRight: `3px solid ${platform.spineDark}`,
                      borderLeft: `1px solid rgba(255,255,255,0.1)`,
                    }}
                  >
                    {/* Leather texture */}
                    <div className="absolute inset-0 opacity-[0.07]" style={{
                      backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)`
                    }} />

                    {/* Left ornament */}
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-[40px] h-[40px] opacity-40">
                      <img src={ornamentGold} alt="" className="w-full h-full object-contain mix-blend-screen" />
                    </div>

                    {/* Gold border frame */}
                    <div className="absolute inset-2 border border-[#C9984F]/30 rounded-sm pointer-events-none" />

                    {/* Gold decorative lines */}
                    <div className="absolute left-[50px] top-3 bottom-3 w-[1px] bg-[#C9984F]/40" />
                    <div className="absolute right-[50px] top-3 bottom-3 w-[1px] bg-[#C9984F]/40" />

                    {/* Title - horizontal */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="text-white font-bold text-[11px] sm:text-[13px] tracking-[0.15em] text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-12"
                        style={{
                          fontFamily: "'Georgia', 'Times New Roman', serif",
                          textShadow: '0 0 10px rgba(0,0,0,0.9)',
                        }}
                      >
                        {platform.spineLabel}
                      </span>
                    </div>

                    {/* Right ornament */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-[40px] h-[40px] opacity-40 rotate-180">
                      <img src={ornamentGold} alt="" className="w-full h-full object-contain mix-blend-screen" />
                    </div>

                    {/* Active indicator glow */}
                    {isActive && (
                      <div className="absolute inset-0 border-2 border-[#C9984F]/60 rounded-sm pointer-events-none">
                        <div className="absolute inset-0 bg-white/5" />
                      </div>
                    )}

                    {/* Spine edge highlight */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-white/20 via-white/5 to-white/20" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
