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
  Newspaper, Calendar, Search, Plus, Save, Trash2, Edit3, Filter, Download, Upload,
  ChevronDown, ChevronUp, ArrowUpDown
} from "lucide-react";
import ContentTranslationManager from "@/components/ContentTranslationManager";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUITranslations, TranslationEntry } from "@/hooks/useUITranslations";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇲🇦', dir: 'rtl' },
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'amz', name: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', flag: 'ⵣ', dir: 'ltr' },
];

// ─── Inline Edit Row ───
function TranslationRow({ entry, onSave, onDelete }: { 
  entry: TranslationEntry; 
  onSave: (e: TranslationEntry) => void; 
  onDelete?: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState(entry);

  const handleSave = () => {
    onSave(edited);
    setIsEditing(false);
  };

  const missingCount = [edited.fr, edited.ar, edited.en, edited.es, edited.amz].filter(v => !v).length;

  if (!isEditing) {
    return (
      <TableRow className="group hover:bg-accent/30 transition-colors">
        <TableCell className="font-mono text-xs max-w-[200px] truncate" title={entry.key}>
          {entry.key}
        </TableCell>
        <TableCell className="max-w-[150px] truncate text-sm" title={entry.fr}>{entry.fr || <span className="text-destructive">—</span>}</TableCell>
        <TableCell className="max-w-[150px] truncate text-sm" dir="rtl" title={entry.ar}>{entry.ar || <span className="text-destructive">—</span>}</TableCell>
        <TableCell className="max-w-[150px] truncate text-sm" title={entry.en}>{entry.en || <span className="text-destructive">—</span>}</TableCell>
        <TableCell className="max-w-[150px] truncate text-sm" title={entry.es}>{entry.es || <span className="text-destructive">—</span>}</TableCell>
        <TableCell className="max-w-[150px] truncate text-sm" title={entry.amz}>{entry.amz || <span className="text-destructive">—</span>}</TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            {missingCount > 0 ? (
              <Badge variant="destructive" className="text-xs">{missingCount}</Badge>
            ) : (
              <Badge variant="default" className="text-xs bg-green-600">✓</Badge>
            )}
            <Badge variant="outline" className="text-xs">{entry.source === 'portal' ? 'Portail' : entry.source === 'digital_library' ? 'BN' : 'Perso'}</Badge>
          </div>
        </TableCell>
        <TableCell>
          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => setIsEditing(true)}>
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
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
          <div className="flex gap-1">
            <Button size="sm" className="h-7 text-xs" onClick={handleSave}><Save className="h-3 w-3 mr-1" />OK</Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setEdited(entry); setIsEditing(false); }}>✕</Button>
            {entry.isFromDB && entry.dbId && onDelete && (
              <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => onDelete(entry.dbId!)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}

// ─── Add New Key Dialog ───
function AddKeyDialog({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (e: any) => void }) {
  const [key, setKey] = useState('');
  const [fr, setFr] = useState('');
  const [ar, setAr] = useState('');
  const [en, setEn] = useState('');
  const [es, setEs] = useState('');
  const [amz, setAmz] = useState('');
  const [category, setCategory] = useState('general');

  const handleSubmit = () => {
    if (!key.trim()) { toast.error('La clé est obligatoire'); return; }
    onSave({ key: key.trim(), fr, ar, en, es, amz, source: 'custom', category });
    setKey(''); setFr(''); setAr(''); setEn(''); setEs(''); setAmz('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Ajouter une clé de traduction</DialogTitle>
          <DialogDescription>Ajoutez une nouvelle clé avec ses traductions dans les 5 langues</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Clé de traduction *</Label>
              <Input value={key} onChange={e => setKey(e.target.value)} placeholder="ex: portal.footer.newLink" />
            </div>
            <div>
              <Label>Catégorie</Label>
              <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="ex: footer, nav, form..." />
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit}><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ───
export default function TranslationManagementPage() {
  const [activeTab, setActiveTab] = useState('ui');
  const [searchKey, setSearchKey] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [selectedContentTitle, setSelectedContentTitle] = useState('');
  const queryClient = useQueryClient();

  const { entries, isLoading: uiLoading, saveMutation, deleteMutation } = useUITranslations();

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

    if (filterSource !== 'all') {
      result = result.filter(e => e.source === filterSource);
    }

    if (filterCategory !== 'all') {
      result = result.filter(e => e.category === filterCategory);
    }

    if (filterStatus === 'missing') {
      result = result.filter(e => !e.fr || !e.ar || !e.en || !e.es || !e.amz);
    } else if (filterStatus === 'complete') {
      result = result.filter(e => e.fr && e.ar && e.en && e.es && e.amz);
    } else if (filterStatus === 'modified') {
      result = result.filter(e => e.isFromDB);
    }

    return result;
  }, [entries, searchKey, filterSource, filterStatus, filterCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(entries.map(e => e.category));
    return Array.from(cats).sort();
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
      key: entry.key,
      fr: entry.fr,
      ar: entry.ar,
      en: entry.en,
      es: entry.es,
      amz: entry.amz,
      source: entry.source,
      category: entry.category,
    });
  };

  const handleExportCSV = () => {
    const header = 'key,source,category,fr,ar,en,es,amz\n';
    const rows = filteredEntries.map(e =>
      `"${e.key}","${e.source}","${e.category}","${(e.fr || '').replace(/"/g, '""')}","${(e.ar || '').replace(/"/g, '""')}","${(e.en || '').replace(/"/g, '""')}","${(e.es || '').replace(/"/g, '""')}","${(e.amz || '').replace(/"/g, '""')}"`
    ).join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'traductions_bnrm.csv';
    a.click();
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
        badgeText="5 langues"
        subtitle="Gérez toutes les traductions du portail BNRM et de la bibliothèque numérique"
      />

      <main className="container py-8 space-y-6">
        {/* ─── Stats Cards ─── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Total clés</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.complete}</div>
              <p className="text-xs text-muted-foreground mt-1">Complètes (5 langues)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.missing}</div>
              <p className="text-xs text-muted-foreground mt-1">Incomplètes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.modified}</div>
              <p className="text-xs text-muted-foreground mt-1">Modifiées en BD</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-3xl font-bold text-purple-600">{categories.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Catégories</p>
            </CardContent>
          </Card>
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
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Rechercher par clé ou texte..."
                  value={searchKey}
                  onChange={e => setSearchKey(e.target.value)}
                />
              </div>
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes sources</SelectItem>
                  <SelectItem value="portal">Portail BNRM</SelectItem>
                  <SelectItem value="digital_library">Bibliothèque Num.</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="complete">Complètes</SelectItem>
                  <SelectItem value="missing">Incomplètes</SelectItem>
                  <SelectItem value="modified">Modifiées (BD)</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setShowAddDialog(true)} size="sm">
                <Plus className="h-4 w-4 mr-1" /> Ajouter
              </Button>
              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" /> CSV
              </Button>
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
              {filteredEntries.length} traductions affichées sur {entries.length} total
            </div>

            {/* Table */}
            <Card>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[200px] text-xs font-semibold">Clé</TableHead>
                      <TableHead className="text-xs font-semibold">🇫🇷 FR</TableHead>
                      <TableHead className="text-xs font-semibold">🇲🇦 AR</TableHead>
                      <TableHead className="text-xs font-semibold">🇬🇧 EN</TableHead>
                      <TableHead className="text-xs font-semibold">🇪🇸 ES</TableHead>
                      <TableHead className="text-xs font-semibold">ⵣ AMZ</TableHead>
                      <TableHead className="text-xs font-semibold w-[120px]">Statut</TableHead>
                      <TableHead className="text-xs font-semibold w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uiLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
                    ) : filteredEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                          Aucune traduction trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEntries.map(entry => (
                        <TranslationRow
                          key={entry.key}
                          entry={entry}
                          onSave={handleSaveTranslation}
                          onDelete={entry.isFromDB && entry.dbId ? (id) => deleteMutation.mutate(id) : undefined}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </Card>
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
