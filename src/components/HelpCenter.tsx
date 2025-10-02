import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, BookOpen, HelpCircle, Video, Clock, ChevronRight,
  ThumbsUp, Star, FileText, Rocket, User, Book as BookIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface HelpCategory {
  id: string;
  name: string;
  name_ar: string;
  description?: string;
  description_ar?: string;
  icon: string;
  sort_order: number;
}

interface HelpGuide {
  id: string;
  category_id?: string;
  title: string;
  title_ar: string;
  description?: string;
  description_ar?: string;
  difficulty_level?: string;
  estimated_time?: number;
  video_url?: string;
  is_featured: boolean;
  view_count: number;
  helpful_count: number;
}

interface FAQ {
  id: string;
  question: string;
  question_ar: string;
  answer: string;
  answer_ar: string;
  helpful_count: number;
}

const HelpCenter: React.FC = () => {
  const { language, t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [guides, setGuides] = useState<HelpGuide[]>([]);
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<HelpGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterGuides();
  }, [searchQuery, guides]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, guidesRes, faqsRes] = await Promise.all([
        supabase.from('help_categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('help_guides').select('*').eq('is_published', true).order('created_at', { ascending: false }),
        supabase.from('faqs').select('*').eq('is_published', true).order('sort_order')
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (guidesRes.error) throw guidesRes.error;
      if (faqsRes.error) throw faqsRes.error;

      setCategories(categoriesRes.data || []);
      setGuides(guidesRes.data || []);
      setFAQs(faqsRes.data || []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Erreur',
        description: language === 'ar' ? 'تعذر تحميل البيانات' : 'Impossible de charger les données',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterGuides = () => {
    if (!searchQuery.trim()) {
      setFilteredGuides(guides);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = guides.filter(guide => {
      const title = language === 'ar' ? guide.title_ar : guide.title;
      const description = language === 'ar' ? guide.description_ar : guide.description;
      return title.toLowerCase().includes(query) || 
             (description && description.toLowerCase().includes(query));
    });
    setFilteredGuides(filtered);
  };

  const getCategoryIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      rocket: <Rocket className="h-5 w-5" />,
      search: <Search className="h-5 w-5" />,
      user: <User className="h-5 w-5" />,
      book: <BookIcon className="h-5 w-5" />,
      'file-text': <FileText className="h-5 w-5" />,
      shield: <Star className="h-5 w-5" />,
    };
    return icons[iconName] || <BookOpen className="h-5 w-5" />;
  };

  const getDifficultyColor = (level: string) => {
    const colors: Record<string, string> = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyLabel = (level: string) => {
    const labels: Record<string, string> = {
      beginner: language === 'ar' ? 'مبتدئ' : 'Débutant',
      intermediate: language === 'ar' ? 'متوسط' : 'Intermédiaire',
      advanced: language === 'ar' ? 'متقدم' : 'Avancé'
    };
    return labels[level] || level;
  };

  const handleGuideClick = async (guideId: string) => {
    // Increment view count
    const { data: guide } = await supabase
      .from('help_guides')
      .select('view_count')
      .eq('id', guideId)
      .single();
    
    if (guide) {
      await supabase
        .from('help_guides')
        .update({ view_count: guide.view_count + 1 })
        .eq('id', guideId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'جاري التحميل...' : 'Chargement...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <HelpCircle className="h-10 w-10 text-primary" />
          {language === 'ar' ? 'مركز المساعدة' : 'Centre d\'Aide'}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {language === 'ar' 
            ? 'اعثر على إجابات وتعلم كيفية استخدام المكتبة الرقمية بشكل فعال'
            : 'Trouvez des réponses et apprenez à utiliser efficacement la bibliothèque numérique'}
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5`} />
            <Input
              type="text"
              placeholder={language === 'ar' ? 'ابحث عن مساعدة...' : 'Rechercher de l\'aide...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${isRTL ? 'pr-12' : 'pl-12'} h-12 text-lg`}
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-all cursor-pointer group">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  {getCategoryIcon(category.icon)}
                </div>
                <CardTitle className="text-lg">
                  {language === 'ar' ? category.name_ar : category.name}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? category.description_ar : category.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="guides" className="space-y-6">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="guides" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {language === 'ar' ? 'الأدلة' : 'Guides'}
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            {language === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
          </TabsTrigger>
        </TabsList>

        {/* Guides Tab */}
        <TabsContent value="guides" className="space-y-6">
          {/* Featured Guides */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {language === 'ar' ? 'الأدلة المميزة' : 'Guides en vedette'}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredGuides.filter(g => g.is_featured).slice(0, 4).map((guide) => (
                <Card key={guide.id} className="hover:shadow-lg transition-all cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {language === 'ar' ? guide.title_ar : guide.title}
                      </CardTitle>
                      {guide.video_url && <Video className="h-5 w-5 text-primary" />}
                    </div>
                    <CardDescription>
                      {language === 'ar' ? guide.description_ar : guide.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {guide.difficulty_level && (
                        <Badge className={getDifficultyColor(guide.difficulty_level)}>
                          {getDifficultyLabel(guide.difficulty_level)}
                        </Badge>
                      )}
                      {guide.estimated_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{guide.estimated_time} min</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{guide.helpful_count}</span>
                      </div>
                    </div>
                    <Button 
                      variant="link" 
                      className={`mt-4 p-0 ${isRTL ? 'mr-auto' : 'ml-auto'} flex items-center gap-2`}
                      onClick={() => handleGuideClick(guide.id)}
                    >
                      {language === 'ar' ? 'عرض الدليل' : 'Voir le guide'}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* All Guides */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {language === 'ar' ? 'جميع الأدلة' : 'Tous les guides'}
            </h2>
            <div className="space-y-3">
              {filteredGuides.filter(g => !g.is_featured).map((guide) => (
                <Card key={guide.id} className="hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {language === 'ar' ? guide.title_ar : guide.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? guide.description_ar : guide.description}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {language === 'ar' ? 'الأسئلة المتكررة' : 'Questions fréquemment posées'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'إجابات على الأسئلة الأكثر شيوعًا'
                  : 'Réponses aux questions les plus courantes'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={faq.id} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left">
                      {language === 'ar' ? faq.question_ar : faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground mb-4">
                        {language === 'ar' ? faq.answer_ar : faq.answer}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <ThumbsUp className="h-4 w-4" />
                          {language === 'ar' ? 'مفيد' : 'Utile'} ({faq.helpful_count})
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact Support */}
      <Card className="mt-12 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">
            {language === 'ar' ? 'لم تجد ما تبحث عنه؟' : 'Vous n\'avez pas trouvé ce que vous cherchiez ?'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {language === 'ar' 
              ? 'تواصل مع فريق الدعم لدينا للحصول على مساعدة شخصية'
              : 'Contactez notre équipe d\'assistance pour obtenir une aide personnalisée'}
          </p>
          <Button size="lg" className="gap-2">
            <HelpCircle className="h-5 w-5" />
            {language === 'ar' ? 'اتصل بالدعم' : 'Contacter le support'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpCenter;
