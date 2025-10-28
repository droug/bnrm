import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SystemListDefinition {
  list_code: string;
  list_name: string;
  module: string;
  form_name: string;
  field_type: string;
  description: string;
  is_hierarchical?: boolean;
  values: Array<{
    value_code: string;
    value_label: string;
    sort_order: number;
    parent_code?: string;
  }>;
}

// Définitions de toutes les listes système
const ALL_SYSTEM_LISTS: SystemListDefinition[] = [
  // ========== MONOGRAPHIES ==========
  {
    list_code: "mono_type_publication",
    list_name: "Type de publication (Monographies)",
    module: "Dépôt Légal",
    form_name: "Monographies",
    field_type: "simple",
    description: "Type de publication pour les monographies",
    values: [
      { value_code: "LIV", value_label: "Livre", sort_order: 1 },
      { value_code: "THE", value_label: "Thèse", sort_order: 2 },
      { value_code: "MEM", value_label: "Mémoire", sort_order: 3 },
      { value_code: "RAP", value_label: "Rapport", sort_order: 4 },
    ],
  },
  {
    list_code: "mono_nature_publication",
    list_name: "Nature de publication (Monographies)",
    module: "Dépôt Légal",
    form_name: "Monographies",
    field_type: "simple",
    description: "Nature de la publication pour les monographies",
    values: [
      { value_code: "initial", value_label: "Initial", sort_order: 1 },
      { value_code: "reedition", value_label: "Réédition", sort_order: 2 },
      { value_code: "nouvelle_edition", value_label: "Nouvelle édition", sort_order: 3 },
    ],
  },
  {
    list_code: "mono_type_auteur",
    list_name: "Type d'auteur (Monographies)",
    module: "Dépôt Légal",
    form_name: "Monographies",
    field_type: "simple",
    description: "Type d'auteur pour les monographies",
    values: [
      { value_code: "physique", value_label: "Personne physique", sort_order: 1 },
      { value_code: "morale", value_label: "Personne morale", sort_order: 2 },
    ],
  },
  {
    list_code: "mono_genre",
    list_name: "Genre (Monographies)",
    module: "Dépôt Légal",
    form_name: "Monographies",
    field_type: "simple",
    description: "Genre de l'auteur physique",
    values: [
      { value_code: "masculin", value_label: "Masculin", sort_order: 1 },
      { value_code: "feminin", value_label: "Féminin", sort_order: 2 },
    ],
  },
  {
    list_code: "mono_statut_auteur",
    list_name: "Statut de l'auteur (Monographies)",
    module: "Dépôt Légal",
    form_name: "Monographies",
    field_type: "simple",
    description: "Statut de l'auteur moral",
    values: [
      { value_code: "association", value_label: "Association", sort_order: 1 },
      { value_code: "entreprise", value_label: "Entreprise", sort_order: 2 },
      { value_code: "institution", value_label: "Institution publique", sort_order: 3 },
      { value_code: "ong", value_label: "ONG", sort_order: 4 },
    ],
  },

  // ========== PUBLICATIONS PÉRIODIQUES ==========
  {
    list_code: "period_type_publication",
    list_name: "Type de publication (Périodiques)",
    module: "Dépôt Légal",
    form_name: "Publications périodiques",
    field_type: "simple",
    description: "Type de publication pour les périodiques",
    values: [
      { value_code: "journal", value_label: "Journal", sort_order: 1 },
      { value_code: "revue", value_label: "Revue", sort_order: 2 },
      { value_code: "monographie_simple", value_label: "Monographie simple", sort_order: 3 },
      { value_code: "Magazine", value_label: "Magazine", sort_order: 4 },
      { value_code: "Bulletin_Officiel", value_label: "Bulletin Officiel", sort_order: 5 },
      { value_code: "Autre", value_label: "Autre", sort_order: 6 },
    ],
  },
  {
    list_code: "period_nature_publication",
    list_name: "Nature de publication (Périodiques)",
    module: "Dépôt Légal",
    form_name: "Publications périodiques",
    field_type: "simple",
    description: "Nature de la publication périodique",
    values: [
      { value_code: "etatique", value_label: "Étatique", sort_order: 1 },
      { value_code: "non-etatique", value_label: "Non étatique", sort_order: 2 },
    ],
  },
  {
    list_code: "period_type_support",
    list_name: "Type de support (Périodiques)",
    module: "Dépôt Légal",
    form_name: "Publications périodiques",
    field_type: "simple",
    description: "Type de support pour les périodiques",
    values: [
      { value_code: "printed", value_label: "Imprimé", sort_order: 1 },
      { value_code: "electronic", value_label: "Électronique", sort_order: 2 },
    ],
  },
  {
    list_code: "period_periodicite",
    list_name: "Périodicité (Périodiques)",
    module: "Dépôt Légal",
    form_name: "Publications périodiques",
    field_type: "simple",
    description: "Fréquence de parution des périodiques",
    values: [
      { value_code: "quotidien", value_label: "Quotidien", sort_order: 1 },
      { value_code: "hebdomadaire", value_label: "Hebdomadaire", sort_order: 2 },
      { value_code: "bimensuel", value_label: "Bimensuel", sort_order: 3 },
      { value_code: "mensuel", value_label: "Mensuel", sort_order: 4 },
      { value_code: "trimestriel", value_label: "Trimestriel", sort_order: 5 },
      { value_code: "semestriel", value_label: "Semestriel", sort_order: 6 },
      { value_code: "annuel", value_label: "Annuel", sort_order: 7 },
    ],
  },
  {
    list_code: "period_region",
    list_name: "Région (Périodiques)",
    module: "Dépôt Légal",
    form_name: "Publications périodiques",
    field_type: "simple",
    description: "Région du directeur de publication",
    values: [
      { value_code: "tanger_tetouan_hoceima", value_label: "Tanger-Tétouan-Al Hoceïma", sort_order: 1 },
      { value_code: "oriental", value_label: "L'Oriental", sort_order: 2 },
      { value_code: "fes_meknes", value_label: "Fès-Meknès", sort_order: 3 },
      { value_code: "rabat_sale_kenitra", value_label: "Rabat-Salé-Kénitra", sort_order: 4 },
      { value_code: "beni_mellal_khenifra", value_label: "Béni Mellal-Khénifra", sort_order: 5 },
      { value_code: "casablanca_settat", value_label: "Casablanca-Settat", sort_order: 6 },
      { value_code: "marrakech_safi", value_label: "Marrakech-Safi", sort_order: 7 },
      { value_code: "draa_tafilalet", value_label: "Drâa-Tafilalet", sort_order: 8 },
      { value_code: "souss_massa", value_label: "Souss-Massa", sort_order: 9 },
      { value_code: "guelmim_oued_noun", value_label: "Guelmim-Oued Noun", sort_order: 10 },
      { value_code: "laayoune_sakia_hamra", value_label: "Laâyoune-Sakia El Hamra", sort_order: 11 },
      { value_code: "dakhla_oued_eddahab", value_label: "Dakhla-Oued Ed-Dahab", sort_order: 12 },
    ],
  },

  // ========== BASES DE DONNÉES & LOGICIELS ==========
  {
    list_code: "bd_type_publication",
    list_name: "Type de publication (BD & Logiciels)",
    module: "Dépôt Légal",
    form_name: "BD & Logiciels",
    field_type: "simple",
    description: "Type de publication pour bases de données et logiciels",
    values: [
      { value_code: "database", value_label: "Base de données", sort_order: 1 },
      { value_code: "software", value_label: "Logiciel", sort_order: 2 },
      { value_code: "audiovisual", value_label: "Document audiovisuel", sort_order: 3 },
    ],
  },
  {
    list_code: "bd_nature_publication",
    list_name: "Nature de publication (BD & Logiciels)",
    module: "Dépôt Légal",
    form_name: "BD & Logiciels",
    field_type: "simple",
    description: "Nature de la publication numérique",
    values: [
      { value_code: "initial", value_label: "Initial", sort_order: 1 },
      { value_code: "mise_a_jour", value_label: "Mise à jour", sort_order: 2 },
      { value_code: "nouvelle_version", value_label: "Nouvelle version", sort_order: 3 },
    ],
  },
  {
    list_code: "bd_type_support",
    list_name: "Type de support (BD & Logiciels)",
    module: "Dépôt Légal",
    form_name: "BD & Logiciels",
    field_type: "simple",
    description: "Support de diffusion",
    values: [
      { value_code: "online", value_label: "En ligne", sort_order: 1 },
      { value_code: "cdrom", value_label: "CD-ROM", sort_order: 2 },
      { value_code: "dvd", value_label: "DVD", sort_order: 3 },
      { value_code: "usb", value_label: "Clé USB", sort_order: 4 },
    ],
  },

  // ========== COLLECTIONS SPÉCIALISÉES ==========
  {
    list_code: "coll_type_publication",
    list_name: "Type de publication (Collections Spécialisées)",
    module: "Dépôt Légal",
    form_name: "Collections Spécialisées",
    field_type: "simple",
    description: "Type de publication pour collections spécialisées",
    values: [
      { value_code: "carte", value_label: "Carte géographique", sort_order: 1 },
      { value_code: "partition", value_label: "Partition musicale", sort_order: 2 },
      { value_code: "affiche", value_label: "Affiche", sort_order: 3 },
      { value_code: "estampe", value_label: "Estampe", sort_order: 4 },
      { value_code: "photographie", value_label: "Photographie", sort_order: 5 },
    ],
  },
  {
    list_code: "coll_nature_support",
    list_name: "Nature du support (Collections Spécialisées)",
    module: "Dépôt Légal",
    form_name: "Collections Spécialisées",
    field_type: "simple",
    description: "Nature physique du support",
    values: [
      { value_code: "papier", value_label: "Papier", sort_order: 1 },
      { value_code: "toile", value_label: "Toile", sort_order: 2 },
      { value_code: "numerique", value_label: "Numérique", sort_order: 3 },
      { value_code: "autre", value_label: "Autre", sort_order: 4 },
    ],
  },

  // ========== LISTES COMMUNES ==========
  {
    list_code: "common_type_support",
    list_name: "Type de support (Commun)",
    module: "Dépôt Légal",
    form_name: "Commun",
    field_type: "simple",
    description: "Type de support utilisé pour tous les formulaires",
    values: [
      { value_code: "printed", value_label: "Imprimé", sort_order: 1 },
      { value_code: "electronic", value_label: "Électronique", sort_order: 2 },
      { value_code: "mixed", value_label: "Mixte", sort_order: 3 },
    ],
  },

  // ========== AUTRES MODULES ==========
  // Activités Culturelles
  {
    list_code: "cultural_event_type",
    list_name: "Type d'événement culturel",
    module: "Activités Culturelles",
    form_name: "Programmation culturelle",
    field_type: "simple",
    description: "Types d'événements culturels proposés",
    values: [
      { value_code: "conference", value_label: "Conférence", sort_order: 1 },
      { value_code: "atelier", value_label: "Atelier", sort_order: 2 },
      { value_code: "exposition", value_label: "Exposition", sort_order: 3 },
      { value_code: "spectacle", value_label: "Spectacle", sort_order: 4 },
    ],
  },
  {
    list_code: "ESPACE_CULTUREL",
    list_name: "Espaces culturels",
    module: "Activités culturelles",
    form_name: "Réservation d'espace",
    field_type: "simple",
    description: "Espaces disponibles pour réservation",
    values: [
      { value_code: "auditorium", value_label: "Auditorium", sort_order: 1 },
      { value_code: "grande_salle", value_label: "Grande salle d'exposition", sort_order: 2 },
      { value_code: "salle_seminaire", value_label: "Salle séminaire", sort_order: 3 },
      { value_code: "salle_reunion", value_label: "Salle de réunion", sort_order: 4 },
      { value_code: "salle_annexe", value_label: "Salle de l'annexe", sort_order: 5 },
    ],
  },
  
  // Bibliothèque Numérique
  {
    list_code: "document_format",
    list_name: "Format de document",
    module: "Bibliothèque Numérique",
    form_name: "Demande numérisation",
    field_type: "simple",
    description: "Formats de documents disponibles",
    values: [
      { value_code: "pdf", value_label: "PDF", sort_order: 1 },
      { value_code: "epub", value_label: "EPUB", sort_order: 2 },
      { value_code: "jpg", value_label: "Image JPEG", sort_order: 3 },
    ],
  },
  {
    list_code: "digital_library_collections",
    list_name: "Bibliothèque Numérique - Menu Collections",
    module: "digital_library",
    form_name: "",
    field_type: "simple",
    description: "Collections disponibles dans la bibliothèque numérique",
    values: [
      { value_code: "books", value_label: "Livres numériques", sort_order: 1 },
      { value_code: "periodicals", value_label: "Revues et périodiques", sort_order: 2 },
      { value_code: "manuscripts", value_label: "Manuscrits numérisés", sort_order: 3 },
      { value_code: "photos", value_label: "Photographies et cartes", sort_order: 4 },
      { value_code: "audiovisual", value_label: "Archives sonores et audiovisuelles", sort_order: 5 },
    ],
  },
  {
    list_code: "digital_library_themes",
    list_name: "Bibliothèque Numérique - Menu Thèmes",
    module: "digital_library",
    form_name: "",
    field_type: "simple",
    description: "Thèmes de navigation dans la bibliothèque numérique",
    values: [
      { value_code: "history", value_label: "Histoire & Patrimoine", sort_order: 1 },
      { value_code: "arts", value_label: "Arts & Culture", sort_order: 2 },
      { value_code: "sciences", value_label: "Sciences & Techniques", sort_order: 3 },
      { value_code: "religion", value_label: "Religion & Philosophie", sort_order: 4 },
      { value_code: "literature", value_label: "Littérature & Poésie", sort_order: 5 },
    ],
  },

  // Manuscrits
  {
    list_code: "manuscript_condition",
    list_name: "État de conservation",
    module: "Manuscrits",
    form_name: "Demande d'accès",
    field_type: "simple",
    description: "État de conservation des manuscrits",
    values: [
      { value_code: "excellent", value_label: "Excellent", sort_order: 1 },
      { value_code: "bon", value_label: "Bon", sort_order: 2 },
      { value_code: "moyen", value_label: "Moyen", sort_order: 3 },
      { value_code: "fragile", value_label: "Fragile", sort_order: 4 },
    ],
  },

  // Reproduction
  {
    list_code: "reproduction_type",
    list_name: "Type de reproduction",
    module: "Reproduction",
    form_name: "Demande reproduction",
    field_type: "simple",
    description: "Types de reproduction disponibles",
    values: [
      { value_code: "photocopy", value_label: "Photocopie", sort_order: 1 },
      { value_code: "scan", value_label: "Numérisation", sort_order: 2 },
      { value_code: "photo", value_label: "Photographie", sort_order: 3 },
    ],
  },

  // ========== DISCIPLINES (HIÉRARCHIQUE) ==========
  {
    list_code: "book_disciplines",
    list_name: "Disciplines (Hiérarchique)",
    module: "Dépôt Légal",
    form_name: "Publications périodiques et Monographies",
    field_type: "hierarchical",
    description: "Disciplines académiques organisées en catégories et sous-catégories",
    is_hierarchical: true,
    values: [
      // Sciences exactes et naturelles
      { value_code: "sciences_exactes", value_label: "Sciences exactes et naturelles", sort_order: 1 },
      { value_code: "mathematiques", value_label: "Mathématiques et statistiques", sort_order: 2, parent_code: "sciences_exactes" },
      { value_code: "physique", value_label: "Physique", sort_order: 3, parent_code: "sciences_exactes" },
      { value_code: "chimie", value_label: "Chimie", sort_order: 4, parent_code: "sciences_exactes" },
      { value_code: "sciences_vie", value_label: "Sciences de la vie (biologie, botanique, zoologie)", sort_order: 5, parent_code: "sciences_exactes" },
      { value_code: "sciences_terre", value_label: "Sciences de la terre et de l'environnement", sort_order: 6, parent_code: "sciences_exactes" },
      { value_code: "astronomie", value_label: "Astronomie", sort_order: 7, parent_code: "sciences_exactes" },

      // Sciences de l'ingénieur et technologies
      { value_code: "sciences_ingenieur", value_label: "Sciences de l'ingénieur et technologies", sort_order: 10 },
      { value_code: "informatique", value_label: "Informatique et systèmes d'information", sort_order: 11, parent_code: "sciences_ingenieur" },
      { value_code: "electronique", value_label: "Électronique et télécommunications", sort_order: 12, parent_code: "sciences_ingenieur" },
      { value_code: "genie_civil", value_label: "Génie civil et construction", sort_order: 13, parent_code: "sciences_ingenieur" },
      { value_code: "mecanique", value_label: "Mécanique et énergie", sort_order: 14, parent_code: "sciences_ingenieur" },
      { value_code: "genie_industriel", value_label: "Génie industriel et production", sort_order: 15, parent_code: "sciences_ingenieur" },
      { value_code: "tech_environnement", value_label: "Technologies de l'environnement", sort_order: 16, parent_code: "sciences_ingenieur" },

      // Sciences humaines et sociales
      { value_code: "sciences_humaines", value_label: "Sciences humaines et sociales", sort_order: 20 },
      { value_code: "philosophie", value_label: "Philosophie", sort_order: 21, parent_code: "sciences_humaines" },
      { value_code: "sociologie", value_label: "Sociologie", sort_order: 22, parent_code: "sciences_humaines" },
      { value_code: "anthropologie", value_label: "Anthropologie", sort_order: 23, parent_code: "sciences_humaines" },
      { value_code: "psychologie", value_label: "Psychologie", sort_order: 24, parent_code: "sciences_humaines" },
      { value_code: "demographie", value_label: "Démographie", sort_order: 25, parent_code: "sciences_humaines" },
      { value_code: "travail_social", value_label: "Travail social", sort_order: 26, parent_code: "sciences_humaines" },

      // Sciences juridiques et politiques
      { value_code: "sciences_juridiques", value_label: "Sciences juridiques et politiques", sort_order: 30 },
      { value_code: "droit_public", value_label: "Droit public", sort_order: 31, parent_code: "sciences_juridiques" },
      { value_code: "droit_prive", value_label: "Droit privé", sort_order: 32, parent_code: "sciences_juridiques" },
      { value_code: "sciences_politiques", value_label: "Sciences politiques", sort_order: 33, parent_code: "sciences_juridiques" },
      { value_code: "relations_internationales", value_label: "Relations internationales", sort_order: 34, parent_code: "sciences_juridiques" },
      { value_code: "administration_publique", value_label: "Administration publique", sort_order: 35, parent_code: "sciences_juridiques" },

      // Sciences économiques et gestion
      { value_code: "sciences_economiques", value_label: "Sciences économiques et gestion", sort_order: 40 },
      { value_code: "economie_generale", value_label: "Économie générale", sort_order: 41, parent_code: "sciences_economiques" },
      { value_code: "economie_developpement", value_label: "Économie du développement", sort_order: 42, parent_code: "sciences_economiques" },
      { value_code: "sciences_gestion", value_label: "Sciences de gestion", sort_order: 43, parent_code: "sciences_economiques" },
      { value_code: "finance_comptabilite", value_label: "Finance et comptabilité", sort_order: 44, parent_code: "sciences_economiques" },
      { value_code: "marketing", value_label: "Marketing", sort_order: 45, parent_code: "sciences_economiques" },
      { value_code: "entrepreneuriat", value_label: "Entrepreneuriat", sort_order: 46, parent_code: "sciences_economiques" },

      // Histoire et géographie
      { value_code: "histoire_geographie", value_label: "Histoire et géographie", sort_order: 50 },
      { value_code: "histoire_generale", value_label: "Histoire générale", sort_order: 51, parent_code: "histoire_geographie" },
      { value_code: "histoire_maroc", value_label: "Histoire du Maroc", sort_order: 52, parent_code: "histoire_geographie" },
      { value_code: "geographie_humaine", value_label: "Géographie humaine", sort_order: 53, parent_code: "histoire_geographie" },
      { value_code: "geographie_physique", value_label: "Géographie physique", sort_order: 54, parent_code: "histoire_geographie" },
      { value_code: "archeologie", value_label: "Archéologie", sort_order: 55, parent_code: "histoire_geographie" },

      // Langue et littérature
      { value_code: "langue_litterature", value_label: "Langue et littérature", sort_order: 60 },
      { value_code: "linguistique", value_label: "Linguistique générale", sort_order: 61, parent_code: "langue_litterature" },
      { value_code: "langue_arabe", value_label: "Langue arabe", sort_order: 62, parent_code: "langue_litterature" },
      { value_code: "langue_francaise", value_label: "Langue française", sort_order: 63, parent_code: "langue_litterature" },
      { value_code: "langue_anglaise", value_label: "Langue anglaise", sort_order: 64, parent_code: "langue_litterature" },
      { value_code: "litterature_comparee", value_label: "Littérature comparée", sort_order: 65, parent_code: "langue_litterature" },
      { value_code: "poesie_roman", value_label: "Poésie, roman, théâtre, critique littéraire", sort_order: 66, parent_code: "langue_litterature" },

      // Arts, culture et communication
      { value_code: "arts_culture", value_label: "Arts, culture et communication", sort_order: 70 },
      { value_code: "beaux_arts", value_label: "Beaux-arts", sort_order: 71, parent_code: "arts_culture" },
      { value_code: "musique_danse", value_label: "Musique et danse", sort_order: 72, parent_code: "arts_culture" },
      { value_code: "cinema", value_label: "Cinéma et audiovisuel", sort_order: 73, parent_code: "arts_culture" },
      { value_code: "architecture", value_label: "Architecture et design", sort_order: 74, parent_code: "arts_culture" },
      { value_code: "medias", value_label: "Médias, journalisme, communication", sort_order: 75, parent_code: "arts_culture" },
      { value_code: "patrimoine", value_label: "Patrimoine culturel", sort_order: 76, parent_code: "arts_culture" },

      // Sciences de l'éducation
      { value_code: "sciences_education", value_label: "Sciences de l'éducation", sort_order: 80 },
      { value_code: "pedagogie", value_label: "Pédagogie générale", sort_order: 81, parent_code: "sciences_education" },
      { value_code: "didactique", value_label: "Didactique des disciplines", sort_order: 82, parent_code: "sciences_education" },
      { value_code: "formation_enseignants", value_label: "Formation des enseignants", sort_order: 83, parent_code: "sciences_education" },
      { value_code: "evaluation", value_label: "Évaluation et orientation", sort_order: 84, parent_code: "sciences_education" },
      { value_code: "education_societe", value_label: "Éducation et société", sort_order: 85, parent_code: "sciences_education" },

      // Sciences de la santé
      { value_code: "sciences_sante", value_label: "Sciences de la santé", sort_order: 90 },
      { value_code: "medecine", value_label: "Médecine", sort_order: 91, parent_code: "sciences_sante" },
      { value_code: "pharmacie", value_label: "Pharmacie", sort_order: 92, parent_code: "sciences_sante" },
      { value_code: "medecine_dentaire", value_label: "Médecine dentaire", sort_order: 93, parent_code: "sciences_sante" },
      { value_code: "sciences_infirmieres", value_label: "Sciences infirmières", sort_order: 94, parent_code: "sciences_sante" },
      { value_code: "sante_publique", value_label: "Santé publique", sort_order: 95, parent_code: "sciences_sante" },

      // Sciences islamiques et études religieuses
      { value_code: "sciences_islamiques", value_label: "Sciences islamiques et études religieuses", sort_order: 100 },
      { value_code: "etudes_coraniques", value_label: "Études coraniques", sort_order: 101, parent_code: "sciences_islamiques" },
      { value_code: "hadith", value_label: "Hadith et sciences du hadith", sort_order: 102, parent_code: "sciences_islamiques" },
      { value_code: "fiqh", value_label: "Fiqh (jurisprudence islamique)", sort_order: 103, parent_code: "sciences_islamiques" },
      { value_code: "theologie", value_label: "Théologie et pensée islamique", sort_order: 104, parent_code: "sciences_islamiques" },
      { value_code: "histoire_islam", value_label: "Histoire de l'islam", sort_order: 105, parent_code: "sciences_islamiques" },
      { value_code: "etudes_religieuses", value_label: "Études religieuses comparées", sort_order: 106, parent_code: "sciences_islamiques" },

      // Ouvrages généraux et encyclopédies
      { value_code: "ouvrages_generaux", value_label: "Ouvrages généraux et encyclopédies", sort_order: 110 },
      { value_code: "encyclopedies", value_label: "Encyclopédies générales", sort_order: 111, parent_code: "ouvrages_generaux" },
      { value_code: "dictionnaires", value_label: "Dictionnaires", sort_order: 112, parent_code: "ouvrages_generaux" },
      { value_code: "bibliographies", value_label: "Bibliographies", sort_order: 113, parent_code: "ouvrages_generaux" },
      { value_code: "references", value_label: "Ouvrages de référence", sort_order: 114, parent_code: "ouvrages_generaux" },
    ],
  },
];

export const SystemListsSyncButton = () => {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      let listsCreated = 0;
      let valuesCreated = 0;

      for (const listDef of ALL_SYSTEM_LISTS) {
        // Vérifier si la liste existe déjà
        const { data: existingList } = await supabase
          .from("system_lists")
          .select("id")
          .eq("list_code", listDef.list_code)
          .single();

        let listId: string;

          if (existingList) {
          listId = existingList.id;
          
          // Mettre à jour les métadonnées de la liste
          await supabase
            .from("system_lists")
            .update({
              list_name: listDef.list_name,
              module: listDef.module,
              form_name: listDef.form_name,
              field_type: listDef.field_type,
              description: listDef.description,
              is_hierarchical: listDef.is_hierarchical || false,
            })
            .eq("id", listId);
        } else {
          // Créer la nouvelle liste
          const { data: newList, error: listError } = await supabase
            .from("system_lists")
            .insert({
              list_code: listDef.list_code,
              list_name: listDef.list_name,
              module: listDef.module,
              form_name: listDef.form_name,
              field_type: listDef.field_type,
              description: listDef.description,
              is_hierarchical: listDef.is_hierarchical || false,
            })
            .select("id")
            .single();

          if (listError) throw listError;
          listId = newList.id;
          listsCreated++;
        }

        // Synchroniser les valeurs
        for (const valueDef of listDef.values) {
          const { data: existingValue } = await supabase
            .from("system_list_values")
            .select("id")
            .eq("list_id", listId)
            .eq("value_code", valueDef.value_code)
            .single();

          if (existingValue) {
            // Mettre à jour la valeur existante
            await supabase
              .from("system_list_values")
              .update({
                value_label: valueDef.value_label,
                sort_order: valueDef.sort_order,
                parent_code: valueDef.parent_code || null,
              })
              .eq("id", existingValue.id);
          } else {
            // Créer la nouvelle valeur
            const { error: valueError } = await supabase
              .from("system_list_values")
              .insert({
                list_id: listId,
                value_code: valueDef.value_code,
                value_label: valueDef.value_label,
                sort_order: valueDef.sort_order,
                parent_code: valueDef.parent_code || null,
              });

            if (valueError) throw valueError;
            valuesCreated++;
          }
        }
      }

      toast({
        title: "✅ Synchronisation réussie",
        description: `${listsCreated} listes créées, ${valuesCreated} valeurs ajoutées`,
      });
    } catch (error: any) {
      console.error("Erreur lors de la synchronisation:", error);
      toast({
        title: "❌ Erreur de synchronisation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={syncing}
      className="w-full"
      size="lg"
    >
      <RefreshCw className={`h-5 w-5 mr-2 ${syncing ? "animate-spin" : ""}`} />
      {syncing ? "Synchronisation en cours..." : "Synchroniser toutes les listes déroulantes"}
    </Button>
  );
};
