import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'fr' | 'ar' | 'ber' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  fr: {
    // Header
    'header.title': 'Bibliothèque Nationale du Royaume du Maroc',
    'header.home': 'Accueil',
    'header.catalog': 'Catalogue',
    'header.collections': 'Collections Numériques',
    'header.services': 'Services',
    'header.heritage': 'Patrimoine',
    'header.contact': 'Contact',
    'header.search': 'Rechercher dans le catalogue...',
    'header.searchMobile': 'Rechercher...',
    
    // Hero
    'hero.title': 'Gardienne du Patrimoine Écrit Marocain',
    'hero.subtitle': 'Découvrez les trésors documentaires du Royaume à travers nos collections de manuscrits anciens, livres rares et ressources numériques d\'exception.',
    'hero.exploreBtn': 'Explorer le Catalogue',
    'hero.digitaBtn': 'Collections Numériques',
    
    // Services
    'services.title': 'Nos Services',
    'services.subtitle': 'Des services d\'excellence pour chercheurs, étudiants et passionnés du patrimoine marocain',
    'services.consultation.title': 'Consultation sur Place',
    'services.consultation.desc': 'Accédez à nos collections dans nos salles de lecture spécialisées avec l\'accompagnement de nos experts.',
    'services.digitization.title': 'Numérisation',
    'services.digitization.desc': 'Préservation et accessibilité du patrimoine à travers nos programmes de numérisation de haute qualité.',
    'services.research.title': 'Aide à la Recherche',
    'services.research.desc': 'Bénéficiez de l\'expertise de nos bibliothécaires pour vos recherches académiques et scientifiques.',
    'services.legal.title': 'Dépôt Légal',
    'services.legal.desc': 'Service officiel de collecte et conservation de la production éditoriale nationale.',
    'services.training.title': 'Formation',
    'services.training.desc': 'Programmes de formation en sciences de l\'information et préservation du patrimoine.',
    'services.exhibitions.title': 'Expositions',
    'services.exhibitions.desc': 'Découvrez nos expositions temporaires et permanentes valorisant notre patrimoine.',
    
    // Collections
    'collections.title': 'Collections Numériques',
    'collections.subtitle': 'Explorez notre patrimoine numérisé accessible en ligne',
    'collections.manuscripts.title': 'Manuscrits Anciens',
    'collections.manuscripts.count': '15,000+ manuscrits',
    'collections.manuscripts.desc': 'Collection exceptionnelle de manuscrits arabes, amazighs et hébraïques du Moyen Âge à l\'époque moderne.',
    'collections.rare.title': 'Livres Rares',
    'collections.rare.count': '25,000+ ouvrages',
    'collections.rare.desc': 'Éditions princeps, incunables et ouvrages précieux de la littérature maghrébine et orientale.',
    'collections.maps.title': 'Cartes Historiques',
    'collections.maps.count': '3,500+ cartes',
    'collections.maps.desc': 'Cartographie historique du Maroc et de l\'Afrique du Nord du XVe au XXe siècle.',
    'collections.periodicals.title': 'Périodiques',
    'collections.periodicals.count': '12,000+ titres',
    'collections.periodicals.desc': 'Presse et revues marocaines et maghrébines depuis le XIXe siècle.',
    
    // Footer
    'footer.quickLinks': 'Liens Rapides',
    'footer.services': 'Services',
    'footer.collections': 'Collections',
    'footer.about': 'À Propos',
    'footer.contact': 'Contact',
    'footer.hours': 'Horaires',
    'footer.location': 'Avenue Ibn Battuta, Rabat',
    'footer.phone': 'Téléphone',
    'footer.email': 'Email',
    'footer.social': 'Réseaux Sociaux',
    'footer.rights': 'Tous droits réservés.',
    'footer.monday': 'Lundi - Vendredi: 8h30 - 16h30',
    'footer.saturday': 'Samedi: 8h30 - 12h30',
    'footer.sunday': 'Dimanche: Fermé'
  },
  ar: {
    // Header
    'header.title': 'الخزانة الوطنية للمملكة المغربية',
    'header.home': 'الرئيسية',
    'header.catalog': 'الفهرس',
    'header.collections': 'المجموعات الرقمية',
    'header.services': 'الخدمات',
    'header.heritage': 'التراث',
    'header.contact': 'اتصل بنا',
    'header.search': 'البحث في الفهرس...',
    'header.searchMobile': 'بحث...',
    
    // Hero
    'hero.title': 'حارسة التراث المكتوب المغربي',
    'hero.subtitle': 'اكتشف كنوز المملكة الوثائقية من خلال مجموعاتنا من المخطوطات القديمة والكتب النادرة والموارد الرقمية الاستثنائية.',
    'hero.exploreBtn': 'استكشف الفهرس',
    'hero.digitaBtn': 'المجموعات الرقمية',
    
    // Services
    'services.title': 'خدماتنا',
    'services.subtitle': 'خدمات متميزة للباحثين والطلاب وعشاق التراث المغربي',
    'services.consultation.title': 'الاطلاع في المكان',
    'services.consultation.desc': 'الوصول إلى مجموعاتنا في قاعات القراءة المتخصصة مع مرافقة خبرائنا.',
    'services.digitization.title': 'الرقمنة',
    'services.digitization.desc': 'حفظ وإتاحة التراث من خلال برامج الرقمنة عالية الجودة.',
    'services.research.title': 'المساعدة في البحث',
    'services.research.desc': 'استفد من خبرة أمناء المكتبات لبحوثك الأكاديمية والعلمية.',
    'services.legal.title': 'الإيداع القانوني',
    'services.legal.desc': 'الخدمة الرسمية لجمع وحفظ الإنتاج التحريري الوطني.',
    'services.training.title': 'التكوين',
    'services.training.desc': 'برامج التكوين في علوم المعلومات وحفظ التراث.',
    'services.exhibitions.title': 'المعارض',
    'services.exhibitions.desc': 'اكتشف معارضنا المؤقتة والدائمة التي تعرض تراثنا.',
    
    // Collections
    'collections.title': 'المجموعات الرقمية',
    'collections.subtitle': 'استكشف تراثنا المرقمن المتاح عبر الإنترنت',
    'collections.manuscripts.title': 'المخطوطات القديمة',
    'collections.manuscripts.count': '+15,000 مخطوطة',
    'collections.manuscripts.desc': 'مجموعة استثنائية من المخطوطات العربية والأمازيغية والعبرية من العصور الوسطى إلى العصر الحديث.',
    'collections.rare.title': 'الكتب النادرة',
    'collections.rare.count': '+25,000 مؤلف',
    'collections.rare.desc': 'الطبعات الأولى والكتب القيمة من الأدب المغاربي والشرقي.',
    'collections.maps.title': 'الخرائط التاريخية',
    'collections.maps.count': '+3,500 خريطة',
    'collections.maps.desc': 'الخرائط التاريخية للمغرب وشمال أفريقيا من القرن الخامس عشر إلى القرن العشرين.',
    'collections.periodicals.title': 'الدوريات',
    'collections.periodicals.count': '+12,000 عنوان',
    'collections.periodicals.desc': 'الصحافة والمجلات المغربية والمغاربية منذ القرن التاسع عشر.',
    
    // Footer
    'footer.quickLinks': 'روابط سريعة',
    'footer.services': 'الخدمات',
    'footer.collections': 'المجموعات',
    'footer.about': 'حول',
    'footer.contact': 'اتصل بنا',
    'footer.hours': 'المواعيد',
    'footer.location': 'شارع ابن بطوطة، الرباط',
    'footer.phone': 'الهاتف',
    'footer.email': 'البريد الإلكتروني',
    'footer.social': 'وسائل التواصل',
    'footer.rights': 'جميع الحقوق محفوظة.',
    'footer.monday': 'الاثنين - الجمعة: 8:30 - 16:30',
    'footer.saturday': 'السبت: 8:30 - 12:30',
    'footer.sunday': 'الأحد: مغلق'
  },
  ber: {
    // Header (Tifinagh)
    'header.title': 'ⵜⴰⵙⴷⴰⵡⵉⵜ ⵜⴰⵏⴰⵎⵓⵔⵜ ⵏ ⵓⴳⵍⴷⵓⵏ ⵏ ⵍⵎⵖⵔⵉⴱ',
    'header.home': 'ⴰⵙⵏⵓⴱⴳ',
    'header.catalog': 'ⴰⵎⴳⵔⴰⴷ',
    'header.collections': 'ⵜⵉⵙⵎⴰⵍⵉⵏ ⵜⵉⵎⵣⵣⵢⵏⵉⵏ',
    'header.services': 'ⵜⴰⵏⴰⵏⵜⵉⵏ',
    'header.heritage': 'ⴰⵎⵓⵔ',
    'header.contact': 'ⴰⵎⵢⴰⵡⴰⴹ',
    'header.search': 'ⴰⵔⵣⵣⵓ ⴳ ⵓⵎⴳⵔⴰⴷ...',
    'header.searchMobile': 'ⴰⵔⵣⵣⵓ...',
    
    // Hero
    'hero.title': 'ⴰⵎⵙⵙⴰⵔ ⵏ ⵓⵎⵓⵔ ⵉⵜⵜⵓⴳⴰⵏ ⴰⵎⵖⵔⵉⴱⵉ',
    'hero.subtitle': 'ⴰⴼ ⵉⵏⴼⴰⵍⵏ ⵏ ⵜⴳⵍⴷⵉⵜ ⴰⵔ ⵜⵙⵎⴰⵍⵉⵏ ⵏⵏⵖ ⵏ ⵉⵔⴰⵜⵏ ⵉⵣⴰⵢⴽⵓⵏⵏ, ⵉⴷⵍⵉⵙⵏ ⵉⵣⴷⴰⵔⵏ ⴷ ⵜⵅⵣⵉⵏⵜ ⵜⴰⵎⵣⵣⵢⴰⵏⵜ ⵜⴰⵛⵜⵓⴽⵜ.',
    'hero.exploreBtn': 'ⵙⵙⴽⵛⴼ ⴰⵎⴳⵔⴰⴷ',
    'hero.digitaBtn': 'ⵜⵉⵙⵎⴰⵍⵉⵏ ⵜⵉⵎⵣⵣⵢⵏⵉⵏ',
    
    // Services
    'services.title': 'ⵜⴰⵏⴰⵏⵜⵉⵏ ⵏⵏⵖ',
    'services.subtitle': 'ⵜⴰⵏⴰⵏⵜⵉⵏ ⵏ ⵜⵊⵊⵓⴳⵜ ⵉ ⵉⵎⵔⵣⴰ, ⵉⵎⵖⴰⵔⵏ ⴷ ⵉⵎⵢⴰⵏⴰⵡⵏ ⵏ ⵓⵎⵓⵔ ⴰⵎⵖⵔⵉⴱⵉ',
    'services.consultation.title': 'ⴰⵖⵔⵉ ⴳ ⵓⴷⵖⴰⵔ',
    'services.consultation.desc': 'ⴰⴽⵛⵛⵓⵎ ⵖⵔ ⵜⵙⵎⴰⵍⵉⵏ ⵏⵏⵖ ⴳ ⵜⵎⵙⴽⵉⵏⵉⵏ ⵏ ⵜⵖⵔⵉ ⵜⵉⴳⵣⵣⵓⵎⵉⵏ ⴰⴽⴷ ⵓⵎⴰⵔⵓ ⵏ ⵉⵎⵓⵙⵏⴰⵡⵏ ⵏⵏⵖ.',
    'services.digitization.title': 'ⴰⵙⵎⵣⵣⵢⴰⵏ',
    'services.digitization.desc': 'ⴰⵃⵟⵟⵓ ⴷ ⵓⴽⵛⵛⵓⵎ ⵏ ⵓⵎⵓⵔ ⵙ ⵉⵀⵔⵓⵙⵏ ⵏ ⵓⵙⵎⵣⵣⵢⴰⵏ ⵏ ⵜⵉⵍⴰⵡⵜ ⵉⵙⵙⵓⵍⵏ.',
    'services.research.title': 'ⵜⴰⵡⵙⵙⴰ ⴳ ⵓⵔⵣⵣⵓ',
    'services.research.desc': 'ⴰⵔⴰⵎ ⵙⴳ ⵜⴰⵡⵙⵙⴰ ⵏ ⵉⵎⵎⴰⵍⴰⵏ ⵏ ⵜⵙⴷⴰⵡⵉⵜ ⵉ ⵉⵔⵣⵣⵓⵜⵏ ⵏⵏⵓⵏ ⵉⵖⵔⵎⴰⵏⵏ ⴷ ⵉⵎⴰⵙⵙⴰⵏⵏ.',
    'services.legal.title': 'ⴰⵙⵔⵙ ⴰⵏⴰⵎⵓⵙ',
    'services.legal.desc': 'ⵜⴰⵏⴰⵏⵜ ⵜⵓⵏⵚⵉⴱⵜ ⵏ ⵓⵙⵎⵓⵏ ⴷ ⵓⵃⵟⵟⵓ ⵏ ⵓⵙⴼⴰⵔⵓ ⴰⵏⴰⵎⵓⵔ ⴰⵏⴰⵎⵓⵔ.',
    'services.training.title': 'ⴰⵙⵎⵓⵏ',
    'services.training.desc': 'ⵉⵀⵔⵓⵙⵏ ⵏ ⵓⵙⵎⵓⵏ ⴳ ⵜⵎⴰⵙⵙⵉⵏ ⵏ ⵜⵓⵍⵍⵉⵙⵉⵏ ⴷ ⵓⵃⵟⵟⵓ ⵏ ⵓⵎⵓⵔ.',
    'services.exhibitions.title': 'ⵉⵙⵎⴰⵍⵏ',
    'services.exhibitions.desc': 'ⴰⴼ ⵉⵙⵎⴰⵍⵏ ⵏⵏⵖ ⵉⴽⵓⴷⴰⵏⵏ ⴷ ⵉⵎⵉⴽⵔⴰⵜⵏ ⴰⴷ ⵉⵣⵎⵔⵏ ⴰⵎⵓⵔ ⵏⵏⵖ.',
    
    // Collections
    'collections.title': 'ⵜⵉⵙⵎⴰⵍⵉⵏ ⵜⵉⵎⵣⵣⵢⵏⵉⵏ',
    'collections.subtitle': 'ⵙⵙⴽⵛⴼ ⴰⵎⵓⵔ ⵏⵏⵖ ⴰⵎⵣⵣⵢⴰⵏ ⴰⴷ ⵉⵏⵏⴰⵛⴽⴰⵎⵏ ⵙⴳ ⵉⵏⵜⴰⵔⵏⵉⵜ',
    'collections.manuscripts.title': 'ⵉⵔⴰⵜⵏ ⵉⵣⴰⵢⴽⵓⵏⵏ',
    'collections.manuscripts.count': '+15,000 ⴰⵔⴰⵜ',
    'collections.manuscripts.desc': 'ⵜⴰⵙⵎⴰⵍⵜ ⵜⴰⵛⵜⵓⴽⵜ ⵏ ⵉⵔⴰⵜⵏ ⵉⵄⴰⵔⴰⴱⵏ, ⵉⵎⴰⵣⵉⵖⵏ ⴷ ⵉⵄⵉⴱⵔⵉⵢⵏ ⵙⴳ ⵓⵣⵎⵣ ⴰⵏⴰⵎⵎⴰⵙ ⴰⵔ ⵓⵣⵎⵣ ⴰⵜⵔⴰⵔ.',
    'collections.rare.title': 'ⵉⴷⵍⵉⵙⵏ ⵉⵣⴷⴰⵔⵏ',
    'collections.rare.count': '+25,000 ⵓⵎⵥⵍⴰⵢ',
    'collections.rare.desc': 'ⵜⵓⵙⵓⵜⵉⵏ ⵜⵉⵎⵣⵡⵓⵔⴰ ⴷ ⵉⴷⵍⵉⵙⵏ ⵉⵔⴰⵎⵏ ⵙⴳ ⵜⵓⵏⴳⵜ ⵜⴰⵎⵖⵔⵉⴱⵉⵢⵜ ⴷ ⵜⴰⵙⵉⵍⴰⵏⵜ.',
    'collections.maps.title': 'ⵜⵏⵇⵇⵉⵛⵉⵏ ⵜⵉⵎⵣⵔⵓⵢⵉⵏ',
    'collections.maps.count': '+3,500 ⵜⴰⵏⵇⵇⵉⵛⵜ',
    'collections.maps.desc': 'ⵜⴰⵏⵇⵇⵉⵛⵜ ⵜⴰⵎⵣⵔⵓⵢⵜ ⵏ ⵍⵎⵖⵔⵉⴱ ⴷ ⵓⴳⴰⴼⴰⵢ ⵏ ⵜⴰⴼⵔⵉⵇⵜ ⵙⴳ ⵜⴰⵙⵓⵜ ⵜⵉⵙ 15 ⴰⵔ ⵜⵉⵙ 20.',
    'collections.periodicals.title': 'ⵜⵓⵙⵓⵜⵉⵏ ⵜⵓⵏⴰⵏⴰⵔⵉⵏ',
    'collections.periodicals.count': '+12,000 ⵓⵣⵡⵍ',
    'collections.periodicals.desc': 'ⵜⴰⵏⴱⴰⴹⵜ ⴷ ⵜⵎⴳⵔⴰⴷⵉⵏ ⵜⵉⵎⵖⵔⵉⴱⵉⵢⵉⵏ ⴷ ⵜⵉⵎⵖⵔⵉⴱⵉⵢⵉⵏ ⵙⴳ ⵜⴰⵙⵓⵜ ⵜⵉⵙ 19.',
    
    // Footer
    'footer.quickLinks': 'ⵉⵣⴷⴰⵢⵏ ⵉⵖⵣⵣⵉⴼⵏ',
    'footer.services': 'ⵜⴰⵏⴰⵏⵜⵉⵏ',
    'footer.collections': 'ⵜⵉⵙⵎⴰⵍⵉⵏ',
    'footer.about': 'ⵖⴼ',
    'footer.contact': 'ⴰⵎⵢⴰⵡⴰⴹ',
    'footer.hours': 'ⴰⴽⵓⴷ',
    'footer.location': 'ⴰⴱⵔⵉⴷ ⵏ ⵉⴱⵏ ⴱⴰⵟⵟⵓⵟⴰ, ⵔⵔⴱⴰⵟ',
    'footer.phone': 'ⴰⵜⵍⵉⴼⵓⵏ',
    'footer.email': 'ⵉⵎⴰⵢⵍ',
    'footer.social': 'ⵉⵣⴷⴰⵢⵏ ⵉⵏⴰⵎⵓⵏⵏ',
    'footer.rights': 'ⴰⴽⴽ ⵉⵣⵔⴼⴰⵏ ⵃⵟⵟⵓⵏ.',
    'footer.monday': 'ⴰⵔⵉⵎ - ⵙⵉⵎⵙ: 8:30 - 16:30',
    'footer.saturday': 'ⴰⵙⵉⵅⵙ: 8:30 - 12:30',
    'footer.sunday': 'ⴰⵙⴰⵎⴰⵙ: ⵉⵜⵜⵓⴳⴳⴰⵍ'
  },
  en: {
    // Header
    'header.title': 'National Library of the Kingdom of Morocco',
    'header.home': 'Home',
    'header.catalog': 'Catalog',
    'header.collections': 'Digital Collections',
    'header.services': 'Services',
    'header.heritage': 'Heritage',
    'header.contact': 'Contact',
    'header.search': 'Search in catalog...',
    'header.searchMobile': 'Search...',
    
    // Hero
    'hero.title': 'Guardian of Moroccan Written Heritage',
    'hero.subtitle': 'Discover the documentary treasures of the Kingdom through our collections of ancient manuscripts, rare books and exceptional digital resources.',
    'hero.exploreBtn': 'Explore Catalog',
    'hero.digitaBtn': 'Digital Collections',
    
    // Services
    'services.title': 'Our Services',
    'services.subtitle': 'Excellence services for researchers, students and enthusiasts of Moroccan heritage',
    'services.consultation.title': 'On-site Consultation',
    'services.consultation.desc': 'Access our collections in specialized reading rooms with the support of our experts.',
    'services.digitization.title': 'Digitization',
    'services.digitization.desc': 'Heritage preservation and accessibility through our high-quality digitization programs.',
    'services.research.title': 'Research Assistance',
    'services.research.desc': 'Benefit from the expertise of our librarians for your academic and scientific research.',
    'services.legal.title': 'Legal Deposit',
    'services.legal.desc': 'Official service for collecting and preserving national editorial production.',
    'services.training.title': 'Training',
    'services.training.desc': 'Training programs in information sciences and heritage preservation.',
    'services.exhibitions.title': 'Exhibitions',
    'services.exhibitions.desc': 'Discover our temporary and permanent exhibitions showcasing our heritage.',
    
    // Collections
    'collections.title': 'Digital Collections',
    'collections.subtitle': 'Explore our digitized heritage accessible online',
    'collections.manuscripts.title': 'Ancient Manuscripts',
    'collections.manuscripts.count': '15,000+ manuscripts',
    'collections.manuscripts.desc': 'Exceptional collection of Arabic, Berber and Hebrew manuscripts from the Middle Ages to the modern era.',
    'collections.rare.title': 'Rare Books',
    'collections.rare.count': '25,000+ works',
    'collections.rare.desc': 'First editions, incunabula and precious works of Maghrebi and Oriental literature.',
    'collections.maps.title': 'Historical Maps',
    'collections.maps.count': '3,500+ maps',
    'collections.maps.desc': 'Historical cartography of Morocco and North Africa from the 15th to 20th century.',
    'collections.periodicals.title': 'Periodicals',
    'collections.periodicals.count': '12,000+ titles',
    'collections.periodicals.desc': 'Moroccan and Maghrebi press and magazines since the 19th century.',
    
    // Footer
    'footer.quickLinks': 'Quick Links',
    'footer.services': 'Services',
    'footer.collections': 'Collections',
    'footer.about': 'About',
    'footer.contact': 'Contact',
    'footer.hours': 'Hours',
    'footer.location': 'Ibn Battuta Avenue, Rabat',
    'footer.phone': 'Phone',
    'footer.email': 'Email',
    'footer.social': 'Social Media',
    'footer.rights': 'All rights reserved.',
    'footer.monday': 'Monday - Friday: 8:30 AM - 4:30 PM',
    'footer.saturday': 'Saturday: 8:30 AM - 12:30 PM',
    'footer.sunday': 'Sunday: Closed'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};