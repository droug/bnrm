import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

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
  hero_title_fr: "À propos de la Bibliothèque Numérique Marocaine",
  hero_title_ar: "حول المكتبة الرقمية المغربية",
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
    { title_fr: "Accessibilité", title_ar: "إمكانية الوصول", description_fr: "Rendre le savoir accessible à tous, partout dans le monde", description_ar: "جعل المعرفة في متناول الجميع في كل مكان", icon: "mdi:access-point" },
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
      <div className="min-h-screen" dir={isArabic ? 'rtl' : 'ltr'}>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-bn-blue/10 via-gold-bn-primary/5 to-background py-16 lg:py-24">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold-bn-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-bn-blue/10 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bn-blue/10 text-bn-blue mb-6">
                <Icon name="mdi:information-outline" className="h-5 w-5" />
                <span className="text-sm font-medium">{isArabic ? 'حول المكتبة' : 'À propos'}</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                {getText(content.hero_title_fr, content.hero_title_ar)}
              </h1>
              
              <p className="text-lg lg:text-xl text-muted-foreground">
                {getText(content.hero_subtitle_fr, content.hero_subtitle_ar)}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-12 bg-card border-y">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {content.statistics.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-bn-primary/20 to-gold-bn-primary/5 mb-4">
                    <Icon name={stat.icon} className="h-7 w-7 text-gold-bn-primary" />
                  </div>
                  <p className="text-3xl lg:text-4xl font-bold text-bn-blue mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{getText(stat.label_fr, stat.label_ar)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="h-full border-none shadow-lg bg-gradient-to-br from-bn-blue/5 to-background">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 rounded-xl bg-bn-blue/10">
                        <Icon name="mdi:target" className="h-8 w-8 text-bn-blue" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">
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
                transition={{ duration: 0.5 }}
              >
                <Card className="h-full border-none shadow-lg bg-gradient-to-br from-gold-bn-primary/5 to-background">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 rounded-xl bg-gold-bn-primary/10">
                        <Icon name="mdi:eye-outline" className="h-8 w-8 text-gold-bn-primary" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">
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
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                {isArabic ? 'قيمنا' : 'Nos Valeurs'}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {isArabic 
                  ? 'المبادئ التي توجه عملنا اليومي' 
                  : 'Les principes qui guident notre travail au quotidien'}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {content.values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full text-center hover:shadow-lg transition-shadow border-none bg-card">
                    <CardContent className="p-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-bn-blue/10 to-gold-bn-primary/10 mb-4">
                        <Icon name={value.icon} className="h-8 w-8 text-bn-blue" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {getText(value.title_fr, value.title_ar)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {getText(value.description_fr, value.description_ar)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Sections */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="space-y-12">
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
                    <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-6">
                          <div className="hidden sm:flex p-4 rounded-2xl bg-gradient-to-br from-gold-bn-primary/20 to-gold-bn-primary/5 shrink-0">
                            <Icon name={section.icon} className="h-10 w-10 text-gold-bn-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                              <Icon name={section.icon} className="h-6 w-6 text-gold-bn-primary sm:hidden" />
                              {getText(section.title_fr, section.title_ar)}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                              {getText(section.content_fr, section.content_ar)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        {content.team_title_fr && (
          <section className="py-16 bg-gradient-to-br from-bn-blue/5 to-gold-bn-primary/5">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                {getText(content.team_title_fr || '', content.team_title_ar)}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {getText(content.team_description_fr || '', content.team_description_ar)}
              </p>
            </div>
          </section>
        )}
      </div>
    </DigitalLibraryLayout>
  );
}
