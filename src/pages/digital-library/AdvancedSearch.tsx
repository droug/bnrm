import { useState, useEffect, useCallback } from "react";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Search, RotateCcw, BookOpen, FileText, Calendar, Library, Loader2, Sparkles, Filter, X, SearchX, MessageSquarePlus, Send, CheckCircle2, Lock, Clock, Phone, Mail, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { TitleAutocomplete } from "@/components/ui/title-autocomplete";
import { AuthorAutocomplete } from "@/components/ui/author-autocomplete";
import { LanguageAutocomplete } from "@/components/ui/language-autocomplete";
import { CoteAutocomplete } from "@/components/ui/cote-autocomplete";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SearchPagination } from "@/components/ui/search-pagination";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { toast as sonnerToast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const NOTE_TYPES = [
  { value: "information", label: "Information complémentaire" },
  { value: "erreur", label: "Erreur ou inexactitude" },
  { value: "suggestion", label: "Suggestion d'amélioration" },
  { value: "signalement", label: "Signalement de contenu" },
];

export default function AdvancedSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { isLibrarian, loading: rolesLoading } = useSecureRoles();
  const { user, profile } = useAuth();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalResults, setTotalResults] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  // States for search-page reader note form
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
    publisher: "",
    series: "",
    subject: "",
    genre: "",
    keywords: "",
    classification: "",
    dateFrom: "",
    dateTo: "",
    monthFrom: "",
    monthTo: "",
    period: "",
    cote: "",
    isbn: "",
    issn: "",
    language: "",
    documentType: "",
    collection: "",
    edition: "",
    isRareBook: false,
  });

  const [isRareBookFilter, setIsRareBookFilter] = useState(false);

  // Fonction de recherche (inchangée)
  const performSearch = useCallback(async () => {
    if (rolesLoading) return;
    
    const params = Object.fromEntries(searchParams.entries());
    const hasFilters = Object.keys(params).length > 0;

    setIsSearching(true);
    try {
      let baseQuery: any = supabase
        .from('digital_library_documents')
        .select('*', { count: 'exact' })
        .is('deleted_at', null);
      
      if (!isLibrarian) {
        baseQuery = baseQuery.eq('publication_status', 'published');
      } else {
        baseQuery = baseQuery.in('publication_status', ['published', 'draft']);
      }
      
      if (params.keyword) {
        const term = params.keyword.replace(/['"\\%]/g, '');
        if (term.length > 0) {
          baseQuery = baseQuery.or(`title.ilike.%${term}%,title_ar.ilike.%${term}%,author.ilike.%${term}%`);
        }
      }
      
      if (params.author) {
        const author = params.author.replace(/['"\\%]/g, '');
        if (author.length > 0) {
          baseQuery = baseQuery.ilike('author', `%${author}%`);
        }
      }
      
      if (params.title) {
        const title = params.title.replace(/['"\\%]/g, '');
        if (title.length > 0) {
          baseQuery = baseQuery.or(`title.ilike.%${title}%,title_ar.ilike.%${title}%`);
        }
      }
      
      if (params.subject) {
        baseQuery = baseQuery.contains('themes', [params.subject]);
      }
      
      if (params.language) {
        baseQuery = baseQuery.eq('language', params.language);
      }
      
      if (params.documentType) {
        const typeVariantsMap: Record<string, string[]> = {
          'manuscript': ['manuscript', 'Manuscrit', 'manuscrit'],
          'lithography': ['lithography', 'Lithographie', 'lithographie'],
          'book': ['book', 'Livre', 'livre', 'rare_book', 'ebook', 'Imprimé'],
          'periodical': ['periodical', 'Périodique', 'periodique', 'Revue', 'revue', 'Journal', 'journal'],
          'specialized': ['image', 'Image', 'Cartes et Plans', 'cartes et plans', 'photo', 'Photo', 'affiche', 'Affiche', 'map', 'Map'],
          'audiovisual': ['audio', 'Audio', 'video', 'Vidéo', 'Video', 'audiovisual', 'Audiovisuel'],
        };
        
        const variants = typeVariantsMap[params.documentType];
        if (variants && variants.length > 0) {
          const orConditions = variants.map(v => `document_type.eq.${v}`).join(',');
          baseQuery = baseQuery.or(orConditions);
        } else {
          baseQuery = baseQuery.ilike('document_type', params.documentType);
        }
      }
      
      if (params.isRareBook === 'true') {
        baseQuery = baseQuery.eq('document_type', 'rare_book');
      }
      
      if (params.dateFrom) {
        baseQuery = baseQuery.gte('publication_year', parseInt(params.dateFrom));
      }
      if (params.dateTo) {
        baseQuery = baseQuery.lte('publication_year', parseInt(params.dateTo));
      }
      
      if (params.monthFrom) {
        const [year, month] = params.monthFrom.split('-');
        baseQuery = baseQuery.gte('created_at', `${year}-${month}-01`);
      }
      if (params.monthTo) {
        const [year, month] = params.monthTo.split('-');
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        baseQuery = baseQuery.lte('created_at', `${year}-${month}-${lastDay}`);
      }
      
      const { data, error, count } = await baseQuery.range(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage - 1
      );
      
      if (error) throw error;
      
      setTotalResults(count || 0);
      setSearchResults(data || []);
      
      if (hasFilters) {
        setHasSearched(true);
      }
      
      if ((data || []).length === 0 && hasFilters) {
        toast({
          title: "Aucun résultat",
          description: "Aucun document ne correspond à vos critères de recherche.",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [searchParams, currentPage, itemsPerPage, toast, isLibrarian, rolesLoading]);

  useEffect(() => {
    if (rolesLoading) return;
    performSearch();
  }, [performSearch, rolesLoading]);

  useEffect(() => {
    if (rolesLoading) return;
    if (searchParams.toString() === '') {
      performSearch();
    }
  }, [rolesLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value && key !== 'isRareBook') params.append(key, value as string);
    });
    
    if (isRareBookFilter) {
      params.append('isRareBook', 'true');
    }
    
    navigate(`/digital-library/search?${params.toString()}`);
  };

  const handleReset = () => {
    setFormData({
      keyword: "", author: "", title: "", publisher: "", series: "",
      subject: "", genre: "", keywords: "", classification: "",
      dateFrom: "", dateTo: "", monthFrom: "", monthTo: "", period: "",
      cote: "", isbn: "", issn: "",
      language: "", documentType: "", collection: "", edition: "", isRareBook: false,
    });
    setIsRareBookFilter(false);
    setSearchResults([]);
    setTotalResults(0);
    setCurrentPage(1);
    setHasSearched(false);
    navigate('/digital-library/search');
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
        document_title: `Recherche : ${searchParams.get('keyword') || searchParams.toString() || '(sans terme)'}`,
        document_type: "search",
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

  // Count active filters
  const activeFiltersCount = Object.entries(formData).filter(([key, value]) => {
    if (key === 'isRareBook') return false;
    if (key === 'keyword') return false; // keyword is in the main bar
    return !!value;
  }).length + (isRareBookFilter ? 1 : 0);

  return (
    <DigitalLibraryLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-bn-blue-primary via-bn-blue-deep to-bn-blue-primary overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-gold-bn-primary rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-bn-primary rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>
          
          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-5">
                <Search className="h-4 w-4 text-gold-bn-primary" />
                <span className="text-sm font-medium text-white/90">Bibliothèque Numérique Ibn Battûta</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Recherche Avancée
              </h1>
              <p className="text-lg text-white/80 leading-relaxed">
                Explorez plus de 50 000 documents dans nos collections patrimoniales
              </p>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 32.5C840 35 960 40 1080 42.5C1200 45 1320 45 1380 45L1440 45V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" className="fill-background"/>
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
                      placeholder="Rechercher par mot-clé, titre, auteur..."
                      value={formData.keyword}
                      onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                      className="h-14 pl-12 text-base border-2 focus-visible:border-bn-blue-primary rounded-xl"
                    />
                  </div>
                  <Button type="submit" size="lg" className="h-14 px-8 bg-gradient-to-r from-bn-blue-primary to-bn-blue-deep hover:from-bn-blue-deep hover:to-bn-blue-primary shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
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
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-bn-blue-primary text-white">
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
                      <div className="p-2 rounded-lg bg-gradient-to-br from-gold-bn-primary/20 to-gold-bn-primary/5">
                        <Filter className="h-4 w-4 text-gold-bn-primary" />
                      </div>
                      Filtres avancés
                    </SheetTitle>
                  </SheetHeader>

                  <div className="space-y-6 mt-6">
                    {/* Search Tips */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40">
                        <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-gold-bn-primary flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          Utilisez les <strong className="text-foreground">guillemets ""</strong> pour une expression exacte
                        </p>
                      </div>
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40">
                        <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-gold-bn-primary flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          Combinez <strong className="text-foreground">plusieurs filtres</strong> pour affiner
                        </p>
                      </div>
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40">
                        <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-gold-bn-primary flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          L'<strong className="text-foreground">autocomplétion</strong> suggère les valeurs existantes
                        </p>
                      </div>
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40">
                        <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-gold-bn-primary flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          La recherche est <strong className="text-foreground">insensible à la casse</strong>
                        </p>
                      </div>
                    </div>

                    {/* Title & Author */}
                    <div className="grid grid-cols-1 gap-5">
                      <TitleAutocomplete
                        label="Titre"
                        placeholder="Titre du document"
                        value={formData.title}
                        onChange={(value) => setFormData({ ...formData, title: value })}
                      />
                      <AuthorAutocomplete
                        label="Auteur"
                        placeholder="Nom de l'auteur"
                        value={formData.author}
                        onChange={(value) => setFormData({ ...formData, author: value })}
                      />
                    </div>

                    {/* Document type, Language, Subject */}
                    <div className="grid grid-cols-1 gap-5">
                      {!isRareBookFilter && (
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Type de document</Label>
                          <Select
                            value={formData.documentType}
                            onValueChange={(value) => setFormData({ ...formData, documentType: value })}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Tous les types" />
                            </SelectTrigger>
                            <SelectContent className="bg-background z-[9999]">
                              <SelectItem value="manuscript">Manuscrits</SelectItem>
                              <SelectItem value="lithography">Lithographies</SelectItem>
                              <SelectItem value="book">Livres (Rares, Imprimés & E-Books)</SelectItem>
                              <SelectItem value="periodical">Périodiques (Revues & Journaux)</SelectItem>
                              <SelectItem value="specialized">Cartes, Plans, Photos & Affiches</SelectItem>
                              <SelectItem value="audiovisual">Documents Audiovisuels</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <LanguageAutocomplete
                        label="Langue"
                        placeholder="Toutes les langues"
                        value={formData.language}
                        onChange={(value) => setFormData({ ...formData, language: value })}
                      />

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Sujet / Thématique</Label>
                        <Input
                          placeholder="Histoire, philosophie, sciences..."
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="h-11"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Date range */}
                    <div>
                      <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Période de publication
                      </Label>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Année de début</Label>
                          <Input
                            type="number"
                            placeholder="Ex: 1900"
                            min="1000"
                            max={new Date().getFullYear()}
                            value={formData.dateFrom}
                            onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Année de fin</Label>
                          <Input
                            type="number"
                            placeholder={`Ex: ${new Date().getFullYear()}`}
                            min="1000"
                            max={new Date().getFullYear()}
                            value={formData.dateTo}
                            onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Mois de début</Label>
                          <Input
                            type="month"
                            value={formData.monthFrom}
                            onChange={(e) => setFormData({ ...formData, monthFrom: e.target.value })}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Mois de fin</Label>
                          <Input
                            type="month"
                            value={formData.monthTo}
                            onChange={(e) => setFormData({ ...formData, monthTo: e.target.value })}
                            className="h-10"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Identifiers */}
                    <div className="grid grid-cols-1 gap-5">
                      <CoteAutocomplete
                        label="Cote"
                        placeholder="Numéro de cote"
                        value={formData.cote}
                        onChange={(value) => setFormData({ ...formData, cote: value })}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">ISBN</Label>
                          <Input
                            placeholder="978-2-1234-5678-9"
                            value={formData.isbn}
                            onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">ISSN</Label>
                          <Input
                            placeholder="1234-5678"
                            value={formData.issn}
                            onChange={(e) => setFormData({ ...formData, issn: e.target.value })}
                            className="h-11"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Rare book filter */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-amber-500/20">
                          <Sparkles className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <Label htmlFor="rareBook-filter" className="text-sm font-semibold cursor-pointer">
                            Livres rares uniquement
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Afficher uniquement les livres rares et précieux
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="rareBook-filter"
                        checked={isRareBookFilter}
                        onCheckedChange={setIsRareBookFilter}
                      />
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-2 pb-4">
                      <Button 
                        type="button"
                        onClick={(e) => {
                          setShowAdvanced(false);
                          handleSubmit(e as any);
                        }}
                        className="flex-1 h-12 bg-gradient-to-r from-bn-blue-primary to-bn-blue-deep hover:from-bn-blue-deep hover:to-bn-blue-primary shadow-lg transition-all duration-300"
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

          {/* Search Results */}
          {isSearching && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gold-bn-primary to-bn-blue-primary blur-xl opacity-30 animate-pulse" />
                <div className="relative p-6 rounded-full bg-gradient-to-br from-bn-blue-primary/10 to-gold-bn-primary/10">
                  <Loader2 className="h-12 w-12 animate-spin text-bn-blue-primary" />
                </div>
              </div>
              <span className="mt-6 text-lg font-medium text-foreground">Recherche en cours...</span>
              <span className="text-sm text-muted-foreground">Exploration des collections</span>
            </div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <Card className="mt-4 shadow-xl border-0 bg-card/95 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-bn-blue-primary/5 via-transparent to-gold-bn-primary/5 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-bn-blue-primary to-bn-blue-deep shadow-lg">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      Résultats de recherche
                    </CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold-bn-primary/10 text-gold-bn-primary font-semibold text-sm">
                        {totalResults}
                      </span>
                      document(s) trouvé(s)
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
                  onItemsPerPageChange={(items) => {
                    setItemsPerPage(items);
                    setCurrentPage(1);
                  }}
                />

                <div className="grid gap-4">
                  {searchResults.map((doc, index) => (
                    <Card key={doc.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-gold-bn-primary overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex">
                          <div className="hidden sm:flex w-24 bg-gradient-to-br from-bn-blue-primary/10 to-gold-bn-primary/10 items-center justify-center flex-shrink-0">
                            <div className="p-3 rounded-xl bg-white/80 shadow-sm group-hover:scale-110 transition-transform duration-300">
                              <BookOpen className="h-8 w-8 text-bn-blue-primary" />
                            </div>
                          </div>
                          
                          <div className="flex-1 p-5">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                    #{index + 1 + (currentPage - 1) * itemsPerPage}
                                  </span>
                                  {doc.document_type && (
                                    <span className="text-xs px-2.5 py-1 bg-bn-blue-primary/10 text-bn-blue-primary rounded-full font-medium">
                                      {doc.document_type}
                                    </span>
                                  )}
                                </div>
                                
                                <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1 group-hover:text-bn-blue-primary transition-colors">
                                  {doc.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  <span className="font-medium">Par</span> {doc.author || 'Auteur inconnu'} 
                                  <span className="mx-2">•</span>
                                  <span className="font-medium">{doc.publication_year || 'Date inconnue'}</span>
                                </p>
                                
                                {doc.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                    {doc.description}
                                  </p>
                                )}
                                
                                <div className="flex flex-wrap gap-2">
                                  {doc.cote && (
                                    <span className="text-xs px-2 py-1 bg-muted rounded-lg font-mono">
                                      {doc.cote}
                                    </span>
                                  )}
                                  {doc.language && (
                                    <span className="text-xs px-2 py-1 bg-gold-bn-primary/10 text-gold-bn-primary rounded-lg">
                                      {doc.language}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <Link to={`/digital-library/document/${doc.id}`} className="flex-shrink-0">
                                <Button className="bg-gradient-to-r from-bn-blue-primary to-bn-blue-deep hover:from-bn-blue-deep hover:to-bn-blue-primary shadow-md hover:shadow-lg transition-all">
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
                  onItemsPerPageChange={(items) => {
                    setItemsPerPage(items);
                    setCurrentPage(1);
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Empty state — shown after a search with no results */}
          {!isSearching && hasSearched && searchResults.length === 0 && (
            <div className="mt-8 space-y-6">
              {/* No-results message */}
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="p-5 rounded-full bg-muted/60 border border-border">
                  <SearchX className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Aucun document trouvé</h2>
                  <p className="text-muted-foreground max-w-md text-sm">
                    Votre recherche ne correspond à aucun document dans nos collections. Vous pouvez élargir vos critères, ou utiliser les options ci-dessous pour obtenir de l'aide.
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
                                        Recherche sans résultat — {searchParams.get('keyword') || searchParams.toString() || 'aucun terme'}
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
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setNoteExpanded(false)}
                                    disabled={noteSubmitting}
                                  >
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

                {/* Contact pour obtenir des informations */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gold-bn-primary/10">
                        <Phone className="h-4 w-4 text-gold-bn-primary" />
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
                      Notre équipe de bibliothécaires peut vous aider à trouver le document que vous recherchez ou vous orienter vers les bonnes ressources.
                    </p>
                    <div className="space-y-3">
                      <a
                        href="mailto:info@bnrm.ma"
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                      >
                        <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Email</p>
                          <p className="text-sm font-medium text-foreground">info@bnrm.ma</p>
                        </div>
                      </a>
                      <a
                        href="tel:+212537279800"
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                      >
                        <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Téléphone</p>
                          <p className="text-sm font-medium text-foreground">+212 5 37 27 98 00</p>
                        </div>
                      </a>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                        <div className="p-2 rounded-full bg-primary/10">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Adresse</p>
                          <p className="text-sm font-medium text-foreground">Avenue Ibn Batouta, Rabat</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-gold-bn-primary/5 border border-gold-bn-primary/20 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Horaires :</span> Du lundi au vendredi, 8h30 – 18h00
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </DigitalLibraryLayout>
  );
}
