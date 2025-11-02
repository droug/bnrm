import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ScrollableDialogNested,
  ScrollableDialogNestedContent,
  ScrollableDialogNestedHeader,
  ScrollableDialogNestedTitle,
  ScrollableDialogNestedDescription,
  ScrollableDialogNestedBody,
} from "@/components/ui/scrollable-dialog-nested";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Settings, List, History } from "lucide-react";
import { WorkflowStepsEditor } from "./WorkflowStepsEditor";
import { WorkflowTransitionsEditor } from "./WorkflowTransitionsEditor";
import { WorkflowVersionHistory } from "./WorkflowVersionHistory";

interface WorkflowBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string | null;
  onSaved?: () => void;
}

interface WorkflowDefinition {
  id: string;
  name: string;
  workflow_type: string;
  module: string;
  version: number;
  description?: string;
}

export function WorkflowBuilderDialog({
  open,
  onOpenChange,
  workflowId,
  onSaved,
}: WorkflowBuilderDialogProps) {
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && workflowId) {
      loadWorkflow();
    }
  }, [open, workflowId]);

  const loadWorkflow = async () => {
    if (!workflowId) return;

    try {
      const { data, error } = await supabase
        .from('workflow_definitions')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (error) throw error;
      setWorkflow(data);
    } catch (error) {
      console.error('Error loading workflow:', error);
      toast.error("Erreur lors du chargement du workflow");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScrollableDialogNested open={open} onOpenChange={onOpenChange}>
        <ScrollableDialogNestedContent className="max-w-5xl">
          <div className="flex items-center justify-center p-8">
            Chargement...
          </div>
        </ScrollableDialogNestedContent>
      </ScrollableDialogNested>
    );
  }

  if (!workflow) return null;

  return (
    <ScrollableDialogNested open={open} onOpenChange={onOpenChange}>
      <ScrollableDialogNestedContent className="max-w-5xl">
        <ScrollableDialogNestedHeader>
          <ScrollableDialogNestedTitle className="text-xl">
            {workflow.name} - v{workflow.version}
          </ScrollableDialogNestedTitle>
          <ScrollableDialogNestedDescription>
            {workflow.module} • {workflow.workflow_type}
            {workflow.description && ` - ${workflow.description}`}
          </ScrollableDialogNestedDescription>
        </ScrollableDialogNestedHeader>

        <ScrollableDialogNestedBody>
          <Tabs defaultValue="steps">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="steps">
                <List className="h-4 w-4 mr-2" />
                Étapes
              </TabsTrigger>
              <TabsTrigger value="transitions">
                <Settings className="h-4 w-4 mr-2" />
                Transitions
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                Historique
              </TabsTrigger>
            </TabsList>

            <TabsContent value="steps" className="mt-4">
              <Card className="p-4">
                <WorkflowStepsEditor workflowId={workflow.id} />
              </Card>
            </TabsContent>

            <TabsContent value="transitions" className="mt-4">
              <Card className="p-4">
                <WorkflowTransitionsEditor workflowId={workflow.id} />
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <Card className="p-4">
                <WorkflowVersionHistory workflowId={workflow.id} />
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollableDialogNestedBody>
      </ScrollableDialogNestedContent>
    </ScrollableDialogNested>
  );
}