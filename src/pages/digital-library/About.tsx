import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface AboutSection {
  id: string;
  title_fr: string;
  title_ar?: string;
  content_fr: string;
  content_ar?: string;
  icon: string;
  order: number;
}

interface AboutSettings {
  hero_title_fr: string;
  hero_title_ar?: string;
  hero_subtitle_fr: string;
  hero_subtitle_ar?: string;
  hero_image_url?: string;
  mission_title_fr: string;
  mission_title_ar?: string;
  mission_content_fr: string;
  mission_content_ar?: string;
  vision_title_fr: string;
  vision_title_ar?: string;
  vision_content_fr: string;
  vision_content_ar?: string;
  values: Array<{ title_fr: string; title_ar?: string; description_fr: string; description_ar?: string; icon: string }>;
  sections: AboutSection[];
  statistics: Array<{ label_fr: string; label_ar?: string; value: string; icon: string }>;
  team_title_fr?: string;
  team_title_ar?: string;
  team_description_fr?: string;
  team_description_ar?: string;
}

const defaultSettings: AboutSettings = {
  hero_title_fr: "À propos de la Bibliothèque Numérique",
  hero_title_ar: "حول المكتبة الرقمية",
  hero_subtitle_fr: "Préserver, numériser et partager le patrimoine documentaire du Maroc",
  hero_subtitle_ar: "الحفاظ على التراث الوثائقي المغربي ورقمنته ومشاركته",
  hero_image_url: "",
  mission_title_fr: "Notre Mission",
  mission_title_ar: "مهمتنا",
  mission_content_fr: "La Bibliothèque Numérique Marocaine Ibn Battuta a pour mission de préserver, numériser et rendre accessible le riche patrimoine documentaire du Royaume du Maroc. Nous œuvrons à la sauvegarde des manuscrits anciens, des ouvrages rares et des documents historiques qui constituent la mémoire collective de notre nation.",
  mission_content_ar: "تتمثل مهمة المكتبة الرقمية المغربية ابن بطوطة في الحفاظ على التراث الوثائقي الغني للمملكة المغربية ورقمنته وإتاحته للجميع.",
  vision_title_fr: "Notre Vision",
  vision_title_ar: "رؤيتنا",
  vision_content_fr: "Devenir la référence incontournable pour l'accès au patrimoine documentaire marocain, en offrant une plateforme moderne, accessible et complète qui connecte les chercheurs, les étudiants et le grand public avec les trésors de notre héritage culturel.",
  vision_content_ar: "أن نصبح المرجع الأساسي للوصول إلى التراث الوثائقي المغربي.",
  values: [
    { title_fr: "Excellence", title_ar: "التميز", description_fr: "Nous visons l'excellence dans la numérisation et la préservation de nos collections", description_ar: "نسعى للتميز في رقمنة مجموعاتنا والحفاظ عليها", icon: "mdi:star-outline" },
    { title_fr: "Accessibilité", title_ar: "إمكانية الوصول", description_fr: "Rendre le savoir accessible à tous, partout dans le monde", description_ar: "جعل المعرفة في متناول الجميع في كل مكان", icon: "mdi:earth" },
    { title_fr: "Innovation", title_ar: "الابتكار", description_fr: "Utiliser les technologies les plus avancées pour valoriser notre patrimoine", description_ar: "استخدام أحدث التقنيات لتثمين تراثنا", icon: "mdi:lightbulb-outline" },
    { title_fr: "Collaboration", title_ar: "التعاون", description_fr: "Travailler en partenariat avec les institutions nationales et internationales", description_ar: "العمل بشراكة مع المؤسسات الوطنية والدولية", icon: "mdi:handshake-outline" },
  ],
  sections: [
    { id: "1", title_fr: "Nos Collections", title_ar: "مجموعاتنا", content_fr: "Notre bibliothèque abrite plus de 50 000 documents numérisés, incluant des manuscrits arabes et amazighs datant du VIIIe siècle, des lithographies marocaines, des périodiques historiques et des archives photographiques uniques.", content_ar: "تضم مكتبتنا أكثر من 50,000 وثيقة رقمية", icon: "mdi:book-open-variant", order: 1 },
    { id: "2", title_fr: "Technologies Utilisées", title_ar: "التقنيات المستخدمة", content_fr: "Nous utilisons des équipements de numérisation haute résolution, des technologies OCR avancées pour la reconnaissance de texte arabe, et des systèmes de stockage sécurisés pour garantir la pérennité de nos collections numériques.", content_ar: "نستخدم معدات رقمنة عالية الدقة", icon: "mdi:cog-outline", order: 2 },
    { id: "3", title_fr: "Partenariats", title_ar: "الشراكات", content_fr: "La BNRM collabore avec de nombreuses institutions prestigieuses : universités marocaines, bibliothèques nationales internationales, centres de recherche et organisations culturelles pour enrichir et promouvoir le patrimoine marocain.", content_ar: "تتعاون المكتبة الوطنية مع العديد من المؤسسات المرموقة", icon: "mdi:account-group-outline", order: 3 },
  ],
  statistics: [
    { label_fr: "Documents numérisés", label_ar: "وثائق رقمية", value: "50,000+", icon: "mdi:file-document-outline" },
    { label_fr: "Manuscrits anciens", label_ar: "مخطوطات قديمة", value: "12,000+", icon: "mdi:scroll-text-outline" },
    { label_fr: "Visiteurs par an", label_ar: "زائر سنويا", value: "500,000+", icon: "mdi:account-multiple-outline" },
    { label_fr: "Années de patrimoine", label_ar: "سنة من التراث", value: "1,200+", icon: "mdi:history" },
  ],
  team_title_fr: "Notre Équipe",
  team_title_ar: "فريقنا",
  team_description_fr: "Une équipe de professionnels passionnés dédiés à la préservation et à la valorisation du patrimoine documentaire marocain.",
  team_description_ar: "فريق من المحترفين المتحمسين المكرسين للحفاظ على التراث الوثائقي المغربي وتثمينه",
};

export default function About() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const { data: settings } = useQuery({
    queryKey: ['bn-about-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_portal_settings')
        .select('setting_value')
        .eq('setting_key', 'bn_about_page')
        .maybeSingle();

      if (error || !data) {
        return defaultSettings;
      }

      return { ...defaultSettings, ...(data.setting_value as object) } as AboutSettings;
    },
  });

  const content = settings || defaultSettings;

  const getText = (frText: string, arText?: string) => {
    return isArabic && arText ? arText : frText;
  };

  return (
    <DigitalLibraryLayout>
      <div className="min-h-screen bg-background" dir={isArabic ? 'rtl' : 'ltr'}>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-bn-blue-primary py-16 lg:py-24">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 right-0 w-72 h-72 bg-gold-bn-primary/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[60px]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6">
                <Icon name="mdi:information-outline" className="h-4 w-4" />
                {isArabic ? 'حول المكتبة' : 'À propos'}
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                {getText(content.hero_title_fr, content.hero_title_ar)}
              </h1>
              
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                {getText(content.hero_subtitle_fr, content.hero_subtitle_ar)}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-12 lg:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {content.statistics.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="text-center border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-bn-blue-primary/10 text-bn-blue-primary mb-3">
                        <Icon name={stat.icon} className="h-6 w-6" />
                      </div>
                      <p className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                        {stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getText(stat.label_fr, stat.label_ar)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 shadow-lg overflow-hidden">
                  <div className="h-1 bg-bn-blue-primary" />
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="p-3 rounded-xl bg-bn-blue-primary text-white">
                        <Icon name="mdi:target" className="h-6 w-6" />
                      </div>
                      <h2 className="text-xl lg:text-2xl font-bold text-foreground">
                        {getText(content.mission_title_fr, content.mission_title_ar)}
                      </h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {getText(content.mission_content_fr, content.mission_content_ar)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 shadow-lg overflow-hidden">
                  <div className="h-1 bg-gold-bn-primary" />
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="p-3 rounded-xl bg-gold-bn-primary text-white">
                        <Icon name="mdi:eye-outline" className="h-6 w-6" />
                      </div>
                      <h2 className="text-xl lg:text-2xl font-bold text-foreground">
                        {getText(content.vision_title_fr, content.vision_title_ar)}
                      </h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {getText(content.vision_content_fr, content.vision_content_ar)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 lg:py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
                {isArabic ? 'قيمنا' : 'Nos Valeurs'}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {isArabic 
                  ? 'المبادئ التي توجه عملنا' 
                  : 'Les principes qui guident notre travail quotidien'}
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {content.values.map((value, index) => {
                const colors = [
                  { bg: 'bg-blue-500', light: 'bg-blue-50' },
                  { bg: 'bg-amber-500', light: 'bg-amber-50' },
                  { bg: 'bg-emerald-500', light: 'bg-emerald-50' },
                  { bg: 'bg-purple-500', light: 'bg-purple-50' },
                ];
                const color = colors[index % colors.length];
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full text-center border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <CardContent className="p-6">
                        <div className={cn(
                          "inline-flex items-center justify-center w-14 h-14 rounded-2xl text-white mb-4",
                          color.bg
                        )}>
                          <Icon name={value.icon} className="h-7 w-7" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {getText(value.title_fr, value.title_ar)}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {getText(value.description_fr, value.description_ar)}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Sections */}
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
                {isArabic ? 'اكتشف المزيد' : 'En savoir plus'}
              </h2>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
              {content.sections
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2.5 rounded-xl bg-gold-bn-primary/10 text-gold-bn-primary group-hover:bg-gold-bn-primary group-hover:text-white transition-colors">
                            <Icon name={section.icon} className="h-5 w-5" />
                          </div>
                          <span className="text-xs font-bold text-muted-foreground">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-3">
                          {getText(section.title_fr, section.title_ar)}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {getText(section.content_fr, section.content_ar)}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        {content.team_title_fr && (
          <section className="py-12 lg:py-20 bg-bn-blue-primary">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center max-w-2xl mx-auto"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6">
                  <Icon name="mdi:account-group" className="h-8 w-8 text-white" />
                </div>
                
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                  {getText(content.team_title_fr || '', content.team_title_ar)}
                </h2>
                <p className="text-white/80 leading-relaxed">
                  {getText(content.team_description_fr || '', content.team_description_ar)}
                </p>
              </motion.div>
            </div>
          </section>
        )}
      </div>
    </DigitalLibraryLayout>
  );
}
