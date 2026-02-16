import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SimpleDropdown } from "@/components/cbn/SimpleDropdown";
import { Icon } from "@iconify/react";
import { useState } from "react";

interface RestrictionTemplate {
  id: string;
  name: string;
  description: string | null;
  is_restricted: boolean;
  restriction_mode: string;
  start_page: number | null;
  end_page: number | null;
  manual_pages: number[] | null;
  percentage_value: number | null;
  percentage_distribution: string | null;
  allow_physical_consultation: boolean | null;
  allow_download: boolean | null;
  allow_screenshot: boolean | null;
  allow_right_click: boolean | null;
  restricted_page_display: string | null;
  restricted_page_display_reason: string | null;
  allow_double_page_view: boolean | null;
  allow_scroll_view: boolean | null;
}

interface TemplateSelectorProps {
  onApply: (template: RestrictionTemplate) => void;
}

export function TemplateSelector({ onApply }: TemplateSelectorProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const { data: templates, isLoading } = useQuery({
    queryKey: ['restriction-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restriction_templates')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as RestrictionTemplate[];
    }
  });

  const selectedTemplate = templates?.find(t => t.id === selectedTemplateId);

  const restrictionModeLabel = (mode: string) => {
    switch (mode) {
      case 'range': return 'Par plage';
      case 'manual': return 'Manuel';
      case 'percentage': return 'Pourcentage';
      default: return mode;
    }
  };

  const displayModeLabel = (mode: string | null) => {
    switch (mode) {
      case 'blur': return 'Flou';
      case 'empty': return 'Vide';
      case 'hidden': return 'Masqué';
      default: return mode;
    }
  };

  if (isLoading) return null;

  const hasTemplates = templates && templates.length > 0;

  return (
    <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          <Icon icon="mdi:file-document-check-outline" className="h-4 w-4" />
          Appliquer depuis un modèle
        </div>
        {hasTemplates ? (
          <>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <SimpleDropdown
                  value={selectedTemplateId}
                  onChange={setSelectedTemplateId}
                  options={templates.map(t => ({
                    value: t.id,
                    label: t.name,
                  }))}
                  placeholder="Choisir un modèle..."
                />
              </div>
              <Button
                size="sm"
                disabled={!selectedTemplate}
                onClick={() => {
                  if (selectedTemplate) {
                    onApply(selectedTemplate);
                    setSelectedTemplateId("");
                  }
                }}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                <Icon icon="mdi:check" className="h-4 w-4" />
                Appliquer
              </Button>
            </div>
            {selectedTemplate && (
              <div className="flex flex-wrap gap-1.5 text-xs">
                <Badge variant="outline" className="text-xs">{restrictionModeLabel(selectedTemplate.restriction_mode)}</Badge>
                {selectedTemplate.restriction_mode === 'range' && (
                  <Badge variant="secondary" className="text-xs">Pages {selectedTemplate.start_page}-{selectedTemplate.end_page}</Badge>
                )}
                {selectedTemplate.restriction_mode === 'percentage' && (
                  <Badge variant="secondary" className="text-xs">{selectedTemplate.percentage_value}%</Badge>
                )}
                {selectedTemplate.restricted_page_display && (
                  <Badge variant="secondary" className="text-xs">Affichage: {displayModeLabel(selectedTemplate.restricted_page_display)}</Badge>
                )}
                {!selectedTemplate.allow_download && <Badge variant="destructive" className="text-xs">DL bloqué</Badge>}
                {!selectedTemplate.allow_screenshot && <Badge variant="destructive" className="text-xs">Capture bloquée</Badge>}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground italic">Aucun modèle disponible</p>
        )}
      </CardContent>
    </Card>
  );
}
