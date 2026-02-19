import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageSquarePlus, Send, CheckCircle2, ChevronDown, ChevronUp, Lock, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ReaderNoteFormProps {
  documentId: string;
  documentTitle: string;
  documentType?: string;
  documentCote?: string;
  userId: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
}

export function ReaderNoteForm({
  documentId,
  documentTitle,
  documentType,
  documentCote,
  userId,
  userFirstName,
  userLastName,
  userEmail,
}: ReaderNoteFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("document_reader_notes" as any).insert({
        document_id: documentId,
        document_title: documentTitle,
        document_type: documentType || null,
        document_cote: documentCote || null,
        user_id: userId,
        note_type: "information",
        subject: subject.trim(),
        content: content.trim(),
        status: "nouveau",
      });

      if (error) throw error;

      setSubmitted(true);
      setSubject("");
      setContent("");
      toast.success("Votre information a été transmise au responsable.");
    } catch (error) {
      console.error("Error submitting reader note:", error);
      toast.error("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewNote = () => {
    setSubmitted(false);
    setIsExpanded(true);
  };

  return (
    <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <button
          type="button"
          className="flex items-center justify-between w-full text-left"
          onClick={() => setIsExpanded((prev) => !prev)}
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
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs hidden sm:flex items-center gap-1">
              <Lock className="h-2.5 w-2.5" />
              Privé
            </Badge>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
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
                {submitted ? (
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
                    <Button variant="outline" size="sm" onClick={handleNewNote}>
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
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    {/* Infos expéditeur (lecture seule) */}
                    <div className="rounded-lg bg-muted/50 border px-4 py-3 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Vos informations (transmises au responsable)</p>
                      <p className="text-sm font-medium">
                        {userFirstName} {userLastName}
                        {userEmail && (
                          <span className="text-muted-foreground font-normal"> — {userEmail}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Document : <span className="font-medium text-foreground">{documentTitle}</span>
                        {documentCote && <span> · Cote : {documentCote}</span>}
                      </p>
                    </div>

                    {/* Objet */}
                    <div className="space-y-2">
                      <Label htmlFor="note-subject">
                        Objet <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="note-subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Résumez votre information en quelques mots"
                        maxLength={200}
                        required
                      />
                    </div>

                    {/* Contenu */}
                    <div className="space-y-2">
                      <Label htmlFor="note-content">
                        Détails <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="note-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Décrivez votre information, erreur constatée, suggestion ou signalement..."
                        rows={5}
                        maxLength={2000}
                        required
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {content.length}/2000 caractères
                      </p>
                    </div>

                    {/* Mention confidentialité */}
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-muted border text-muted-foreground">
                      <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p className="text-xs">
                        Cette information est <strong>strictement confidentielle</strong>. Elle ne sera pas visible par les autres lecteurs et sera uniquement consultée par le responsable désigné avec toutes les informations relatives à l'ouvrage et à votre compte.
                      </p>
                    </div>

                    {/* Bouton */}
                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(false)}
                        disabled={submitting}
                      >
                        Annuler
                      </Button>
                      <Button type="submit" disabled={submitting || !subject.trim() || !content.trim()}>
                        {submitting ? (
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
  );
}
