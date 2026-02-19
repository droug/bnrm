import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  MessageSquare, Search, User, BookOpen, Calendar,
  Clock, CheckCircle2, AlertCircle, Eye, ChevronDown, ChevronUp, SearchX, FileText
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
  source: string;
  user_id: string | null;
  note_type: string;
  subject: string;
  content: string;
  status: string;
  admin_response: string | null;
  admin_response_at: string | null;
  created_at: string;
  // enriched
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
  consultee: { label: "Consultée", variant: "secondary" },
  en_cours: { label: "En cours", variant: "default" },
  traite: { label: "Traité", variant: "secondary" },
  ferme: { label: "Fermé", variant: "outline" },
};

const DOC_TYPE_LABELS: Record<string, string> = {
  manuscrit: "Manuscrit",
  lithographie: "Lithographie",
  livre: "Livre",
  revue_journal: "Revue ou journal",
  collection_specialisee: "Collection spécialisée",
  audiovisuel: "Document Audio-visuel",
  autre: "Autre",
};

function NotesList({ notes, loading, onStatusChange }: { notes: ReaderNote[]; loading: boolean; onStatusChange: (id: string, status: string) => Promise<void> }) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const filtered = notes.filter((note) => {
    return (
      !search ||
      note.subject.toLowerCase().includes(search.toLowerCase()) ||
      note.document_title?.toLowerCase().includes(search.toLowerCase()) ||
      `${note.user_first_name || ""} ${note.user_last_name || ""}`.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-4">
      {/* Filtre recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par objet, document, lecteur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Liste */}
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
            const isConsulted = note.status === "consultee";
            const isUpdating = updatingId === note.id;

            return (
              <Card
                key={note.id}
                className={`transition-all ${isExpanded ? "ring-2 ring-primary/20" : ""} ${isConsulted ? "opacity-70" : ""}`}
              >
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
                        {note.document_type && DOC_TYPE_LABELS[note.document_type] && (
                          <Badge variant="outline" className="text-xs">
                            {DOC_TYPE_LABELS[note.document_type]}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base truncate">{note.subject}</CardTitle>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {note.user_first_name || note.user_last_name
                            ? `${note.user_first_name} ${note.user_last_name}`.trim()
                            : "Lecteur anonyme"}
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

                    {/* Informations lecteur — uniquement si connecté */}
                    {note.user_id && (note.user_first_name || note.user_last_name) && (
                      <div className="rounded-lg bg-muted/50 border px-4 py-3 space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Informations du lecteur</p>
                        <p className="text-sm font-medium">
                          {note.user_first_name} {note.user_last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">ID : {note.user_id}</p>
                      </div>
                    )}

                    {/* Informations document */}
                    <div className="rounded-lg bg-muted/50 border px-4 py-3 space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Document concerné</p>
                      <p className="text-sm font-medium">{note.document_title || "—"}</p>
                      <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                        {note.document_cote && <span>Cote : {note.document_cote}</span>}
                        {note.document_type && <span>Type : {DOC_TYPE_LABELS[note.document_type] || note.document_type}</span>}
                        {note.source === "document" && <span>ID : {note.document_id}</span>}
                      </div>
                      {note.source === "document" && (
                        <a
                          href={`https://bnrm-dev.digiup.ma/digital-library/document/${note.document_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          <Eye className="h-3 w-3" />
                          Voir la notice du document
                        </a>
                      )}
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

                    {/* Action "Consultée" */}
                    <div className="flex justify-end pt-1">
                      {isConsulted ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          Marquée comme consultée
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isUpdating}
                          onClick={async (e) => {
                            e.stopPropagation();
                            setUpdatingId(note.id);
                            await onStatusChange(note.id, "consultee");
                            setUpdatingId(null);
                          }}
                          className="gap-1.5"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {isUpdating ? "En cours…" : "Marquer comme consultée"}
                        </Button>
                      )}
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

export function ReaderNotesAdmin() {
  const [notes, setNotes] = useState<ReaderNote[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Enrichir avec les infos utilisateur (si connecté)
      const enriched: ReaderNote[] = await Promise.all(
        (notesData || []).map(async (note: any) => {
          if (!note.user_id) return { ...note, user_first_name: "", user_last_name: "" };

          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("user_id", note.user_id)
            .maybeSingle();

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

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("document_reader_notes" as any)
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, status } : n)));
      toast.success("Statut mis à jour");
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const searchNotes = notes.filter((n) => n.source === "search");
  const documentNotes = notes.filter((n) => n.source === "document");

  const countByStatus = (list: ReaderNote[], status: string) => list.filter((n) => n.status === status).length;

  return (
    <div className="space-y-6">
      {/* Stats globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", count: notes.length, icon: MessageSquare },
          { label: "Non consultées", count: countByStatus(notes, "nouveau"), icon: AlertCircle },
          { label: "Consultées", count: countByStatus(notes, "consultee"), icon: CheckCircle2 },
          { label: "Traités", count: countByStatus(notes, "traite") + countByStatus(notes, "ferme"), icon: Clock },
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

      {/* Onglets par source */}
      <Tabs defaultValue="document">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="document" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Informations complémentaires
            <Badge variant="secondary" className="ml-1 text-xs">{documentNotes.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <SearchX className="h-4 w-4" />
            Recherches non abouties
            <Badge variant="secondary" className="ml-1 text-xs">{searchNotes.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="document" className="mt-6">
          <NotesList notes={documentNotes} loading={loading} onStatusChange={handleStatusChange} />
        </TabsContent>

        <TabsContent value="search" className="mt-6">
          <NotesList notes={searchNotes} loading={loading} onStatusChange={handleStatusChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
