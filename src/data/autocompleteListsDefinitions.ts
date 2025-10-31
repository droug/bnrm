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

/**
 * Liste complète de toutes les listes auto-complètes à synchroniser
 */
export const AUTOCOMPLETE_LISTS_DEFINITIONS: AutocompleteListDefinition[] = [
  COUNTRIES_LIST,
];
