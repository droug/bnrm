/**
 * Floating panel showing active background OCR jobs — persists across navigation
 */

import { useState } from "react";
import { useBackgroundOcr, OCR_ENGINE_LABELS } from "@/hooks/useBackgroundOcr";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, X, ChevronDown, ChevronUp, Wand2 } from "lucide-react";

export function BackgroundOcrFloatingPanel() {
  const { jobs, cancelJob, activeJobsCount } = useBackgroundOcr();
  const [collapsed, setCollapsed] = useState(false);

  // Only show when there are jobs
  if (jobs.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] w-80 shadow-2xl rounded-xl border border-border bg-background overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-primary/10 cursor-pointer select-none"
        onClick={() => setCollapsed(c => !c)}
      >
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            OCR en arrière-plan
          </span>
          {activeJobsCount > 0 && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse text-xs px-1.5">
              {activeJobsCount} en cours
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {collapsed
            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          }
        </div>
      </div>

      {/* Jobs list */}
      {!collapsed && (
        <div className="divide-y divide-border max-h-72 overflow-y-auto">
          {jobs.map(job => (
            <div key={job.id} className="px-4 py-3 space-y-2">
              {/* Title + engine */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate" title={job.documentTitle}>
                    {job.documentTitle}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {OCR_ENGINE_LABELS[job.engine] || job.engine}
                    {job.totalPages > 0 && ` · Page ${job.currentPage}/${job.totalPages}`}
                  </p>
                </div>
                {/* Status icon / cancel */}
                {(job.status === 'pending' || job.status === 'processing') ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); cancelJob(job.id); }}
                    title="Annuler"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                ) : job.status === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                )}
              </div>

              {/* Progress bar */}
              {(job.status === 'pending' || job.status === 'processing') && (
                <div className="space-y-1">
                  <Progress value={job.progress} className="h-1.5" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      {job.status === 'pending' ? 'En attente…' : 'En cours…'}
                    </span>
                    <span className="text-[10px] font-medium text-primary">{job.progress}%</span>
                  </div>
                </div>
              )}

              {/* Completed / Failed status */}
              {job.status === 'completed' && (
                <p className="text-[10px] text-green-600 dark:text-green-400">
                  ✓ {job.totalPages} page(s) traitée(s) avec succès
                </p>
              )}
              {job.status === 'failed' && (
                <p className="text-[10px] text-destructive">
                  ✗ {job.error || 'Erreur inconnue'}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
