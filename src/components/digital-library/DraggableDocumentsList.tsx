import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { GripVertical, Eye, Pencil, Trash2, Wand2, Mic, FileSearch, CheckCircle2, Loader2 } from "lucide-react";

interface Document {
  id: string;
  title: string | null;
  author: string | null;
  document_type: string | null;
  file_format: string | null;
  created_at: string | null;
  ocr_processed: boolean | null;
  pdf_url: string | null;
  sort_order: number | null;
  cbn_documents?: { cote: string } | null;
}

interface DraggableDocumentsListProps {
  documents: Document[];
  selectedDocIds: string[];
  onToggleSelection: (docId: string) => void;
  onToggleSelectAll: () => void;
  onViewDetails: (doc: Document) => void;
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  onOcr: (doc: Document) => void;
  onTranscription: (doc: Document) => void;
  onMarkAsOcrProcessed: (docId: string) => void;
  ocrProcessingDocId: string | null;
  transcriptionProcessingDocId: string | null;
  clientOcrProgress: number;
  clientOcrCurrentPage: number;
  clientOcrTotalPages: number;
  transcriptionProgress: number;
  extractionProgress: { docId: string; progress: number } | null;
  isAudioVideo: (doc: Document) => boolean;
  markAsOcrProcessedPending: boolean;
}

interface SortableRowProps {
  doc: Document;
  isSelected: boolean;
  onToggleSelection: (docId: string) => void;
  onViewDetails: (doc: Document) => void;
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  onOcr: (doc: Document) => void;
  onTranscription: (doc: Document) => void;
  onMarkAsOcrProcessed: (docId: string) => void;
  ocrProcessingDocId: string | null;
  transcriptionProcessingDocId: string | null;
  clientOcrProgress: number;
  clientOcrCurrentPage: number;
  clientOcrTotalPages: number;
  transcriptionProgress: number;
  extractionProgress: { docId: string; progress: number } | null;
  isAudioVideo: (doc: Document) => boolean;
  markAsOcrProcessedPending: boolean;
}

function SortableRow({
  doc,
  isSelected,
  onToggleSelection,
  onViewDetails,
  onEdit,
  onDelete,
  onOcr,
  onTranscription,
  onMarkAsOcrProcessed,
  ocrProcessingDocId,
  transcriptionProcessingDocId,
  clientOcrProgress,
  clientOcrCurrentPage,
  clientOcrTotalPages,
  transcriptionProgress,
  extractionProgress,
  isAudioVideo,
  markAsOcrProcessedPending,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: doc.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? 'var(--primary-foreground)' : undefined,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`${isSelected ? "bg-primary/5" : ""} ${isDragging ? "shadow-lg" : ""}`}
    >
      {/* Drag handle */}
      <TableCell className="w-8 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </TableCell>
      
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelection(doc.id)}
          aria-label={`Sélectionner ${doc.title}`}
        />
      </TableCell>
      
      <TableCell>
        <div>
          <p className="font-medium">{doc.title}</p>
          <p className="text-xs text-muted-foreground">
            {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '-'}
          </p>
        </div>
      </TableCell>
      
      <TableCell className="w-28 text-center">
        <span className="text-sm font-mono">{doc.cbn_documents?.cote || '-'}</span>
      </TableCell>
      
      <TableCell>
        <Badge variant="outline">{doc.document_type || doc.file_format || 'Non défini'}</Badge>
      </TableCell>
      
      <TableCell>
        <span className="text-sm">{doc.author || '-'}</span>
      </TableCell>
      
      <TableCell>
        {doc.ocr_processed ? (
          <Badge variant="default" className="bg-green-600">Oui</Badge>
        ) : (
          <Badge variant="secondary">Non</Badge>
        )}
      </TableCell>
      
      <TableCell className="text-right">
        <div className="flex gap-2 justify-end">
          {isAudioVideo(doc) ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTranscription(doc)}
              disabled={transcriptionProcessingDocId === doc.id}
              title={transcriptionProcessingDocId === doc.id
                ? `Transcription en cours (${transcriptionProgress}%)`
                : "Lancer la transcription (Whisper)"}
            >
              {transcriptionProcessingDocId === doc.id ? (
                <div className="flex items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs">{transcriptionProgress}%</span>
                </div>
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              {doc.ocr_processed ? (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-300">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  OCRisé
                </Badge>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOcr(doc)}
                    disabled={ocrProcessingDocId === doc.id}
                    title={ocrProcessingDocId === doc.id && clientOcrTotalPages > 0
                      ? `OCR en cours: page ${clientOcrCurrentPage}/${clientOcrTotalPages} (${clientOcrProgress}%)`
                      : "Lancer l'OCR"}
                  >
                    {ocrProcessingDocId === doc.id ? (
                      <div className="flex items-center gap-1">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {clientOcrTotalPages > 0 && (
                          <span className="text-xs">{clientOcrProgress}%</span>
                        )}
                      </div>
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onMarkAsOcrProcessed(doc.id)}
                    disabled={markAsOcrProcessedPending || extractionProgress?.docId === doc.id}
                    title="Extraire et indexer le texte (PDF déjà OCRisé)"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    {extractionProgress?.docId === doc.id ? (
                      <div className="flex items-center gap-1">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-xs">{extractionProgress.progress}%</span>
                      </div>
                    ) : (
                      <FileSearch className="h-4 w-4" />
                    )}
                  </Button>
                </>
              )}
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(doc)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(doc)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(doc)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function DraggableDocumentsList({
  documents,
  selectedDocIds,
  onToggleSelection,
  onToggleSelectAll,
  onViewDetails,
  onEdit,
  onDelete,
  onOcr,
  onTranscription,
  onMarkAsOcrProcessed,
  ocrProcessingDocId,
  transcriptionProcessingDocId,
  clientOcrProgress,
  clientOcrCurrentPage,
  clientOcrTotalPages,
  transcriptionProgress,
  extractionProgress,
  isAudioVideo,
  markAsOcrProcessedPending,
}: DraggableDocumentsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [orderedDocs, setOrderedDocs] = useState<Document[]>(documents);
  
  // Sync with props when documents change
  if (JSON.stringify(documents.map(d => d.id)) !== JSON.stringify(orderedDocs.map(d => d.id))) {
    setOrderedDocs(documents);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateSortOrder = useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      // Update in batch
      for (const update of updates) {
        const { error } = await supabase
          .from('digital_library_documents')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
      toast({
        title: "Ordre mis à jour",
        description: "L'ordre des documents dans 'Derniers ajouts' a été sauvegardé.",
      });
    },
    onError: (error) => {
      console.error('Error updating sort order:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'ordre des documents.",
        variant: "destructive",
      });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = orderedDocs.findIndex((doc) => doc.id === active.id);
      const newIndex = orderedDocs.findIndex((doc) => doc.id === over.id);

      const newOrder = arrayMove(orderedDocs, oldIndex, newIndex);
      setOrderedDocs(newOrder);

      // Prepare updates with new sort_order values
      const updates = newOrder.map((doc, index) => ({
        id: doc.id,
        sort_order: index + 1,
      }));

      updateSortOrder.mutate(updates);
    }
  };

  const allSelected = orderedDocs.length > 0 && orderedDocs.every(doc => selectedDocIds.includes(doc.id));

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <GripVertical className="h-4 w-4" />
        Glissez-déposez les lignes pour réordonner l'affichage dans "Derniers ajouts"
      </p>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onToggleSelectAll}
                  aria-label="Sélectionner tous"
                />
              </TableHead>
              <TableHead className="min-w-[200px]">Titre</TableHead>
              <TableHead className="w-28 text-center">N° Cote</TableHead>
              <TableHead className="w-28">Type</TableHead>
              <TableHead className="w-36">Auteur</TableHead>
              <TableHead className="w-28 text-center">OCR/Transcription</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <SortableContext items={orderedDocs.map(d => d.id)} strategy={verticalListSortingStrategy}>
            <TableBody>
              {orderedDocs.map((doc) => (
                <SortableRow
                  key={doc.id}
                  doc={doc}
                  isSelected={selectedDocIds.includes(doc.id)}
                  onToggleSelection={onToggleSelection}
                  onViewDetails={onViewDetails}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onOcr={onOcr}
                  onTranscription={onTranscription}
                  onMarkAsOcrProcessed={onMarkAsOcrProcessed}
                  ocrProcessingDocId={ocrProcessingDocId}
                  transcriptionProcessingDocId={transcriptionProcessingDocId}
                  clientOcrProgress={clientOcrProgress}
                  clientOcrCurrentPage={clientOcrCurrentPage}
                  clientOcrTotalPages={clientOcrTotalPages}
                  transcriptionProgress={transcriptionProgress}
                  extractionProgress={extractionProgress}
                  isAudioVideo={isAudioVideo}
                  markAsOcrProcessedPending={markAsOcrProcessedPending}
                />
              ))}
            </TableBody>
          </SortableContext>
        </Table>
      </DndContext>
      
      {updateSortOrder.isPending && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Sauvegarde de l'ordre en cours...
        </p>
      )}
    </div>
  );
}
