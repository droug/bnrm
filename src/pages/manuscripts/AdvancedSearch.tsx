import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Search, RotateCcw, BookOpen, FileText, Calendar, Library, Loader2,
  Filter, SearchX, MessageSquarePlus, Send, CheckCircle2, Lock, Clock,
  Phone, Mail, MapPin, ChevronDown, ChevronUp, Scroll
} from "lucide-react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SearchPagination } from "@/components/ui/search-pagination";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { moroccanRegions, getCitiesByRegion } from "@/data/moroccanRegions";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { toast as sonnerToast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

const NOTE_TYPES = [
  { value: "information", label: "Information complémentaire" },
  { value: "erreur", label: "Erreur ou inexactitude" },
  { value: "suggestion", label: "Suggestion d'amélioration" },
  { value: "signalement", label: "Signalement de contenu" },
];

export default function ManuscriptAdvancedSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const { data: contactSettings } = useQuery({
    queryKey: ["advanced-search-contact-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("cms_portal_settings")
        .select("setting_value")
        .eq("setting_key", "advanced_search_contact")
        .maybeSingle();
      return data?.setting_value as { email?: string; phone?: string; phone_display?: string; address?: string; hours?: string } | null;
    },
  });

  const contactEmail = contactSettings?.email || "manuscrits@bnrm.ma";
  const contactPhone = contactSettings?.phone || "+212537279800";
  const contactPhoneDisplay = contactSettings?.phone_display || "+212 5 37 27 98 00";
  const contactAddress = contactSettings?.address || "Avenue Ibn Batouta, Rabat";
  const contactHours = contactSettings?.hours || "Du lundi au vendredi, 8h30 – 18h00";

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalResults, setTotalResults] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Empty-state note form
  const [noteExpanded, setNoteExpanded] = useState(false);
  const [noteType, setNoteType] = useState("information");
  const [noteSubject, setNoteSubject] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteSubmitted, setNoteSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    keyword: "",
    author: "",
    title: "",
    language: "",
    period: "",
    genre: "",
    cote: "",
    source: "",
    historicalPeriod: "",
    material: "",
    status: "",
    region: "",
    ville: "",
    entite: "",
  });

  // Count active filters (exclude keyword which is in the main bar)
  const activeFiltersCount = Object.entries(formData).filter(([key, value]) => {
    if (key === "keyword") return false;
    return !!value;
  }).length;

  const performSearch = useCallback(async () => {
    const params = Object.fromEntries(searchParams.entries());
    const hasFilters = Object.keys(params).length > 0;

    setIsSearching(true);
    try {
      let baseQuery: any = supabase
        .from("manuscripts")
        .select("*", { count: "exact" })
        .eq("is_visible", true);

      if (params.keyword) {
        const term = params.keyword.replace(/['"\\%]/g, "");
        baseQuery = baseQuery.or(
          `title.ilike.%${term}%,author.ilike.%${term}%,description.ilike.%${term}%,full_text_content.ilike.%${term}%`
        );
      }
      if (params.author) baseQuery = baseQuery.ilike("author", `%${params.author}%`);
      if (params.title) baseQuery = baseQuery.ilike("title", `%${params.title}%`);
      if (params.language) baseQuery = baseQuery.eq("language", params.language);
      if (params.period) baseQuery = baseQuery.eq("period", params.period);
      if (params.genre) baseQuery = baseQuery.eq("genre", params.genre);
      if (params.cote) baseQuery = baseQuery.ilike("cote", `%${params.cote}%`);
      if (params.source) baseQuery = baseQuery.eq("source", params.source);
      if (params.historicalPeriod) baseQuery = baseQuery.eq("historical_period", params.historicalPeriod);
      if (params.material) baseQuery = baseQuery.ilike("material", `%${params.material}%`);
      if (params.status) baseQuery = baseQuery.eq("status", params.status);
      if (params.region) baseQuery = baseQuery.eq("region", params.region);
      if (params.ville) baseQuery = baseQuery.eq("ville", params.ville);
      if (params.entite) baseQuery = baseQuery.ilike("entite", `%${params.entite}%`);

      const { data, error, count } = await baseQuery.range(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage - 1
      );

      if (error) throw error;

      setTotalResults(count || 0);
      setSearchResults(data || []);

      if (hasFilters) setHasSearched(true);

      if ((data || []).length === 0 && hasFilters) {
        toast({
          title: "Aucun résultat",
          description: "Aucun manuscrit ne correspond à vos critères de recherche.",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [searchParams, currentPage, itemsPerPage, toast]);

  useEffect(() => { performSearch(); }, [performSearch]);
  useEffect(() => {
    if (searchParams.toString() === "") performSearch();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const qs = params.toString();
    if (qs) {
      navigate(`/manuscripts/search?${qs}`);
    } else {
      setCurrentPage(1);
      performSearch();
    }
  };

  const handleReset = () => {
    setFormData({
      keyword: "", author: "", title: "", language: "", period: "",
      genre: "", cote: "", source: "", historicalPeriod: "", material: "",
      status: "", region: "", ville: "", entite: "",
    });
    setSearchResults([]);
    setTotalResults(0);
    setCurrentPage(1);
    setHasSearched(false);
    navigate("/manuscripts/search");
  };

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteSubject.trim() || !noteContent.trim()) {
      sonnerToast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setNoteSubmitting(true);
    try {
      const { error } = await supabase.from("document_reader_notes" as any).insert({
        document_id: "search-query",
        document_title: `Recherche manuscrits : ${searchParams.get("keyword") || searchParams.toString() || "(sans terme)"}`,
        document_type: "manuscript",
        user_id: user?.id || null,
        note_type: noteType,
        subject: noteSubject.trim(),
        content: noteContent.trim(),
        status: "nouveau",
      });
      if (error) throw error;
      setNoteSubmitted(true);
      setNoteSubject("");
      setNoteContent("");
      setNoteType("information");
      sonnerToast.success("Votre information a été transmise au responsable.");
    } catch (err) {
      console.error("Error submitting reader note:", err);
      sonnerToast.error("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
    } finally {
      setNoteSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-amber-300 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-5">
                <Scroll className="h-4 w-4 text-amber-300" />
                <span className="text-sm font-medium text-white/90">Plateforme des Manuscrits — BNRM</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Recherche de Manuscrits
              </h1>
              <p className="text-lg text-white/80 leading-relaxed">
                Explorez notre patrimoine manuscrit à travers des milliers de documents historiques
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 32.5C840 35 960 40 1080 42.5C1200 45 1320 45 1380 45L1440 45V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" className="fill-background" />
            </svg>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-5xl -mt-4 relative z-20">
          <form onSubmit={handleSubmit}>
            {/* Main Search Bar */}
            <Card className="mb-4 shadow-xl border-0 bg-card/95 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-5">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par mot-clé, titre, auteur, description..."
                      value={formData.keyword}
                      onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                      className="h-14 pl-12 text-base border-2 focus-visible:border-amber-700 rounded-xl"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="h-14 px-8 bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Rechercher
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Filters Button */}
            <div className="mb-6 flex items-center gap-3">
              <Sheet open={showAdvanced} onOpenChange={setShowAdvanced}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2 h-11 border-2">
                    <Filter className="h-4 w-4" />
                    Filtres avancés
                    {activeFiltersCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-800 text-white">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                {activeFiltersCount > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Effacer les filtres
                  </Button>
                )}

                <SheetContent side="right" className="w-full sm:w-[520px] sm:max-w-[520px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                        <Filter className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                      </div>
                      Filtres avancés — Manuscrits
                    </SheetTitle>
                  </SheetHeader>

                  <div className="space-y-6 mt-6">
                    {/* Tips */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40">
                        <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-amber-600 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          Combinez <strong className="text-foreground">plusieurs filtres</strong> pour affiner
                        </p>
                      </div>
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40">
                        <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-amber-600 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          La recherche est <strong className="text-foreground">insensible à la casse</strong>
                        </p>
                      </div>
                    </div>

                    {/* Titre & Auteur */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Titre du manuscrit</Label>
                        <Input
                          placeholder="Titre complet ou partiel"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Auteur</Label>
                        <Input
                          placeholder="Nom de l'auteur ou du copiste"
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                          className="h-11"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Langue & Thématique */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Langue</Label>
                        <AutocompleteInput
                          source="langues_manuscrits"
                          value={formData.language}
                          onChange={(value) => setFormData({ ...formData, language: value })}
                          placeholder="Arabe, Amazigh, Hébreu..."
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Thématique / Genre</Label>
                        <AutocompleteInput
                          source="thematique_manuscrits"
                          value={formData.genre}
                          onChange={(value) => setFormData({ ...formData, genre: value })}
                          placeholder="Fiqh, Histoire, Littérature..."
                          className="h-11"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Période */}
                    <div>
                      <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Période historique
                      </Label>
                      <div className="grid grid-cols-1 gap-4 mt-3">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Période (siècle / époque)</Label>
                          <Input
                            placeholder="Ex: XIVe siècle, Époque mérinide..."
                            value={formData.period}
                            onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Période historique précise</Label>
                          <Input
                            placeholder="Ex: Mérinide, Saadien, Alaouite..."
                            value={formData.historicalPeriod}
                            onChange={(e) => setFormData({ ...formData, historicalPeriod: e.target.value })}
                            className="h-10"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Identifiants */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Cote</Label>
                        <Input
                          placeholder="Numéro de cote"
                          value={formData.cote}
                          onChange={(e) => setFormData({ ...formData, cote: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Matériau / Support</Label>
                        <Input
                          placeholder="Ex: Parchemin, Papier, Papyrus..."
                          value={formData.material}
                          onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">État de conservation</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => setFormData({ ...formData, status: value })}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Tous les états" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-[9999]">
                            <SelectItem value="excellent">Excellent</SelectItem>
                            <SelectItem value="bon">Bon</SelectItem>
                            <SelectItem value="moyen">Moyen</SelectItem>
                            <SelectItem value="mauvais">Mauvais</SelectItem>
                            <SelectItem value="fragmentaire">Fragmentaire</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    {/* Entité source / Localisation */}
                    <div>
                      <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Library className="h-4 w-4" />
                        Entité source
                      </Label>
                      <div className="space-y-4 mt-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Région</Label>
                            <Select
                              value={formData.region}
                              onValueChange={(value) => setFormData({ ...formData, region: value, ville: "" })}
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Toutes" />
                              </SelectTrigger>
                              <SelectContent className="bg-background z-[9999]">
                                {moroccanRegions.map((region) => (
                                  <SelectItem key={region.name} value={region.name}>
                                    {region.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Ville</Label>
                            <Select
                              value={formData.ville}
                              onValueChange={(value) => setFormData({ ...formData, ville: value })}
                              disabled={!formData.region}
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder={formData.region ? "Sélectionner" : "Région d'abord"} />
                              </SelectTrigger>
                              <SelectContent className="bg-background z-[9999]">
                                {formData.region && getCitiesByRegion(formData.region).map((city) => (
                                  <SelectItem key={city} value={city}>{city}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Entité / Institution</Label>
                          <Input
                            placeholder="Bibliothèque, Zaouïa, Institution..."
                            value={formData.entite}
                            onChange={(e) => setFormData({ ...formData, entite: e.target.value })}
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Source</Label>
                          <Input
                            placeholder="Source de provenance"
                            value={formData.source}
                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            className="h-11"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit inside sheet */}
                    <div className="flex gap-3 pt-2 pb-4">
                      <Button
                        type="button"
                        onClick={(e) => {
                          setShowAdvanced(false);
                          handleSubmit(e as any);
                        }}
                        className="flex-1 h-12 bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-lg transition-all duration-300"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Appliquer les filtres
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        className="h-12 border-2"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Réinitialiser
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </form>

          {/* Search Results — loading */}
          {isSearching && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-600 to-amber-400 blur-xl opacity-30 animate-pulse" />
                <div className="relative p-6 rounded-full bg-amber-50 dark:bg-amber-900/20">
                  <Loader2 className="h-12 w-12 animate-spin text-amber-700 dark:text-amber-400" />
                </div>
              </div>
              <span className="mt-6 text-lg font-medium text-foreground">Recherche en cours...</span>
              <span className="text-sm text-muted-foreground">Exploration des collections manuscrites</span>
            </div>
          )}

          {/* Results */}
          {!isSearching && searchResults.length > 0 && (
            <Card className="mt-4 shadow-xl border-0 bg-card/95 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-800/5 via-transparent to-amber-600/5 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-amber-800 to-amber-700 shadow-lg">
                        <Scroll className="h-5 w-5 text-white" />
                      </div>
                      Résultats de recherche
                    </CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-700/10 text-amber-700 dark:text-amber-400 font-semibold text-sm">
                        {totalResults}
                      </span>
                      manuscrit(s) trouvé(s)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <SearchPagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalResults / itemsPerPage)}
                  totalItems={totalResults}
                  itemsPerPage={itemsPerPage}
                  onPageChange={(page) => setCurrentPage(page)}
                  onItemsPerPageChange={(items) => { setItemsPerPage(items); setCurrentPage(1); }}
                />

                <div className="grid gap-4">
                  {searchResults.map((manuscript, index) => (
                    <Card
                      key={manuscript.id}
                      className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-amber-600 overflow-hidden"
                    >
                      <CardContent className="p-0">
                        <div className="flex">
                          <div className="hidden sm:flex w-24 bg-gradient-to-br from-amber-800/10 to-amber-600/10 items-center justify-center flex-shrink-0">
                            <div className="p-3 rounded-xl bg-white/80 dark:bg-background/80 shadow-sm group-hover:scale-110 transition-transform duration-300">
                              <BookOpen className="h-8 w-8 text-amber-700" />
                            </div>
                          </div>
                          <div className="flex-1 p-5">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                    #{index + 1 + (currentPage - 1) * itemsPerPage}
                                  </span>
                                  {manuscript.genre && (
                                    <span className="text-xs px-2.5 py-1 bg-amber-700/10 text-amber-700 dark:text-amber-400 rounded-full font-medium">
                                      {manuscript.genre}
                                    </span>
                                  )}
                                </div>
                                <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1 group-hover:text-amber-700 transition-colors">
                                  {manuscript.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  <span className="font-medium">Par</span> {manuscript.author || "Auteur inconnu"}
                                  {manuscript.period && (
                                    <>
                                      <span className="mx-2">•</span>
                                      <span className="font-medium">{manuscript.period}</span>
                                    </>
                                  )}
                                </p>
                                {manuscript.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                    {manuscript.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-2">
                                  {manuscript.language && (
                                    <span className="text-xs px-2 py-1 bg-muted rounded-lg">
                                      {manuscript.language}
                                    </span>
                                  )}
                                  {manuscript.cote && (
                                    <span className="text-xs px-2 py-1 bg-muted rounded-lg font-mono">
                                      Cote: {manuscript.cote}
                                    </span>
                                  )}
                                  {manuscript.material && (
                                    <span className="text-xs px-2 py-1 bg-amber-700/5 text-amber-700 dark:text-amber-400 rounded-lg">
                                      {manuscript.material}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Link to={`/manuscrit/${manuscript.permalink || manuscript.id}`} className="flex-shrink-0">
                                <Button className="bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-md hover:shadow-lg transition-all">
                                  Consulter
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <SearchPagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalResults / itemsPerPage)}
                  totalItems={totalResults}
                  itemsPerPage={itemsPerPage}
                  onPageChange={(page) => setCurrentPage(page)}
                  onItemsPerPageChange={(items) => { setItemsPerPage(items); setCurrentPage(1); }}
                />
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {!isSearching && hasSearched && searchResults.length === 0 && (
            <div className="mt-8 space-y-6">
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="p-5 rounded-full bg-muted/60 border border-border">
                  <SearchX className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Aucun manuscrit trouvé</h2>
                  <p className="text-muted-foreground max-w-md text-sm">
                    Votre recherche ne correspond à aucun manuscrit dans nos collections. Vous pouvez élargir vos critères ou utiliser les options ci-dessous pour obtenir de l'aide.
                  </p>
                </div>
                <Button variant="outline" onClick={handleReset} className="gap-2 border-2">
                  <RotateCcw className="h-4 w-4" />
                  Réinitialiser la recherche
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Transmettre une information */}
                <Card className="border-dashed border-2 border-primary/25 bg-primary/5">
                  <CardHeader className="pb-3">
                    <button
                      type="button"
                      className="flex items-center justify-between w-full text-left"
                      onClick={() => setNoteExpanded((prev) => !prev)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <MessageSquarePlus className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">Transmettre une information</CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                            <Lock className="h-3 w-3" />
                            Confidentiel — visible uniquement par le responsable
                          </p>
                        </div>
                      </div>
                      {noteExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                  </CardHeader>

                  <AnimatePresence>
                    {noteExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <CardContent className="pt-0">
                          <Separator className="mb-4" />
                          <AnimatePresence mode="wait">
                            {noteSubmitted ? (
                              <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-4 py-6 text-center"
                              >
                                <div className="p-4 rounded-full bg-primary/10">
                                  <CheckCircle2 className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground">Information transmise avec succès</p>
                                  <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    Un responsable examinera votre message prochainement.
                                  </p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => { setNoteSubmitted(false); setNoteExpanded(true); }}>
                                  <MessageSquarePlus className="h-3.5 w-3.5 mr-2" />
                                  Envoyer une autre information
                                </Button>
                              </motion.div>
                            ) : (
                              <motion.form
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleNoteSubmit}
                                className="space-y-4"
                              >
                                {user && (
                                  <div className="rounded-lg bg-muted/50 border px-4 py-3 space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Vos informations (transmises au responsable)</p>
                                    <p className="text-sm font-medium">
                                      {profile?.first_name} {profile?.last_name}
                                      {user.email && <span className="text-muted-foreground font-normal"> — {user.email}</span>}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Contexte : <span className="font-medium text-foreground">
                                        Recherche sans résultat — {searchParams.get("keyword") || searchParams.toString() || "aucun terme"}
                                      </span>
                                    </p>
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <Label htmlFor="s-note-type">Type d'information <span className="text-destructive">*</span></Label>
                                  <Select value={noteType} onValueChange={setNoteType}>
                                    <SelectTrigger id="s-note-type">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {NOTE_TYPES.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="s-note-subject">Objet <span className="text-destructive">*</span></Label>
                                  <Input
                                    id="s-note-subject"
                                    value={noteSubject}
                                    onChange={(e) => setNoteSubject(e.target.value)}
                                    placeholder="Résumez votre information en quelques mots"
                                    maxLength={200}
                                    required
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="s-note-content">Détails <span className="text-destructive">*</span></Label>
                                  <Textarea
                                    id="s-note-content"
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    placeholder="Décrivez l'information que vous souhaitez transmettre..."
                                    rows={4}
                                    maxLength={2000}
                                    required
                                    className="resize-none"
                                  />
                                  <p className="text-xs text-muted-foreground text-right">{noteContent.length}/2000</p>
                                </div>

                                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted border text-muted-foreground">
                                  <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <p className="text-xs">
                                    Cette information est <strong>strictement confidentielle</strong> et sera uniquement consultée par le responsable désigné.
                                  </p>
                                </div>

                                <div className="flex justify-end gap-3">
                                  <Button type="button" variant="ghost" size="sm" onClick={() => setNoteExpanded(false)} disabled={noteSubmitting}>
                                    Annuler
                                  </Button>
                                  <Button type="submit" disabled={noteSubmitting || !noteSubject.trim() || !noteContent.trim()}>
                                    {noteSubmitting ? (
                                      <>
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                        Envoi en cours...
                                      </>
                                    ) : (
                                      <>
                                        <Send className="h-4 w-4 mr-2" />
                                        Transmettre au responsable
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </motion.form>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>

                {/* Contact */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-700/10">
                        <Phone className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Obtenir des informations</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Contactez directement nos équipes
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <Separator />
                    <p className="text-sm text-muted-foreground">
                      Notre équipe de spécialistes en manuscrits peut vous aider à localiser un document ou vous orienter vers les bonnes ressources patrimoniales.
                    </p>
                    <div className="space-y-3">
                      <a
                        href={`mailto:${contactEmail}`}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                      >
                        <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Email</p>
                          <p className="text-sm font-medium text-foreground">{contactEmail}</p>
                        </div>
                      </a>
                      <a
                        href={`tel:${contactPhone}`}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                      >
                        <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Téléphone</p>
                          <p className="text-sm font-medium text-foreground">{contactPhoneDisplay}</p>
                        </div>
                      </a>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                        <div className="p-2 rounded-full bg-primary/10">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Adresse</p>
                          <p className="text-sm font-medium text-foreground">{contactAddress}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-700/5 border border-amber-700/20 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Horaires :</span> {contactHours}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
