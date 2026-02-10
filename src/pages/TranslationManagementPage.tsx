import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from "@/components/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Languages, RefreshCw, CheckCircle, XCircle, Loader2, FileText, Globe, Layout, 
  Newspaper, Calendar, Search, Plus, Save, Trash2, Edit3, Download, ChevronLeft, ChevronRight,
  Sparkles, Wand2, FolderOpen
} from "lucide-react";
import ContentTranslationManager from "@/components/ContentTranslationManager";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUITranslations, TranslationEntry, SECTION_OPTIONS } from "@/hooks/useUITranslations";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇲🇦', dir: 'rtl' },
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'amz', name: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', flag: 'ⵣ', dir: 'ltr' },
];

// ─── Inline Edit Row with AI ───
function TranslationRow({ entry, onSave, onDelete, onAiSuggest, isAiLoading }: { 
  entry: TranslationEntry; 
  onSave: (e: TranslationEntry) => void; 
  onDelete?: (id: string) => void;
  onAiSuggest: (entry: TranslationEntry, setEdited: (e: TranslationEntry) => void) => void;
  isAiLoading: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState(entry);

  const handleSave = () => {
    onSave(edited);
    setIsEditing(false);
  };

  const missingLangs = (['fr', 'ar', 'en', 'es', 'amz'] as const).filter(l => !edited[l]);

  if (!isEditing) {
    return (
      <TableRow className="group hover:bg-accent/30 transition-colors">
        <TableCell className="font-mono text-xs max-w-[180px] truncate" title={entry.key}>
          {entry.key}
        </TableCell>
        <TableCell className="max-w-[130px] truncate text-sm" title={entry.fr}>{entry.fr || <span className="text-destructive italic">—</span>}</TableCell>
        <TableCell className="max-w-[130px] truncate text-sm" dir="rtl" title={entry.ar}>{entry.ar || <span className="text-destructive italic">—</span>}</TableCell>
        <TableCell className="max-w-[130px] truncate text-sm" title={entry.en}>{entry.en || <span className="text-destructive italic">—</span>}</TableCell>
        <TableCell className="max-w-[130px] truncate text-sm" title={entry.es}>{entry.es || <span className="text-destructive italic">—</span>}</TableCell>
        <TableCell className="max-w-[130px] truncate text-sm" title={entry.amz}>{entry.amz || <span className="text-destructive italic">—</span>}</TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            {missingLangs.length > 0 ? (
              <Badge variant="destructive" className="text-xs">{missingLangs.length}</Badge>
            ) : (
              <Badge variant="default" className="text-xs bg-green-600">✓</Badge>
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {missingLangs.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-500" 
                      onClick={() => { setIsEditing(true); setTimeout(() => onAiSuggest(entry, setEdited), 100); }}
                      disabled={isAiLoading}>
                      {isAiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Suggérer traductions IA</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(true)}>
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className="bg-primary/5 border-l-2 border-l-primary">
      <TableCell className="font-mono text-xs">{entry.key}</TableCell>
      <TableCell>
        <Input className="h-8 text-sm" value={edited.fr} onChange={e => setEdited({...edited, fr: e.target.value})} placeholder="Français" />
      </TableCell>
      <TableCell>
        <Input className="h-8 text-sm" dir="rtl" value={edited.ar} onChange={e => setEdited({...edited, ar: e.target.value})} placeholder="العربية" />
      </TableCell>
      <TableCell>
        <Input className="h-8 text-sm" value={edited.en} onChange={e => setEdited({...edited, en: e.target.value})} placeholder="English" />
      </TableCell>
      <TableCell>
        <Input className="h-8 text-sm" value={edited.es} onChange={e => setEdited({...edited, es: e.target.value})} placeholder="Español" />
      </TableCell>
      <TableCell>
        <Input className="h-8 text-sm" value={edited.amz} onChange={e => setEdited({...edited, amz: e.target.value})} placeholder="ⵜⴰⵎⴰⵣⵉⵖⵜ" />
      </TableCell>
      <TableCell colSpan={2}>
        <div className="flex gap-1 flex-wrap">
          <Button size="sm" className="h-7 text-xs" onClick={handleSave}><Save className="h-3 w-3 mr-1" />OK</Button>
          <Button size="sm" variant="outline" className="h-7 text-xs text-amber-600 border-amber-300 hover:bg-amber-50" 
            onClick={() => onAiSuggest(edited, setEdited)} disabled={isAiLoading}>
            {isAiLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
            IA
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setEdited(entry); setIsEditing(false); }}>✕</Button>
          {entry.isFromDB && entry.dbId && onDelete && (
            <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => onDelete(entry.dbId!)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Add New Key Dialog ───
function AddKeyDialog({ open, onClose, onSave, onAiSuggest, isAiLoading }: { 
  open: boolean; onClose: () => void; onSave: (e: any) => void; 
  onAiSuggest: (text: string, sourceLang: string, setValues: (vals: Record<string, string>) => void) => void;
  isAiLoading: boolean;
}) {
  const [key, setKey] = useState('');
  const [fr, setFr] = useState('');
  const [ar, setAr] = useState('');
  const [en, setEn] = useState('');
  const [es, setEs] = useState('');
  const [amz, setAmz] = useState('');
  const [category, setCategory] = useState('general');
  const [section, setSection] = useState('general');

  const handleSubmit = () => {
    if (!key.trim()) { toast.error('La clé est obligatoire'); return; }
    onSave({ key: key.trim(), fr, ar, en, es, amz, source: 'custom', category, section });
    setKey(''); setFr(''); setAr(''); setEn(''); setEs(''); setAmz('');
    onClose();
  };

  const handleAiSuggest = () => {
    const sourceText = fr || ar || en;
    const sourceLang = fr ? 'fr' : ar ? 'ar' : 'en';
    if (!sourceText) { toast.error('Entrez au moins une traduction source (FR, AR ou EN)'); return; }
    onAiSuggest(sourceText, sourceLang, (vals) => {
      if (vals.fr && !fr) setFr(vals.fr);
      if (vals.ar && !ar) setAr(vals.ar);
      if (vals.en && !en) setEn(vals.en);
      if (vals.es && !es) setEs(vals.es);
      if (vals.amz && !amz) setAmz(vals.amz);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Ajouter une clé de traduction</DialogTitle>
          <DialogDescription>Ajoutez une nouvelle clé avec traductions. Utilisez l'IA pour compléter automatiquement.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Clé *</Label>
              <Input value={key} onChange={e => setKey(e.target.value)} placeholder="ex: portal.footer.link" />
            </div>
            <div>
              <Label>Section</Label>
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SECTION_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Catégorie</Label>
              <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="ex: nav, form..." />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[
              { label: '🇫🇷 Français', value: fr, set: setFr, dir: 'ltr' },
              { label: '🇲🇦 العربية', value: ar, set: setAr, dir: 'rtl' },
              { label: '🇬🇧 English', value: en, set: setEn, dir: 'ltr' },
              { label: '🇪🇸 Español', value: es, set: setEs, dir: 'ltr' },
              { label: 'ⵣ ⵜⴰⵎⴰⵣⵉⵖⵜ', value: amz, set: setAmz, dir: 'ltr' },
            ].map(({ label, value, set, dir }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-sm font-medium w-32 shrink-0">{label}</span>
                <Input value={value} onChange={e => set(e.target.value)} dir={dir as any} className="flex-1" />
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50" onClick={handleAiSuggest} disabled={isAiLoading}>
            {isAiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Compléter avec l'IA (depuis FR, AR ou EN)
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit}><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Section Group Component ───
function SectionGroup({ section, entries, onSave, onDelete, onAiSuggest, isAiLoading }: {
  section: string;
  entries: TranslationEntry[];
  onSave: (e: TranslationEntry) => void;
  onDelete: (id: string) => void;
  onAiSuggest: (entry: TranslationEntry, setEdited: (e: TranslationEntry) => void) => void;
  isAiLoading: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const sectionLabel = SECTION_OPTIONS.find(s => s.value === section)?.label || section;
  const missingCount = entries.filter(e => !e.fr || !e.ar || !e.en || !e.es || !e.amz).length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-muted/50 hover:bg-muted/80 rounded-t-lg transition-colors border border-b-0">
        <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        <FolderOpen className="h-4 w-4 text-primary" />
        <span className="font-semibold text-sm">{sectionLabel}</span>
        <Badge variant="secondary" className="text-xs ml-auto">{entries.length}</Badge>
        {missingCount > 0 && <Badge variant="destructive" className="text-xs">{missingCount} incomplètes</Badge>}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border border-t-0 rounded-b-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[180px] text-xs font-semibold">Clé</TableHead>
                <TableHead className="text-xs font-semibold">🇫🇷 FR</TableHead>
                <TableHead className="text-xs font-semibold">🇲🇦 AR</TableHead>
                <TableHead className="text-xs font-semibold">🇬🇧 EN</TableHead>
                <TableHead className="text-xs font-semibold">🇪🇸 ES</TableHead>
                <TableHead className="text-xs font-semibold">ⵣ AMZ</TableHead>
                <TableHead className="text-xs font-semibold w-[80px]">Statut</TableHead>
                <TableHead className="text-xs font-semibold w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map(entry => (
                <TranslationRow
                  key={entry.key}
                  entry={entry}
                  onSave={onSave}
                  onDelete={entry.isFromDB && entry.dbId ? (id) => onDelete(id) : undefined}
                  onAiSuggest={onAiSuggest}
                  isAiLoading={isAiLoading}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── Main Page ───
export default function TranslationManagementPage() {
  const [activeTab, setActiveTab] = useState('ui');
  const [searchKey, setSearchKey] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [selectedContentTitle, setSelectedContentTitle] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const queryClient = useQueryClient();

  const { entries, isLoading: uiLoading, saveMutation, deleteMutation, aiTranslateMutation } = useUITranslations();

  // ─── AI Suggest handler ───
  const handleAiSuggest = (entry: TranslationEntry, setEdited: (e: TranslationEntry) => void) => {
    // Find source text and missing langs
    const sourceLang = entry.fr ? 'fr' : entry.ar ? 'ar' : entry.en ? 'en' : '';
    const sourceText = entry[sourceLang as keyof TranslationEntry] as string;
    if (!sourceLang || !sourceText) { toast.error('Aucun texte source disponible'); return; }

    const missingLangs = (['fr', 'ar', 'en', 'es', 'amz'] as const).filter(l => !entry[l]);
    if (missingLangs.length === 0) { toast.info('Toutes les langues sont déjà remplies'); return; }

    aiTranslateMutation.mutate(
      { text: sourceText, sourceLang, targetLangs: missingLangs, context: entry.section },
      {
        onSuccess: (translations) => {
          const updated = { ...entry };
          missingLangs.forEach(lang => {
            if (translations[lang]) {
              (updated as any)[lang] = translations[lang];
            }
          });
          setEdited(updated);
          toast.success(`${Object.keys(translations).length} traductions suggérées par l'IA`);
        },
        onError: (err) => {
          toast.error(`Erreur IA: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
        },
      }
    );
  };

  const handleAddDialogAiSuggest = (text: string, sourceLang: string, setValues: (vals: Record<string, string>) => void) => {
    const targetLangs = (['fr', 'ar', 'en', 'es', 'amz'] as const).filter(l => l !== sourceLang);
    aiTranslateMutation.mutate(
      { text, sourceLang, targetLangs },
      {
        onSuccess: (translations) => {
          setValues(translations);
          toast.success(`Traductions IA générées`);
        },
        onError: (err) => toast.error(`Erreur IA: ${err instanceof Error ? err.message : 'Erreur inconnue'}`),
      }
    );
  };

  // Batch AI translate all missing
  const [batchAiLoading, setBatchAiLoading] = useState(false);
  const handleBatchAiTranslate = async () => {
    const incomplete = filteredEntries.filter(e => e.fr && (!e.ar || !e.en || !e.es || !e.amz));
    if (incomplete.length === 0) { toast.info('Aucune traduction incomplète avec texte FR'); return; }
    
    const batch = incomplete.slice(0, 10); // Limit to 10 at a time
    setBatchAiLoading(true);
    let successCount = 0;

    for (const entry of batch) {
      const missingLangs = (['ar', 'en', 'es', 'amz'] as const).filter(l => !entry[l]);
      try {
        const translations = await aiTranslateMutation.mutateAsync({
          text: entry.fr, sourceLang: 'fr', targetLangs: missingLangs, context: entry.section,
        });
        const updated = { ...entry, ...translations };
        saveMutation.mutate({
          key: updated.key, fr: updated.fr, ar: updated.ar, en: updated.en, es: updated.es, amz: updated.amz,
          source: updated.source, category: updated.category, section: updated.section,
        });
        successCount++;
      } catch { /* continue */ }
    }
    setBatchAiLoading(false);
    toast.success(`${successCount}/${batch.length} traductions générées par lot`);
  };

  // ─── Filters + search ───
  const filteredEntries = useMemo(() => {
    let result = entries;

    if (searchKey) {
      const q = searchKey.toLowerCase();
      result = result.filter(e =>
        e.key.toLowerCase().includes(q) ||
        e.fr.toLowerCase().includes(q) ||
        e.ar.toLowerCase().includes(q) ||
        e.en.toLowerCase().includes(q) ||
        e.es.toLowerCase().includes(q) ||
        e.amz.toLowerCase().includes(q)
      );
    }

    if (filterSource !== 'all') result = result.filter(e => e.source === filterSource);
    if (filterSection !== 'all') result = result.filter(e => e.section === filterSection);

    if (filterStatus === 'missing') result = result.filter(e => !e.fr || !e.ar || !e.en || !e.es || !e.amz);
    else if (filterStatus === 'complete') result = result.filter(e => e.fr && e.ar && e.en && e.es && e.amz);
    else if (filterStatus === 'modified') result = result.filter(e => e.isFromDB);

    return result;
  }, [entries, searchKey, filterSource, filterStatus, filterSection]);

  // Reset page when filters change
  const resetPage = () => setCurrentPage(1);

  // Group by section (always grouped)
  const groupedEntries = useMemo(() => {
    const groups: Record<string, TranslationEntry[]> = {};
    filteredEntries.forEach(e => {
      const sec = e.section || 'general';
      if (!groups[sec]) groups[sec] = [];
      groups[sec].push(e);
    });
    const order = SECTION_OPTIONS.map(s => s.value);
    return Object.entries(groups).sort(([a], [b]) => order.indexOf(a) - order.indexOf(b));
  }, [filteredEntries]);

  // Available sections from data
  const availableSections = useMemo(() => {
    const secs = new Set(entries.map(e => e.section || 'general'));
    return SECTION_OPTIONS.filter(s => secs.has(s.value));
  }, [entries]);

  // Stats
  const stats = useMemo(() => {
    const total = entries.length;
    const complete = entries.filter(e => e.fr && e.ar && e.en && e.es && e.amz).length;
    const missing = total - complete;
    const modified = entries.filter(e => e.isFromDB).length;
    const byLang = {
      fr: entries.filter(e => !!e.fr).length,
      ar: entries.filter(e => !!e.ar).length,
      en: entries.filter(e => !!e.en).length,
      es: entries.filter(e => !!e.es).length,
      amz: entries.filter(e => !!e.amz).length,
    };
    return { total, complete, missing, modified, byLang };
  }, [entries]);

  // Content queries
  const { data: contents, isLoading: contentsLoading } = useQuery({
    queryKey: ['contents-for-translation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content')
        .select(`id, title, content_type, status, created_at, content_translations (id, language_code, is_approved)`)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: actualites } = useQuery({
    queryKey: ['cms-actualites-translations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_actualites')
        .select('id, title_fr, title_ar, chapo_fr, chapo_ar, status')
        .order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: evenements } = useQuery({
    queryKey: ['cms-evenements-translations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_evenements')
        .select('id, title_fr, title_ar, description_fr, description_ar, status')
        .order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  const batchTranslateMutation = useMutation({
    mutationFn: async (onlyMissing: boolean) => {
      const { data, error } = await supabase.functions.invoke('batch-translate-all-content', { body: { onlyMissing } });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contents-for-translation'] });
      toast.success(data?.message || 'Traduction terminée');
    },
    onError: () => toast.error('Erreur lors de la traduction en masse'),
  });

  const handleSaveTranslation = (entry: TranslationEntry) => {
    saveMutation.mutate({
      key: entry.key, fr: entry.fr, ar: entry.ar, en: entry.en, es: entry.es, amz: entry.amz,
      source: entry.source, category: entry.category, section: entry.section,
    });
  };

  const handleExportCSV = () => {
    const header = 'key,section,source,category,fr,ar,en,es,amz\n';
    const rows = filteredEntries.map(e =>
      `"${e.key}","${e.section}","${e.source}","${e.category}","${(e.fr || '').replace(/"/g, '""')}","${(e.ar || '').replace(/"/g, '""')}","${(e.en || '').replace(/"/g, '""')}","${(e.es || '').replace(/"/g, '""')}","${(e.amz || '').replace(/"/g, '""')}"`
    ).join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'traductions_bnrm.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV généré');
  };

  const getContentStats = (content: any) => {
    const translations = content.content_translations || [];
    const approved = translations.filter((t: any) => t.is_approved).length;
    const missing = 4 - translations.length;
    return { translations: translations.length, approved, pending: translations.length - approved, missing };
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader
        title="Gestion des Traductions"
        badgeText="5 langues · IA"
        subtitle="Gérez toutes les traductions du portail BNRM et de la bibliothèque numérique avec suggestions IA"
      />

      <main className="container py-8 space-y-6">
        {/* ─── Stats Cards ─── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card><CardContent className="pt-4 pb-3 text-center">
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Total clés</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.complete}</div>
            <p className="text-xs text-muted-foreground mt-1">Complètes (5 langues)</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 text-center">
            <div className="text-3xl font-bold text-orange-600">{stats.missing}</div>
            <p className="text-xs text-muted-foreground mt-1">Incomplètes</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.modified}</div>
            <p className="text-xs text-muted-foreground mt-1">Modifiées en BD</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 text-center">
            <div className="text-3xl font-bold text-purple-600">{availableSections.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Sections</p>
          </CardContent></Card>
        </div>

        {/* ─── Language Progress ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> Couverture par langue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {LANGUAGES.map(lang => {
                const count = stats.byLang[lang.code as keyof typeof stats.byLang];
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={lang.code} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span>{lang.flag} {lang.name}</span>
                      <span className="font-medium">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <p className="text-xs text-muted-foreground">{count} / {stats.total}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ─── Tabs ─── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ui" className="flex items-center gap-1.5 text-sm">
              <Layout className="h-4 w-4" /> Interface UI
              <Badge variant="secondary" className="ml-1 text-xs">{entries.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-1.5 text-sm">
              <FileText className="h-4 w-4" /> Contenus
            </TabsTrigger>
            <TabsTrigger value="actualites" className="flex items-center gap-1.5 text-sm">
              <Newspaper className="h-4 w-4" /> Actualités
            </TabsTrigger>
            <TabsTrigger value="evenements" className="flex items-center gap-1.5 text-sm">
              <Calendar className="h-4 w-4" /> Événements
            </TabsTrigger>
          </TabsList>

          {/* ─── UI Translations Tab ─── */}
          <TabsContent value="ui" className="space-y-4 mt-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Rechercher par clé ou texte..." value={searchKey} onChange={e => setSearchKey(e.target.value)} />
              </div>
              <Select value={filterSection} onValueChange={setFilterSection}>
                <SelectTrigger className="w-[170px]"><SelectValue placeholder="Section" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes sections</SelectItem>
                  {availableSections.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Source" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes sources</SelectItem>
                  <SelectItem value="portal">Portail BNRM</SelectItem>
                  <SelectItem value="digital_library">Bibliothèque Num.</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="complete">Complètes</SelectItem>
                  <SelectItem value="missing">Incomplètes</SelectItem>
                  <SelectItem value="modified">Modifiées (BD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => setShowAddDialog(true)} size="sm">
                <Plus className="h-4 w-4 mr-1" /> Ajouter
              </Button>
              <Button onClick={handleBatchAiTranslate} size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50"
                disabled={batchAiLoading || aiTranslateMutation.isPending}>
                {batchAiLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                Traduire incomplètes (IA × 10)
              </Button>
              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" /> CSV
              </Button>
              <span className="text-sm text-muted-foreground ml-auto">
                {filteredEntries.length} / {entries.length} traductions
              </span>
            </div>

            {/* Table / Grouped view */}
            <ScrollArea className="h-[600px]">
              {uiLoading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <div className="space-y-3">
                  {groupedEntries.map(([section, sectionEntries]) => (
                    <SectionGroup
                      key={section}
                      section={section}
                      entries={sectionEntries}
                      onSave={handleSaveTranslation}
                      onDelete={(id) => deleteMutation.mutate(id)}
                      onAiSuggest={handleAiSuggest}
                      isAiLoading={aiTranslateMutation.isPending}
                    />
                  ))}
                  {groupedEntries.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">Aucune traduction trouvée</div>
                  )}
                </div>
              )}
            </ScrollArea>

          </TabsContent>

          {/* ─── Content Tab ─── */}
          <TabsContent value="content" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Contenus du catalogue</CardTitle>
                    <CardDescription>Cliquez sur un contenu pour gérer ses traductions dans les 5 langues</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => batchTranslateMutation.mutate(true)} disabled={batchTranslateMutation.isPending} size="sm">
                      {batchTranslateMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Languages className="h-4 w-4 mr-1" />}
                      Traduire manquants
                    </Button>
                    <Button onClick={() => batchTranslateMutation.mutate(false)} disabled={batchTranslateMutation.isPending} variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-1" /> Régénérer tout
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {contentsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {contents?.map((content) => {
                      const s = getContentStats(content);
                      return (
                        <div key={content.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                          onClick={() => { setSelectedContentId(content.id); setSelectedContentTitle(content.title); }}>
                          <div className="flex-1">
                            <h3 className="font-medium text-sm">{content.title}</h3>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{content.content_type}</Badge>
                              <Badge variant={s.approved === 4 ? "default" : "secondary"} className="text-xs">{s.approved}/4 validées</Badge>
                              {s.missing > 0 && <Badge variant="destructive" className="text-xs">{s.missing} manquantes</Badge>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Actualités Tab ─── */}
          <TabsContent value="actualites" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Newspaper className="h-5 w-5" /> Actualités CMS</CardTitle>
                <CardDescription>État des traductions des articles (FR ↔ AR)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {actualites?.map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{article.title_fr || article.title_ar}</h3>
                        <Badge variant="outline" className="text-xs mt-1">{article.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {article.title_fr && article.title_ar ? (
                          <Badge variant="default" className="gap-1 text-xs"><CheckCircle className="h-3 w-3" /> FR+AR</Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1 text-xs"><XCircle className="h-3 w-3" /> Incomplet</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Événements Tab ─── */}
          <TabsContent value="evenements" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Événements CMS</CardTitle>
                <CardDescription>État des traductions des événements (FR ↔ AR)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {evenements?.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{event.title_fr || event.title_ar}</h3>
                        <Badge variant="outline" className="text-xs mt-1">{event.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {event.title_fr && event.title_ar ? (
                          <Badge variant="default" className="gap-1 text-xs"><CheckCircle className="h-3 w-3" /> FR+AR</Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1 text-xs"><XCircle className="h-3 w-3" /> Incomplet</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Key Dialog */}
        <AddKeyDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSave={(e) => saveMutation.mutate(e)}
          onAiSuggest={handleAddDialogAiSuggest}
          isAiLoading={aiTranslateMutation.isPending}
        />

        {/* Content Translation Dialog */}
        <Dialog open={!!selectedContentId} onOpenChange={() => { setSelectedContentId(null); setSelectedContentTitle(''); }}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gestion des traductions</DialogTitle>
              <DialogDescription>{selectedContentTitle}</DialogDescription>
            </DialogHeader>
            {selectedContentId && <ContentTranslationManager contentId={selectedContentId} contentTitle={selectedContentTitle} />}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
