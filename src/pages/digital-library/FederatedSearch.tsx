import { useState, useCallback, useRef, useMemo, useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { useElectronicBundles, ElectronicBundle } from "@/hooks/useElectronicBundles";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocation } from "react-router-dom";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { FancyTooltip } from "@/components/ui/fancy-tooltip";
import { motion, AnimatePresence } from "framer-motion";

// Logos ressources électroniques
import logoBrill from "@/assets/logos/logo-brill.png";
import logoCairn from "@/assets/logos/logo-cairn.svg";
import logoAlmanhal from "@/assets/logos/logo-almanhal.png";
import logoEni from "@/assets/logos/logo-eni.svg";
import logoRfn from "@/assets/logos/logo-rfn.png";
import logoEuropeana from "@/assets/logos/logo-europeana.svg";
import logoIfla from "@/assets/logos/logo-ifla.svg";
import federatedSearchBg from "@/assets/federated-search-bg.jpg";

const providerLogoMap: Record<string, string> = {
  'cairn': logoCairn,
  'cairn.info': logoCairn,
  'brill': logoBrill,
  'rfn': logoRfn,
  'europeana': logoEuropeana,
  'ifla': logoIfla,
  'eni-elearning': logoEni,
  'eni': logoEni,
  'almanhal': logoAlmanhal,
  'al-manhal': logoAlmanhal,
};

const darkBackgroundProviders = ['almanhal', 'al-manhal', 'eni', 'eni-elearning'];

interface ProviderResult {
  provider: ElectronicBundle;
  status: "idle" | "loading" | "success" | "error";
  url?: string;
}

interface ExampleResult {
  id: string;
  title: string;
  title_ar: string;
  authors: string;
  year: string;
  source: string;
  source_ar: string;
  type: string;
  type_ar: string;
  description: string;
  description_ar: string;
  gradient: string;
  icon: string;
}

const EXAMPLE_RESULTS: ExampleResult[] = [
  {
    id: "1",
    title: "Le patrimoine manuscrit marocain : histoire et conservation",
    title_ar: "التراث المخطوطاتي المغربي: التاريخ والحفظ",
    authors: "Mohammed El Mansouri, Fatima Zahra Benali",
    year: "2022",
    source: "Cairn.info",
    source_ar: "كيرن إنفو",
    type: "Article de revue",
    type_ar: "مقال في مجلة",
    description: "Étude approfondie sur les manuscrits du patrimoine marocain, leur classification et les méthodes de conservation numérique.",
    description_ar: "دراسة معمقة حول مخطوطات التراث المغربي وتصنيفها وأساليب الحفظ الرقمي.",
    gradient: "from-emerald-500 to-teal-600",
    icon: "mdi:book-open-page-variant",
  },
  {
    id: "2",
    title: "Digital libraries and Islamic philosophy: A comparative study",
    title_ar: "المكتبات الرقمية والفلسفة الإسلامية: دراسة مقارنة",
    authors: "Ahmad Khalil, Sarah Johnson",
    year: "2023",
    source: "EBSCO Academic",
    source_ar: "إبسكو أكاديمي",
    type: "Article scientifique",
    type_ar: "مقال علمي",
    description: "Analyse comparative des ressources disponibles sur la philosophie islamique dans les grandes bases de données académiques mondiales.",
    description_ar: "تحليل مقارن للموارد المتاحة حول الفلسفة الإسلامية في قواعد البيانات الأكاديمية العالمية الكبرى.",
    gradient: "from-blue-500 to-indigo-600",
    icon: "mdi:school",
  },
  {
    id: "3",
    title: "Arabic literature in the modern era: Trends and transformations",
    title_ar: "الأدب العربي في العصر الحديث: الاتجاهات والتحولات",
    authors: "Layla Al-Akhdar",
    year: "2021",
    source: "Al Manhal",
    source_ar: "المنهل",
    type: "Ouvrage",
    type_ar: "كتاب",
    description: "Un ouvrage de référence sur l'évolution de la littérature arabe contemporaine, ses courants majeurs et ses figures emblématiques.",
    description_ar: "مرجع أساسي حول تطور الأدب العربي المعاصر وتياراته الكبرى وشخصياته الرمزية.",
    gradient: "from-purple-500 to-violet-600",
    icon: "mdi:book-variant",
  },
  {
    id: "4",
    title: "Information science in the age of artificial intelligence",
    title_ar: "علم المعلومات في عصر الذكاء الاصطناعي",
    authors: "Pierre Dupont, Amina Berrada",
    year: "2023",
    source: "BRILL",
    source_ar: "بريل",
    type: "Chapitre de livre",
    type_ar: "فصل من كتاب",
    description: "Exploration des nouvelles perspectives offertes par l'IA dans le domaine des sciences de l'information et de la documentation.",
    description_ar: "استكشاف الآفاق الجديدة التي يوفرها الذكاء الاصطناعي في مجال علوم المعلومات والتوثيق.",
    gradient: "from-amber-500 to-orange-600",
    icon: "mdi:robot-outline",
  },
  {
    id: "5",
    title: "Histoire du Maroc : de l'Antiquité à l'époque contemporaine",
    title_ar: "تاريخ المغرب: من العصور القديمة إلى العصر الحديث",
    authors: "Rachid Bennani, Hassan Ouazzani",
    year: "2020",
    source: "ENI-Elearning",
    source_ar: "إيني إي-ليرنينج",
    type: "Cours en ligne",
    type_ar: "دورة إلكترونية",
    description: "Parcours pédagogique complet retraçant les grandes étapes de l'histoire marocaine, des origines berbères aux enjeux du XXIe siècle.",
    description_ar: "مسار تعليمي شامل يتتبع المراحل الكبرى في التاريخ المغربي من الأصول الأمازيغية إلى تحديات القرن الحادي والعشرين.",
    gradient: "from-cyan-500 to-blue-500",
    icon: "mdi:laptop",
  },
  {
    id: "6",
    title: "Bibliothèques numériques et accès au savoir en Afrique",
    title_ar: "المكتبات الرقمية والوصول إلى المعرفة في أفريقيا",
    authors: "Mariama Diallo, Jean-Pierre Moreau",
    year: "2022",
    source: "Cairn.info",
    source_ar: "كيرن إنفو",
    type: "Article de revue",
    type_ar: "مقال في مجلة",
    description: "Analyse des défis et opportunités liés au développement des bibliothèques numériques dans les pays africains francophones.",
    description_ar: "تحليل التحديات والفرص المرتبطة بتطوير المكتبات الرقمية في دول أفريقيا الناطقة بالفرنسية.",
    gradient: "from-emerald-500 to-teal-600",
    icon: "mdi:earth",
  },
];

function ExamplesButton({ isAr, setQuery }: { isAr: boolean; setQuery: (q: string) => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const examples = isAr
    ? ["التراث المغربي", "الفلسفة الإسلامية", "الأدب العربي", "علم المكتبات", "تاريخ المغرب"]
    : ["Patrimoine marocain", "Philosophie islamique", "Littérature arabe", "Sciences de l'information", "Histoire du Maroc"];

  const handleEnter = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left });
    }
    setOpen(true);
  };

  return (
    <div className="mt-3 flex items-center gap-2">
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={handleEnter}
        onMouseLeave={() => setOpen(false)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/15 text-white/80 border border-white/25 hover:bg-white/25 transition-all backdrop-blur-sm"
      >
        <Icon name="mdi:lightbulb-outline" className="h-3.5 w-3.5 text-gold-bn-primary" />
        {isAr ? "أمثلة للبحث" : "Exemples de recherche"}
      </button>

      {open && (
        <div
          className="fixed w-64 rounded-xl border border-white/20 bg-slate-900/95 backdrop-blur-md shadow-2xl p-3 z-[99999]"
          style={{ top: pos.top, left: pos.left }}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <p className="text-xs text-white/60 font-medium mb-2 uppercase tracking-wide">
            {isAr ? "انقر لتطبيق مثال" : "Cliquez pour appliquer"}
          </p>
          <div className="flex flex-col gap-1">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => { setQuery(example); setOpen(false); }}
                className="text-left px-3 py-1.5 rounded-lg text-sm text-white hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <Icon name="mdi:magnify" className="h-3.5 w-3.5 text-gold-bn-primary shrink-0" />
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FederatedSearchInner() {
  const { activeBundles } = useElectronicBundles();
  const { language } = useLanguage();

  // Charger les paramètres CMS de la Recherche fédérée
  const { data: cmsSettings } = useQuery({
    queryKey: ["federated-search-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("cms_portal_settings")
        .select("setting_value")
        .eq("setting_key", "federated_search_hero")
        .maybeSingle();
      return data?.setting_value as { hero_image_url?: string; title_fr?: string; title_ar?: string; subtitle_fr?: string; subtitle_ar?: string } | null;
    },
  });
  const [query, setQuery] = useState("");
  const [selectedProviders, setSelectedProviders] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<ProviderResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [repoCarouselIndex, setRepoCarouselIndex] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  // Update dropdown position on scroll/resize so it follows the trigger button
  const updateDropdownPos = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  };

  useEffect(() => {
    if (!dropdownOpen) return;
    window.addEventListener("scroll", updateDropdownPos, true);
    window.addEventListener("resize", updateDropdownPos);
    return () => {
      window.removeEventListener("scroll", updateDropdownPos, true);
      window.removeEventListener("resize", updateDropdownPos);
    };
  }, [dropdownOpen]);

  // Compute fixed position for dropdown (position:fixed is relative to viewport, no scroll offset needed)
  const openDropdown = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setDropdownOpen((v) => !v);
  };

  const isAr = language === "ar";

  const itemsPerPage = 3;
  const maxCarouselIndex = useMemo(() => {
    if (!activeBundles || activeBundles.length <= itemsPerPage) return 0;
    return Math.ceil(activeBundles.length / itemsPerPage) - 1;
  }, [activeBundles]);

  const toggleProvider = (id: string) => {
    setSelectedProviders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (!activeBundles) return;
    if (selectedProviders.size === activeBundles.length) {
      setSelectedProviders(new Set());
    } else {
      setSelectedProviders(new Set(activeBundles.map((b) => b.id)));
    }
  };

  const buildSearchUrl = (bundle: ElectronicBundle, q: string): string => {
    const providerKey = bundle.provider?.toLowerCase().trim();
    const encoded = encodeURIComponent(q);

    const searchUrls: Record<string, string> = {
      cairn: `https://shs.cairn.info/resultats_recherche?searchTerm=${encoded}`,
      ebsco: `https://research.ebsco.com/c/jtkfej/search/results?q=${encoded}`,
      brill: `https://brill.com/search?q=${encoded}`,
      almanhal: `https://platform.almanhal.com/Search/Result?searchtext=${encoded}`,
      "eni-elearning": `https://www.eni-training.com/cs/eni-demo-ip?q=${encoded}`,
      eni: `https://www.eni-training.com/cs/eni-demo-ip?q=${encoded}`,
      europeana: `https://www.europeana.eu/en/search?query=${encoded}`,
    };

    if (providerKey && searchUrls[providerKey]) {
      return searchUrls[providerKey];
    }

    const base = bundle.search_endpoint || bundle.api_base_url || bundle.website_url;
    if (base) {
      try {
        const url = new URL(base);
        url.searchParams.set("q", q);
        return url.toString();
      } catch {
        return `${base}?q=${encoded}`;
      }
    }
    return "#";
  };

  const handleSearch = useCallback(() => {
    if (!query.trim() || !activeBundles) return;

    const providers =
      selectedProviders.size > 0
        ? activeBundles.filter((b) => selectedProviders.has(b.id))
        : activeBundles;

    const providerResults: ProviderResult[] = providers.map((bundle) => ({
      provider: bundle,
      status: "success" as const,
      url: buildSearchUrl(bundle, query.trim()),
    }));

    setResults(providerResults);
    setHasSearched(true);
    setDropdownOpen(false);
  }, [query, activeBundles, selectedProviders]);

  const providerIcons: Record<string, string> = {
    cairn: "mdi:book-open-page-variant",
    ebsco: "mdi:database-search",
    brill: "mdi:book-education",
    almanhal: "mdi:library",
    "eni-elearning": "mdi:laptop",
    eni: "mdi:laptop",
    europeana: "mdi:castle",
    rfn: "mdi:earth",
    ifla: "mdi:account-group",
  };

  const providerColors: Record<string, string> = {
    cairn: "from-orange-500 to-red-500",
    ebsco: "from-blue-600 to-indigo-600",
    brill: "from-emerald-500 to-teal-600",
    almanhal: "from-purple-500 to-violet-600",
    "eni-elearning": "from-cyan-500 to-blue-500",
    eni: "from-cyan-500 to-blue-500",
    europeana: "from-amber-500 to-yellow-600",
  };

  // Multi-select dropdown label
  const selectedCount = selectedProviders.size;
  const dropdownLabel = selectedCount === 0
    ? (isAr ? "جميع القواعد" : "Toutes les bases")
    : selectedCount === activeBundles?.length
      ? (isAr ? "جميع القواعد" : "Toutes les bases")
      : (isAr ? `${selectedCount} قاعدة مختارة` : `${selectedCount} base${selectedCount > 1 ? "s" : ""} sélectionnée${selectedCount > 1 ? "s" : ""}`);

  return (
    <DigitalLibraryLayout>
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
        {/* Hero Section */}
        <section
          className="relative py-16 overflow-hidden"
          style={{
            backgroundImage: `url(${cmsSettings?.hero_image_url || federatedSearchBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay sombre pour lisibilité */}
          <div className="absolute inset-0 bg-bn-blue-primary/70 backdrop-blur-[2px]" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-12 h-12 border border-gold-bn-primary/60 rounded-lg mb-6 bg-gold-bn-primary/10">
                <Icon name="mdi:magnify-expand" className="w-6 h-6 text-gold-bn-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-gilda text-white mb-3 drop-shadow-lg">
                {isAr ? (cmsSettings?.title_ar || "البحث في الموارد الإلكترونية") : (cmsSettings?.title_fr || "Recherche fédérée")}
              </h1>
              <p className="text-white/80 max-w-2xl mx-auto text-lg">
                {isAr
                  ? (cmsSettings?.subtitle_ar || "ابحث في جميع قواعد البيانات الإلكترونية في وقت واحد")
                  : (cmsSettings?.subtitle_fr || "Interrogez simultanément toutes les bases de données électroniques")}
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="flex gap-3"
              >
                <div className="relative flex-1">
                  <Icon
                    name="mdi:magnify"
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
                  />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      isAr
                        ? "ابحث عن مقالات، كتب، مجلات..."
                        : "Rechercher des articles, livres, revues..."
                    }
                    className="h-14 pl-12 pr-4 text-lg rounded-xl border-2 border-muted-foreground/20 focus-visible:border-bn-blue-primary shadow-lg"
                    dir={isAr ? "rtl" : "ltr"}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!query.trim()}
                  className="h-14 px-8 text-lg rounded-xl bg-gradient-to-r from-bn-blue-primary to-bn-blue-primary/80 hover:from-bn-blue-primary/90 hover:to-bn-blue-primary/70 shadow-lg"
                >
                  <Icon name="mdi:magnify" className="h-5 w-5 mr-2" />
                  {isAr ? "بحث" : "Rechercher"}
                </Button>
              </form>

              {/* Info-bulle temporaire pour tester les exemples */}
              <ExamplesButton isAr={isAr} setQuery={setQuery} />

              {/* Multi-select dropdown for databases */}
              {activeBundles && activeBundles.length > 0 && (
                <div className="mt-4" ref={dropdownRef}>
                  <p className="text-sm font-medium text-white/80 mb-2">
                    {isAr ? "اختر قواعد البيانات للاستجواب" : "Sélectionnez les bases à interroger"}
                  </p>
                  {/* Trigger */}
                  <button
                    ref={triggerRef}
                    type="button"
                    onClick={openDropdown}
                    className="w-full flex items-center justify-between h-12 px-4 rounded-xl border-2 border-white/30 bg-white/15 hover:bg-white/20 hover:border-white/50 transition-colors focus:outline-none focus:border-white text-sm backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Icon name="mdi:database-search" className="h-4 w-4 text-white/70" />
                      <span className="text-white/90 font-medium">
                        {dropdownLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedCount > 0 && selectedCount < (activeBundles?.length || 0) && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white text-bn-blue-primary text-xs font-bold">
                          {selectedCount}
                        </span>
                      )}
                      <Icon
                        name="mdi:chevron-down"
                        className={`h-4 w-4 text-white/70 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>

                  {/* Dropdown panel - fixed positioning to avoid overflow clipping */}
                  {dropdownOpen && (
                    <div
                      ref={dropdownRef}
                      style={{
                        position: "fixed",
                        top: `${dropdownPos.top}px`,
                        left: `${dropdownPos.left}px`,
                        width: `${dropdownPos.width}px`,
                        zIndex: 99999,
                        background: "white",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "12px",
                        overflow: "hidden",
                      }}
                    >
                      {/* Header actions */}
                      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
                        <span className="text-xs text-muted-foreground font-medium">
                          {isAr ? "اختر قواعد البيانات" : "Bases de données disponibles"}
                        </span>
                        <button
                          type="button"
                          onClick={selectAll}
                          className="text-xs text-bn-blue-primary hover:underline font-medium"
                        >
                          {selectedProviders.size === activeBundles.length
                            ? (isAr ? "إلغاء الكل" : "Désélectionner tout")
                            : (isAr ? "تحديد الكل" : "Tout sélectionner")}
                        </button>
                      </div>
                      {/* Options list */}
                      <div className="max-h-72 overflow-y-auto">
                        {activeBundles.map((bundle) => {
                          const key = bundle.provider?.toLowerCase().trim() || "";
                          const isSelected = selectedProviders.has(bundle.id);
                          const localLogo = key ? providerLogoMap[key] : null;
                          const logoSrc = localLogo || bundle.provider_logo_url;
                          const needsDark = darkBackgroundProviders.includes(key);
                          const bundleName = isAr && bundle.name_ar ? bundle.name_ar : bundle.name;
                          return (
                            <button
                              key={bundle.id}
                              type="button"
                              onClick={() => toggleProvider(bundle.id)}
                              className={`w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-accent transition-colors ${isSelected ? "bg-bn-blue-primary/5" : ""}`}
                            >
                              {/* Checkbox visuel */}
                              <div className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-bn-blue-primary border-bn-blue-primary" : "border-muted-foreground/40"}`}>
                                {isSelected && <Icon name="mdi:check" className="h-3 w-3 text-primary-foreground" />}
                              </div>
                              {/* Logo — zone fixe uniforme */}
                              <div className={`flex-shrink-0 flex items-center justify-center rounded-lg ${needsDark ? "bg-bn-blue-primary" : "bg-muted"}`}
                                style={{ width: 64, height: 36 }}>
                                {logoSrc ? (
                                  <img src={logoSrc} alt={bundle.provider || ""} className="object-contain" style={{ maxHeight: 24, maxWidth: 52 }} />
                                ) : (
                                  <Icon name={providerIcons[key] || "mdi:book-open-variant"} className="h-5 w-5 text-foreground/70" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-foreground">{bundleName}</span>
                                {!!bundle.document_count && bundle.document_count > 0 && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    {bundle.document_count > 1000 ? `+${Math.floor(bundle.document_count / 1000)}K` : bundle.document_count} docs
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {/* Footer */}
                      <div className="px-4 py-2 border-t border-border bg-muted/30">
                        <p className="text-xs text-muted-foreground italic">
                          {selectedProviders.size === 0
                            ? (isAr ? "جميع القواعد سيتم استجوابها" : "Toutes les bases seront interrogées si aucune n'est sélectionnée")
                            : (isAr ? `سيتم البحث في ${selectedProviders.size} قاعدة بيانات` : `${selectedProviders.size} base${selectedProviders.size > 1 ? "s" : ""} sélectionnée${selectedProviders.size > 1 ? "s" : ""}`)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Results Section - only rendered when a search has been made */}
        {hasSearched && (
          <section className="container mx-auto px-4 py-12">
            <AnimatePresence mode="wait">
              {results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
                    <div className="flex items-center gap-3">
                      <Icon name="mdi:format-list-checks" className="h-6 w-6 text-bn-blue-primary" />
                      <h2 className="text-2xl font-gilda text-foreground">
                        {isAr
                          ? `نتائج البحث عن "${query}" في ${results.length} قاعدة بيانات`
                          : `Résultats pour « ${query} » dans ${results.length} base${results.length > 1 ? "s" : ""}`}
                      </h2>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 border-muted-foreground/30 text-muted-foreground hover:text-foreground hover:border-foreground/40"
                      onClick={() => {
                        setHasSearched(false);
                        setResults([]);
                        setQuery("");
                        setSelectedProviders(new Set());
                      }}
                    >
                      <Icon name="mdi:refresh" className="h-4 w-4" />
                      {isAr ? "بدء بحث جديد" : "Nouvelle recherche"}
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {results.map((result, index) => {
                      const key = result.provider.provider?.toLowerCase().trim() || "";
                      const gradient = providerColors[key] || "from-gray-500 to-gray-600";
                      const iconName = providerIcons[key] || "mdi:book-open-variant";

                      return (
                        <motion.div
                          key={result.provider.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.08 }}
                        >
                          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-bn-blue-primary/30 overflow-hidden">
                            <div className={`h-2 bg-gradient-to-r ${gradient}`} />
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                                    <Icon name={iconName} className="h-6 w-6" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-lg text-foreground">
                                      {isAr && result.provider.name_ar
                                        ? result.provider.name_ar
                                        : result.provider.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                      {result.provider.provider}
                                    </p>
                                  </div>
                                </div>
                                {result.provider.document_count && result.provider.document_count > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {result.provider.document_count > 1000
                                      ? `+${Math.floor(result.provider.document_count / 1000)}K`
                                      : result.provider.document_count}{" "}
                                    docs
                                  </Badge>
                                )}
                              </div>

                              <p className="text-sm text-muted-foreground mb-5 line-clamp-2">
                                {isAr
                                  ? result.provider.description_ar || result.provider.description
                                  : result.provider.description}
                              </p>

                              <a href={result.url} target="_blank" rel="noopener noreferrer" className="block">
                                <Button className="w-full gap-2 bg-gradient-to-r from-bn-blue-primary to-bn-blue-primary/80 hover:from-bn-blue-primary/90 hover:to-bn-blue-primary/70 group-hover:shadow-lg transition-all">
                                  <Icon name="mdi:magnify" className="h-4 w-4" />
                                  {isAr
                                    ? `البحث في ${result.provider.name}`
                                    : `Rechercher dans ${result.provider.name}`}
                                  <Icon name="mdi:open-in-new" className="h-4 w-4 opacity-60" />
                                </Button>
                              </a>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Open all button */}
                  <div className="text-center mt-8">
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 border-2 border-gold-bn-primary/50 text-gold-bn-primary hover:bg-gold-bn-primary/5"
                      onClick={() => {
                        results.forEach((r) => {
                          if (r.url && r.url !== "#") window.open(r.url, "_blank");
                        });
                      }}
                    >
                      <Icon name="mdi:open-in-new" className="h-5 w-5" />
                      {isAr
                        ? "فتح جميع النتائج في علامات تبويب جديدة"
                        : "Ouvrir tous les résultats dans de nouveaux onglets"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {results.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                  <Icon name="mdi:database-off-outline" className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                  <p className="text-lg text-muted-foreground">
                    {isAr ? "لم يتم العثور على قواعد بيانات مطابقة" : "Aucune base de données sélectionnée"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        {/* Carrousel Ressources Électroniques */}
        {activeBundles && activeBundles.length > 0 && (
          <section className="py-20 bg-gradient-to-b from-muted to-background relative overflow-hidden" style={{ zIndex: 0, isolation: "auto" }}>
            <div className="absolute bottom-0 left-0 w-64 h-64 opacity-10">
              <div className="w-full h-full bg-gradient-to-tr from-gold-bn-primary/30 to-transparent rounded-full blur-3xl" />
            </div>
            <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10">
              <div className="w-full h-full bg-gradient-to-tl from-gold-bn-primary/30 to-transparent rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
              {/* Header */}
              <div className="text-center mb-14">
                <div className="inline-flex items-center justify-center w-12 h-12 border border-gold-bn-primary rounded-lg mb-6">
                  <Icon name="mdi:select-multiple" className="w-6 h-6 text-gold-bn-primary" />
                </div>
                <h2 className="text-[48px] font-normal text-foreground font-gilda">
                  {isAr ? "الموارد الإلكترونية" : "Ressources électroniques"}
                </h2>
                {/* Badge nombre de bouquets */}
                <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-gold-bn-primary/10 border border-gold-bn-primary/30">
                  <Icon name="mdi:bookshelf" className="h-4 w-4 text-gold-bn-primary" />
                  <span className="text-sm font-semibold text-gold-bn-primary">
                    {activeBundles.length} {isAr ? "bouquet électronique" : activeBundles.length > 1 ? "bouquets électroniques" : "bouquet électronique"}
                  </span>
                </div>
                <p className="font-body text-regular text-muted-foreground max-w-2xl mx-auto mt-4">
                  {isAr
                    ? "تتيح هذه الموارد مركزة ومشاركة التراث الوثائقي والثقافي على المستوى الدولي"
                    : "Ces ressources permettent la centralisation et le partage du patrimoine documentaire et culturel à l'échelle internationale"}
                </p>
              </div>

              {/* Carrousel dynamique */}
              <div className="relative px-16">
                {/* Flèche gauche */}
                <button
                  onClick={() => setRepoCarouselIndex(prev => Math.max(0, prev - 1))}
                  disabled={repoCarouselIndex === 0}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  aria-label="Précédent"
                >
                  <Icon name="mdi:chevron-left" className="h-6 w-6" />
                </button>

                {/* Slides */}
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${repoCarouselIndex * 100}%)` }}
                  >
                    {Array.from({ length: Math.ceil(activeBundles.length / itemsPerPage) }, (_, pageIdx) => (
                      <div key={pageIdx} className="flex flex-shrink-0 w-full">
                        {activeBundles.slice(pageIdx * itemsPerPage, (pageIdx + 1) * itemsPerPage).map((bundle) => {
                          const providerKey = bundle.provider?.toLowerCase().trim();
                          const localLogo = providerKey ? providerLogoMap[providerKey] : null;
                          const logoSrc = localLogo || bundle.provider_logo_url;
                          const needsDarkBackground = providerKey && darkBackgroundProviders.includes(providerKey);
                          const resourceUrl = bundle.api_base_url || bundle.website_url || '#';
                          const description = isAr && bundle.description_ar ? bundle.description_ar : bundle.description || '';
                          const bundleName = isAr && bundle.name_ar ? bundle.name_ar : bundle.name;

                          return (
                            <div key={bundle.id} className="flex-1 px-4">
                              <FancyTooltip
                                content={bundle.provider || bundle.name}
                                description={description}
                                icon="mdi:book-open-variant"
                                side="top"
                                variant="gold"
                              >
                                <Card className="bg-card border-0 rounded-xl shadow-[0_6px_24px_hsl(0_0%_0%_/0.12)] hover:shadow-[0_12px_40px_hsl(0_0%_0%_/0.18)] hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                                  <CardContent className="p-8 flex flex-col items-center justify-center">
                                    <div className={`flex items-center justify-center h-[80px] ${needsDarkBackground ? 'bg-bn-blue-primary rounded-lg px-4' : ''}`}>
                                      {logoSrc ? (
                                        <img
                                          src={logoSrc}
                                          alt={bundleName}
                                          className="h-[50px] max-w-[200px] object-contain"
                                        />
                                      ) : (
                                        <div className="font-heading text-[42px] font-semibold text-bn-blue-primary tracking-wide">
                                          {bundle.provider || bundle.name}
                                        </div>
                                      )}
                                    </div>
                                    {!!bundle.document_count && bundle.document_count > 0 && (
                                      <span className="mt-3 text-xs text-muted-foreground font-medium">
                                        {bundle.document_count > 1000 ? `+${Math.floor(bundle.document_count / 1000)}K` : bundle.document_count} docs
                                      </span>
                                    )}
                                    <a
                                      href={resourceUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mt-4 inline-flex items-center gap-2 px-6 py-2 rounded-md bg-gold-bn-surface text-bn-blue-primary text-sm font-medium hover:bg-gold-bn-primary/20 transition-colors"
                                    >
                                      {isAr ? "استكشاف" : "Explorer"} <Icon name="mdi:chevron-right" className="h-4 w-4" />
                                    </a>
                                  </CardContent>
                                </Card>
                              </FancyTooltip>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flèche droite */}
                <button
                  onClick={() => setRepoCarouselIndex(prev => Math.min(maxCarouselIndex, prev + 1))}
                  disabled={repoCarouselIndex >= maxCarouselIndex}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  aria-label="Suivant"
                >
                  <Icon name="mdi:chevron-right" className="h-6 w-6" />
                </button>
              </div>

              {/* Pagination */}
              {maxCarouselIndex > 0 && (
                <div className="flex justify-center gap-3 mt-14">
                  {Array.from({ length: maxCarouselIndex + 1 }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => setRepoCarouselIndex(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${repoCarouselIndex === index ? 'bg-gold-bn-primary' : 'bg-muted-foreground/25 hover:bg-muted-foreground/40'}`}
                      aria-label={`Aller à la page ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </DigitalLibraryLayout>
  );
}

// Wrapper qui force un remontage complet à chaque navigation (location.key change)
export default function FederatedSearch() {
  const location = useLocation();
  return <FederatedSearchInner key={location.key} />;
}
