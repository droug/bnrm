/**
 * @deprecated Ce fichier est obsolète. Les pays sont maintenant gérés via la base de données.
 * Utilisez le composant GenericAutocomplete avec listCode="world_countries" à la place.
 * 
 * Les données sont automatiquement synchronisées depuis src/data/autocompleteListsDefinitions.ts
 */

export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  nameAr: string;
  dialCode: string;
  flag: string;
}

export const worldCountries: Country[] = [
  { code: "MA", name: "Maroc", nameAr: "المغرب", dialCode: "+212", flag: "🇲🇦" },
  { code: "DZ", name: "Algérie", nameAr: "الجزائر", dialCode: "+213", flag: "🇩🇿" },
  { code: "TN", name: "Tunisie", nameAr: "تونس", dialCode: "+216", flag: "🇹🇳" },
  { code: "EG", name: "Égypte", nameAr: "مصر", dialCode: "+20", flag: "🇪🇬" },
  { code: "LY", name: "Libye", nameAr: "ليبيا", dialCode: "+218", flag: "🇱🇾" },
  { code: "MR", name: "Mauritanie", nameAr: "موريتانيا", dialCode: "+222", flag: "🇲🇷" },
  { code: "FR", name: "France", nameAr: "فرنسا", dialCode: "+33", flag: "🇫🇷" },
  { code: "ES", name: "Espagne", nameAr: "إسبانيا", dialCode: "+34", flag: "🇪🇸" },
  { code: "PT", name: "Portugal", nameAr: "البرتغال", dialCode: "+351", flag: "🇵🇹" },
  { code: "IT", name: "Italie", nameAr: "إيطاليا", dialCode: "+39", flag: "🇮🇹" },
  { code: "DE", name: "Allemagne", nameAr: "ألمانيا", dialCode: "+49", flag: "🇩🇪" },
  { code: "GB", name: "Royaume-Uni", nameAr: "المملكة المتحدة", dialCode: "+44", flag: "🇬🇧" },
  { code: "BE", name: "Belgique", nameAr: "بلجيكا", dialCode: "+32", flag: "🇧🇪" },
  { code: "NL", name: "Pays-Bas", nameAr: "هولندا", dialCode: "+31", flag: "🇳🇱" },
  { code: "CH", name: "Suisse", nameAr: "سويسرا", dialCode: "+41", flag: "🇨🇭" },
  { code: "US", name: "États-Unis", nameAr: "الولايات المتحدة", dialCode: "+1", flag: "🇺🇸" },
  { code: "CA", name: "Canada", nameAr: "كندا", dialCode: "+1", flag: "🇨🇦" },
  { code: "SA", name: "Arabie Saoudite", nameAr: "السعودية", dialCode: "+966", flag: "🇸🇦" },
  { code: "AE", name: "Émirats Arabes Unis", nameAr: "الإمارات", dialCode: "+971", flag: "🇦🇪" },
  { code: "QA", name: "Qatar", nameAr: "قطر", dialCode: "+974", flag: "🇶🇦" },
  { code: "KW", name: "Koweït", nameAr: "الكويت", dialCode: "+965", flag: "🇰🇼" },
  { code: "BH", name: "Bahreïn", nameAr: "البحرين", dialCode: "+973", flag: "🇧🇭" },
  { code: "OM", name: "Oman", nameAr: "عمان", dialCode: "+968", flag: "🇴🇲" },
  { code: "JO", name: "Jordanie", nameAr: "الأردن", dialCode: "+962", flag: "🇯🇴" },
  { code: "LB", name: "Liban", nameAr: "لبنان", dialCode: "+961", flag: "🇱🇧" },
  { code: "SY", name: "Syrie", nameAr: "سوريا", dialCode: "+963", flag: "🇸🇾" },
  { code: "IQ", name: "Irak", nameAr: "العراق", dialCode: "+964", flag: "🇮🇶" },
  { code: "YE", name: "Yémen", nameAr: "اليمن", dialCode: "+967", flag: "🇾🇪" },
  { code: "PS", name: "Palestine", nameAr: "فلسطين", dialCode: "+970", flag: "🇵🇸" },
  { code: "TR", name: "Turquie", nameAr: "تركيا", dialCode: "+90", flag: "🇹🇷" },
  { code: "CN", name: "Chine", nameAr: "الصين", dialCode: "+86", flag: "🇨🇳" },
  { code: "JP", name: "Japon", nameAr: "اليابان", dialCode: "+81", flag: "🇯🇵" },
  { code: "KR", name: "Corée du Sud", nameAr: "كوريا الجنوبية", dialCode: "+82", flag: "🇰🇷" },
  { code: "IN", name: "Inde", nameAr: "الهند", dialCode: "+91", flag: "🇮🇳" },
  { code: "PK", name: "Pakistan", nameAr: "باكستان", dialCode: "+92", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", nameAr: "بنغلاديش", dialCode: "+880", flag: "🇧🇩" },
  { code: "ID", name: "Indonésie", nameAr: "إندونيسيا", dialCode: "+62", flag: "🇮🇩" },
  { code: "MY", name: "Malaisie", nameAr: "ماليزيا", dialCode: "+60", flag: "🇲🇾" },
  { code: "SG", name: "Singapour", nameAr: "سنغافورة", dialCode: "+65", flag: "🇸🇬" },
  { code: "TH", name: "Thaïlande", nameAr: "تايلاند", dialCode: "+66", flag: "🇹🇭" },
  { code: "VN", name: "Vietnam", nameAr: "فيتنام", dialCode: "+84", flag: "🇻🇳" },
  { code: "PH", name: "Philippines", nameAr: "الفلبين", dialCode: "+63", flag: "🇵🇭" },
  { code: "AU", name: "Australie", nameAr: "أستراليا", dialCode: "+61", flag: "🇦🇺" },
  { code: "NZ", name: "Nouvelle-Zélande", nameAr: "نيوزيلندا", dialCode: "+64", flag: "🇳🇿" },
  { code: "BR", name: "Brésil", nameAr: "البرازيل", dialCode: "+55", flag: "🇧🇷" },
  { code: "AR", name: "Argentine", nameAr: "الأرجنتين", dialCode: "+54", flag: "🇦🇷" },
  { code: "MX", name: "Mexique", nameAr: "المكسيك", dialCode: "+52", flag: "🇲🇽" },
  { code: "ZA", name: "Afrique du Sud", nameAr: "جنوب أفريقيا", dialCode: "+27", flag: "🇿🇦" },
  { code: "NG", name: "Nigéria", nameAr: "نيجيريا", dialCode: "+234", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", nameAr: "كينيا", dialCode: "+254", flag: "🇰🇪" },
  { code: "GH", name: "Ghana", nameAr: "غانا", dialCode: "+233", flag: "🇬🇭" },
  { code: "SN", name: "Sénégal", nameAr: "السنغال", dialCode: "+221", flag: "🇸🇳" },
  { code: "CI", name: "Côte d'Ivoire", nameAr: "ساحل العاج", dialCode: "+225", flag: "🇨🇮" },
  { code: "CM", name: "Cameroun", nameAr: "الكاميرون", dialCode: "+237", flag: "🇨🇲" },
  { code: "ET", name: "Éthiopie", nameAr: "إثيوبيا", dialCode: "+251", flag: "🇪🇹" },
  { code: "TZ", name: "Tanzanie", nameAr: "تنزانيا", dialCode: "+255", flag: "🇹🇿" },
  { code: "UG", name: "Ouganda", nameAr: "أوغندا", dialCode: "+256", flag: "🇺🇬" },
  { code: "RU", name: "Russie", nameAr: "روسيا", dialCode: "+7", flag: "🇷🇺" },
  { code: "UA", name: "Ukraine", nameAr: "أوكرانيا", dialCode: "+380", flag: "🇺🇦" },
  { code: "PL", name: "Pologne", nameAr: "بولندا", dialCode: "+48", flag: "🇵🇱" },
  { code: "RO", name: "Roumanie", nameAr: "رومانيا", dialCode: "+40", flag: "🇷🇴" },
  { code: "GR", name: "Grèce", nameAr: "اليونان", dialCode: "+30", flag: "🇬🇷" },
  { code: "SE", name: "Suède", nameAr: "السويد", dialCode: "+46", flag: "🇸🇪" },
  { code: "NO", name: "Norvège", nameAr: "النرويج", dialCode: "+47", flag: "🇳🇴" },
  { code: "DK", name: "Danemark", nameAr: "الدنمارك", dialCode: "+45", flag: "🇩🇰" },
  { code: "FI", name: "Finlande", nameAr: "فنلندا", dialCode: "+358", flag: "🇫🇮" },
  { code: "AT", name: "Autriche", nameAr: "النمسا", dialCode: "+43", flag: "🇦🇹" },
  { code: "CZ", name: "République Tchèque", nameAr: "التشيك", dialCode: "+420", flag: "🇨🇿" },
  { code: "HU", name: "Hongrie", nameAr: "المجر", dialCode: "+36", flag: "🇭🇺" },
  { code: "IL", name: "Israël", nameAr: "إسرائيل", dialCode: "+972", flag: "🇮🇱" },
  { code: "IR", name: "Iran", nameAr: "إيران", dialCode: "+98", flag: "🇮🇷" },
  { code: "AF", name: "Afghanistan", nameAr: "أفغانستان", dialCode: "+93", flag: "🇦🇫" },
];
