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

const statGradients = [
  "from-blue-500 to-indigo-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-purple-500 to-violet-600",
];

const valueGradients = [
  "from-amber-500 via-orange-500 to-red-500",
  "from-cyan-500 via-blue-500 to-indigo-500",
  "from-emerald-500 via-green-500 to-teal-500",
  "from-purple-500 via-pink-500 to-rose-500",
];

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
        {/* Hero Section - Premium Design */}
        <section className="relative overflow-hidden bg-gradient-to-br from-bn-blue via-bn-blue/95 to-bn-blue/90 py-20 lg:py-32">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-gold-bn-primary/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px]" />
            <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
            
            {/* Geometric Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-20 left-20 w-32 h-32 border border-white rotate-45" />
              <div className="absolute bottom-20 right-20 w-24 h-24 border border-white rotate-12" />
              <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-white -rotate-12" />
            </div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 mb-8"
              >
                <Icon name="mdi:information-outline" className="h-5 w-5" />
                <span className="text-sm font-medium tracking-wide">{isArabic ? 'حول المكتبة' : 'À propos de nous'}</span>
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {getText(content.hero_title_fr, content.hero_title_ar)}
              </h1>
              
              <p className="text-lg lg:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                {getText(content.hero_subtitle_fr, content.hero_subtitle_ar)}
              </p>

              {/* Decorative Line */}
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-10 w-24 h-1 bg-gradient-to-r from-gold-bn-primary to-gold-bn-primary/50 mx-auto rounded-full"
              />
            </motion.div>
          </div>

          {/* Bottom Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
              <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="hsl(var(--background))"/>
            </svg>
          </div>
        </section>

        {/* Statistics Section - Premium Cards */}
        <section className="py-16 lg:py-20 -mt-1">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {content.statistics.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br", statGradients[index % statGradients.length])} />
                    <CardContent className="relative p-6 text-center">
                      <div className={cn(
                        "inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 transition-all duration-300",
                        "bg-gradient-to-br shadow-lg group-hover:scale-110",
                        statGradients[index % statGradients.length]
                      )}>
                        <Icon name={stat.icon} className="h-7 w-7 text-white" />
                      </div>
                      <p className="text-3xl lg:text-4xl font-bold text-foreground group-hover:text-white transition-colors mb-1">
                        {stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground group-hover:text-white/80 transition-colors">
                        {getText(stat.label_fr, stat.label_ar)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision - Modern Layout */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="group"
              >
                <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-bn-blue via-bn-blue/80 to-bn-blue/60" />
                  <CardContent className="p-8 lg:p-10">
                    <div className="flex items-start gap-5 mb-6">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-bn-blue to-bn-blue/80 shadow-lg shadow-bn-blue/25 group-hover:scale-105 transition-transform duration-300">
                        <Icon name="mdi:target" className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-bn-blue/60">01</span>
                        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">
                          {getText(content.mission_title_fr, content.mission_title_ar)}
                        </h2>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {getText(content.mission_content_fr, content.mission_content_ar)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="group"
              >
                <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-bn-primary via-gold-bn-primary/80 to-gold-bn-primary/60" />
                  <CardContent className="p-8 lg:p-10">
                    <div className="flex items-start gap-5 mb-6">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-gold-bn-primary to-amber-600 shadow-lg shadow-gold-bn-primary/25 group-hover:scale-105 transition-transform duration-300">
                        <Icon name="mdi:eye-outline" className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gold-bn-primary/60">02</span>
                        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">
                          {getText(content.vision_title_fr, content.vision_title_ar)}
                        </h2>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {getText(content.vision_content_fr, content.vision_content_ar)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section - Premium Design */}
        <section className="py-16 lg:py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-bn-blue/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold-bn-primary/10 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-bn-blue/10 text-bn-blue text-sm font-medium mb-4">
                {isArabic ? 'ما يميزنا' : 'Ce qui nous définit'}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {isArabic ? 'قيمنا الأساسية' : 'Nos Valeurs Fondamentales'}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                {isArabic 
                  ? 'المبادئ التي توجه عملنا اليومي' 
                  : 'Les principes qui guident notre travail et façonnent notre vision'}
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {content.values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group"
                >
                  <Card className="h-full text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-card hover:-translate-y-2">
                    <CardContent className="p-8 relative">
                      {/* Gradient Overlay on Hover */}
                      <div className={cn(
                        "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br",
                        valueGradients[index % valueGradients.length]
                      )} />
                      
                      <div className={cn(
                        "inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                        "bg-gradient-to-br shadow-xl",
                        valueGradients[index % valueGradients.length]
                      )}>
                        <Icon name={value.icon} className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3">
                        {getText(value.title_fr, value.title_ar)}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {getText(value.description_fr, value.description_ar)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Sections - Timeline Style */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {isArabic ? 'اكتشف المزيد' : 'En savoir plus'}
              </h2>
            </motion.div>

            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-bn-blue/30 via-gold-bn-primary/30 to-transparent hidden lg:block" />

              <div className="space-y-8 lg:space-y-0">
                {content.sections
                  .sort((a, b) => a.order - b.order)
                  .map((section, index) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15, duration: 0.6 }}
                      className={cn(
                        "lg:grid lg:grid-cols-2 lg:gap-12 items-center",
                        index % 2 === 1 && "lg:direction-rtl"
                      )}
                    >
                      <div className={cn(
                        "lg:py-12",
                        index % 2 === 0 ? "lg:pr-12 lg:text-right" : "lg:pl-12 lg:text-left lg:order-2"
                      )}>
                        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group">
                          <CardContent className="p-8 relative">
                            <div className={cn(
                              "absolute top-0 w-full h-1",
                              index % 2 === 0 ? "left-0 bg-gradient-to-r" : "right-0 bg-gradient-to-l",
                              "from-gold-bn-primary via-gold-bn-primary/80 to-transparent"
                            )} />
                            
                            <div className={cn(
                              "flex items-center gap-4 mb-6",
                              index % 2 === 0 ? "lg:flex-row-reverse" : ""
                            )}>
                              <div className="p-4 rounded-2xl bg-gradient-to-br from-gold-bn-primary to-amber-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <Icon name={section.icon} className="h-8 w-8 text-white" />
                              </div>
                              <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-gold-bn-primary/60">
                                  {String(index + 1).padStart(2, '0')}
                                </span>
                                <h3 className="text-xl lg:text-2xl font-bold text-foreground">
                                  {getText(section.title_fr, section.title_ar)}
                                </h3>
                              </div>
                            </div>
                            
                            <p className="text-muted-foreground leading-relaxed text-lg">
                              {getText(section.content_fr, section.content_ar)}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Timeline Dot */}
                      <div className="hidden lg:flex justify-center items-center relative">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-bn-blue to-gold-bn-primary shadow-lg ring-4 ring-background" />
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section - Premium CTA */}
        {content.team_title_fr && (
          <section className="py-20 lg:py-28 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-bn-blue via-bn-blue/95 to-bn-blue/90" />
            <div className="absolute inset-0">
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-bn-primary/20 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-white/10 rounded-full blur-[80px]" />
            </div>
            
            <div className="container mx-auto px-4 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center max-w-3xl mx-auto"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-8">
                  <Icon name="mdi:account-group" className="h-10 w-10 text-white" />
                </div>
                
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                  {getText(content.team_title_fr || '', content.team_title_ar)}
                </h2>
                <p className="text-white/80 text-lg lg:text-xl leading-relaxed">
                  {getText(content.team_description_fr || '', content.team_description_ar)}
                </p>

                <div className="mt-10 w-24 h-1 bg-gradient-to-r from-gold-bn-primary to-gold-bn-primary/50 mx-auto rounded-full" />
              </motion.div>
            </div>
          </section>
        )}
      </div>
    </DigitalLibraryLayout>
  );
}
