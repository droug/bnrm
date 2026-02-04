import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Icon } from "@/components/ui/icon";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Upload, Check, Library, Layers, Settings2, FileJson, ExternalLink, Package, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Icon library registry with installation status tracking
interface IconLibraryDefinition {
  id: string;
  name: string;
  prefix: string;
  description: string;
  iconCount: number;
  website: string;
  cdnUrl?: string;
  isBuiltIn: boolean;
  categories: Record<string, string[]>;
}

// Built-in icon libraries (always available)
const builtInLibraries: Record<string, IconLibraryDefinition> = {
  mdi: {
    id: "mdi",
    name: "Material Design Icons",
    prefix: "mdi:",
    description: "7000+ icônes Material Design - Préinstallée",
    iconCount: 7000,
    website: "https://pictogrammers.com/library/mdi/",
    isBuiltIn: true,
    categories: {
      "Bibliothèque & Documents": [
        "mdi:library",
        "mdi:book-open-page-variant-outline",
        "mdi:book-multiple",
        "mdi:book-outline",
        "mdi:bookshelf",
        "mdi:file-document-outline",
        "mdi:file-multiple-outline",
        "mdi:folder-outline",
        "mdi:folder-open-outline",
        "mdi:archive-outline",
        "mdi:script-text-outline",
        "mdi:scroll-text-outline",
        "mdi:text-box-outline",
        "mdi:newspaper-variant-outline",
        "mdi:note-text-outline",
      ],
      "Grilles & Tableaux": [
        "mdi:select-multiple",
        "mdi:table-large-plus",
        "mdi:view-grid-outline",
        "mdi:grid",
        "mdi:table-large",
        "mdi:view-module-outline",
        "mdi:view-dashboard-outline",
        "mdi:view-list-outline",
        "mdi:view-grid-plus-outline",
        "mdi:table-of-contents",
        "mdi:format-list-bulleted",
        "mdi:format-list-numbered",
        "mdi:apps",
      ],
      "Statistiques & Graphiques": [
        "mdi:chart-box-outline",
        "mdi:chart-bar",
        "mdi:chart-line",
        "mdi:chart-pie",
        "mdi:chart-areaspline",
        "mdi:finance",
        "mdi:poll",
        "mdi:trending-up",
        "mdi:trending-down",
        "mdi:percent-outline",
        "mdi:counter",
      ],
      "Médias": [
        "mdi:video-box",
        "mdi:video-outline",
        "mdi:image-outline",
        "mdi:image-multiple-outline",
        "mdi:camera-outline",
        "mdi:movie-outline",
        "mdi:music-note-outline",
        "mdi:microphone-outline",
        "mdi:headphones",
        "mdi:play-circle-outline",
        "mdi:youtube",
        "mdi:multimedia",
      ],
      "Navigation": [
        "mdi:home-outline",
        "mdi:arrow-left",
        "mdi:arrow-right",
        "mdi:arrow-up",
        "mdi:arrow-down",
        "mdi:chevron-left",
        "mdi:chevron-right",
        "mdi:chevron-up",
        "mdi:chevron-down",
        "mdi:menu",
        "mdi:dots-horizontal",
        "mdi:dots-vertical",
        "mdi:open-in-new",
        "mdi:link-variant",
        "mdi:compass-outline",
        "mdi:map-marker-outline",
      ],
      "Actions": [
        "mdi:plus",
        "mdi:minus",
        "mdi:close",
        "mdi:check",
        "mdi:pencil-outline",
        "mdi:delete-outline",
        "mdi:content-save-outline",
        "mdi:download",
        "mdi:upload",
        "mdi:refresh",
        "mdi:magnify",
        "mdi:filter-outline",
        "mdi:sort",
        "mdi:share-variant-outline",
        "mdi:content-copy",
        "mdi:eye-outline",
        "mdi:eye-off-outline",
      ],
      "Utilisateurs & Sécurité": [
        "mdi:account-outline",
        "mdi:account-group-outline",
        "mdi:account-circle-outline",
        "mdi:account-plus-outline",
        "mdi:account-check-outline",
        "mdi:login",
        "mdi:logout",
        "mdi:lock-outline",
        "mdi:lock-open-outline",
        "mdi:shield-outline",
        "mdi:shield-check-outline",
        "mdi:key-outline",
      ],
      "Communication": [
        "mdi:email-outline",
        "mdi:message-outline",
        "mdi:phone-outline",
        "mdi:bell-outline",
        "mdi:comment-outline",
        "mdi:chat-outline",
        "mdi:send-outline",
        "mdi:bullhorn-outline",
      ],
      "Événements & Calendrier": [
        "mdi:calendar-outline",
        "mdi:calendar-month-outline",
        "mdi:calendar-today-outline",
        "mdi:calendar-range-outline",
        "mdi:calendar-clock-outline",
        "mdi:clock-outline",
        "mdi:timer-outline",
        "mdi:history",
      ],
      "Design & Style": [
        "mdi:palette-outline",
        "mdi:format-text",
        "mdi:format-bold",
        "mdi:format-italic",
        "mdi:brush-outline",
        "mdi:pencil-ruler",
        "mdi:shape-outline",
        "mdi:circle-outline",
        "mdi:square-outline",
        "mdi:star-outline",
        "mdi:heart-outline",
        "mdi:bookmark-outline",
      ],
      "État & Feedback": [
        "mdi:information-outline",
        "mdi:alert-outline",
        "mdi:alert-circle-outline",
        "mdi:check-circle-outline",
        "mdi:help-circle-outline",
        "mdi:lightbulb-outline",
        "mdi:flash-outline",
        "mdi:flag-outline",
        "mdi:trophy-outline",
        "mdi:medal-outline",
      ],
      "Technologies": [
        "mdi:earth",
        "mdi:web",
        "mdi:database-outline",
        "mdi:server-outline",
        "mdi:cloud-outline",
        "mdi:cog-outline",
        "mdi:wrench-outline",
        "mdi:code-tags",
        "mdi:cellphone",
        "mdi:laptop",
        "mdi:printer-outline",
        "mdi:qrcode",
      ],
      "Institutions": [
        "mdi:domain",
        "mdi:office-building-outline",
        "mdi:school-outline",
        "mdi:bank-outline",
        "mdi:castle",
        "mdi:mosque",
        "mdi:town-hall",
        "mdi:account-tie-outline",
      ],
    }
  },
};

// Downloadable icon libraries
const downloadableLibraries: Record<string, Omit<IconLibraryDefinition, 'categories'> & { categories?: Record<string, string[]> }> = {
  lucide: {
    id: "lucide",
    name: "Lucide Icons",
    prefix: "lucide:",
    description: "1000+ icônes open source élégantes et cohérentes",
    iconCount: 1000,
    website: "https://lucide.dev/",
    cdnUrl: "https://api.iconify.design/lucide.json",
    isBuiltIn: false,
    categories: {
      "Documents": [
        "lucide:file",
        "lucide:file-text",
        "lucide:folder",
        "lucide:book",
        "lucide:book-open",
        "lucide:library",
        "lucide:newspaper",
        "lucide:scroll",
        "lucide:file-plus",
        "lucide:folder-open",
        "lucide:archive",
        "lucide:clipboard",
      ],
      "Interface": [
        "lucide:home",
        "lucide:menu",
        "lucide:search",
        "lucide:settings",
        "lucide:plus",
        "lucide:minus",
        "lucide:x",
        "lucide:check",
        "lucide:chevron-left",
        "lucide:chevron-right",
        "lucide:arrow-left",
        "lucide:arrow-right",
        "lucide:layout-grid",
        "lucide:layout-list",
      ],
      "Médias": [
        "lucide:image",
        "lucide:video",
        "lucide:camera",
        "lucide:music",
        "lucide:play",
        "lucide:pause",
        "lucide:volume-2",
        "lucide:mic",
        "lucide:headphones",
      ],
      "Utilisateurs": [
        "lucide:user",
        "lucide:users",
        "lucide:user-plus",
        "lucide:shield",
        "lucide:lock",
        "lucide:key",
        "lucide:log-in",
        "lucide:log-out",
      ],
      "Communication": [
        "lucide:mail",
        "lucide:message-circle",
        "lucide:phone",
        "lucide:bell",
        "lucide:send",
        "lucide:at-sign",
      ],
      "Graphiques": [
        "lucide:bar-chart",
        "lucide:line-chart",
        "lucide:pie-chart",
        "lucide:trending-up",
        "lucide:trending-down",
        "lucide:activity",
      ],
    }
  },
  fontawesome: {
    id: "fontawesome",
    name: "Font Awesome",
    prefix: "fa6-solid:",
    description: "2000+ icônes populaires - Standard du web",
    iconCount: 2000,
    website: "https://fontawesome.com/",
    cdnUrl: "https://api.iconify.design/fa6-solid.json",
    isBuiltIn: false,
    categories: {
      "Solides": [
        "fa6-solid:house",
        "fa6-solid:book",
        "fa6-solid:file",
        "fa6-solid:folder",
        "fa6-solid:user",
        "fa6-solid:gear",
        "fa6-solid:magnifying-glass",
        "fa6-solid:bell",
        "fa6-solid:envelope",
        "fa6-solid:heart",
        "fa6-solid:star",
        "fa6-solid:download",
        "fa6-solid:upload",
        "fa6-solid:check",
        "fa6-solid:xmark",
        "fa6-solid:plus",
        "fa6-solid:minus",
      ],
      "Flèches": [
        "fa6-solid:arrow-left",
        "fa6-solid:arrow-right",
        "fa6-solid:arrow-up",
        "fa6-solid:arrow-down",
        "fa6-solid:chevron-left",
        "fa6-solid:chevron-right",
        "fa6-solid:angles-left",
        "fa6-solid:angles-right",
      ],
      "Business": [
        "fa6-solid:chart-line",
        "fa6-solid:chart-bar",
        "fa6-solid:chart-pie",
        "fa6-solid:building",
        "fa6-solid:briefcase",
        "fa6-solid:dollar-sign",
        "fa6-solid:credit-card",
      ],
      "Médias": [
        "fa6-solid:image",
        "fa6-solid:video",
        "fa6-solid:camera",
        "fa6-solid:music",
        "fa6-solid:play",
        "fa6-solid:pause",
        "fa6-solid:volume-high",
      ],
    }
  },
  tabler: {
    id: "tabler",
    name: "Tabler Icons",
    prefix: "tabler:",
    description: "4000+ icônes SVG gratuites pour vos projets web",
    iconCount: 4000,
    website: "https://tabler-icons.io/",
    cdnUrl: "https://api.iconify.design/tabler.json",
    isBuiltIn: false,
    categories: {
      "Interface": [
        "tabler:home",
        "tabler:menu-2",
        "tabler:search",
        "tabler:settings",
        "tabler:plus",
        "tabler:minus",
        "tabler:x",
        "tabler:check",
        "tabler:dots",
        "tabler:layout-dashboard",
      ],
      "Documents": [
        "tabler:file",
        "tabler:file-text",
        "tabler:folder",
        "tabler:book",
        "tabler:book-2",
        "tabler:notebook",
        "tabler:clipboard",
      ],
      "Utilisateurs": [
        "tabler:user",
        "tabler:users",
        "tabler:user-plus",
        "tabler:shield",
        "tabler:lock",
        "tabler:key",
      ],
    }
  },
  heroicons: {
    id: "heroicons",
    name: "Heroicons",
    prefix: "heroicons:",
    description: "Icônes SVG par les créateurs de Tailwind CSS",
    iconCount: 450,
    website: "https://heroicons.com/",
    cdnUrl: "https://api.iconify.design/heroicons.json",
    isBuiltIn: false,
    categories: {
      "Interface": [
        "heroicons:home",
        "heroicons:bars-3",
        "heroicons:magnifying-glass",
        "heroicons:cog-6-tooth",
        "heroicons:plus",
        "heroicons:minus",
        "heroicons:x-mark",
        "heroicons:check",
      ],
      "Actions": [
        "heroicons:arrow-down-tray",
        "heroicons:arrow-up-tray",
        "heroicons:pencil",
        "heroicons:trash",
        "heroicons:eye",
        "heroicons:eye-slash",
      ],
    }
  },
  phosphor: {
    id: "phosphor",
    name: "Phosphor Icons",
    prefix: "ph:",
    description: "Icônes flexibles pour interfaces, diagrammes et présentations",
    iconCount: 1200,
    website: "https://phosphoricons.com/",
    cdnUrl: "https://api.iconify.design/ph.json",
    isBuiltIn: false,
    categories: {
      "Interface": [
        "ph:house",
        "ph:list",
        "ph:magnifying-glass",
        "ph:gear",
        "ph:plus",
        "ph:minus",
        "ph:x",
        "ph:check",
      ],
      "Documents": [
        "ph:file",
        "ph:file-text",
        "ph:folder",
        "ph:book",
        "ph:book-open",
        "ph:notebook",
      ],
    }
  },
  remix: {
    id: "remix",
    name: "Remix Icons",
    prefix: "ri:",
    description: "2000+ icônes open source système et stylisées",
    iconCount: 2000,
    website: "https://remixicon.com/",
    cdnUrl: "https://api.iconify.design/ri.json",
    isBuiltIn: false,
    categories: {
      "Interface": [
        "ri:home-line",
        "ri:menu-line",
        "ri:search-line",
        "ri:settings-line",
        "ri:add-line",
        "ri:subtract-line",
        "ri:close-line",
        "ri:check-line",
      ],
      "Documents": [
        "ri:file-line",
        "ri:file-text-line",
        "ri:folder-line",
        "ri:book-line",
        "ri:book-open-line",
      ],
    }
  },
  bootstrap: {
    id: "bootstrap",
    name: "Bootstrap Icons",
    prefix: "bi:",
    description: "1800+ icônes officielle de Bootstrap",
    iconCount: 1800,
    website: "https://icons.getbootstrap.com/",
    cdnUrl: "https://api.iconify.design/bi.json",
    isBuiltIn: false,
    categories: {
      "Interface": [
        "bi:house",
        "bi:list",
        "bi:search",
        "bi:gear",
        "bi:plus",
        "bi:dash",
        "bi:x",
        "bi:check",
      ],
      "Documents": [
        "bi:file-earmark",
        "bi:file-earmark-text",
        "bi:folder",
        "bi:book",
        "bi:journal",
      ],
    }
  },
};

// Platform/Portal definitions
const platforms = [
  { id: "portal", label: "Portail BNRM", icon: "mdi:domain", color: "#1e40af" },
  { id: "bn", label: "Bibliothèque Numérique", icon: "mdi:library", color: "#C9A227" },
  { id: "cbn", label: "Catalogue Collectif (CBN)", icon: "mdi:book-multiple", color: "#059669" },
  { id: "cbm", label: "Catalogue Collectif (CBM)", icon: "mdi:bookshelf", color: "#7c3aed" },
  { id: "manuscripts", label: "Manuscrits Numérisés", icon: "mdi:scroll-text-outline", color: "#b45309" },
  { id: "kitab", label: "Kitab", icon: "mdi:book-open-page-variant-outline", color: "#dc2626" },
  { id: "cultural", label: "Activités Culturelles", icon: "mdi:calendar-month-outline", color: "#0891b2" },
];

// Office types
const officeTypes = [
  { id: "front", label: "Front Office", icon: "mdi:monitor", description: "Interface publique" },
  { id: "back", label: "Back Office", icon: "mdi:cog-outline", description: "Administration" },
];

// Target types where icons can be applied
const targetTypes = [
  { id: "section", label: "Sections", icon: "mdi:layers-outline" },
  { id: "card", label: "Cartes", icon: "mdi:card-outline" },
  { id: "menu", label: "Menus", icon: "mdi:menu" },
  { id: "button", label: "Boutons", icon: "mdi:gesture-tap-button" },
  { id: "tab", label: "Onglets", icon: "mdi:tab" },
  { id: "sidebar", label: "Sidebar", icon: "mdi:page-layout-sidebar-left" },
];

// Comprehensive element configs by platform, office, and type
const elementConfigs: Record<string, Record<string, Record<string, Array<{ id: string; label: string; defaultIcon: string }>>>> = {
  portal: {
    front: {
      section: [
        { id: "portal_hero", label: "Section Hero", defaultIcon: "mdi:home-outline" },
        { id: "portal_actualites", label: "Actualités", defaultIcon: "mdi:newspaper-variant-outline" },
        { id: "portal_evenements", label: "Événements", defaultIcon: "mdi:calendar-month-outline" },
        { id: "portal_services", label: "Services numériques", defaultIcon: "mdi:web" },
        { id: "portal_plateformes", label: "Nos Plateformes", defaultIcon: "mdi:apps" },
        { id: "portal_liens_rapides", label: "Liens rapides", defaultIcon: "mdi:link-variant" },
      ],
      card: [
        { id: "portal_card_service", label: "Carte Service", defaultIcon: "mdi:card-outline" },
        { id: "portal_card_actu", label: "Carte Actualité", defaultIcon: "mdi:newspaper-variant-outline" },
        { id: "portal_card_event", label: "Carte Événement", defaultIcon: "mdi:calendar-outline" },
      ],
      menu: [
        { id: "portal_nav_main", label: "Navigation principale", defaultIcon: "mdi:menu" },
        { id: "portal_nav_footer", label: "Footer", defaultIcon: "mdi:page-layout-footer" },
      ],
      button: [],
      tab: [],
      sidebar: [],
    },
    back: {
      section: [
        { id: "portal_admin_dashboard", label: "Dashboard Admin", defaultIcon: "mdi:view-dashboard-outline" },
        { id: "portal_admin_cms", label: "Gestion CMS", defaultIcon: "mdi:file-document-edit-outline" },
      ],
      card: [
        { id: "portal_admin_stat_card", label: "Carte Statistique", defaultIcon: "mdi:chart-box-outline" },
      ],
      menu: [
        { id: "portal_admin_sidebar", label: "Menu latéral admin", defaultIcon: "mdi:menu" },
      ],
      button: [],
      tab: [],
      sidebar: [
        { id: "portal_admin_sidebar_nav", label: "Navigation Sidebar", defaultIcon: "mdi:page-layout-sidebar-left" },
      ],
    },
  },
  bn: {
    front: {
      section: [
        { id: "bn_hero", label: "Section Hero BN", defaultIcon: "mdi:home-outline" },
        { id: "bn_ressources_electroniques", label: "Ressources électroniques", defaultIcon: "mdi:select-multiple" },
        { id: "bn_ibn_battouta_stats", label: "Ibn Battuta en chiffres", defaultIcon: "mdi:format-list-numbered" },
        { id: "bn_derniers_ajouts", label: "Derniers ajouts", defaultIcon: "mdi:book-open-page-variant-outline" },
        { id: "bn_mediatheque", label: "Médiathèque", defaultIcon: "mdi:video-box" },
        { id: "bn_collections", label: "Collections", defaultIcon: "mdi:library" },
        { id: "bn_vexpo", label: "Expositions virtuelles", defaultIcon: "mdi:panorama-outline" },
        { id: "bn_recherche", label: "Recherche", defaultIcon: "mdi:magnify" },
      ],
      card: [
        { id: "bn_card_document", label: "Carte Document", defaultIcon: "mdi:file-document-outline" },
        { id: "bn_card_collection", label: "Carte Collection", defaultIcon: "mdi:folder-multiple-outline" },
        { id: "bn_card_ressource", label: "Carte Ressource électronique", defaultIcon: "mdi:web" },
      ],
      menu: [
        { id: "bn_nav_main", label: "Navigation principale BN", defaultIcon: "mdi:menu" },
        { id: "bn_nav_portails", label: "Menu Portails", defaultIcon: "mdi:apps" },
      ],
      button: [
        { id: "bn_btn_consulter", label: "Bouton Consulter", defaultIcon: "mdi:eye-outline" },
        { id: "bn_btn_telecharger", label: "Bouton Télécharger", defaultIcon: "mdi:download" },
      ],
      tab: [
        { id: "bn_tab_collections", label: "Onglets Collections", defaultIcon: "mdi:tab" },
      ],
      sidebar: [],
    },
    back: {
      section: [
        { id: "bn_admin_dashboard", label: "Dashboard BN", defaultIcon: "mdi:view-dashboard-outline" },
        { id: "bn_admin_documents", label: "Gestion Documents", defaultIcon: "mdi:file-document-multiple-outline" },
        { id: "bn_admin_vexpo", label: "Gestion VExpo", defaultIcon: "mdi:panorama-outline" },
      ],
      card: [
        { id: "bn_admin_stat_card", label: "Carte Statistique BN", defaultIcon: "mdi:chart-box-outline" },
      ],
      menu: [
        { id: "bn_admin_sidebar", label: "Sidebar Admin BN", defaultIcon: "mdi:menu" },
      ],
      button: [],
      tab: [
        { id: "bn_admin_tabs", label: "Onglets Admin", defaultIcon: "mdi:tab" },
      ],
      sidebar: [
        { id: "bn_admin_sidebar_nav", label: "Navigation Sidebar BN", defaultIcon: "mdi:page-layout-sidebar-left" },
      ],
    },
  },
  cbn: {
    front: {
      section: [
        { id: "cbn_hero", label: "Section Hero CBN", defaultIcon: "mdi:home-outline" },
        { id: "cbn_recherche", label: "Recherche Catalogue", defaultIcon: "mdi:magnify" },
        { id: "cbn_resultats", label: "Résultats", defaultIcon: "mdi:format-list-bulleted" },
      ],
      card: [
        { id: "cbn_card_notice", label: "Carte Notice", defaultIcon: "mdi:file-document-outline" },
        { id: "cbn_card_bibliotheque", label: "Carte Bibliothèque", defaultIcon: "mdi:library" },
      ],
      menu: [
        { id: "cbn_nav_main", label: "Navigation CBN", defaultIcon: "mdi:menu" },
      ],
      button: [],
      tab: [],
      sidebar: [],
    },
    back: {
      section: [
        { id: "cbn_admin_dashboard", label: "Dashboard CBN", defaultIcon: "mdi:view-dashboard-outline" },
      ],
      card: [],
      menu: [],
      button: [],
      tab: [],
      sidebar: [],
    },
  },
  cbm: {
    front: {
      section: [
        { id: "cbm_hero", label: "Section Hero CBM", defaultIcon: "mdi:home-outline" },
        { id: "cbm_adhesion", label: "Adhésion", defaultIcon: "mdi:account-plus-outline" },
        { id: "cbm_formation", label: "Formations", defaultIcon: "mdi:school-outline" },
        { id: "cbm_bibliotheques", label: "Bibliothèques membres", defaultIcon: "mdi:library" },
      ],
      card: [
        { id: "cbm_card_bibliotheque", label: "Carte Bibliothèque", defaultIcon: "mdi:library" },
        { id: "cbm_card_formation", label: "Carte Formation", defaultIcon: "mdi:school-outline" },
      ],
      menu: [
        { id: "cbm_nav_main", label: "Navigation CBM", defaultIcon: "mdi:menu" },
      ],
      button: [],
      tab: [],
      sidebar: [],
    },
    back: {
      section: [
        { id: "cbm_admin_dashboard", label: "Dashboard CBM", defaultIcon: "mdi:view-dashboard-outline" },
        { id: "cbm_admin_adhesions", label: "Gestion Adhésions", defaultIcon: "mdi:account-group-outline" },
      ],
      card: [],
      menu: [],
      button: [],
      tab: [],
      sidebar: [],
    },
  },
  manuscripts: {
    front: {
      section: [
        { id: "ms_hero", label: "Section Hero Manuscrits", defaultIcon: "mdi:home-outline" },
        { id: "ms_collections", label: "Collections Manuscrits", defaultIcon: "mdi:scroll-text-outline" },
        { id: "ms_recherche", label: "Recherche Manuscrits", defaultIcon: "mdi:magnify" },
      ],
      card: [
        { id: "ms_card_manuscrit", label: "Carte Manuscrit", defaultIcon: "mdi:scroll-text-outline" },
      ],
      menu: [
        { id: "ms_nav_main", label: "Navigation Manuscrits", defaultIcon: "mdi:menu" },
      ],
      button: [],
      tab: [],
      sidebar: [],
    },
    back: {
      section: [
        { id: "ms_admin_dashboard", label: "Dashboard Manuscrits", defaultIcon: "mdi:view-dashboard-outline" },
        { id: "ms_admin_catalogage", label: "Catalogage", defaultIcon: "mdi:file-document-edit-outline" },
      ],
      card: [],
      menu: [],
      button: [],
      tab: [],
      sidebar: [],
    },
  },
  kitab: {
    front: {
      section: [
        { id: "kitab_hero", label: "Section Hero Kitab", defaultIcon: "mdi:home-outline" },
        { id: "kitab_catalogue", label: "Catalogue Kitab", defaultIcon: "mdi:book-open-page-variant-outline" },
      ],
      card: [
        { id: "kitab_card_livre", label: "Carte Livre", defaultIcon: "mdi:book-outline" },
      ],
      menu: [
        { id: "kitab_nav_main", label: "Navigation Kitab", defaultIcon: "mdi:menu" },
      ],
      button: [],
      tab: [],
      sidebar: [],
    },
    back: {
      section: [
        { id: "kitab_admin_dashboard", label: "Dashboard Kitab", defaultIcon: "mdi:view-dashboard-outline" },
      ],
      card: [],
      menu: [],
      button: [],
      tab: [],
      sidebar: [],
    },
  },
  cultural: {
    front: {
      section: [
        { id: "cultural_hero", label: "Section Hero Culturelle", defaultIcon: "mdi:home-outline" },
        { id: "cultural_agenda", label: "Agenda Culturel", defaultIcon: "mdi:calendar-month-outline" },
        { id: "cultural_espaces", label: "Espaces Culturels", defaultIcon: "mdi:domain" },
        { id: "cultural_visites", label: "Visites Guidées", defaultIcon: "mdi:walk" },
      ],
      card: [
        { id: "cultural_card_event", label: "Carte Événement Culturel", defaultIcon: "mdi:calendar-outline" },
        { id: "cultural_card_espace", label: "Carte Espace", defaultIcon: "mdi:office-building-outline" },
      ],
      menu: [
        { id: "cultural_nav_main", label: "Navigation Culturelle", defaultIcon: "mdi:menu" },
      ],
      button: [],
      tab: [],
      sidebar: [],
    },
    back: {
      section: [
        { id: "cultural_admin_dashboard", label: "Dashboard Culturel", defaultIcon: "mdi:view-dashboard-outline" },
        { id: "cultural_admin_reservations", label: "Gestion Réservations", defaultIcon: "mdi:calendar-check-outline" },
      ],
      card: [],
      menu: [],
      button: [],
      tab: [],
      sidebar: [],
    },
  },
};

interface IconConfig {
  icon: string;
  color?: string;
  library?: string;
}

interface SectionIcons {
  [targetId: string]: IconConfig;
}

interface IconLibraryConfig {
  activeLibrary: string;
  customIcons: Array<{ name: string; icon: string; category: string }>;
  installedLibraries: string[]; // IDs of installed downloadable libraries
}

// Combine built-in and downloadable libraries for active use
const getAllAvailableLibraries = (installedLibraries: string[]): Record<string, IconLibraryDefinition> => {
  const libs: Record<string, IconLibraryDefinition> = { ...builtInLibraries };
  installedLibraries.forEach(libId => {
    const downloadable = downloadableLibraries[libId];
    if (downloadable) {
      libs[libId] = {
        ...downloadable,
        categories: downloadable.categories || {}
      } as IconLibraryDefinition;
    }
  });
  return libs;
};

interface CmsSectionIconsManagerProps {
  platform: 'portal' | 'bn';
}

export default function CmsSectionIconsManager({ platform }: CmsSectionIconsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>(platform === 'bn' ? 'bn' : 'portal');
  const [selectedOffice, setSelectedOffice] = useState<string>("front");
  const [selectedTargetType, setSelectedTargetType] = useState("section");
  const [activeLibrary, setActiveLibrary] = useState<string>("mdi");
  const [sectionIcons, setSectionIcons] = useState<SectionIcons>({});
  const [customIcons, setCustomIcons] = useState<Array<{ name: string; icon: string; category: string }>>([]);
  const [installedLibraries, setInstalledLibraries] = useState<string[]>([]);
  const [downloadingLibrary, setDownloadingLibrary] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const keyPrefix = platform === 'bn' ? 'bn_' : '';
  const sectionIconsKey = `${keyPrefix}section_icons`;
  const libraryConfigKey = `${keyPrefix}icon_library_config`;

  // Get all available libraries (built-in + installed)
  const iconLibraries = getAllAvailableLibraries(installedLibraries);

  // Get current elements based on selections
  const getCurrentElements = () => {
    const platformConfig = elementConfigs[selectedPlatform];
    if (!platformConfig) return [];
    const officeConfig = platformConfig[selectedOffice];
    if (!officeConfig) return [];
    return officeConfig[selectedTargetType] || [];
  };

  // Load saved icons and library config
  const { isLoading } = useQuery({
    queryKey: ['cms-section-icons', platform],
    queryFn: async () => {
      const [iconsRes, configRes] = await Promise.all([
        supabase
          .from('cms_portal_settings')
          .select('*')
          .eq('setting_key', sectionIconsKey)
          .maybeSingle(),
        supabase
          .from('cms_portal_settings')
          .select('*')
          .eq('setting_key', libraryConfigKey)
          .maybeSingle()
      ]);
      
      if (iconsRes.error) throw iconsRes.error;
      if (configRes.error) throw configRes.error;
      
      // Load section icons
      if (iconsRes.data?.setting_value) {
        setSectionIcons(iconsRes.data.setting_value as unknown as SectionIcons);
      } else {
        // Initialize with defaults from all platforms
        const defaults: SectionIcons = {};
        Object.entries(elementConfigs).forEach(([, officeConfigs]) => {
          Object.entries(officeConfigs).forEach(([, typeConfigs]) => {
            Object.entries(typeConfigs).forEach(([, elements]) => {
              (elements as Array<{ id: string; defaultIcon: string }>).forEach(el => {
                defaults[el.id] = {
                  icon: el.defaultIcon,
                  color: platform === 'bn' ? '#C9A227' : '#3b82f6',
                  library: 'mdi'
                };
              });
            });
          });
        });
        setSectionIcons(defaults);
      }
      
      // Load library config
      if (configRes.data?.setting_value) {
        const config = configRes.data.setting_value as unknown as IconLibraryConfig;
        setActiveLibrary(config.activeLibrary || 'mdi');
        setCustomIcons(config.customIcons || []);
        setInstalledLibraries(config.installedLibraries || []);
      }
      
      return { icons: iconsRes.data, config: configRes.data };
    }
  });

  // Install/download a library
  const handleInstallLibrary = async (libraryId: string) => {
    if (installedLibraries.includes(libraryId)) {
      toast({ title: "Bibliothèque déjà installée" });
      return;
    }

    setDownloadingLibrary(libraryId);
    setDownloadProgress(0);

    // Simulate download progress (in reality, icons are loaded via Iconify CDN on-demand)
    const progressInterval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 150);

    // Add library to installed list
    await new Promise(resolve => setTimeout(resolve, 1500));
    clearInterval(progressInterval);
    setDownloadProgress(100);

    setInstalledLibraries(prev => [...prev, libraryId]);
    
    setTimeout(() => {
      setDownloadingLibrary(null);
      setDownloadProgress(0);
      toast({ 
        title: "Bibliothèque installée", 
        description: `${downloadableLibraries[libraryId]?.name} est maintenant disponible` 
      });
    }, 300);
  };

  // Uninstall a library
  const handleUninstallLibrary = (libraryId: string) => {
    setInstalledLibraries(prev => prev.filter(id => id !== libraryId));
    if (activeLibrary === libraryId) {
      setActiveLibrary('mdi');
    }
    toast({ title: "Bibliothèque désinstallée" });
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const libraryConfig: IconLibraryConfig = {
        activeLibrary,
        customIcons,
        installedLibraries
      };
      
      await Promise.all([
        supabase
          .from('cms_portal_settings')
          .upsert({
            setting_key: sectionIconsKey,
            setting_value: sectionIcons as any,
            category: 'styling'
          }, { onConflict: 'setting_key' }),
        supabase
          .from('cms_portal_settings')
          .upsert({
            setting_key: libraryConfigKey,
            setting_value: libraryConfig as any,
            category: 'styling'
          }, { onConflict: 'setting_key' })
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-section-icons', platform] });
      toast({ title: "Configuration sauvegardée avec succès" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  // Export configuration
  const handleExport = () => {
    const exportData = {
      version: "1.0",
      platform,
      activeLibrary,
      sectionIcons,
      customIcons,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icon-config-${platform}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Configuration exportée" });
  };

  // Import configuration
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.activeLibrary) setActiveLibrary(data.activeLibrary);
        if (data.sectionIcons) setSectionIcons(data.sectionIcons);
        if (data.customIcons) setCustomIcons(data.customIcons);
        
        toast({ title: "Configuration importée avec succès" });
      } catch (error) {
        toast({ title: "Erreur d'import", description: "Fichier JSON invalide", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectIconForSection = (sectionId: string, iconName: string) => {
    setSectionIcons(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        icon: iconName,
        library: activeLibrary
      }
    }));
  };

  const updateSectionIconColor = (sectionId: string, color: string) => {
    setSectionIcons(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        color
      }
    }));
  };

  // Get current library icons
  const currentLibrary = iconLibraries[activeLibrary as keyof typeof iconLibraries];
  const libraryCategories = currentLibrary?.categories || {};

  // Filter icons by search
  const filteredLibrary = Object.entries(libraryCategories).reduce((acc, [category, icons]) => {
    const filtered = (icons as string[]).filter(icon => 
      icon.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, string[]>);

  // Add custom icons to filtered results
  if (customIcons.length > 0) {
    const customFiltered = customIcons.filter(ic => 
      ic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ic.icon.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (customFiltered.length > 0) {
      filteredLibrary["Icônes personnalisées"] = customFiltered.map(ic => ic.icon);
    }
  }

  // Count total icons
  const totalIcons = Object.values(libraryCategories).flat().length + customIcons.length;

  // Get filtered elements based on current selections
  const currentElements = getCurrentElements();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Icon name="mdi:loading" className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Library className="h-5 w-5 text-primary" />
          <span className="font-medium">Gestionnaire d'icônes</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <Icon name="mdi:loading" className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Icon name="mdi:content-save-outline" className="h-4 w-4 mr-2" />
            )}
            Sauvegarder
          </Button>
        </div>
      </div>

      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            Bibliothèques
          </TabsTrigger>
          <TabsTrigger value="apply" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Appliquer
          </TabsTrigger>
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Icon name="mdi:view-grid-outline" className="h-4 w-4" />
            Parcourir
          </TabsTrigger>
        </TabsList>

        {/* Library Selection Tab */}
        <TabsContent value="library" className="mt-4 space-y-6">
          {/* Built-in Library */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Bibliothèque préinstallée
              </CardTitle>
              <CardDescription>
                Bibliothèque disponible par défaut
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  activeLibrary === 'mdi' ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => setActiveLibrary('mdi')}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <Icon name="mdi:material-design" className="h-6 w-6 text-green-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{builtInLibraries.mdi.name}</p>
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Installée
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{builtInLibraries.mdi.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{builtInLibraries.mdi.iconCount.toLocaleString()}+ icônes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeLibrary === 'mdi' && (
                        <Badge className="bg-primary">Active</Badge>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(builtInLibraries.mdi.website, '_blank');
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Downloadable Libraries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="h-5 w-5 text-blue-600" />
                Bibliothèques disponibles au téléchargement
              </CardTitle>
              <CardDescription>
                Téléchargez des bibliothèques d'icônes supplémentaires (via Iconify CDN)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.values(downloadableLibraries).map((lib) => {
                  const isInstalled = installedLibraries.includes(lib.id);
                  const isDownloading = downloadingLibrary === lib.id;
                  const isActive = activeLibrary === lib.id;
                  
                  return (
                    <Card 
                      key={lib.id}
                      className={`transition-all ${
                        isActive ? 'ring-2 ring-primary bg-primary/5' : ''
                      } ${isInstalled ? 'cursor-pointer hover:shadow-md' : ''}`}
                      onClick={() => isInstalled && setActiveLibrary(lib.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              isInstalled ? 'bg-blue-100' : 'bg-muted'
                            }`}>
                              <Icon name={`${lib.prefix}home`} className={`h-6 w-6 ${
                                isInstalled ? 'text-blue-700' : 'text-muted-foreground'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium">{lib.name}</p>
                                {isInstalled && (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Installée
                                  </Badge>
                                )}
                                {isActive && (
                                  <Badge className="bg-primary text-xs">Active</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{lib.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">{lib.iconCount.toLocaleString()}+ icônes</p>
                            </div>
                          </div>
                        </div>

                        {isDownloading && (
                          <div className="mt-3">
                            <Progress value={downloadProgress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              Téléchargement en cours... {downloadProgress}%
                            </p>
                          </div>
                        )}

                        <div className="mt-3 flex items-center gap-2">
                          {!isInstalled ? (
                            <Button 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInstallLibrary(lib.id);
                              }}
                              disabled={isDownloading}
                              className="flex-1"
                            >
                              {isDownloading ? (
                                <Icon name="mdi:loading" className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Download className="h-4 w-4 mr-2" />
                              )}
                              Télécharger
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUninstallLibrary(lib.id);
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Icon name="mdi:delete-outline" className="h-4 w-4 mr-2" />
                              Désinstaller
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(lib.website, '_blank');
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Custom Icons Import */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileJson className="h-5 w-5" />
                Icônes personnalisées
              </CardTitle>
              <CardDescription>
                Importez vos propres icônes via un fichier JSON
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-2 border-dashed rounded-lg bg-muted/30 text-center">
                  <Icon name="mdi:cloud-upload-outline" className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Glissez un fichier JSON de configuration ou
                  </p>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Parcourir les fichiers
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    Format: {"{"}"icons": [{"{"}"name": "...", "icon": "prefix:name", "category": "..."{"}"}]{"}"} 
                  </p>
                </div>
                
                {customIcons.length > 0 && (
                  <div className="mt-4">
                    <Label className="mb-2 block">Icônes importées ({customIcons.length})</Label>
                    <div className="flex flex-wrap gap-2">
                      {customIcons.map((ic, idx) => (
                        <Badge key={idx} variant="outline" className="flex items-center gap-1">
                          <Icon name={ic.icon} className="h-3 w-3" />
                          {ic.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      <strong>{1 + installedLibraries.length}</strong> bibliothèque(s) installée(s)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {Object.keys(downloadableLibraries).length - installedLibraries.length} disponible(s) au téléchargement
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Icon name={iconLibraries[activeLibrary]?.prefix + 'star-outline' || 'mdi:star-outline'} className="h-3 w-3" />
                  Active: {iconLibraries[activeLibrary]?.name || 'Material Design Icons'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Apply Icons Tab */}
        <TabsContent value="apply" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Appliquer les icônes
              </CardTitle>
              <CardDescription>
                Sélectionnez le portail, le type d'interface, puis l'élément à configurer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Platform Selection */}
              <div>
                <Label className="mb-3 block text-sm font-medium">
                  <span className="inline-flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full h-5 w-5 p-0 justify-center">1</Badge>
                    Portail / Plateforme
                  </span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {platforms.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPlatform(p.id);
                        setSelectedSection(null);
                      }}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedPlatform === p.id 
                          ? 'ring-2 ring-primary bg-primary/5 border-primary' 
                          : 'hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon name={p.icon} className="h-5 w-5" style={{ color: p.color }} />
                        <span className="text-sm font-medium truncate">{p.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Office Type Selection */}
              <div>
                <Label className="mb-3 block text-sm font-medium">
                  <span className="inline-flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full h-5 w-5 p-0 justify-center">2</Badge>
                    Type d'interface
                  </span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {officeTypes.map(office => (
                    <button
                      key={office.id}
                      onClick={() => {
                        setSelectedOffice(office.id);
                        setSelectedSection(null);
                      }}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        selectedOffice === office.id 
                          ? 'ring-2 ring-primary bg-primary/5 border-primary' 
                          : 'hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedOffice === office.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <Icon name={office.icon} className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{office.label}</p>
                          <p className="text-xs text-muted-foreground">{office.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Target Type Selector */}
              <div>
                <Label className="mb-3 block text-sm font-medium">
                  <span className="inline-flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full h-5 w-5 p-0 justify-center">3</Badge>
                    Type d'élément
                  </span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {targetTypes.map(type => {
                    const hasElements = (elementConfigs[selectedPlatform]?.[selectedOffice]?.[type.id]?.length || 0) > 0;
                    return (
                      <Button
                        key={type.id}
                        variant={selectedTargetType === type.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedTargetType(type.id);
                          setSelectedSection(null);
                        }}
                        disabled={!hasElements}
                        className="flex items-center gap-2"
                      >
                        <Icon name={type.icon} className="h-4 w-4" />
                        {type.label}
                        {hasElements && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            {elementConfigs[selectedPlatform]?.[selectedOffice]?.[type.id]?.length || 0}
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Current Selection Summary */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Icon name={platforms.find(p => p.id === selectedPlatform)?.icon || "mdi:domain"} className="h-4 w-4" />
                  <span className="font-medium">{platforms.find(p => p.id === selectedPlatform)?.label}</span>
                  <Icon name="mdi:chevron-right" className="h-4 w-4 text-muted-foreground" />
                  <span>{officeTypes.find(o => o.id === selectedOffice)?.label}</span>
                  <Icon name="mdi:chevron-right" className="h-4 w-4 text-muted-foreground" />
                  <span>{targetTypes.find(t => t.id === selectedTargetType)?.label}</span>
                </div>
              </div>

              {/* Step 4: Elements List */}
              <div>
                <Label className="mb-3 block text-sm font-medium">
                  <span className="inline-flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full h-5 w-5 p-0 justify-center">4</Badge>
                    Éléments à configurer ({currentElements.length})
                  </span>
                </Label>
                <div className="grid gap-3">
                  {currentElements.map(config => {
                    const currentIcon = sectionIcons[config.id] || { 
                      icon: config.defaultIcon, 
                      color: platforms.find(p => p.id === selectedPlatform)?.color || '#3b82f6',
                      library: 'mdi'
                    };
                    return (
                      <Card key={config.id} className={selectedSection === config.id ? "ring-2 ring-primary" : ""}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div 
                                className="w-12 h-12 rounded-lg border flex items-center justify-center"
                                style={{ color: currentIcon.color }}
                              >
                                <Icon name={currentIcon.icon} className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-medium">{config.label}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{currentIcon.icon}</code>
                                  {currentIcon.library && (
                                    <Badge variant="secondary" className="text-xs">
                                      {iconLibraries[currentIcon.library as keyof typeof iconLibraries]?.name || currentIcon.library}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Label className="text-sm">Couleur</Label>
                                <Input
                                  type="color"
                                  value={currentIcon.color || '#C9A227'}
                                  onChange={(e) => updateSectionIconColor(config.id, e.target.value)}
                                  className="w-10 h-10 p-1 cursor-pointer"
                                />
                              </div>
                              <Button 
                                variant={selectedSection === config.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedSection(selectedSection === config.id ? null : config.id)}
                              >
                                {selectedSection === config.id ? "Fermer" : "Changer"}
                              </Button>
                            </div>
                          </div>

                          {/* Icon Selector */}
                          {selectedSection === config.id && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="mb-4">
                                <div className="relative">
                                  <Icon name="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder={`Rechercher dans ${currentLibrary?.name || 'la bibliothèque'}...`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                  />
                                </div>
                              </div>

                              <ScrollArea className="h-[300px]">
                                <Accordion type="multiple" defaultValue={Object.keys(filteredLibrary).slice(0, 2)} className="space-y-2">
                                  {Object.entries(filteredLibrary).map(([category, icons]) => (
                                    <AccordionItem key={category} value={category} className="border rounded-lg px-3">
                                      <AccordionTrigger className="hover:no-underline py-2">
                                        <span className="text-sm font-medium">{category}</span>
                                        <Badge variant="outline" className="ml-2">{(icons as string[]).length}</Badge>
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        <div className="grid grid-cols-6 gap-2 py-2">
                                          {(icons as string[]).map((iconName) => (
                                            <button
                                              key={iconName}
                                              onClick={() => selectIconForSection(config.id, iconName)}
                                              className={`p-3 rounded-lg border hover:bg-accent transition-colors flex flex-col items-center gap-1 ${
                                                currentIcon.icon === iconName ? "bg-primary/10 border-primary" : ""
                                              }`}
                                              title={iconName}
                                            >
                                              <Icon name={iconName} className="h-5 w-5" style={{ color: currentIcon.color }} />
                                              {currentIcon.icon === iconName && (
                                                <Icon name="mdi:check" className="h-3 w-3 text-primary" />
                                              )}
                                            </button>
                                          ))}
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  ))}
                                </Accordion>
                              </ScrollArea>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}

                  {currentElements.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      <Icon name="mdi:information-outline" className="h-8 w-8 mx-auto mb-2" />
                      <p>Aucun élément configuré pour cette sélection.</p>
                      <p className="text-sm mt-1">Essayez de changer le type d'élément ou la plateforme.</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Browse Library Tab */}
        <TabsContent value="browse" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="mdi:material-design" className="h-5 w-5" />
                {currentLibrary?.name || 'Bibliothèque'}
              </CardTitle>
              <CardDescription>
                {totalIcons} icônes disponibles
              </CardDescription>
              <div className="relative mt-4">
                <Icon name="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une icône..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Accordion type="multiple" defaultValue={Object.keys(filteredLibrary)} className="space-y-2">
                  {Object.entries(filteredLibrary).map(([category, icons]) => (
                    <AccordionItem key={category} value={category} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{category}</span>
                          <Badge variant="outline">{(icons as string[]).length}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-6 md:grid-cols-8 gap-3 py-4">
                          {(icons as string[]).map((iconName) => (
                            <div
                              key={iconName}
                              className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors flex flex-col items-center gap-2 cursor-pointer group"
                              title={iconName}
                              onClick={() => {
                                navigator.clipboard.writeText(iconName);
                                toast({ title: "Copié!", description: iconName });
                              }}
                            >
                              <Icon name={iconName} className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
                              <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                                {iconName.replace(/^(mdi:|lucide:|fa:)/, "")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
