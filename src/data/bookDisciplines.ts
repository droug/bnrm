export interface BookDiscipline {
  label: string;
  children: string[];
}

export const bookDisciplines: BookDiscipline[] = [
  {
    label: "Sciences exactes et naturelles",
    children: [
      "Mathématiques et statistiques",
      "Physique",
      "Chimie",
      "Sciences de la vie (biologie, botanique, zoologie)",
      "Sciences de la terre et de l'environnement",
      "Astronomie"
    ]
  },
  {
    label: "Sciences de l'ingénieur et technologies",
    children: [
      "Informatique et systèmes d'information",
      "Électronique et télécommunications",
      "Génie civil et construction",
      "Mécanique et énergie",
      "Génie industriel et production",
      "Technologies de l'environnement"
    ]
  },
  {
    label: "Sciences humaines et sociales",
    children: [
      "Philosophie",
      "Sociologie",
      "Anthropologie",
      "Psychologie",
      "Démographie",
      "Travail social"
    ]
  },
  {
    label: "Sciences juridiques et politiques",
    children: [
      "Droit public",
      "Droit privé",
      "Sciences politiques",
      "Relations internationales",
      "Administration publique"
    ]
  },
  {
    label: "Sciences économiques et gestion",
    children: [
      "Économie générale",
      "Économie du développement",
      "Sciences de gestion",
      "Finance et comptabilité",
      "Marketing",
      "Entrepreneuriat"
    ]
  },
  {
    label: "Histoire et géographie",
    children: [
      "Histoire générale",
      "Histoire du Maroc",
      "Géographie humaine",
      "Géographie physique",
      "Archéologie"
    ]
  },
  {
    label: "Langue et littérature",
    children: [
      "Linguistique générale",
      "Langue arabe",
      "Langue française",
      "Langue anglaise",
      "Littérature comparée",
      "Poésie, roman, théâtre, critique littéraire"
    ]
  },
  {
    label: "Arts, culture et communication",
    children: [
      "Beaux-arts",
      "Musique et danse",
      "Cinéma et audiovisuel",
      "Architecture et design",
      "Médias, journalisme, communication",
      "Patrimoine culturel"
    ]
  },
  {
    label: "Sciences de l'éducation",
    children: [
      "Pédagogie générale",
      "Didactique des disciplines",
      "Formation des enseignants",
      "Évaluation et orientation",
      "Éducation et société"
    ]
  },
  {
    label: "Sciences de la santé",
    children: [
      "Médecine",
      "Pharmacie",
      "Médecine dentaire",
      "Sciences infirmières",
      "Santé publique"
    ]
  },
  {
    label: "Sciences islamiques et études religieuses",
    children: [
      "Études coraniques",
      "Hadith et sciences du hadith",
      "Fiqh (jurisprudence islamique)",
      "Théologie et pensée islamique",
      "Histoire de l'islam",
      "Études religieuses comparées"
    ]
  },
  {
    label: "Ouvrages généraux et encyclopédies",
    children: [
      "Encyclopédies générales",
      "Dictionnaires",
      "Bibliographies",
      "Ouvrages de référence"
    ]
  }
];
