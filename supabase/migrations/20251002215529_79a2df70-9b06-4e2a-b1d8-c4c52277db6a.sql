-- Table pour les catégories de guides
CREATE TABLE IF NOT EXISTS public.help_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_ber TEXT,
  description TEXT,
  description_ar TEXT,
  description_ber TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les guides et tutoriels
CREATE TABLE IF NOT EXISTS public.help_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.help_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  title_ber TEXT,
  description TEXT,
  description_ar TEXT,
  description_ber TEXT,
  content TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  content_ber TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_time INTEGER, -- en minutes
  video_url TEXT,
  thumbnail_url TEXT,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les étapes des tutoriels
CREATE TABLE IF NOT EXISTS public.tutorial_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID REFERENCES public.help_guides(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  title_ber TEXT,
  content TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  content_ber TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les FAQ
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.help_categories(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  question_ar TEXT NOT NULL,
  question_ber TEXT,
  answer TEXT NOT NULL,
  answer_ar TEXT NOT NULL,
  answer_ber TEXT,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour suivre les progrès des utilisateurs
CREATE TABLE IF NOT EXISTS public.user_tutorial_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES public.help_guides(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  last_step INTEGER DEFAULT 0,
  completion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, guide_id)
);

-- Index pour les performances
CREATE INDEX idx_help_guides_category ON public.help_guides(category_id);
CREATE INDEX idx_help_guides_published ON public.help_guides(is_published);
CREATE INDEX idx_tutorial_steps_guide ON public.tutorial_steps(guide_id);
CREATE INDEX idx_faqs_category ON public.faqs(category_id);
CREATE INDEX idx_user_progress ON public.user_tutorial_progress(user_id, guide_id);

-- RLS Policies
ALTER TABLE public.help_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tutorial_progress ENABLE ROW LEVEL SECURITY;

-- Policies pour help_categories
CREATE POLICY "Tout le monde peut voir les catégories actives"
ON public.help_categories FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins peuvent gérer les catégories"
ON public.help_categories FOR ALL
USING (is_admin_or_librarian(auth.uid()));

-- Policies pour help_guides
CREATE POLICY "Tout le monde peut voir les guides publiés"
ON public.help_guides FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins peuvent gérer les guides"
ON public.help_guides FOR ALL
USING (is_admin_or_librarian(auth.uid()));

-- Policies pour tutorial_steps
CREATE POLICY "Tout le monde peut voir les étapes des guides publiés"
ON public.tutorial_steps FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.help_guides
  WHERE help_guides.id = tutorial_steps.guide_id
  AND help_guides.is_published = true
));

CREATE POLICY "Admins peuvent gérer les étapes"
ON public.tutorial_steps FOR ALL
USING (is_admin_or_librarian(auth.uid()));

-- Policies pour faqs
CREATE POLICY "Tout le monde peut voir les FAQs publiées"
ON public.faqs FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins peuvent gérer les FAQs"
ON public.faqs FOR ALL
USING (is_admin_or_librarian(auth.uid()));

-- Policies pour user_tutorial_progress
CREATE POLICY "Utilisateurs peuvent voir leur propre progrès"
ON public.user_tutorial_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent gérer leur propre progrès"
ON public.user_tutorial_progress FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins peuvent voir tous les progrès"
ON public.user_tutorial_progress FOR SELECT
USING (is_admin_or_librarian(auth.uid()));

-- Triggers pour updated_at
CREATE TRIGGER update_help_categories_updated_at
BEFORE UPDATE ON public.help_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_help_guides_updated_at
BEFORE UPDATE ON public.help_guides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at
BEFORE UPDATE ON public.faqs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_tutorial_progress_updated_at
BEFORE UPDATE ON public.user_tutorial_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer des catégories par défaut
INSERT INTO public.help_categories (name, name_ar, icon, sort_order) VALUES
('Premiers pas', 'الخطوات الأولى', 'rocket', 1),
('Recherche et navigation', 'البحث والتصفح', 'search', 2),
('Gestion du compte', 'إدارة الحساب', 'user', 3),
('Manuscrits et collections', 'المخطوطات والمجموعات', 'book', 4),
('Dépôt légal', 'الإيداع القانوني', 'file-text', 5),
('Services BNRM', 'خدمات BNRM', 'shield', 6)
ON CONFLICT DO NOTHING;

-- Insérer quelques guides par défaut
INSERT INTO public.help_guides (category_id, title, title_ar, description, description_ar, content, content_ar, difficulty_level, estimated_time, is_featured)
SELECT 
  c.id,
  'Comment créer un compte',
  'كيفية إنشاء حساب',
  'Guide pas à pas pour créer votre compte sur la plateforme',
  'دليل خطوة بخطوة لإنشاء حسابك على المنصة',
  'Ce guide vous accompagne dans les étapes de création de votre compte utilisateur. Vous apprendrez à remplir le formulaire d''inscription, vérifier votre email et configurer votre profil.',
  'يرافقك هذا الدليل في خطوات إنشاء حساب المستخدم الخاص بك. ستتعلم كيفية ملء نموذج التسجيل والتحقق من بريدك الإلكتروني وتكوين ملفك الشخصي.',
  'beginner',
  10,
  true
FROM public.help_categories c WHERE c.name = 'Gestion du compte' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.help_guides (category_id, title, title_ar, description, description_ar, content, content_ar, difficulty_level, estimated_time, is_featured)
SELECT 
  c.id,
  'Recherche avancée de manuscrits',
  'البحث المتقدم عن المخطوطات',
  'Maîtrisez les techniques de recherche avancée pour trouver rapidement les manuscrits',
  'أتقن تقنيات البحث المتقدم للعثور بسرعة على المخطوطات',
  'Découvrez comment utiliser les filtres de recherche avancés, les opérateurs booléens et les critères multiples pour affiner vos résultats de recherche et trouver exactement ce que vous cherchez.',
  'اكتشف كيفية استخدام مرشحات البحث المتقدمة والعوامل المنطقية والمعايير المتعددة لتحسين نتائج البحث والعثور على ما تبحث عنه بالضبط.',
  'intermediate',
  15,
  true
FROM public.help_categories c WHERE c.name = 'Recherche et navigation' LIMIT 1
ON CONFLICT DO NOTHING;

-- Insérer quelques FAQs par défaut
INSERT INTO public.faqs (category_id, question, question_ar, answer, answer_ar, sort_order)
SELECT 
  c.id,
  'Comment puis-je réinitialiser mon mot de passe ?',
  'كيف يمكنني إعادة تعيين كلمة المرور الخاصة بي؟',
  'Cliquez sur "Mot de passe oublié" sur la page de connexion, entrez votre adresse email et suivez les instructions envoyées par email.',
  'انقر على "نسيت كلمة المرور" في صفحة تسجيل الدخول، وأدخل عنوان بريدك الإلكتروني واتبع التعليمات المرسلة عبر البريد الإلكتروني.',
  1
FROM public.help_categories c WHERE c.name = 'Gestion du compte' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.faqs (category_id, question, question_ar, answer, answer_ar, sort_order)
SELECT 
  c.id,
  'Puis-je télécharger des manuscrits ?',
  'هل يمكنني تحميل المخطوطات؟',
  'Le téléchargement dépend des droits d''accès du manuscrit. Certains manuscrits peuvent être téléchargés librement, tandis que d''autres nécessitent une demande d''accès spéciale.',
  'يعتمد التنزيل على حقوق الوصول إلى المخطوط. يمكن تنزيل بعض المخطوطات بحرية، بينما يتطلب البعض الآخر طلب وصول خاص.',
  1
FROM public.help_categories c WHERE c.name = 'Manuscrits et collections' LIMIT 1
ON CONFLICT DO NOTHING;