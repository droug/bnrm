import { useState } from "react";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Icon } from "@/components/ui/icon";
import { Search, Mail, Phone, MapPin, ArrowRight, ExternalLink } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface FAQCategory {
  id: string;
  title_fr: string;
  title_ar?: string;
  icon: string;
  order: number;
  questions: Array<{
    id: string;
    question_fr: string;
    question_ar?: string;
    answer_fr: string;
    answer_ar?: string;
  }>;
}

interface GuideStep {
  id: string;
  title_fr: string;
  title_ar?: string;
  description_fr: string;
  description_ar?: string;
  icon: string;
}

interface Tutorial {
  id: string;
  title_fr: string;
  title_ar?: string;
  description_fr: string;
  description_ar?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
}

interface ReproductionInfo {
  title_fr: string;
  title_ar?: string;
  description_fr: string;
  description_ar?: string;
  steps: Array<{
    id: string;
    title_fr: string;
    title_ar?: string;
    description_fr: string;
    description_ar?: string;
  }>;
  cta_label_fr: string;
  cta_label_ar?: string;
  cta_url: string;
}

interface HelpSettings {
  hero_title_fr: string;
  hero_title_ar?: string;
  hero_subtitle_fr: string;
  hero_subtitle_ar?: string;
  search_placeholder_fr: string;
  search_placeholder_ar?: string;
  categories: FAQCategory[];
  contact: {
    email: string;
    phone: string;
    phone_hours_fr: string;
    phone_hours_ar?: string;
    address_fr: string;
    address_ar?: string;
    cta_label_fr: string;
    cta_label_ar?: string;
  };
  quick_links: Array<{
    label_fr: string;
    label_ar?: string;
    url: string;
    icon: string;
  }>;
  guide: {
    title_fr: string;
    title_ar?: string;
    subtitle_fr: string;
    subtitle_ar?: string;
    steps: GuideStep[];
  };
  tutorials: {
    title_fr: string;
    title_ar?: string;
    subtitle_fr: string;
    subtitle_ar?: string;
    items: Tutorial[];
  };
  reproduction: ReproductionInfo;
}

const defaultSettings: HelpSettings = {
  hero_title_fr: "Aide & FAQ",
  hero_title_ar: "المساعدة والأسئلة الشائعة",
  hero_subtitle_fr: "Trouvez rapidement des réponses à vos questions",
  hero_subtitle_ar: "اعثر على إجابات لأسئلتك بسرعة",
  search_placeholder_fr: "Rechercher dans la FAQ...",
  search_placeholder_ar: "البحث في الأسئلة الشائعة...",
  categories: [
    {
      id: "1",
      title_fr: "Comment consulter",
      title_ar: "كيفية الاستشارة",
      icon: "mdi:book-open-variant",
      order: 1,
      questions: [
        {
          id: "1-1",
          question_fr: "Comment accéder aux documents numériques ?",
          question_ar: "كيف يمكنني الوصول إلى الوثائق الرقمية؟",
          answer_fr: "Pour consulter les documents, utilisez la barre de recherche ou parcourez nos collections par thème. Certains documents nécessitent une inscription gratuite.",
          answer_ar: "للاطلاع على الوثائق، استخدم شريط البحث أو تصفح مجموعاتنا حسب الموضوع."
        },
        {
          id: "1-2",
          question_fr: "Puis-je lire les documents sans connexion Internet ?",
          question_ar: "هل يمكنني قراءة الوثائق بدون اتصال بالإنترنت؟",
          answer_fr: "Certains documents peuvent être téléchargés pour une consultation hors ligne si vous disposez d'un compte et des droits nécessaires.",
          answer_ar: "يمكن تحميل بعض الوثائق للاطلاع عليها دون اتصال إذا كان لديك حساب والحقوق اللازمة."
        }
      ]
    },
    {
      id: "2",
      title_fr: "Droits d'auteur",
      title_ar: "حقوق المؤلف",
      icon: "mdi:copyright",
      order: 2,
      questions: [
        {
          id: "2-1",
          question_fr: "Quels documents puis-je télécharger ?",
          question_ar: "ما هي الوثائق التي يمكنني تحميلها؟",
          answer_fr: "Les documents du domaine public ou sous licence libre sont téléchargeables. Les documents protégés nécessitent une autorisation spécifique.",
          answer_ar: "يمكن تحميل وثائق الملكية العامة أو تلك ذات الترخيص الحر."
        }
      ]
    },
    {
      id: "3",
      title_fr: "Formats",
      title_ar: "الصيغ",
      icon: "mdi:file-document-outline",
      order: 3,
      questions: [
        {
          id: "3-1",
          question_fr: "Quels formats de fichiers sont disponibles ?",
          question_ar: "ما هي صيغ الملفات المتاحة؟",
          answer_fr: "Nos documents sont disponibles en PDF, EPUB pour les livres, et JPEG/TIFF pour les images. Certains manuscrits sont en format IIIF.",
          answer_ar: "وثائقنا متاحة بصيغ PDF و EPUB للكتب و JPEG/TIFF للصور."
        }
      ]
    },
    {
      id: "4",
      title_fr: "Téléchargement",
      title_ar: "التحميل",
      icon: "mdi:download",
      order: 4,
      questions: [
        {
          id: "4-1",
          question_fr: "Y a-t-il une limite de téléchargement ?",
          question_ar: "هل هناك حد للتحميل؟",
          answer_fr: "Les utilisateurs gratuits peuvent télécharger jusqu'à 10 documents par mois. Les abonnés premium n'ont pas de limite.",
          answer_ar: "يمكن للمستخدمين المجانيين تحميل ما يصل إلى 10 وثائق شهريًا."
        }
      ]
    }
  ],
  contact: {
    email: "support@bnrm.ma",
    phone: "+212 537 27 16 33",
    phone_hours_fr: "Du lundi au vendredi, 9h-17h",
    phone_hours_ar: "من الاثنين إلى الجمعة، 9 صباحًا - 5 مساءً",
    address_fr: "Bibliothèque Nationale du Royaume du Maroc\nAvenue Ibn Batouta, Rabat, Maroc",
    address_ar: "المكتبة الوطنية للمملكة المغربية\nشارع ابن بطوطة، الرباط، المغرب",
    cta_label_fr: "Nous contacter",
    cta_label_ar: "اتصل بنا"
  },
  quick_links: [
    { label_fr: "Guide d'utilisation", label_ar: "دليل الاستخدام", url: "#guide", icon: "mdi:book-open-page-variant" },
    { label_fr: "Tutoriels vidéo", label_ar: "دروس فيديو", url: "#tutorials", icon: "mdi:video-outline" },
    { label_fr: "Demande de reproduction", label_ar: "طلب استنساخ", url: "#reproduction", icon: "mdi:content-copy" }
  ],
  guide: {
    title_fr: "Guide d'utilisation",
    title_ar: "دليل الاستخدام",
    subtitle_fr: "Découvrez comment utiliser la Bibliothèque Numérique",
    subtitle_ar: "اكتشف كيفية استخدام المكتبة الرقمية",
    steps: [
      { id: "1", title_fr: "Créer un compte", title_ar: "إنشاء حساب", description_fr: "Inscrivez-vous gratuitement pour accéder à plus de fonctionnalités", description_ar: "سجل مجانًا للوصول إلى المزيد من الميزات", icon: "mdi:account-plus" },
      { id: "2", title_fr: "Rechercher un document", title_ar: "البحث عن وثيقة", description_fr: "Utilisez la barre de recherche ou naviguez par catégorie", description_ar: "استخدم شريط البحث أو تصفح حسب الفئة", icon: "mdi:magnify" },
      { id: "3", title_fr: "Consulter et télécharger", title_ar: "الاطلاع والتحميل", description_fr: "Lisez en ligne ou téléchargez les documents disponibles", description_ar: "اقرأ عبر الإنترنت أو قم بتحميل الوثائق المتاحة", icon: "mdi:download" }
    ]
  },
  tutorials: {
    title_fr: "Tutoriels vidéo",
    title_ar: "دروس فيديو",
    subtitle_fr: "Apprenez à utiliser nos services avec nos tutoriels",
    subtitle_ar: "تعلم استخدام خدماتنا من خلال دروسنا",
    items: [
      { id: "1", title_fr: "Premiers pas sur la plateforme", title_ar: "الخطوات الأولى على المنصة", description_fr: "Découvrez l'interface et les fonctionnalités de base", description_ar: "اكتشف الواجهة والميزات الأساسية", video_url: "https://www.youtube.com/embed/example1", duration: "3:45" },
      { id: "2", title_fr: "Recherche avancée", title_ar: "البحث المتقدم", description_fr: "Maîtrisez les filtres et options de recherche", description_ar: "أتقن المرشحات وخيارات البحث", video_url: "https://www.youtube.com/embed/example2", duration: "5:20" }
    ]
  },
  reproduction: {
    title_fr: "Demande de reproduction",
    title_ar: "طلب استنساخ",
    description_fr: "Vous pouvez demander la reproduction de documents pour vos recherches ou projets. Notre service vous accompagne dans vos démarches.",
    description_ar: "يمكنك طلب استنساخ الوثائق لأبحاثك أو مشاريعك. خدمتنا ترافقك في إجراءاتك.",
    steps: [
      { id: "1", title_fr: "Identifier le document", title_ar: "تحديد الوثيقة", description_fr: "Notez la cote et le titre du document souhaité", description_ar: "سجل رمز وعنوان الوثيقة المطلوبة" },
      { id: "2", title_fr: "Remplir le formulaire", title_ar: "ملء الاستمارة", description_fr: "Complétez le formulaire de demande en ligne", description_ar: "أكمل استمارة الطلب عبر الإنترنت" },
      { id: "3", title_fr: "Valider et payer", title_ar: "التأكيد والدفع", description_fr: "Réglez les frais de reproduction en ligne ou sur place", description_ar: "ادفع رسوم الاستنساخ عبر الإنترنت أو في الموقع" }
    ],
    cta_label_fr: "Faire une demande",
    cta_label_ar: "تقديم طلب",
    cta_url: "/digital-library/services/reproduction"
  }
};

const categoryColors = [
  { bg: "bg-blue-500", light: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  { bg: "bg-amber-500", light: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  { bg: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  { bg: "bg-purple-500", light: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
  { bg: "bg-rose-500", light: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" },
  { bg: "bg-cyan-500", light: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200" },
];

export default function HelpFAQ() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [searchQuery, setSearchQuery] = useState("");

  const { data: settings } = useQuery({
    queryKey: ['bn-help-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_portal_settings')
        .select('setting_value')
        .eq('setting_key', 'bn_help_page')
        .maybeSingle();

      if (error || !data) return defaultSettings;
      return { ...defaultSettings, ...(data.setting_value as object) } as HelpSettings;
    }
  });

  const content = settings || defaultSettings;

  const getText = (fr: string, ar?: string) => isArabic && ar ? ar : fr;

  const filteredCategories = searchQuery
    ? content.categories.map(cat => ({
        ...cat,
        questions: cat.questions.filter(q =>
          getText(q.question_fr, q.question_ar).toLowerCase().includes(searchQuery.toLowerCase()) ||
          getText(q.answer_fr, q.answer_ar).toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(cat => cat.questions.length > 0)
    : content.categories.sort((a, b) => a.order - b.order);

  return (
    <DigitalLibraryLayout>
      <div className="min-h-screen bg-background" dir={isArabic ? 'rtl' : 'ltr'}>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-bn-blue-primary py-12 lg:py-16">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-bn-primary/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-[60px]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm mb-4">
                <Icon name="mdi:help-circle-outline" className="h-4 w-4" />
                <span>{isArabic ? 'مركز المساعدة' : 'Centre d\'aide'}</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {getText(content.hero_title_fr, content.hero_title_ar)}
              </h1>
              <p className="text-lg text-white/80 mb-6">
                {getText(content.hero_subtitle_fr, content.hero_subtitle_ar)}
              </p>

              {/* Search */}
              <div className="relative max-w-lg mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder={getText(content.search_placeholder_fr, content.search_placeholder_ar)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-white border-0 shadow-lg text-foreground"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick Links */}
        {content.quick_links.length > 0 && (
          <section className="py-8 bg-muted/30 border-b">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap justify-center gap-3">
                {content.quick_links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border shadow-sm hover:shadow-md hover:border-bn-blue-primary/30 transition-all group"
                  >
                    <Icon name={link.icon} className="h-4 w-4 text-bn-blue-primary" />
                    <span className="text-sm font-medium">{getText(link.label_fr, link.label_ar)}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Guide d'utilisation */}
        {content.guide?.steps?.length > 0 && (
          <section id="guide" className="py-12 lg:py-16 bg-gradient-to-b from-background to-muted/20">
            <div className="container mx-auto px-4 max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-10"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bn-blue-primary/10 text-bn-blue-primary text-sm mb-4">
                  <Icon name="mdi:book-open-page-variant" className="h-4 w-4" />
                  <span>{isArabic ? 'دليل' : 'Guide'}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  {getText(content.guide.title_fr, content.guide.title_ar)}
                </h2>
                <p className="text-muted-foreground">
                  {getText(content.guide.subtitle_fr, content.guide.subtitle_ar)}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {content.guide.steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all group relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-bn-blue-primary to-gold-bn-primary" />
                      <CardContent className="pt-8 pb-6 px-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-bn-blue-primary to-bn-blue-primary/80 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                          <Icon name={step.icon} className="h-8 w-8" />
                        </div>
                        <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-gold-bn-primary/20 flex items-center justify-center text-gold-bn-primary font-bold text-sm">
                          {index + 1}
                        </div>
                        <h3 className="font-semibold text-lg mb-2">
                          {getText(step.title_fr, step.title_ar)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {getText(step.description_fr, step.description_ar)}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Tutoriels vidéo */}
        {content.tutorials?.items?.length > 0 && (
          <section id="tutorials" className="py-12 lg:py-16 bg-muted/30">
            <div className="container mx-auto px-4 max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-10"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 text-rose-600 text-sm mb-4">
                  <Icon name="mdi:video-outline" className="h-4 w-4" />
                  <span>{isArabic ? 'فيديو' : 'Vidéo'}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  {getText(content.tutorials.title_fr, content.tutorials.title_ar)}
                </h2>
                <p className="text-muted-foreground">
                  {getText(content.tutorials.subtitle_fr, content.tutorials.subtitle_ar)}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                {content.tutorials.items.map((tutorial, index) => (
                  <motion.div
                    key={tutorial.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full overflow-hidden hover:shadow-xl transition-all group">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {tutorial.video_url ? (
                          tutorial.video_url.includes('supabase') || 
                          tutorial.video_url.endsWith('.mp4') || 
                          tutorial.video_url.endsWith('.webm') || 
                          tutorial.video_url.endsWith('.ogg') ? (
                            // Direct video file (uploaded)
                            <video
                              src={tutorial.video_url}
                              controls
                              className="w-full h-full object-cover"
                              poster={tutorial.thumbnail_url}
                            >
                              {isArabic ? 'متصفحك لا يدعم تشغيل الفيديو' : 'Votre navigateur ne supporte pas la lecture vidéo'}
                            </video>
                          ) : (
                            // Embedded video (YouTube, Vimeo, etc.)
                            <iframe
                              src={tutorial.video_url}
                              title={getText(tutorial.title_fr, tutorial.title_ar)}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          )
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-bn-blue-primary/20 to-bn-blue-primary/5">
                            <div className="w-16 h-16 rounded-full bg-white/90 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Icon name="mdi:play" className="h-8 w-8 text-bn-blue-primary ml-1" />
                            </div>
                          </div>
                        )}
                        {tutorial.duration && (
                          <span className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs font-medium">
                            {tutorial.duration}
                          </span>
                        )}
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-lg mb-2">
                          {getText(tutorial.title_fr, tutorial.title_ar)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {getText(tutorial.description_fr, tutorial.description_ar)}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Demande de reproduction */}
        {content.reproduction && (
          <section id="reproduction" className="py-12 lg:py-16">
            <div className="container mx-auto px-4 max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-xl overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
                  <CardContent className="p-8 lg:p-10">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                      <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 text-sm mb-4">
                          <Icon name="mdi:content-copy" className="h-4 w-4" />
                          <span>{isArabic ? 'خدمة' : 'Service'}</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                          {getText(content.reproduction.title_fr, content.reproduction.title_ar)}
                        </h2>
                        <p className="text-muted-foreground mb-6">
                          {getText(content.reproduction.description_fr, content.reproduction.description_ar)}
                        </p>
                        <Link to={content.reproduction.cta_url}>
                          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                            {getText(content.reproduction.cta_label_fr, content.reproduction.cta_label_ar)}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>

                      <div className="space-y-4">
                        {content.reproduction.steps?.map((step, index) => (
                          <div
                            key={step.id}
                            className="flex gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold mb-1">
                                {getText(step.title_fr, step.title_ar)}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {getText(step.description_fr, step.description_ar)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>
        )}

        {/* FAQ Categories */}
        <section className="py-10 lg:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            {filteredCategories.length > 0 ? (
              <div className="space-y-6">
                {filteredCategories.map((category, index) => {
                  const color = categoryColors[index % categoryColors.length];
                  
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={cn("overflow-hidden border", color.border)}>
                        <CardHeader className={cn("pb-3", color.light)}>
                          <CardTitle className="flex items-center gap-3">
                            <div className={cn("p-2.5 rounded-xl text-white", color.bg)}>
                              <Icon name={category.icon} className="h-5 w-5" />
                            </div>
                            <span className={color.text}>
                              {getText(category.title_fr, category.title_ar)}
                            </span>
                            <span className="ml-auto text-xs font-normal text-muted-foreground px-2 py-1 bg-white rounded-full">
                              {category.questions.length} {isArabic ? 'سؤال' : 'questions'}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <Accordion type="single" collapsible className="w-full">
                            {category.questions.map((item, qIndex) => (
                              <AccordionItem 
                                key={item.id} 
                                value={`item-${category.id}-${qIndex}`}
                                className="border-b last:border-0"
                              >
                                <AccordionTrigger className="text-left hover:no-underline py-4 group">
                                  <span className="group-hover:text-bn-blue-primary transition-colors">
                                    {getText(item.question_fr, item.question_ar)}
                                  </span>
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                                  {getText(item.answer_fr, item.answer_ar)}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Icon name="mdi:magnify" className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">
                    {isArabic 
                      ? `لم يتم العثور على نتائج لـ "${searchQuery}"`
                      : `Aucun résultat trouvé pour "${searchQuery}"`
                    }
                  </p>
                  <Button variant="link" onClick={() => setSearchQuery("")}>
                    {isArabic ? 'مسح البحث' : 'Effacer la recherche'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-10 lg:py-16 bg-muted/20">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-bn-blue-primary to-gold-bn-primary" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="mdi:headset" className="h-6 w-6 text-bn-blue-primary" />
                    {isArabic ? 'هل تحتاج إلى مساعدة إضافية؟' : 'Besoin d\'aide supplémentaire ?'}
                  </CardTitle>
                  <CardDescription>
                    {isArabic ? 'فريقنا متاح لمساعدتك' : 'Notre équipe est à votre disposition'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Email */}
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <div className="p-3 rounded-xl bg-bn-blue-primary/10">
                        <Mail className="h-5 w-5 text-bn-blue-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-1">Email</p>
                        <a 
                          href={`mailto:${content.contact.email}`} 
                          className="text-sm text-bn-blue-primary hover:underline"
                        >
                          {content.contact.email}
                        </a>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <div className="p-3 rounded-xl bg-bn-blue-primary/10">
                        <Phone className="h-5 w-5 text-bn-blue-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-1">{isArabic ? 'الهاتف' : 'Téléphone'}</p>
                        <p className="text-sm text-foreground">{content.contact.phone}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {getText(content.contact.phone_hours_fr, content.contact.phone_hours_ar)}
                        </p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <div className="p-3 rounded-xl bg-bn-blue-primary/10">
                        <MapPin className="h-5 w-5 text-bn-blue-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-1">{isArabic ? 'العنوان' : 'Adresse'}</p>
                        <p className="text-xs text-muted-foreground whitespace-pre-line">
                          {getText(content.contact.address_fr, content.contact.address_ar)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t flex justify-center">
                    <Button className="bg-bn-blue-primary hover:bg-bn-blue-primary-dark gap-2">
                      <Mail className="h-4 w-4" />
                      {getText(content.contact.cta_label_fr, content.contact.cta_label_ar)}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>
    </DigitalLibraryLayout>
  );
}
