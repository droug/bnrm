import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SystemListDefinition {
  list_code: string;
  list_name: string;
  portal: string;
  platform: string;
  service: string;
  sub_service?: string;
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

// Définitions complètes de toutes les listes système avec hiérarchie
const ALL_SYSTEM_LISTS: SystemListDefinition[] = [
  // ========== DÉPÔT LÉGAL - MONOGRAPHIES ==========
  {
    list_code: "mono_type_publication",
    list_name: "Type de publication (Monographies)",
    portal: "BNRM",
    platform: "BNRM",
    service: "Dépôt Légal",
    sub_service: "Monographies",
    module: "Catalogage",
    form_name: "Fiche Monographie",
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
    portal: "BNRM",
    platform: "BNRM",
    service: "Dépôt Légal",
    sub_service: "Monographies",
    module: "Catalogage",
    form_name: "Fiche Monographie",
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
    portal: "BNRM",
    platform: "BNRM",
    service: "Dépôt Légal",
    sub_service: "Monographies",
    module: "Catalogage",
    form_name: "Fiche Monographie",
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
    portal: "BNRM",
    platform: "BNRM",
    service: "Dépôt Légal",
    sub_service: "Monographies",
    module: "Catalogage",
    form_name: "Fiche Monographie",
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
    portal: "BNRM",
    platform: "BNRM",
    service: "Dépôt Légal",
    sub_service: "Monographies",
    module: "Catalogage",
    form_name: "Fiche Monographie",
    field_type: "simple",
    description: "Statut de l'auteur moral",
    values: [
      { value_code: "association", value_label: "Association", sort_order: 1 },
      { value_code: "entreprise", value_label: "Entreprise", sort_order: 2 },
      { value_code: "institution", value_label: "Institution publique", sort_order: 3 },
      { value_code: "ong", value_label: "ONG", sort_order: 4 },
    ],
  },

  // ========== DÉPÔT LÉGAL - PUBLICATIONS PÉRIODIQUES ==========
  {
    list_code: "period_type_publication",
    list_name: "Type de publication (Périodiques)",
    portal: "BNRM",
    platform: "BNRM",
    service: "Dépôt Légal",
    sub_service: "Périodiques",
    module: "Catalogage",
    form_name: "Fiche Périodique",
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
    portal: "BNRM",
    platform: "BNRM",
    service: "Dépôt Légal",
    sub_service: "Périodiques",
    module: "Catalogage",
    form_name: "Fiche Périodique",
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
    portal: "BNRM",
    platform: "BNRM",
    service: "Dépôt Légal",
    sub_service: "Périodiques",
    module: "Catalogage",
    form_name: "Fiche Périodique",
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
    portal: "BNRM",
    platform: "BNRM",
    service: "Dépôt Légal",
    sub_service: "Périodiques",
    module: "Catalogage",
    form_name: "Fiche Périodique",
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
  
  // ========== ACTIVITÉS CULTURELLES ==========
  {
    list_code: "ESPACE_CULTUREL",
    list_name: "Espaces culturels",
    portal: "BNRM",
    platform: "BNRM",
    service: "Activités Culturelles",
    sub_service: "Réservation d'espaces",
    module: "Gestion culturelle",
    form_name: "Réservation Espace",
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
  {
    list_code: "event_type",
    list_name: "Type d'événement",
    portal: "BNRM",
    platform: "BNRM",
    service: "Activités Culturelles",
    sub_service: "Réservation d'espaces",
    module: "Gestion culturelle",
    form_name: "Réservation Espace",
    field_type: "simple",
    description: "Types d'événements culturels",
    values: [
      { value_code: "conference", value_label: "Conférence", sort_order: 1 },
      { value_code: "seminaire", value_label: "Séminaire", sort_order: 2 },
      { value_code: "exposition", value_label: "Exposition", sort_order: 3 },
      { value_code: "atelier", value_label: "Atelier", sort_order: 4 },
      { value_code: "projection", value_label: "Projection", sort_order: 5 },
      { value_code: "spectacle", value_label: "Spectacle", sort_order: 6 },
    ],
  },

  // ========== CONSULTATION & RÉSERVATION D'OUVRAGES ==========
  {
    list_code: "consultation_type",
    list_name: "Type de consultation",
    portal: "BNRM",
    platform: "BNRM",
    service: "Bibliothèque",
    sub_service: "Consultation",
    module: "Services aux lecteurs",
    form_name: "Demande Consultation",
    field_type: "simple",
    description: "Types de consultation disponibles",
    values: [
      { value_code: "sur_place", value_label: "Consultation sur place", sort_order: 1 },
      { value_code: "pret_externe", value_label: "Prêt externe", sort_order: 2 },
      { value_code: "pret_inter", value_label: "Prêt inter-bibliothèques", sort_order: 3 },
    ],
  },
  {
    list_code: "reader_category",
    list_name: "Catégorie de lecteur",
    portal: "BNRM",
    platform: "BNRM",
    service: "Bibliothèque",
    sub_service: "Consultation",
    module: "Services aux lecteurs",
    form_name: "Demande Consultation",
    field_type: "simple",
    description: "Catégories de lecteurs",
    values: [
      { value_code: "etudiant", value_label: "Étudiant", sort_order: 1 },
      { value_code: "chercheur", value_label: "Chercheur", sort_order: 2 },
      { value_code: "enseignant", value_label: "Enseignant", sort_order: 3 },
      { value_code: "professionnel", value_label: "Professionnel", sort_order: 4 },
      { value_code: "grand_public", value_label: "Grand public", sort_order: 5 },
    ],
  },
  {
    list_code: "reservation_status",
    list_name: "Statut de réservation",
    portal: "BNRM",
    platform: "BNRM",
    service: "Bibliothèque",
    sub_service: "Consultation",
    module: "Services aux lecteurs",
    form_name: "Demande Consultation",
    field_type: "simple",
    description: "Statuts des réservations d'ouvrages",
    values: [
      { value_code: "en_attente", value_label: "En attente", sort_order: 1 },
      { value_code: "approuvee", value_label: "Approuvée", sort_order: 2 },
      { value_code: "prete", value_label: "Prêté", sort_order: 3 },
      { value_code: "retourne", value_label: "Retourné", sort_order: 4 },
      { value_code: "annulee", value_label: "Annulée", sort_order: 5 },
    ],
  },
  {
    list_code: "reading_room",
    list_name: "Salle de lecture",
    portal: "BNRM",
    platform: "BNRM",
    service: "Bibliothèque",
    sub_service: "Consultation",
    module: "Services aux lecteurs",
    form_name: "Demande Consultation",
    field_type: "simple",
    description: "Salles de lecture disponibles",
    values: [
      { value_code: "generale", value_label: "Salle de lecture générale", sort_order: 1 },
      { value_code: "manuscrits", value_label: "Salle des manuscrits", sort_order: 2 },
      { value_code: "periodiques", value_label: "Salle des périodiques", sort_order: 3 },
      { value_code: "multimedia", value_label: "Salle multimédia", sort_order: 4 },
      { value_code: "chercheurs", value_label: "Salle des chercheurs", sort_order: 5 },
    ],
  },

  // ========== PROFESSIONNELS ==========
  {
    list_code: "author_literary_genre",
    list_name: "Genre littéraire",
    portal: "BNRM",
    platform: "BNRM",
    service: "Dépôt Légal",
    sub_service: "Auteurs",
    module: "Gestion professionnels",
    form_name: "Inscription Auteur",
    field_type: "simple",
    description: "Genres littéraires pour les auteurs",
    values: [
      { value_code: "roman", value_label: "Roman", sort_order: 1 },
      { value_code: "poesie", value_label: "Poésie", sort_order: 2 },
      { value_code: "nouvelles", value_label: "Nouvelles", sort_order: 3 },
      { value_code: "essai", value_label: "Essai", sort_order: 4 },
      { value_code: "theatre", value_label: "Théâtre", sort_order: 5 },
      { value_code: "jeunesse", value_label: "Littérature jeunesse", sort_order: 6 },
      { value_code: "biographie", value_label: "Biographie", sort_order: 7 },
      { value_code: "autres", value_label: "Autres", sort_order: 8 },
    ],
  },
  {
    list_code: "author_publishing_goals",
    list_name: "Objectifs de publication",
    portal: "BNRM",
    platform: "BNRM",
    service: "Dépôt Légal",
    sub_service: "Auteurs",
    module: "Gestion professionnels",
    form_name: "Inscription Auteur",
    field_type: "simple",
    description: "Objectifs de publication des auteurs",
    values: [
      { value_code: "premier-livre", value_label: "Mon premier livre", sort_order: 1 },
      { value_code: "nouveau-livre", value_label: "Un nouveau livre", sort_order: 2 },
      { value_code: "reedition", value_label: "Réédition d'une œuvre", sort_order: 3 },
      { value_code: "collection", value_label: "Une collection d'œuvres", sort_order: 4 },
    ],
  },
  {
    list_code: "professional_legal_status",
    list_name: "Statut juridique",
    portal: "BNRM",
    platform: "BNRM",
    service: "Dépôt Légal",
    sub_service: "Éditeurs/Distributeurs",
    module: "Gestion professionnels",
    form_name: "Inscription Professionnel",
    field_type: "simple",
    description: "Statuts juridiques des entreprises",
    values: [
      { value_code: "sarl", value_label: "SARL", sort_order: 1 },
      { value_code: "sa", value_label: "SA", sort_order: 2 },
      { value_code: "sas", value_label: "SAS", sort_order: 3 },
      { value_code: "eurl", value_label: "EURL", sort_order: 4 },
      { value_code: "entreprise-individuelle", value_label: "Entreprise individuelle", sort_order: 5 },
    ],
  },
  {
    list_code: "distribution_scope",
    list_name: "Périmètre de distribution",
    portal: "BNRM",
    platform: "BNRM",
    service: "Dépôt Légal",
    sub_service: "Distributeurs",
    module: "Gestion professionnels",
    form_name: "Inscription Distributeur",
    field_type: "simple",
    description: "Périmètres géographiques de distribution",
    values: [
      { value_code: "national", value_label: "National", sort_order: 1 },
      { value_code: "regional", value_label: "Régional", sort_order: 2 },
      { value_code: "local", value_label: "Local", sort_order: 3 },
      { value_code: "international", value_label: "International", sort_order: 4 },
    ],
  },
  {
    list_code: "stock_volume",
    list_name: "Volume de stock",
    portal: "BNRM",
    platform: "BNRM",
    service: "Dépôt Légal",
    sub_service: "Distributeurs",
    module: "Gestion professionnels",
    form_name: "Inscription Distributeur",
    field_type: "simple",
    description: "Volumes de stock des distributeurs",
    values: [
      { value_code: "moins-1000", value_label: "Moins de 1 000 ouvrages", sort_order: 1 },
      { value_code: "1000-5000", value_label: "1 000 - 5 000 ouvrages", sort_order: 2 },
      { value_code: "5000-20000", value_label: "5 000 - 20 000 ouvrages", sort_order: 3 },
      { value_code: "plus-20000", value_label: "Plus de 20 000 ouvrages", sort_order: 4 },
    ],
  },
  {
    list_code: "professional_experience",
    list_name: "Expérience professionnelle",
    portal: "BNRM",
    platform: "BNRM",
    service: "Dépôt Légal",
    sub_service: "Éditeurs/Distributeurs",
    module: "Gestion professionnels",
    form_name: "Inscription Professionnel",
    field_type: "simple",
    description: "Années d'expérience professionnelle",
    values: [
      { value_code: "debutant", value_label: "Moins de 2 ans", sort_order: 1 },
      { value_code: "intermediaire", value_label: "2 - 5 ans", sort_order: 2 },
      { value_code: "experimente", value_label: "5 - 10 ans", sort_order: 3 },
      { value_code: "expert", value_label: "Plus de 10 ans", sort_order: 4 },
    ],
  },

  // ========== RÉGIONS DU MAROC (COMMUN) ==========
  {
    list_code: "morocco_regions",
    list_name: "Régions du Maroc",
    portal: "BNRM",
    platform: "BNRM",
    service: "Données communes",
    module: "Référentiels",
    form_name: "Tous formulaires",
    field_type: "simple",
    description: "Liste des régions administratives du Maroc",
    values: [
      { value_code: "tanger-tetouan-alhoceima", value_label: "Tanger-Tétouan-Al Hoceïma", sort_order: 1 },
      { value_code: "oriental", value_label: "Oriental", sort_order: 2 },
      { value_code: "fes-meknes", value_label: "Fès-Meknès", sort_order: 3 },
      { value_code: "rabat-sale-kenitra", value_label: "Rabat-Salé-Kénitra", sort_order: 4 },
      { value_code: "beni-mellal-khenifra", value_label: "Béni Mellal-Khénifra", sort_order: 5 },
      { value_code: "casablanca-settat", value_label: "Casablanca-Settat", sort_order: 6 },
      { value_code: "marrakech-safi", value_label: "Marrakech-Safi", sort_order: 7 },
      { value_code: "draa-tafilalet", value_label: "Drâa-Tafilalet", sort_order: 8 },
      { value_code: "souss-massa", value_label: "Souss-Massa", sort_order: 9 },
      { value_code: "guelmim-oued-noun", value_label: "Guelmim-Oued Noun", sort_order: 10 },
      { value_code: "laayoune-sakia-elhamra", value_label: "Laâyoune-Sakia El Hamra", sort_order: 11 },
      { value_code: "dakhla-oued-eddahab", value_label: "Dakhla-Oued Ed-Dahab", sort_order: 12 },
    ],
  },

  // ========== DÉPÔT LÉGAL - GESTION ==========
  {
    list_code: "deposit_party_roles",
    list_name: "Rôles des parties",
    portal: "BNRM",
    platform: "BNRM",
    service: "Dépôt Légal",
    sub_service: "Gestion des dépôts",
    module: "Gestion administrative",
    form_name: "Gestion Parties",
    field_type: "simple",
    description: "Rôles des parties dans le dépôt légal",
    values: [
      { value_code: "editor", value_label: "Éditeur", sort_order: 1 },
      { value_code: "printer", value_label: "Imprimeur", sort_order: 2 },
      { value_code: "producer", value_label: "Producteur", sort_order: 3 },
    ],
  },
  {
    list_code: "committee_roles",
    list_name: "Rôles du comité",
    portal: "BNRM",
    platform: "BNRM",
    service: "Dépôt Légal",
    sub_service: "Gestion des dépôts",
    module: "Gestion administrative",
    form_name: "Comité Validation",
    field_type: "simple",
    description: "Rôles des membres du comité de validation",
    values: [
      { value_code: "president", value_label: "Président", sort_order: 1 },
      { value_code: "secretary", value_label: "Secrétaire", sort_order: 2 },
      { value_code: "member", value_label: "Membre", sort_order: 3 },
    ],
  },
  {
    list_code: "issn_status",
    list_name: "Statuts ISSN",
    portal: "BNRM",
    platform: "BNRM",
    service: "Dépôt Légal",
    sub_service: "Gestion ISSN",
    module: "Gestion administrative",
    form_name: "Demande ISSN",
    field_type: "simple",
    description: "Statuts des demandes ISSN",
    values: [
      { value_code: "all", value_label: "Tous les statuts", sort_order: 0 },
      { value_code: "en_attente", value_label: "En attente", sort_order: 1 },
      { value_code: "validee", value_label: "Validée", sort_order: 2 },
      { value_code: "refusee", value_label: "Refusée", sort_order: 3 },
    ],
  },
  {
    list_code: "issn_support_type",
    list_name: "Types de support ISSN",
    portal: "BNRM",
    platform: "BNRM",
    service: "Dépôt Légal",
    sub_service: "Gestion ISSN",
    module: "Gestion administrative",
    form_name: "Demande ISSN",
    field_type: "simple",
    description: "Types de support pour les demandes ISSN",
    values: [
      { value_code: "all", value_label: "Tous les supports", sort_order: 0 },
      { value_code: "papier", value_label: "Papier", sort_order: 1 },
      { value_code: "en_ligne", value_label: "En ligne", sort_order: 2 },
      { value_code: "mixte", value_label: "Mixte", sort_order: 3 },
    ],
  },
  {
    list_code: "reserved_ranges_deposit_type",
    list_name: "Types de dépôt (plages réservées)",
    portal: "BNRM",
    platform: "BNRM",
    service: "Dépôt Légal",
    sub_service: "Gestion numéros",
    module: "Gestion administrative",
    form_name: "Plages Réservées",
    field_type: "simple",
    description: "Types de dépôt pour les plages de numéros réservées",
    values: [
      { value_code: "monographie", value_label: "Monographie", sort_order: 1 },
      { value_code: "periodique", value_label: "Publication périodique", sort_order: 2 },
      { value_code: "non-livre", value_label: "Non-livre", sort_order: 3 },
      { value_code: "numerique", value_label: "Numérique", sort_order: 4 },
    ],
  },
  {
    list_code: "reserved_ranges_number_type",
    list_name: "Types de numéro (plages réservées)",
    portal: "BNRM",
    platform: "BNRM",
    service: "Dépôt Légal",
    sub_service: "Gestion numéros",
    module: "Gestion administrative",
    form_name: "Plages Réservées",
    field_type: "simple",
    description: "Types de numéro pour les plages réservées",
    values: [
      { value_code: "isbn", value_label: "ISBN", sort_order: 1 },
      { value_code: "issn", value_label: "ISSN", sort_order: 2 },
      { value_code: "dl", value_label: "Dépôt Légal", sort_order: 3 },
    ],
  },

  // ========== REPRODUCTION ==========
  {
    list_code: "reproduction_type",
    list_name: "Type de reproduction",
    portal: "BNRM",
    platform: "BNRM",
    service: "Reproduction",
    sub_service: "Demandes",
    module: "Services techniques",
    form_name: "Demande Reproduction",
    field_type: "simple",
    description: "Types de reproduction disponibles",
    values: [
      { value_code: "papier", value_label: "Tirage papier", sort_order: 1 },
      { value_code: "numerique", value_label: "Numérique", sort_order: 2 },
      { value_code: "microfilm", value_label: "Duplicata Microfilm", sort_order: 3 },
    ],
  },
  {
    list_code: "reproduction_format",
    list_name: "Format de reproduction",
    portal: "BNRM",
    platform: "BNRM",
    service: "Reproduction",
    sub_service: "Demandes",
    module: "Services techniques",
    form_name: "Demande Reproduction",
    field_type: "simple",
    description: "Formats de reproduction disponibles",
    values: [
      { value_code: "a4", value_label: "Format A4", sort_order: 1 },
      { value_code: "a3", value_label: "Format A3", sort_order: 2 },
      { value_code: "couleur", value_label: "Couleur", sort_order: 3 },
      { value_code: "noir_blanc", value_label: "Noir et blanc", sort_order: 4 },
    ],
  },
  {
    list_code: "reproduction_quality",
    list_name: "Qualité de reproduction",
    portal: "BNRM",
    platform: "BNRM",
    service: "Reproduction",
    sub_service: "Demandes",
    module: "Services techniques",
    form_name: "Demande Reproduction",
    field_type: "simple",
    description: "Niveaux de qualité pour la reproduction",
    values: [
      { value_code: "standard", value_label: "Standard", sort_order: 1 },
      { value_code: "haute", value_label: "Haute qualité", sort_order: 2 },
      { value_code: "archivage", value_label: "Qualité archivage", sort_order: 3 },
    ],
  },

  // ========== RESTAURATION ==========
  {
    list_code: "restoration_type",
    list_name: "Type de restauration",
    portal: "BNRM",
    platform: "BNRM",
    service: "Conservation",
    sub_service: "Restauration",
    module: "Services techniques",
    form_name: "Demande Restauration",
    field_type: "simple",
    description: "Types d'interventions de restauration",
    values: [
      { value_code: "nettoyage", value_label: "Nettoyage", sort_order: 1 },
      { value_code: "consolidation", value_label: "Consolidation", sort_order: 2 },
      { value_code: "reliure", value_label: "Réparation reliure", sort_order: 3 },
      { value_code: "desacidification", value_label: "Désacidification", sort_order: 4 },
      { value_code: "restauration_complete", value_label: "Restauration complète", sort_order: 5 },
    ],
  },
  {
    list_code: "restoration_urgency",
    list_name: "Urgence de restauration",
    portal: "BNRM",
    platform: "BNRM",
    service: "Conservation",
    sub_service: "Restauration",
    module: "Services techniques",
    form_name: "Demande Restauration",
    field_type: "simple",
    description: "Niveaux d'urgence pour les restaurations",
    values: [
      { value_code: "critique", value_label: "Critique (< 1 mois)", sort_order: 1 },
      { value_code: "urgent", value_label: "Urgent (< 3 mois)", sort_order: 2 },
      { value_code: "normal", value_label: "Normal (< 6 mois)", sort_order: 3 },
      { value_code: "planifie", value_label: "Planifié (> 6 mois)", sort_order: 4 },
    ],
  },
  {
    list_code: "document_damage_type",
    list_name: "Type de dégradation",
    portal: "BNRM",
    platform: "BNRM",
    service: "Conservation",
    sub_service: "Restauration",
    module: "Services techniques",
    form_name: "Demande Restauration",
    field_type: "simple",
    description: "Types de dégradations des documents",
    values: [
      { value_code: "dechirure", value_label: "Déchirures", sort_order: 1 },
      { value_code: "taches", value_label: "Taches", sort_order: 2 },
      { value_code: "moisissure", value_label: "Moisissures", sort_order: 3 },
      { value_code: "acidification", value_label: "Acidification", sort_order: 4 },
      { value_code: "reliure_endommagee", value_label: "Reliure endommagée", sort_order: 5 },
      { value_code: "pages_manquantes", value_label: "Pages manquantes", sort_order: 6 },
    ],
  },

  // ========== BIBLIOTHÈQUE NUMÉRIQUE ==========
  {
    list_code: "document_format",
    list_name: "Format de document",
    portal: "BNRM",
    platform: "BNRM",
    service: "Bibliothèque Numérique",
    sub_service: "Numérisation",
    module: "Services techniques",
    form_name: "Demande Numérisation",
    field_type: "simple",
    description: "Formats de documents disponibles",
    values: [
      { value_code: "pdf", value_label: "PDF", sort_order: 1 },
      { value_code: "epub", value_label: "EPUB", sort_order: 2 },
      { value_code: "jpg", value_label: "Image JPEG", sort_order: 3 },
      { value_code: "tiff", value_label: "TIFF", sort_order: 4 },
    ],
  },
  {
    list_code: "digitization_resolution",
    list_name: "Résolution de numérisation",
    portal: "BNRM",
    platform: "BNRM",
    service: "Bibliothèque Numérique",
    sub_service: "Numérisation",
    module: "Services techniques",
    form_name: "Demande Numérisation",
    field_type: "simple",
    description: "Résolutions de numérisation disponibles",
    values: [
      { value_code: "300dpi", value_label: "300 DPI (Standard)", sort_order: 1 },
      { value_code: "600dpi", value_label: "600 DPI (Haute qualité)", sort_order: 2 },
      { value_code: "1200dpi", value_label: "1200 DPI (Archive)", sort_order: 3 },
    ],
  },
  {
    list_code: "access_rights",
    list_name: "Droits d'accès",
    portal: "BNRM",
    platform: "BNRM",
    service: "Bibliothèque Numérique",
    sub_service: "Gestion des accès",
    module: "Services techniques",
    form_name: "Paramètres Document",
    field_type: "simple",
    description: "Niveaux de droits d'accès aux documents numériques",
    values: [
      { value_code: "public", value_label: "Public", sort_order: 1 },
      { value_code: "restreint", value_label: "Accès restreint", sort_order: 2 },
      { value_code: "sur_demande", value_label: "Sur demande", sort_order: 3 },
      { value_code: "interne", value_label: "Usage interne uniquement", sort_order: 4 },
    ],
  },

  // ========== MANUSCRITS ==========
  {
    list_code: "manuscript_condition",
    list_name: "État de conservation",
    portal: "BNRM",
    platform: "BNRM",
    service: "Manuscrits",
    sub_service: "Consultation",
    module: "Collections spéciales",
    form_name: "Demande Accès Manuscrit",
    field_type: "simple",
    description: "État de conservation des manuscrits",
    values: [
      { value_code: "excellent", value_label: "Excellent", sort_order: 1 },
      { value_code: "bon", value_label: "Bon", sort_order: 2 },
      { value_code: "moyen", value_label: "Moyen", sort_order: 3 },
      { value_code: "fragile", value_label: "Fragile", sort_order: 4 },
    ],
  },

  {
    list_code: "manuscript_language",
    list_name: "Langue du manuscrit",
    portal: "BNRM",
    platform: "BNRM",
    service: "Manuscrits",
    sub_service: "Consultation",
    module: "Collections spéciales",
    form_name: "Demande Accès Manuscrit",
    field_type: "simple",
    description: "Langues des manuscrits",
    values: [
      { value_code: "arabe", value_label: "Arabe", sort_order: 1 },
      { value_code: "amazigh", value_label: "Amazigh", sort_order: 2 },
      { value_code: "francais", value_label: "Français", sort_order: 3 },
      { value_code: "espagnol", value_label: "Espagnol", sort_order: 4 },
      { value_code: "hebreu", value_label: "Hébreu", sort_order: 5 },
      { value_code: "autre", value_label: "Autre", sort_order: 6 },
    ],
  },
  {
    list_code: "manuscript_access_purpose",
    list_name: "Objet de consultation",
    portal: "BNRM",
    platform: "BNRM",
    service: "Manuscrits",
    sub_service: "Consultation",
    module: "Collections spéciales",
    form_name: "Demande Accès Manuscrit",
    field_type: "simple",
    description: "Objectifs de consultation des manuscrits",
    values: [
      { value_code: "recherche", value_label: "Recherche universitaire", sort_order: 1 },
      { value_code: "edition", value_label: "Édition scientifique", sort_order: 2 },
      { value_code: "expertise", value_label: "Expertise", sort_order: 3 },
      { value_code: "consultation_personnelle", value_label: "Consultation personnelle", sort_order: 4 },
    ],
  },

  // ========== DISCIPLINES (HIÉRARCHIQUE) ==========
  {
    list_code: "book_disciplines",
    list_name: "Disciplines (Hiérarchique)",
    portal: "BNRM",
    platform: "BNRM",
    service: "Dépôt Légal",
    sub_service: "Catalogage",
    module: "Catalogage",
    form_name: "Fiche Publication",
    field_type: "auto_select",
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

      // Sciences islamiques
      { value_code: "sciences_islamiques", value_label: "Sciences islamiques et études religieuses", sort_order: 100 },
      { value_code: "coran", value_label: "Coran et exégèse", sort_order: 101, parent_code: "sciences_islamiques" },
      { value_code: "hadith", value_label: "Hadith", sort_order: 102, parent_code: "sciences_islamiques" },
      { value_code: "fiqh", value_label: "Fiqh (Jurisprudence islamique)", sort_order: 103, parent_code: "sciences_islamiques" },
      { value_code: "theologie", value_label: "Théologie (Aqida)", sort_order: 104, parent_code: "sciences_islamiques" },
      { value_code: "histoire_islam", value_label: "Histoire de l'Islam", sort_order: 105, parent_code: "sciences_islamiques" },
      { value_code: "etudes_comparees", value_label: "Études religieuses comparées", sort_order: 106, parent_code: "sciences_islamiques" },

      // Agriculture et sciences vétérinaires
      { value_code: "agriculture", value_label: "Agriculture et sciences vétérinaires", sort_order: 110 },
      { value_code: "agronomie", value_label: "Agronomie", sort_order: 111, parent_code: "agriculture" },
      { value_code: "elevage", value_label: "Élevage et zootechnie", sort_order: 112, parent_code: "agriculture" },
      { value_code: "veterinaire", value_label: "Médecine vétérinaire", sort_order: 113, parent_code: "agriculture" },
      { value_code: "foresterie", value_label: "Foresterie et environnement", sort_order: 114, parent_code: "agriculture" },
      { value_code: "agroalimentaire", value_label: "Technologies agroalimentaires", sort_order: 115, parent_code: "agriculture" },
    ],
  },
];

export const SystemListsSyncButton = () => {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    setSyncing(true);
    try {
      let syncedCount = 0;
      let updatedCount = 0;
      let errorsCount = 0;

      for (const listDef of ALL_SYSTEM_LISTS) {
        try {
          // Vérifier si la liste existe déjà
          const { data: existingList, error: fetchError } = await supabase
            .from('system_lists')
            .select('id, is_hierarchical')
            .eq('list_code', listDef.list_code)
            .maybeSingle();

          if (fetchError) throw fetchError;

          let listId: string;

          if (!existingList) {
            // Créer la liste
            const { data: newList, error: insertError } = await supabase
              .from('system_lists')
              .insert({
                list_code: listDef.list_code,
                list_name: listDef.list_name,
                portal: listDef.portal,
                platform: listDef.platform,
                service: listDef.service,
                sub_service: listDef.sub_service,
                module: listDef.module,
                form_name: listDef.form_name,
                field_type: listDef.field_type,
                description: listDef.description,
                is_hierarchical: listDef.is_hierarchical || false,
                is_active: true,
              })
              .select('id')
              .single();

            if (insertError) throw insertError;
            listId = newList.id;
            syncedCount++;
          } else {
            listId = existingList.id;
            
            // Mettre à jour les informations de la liste avec la hiérarchie
            const { error: updateError } = await supabase
              .from('system_lists')
              .update({
                list_name: listDef.list_name,
                portal: listDef.portal,
                platform: listDef.platform,
                service: listDef.service,
                sub_service: listDef.sub_service,
                module: listDef.module,
                form_name: listDef.form_name,
                description: listDef.description,
              })
              .eq('id', listId);

            if (updateError) throw updateError;
            updatedCount++;
          }

          // Gérer les valeurs de la liste
          for (const value of listDef.values) {
            // Gérer parent_value_id si c'est une liste hiérarchique
            let parent_value_id: string | null = null;
            if (value.parent_code && listDef.is_hierarchical) {
              const { data: parentValue } = await supabase
                .from('system_list_values')
                .select('id')
                .eq('list_id', listId)
                .eq('value_code', value.parent_code)
                .maybeSingle();

              if (parentValue) {
                parent_value_id = parentValue.id;
              }
            }

            // Vérifier si la valeur existe
            const { data: existingValue } = await supabase
              .from('system_list_values')
              .select('id')
              .eq('list_id', listId)
              .eq('value_code', value.value_code)
              .maybeSingle();

            if (!existingValue) {
              // Insérer la valeur
              const { error: valueError } = await supabase
                .from('system_list_values')
                .insert({
                  list_id: listId,
                  value_code: value.value_code,
                  value_label: value.value_label,
                  sort_order: value.sort_order,
                  parent_value_id: parent_value_id,
                  is_active: true,
                });

              if (valueError) throw valueError;
            } else {
              // Mettre à jour la valeur existante
              const { error: updateValueError } = await supabase
                .from('system_list_values')
                .update({
                  value_label: value.value_label,
                  sort_order: value.sort_order,
                  parent_value_id: parent_value_id,
                  is_active: true,
                })
                .eq('id', existingValue.id);

              if (updateValueError) throw updateValueError;
            }
          }
        } catch (error: any) {
          console.error(`Erreur pour la liste ${listDef.list_code}:`, error);
          errorsCount++;
        }
      }

      toast({
        title: "✅ Synchronisation terminée",
        description: `${syncedCount} listes créées, ${updatedCount} mises à jour. ${errorsCount > 0 ? `${errorsCount} erreurs.` : ''}`,
      });
    } catch (error: any) {
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
    <Button onClick={handleSync} disabled={syncing} className="w-full">
      {syncing ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Synchronisation en cours...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Synchroniser toutes les listes système
        </>
      )}
    </Button>
  );
};
