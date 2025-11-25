import { Button } from "@/components/ui/button";
import { Heart, HandHeart, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import islamicPattern from "@/assets/islamic-calligraphy-pattern.jpg";

interface DonationSectionProps {
  language: string;
}

export const DonationSection = ({ language }: DonationSectionProps) => {
  const navigate = useNavigate();

  const handleDonation = () => {
    // Navigate to donation page
    navigate(`/donation`);
  };

  return (
    <div className="relative py-20 my-12 overflow-hidden rounded-lg">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${islamicPattern})`,
        }}
      />
      
      {/* Dark overlay for content readability */}
      <div className="absolute inset-0 bg-[rgb(32,45,94)]/85" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="h-8 w-8 text-orange-500 fill-orange-500 animate-pulse" />
              <HandHeart className="h-10 w-10 text-blue-300" />
              <Heart className="h-8 w-8 text-orange-500 fill-orange-500 animate-pulse" />
            </div>
            
            <p className="text-orange-400 text-sm font-semibold uppercase tracking-wide mb-2">
              {language === 'ar' ? 'دعمكم ثمين' : 'Votre soutien est précieux'}
            </p>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {language === 'ar' ? 'ادعموا المكتبة الوطنية' : 'Nous Soutenir (Mécénat)'}
            </h2>
            
            <div className="w-24 h-1 bg-orange-500 mx-auto mb-6"></div>
            
            <p className="text-lg text-white/90 leading-relaxed max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'ساعدونا في الحفاظ على التراث الثقافي المغربي وإتاحته للأجيال القادمة. كل مساهمة تحدث فرقاً في حماية تاريخنا المشترك.'
                : 'Aidez-nous à préserver et valoriser le patrimoine culturel marocain pour les générations futures. Chaque contribution fait la différence dans la sauvegarde de notre histoire commune.'
              }
            </p>
          </div>

          {/* Benefits Section */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-orange-200/30">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-orange-500/30 to-orange-500/10 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-orange-300" />
              </div>
              <h3 className="font-semibold text-sm text-white mb-1">
                {language === 'ar' ? 'الحفاظ على التراث' : 'Préservation du patrimoine'}
              </h3>
              <p className="text-xs text-white/70">
                {language === 'ar' ? 'المساهمة في ترميم المخطوطات القديمة' : 'Contribuez à la restauration de manuscrits anciens'}
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-blue-200/30">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500/30 to-blue-500/10 rounded-full flex items-center justify-center">
                <HandHeart className="h-6 w-6 text-blue-300" />
              </div>
              <h3 className="font-semibold text-sm text-white mb-1">
                {language === 'ar' ? 'الرقمنة' : 'Numérisation'}
              </h3>
              <p className="text-xs text-white/70">
                {language === 'ar' ? 'دعم مشاريع الرقمنة لإتاحة المحتوى للجميع' : 'Soutenez les projets de numérisation pour tous'}
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-orange-200/30">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-orange-500/30 to-orange-500/10 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-orange-300" />
              </div>
              <h3 className="font-semibold text-sm text-white mb-1">
                {language === 'ar' ? 'البرامج التعليمية' : 'Programmes éducatifs'}
              </h3>
              <p className="text-xs text-white/70">
                {language === 'ar' ? 'تمويل ورش العمل والأنشطة الثقافية' : 'Financez ateliers et activités culturelles'}
              </p>
            </div>
          </div>

          {/* Main CTA */}
          <div className="text-center">
            <Button
              onClick={handleDonation}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-10 py-6 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              <Heart className={`h-6 w-6 fill-white ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
              {language === 'ar' ? 'تبرع الآن' : 'Faire un don maintenant'}
            </Button>
            
            <p className="text-xs text-white/60 mt-4">
              {language === 'ar' 
                ? 'جميع التبرعات معفاة من الضرائب وفقاً للقانون المغربي'
                : 'Tous les dons sont déductibles d\'impôts selon la législation marocaine'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
