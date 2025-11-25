import { useNavigate } from "react-router-dom";
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
          <span className="inline-block px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded mb-4">
            {language === 'ar' ? 'خدماتنا' : 'SERVICES'}
          </span>
          <h2 className="text-5xl font-bold text-white mb-4">
            {language === 'ar' ? 'منصاتنا الرئيسية' : 'Nos Services Principaux'}
          </h2>
        </div>

        <div className="grid lg:grid-cols-[1fr,auto] gap-6 items-start">
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

          {/* Secondary Platforms - Right Side Grid */}
          <div className="grid grid-rows-2 grid-cols-2 gap-4 w-[600px]">
            {secondaryPlatforms.map((platform, index) => (
              <div
                key={platform.number}
                className={`relative rounded-lg overflow-hidden shadow-lg cursor-pointer group hover:shadow-xl transition-all ${
                  index === 3 ? 'col-span-2' : ''
                }`}
                style={{ height: index === 3 ? '180px' : '200px' }}
                onClick={() => navigate(platform.path)}
              >
                <img 
                  src={platform.image}
                  alt={platform.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a2850] to-[#0d1424]" />
                
                {/* Number badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-primary text-primary-foreground font-bold text-lg w-12 h-12 rounded-full flex items-center justify-center">
                    {platform.number}
                  </div>
                </div>

                {/* Vertical text */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <div className="transform -rotate-90 origin-center whitespace-nowrap">
                    <span className="text-white/80 font-bold text-sm tracking-wider uppercase">
                      {platform.title}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
