import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, HandHeart, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    <div className="py-16 bg-gradient-to-b from-slate-50 to-white rounded-lg mb-12">
      <div className="container mx-auto px-4">
        <Card className="relative overflow-hidden border-2 border-orange-200 shadow-2xl bg-gradient-to-br from-orange-50 via-white to-blue-50">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-30 -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-30 -ml-32 -mb-32" />
        
        <CardContent className="relative z-10 p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Heart className="h-8 w-8 text-orange-500 fill-orange-500 animate-pulse" />
                <HandHeart className="h-10 w-10 text-blue-600" />
                <Heart className="h-8 w-8 text-orange-500 fill-orange-500 animate-pulse" />
              </div>
              
              <p className="text-orange-500 text-sm font-semibold uppercase tracking-wide mb-2">
                {language === 'ar' ? 'دعمكم ثمين' : 'Votre soutien est précieux'}
              </p>
              
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-4">
                {language === 'ar' ? 'ادعموا المكتبة الوطنية' : 'Nous Soutenir (Mécénat)'}
              </h2>
              
              <div className="w-24 h-1 bg-orange-500 mx-auto mb-6"></div>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {language === 'ar' 
                  ? 'ساعدونا في الحفاظ على التراث الثقافي المغربي وإتاحته للأجيال القادمة. كل مساهمة تحدث فرقاً في حماية تاريخنا المشترك.'
                  : 'Aidez-nous à préserver et valoriser le patrimoine culturel marocain pour les générations futures. Chaque contribution fait la différence dans la sauvegarde de notre histoire commune.'
                }
              </p>
            </div>

            {/* Benefits Section */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 text-center border border-orange-100">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1">
                  {language === 'ar' ? 'الحفاظ على التراث' : 'Préservation du patrimoine'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'المساهمة في ترميم المخطوطات القديمة' : 'Contribuez à la restauration de manuscrits anciens'}
                </p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 text-center border border-blue-100">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-full flex items-center justify-center">
                  <HandHeart className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1">
                  {language === 'ar' ? 'الرقمنة' : 'Numérisation'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'دعم مشاريع الرقمنة لإتاحة المحتوى للجميع' : 'Soutenez les projets de numérisation pour tous'}
                </p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 text-center border border-orange-100">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1">
                  {language === 'ar' ? 'البرامج التعليمية' : 'Programmes éducatifs'}
                </h3>
                <p className="text-xs text-muted-foreground">
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
              
              <p className="text-xs text-muted-foreground mt-4">
                {language === 'ar' 
                  ? 'جميع التبرعات معفاة من الضرائب وفقاً للقانون المغربي'
                  : 'Tous les dons sont déductibles d\'impôts selon la législation marocaine'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};
