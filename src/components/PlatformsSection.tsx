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

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Main Platform - Left Side */}
          <div className="relative bg-white rounded-lg overflow-hidden shadow-xl cursor-pointer group hover:shadow-2xl transition-shadow"
               onClick={() => navigate(mainPlatform.path)}>
            <div className="absolute top-4 left-0 z-10">
              <div className="bg-primary text-primary-foreground font-bold text-2xl px-6 py-3 rounded-r-lg">
                {mainPlatform.number}
              </div>
            </div>
            
            <div className="p-8 pt-20">
              <h3 className="text-3xl font-bold text-foreground mb-4">
                {mainPlatform.title}
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {mainPlatform.description}
              </p>
              
              <div className="relative h-64 rounded-lg overflow-hidden">
                <img 
                  src={mainPlatform.image}
                  alt={mainPlatform.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-2 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </div>

          {/* Secondary Platforms - Right Side */}
          <div className="grid grid-rows-4 gap-4">
            {secondaryPlatforms.map((platform) => (
              <div
                key={platform.number}
                className="relative h-full rounded-lg overflow-hidden shadow-lg cursor-pointer group hover:shadow-xl transition-shadow"
                onClick={() => navigate(platform.path)}
              >
                <img 
                  src={platform.image}
                  alt={platform.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
                
                <div className="relative h-full flex items-center justify-between px-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary text-primary-foreground font-bold text-lg w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                      {platform.number}
                    </div>
                    <h3 className="text-white font-bold text-xl">
                      {platform.title}
                    </h3>
                  </div>
                  
                  <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    →
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
