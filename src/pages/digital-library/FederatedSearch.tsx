import { useState, useCallback } from "react";
import { useElectronicBundles, ElectronicBundle } from "@/hooks/useElectronicBundles";
import { useLanguage } from "@/hooks/useLanguage";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

interface ProviderResult {
  provider: ElectronicBundle;
  status: "idle" | "loading" | "success" | "error";
  url?: string;
}

export default function FederatedSearch() {
  const { activeBundles } = useElectronicBundles();
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const [selectedProviders, setSelectedProviders] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<ProviderResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const isAr = language === "ar";

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

  return (
    <DigitalLibraryLayout>
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-br from-bn-blue-primary/10 via-background to-gold-bn-primary/5 overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-72 h-72 bg-bn-blue-primary rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold-bn-primary rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bn-blue-primary/10 text-bn-blue-primary text-sm font-medium mb-4">
                <Icon icon="mdi:magnify-expand" className="h-4 w-4" />
                {isAr ? "بحث فيدرالي" : "Recherche fédérée"}
              </div>
              <h1 className="text-4xl md:text-5xl font-gilda text-foreground mb-3">
                {isAr
                  ? "البحث في الموارد الإلكترونية"
                  : "Recherche fédérée"}
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                {isAr
                  ? "ابحث في جميع قواعد البيانات الإلكترونية في وقت واحد"
                  : "Interrogez simultanément toutes les bases de données électroniques"}
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
                    icon="mdi:magnify"
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
                  <Icon icon="mdi:magnify" className="h-5 w-5 mr-2" />
                  {isAr ? "بحث" : "Rechercher"}
                </Button>
              </form>
            </div>

            {/* Provider Selection */}
            {activeBundles && activeBundles.length > 0 && (
              <div className="max-w-3xl mx-auto mt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    {isAr ? "اختر قواعد البيانات" : "Sélectionnez les bases à interroger"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAll}
                    className="text-xs text-bn-blue-primary hover:text-bn-blue-primary/80"
                  >
                    {selectedProviders.size === activeBundles.length
                      ? isAr ? "إلغاء الكل" : "Désélectionner tout"
                      : isAr ? "تحديد الكل" : "Tout sélectionner"}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeBundles.map((bundle) => {
                    const key = bundle.provider?.toLowerCase().trim() || "";
                    const isSelected =
                      selectedProviders.size === 0 || selectedProviders.has(bundle.id);
                    return (
                      <label
                        key={bundle.id}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "border-bn-blue-primary/50 bg-bn-blue-primary/5 shadow-sm"
                            : "border-muted hover:border-muted-foreground/30 opacity-60"
                        }`}
                      >
                        <Checkbox
                          checked={selectedProviders.has(bundle.id)}
                          onCheckedChange={() => toggleProvider(bundle.id)}
                          className="h-4 w-4"
                        />
                        <Icon
                          icon={providerIcons[key] || "mdi:book-open-variant"}
                          className="h-4 w-4 text-foreground/70"
                        />
                        <span className="text-sm font-medium">
                          {isAr && bundle.name_ar ? bundle.name_ar : bundle.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {selectedProviders.size === 0 && (
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    {isAr
                      ? "جميع القواعد سيتم استجوابها"
                      : "Toutes les bases seront interrogées si aucune n'est sélectionnée"}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Results Section */}
        <section className="container mx-auto px-4 py-12">
          <AnimatePresence mode="wait">
            {hasSearched && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <Icon icon="mdi:format-list-checks" className="h-6 w-6 text-bn-blue-primary" />
                  <h2 className="text-2xl font-gilda text-foreground">
                    {isAr
                      ? `نتائج البحث عن "${query}" في ${results.length} قاعدة بيانات`
                      : `Résultats pour « ${query} » dans ${results.length} base${results.length > 1 ? "s" : ""}`}
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {results.map((result, index) => {
                    const key =
                      result.provider.provider?.toLowerCase().trim() || "";
                    const gradient =
                      providerColors[key] || "from-gray-500 to-gray-600";
                    const iconName =
                      providerIcons[key] || "mdi:book-open-variant";

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
                                  <Icon icon={iconName} className="h-6 w-6" />
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
                              {result.provider.document_count &&
                                result.provider.document_count > 0 && (
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

                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <Button className="w-full gap-2 bg-gradient-to-r from-bn-blue-primary to-bn-blue-primary/80 hover:from-bn-blue-primary/90 hover:to-bn-blue-primary/70 group-hover:shadow-lg transition-all">
                                <Icon icon="mdi:magnify" className="h-4 w-4" />
                                {isAr
                                  ? `البحث في ${result.provider.name}`
                                  : `Rechercher dans ${result.provider.name}`}
                                <Icon icon="mdi:open-in-new" className="h-4 w-4 opacity-60" />
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
                        if (r.url && r.url !== "#") {
                          window.open(r.url, "_blank");
                        }
                      });
                    }}
                  >
                    <Icon icon="mdi:open-in-new" className="h-5 w-5" />
                    {isAr
                      ? "فتح جميع النتائج في علامات تبويب جديدة"
                      : "Ouvrir tous les résultats dans de nouveaux onglets"}
                  </Button>
                </div>
              </motion.div>
            )}

            {hasSearched && results.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Icon icon="mdi:database-off-outline" className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-lg text-muted-foreground">
                  {isAr
                    ? "لم يتم العثور على قواعد بيانات مطابقة"
                    : "Aucune base de données sélectionnée"}
                </p>
              </motion.div>
            )}

            {!hasSearched && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Icon icon="mdi:cloud-search-outline" className="h-20 w-20 mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-lg text-muted-foreground">
                  {isAr
                    ? "أدخل مصطلح البحث للبدء"
                    : "Entrez un terme de recherche pour commencer"}
                </p>
                <p className="text-sm text-muted-foreground/60 mt-2">
                  {isAr
                    ? "سيتم البحث في جميع قواعد البيانات المشتركة في نفس الوقت"
                    : "La recherche sera lancée simultanément sur toutes les bases sélectionnées"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </DigitalLibraryLayout>
  );
}
