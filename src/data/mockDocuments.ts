// Exemples de différents types d'ouvrages pour tester le système de réservation

export interface MockDocument {
  id: string;
  title: string;
  titleAr?: string;
  author: string;
  secondaryAuthors?: string[];
  year: string;
  publisher: string;
  publishPlace?: string;
  pages?: number;
  isbn?: string;
  issn?: string;
  cote: string;
  internalId?: string;
  supportType: string;
  supportStatus: "numerise" | "non_numerise" | "libre_acces";
  isFreeAccess: boolean;
  allowPhysicalConsultation?: boolean;
  description: string;
  summary?: string;
  tableOfContents?: string[];
  keywords?: string[];
  collection?: string;
  language?: string;
  physicalDescription?: string;
  noticeOrigin?: string;
  digitalLink?: string;
}

export const mockDocuments: MockDocument[] = [
  // 1. Ouvrage LIBRE D'ACCÈS - Numérisé et accessible à tous
  {
    id: "DOC-2024-001",
    title: "Histoire de la littérature marocaine moderne",
    titleAr: "تاريخ الأدب المغربي الحديث",
    author: "Ahmed Ben Mohammed",
    secondaryAuthors: ["Fatima El Alaoui", "Mohammed Bennis"],
    year: "2023",
    publisher: "Éditions Atlas",
    publishPlace: "Rabat",
    pages: 342,
    isbn: "978-9954-123-456-7",
    cote: "840.MAR.BEN",
    internalId: "BNM-2024-001",
    supportType: "Livre",
    supportStatus: "libre_acces",
    isFreeAccess: true,
    allowPhysicalConsultation: true,
    description: "Cet ouvrage propose une étude approfondie de l'évolution de la littérature marocaine moderne, de l'indépendance à nos jours. Il analyse les principaux courants littéraires, les auteurs majeurs et les thèmes récurrents qui caractérisent cette période riche en productions.",
    summary: "Une analyse complète de l'évolution de la littérature marocaine moderne depuis l'indépendance.",
    tableOfContents: [
      "Introduction à la littérature marocaine",
      "Les courants littéraires post-indépendance",
      "Les auteurs majeurs et leurs œuvres",
      "Thèmes récurrents et symboles",
      "Conclusion et perspectives"
    ],
    keywords: ["Littérature marocaine", "Histoire littéraire", "Analyse culturelle", "Post-indépendance"],
    collection: "Patrimoine Littéraire",
    language: "Français",
    physicalDescription: "342 p. : ill. ; 24 cm",
    noticeOrigin: "Bibliothèque Nationale du Royaume du Maroc",
    digitalLink: "https://bibliotheque-numerique-bnrm.ma/viewer/DOC-2024-001"
  },

  // 2. Ouvrage NUMÉRISÉ - Accès restreint (nécessite réservation pour consultation numérique)
  {
    id: "DOC-2024-002",
    title: "Manuscrits enluminés du Maroc médiéval",
    titleAr: "المخطوطات المزخرفة من المغرب الوسيط",
    author: "Hassan El Fassi",
    secondaryAuthors: ["Aïcha Bennani"],
    year: "2022",
    publisher: "Publications de la BNRM",
    publishPlace: "Rabat",
    pages: 456,
    isbn: "978-9954-234-567-8",
    cote: "091.MAR.ELF",
    internalId: "BNM-2022-145",
    supportType: "Manuscrit",
    supportStatus: "numerise",
    isFreeAccess: false,
    allowPhysicalConsultation: false,
    description: "Catalogue exhaustif des manuscrits enluminés conservés à la Bibliothèque Nationale. Cet ouvrage présente une analyse détaillée de l'art de l'enluminure au Maroc médiéval, avec des reproductions haute résolution de pages exceptionnelles.",
    summary: "Un catalogue complet des manuscrits enluminés du Maroc médiéval avec analyse artistique et historique.",
    tableOfContents: [
      "Les techniques d'enluminure au Maghreb",
      "Les ateliers de Fès et Marrakech",
      "Iconographie islamique et symbolisme",
      "Conservation et restauration",
      "Catalogue des œuvres"
    ],
    keywords: ["Manuscrits", "Enluminure", "Art islamique", "Patrimoine", "Conservation"],
    collection: "Patrimoine Manuscrit",
    language: "Français / Arabe",
    physicalDescription: "456 p. : ill. en coul. ; 30 cm",
    noticeOrigin: "Bibliothèque Nationale du Royaume du Maroc",
    digitalLink: "https://bibliotheque-numerique-bnrm.ma/viewer/DOC-2024-002"
  },

  // 3. Ouvrage NON NUMÉRISÉ - Consultation physique uniquement
  {
    id: "DOC-2023-089",
    title: "Archives royales du Maroc : Correspondances diplomatiques 1912-1956",
    titleAr: "الأرشيف الملكي المغربي: المراسلات الدبلوماسية 1912-1956",
    author: "Mohammed Kenbib",
    year: "2023",
    publisher: "Éditions du Palais Royal",
    publishPlace: "Rabat",
    pages: 628,
    isbn: "978-9954-345-678-9",
    cote: "327.64.KEN",
    internalId: "BNM-2023-089",
    supportType: "Archives",
    supportStatus: "non_numerise",
    isFreeAccess: false,
    allowPhysicalConsultation: true,
    description: "Recueil de correspondances diplomatiques entre le Maroc et diverses puissances étrangères durant la période du protectorat. Documents d'archives inédits accompagnés d'analyses contextuelles.",
    summary: "Correspondances diplomatiques historiques de la période du protectorat français au Maroc.",
    tableOfContents: [
      "Contexte historique 1912-1956",
      "Relations avec la France",
      "Relations avec l'Espagne",
      "Relations internationales",
      "Index des documents"
    ],
    keywords: ["Archives", "Diplomatie", "Protectorat", "Histoire contemporaine", "Relations internationales"],
    collection: "Archives Historiques",
    language: "Français / Arabe",
    physicalDescription: "628 p. ; 28 cm + annexes",
    noticeOrigin: "Bibliothèque Nationale du Royaume du Maroc"
  },

  // 4. Périodique NUMÉRISÉ - Consultation en ligne restreinte
  {
    id: "PER-2024-015",
    title: "Revue marocaine d'études juridiques et politiques",
    titleAr: "المجلة المغربية للدراسات القانونية والسياسية",
    author: "Collectif",
    year: "2024",
    publisher: "Faculté de Droit - Rabat",
    publishPlace: "Rabat",
    issn: "2550-3456",
    cote: "340.05.REV",
    internalId: "PER-2024-015",
    supportType: "Périodique",
    supportStatus: "numerise",
    isFreeAccess: false,
    allowPhysicalConsultation: true,
    description: "Revue académique trimestrielle consacrée aux études juridiques et politiques au Maroc et dans le monde arabe. Numéro spécial sur les réformes constitutionnelles.",
    summary: "Revue académique trimestrielle - Numéro spécial réformes constitutionnelles.",
    keywords: ["Droit", "Sciences politiques", "Constitution", "Réformes", "Maroc"],
    collection: "Périodiques Académiques",
    language: "Français / Arabe",
    physicalDescription: "Vol. 45, N°2 (Avril 2024), 256 p.",
    noticeOrigin: "Bibliothèque Nationale du Royaume du Maroc",
    digitalLink: "https://bibliotheque-numerique-bnrm.ma/periodiques/PER-2024-015"
  },

  // 5. Document MULTIMÉDIA - CD-ROM/DVD
  {
    id: "MUL-2023-034",
    title: "Atlas interactif du Maroc : Géographie, Histoire et Culture",
    titleAr: "أطلس المغرب التفاعلي: الجغرافيا والتاريخ والثقافة",
    author: "Institut Royal de Géographie",
    year: "2023",
    publisher: "Publications IRG",
    publishPlace: "Rabat",
    isbn: "978-9954-456-789-0",
    cote: "916.4.ATL",
    internalId: "MUL-2023-034",
    supportType: "CD-ROM",
    supportStatus: "non_numerise",
    isFreeAccess: false,
    allowPhysicalConsultation: true,
    description: "Atlas multimédia interactif présentant la géographie, l'histoire et la culture marocaine à travers des cartes, des vidéos, des photographies et des documents d'archives.",
    summary: "Atlas interactif multimédia sur CD-ROM couvrant tous les aspects du Maroc.",
    tableOfContents: [
      "Module Géographie physique",
      "Module Histoire dynastique",
      "Module Patrimoine culturel",
      "Base de données documentaire",
      "Galerie multimédia"
    ],
    keywords: ["Atlas", "Géographie", "Histoire", "Culture", "Multimédia", "Patrimoine"],
    collection: "Documents Multimédias",
    language: "Français / Arabe / Anglais",
    physicalDescription: "1 CD-ROM + livret 48 p.",
    noticeOrigin: "Bibliothèque Nationale du Royaume du Maroc"
  },

  // 6. Ouvrage rare et précieux - NON NUMÉRISÉ - Consultation sur place uniquement
  {
    id: "RAR-1890-001",
    title: "Description géographique de l'empire de Maroc",
    author: "Louis de Chénier",
    year: "1890",
    publisher: "Imprimerie Royale",
    publishPlace: "Paris",
    pages: 384,
    cote: "916.4.CHE.R",
    internalId: "RAR-1890-001",
    supportType: "Livre ancien",
    supportStatus: "non_numerise",
    isFreeAccess: false,
    allowPhysicalConsultation: false,
    description: "Édition originale rare de la description du Maroc par Louis de Chénier, consul de France. Ouvrage en excellent état avec illustrations gravées d'époque. Consultation uniquement sur place avec autorisation spéciale.",
    summary: "Description historique du Maroc par un consul français du XIXe siècle - Édition originale rare.",
    keywords: ["Livre rare", "Histoire", "Géographie historique", "XIXe siècle", "Voyages"],
    collection: "Fonds Patrimonial Rare",
    language: "Français",
    physicalDescription: "384 p. : grav. ; 22 cm - Reliure d'époque",
    noticeOrigin: "Bibliothèque Nationale du Royaume du Maroc"
  },

  // 7. Thèse universitaire LIBRE D'ACCÈS
  {
    id: "THE-2024-012",
    title: "L'architecture des médinas marocaines : Patrimoine et modernité",
    titleAr: "عمارة المدن المغربية العتيقة: التراث والحداثة",
    author: "Samira Bennani",
    year: "2024",
    publisher: "Université Mohammed V",
    publishPlace: "Rabat",
    pages: 512,
    isbn: "978-9954-567-890-1",
    cote: "720.964.BEN",
    internalId: "THE-2024-012",
    supportType: "Thèse",
    supportStatus: "libre_acces",
    isFreeAccess: true,
    allowPhysicalConsultation: true,
    description: "Thèse de doctorat en architecture analysant l'évolution urbaine des médinas marocaines et les enjeux de préservation du patrimoine architectural face à la modernisation.",
    summary: "Thèse de doctorat sur l'architecture des médinas marocaines entre tradition et modernité.",
    tableOfContents: [
      "Méthodologie de recherche",
      "Analyse historique des médinas",
      "Typologie architecturale",
      "Enjeux de conservation",
      "Propositions d'aménagement",
      "Conclusion et perspectives"
    ],
    keywords: ["Architecture", "Médina", "Patrimoine", "Urbanisme", "Conservation", "Modernisation"],
    collection: "Thèses et Mémoires",
    language: "Français",
    physicalDescription: "512 p. : ill., plans ; 30 cm",
    noticeOrigin: "Bibliothèque Nationale du Royaume du Maroc",
    digitalLink: "https://bibliotheque-numerique-bnrm.ma/theses/THE-2024-012"
  },

  // 8. Carte géographique ancienne - NON NUMÉRISÉE
  {
    id: "CAR-1750-008",
    title: "Carte du Royaume de Fez et du Maroc",
    author: "Jacques-Nicolas Bellin",
    year: "1750",
    publisher: "Dépôt des cartes et plans de la Marine",
    publishPlace: "Paris",
    cote: "912.64.BEL",
    internalId: "CAR-1750-008",
    supportType: "Carte ancienne",
    supportStatus: "non_numerise",
    isFreeAccess: false,
    allowPhysicalConsultation: false,
    description: "Carte géographique gravée du XVIIIe siècle représentant le Royaume de Fès et le Maroc. Document cartographique d'une grande valeur historique nécessitant des précautions particulières de manipulation.",
    summary: "Carte géographique historique du Maroc datant du XVIIIe siècle.",
    keywords: ["Cartographie ancienne", "Géographie historique", "XVIIIe siècle", "Royaume de Fès"],
    collection: "Cartes et Plans Anciens",
    language: "Français / Latin",
    physicalDescription: "1 carte : grav. col. ; 48 x 62 cm",
    noticeOrigin: "Bibliothèque Nationale du Royaume du Maroc"
  },

  // 9. Manuscrit sur MICROFILM - Archive médiévale
  {
    id: "MIC-1320-001",
    title: "Al-Muqaddima - Ibn Khaldoun (Manuscrit original)",
    titleAr: "المقدمة - ابن خلدون (مخطوط أصلي)",
    author: "Ibn Khaldoun",
    year: "1320",
    publisher: "Manuscrit médiéval",
    publishPlace: "Fès",
    pages: 378,
    cote: "091.MAR.IBN.M",
    internalId: "MIC-1320-001",
    supportType: "Microfilm",
    supportStatus: "numerise",
    isFreeAccess: false,
    allowPhysicalConsultation: false,
    description: "Manuscrit original d'Al-Muqaddima conservé sur microfilm 35mm. Ce document exceptionnel du XIVe siècle est l'un des plus importants textes de philosophie de l'histoire et de sociologie du monde arabe. Le manuscrit original étant très fragile, seul le microfilm est disponible pour consultation.",
    summary: "Manuscrit médiéval d'Ibn Khaldoun conservé sur microfilm - Document patrimonial exceptionnel.",
    tableOfContents: [
      "Introduction à la science de la civilisation",
      "Les dynasties et les royaumes",
      "L'organisation sociale et politique",
      "Les sciences et les arts",
      "La méthodologie historique"
    ],
    keywords: ["Manuscrit", "Microfilm", "Ibn Khaldoun", "Philosophie", "Histoire", "Sociologie", "Patrimoine islamique"],
    collection: "Fonds Manuscrits sur Microfilms",
    language: "Arabe classique",
    physicalDescription: "Microfilm 35mm, 4 bobines - Manuscrit original : 378 folios, calligraphie maghribine",
    noticeOrigin: "Bibliothèque Nationale du Royaume du Maroc",
    digitalLink: "https://bibliotheque-numerique-bnrm.ma/microfilms/MIC-1320-001"
  },

  // 10. Manuscrit sur MICROFILM - Collection religieuse
  {
    id: "MIC-1450-002",
    title: "Recueil de Hadiths - Manuscrit de la Qarawiyine",
    titleAr: "مجموع الأحاديث - مخطوط القرويين",
    author: "Al-Qadi Iyad",
    year: "1450",
    publisher: "Manuscrit de la Mosquée Qarawiyine",
    publishPlace: "Fès",
    pages: 524,
    cote: "091.QAR.HAD.M",
    internalId: "MIC-1450-002",
    supportType: "Microfilm",
    supportStatus: "numerise",
    isFreeAccess: false,
    allowPhysicalConsultation: false,
    description: "Recueil exceptionnel de Hadiths du XVe siècle provenant de la bibliothèque de la mosquée Qarawiyine. Conservé sur microfilm pour préserver l'original. Ce manuscrit contient des annotations rares de plusieurs savants marocains de l'époque. La qualité de la calligraphie et des enluminures en fait un document d'une valeur patrimoniale inestimable.",
    summary: "Manuscrit religieux du XVe siècle de la Qarawiyine - Conservation sur microfilm.",
    tableOfContents: [
      "Hadiths sur la foi et les croyances",
      "Hadiths sur les pratiques religieuses",
      "Hadiths sur l'éthique et la morale",
      "Commentaires des savants",
      "Index thématique"
    ],
    keywords: ["Manuscrit", "Microfilm", "Hadiths", "Islam", "Qarawiyine", "Patrimoine religieux", "Calligraphie"],
    collection: "Fonds Manuscrits Religieux sur Microfilms",
    language: "Arabe classique",
    physicalDescription: "Microfilm 35mm, 6 bobines - Manuscrit original : 524 folios, calligraphie andalouse avec enluminures",
    noticeOrigin: "Bibliothèque Nationale du Royaume du Maroc - Fonds Qarawiyine",
    digitalLink: "https://bibliotheque-numerique-bnrm.ma/microfilms/MIC-1450-002"
  }
];

// Fonction utilitaire pour récupérer un document par ID
export const getDocumentById = (id: string): MockDocument | undefined => {
  return mockDocuments.find(doc => doc.id === id);
};

// Fonction pour filtrer les documents par type de support
export const getDocumentsByType = (supportType: string): MockDocument[] => {
  return mockDocuments.filter(doc => doc.supportType === supportType);
};

// Fonction pour récupérer les documents en libre accès
export const getFreeAccessDocuments = (): MockDocument[] => {
  return mockDocuments.filter(doc => doc.isFreeAccess);
};

// Fonction pour récupérer les documents nécessitant une réservation
export const getReservableDocuments = (): MockDocument[] => {
  return mockDocuments.filter(doc => !doc.isFreeAccess);
};
