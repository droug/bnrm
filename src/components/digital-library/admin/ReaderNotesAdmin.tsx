import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare, Search, Filter, User, BookOpen, Calendar,
  Clock, CheckCircle2, AlertCircle, Eye, ChevronDown, ChevronUp, Send
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ReaderNote {
  id: string;
  document_id: string;
  document_title: string | null;
  document_type: string | null;
  document_cote: string | null;
  user_id: string;
  note_type: string;
  subject: string;
  content: string;
  status: string;
  admin_response: string | null;
  admin_response_at: string | null;
  created_at: string;
  // enriched
  user_email?: string;
  user_first_name?: string;
  user_last_name?: string;
}

const NOTE_TYPE_LABELS: Record<string, string> = {
  information: "Information complémentaire",
  erreur: "Erreur ou inexactitude",
  suggestion: "Suggestion d'amélioration",
  signalement: "Signalement de contenu",
};

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  nouveau: { label: "Nouveau", variant: "destructive" },
  en_cours: { label: "En cours", variant: "default" },
  traite: { label: "Traité", variant: "secondary" },
  ferme: { label: "Fermé", variant: "outline" },
};

export function ReaderNotesAdmin() {
  const [notes, setNotes] = useState<ReaderNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const { data: notesData, error } = await supabase
        .from("document_reader_notes" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Enrichir avec les infos utilisateur
      const enriched: ReaderNote[] = await Promise.all(
        (notesData || []).map(async (note: any) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("user_id", note.user_id)
            .maybeSingle();

          const { data: authData } = await supabase.auth.admin
            ? { data: null }
            : { data: null };

          return {
            ...note,
            user_first_name: profile?.first_name || "",
            user_last_name: profile?.last_name || "",
          };
        })
      );

      setNotes(enriched);
    } catch (error) {
      console.error("Error loading reader notes:", error);
      toast.error("Erreur lors du chargement des notes");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (noteId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("document_reader_notes" as any)
        .update({ status: newStatus })
        .eq("id", noteId);

      if (error) throw error;

      setNotes((prev) => prev.map((n) => n.id === noteId ? { ...n, status: newStatus } : n));
      toast.success("Statut mis à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleSendResponse = async (noteId: string) => {
    const response = replyContent[noteId]?.trim();
    if (!response) {
      toast.error("Veuillez saisir une réponse");
      return;
    }

    setSavingId(noteId);
    try {
      const { error } = await supabase
        .from("document_reader_notes" as any)
        .update({
          admin_response: response,
          admin_response_at: new Date().toISOString(),
          status: "traite",
        })
        .eq("id", noteId);

      if (error) throw error;

      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId
            ? { ...n, admin_response: response, admin_response_at: new Date().toISOString(), status: "traite" }
            : n
        )
      );
      setReplyContent((prev) => ({ ...prev, [noteId]: "" }));
      toast.success("Réponse enregistrée et statut mis à jour en 'Traité'");
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSavingId(null);
    }
  };

  const filtered = notes.filter((note) => {
    const matchSearch =
      !search ||
      note.subject.toLowerCase().includes(search.toLowerCase()) ||
      note.document_title?.toLowerCase().includes(search.toLowerCase()) ||
      `${note.user_first_name} ${note.user_last_name}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || note.status === filterStatus;
    const matchType = filterType === "all" || note.note_type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const countByStatus = (status: string) => notes.filter((n) => n.status === status).length;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats résumées */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", count: notes.length, icon: MessageSquare },
          { label: "Nouveaux", count: countByStatus("nouveau"), icon: AlertCircle },
          { label: "En cours", count: countByStatus("en_cours"), icon: Clock },
          { label: "Traités", count: countByStatus("traite") + countByStatus("ferme"), icon: CheckCircle2 },
        ].map(({ label, count, icon: Icon }) => (
          <Card key={label} className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par objet, document, lecteur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="nouveau">Nouveau</SelectItem>
            <SelectItem value="en_cours">En cours</SelectItem>
            <SelectItem value="traite">Traité</SelectItem>
            <SelectItem value="ferme">Fermé</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="information">Information</SelectItem>
            <SelectItem value="erreur">Erreur</SelectItem>
            <SelectItem value="suggestion">Suggestion</SelectItem>
            <SelectItem value="signalement">Signalement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des notes */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Aucune note trouvée</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((note) => {
            const isExpanded = expandedId === note.id;
            const statusCfg = STATUS_CONFIG[note.status] || STATUS_CONFIG.nouveau;

            return (
              <Card key={note.id} className={`transition-all ${isExpanded ? "ring-2 ring-primary/20" : ""}`}>
                <CardHeader className="pb-3">
                  <div
                    className="flex items-start justify-between cursor-pointer gap-3"
                    onClick={() => setExpandedId(isExpanded ? null : note.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant={statusCfg.variant} className="text-xs">
                          {statusCfg.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {NOTE_TYPE_LABELS[note.note_type] || note.note_type}
                        </Badge>
                      </div>
                      <CardTitle className="text-base truncate">{note.subject}</CardTitle>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {note.user_first_name || note.user_last_name
                            ? `${note.user_first_name} ${note.user_last_name}`.trim()
                            : "Lecteur"}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {note.document_title || note.document_id}
                          {note.document_cote && ` (${note.document_cote})`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(note.created_at), "d MMM yyyy à HH:mm", { locale: fr })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 space-y-4">
                    <Separator />

                    {/* Informations lecteur */}
                    <div className="rounded-lg bg-muted/50 border px-4 py-3 space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Informations du lecteur</p>
                      <p className="text-sm font-medium">
                        {note.user_first_name} {note.user_last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">ID : {note.user_id}</p>
                    </div>

                    {/* Informations document */}
                    <div className="rounded-lg bg-muted/50 border px-4 py-3 space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Document concerné</p>
                      <p className="text-sm font-medium">{note.document_title || "—"}</p>
                      <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                        {note.document_cote && <span>Cote : {note.document_cote}</span>}
                        {note.document_type && <span>Type : {note.document_type}</span>}
                        <span>ID : {note.document_id}</span>
                      </div>
                      <a
                        href={`/digital-library/document/${note.document_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        <Eye className="h-3 w-3" />
                        Voir la notice du document
                      </a>
                    </div>

                    {/* Contenu de la note */}
                    <div>
                      <p className="text-sm font-semibold mb-2">Contenu du message</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap bg-background border rounded-lg p-3">
                        {note.content}
                      </p>
                    </div>

                    {/* Réponse admin existante */}
                    {note.admin_response && (
                      <div className="rounded-lg border bg-primary/5 px-4 py-3">
                        <p className="text-xs font-semibold text-primary mb-1">Réponse du responsable</p>
                        <p className="text-sm whitespace-pre-wrap">{note.admin_response}</p>
                        {note.admin_response_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(note.admin_response_at), "d MMM yyyy à HH:mm", { locale: fr })}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap gap-2 items-center">
                        <p className="text-sm font-medium">Changer le statut :</p>
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                          <Button
                            key={key}
                            size="sm"
                            variant={note.status === key ? "default" : "outline"}
                            onClick={() => handleStatusChange(note.id, key)}
                            disabled={note.status === key}
                          >
                            {cfg.label}
                          </Button>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Ajouter / mettre à jour une réponse :</p>
                        <Textarea
                          placeholder="Réponse interne (non transmise au lecteur pour le moment)..."
                          value={replyContent[note.id] || note.admin_response || ""}
                          onChange={(e) =>
                            setReplyContent((prev) => ({ ...prev, [note.id]: e.target.value }))
                          }
                          rows={3}
                          className="resize-none"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSendResponse(note.id)}
                          disabled={savingId === note.id}
                        >
                          {savingId === note.id ? (
                            <>
                              <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              <Send className="h-3.5 w-3.5 mr-2" />
                              Enregistrer la réponse
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
