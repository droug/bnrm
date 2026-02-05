/**
 * Définitions centralisées des listes auto-complètes du système
 * Ces définitions serviront à synchroniser automatiquement la base de données
 */

export interface AutocompleteListDefinition {
  list_code: string;
  list_name: string;
  description?: string;
  portal?: string;
  platform?: string;
  service?: string;
  sub_service?: string;
  module?: string;
  form_name?: string;
  max_levels: number;
  values: AutocompleteValueDefinition[];
}

export interface AutocompleteValueDefinition {
  value_code: string;
  value_label: string;
  value_label_ar?: string;
  parent_value_code?: string;
  level: number;
  sort_order: number;
  metadata?: Record<string, any>;
}

/**
 * Liste des pays du monde
 */
export const COUNTRIES_LIST: AutocompleteListDefinition = {
  list_code: 'world_countries',
  list_name: 'Pays du monde',
  description: 'Liste complète des pays avec codes ISO et indicatifs téléphoniques',
  portal: 'BNRM',
  platform: 'BNRM',
  service: 'Données de référence',
  sub_service: 'Géographie',
  form_name: 'Général',
  max_levels: 1,
  values: [
    { value_code: "MA", value_label: "Maroc", value_label_ar: "المغرب", level: 1, sort_order: 1, metadata: { dialCode: "+212", flag: "🇲🇦" } },
    { value_code: "DZ", value_label: "Algérie", value_label_ar: "الجزائر", level: 1, sort_order: 2, metadata: { dialCode: "+213", flag: "🇩🇿" } },
    { value_code: "TN", value_label: "Tunisie", value_label_ar: "تونس", level: 1, sort_order: 3, metadata: { dialCode: "+216", flag: "🇹🇳" } },
    { value_code: "EG", value_label: "Égypte", value_label_ar: "مصر", level: 1, sort_order: 4, metadata: { dialCode: "+20", flag: "🇪🇬" } },
    { value_code: "LY", value_label: "Libye", value_label_ar: "ليبيا", level: 1, sort_order: 5, metadata: { dialCode: "+218", flag: "🇱🇾" } },
    { value_code: "MR", value_label: "Mauritanie", value_label_ar: "موريتانيا", level: 1, sort_order: 6, metadata: { dialCode: "+222", flag: "🇲🇷" } },
    { value_code: "FR", value_label: "France", value_label_ar: "فرنسا", level: 1, sort_order: 7, metadata: { dialCode: "+33", flag: "🇫🇷" } },
    { value_code: "ES", value_label: "Espagne", value_label_ar: "إسبانيا", level: 1, sort_order: 8, metadata: { dialCode: "+34", flag: "🇪🇸" } },
    { value_code: "PT", value_label: "Portugal", value_label_ar: "البرتغال", level: 1, sort_order: 9, metadata: { dialCode: "+351", flag: "🇵🇹" } },
    { value_code: "IT", value_label: "Italie", value_label_ar: "إيطاليا", level: 1, sort_order: 10, metadata: { dialCode: "+39", flag: "🇮🇹" } },
    { value_code: "DE", value_label: "Allemagne", value_label_ar: "ألمانيا", level: 1, sort_order: 11, metadata: { dialCode: "+49", flag: "🇩🇪" } },
    { value_code: "GB", value_label: "Royaume-Uni", value_label_ar: "المملكة المتحدة", level: 1, sort_order: 12, metadata: { dialCode: "+44", flag: "🇬🇧" } },
    { value_code: "BE", value_label: "Belgique", value_label_ar: "بلجيكا", level: 1, sort_order: 13, metadata: { dialCode: "+32", flag: "🇧🇪" } },
    { value_code: "NL", value_label: "Pays-Bas", value_label_ar: "هولندا", level: 1, sort_order: 14, metadata: { dialCode: "+31", flag: "🇳🇱" } },
    { value_code: "CH", value_label: "Suisse", value_label_ar: "سويسرا", level: 1, sort_order: 15, metadata: { dialCode: "+41", flag: "🇨🇭" } },
    { value_code: "US", value_label: "États-Unis", value_label_ar: "الولايات المتحدة", level: 1, sort_order: 16, metadata: { dialCode: "+1", flag: "🇺🇸" } },
    { value_code: "CA", value_label: "Canada", value_label_ar: "كندا", level: 1, sort_order: 17, metadata: { dialCode: "+1", flag: "🇨🇦" } },
    { value_code: "SA", value_label: "Arabie Saoudite", value_label_ar: "السعودية", level: 1, sort_order: 18, metadata: { dialCode: "+966", flag: "🇸🇦" } },
    { value_code: "AE", value_label: "Émirats Arabes Unis", value_label_ar: "الإمارات", level: 1, sort_order: 19, metadata: { dialCode: "+971", flag: "🇦🇪" } },
    { value_code: "QA", value_label: "Qatar", value_label_ar: "قطر", level: 1, sort_order: 20, metadata: { dialCode: "+974", flag: "🇶🇦" } },
    { value_code: "KW", value_label: "Koweït", value_label_ar: "الكويت", level: 1, sort_order: 21, metadata: { dialCode: "+965", flag: "🇰🇼" } },
    { value_code: "BH", value_label: "Bahreïn", value_label_ar: "البحرين", level: 1, sort_order: 22, metadata: { dialCode: "+973", flag: "🇧🇭" } },
    { value_code: "OM", value_label: "Oman", value_label_ar: "عمان", level: 1, sort_order: 23, metadata: { dialCode: "+968", flag: "🇴🇲" } },
    { value_code: "JO", value_label: "Jordanie", value_label_ar: "الأردن", level: 1, sort_order: 24, metadata: { dialCode: "+962", flag: "🇯🇴" } },
    { value_code: "LB", value_label: "Liban", value_label_ar: "لبنان", level: 1, sort_order: 25, metadata: { dialCode: "+961", flag: "🇱🇧" } },
    { value_code: "SY", value_label: "Syrie", value_label_ar: "سوريا", level: 1, sort_order: 26, metadata: { dialCode: "+963", flag: "🇸🇾" } },
    { value_code: "IQ", value_label: "Irak", value_label_ar: "العراق", level: 1, sort_order: 27, metadata: { dialCode: "+964", flag: "🇮🇶" } },
    { value_code: "YE", value_label: "Yémen", value_label_ar: "اليمن", level: 1, sort_order: 28, metadata: { dialCode: "+967", flag: "🇾🇪" } },
    { value_code: "PS", value_label: "Palestine", value_label_ar: "فلسطين", level: 1, sort_order: 29, metadata: { dialCode: "+970", flag: "🇵🇸" } },
    { value_code: "TR", value_label: "Turquie", value_label_ar: "تركيا", level: 1, sort_order: 30, metadata: { dialCode: "+90", flag: "🇹🇷" } },
    { value_code: "CN", value_label: "Chine", value_label_ar: "الصين", level: 1, sort_order: 31, metadata: { dialCode: "+86", flag: "🇨🇳" } },
    { value_code: "JP", value_label: "Japon", value_label_ar: "اليابان", level: 1, sort_order: 32, metadata: { dialCode: "+81", flag: "🇯🇵" } },
    { value_code: "KR", value_label: "Corée du Sud", value_label_ar: "كوريا الجنوبية", level: 1, sort_order: 33, metadata: { dialCode: "+82", flag: "🇰🇷" } },
    { value_code: "IN", value_label: "Inde", value_label_ar: "الهند", level: 1, sort_order: 34, metadata: { dialCode: "+91", flag: "🇮🇳" } },
    { value_code: "PK", value_label: "Pakistan", value_label_ar: "باكستان", level: 1, sort_order: 35, metadata: { dialCode: "+92", flag: "🇵🇰" } },
    { value_code: "BD", value_label: "Bangladesh", value_label_ar: "بنغلاديش", level: 1, sort_order: 36, metadata: { dialCode: "+880", flag: "🇧🇩" } },
    { value_code: "ID", value_label: "Indonésie", value_label_ar: "إندونيسيا", level: 1, sort_order: 37, metadata: { dialCode: "+62", flag: "🇮🇩" } },
    { value_code: "MY", value_label: "Malaisie", value_label_ar: "ماليزيا", level: 1, sort_order: 38, metadata: { dialCode: "+60", flag: "🇲🇾" } },
    { value_code: "SG", value_label: "Singapour", value_label_ar: "سنغافورة", level: 1, sort_order: 39, metadata: { dialCode: "+65", flag: "🇸🇬" } },
    { value_code: "TH", value_label: "Thaïlande", value_label_ar: "تايلاند", level: 1, sort_order: 40, metadata: { dialCode: "+66", flag: "🇹🇭" } },
    { value_code: "VN", value_label: "Vietnam", value_label_ar: "فيتنام", level: 1, sort_order: 41, metadata: { dialCode: "+84", flag: "🇻🇳" } },
    { value_code: "PH", value_label: "Philippines", value_label_ar: "الفلبين", level: 1, sort_order: 42, metadata: { dialCode: "+63", flag: "🇵🇭" } },
    { value_code: "AU", value_label: "Australie", value_label_ar: "أستراليا", level: 1, sort_order: 43, metadata: { dialCode: "+61", flag: "🇦🇺" } },
    { value_code: "NZ", value_label: "Nouvelle-Zélande", value_label_ar: "نيوزيلندا", level: 1, sort_order: 44, metadata: { dialCode: "+64", flag: "🇳🇿" } },
    { value_code: "BR", value_label: "Brésil", value_label_ar: "البرازيل", level: 1, sort_order: 45, metadata: { dialCode: "+55", flag: "🇧🇷" } },
    { value_code: "AR", value_label: "Argentine", value_label_ar: "الأرجنتين", level: 1, sort_order: 46, metadata: { dialCode: "+54", flag: "🇦🇷" } },
    { value_code: "MX", value_label: "Mexique", value_label_ar: "المكسيك", level: 1, sort_order: 47, metadata: { dialCode: "+52", flag: "🇲🇽" } },
    { value_code: "ZA", value_label: "Afrique du Sud", value_label_ar: "جنوب أفريقيا", level: 1, sort_order: 48, metadata: { dialCode: "+27", flag: "🇿🇦" } },
    { value_code: "NG", value_label: "Nigéria", value_label_ar: "نيجيريا", level: 1, sort_order: 49, metadata: { dialCode: "+234", flag: "🇳🇬" } },
    { value_code: "KE", value_label: "Kenya", value_label_ar: "كينيا", level: 1, sort_order: 50, metadata: { dialCode: "+254", flag: "🇰🇪" } },
    { value_code: "GH", value_label: "Ghana", value_label_ar: "غانا", level: 1, sort_order: 51, metadata: { dialCode: "+233", flag: "🇬🇭" } },
    { value_code: "SN", value_label: "Sénégal", value_label_ar: "السنغال", level: 1, sort_order: 52, metadata: { dialCode: "+221", flag: "🇸🇳" } },
    { value_code: "CI", value_label: "Côte d'Ivoire", value_label_ar: "ساحل العاج", level: 1, sort_order: 53, metadata: { dialCode: "+225", flag: "🇨🇮" } },
    { value_code: "CM", value_label: "Cameroun", value_label_ar: "الكاميرون", level: 1, sort_order: 54, metadata: { dialCode: "+237", flag: "🇨🇲" } },
    { value_code: "ET", value_label: "Éthiopie", value_label_ar: "إثيوبيا", level: 1, sort_order: 55, metadata: { dialCode: "+251", flag: "🇪🇹" } },
    { value_code: "TZ", value_label: "Tanzanie", value_label_ar: "تنزانيا", level: 1, sort_order: 56, metadata: { dialCode: "+255", flag: "🇹🇿" } },
    { value_code: "UG", value_label: "Ouganda", value_label_ar: "أوغندا", level: 1, sort_order: 57, metadata: { dialCode: "+256", flag: "🇺🇬" } },
    { value_code: "RU", value_label: "Russie", value_label_ar: "روسيا", level: 1, sort_order: 58, metadata: { dialCode: "+7", flag: "🇷🇺" } },
    { value_code: "UA", value_label: "Ukraine", value_label_ar: "أوكرانيا", level: 1, sort_order: 59, metadata: { dialCode: "+380", flag: "🇺🇦" } },
    { value_code: "PL", value_label: "Pologne", value_label_ar: "بولندا", level: 1, sort_order: 60, metadata: { dialCode: "+48", flag: "🇵🇱" } },
    { value_code: "RO", value_label: "Roumanie", value_label_ar: "رومانيا", level: 1, sort_order: 61, metadata: { dialCode: "+40", flag: "🇷🇴" } },
    { value_code: "GR", value_label: "Grèce", value_label_ar: "اليونان", level: 1, sort_order: 62, metadata: { dialCode: "+30", flag: "🇬🇷" } },
    { value_code: "SE", value_label: "Suède", value_label_ar: "السويد", level: 1, sort_order: 63, metadata: { dialCode: "+46", flag: "🇸🇪" } },
    { value_code: "NO", value_label: "Norvège", value_label_ar: "النرويج", level: 1, sort_order: 64, metadata: { dialCode: "+47", flag: "🇳🇴" } },
    { value_code: "DK", value_label: "Danemark", value_label_ar: "الدنمارك", level: 1, sort_order: 65, metadata: { dialCode: "+45", flag: "🇩🇰" } },
    { value_code: "FI", value_label: "Finlande", value_label_ar: "فنلندا", level: 1, sort_order: 66, metadata: { dialCode: "+358", flag: "🇫🇮" } },
    { value_code: "AT", value_label: "Autriche", value_label_ar: "النمسا", level: 1, sort_order: 67, metadata: { dialCode: "+43", flag: "🇦🇹" } },
    { value_code: "CZ", value_label: "République Tchèque", value_label_ar: "التشيك", level: 1, sort_order: 68, metadata: { dialCode: "+420", flag: "🇨🇿" } },
    { value_code: "HU", value_label: "Hongrie", value_label_ar: "المجر", level: 1, sort_order: 69, metadata: { dialCode: "+36", flag: "🇭🇺" } },
    { value_code: "IL", value_label: "Israël", value_label_ar: "إسرائيل", level: 1, sort_order: 70, metadata: { dialCode: "+972", flag: "🇮🇱" } },
    { value_code: "IR", value_label: "Iran", value_label_ar: "إيران", level: 1, sort_order: 71, metadata: { dialCode: "+98", flag: "🇮🇷" } },
    { value_code: "AF", value_label: "Afghanistan", value_label_ar: "أفغانستان", level: 1, sort_order: 72, metadata: { dialCode: "+93", flag: "🇦🇫" } },
  ]
};

// Définition de la liste des langues
export const LANGUAGES_LIST: AutocompleteListDefinition = {
  list_code: 'world_languages',
  list_name: 'Langues du monde',
  description: 'Liste complète des langues mondiales avec leurs codes ISO',
  portal: 'BNRM',
  platform: 'Common',
  service: 'System',
  sub_service: 'Languages',
  form_name: 'Language Selection',
  max_levels: 1,
  values: [
    { value_code: 'ar', value_label: 'Arabe', value_label_ar: 'العربية', level: 1, sort_order: 1 },
    { value_code: 'am', value_label: 'Amazighe (Tifinagh)', value_label_ar: 'ⴰⵎⴰⵣⵉⵖ', level: 1, sort_order: 2 },
    { value_code: 'fr', value_label: 'Français', value_label_ar: 'الفرنسية', level: 1, sort_order: 3 },
    { value_code: 'en', value_label: 'Anglais', value_label_ar: 'الإنجليزية', level: 1, sort_order: 4 },
    { value_code: 'es', value_label: 'Espagnol', value_label_ar: 'الإسبانية', level: 1, sort_order: 5 },
    { value_code: 'de', value_label: 'Allemand', value_label_ar: 'الألمانية', level: 1, sort_order: 6 },
    { value_code: 'it', value_label: 'Italien', value_label_ar: 'الإيطالية', level: 1, sort_order: 7 },
    { value_code: 'pt', value_label: 'Portugais', value_label_ar: 'البرتغالية', level: 1, sort_order: 8 },
    { value_code: 'ru', value_label: 'Russe', value_label_ar: 'الروسية', level: 1, sort_order: 9 },
    { value_code: 'zh', value_label: 'Chinois', value_label_ar: 'الصينية', level: 1, sort_order: 10 },
    { value_code: 'ja', value_label: 'Japonais', value_label_ar: 'اليابانية', level: 1, sort_order: 11 },
    { value_code: 'ko', value_label: 'Coréen', value_label_ar: 'الكورية', level: 1, sort_order: 12 },
    { value_code: 'hi', value_label: 'Hindi', value_label_ar: 'الهندية', level: 1, sort_order: 13 },
    { value_code: 'bn', value_label: 'Bengali', value_label_ar: 'البنغالية', level: 1, sort_order: 14 },
    { value_code: 'pa', value_label: 'Pendjabi', value_label_ar: 'البنجابية', level: 1, sort_order: 15 },
    { value_code: 'te', value_label: 'Telugu', value_label_ar: 'التيلوغوية', level: 1, sort_order: 16 },
    { value_code: 'mr', value_label: 'Marathi', value_label_ar: 'الماراثية', level: 1, sort_order: 17 },
    { value_code: 'ta', value_label: 'Tamoul', value_label_ar: 'التاميلية', level: 1, sort_order: 18 },
    { value_code: 'ur', value_label: 'Ourdou', value_label_ar: 'الأردية', level: 1, sort_order: 19 },
    { value_code: 'gu', value_label: 'Gujarati', value_label_ar: 'الغوجاراتية', level: 1, sort_order: 20 },
    { value_code: 'kn', value_label: 'Kannada', value_label_ar: 'الكانادية', level: 1, sort_order: 21 },
    { value_code: 'ml', value_label: 'Malayalam', value_label_ar: 'المالايالامية', level: 1, sort_order: 22 },
    { value_code: 'or', value_label: 'Oriya', value_label_ar: 'الأورية', level: 1, sort_order: 23 },
    { value_code: 'th', value_label: 'Thaï', value_label_ar: 'التايلاندية', level: 1, sort_order: 24 },
    { value_code: 'vi', value_label: 'Vietnamien', value_label_ar: 'الفيتنامية', level: 1, sort_order: 25 },
    { value_code: 'tr', value_label: 'Turc', value_label_ar: 'التركية', level: 1, sort_order: 26 },
    { value_code: 'pl', value_label: 'Polonais', value_label_ar: 'البولندية', level: 1, sort_order: 27 },
    { value_code: 'uk', value_label: 'Ukrainien', value_label_ar: 'الأوكرانية', level: 1, sort_order: 28 },
    { value_code: 'ro', value_label: 'Roumain', value_label_ar: 'الرومانية', level: 1, sort_order: 29 },
    { value_code: 'nl', value_label: 'Néerlandais', value_label_ar: 'الهولندية', level: 1, sort_order: 30 },
    { value_code: 'el', value_label: 'Grec', value_label_ar: 'اليونانية', level: 1, sort_order: 31 },
    { value_code: 'cs', value_label: 'Tchèque', value_label_ar: 'التشيكية', level: 1, sort_order: 32 },
    { value_code: 'sv', value_label: 'Suédois', value_label_ar: 'السويدية', level: 1, sort_order: 33 },
    { value_code: 'hu', value_label: 'Hongrois', value_label_ar: 'المجرية', level: 1, sort_order: 34 },
    { value_code: 'fi', value_label: 'Finnois', value_label_ar: 'الفنلندية', level: 1, sort_order: 35 },
    { value_code: 'no', value_label: 'Norvégien', value_label_ar: 'النرويجية', level: 1, sort_order: 36 },
    { value_code: 'da', value_label: 'Danois', value_label_ar: 'الدنماركية', level: 1, sort_order: 37 },
    { value_code: 'he', value_label: 'Hébreu', value_label_ar: 'العبرية', level: 1, sort_order: 38 },
    { value_code: 'id', value_label: 'Indonésien', value_label_ar: 'الإندونيسية', level: 1, sort_order: 39 },
    { value_code: 'ms', value_label: 'Malais', value_label_ar: 'المالاوية', level: 1, sort_order: 40 },
    { value_code: 'fa', value_label: 'Persan', value_label_ar: 'الفارسية', level: 1, sort_order: 41 },
    { value_code: 'sw', value_label: 'Swahili', value_label_ar: 'السواحيلية', level: 1, sort_order: 42 },
    { value_code: 'af', value_label: 'Afrikaans', value_label_ar: 'الأفريكانية', level: 1, sort_order: 43 },
    { value_code: 'sq', value_label: 'Albanais', value_label_ar: 'الألبانية', level: 1, sort_order: 44 },
    { value_code: 'hy', value_label: 'Arménien', value_label_ar: 'الأرمنية', level: 1, sort_order: 45 },
    { value_code: 'az', value_label: 'Azéri', value_label_ar: 'الأذرية', level: 1, sort_order: 46 },
    { value_code: 'eu', value_label: 'Basque', value_label_ar: 'الباسكية', level: 1, sort_order: 47 },
    { value_code: 'be', value_label: 'Biélorusse', value_label_ar: 'البيلاروسية', level: 1, sort_order: 48 },
    { value_code: 'bs', value_label: 'Bosniaque', value_label_ar: 'البوسنية', level: 1, sort_order: 49 },
    { value_code: 'bg', value_label: 'Bulgare', value_label_ar: 'البلغارية', level: 1, sort_order: 50 },
    { value_code: 'ca', value_label: 'Catalan', value_label_ar: 'الكتالانية', level: 1, sort_order: 51 },
    { value_code: 'hr', value_label: 'Croate', value_label_ar: 'الكرواتية', level: 1, sort_order: 52 },
    { value_code: 'et', value_label: 'Estonien', value_label_ar: 'الإستونية', level: 1, sort_order: 53 },
    { value_code: 'gl', value_label: 'Galicien', value_label_ar: 'الجاليكية', level: 1, sort_order: 54 },
    { value_code: 'ka', value_label: 'Géorgien', value_label_ar: 'الجورجية', level: 1, sort_order: 55 },
    { value_code: 'is', value_label: 'Islandais', value_label_ar: 'الأيسلندية', level: 1, sort_order: 56 },
    { value_code: 'ga', value_label: 'Irlandais', value_label_ar: 'الأيرلندية', level: 1, sort_order: 57 },
    { value_code: 'lv', value_label: 'Letton', value_label_ar: 'اللاتفية', level: 1, sort_order: 58 },
    { value_code: 'lt', value_label: 'Lituanien', value_label_ar: 'الليتوانية', level: 1, sort_order: 59 },
    { value_code: 'mk', value_label: 'Macédonien', value_label_ar: 'المقدونية', level: 1, sort_order: 60 },
    { value_code: 'mt', value_label: 'Maltais', value_label_ar: 'المالطية', level: 1, sort_order: 61 },
    { value_code: 'mn', value_label: 'Mongol', value_label_ar: 'المنغولية', level: 1, sort_order: 62 },
    { value_code: 'sr', value_label: 'Serbe', value_label_ar: 'الصربية', level: 1, sort_order: 63 },
    { value_code: 'sk', value_label: 'Slovaque', value_label_ar: 'السلوفاكية', level: 1, sort_order: 64 },
    { value_code: 'sl', value_label: 'Slovène', value_label_ar: 'السلوفينية', level: 1, sort_order: 65 },
    { value_code: 'tl', value_label: 'Tagalog', value_label_ar: 'التاغالوغية', level: 1, sort_order: 66 },
    { value_code: 'cy', value_label: 'Gallois', value_label_ar: 'الويلزية', level: 1, sort_order: 67 },
    { value_code: 'yi', value_label: 'Yiddish', value_label_ar: 'اليديشية', level: 1, sort_order: 68 },
    { value_code: 'zu', value_label: 'Zoulou', value_label_ar: 'الزولوية', level: 1, sort_order: 69 },
    { value_code: 'other', value_label: 'Autre', value_label_ar: 'أخرى', level: 1, sort_order: 70 }
  ]
};

/**
 * Liste des nationalités
 */
export const NATIONALITIES_LIST: AutocompleteListDefinition = {
  list_code: 'nationalities',
  list_name: 'Nationalités',
  description: 'Liste des nationalités pour les formulaires',
  portal: 'BNRM',
  platform: 'BNRM',
  service: 'Données de référence',
  sub_service: 'Identité',
  form_name: 'Général',
  max_levels: 1,
  values: [
    { value_code: "MA", value_label: "Marocaine", value_label_ar: "مغربي(ة)", level: 1, sort_order: 1 },
    { value_code: "DZ", value_label: "Algérienne", value_label_ar: "جزائري(ة)", level: 1, sort_order: 2 },
    { value_code: "TN", value_label: "Tunisienne", value_label_ar: "تونسي(ة)", level: 1, sort_order: 3 },
    { value_code: "EG", value_label: "Égyptienne", value_label_ar: "مصري(ة)", level: 1, sort_order: 4 },
    { value_code: "LY", value_label: "Libyenne", value_label_ar: "ليبي(ة)", level: 1, sort_order: 5 },
    { value_code: "MR", value_label: "Mauritanienne", value_label_ar: "موريتاني(ة)", level: 1, sort_order: 6 },
    { value_code: "FR", value_label: "Française", value_label_ar: "فرنسي(ة)", level: 1, sort_order: 7 },
    { value_code: "ES", value_label: "Espagnole", value_label_ar: "إسباني(ة)", level: 1, sort_order: 8 },
    { value_code: "PT", value_label: "Portugaise", value_label_ar: "برتغالي(ة)", level: 1, sort_order: 9 },
    { value_code: "IT", value_label: "Italienne", value_label_ar: "إيطالي(ة)", level: 1, sort_order: 10 },
    { value_code: "DE", value_label: "Allemande", value_label_ar: "ألماني(ة)", level: 1, sort_order: 11 },
    { value_code: "GB", value_label: "Britannique", value_label_ar: "بريطاني(ة)", level: 1, sort_order: 12 },
    { value_code: "BE", value_label: "Belge", value_label_ar: "بلجيكي(ة)", level: 1, sort_order: 13 },
    { value_code: "NL", value_label: "Néerlandaise", value_label_ar: "هولندي(ة)", level: 1, sort_order: 14 },
    { value_code: "CH", value_label: "Suisse", value_label_ar: "سويسري(ة)", level: 1, sort_order: 15 },
    { value_code: "US", value_label: "Américaine", value_label_ar: "أمريكي(ة)", level: 1, sort_order: 16 },
    { value_code: "CA", value_label: "Canadienne", value_label_ar: "كندي(ة)", level: 1, sort_order: 17 },
    { value_code: "SA", value_label: "Saoudienne", value_label_ar: "سعودي(ة)", level: 1, sort_order: 18 },
    { value_code: "AE", value_label: "Émiratie", value_label_ar: "إماراتي(ة)", level: 1, sort_order: 19 },
    { value_code: "QA", value_label: "Qatarienne", value_label_ar: "قطري(ة)", level: 1, sort_order: 20 },
    { value_code: "KW", value_label: "Koweïtienne", value_label_ar: "كويتي(ة)", level: 1, sort_order: 21 },
    { value_code: "JO", value_label: "Jordanienne", value_label_ar: "أردني(ة)", level: 1, sort_order: 22 },
    { value_code: "LB", value_label: "Libanaise", value_label_ar: "لبناني(ة)", level: 1, sort_order: 23 },
    { value_code: "SY", value_label: "Syrienne", value_label_ar: "سوري(ة)", level: 1, sort_order: 24 },
    { value_code: "IQ", value_label: "Irakienne", value_label_ar: "عراقي(ة)", level: 1, sort_order: 25 },
    { value_code: "PS", value_label: "Palestinienne", value_label_ar: "فلسطيني(ة)", level: 1, sort_order: 26 },
    { value_code: "TR", value_label: "Turque", value_label_ar: "تركي(ة)", level: 1, sort_order: 27 },
    { value_code: "CN", value_label: "Chinoise", value_label_ar: "صيني(ة)", level: 1, sort_order: 28 },
    { value_code: "JP", value_label: "Japonaise", value_label_ar: "ياباني(ة)", level: 1, sort_order: 29 },
    { value_code: "KR", value_label: "Coréenne (Sud)", value_label_ar: "كوري(ة) جنوبي(ة)", level: 1, sort_order: 30 },
    { value_code: "IN", value_label: "Indienne", value_label_ar: "هندي(ة)", level: 1, sort_order: 31 },
    { value_code: "BR", value_label: "Brésilienne", value_label_ar: "برازيلي(ة)", level: 1, sort_order: 32 },
    { value_code: "AR", value_label: "Argentine", value_label_ar: "أرجنتيني(ة)", level: 1, sort_order: 33 },
    { value_code: "MX", value_label: "Mexicaine", value_label_ar: "مكسيكي(ة)", level: 1, sort_order: 34 },
    { value_code: "ZA", value_label: "Sud-Africaine", value_label_ar: "جنوب أفريقي(ة)", level: 1, sort_order: 35 },
    { value_code: "NG", value_label: "Nigériane", value_label_ar: "نيجيري(ة)", level: 1, sort_order: 36 },
    { value_code: "SN", value_label: "Sénégalaise", value_label_ar: "سنغالي(ة)", level: 1, sort_order: 37 },
    { value_code: "CI", value_label: "Ivoirienne", value_label_ar: "إيفواري(ة)", level: 1, sort_order: 38 },
    { value_code: "ML", value_label: "Malienne", value_label_ar: "مالي(ة)", level: 1, sort_order: 39 },
    { value_code: "RU", value_label: "Russe", value_label_ar: "روسي(ة)", level: 1, sort_order: 40 },
    { value_code: "OTHER", value_label: "Autre", value_label_ar: "أخرى", level: 1, sort_order: 99 },
  ]
};

/**
 * Langues des manuscrits (pour la plateforme Manuscrits)
 */
export const MANUSCRIPT_LANGUAGES_LIST: AutocompleteListDefinition = {
  list_code: 'langues_manuscrits',
  list_name: 'Langues des manuscrits',
  description: 'Langues utilisées dans les manuscrits',
  portal: 'MANUSCRIPTS',
  platform: 'MANUSCRIPTS',
  service: 'Manuscrits',
  sub_service: 'Catalogage',
  form_name: 'Fiche Manuscrit',
  max_levels: 1,
  values: [
    { value_code: "arabe", value_label: "Arabe", value_label_ar: "العربية", level: 1, sort_order: 1 },
    { value_code: "arabe_classique", value_label: "Arabe classique", value_label_ar: "العربية الفصحى", level: 1, sort_order: 2 },
    { value_code: "amazigh", value_label: "Amazighe (Tifinagh)", value_label_ar: "ⴰⵎⴰⵣⵉⵖ", level: 1, sort_order: 3 },
    { value_code: "hebreu", value_label: "Hébreu", value_label_ar: "العبرية", level: 1, sort_order: 4 },
    { value_code: "latin", value_label: "Latin", value_label_ar: "اللاتينية", level: 1, sort_order: 5 },
    { value_code: "espagnol_ancien", value_label: "Espagnol ancien", value_label_ar: "الإسبانية القديمة", level: 1, sort_order: 6 },
    { value_code: "francais_ancien", value_label: "Français ancien", value_label_ar: "الفرنسية القديمة", level: 1, sort_order: 7 },
    { value_code: "persan", value_label: "Persan", value_label_ar: "الفارسية", level: 1, sort_order: 8 },
    { value_code: "turc_ottoman", value_label: "Turc ottoman", value_label_ar: "التركية العثمانية", level: 1, sort_order: 9 },
    { value_code: "grec", value_label: "Grec ancien", value_label_ar: "اليونانية القديمة", level: 1, sort_order: 10 },
    { value_code: "syriaque", value_label: "Syriaque", value_label_ar: "السريانية", level: 1, sort_order: 11 },
    { value_code: "autre", value_label: "Autre", value_label_ar: "أخرى", level: 1, sort_order: 99 },
  ]
};

/**
 * Thématiques des manuscrits (pour la plateforme Manuscrits)
 */
export const MANUSCRIPT_THEMES_LIST: AutocompleteListDefinition = {
  list_code: 'thematique_manuscrits',
  list_name: 'Thématiques des manuscrits',
  description: 'Thématiques et sujets des manuscrits',
  portal: 'MANUSCRIPTS',
  platform: 'MANUSCRIPTS',
  service: 'Manuscrits',
  sub_service: 'Catalogage',
  form_name: 'Fiche Manuscrit',
  max_levels: 1,
  values: [
    { value_code: "sciences_religieuses", value_label: "Sciences religieuses", value_label_ar: "العلوم الدينية", level: 1, sort_order: 1 },
    { value_code: "coran_exegese", value_label: "Coran et exégèse", value_label_ar: "القرآن والتفسير", level: 1, sort_order: 2 },
    { value_code: "hadith", value_label: "Hadith", value_label_ar: "الحديث", level: 1, sort_order: 3 },
    { value_code: "fiqh", value_label: "Fiqh (Jurisprudence)", value_label_ar: "الفقه", level: 1, sort_order: 4 },
    { value_code: "soufisme", value_label: "Soufisme", value_label_ar: "التصوف", level: 1, sort_order: 5 },
    { value_code: "theologie", value_label: "Théologie (Aqida)", value_label_ar: "العقيدة", level: 1, sort_order: 6 },
    { value_code: "litterature", value_label: "Littérature", value_label_ar: "الأدب", level: 1, sort_order: 7 },
    { value_code: "poesie", value_label: "Poésie", value_label_ar: "الشعر", level: 1, sort_order: 8 },
    { value_code: "grammaire", value_label: "Grammaire et linguistique", value_label_ar: "النحو واللغة", level: 1, sort_order: 9 },
    { value_code: "histoire", value_label: "Histoire", value_label_ar: "التاريخ", level: 1, sort_order: 10 },
    { value_code: "geographie", value_label: "Géographie", value_label_ar: "الجغرافيا", level: 1, sort_order: 11 },
    { value_code: "medecine", value_label: "Médecine", value_label_ar: "الطب", level: 1, sort_order: 12 },
    { value_code: "astronomie", value_label: "Astronomie", value_label_ar: "الفلك", level: 1, sort_order: 13 },
    { value_code: "mathematiques", value_label: "Mathématiques", value_label_ar: "الرياضيات", level: 1, sort_order: 14 },
    { value_code: "philosophie", value_label: "Philosophie", value_label_ar: "الفلسفة", level: 1, sort_order: 15 },
    { value_code: "logique", value_label: "Logique", value_label_ar: "المنطق", level: 1, sort_order: 16 },
    { value_code: "musique", value_label: "Musique", value_label_ar: "الموسيقى", level: 1, sort_order: 17 },
    { value_code: "alchimie", value_label: "Alchimie", value_label_ar: "الكيمياء", level: 1, sort_order: 18 },
    { value_code: "magie_talismans", value_label: "Magie et talismans", value_label_ar: "السحر والطلاسم", level: 1, sort_order: 19 },
    { value_code: "correspondance", value_label: "Correspondance", value_label_ar: "المراسلات", level: 1, sort_order: 20 },
    { value_code: "actes_officiels", value_label: "Actes officiels", value_label_ar: "الوثائق الرسمية", level: 1, sort_order: 21 },
    { value_code: "autre", value_label: "Autre", value_label_ar: "أخرى", level: 1, sort_order: 99 },
  ]
};

/**
 * Liste complète de toutes les listes auto-complètes à synchroniser
 */
export const AUTOCOMPLETE_LISTS_DEFINITIONS: AutocompleteListDefinition[] = [
  COUNTRIES_LIST,
  LANGUAGES_LIST,
  NATIONALITIES_LIST,
  MANUSCRIPT_LANGUAGES_LIST,
  MANUSCRIPT_THEMES_LIST
];
