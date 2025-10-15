import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Download, CheckCircle2, AlertCircle, Loader2, Package, Workflow as WorkflowIcon } from "lucide-react";
import predefinedModels from "@/data/predefinedWorkflowModels.json";

interface ImportProgress {
  current: number;
  total: number;
  currentModel: string;
  status: 'idle' | 'importing' | 'completed' | 'error';
}

export function PredefinedWorkflowsImporter() {
  const [progress, setProgress] = useState<ImportProgress>({
    current: 0,
    total: 0,
    currentModel: '',
    status: 'idle'
  });
  const [importedModels, setImportedModels] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      'blue': 'bg-blue-500',
      'green': 'bg-green-500',
      'purple': 'bg-purple-500',
      'orange': 'bg-orange-500',
      'yellow': 'bg-yellow-500',
      'red': 'bg-red-500',
      'cyan': 'bg-cyan-500',
    };
    return colors[color] || 'bg-gray-500';
  };

  const importAllModels = async () => {
    setProgress({
      current: 0,
      total: predefinedModels.length,
      currentModel: '',
      status: 'importing'
    });
    setImportedModels([]);
    setErrors([]);

    const imported: string[] = [];
    const errorsList: string[] = [];

    for (let i = 0; i < predefinedModels.length; i++) {
      const model = predefinedModels[i];
      
      setProgress(prev => ({
        ...prev,
        current: i + 1,
        currentModel: model.name
      }));

      try {
        await importWorkflowModel(model);
        imported.push(model.name);
        await new Promise(resolve => setTimeout(resolve, 500)); // Pause pour visibilité
      } catch (error) {
        console.error(`Error importing ${model.name}:`, error);
        errorsList.push(model.name);
      }
    }

    setImportedModels(imported);
    setErrors(errorsList);
    setProgress(prev => ({
      ...prev,
      status: errorsList.length > 0 ? 'error' : 'completed'
    }));

    if (errorsList.length === 0) {
      toast.success(`${imported.length} modèles importés avec succès!`);
    } else {
      toast.warning(`${imported.length} importés, ${errorsList.length} erreurs`);
    }
  };

  const importWorkflowModel = async (model: any) => {
    // 1. Vérifier si le workflow existe déjà
    const { data: existing } = await supabase
      .from('workflow_definitions')
      .select('id')
      .eq('name', model.name)
      .maybeSingle();

    let workflowId: string;

    if (existing) {
      // Mettre à jour le workflow existant
      workflowId = existing.id;
      const { error: updateError } = await supabase
        .from('workflow_definitions')
        .update({
          description: model.description,
          workflow_type: model.workflow_type,
          module: model.module,
          updated_at: new Date().toISOString()
        })
        .eq('id', workflowId);

      if (updateError) throw updateError;
    } else {
      // Créer un nouveau workflow
      const { data: newWorkflow, error: workflowError } = await supabase
        .from('workflow_definitions')
        .insert({
          name: model.name,
          description: model.description,
          workflow_type: model.workflow_type,
          module: model.module,
          version: 1,
          is_active: true,
          configuration: { predefined: true, code: model.code }
        })
        .select('id')
        .single();

      if (workflowError) throw workflowError;
      workflowId = newWorkflow.id;
    }

    // 2. Supprimer les anciennes étapes et transitions
    await supabase.from('workflow_steps_new').delete().eq('workflow_id', workflowId);
    await supabase.from('workflow_transitions').delete().eq('workflow_id', workflowId);

    // 3. Créer les rôles (s'ils n'existent pas)
    for (const role of model.roles) {
      const { data: existingRole } = await supabase
        .from('workflow_roles')
        .select('id')
        .eq('role_name', role.name)
        .eq('module', model.module)
        .maybeSingle();

      if (!existingRole) {
        await supabase.from('workflow_roles').insert({
          role_name: role.name,
          module: model.module,
          role_level: role.level,
          description: `Rôle prédéfini pour ${model.name}`
        });
      }
    }

    // 4. Créer les étapes
    const stepMapping: Record<number, string> = {};
    
    for (const step of model.steps) {
      const { data: newStep, error: stepError } = await supabase
        .from('workflow_steps_new')
        .insert({
          workflow_id: workflowId,
          step_name: step.name,
          step_type: step.type,
          step_number: step.order,
          required_role: step.required_role
        })
        .select('id')
        .single();

      if (stepError) throw stepError;
      stepMapping[step.order] = newStep.id;
    }

    // 5. Créer les transitions
    for (const transition of model.transitions) {
      const fromStepId = transition.from_step === 0 ? null : stepMapping[transition.from_step];
      const toStepId = transition.to_step === null ? null : stepMapping[transition.to_step];

      const { error: transitionError } = await supabase
        .from('workflow_transitions')
        .insert({
          workflow_id: workflowId,
          transition_name: transition.name,
          from_step_id: fromStepId,
          to_step_id: toStepId,
          trigger_type: transition.trigger_type
        });

      if (transitionError) throw transitionError;
    }
  };

  const progressPercentage = progress.total > 0 
    ? (progress.current / progress.total) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Modèles de Workflows Prédéfinis
              </CardTitle>
              <CardDescription>
                Importez les modèles standards BNRM pour tous les domaines fonctionnels
              </CardDescription>
            </div>
            <Button
              onClick={importAllModels}
              disabled={progress.status === 'importing'}
              size="lg"
            >
              {progress.status === 'importing' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importation en cours...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Importer tous les modèles
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {progress.status === 'idle' && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Cliquez sur "Importer" pour charger {predefinedModels.length} modèles prédéfinis</p>
            </div>
          )}

          {progress.status === 'importing' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    Importation: {progress.currentModel}
                  </span>
                  <span className="text-muted-foreground">
                    {progress.current} / {progress.total}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>
          )}

          {(progress.status === 'completed' || progress.status === 'error') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 rounded-lg bg-muted">
                {progress.status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                )}
                <div>
                  <p className="font-medium">
                    {importedModels.length} modèles importés avec succès
                  </p>
                  {errors.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {errors.length} erreurs détectées
                    </p>
                  )}
                </div>
              </div>

              {importedModels.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Modèles importés:</h4>
                  <div className="flex flex-wrap gap-2">
                    {importedModels.map((name) => (
                      <Badge key={name} variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-orange-600">Erreurs:</h4>
                  <div className="flex flex-wrap gap-2">
                    {errors.map((name) => (
                      <Badge key={name} variant="destructive" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {predefinedModels.map((model) => (
          <Card key={model.code} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getColorClass(model.color)}`} />
                <div className="flex-1">
                  <CardTitle className="text-base">{model.name}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {model.code} • v{model.version}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {model.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <WorkflowIcon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {model.steps.length} étapes • {model.transitions.length} transitions
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {model.roles.slice(0, 3).map((role, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {role.name}
                    </Badge>
                  ))}
                  {model.roles.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{model.roles.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              <Badge className={`${getColorClass(model.color)} text-white`}>
                {model.module}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
