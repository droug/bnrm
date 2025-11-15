import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  SYSTEM_MODULES, 
  SYSTEM_SERVICES, 
  WORKFLOW_PERMISSIONS,
  INSCRIPTION_ADHESION_ROLES 
} from "@/config/systemModulesAndServices";
import { Database, Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface InitializationStep {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
}

export function SystemDataInitializer() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<InitializationStep[]>([
    { name: 'Modules système', status: 'pending' },
    { name: 'Services système', status: 'pending' },
    { name: 'Permissions workflow', status: 'pending' },
    { name: 'Rôles inscription/adhésion', status: 'pending' },
  ]);

  const updateStepStatus = (index: number, status: InitializationStep['status'], message?: string) => {
    setSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, status, message } : step
    ));
  };

  const initializeSystemData = async () => {
    setIsInitializing(true);
    setProgress(0);

    try {
      // Étape 1: Insérer les modules
      updateStepStatus(0, 'running');
      
      // Vérifier les modules existants et n'insérer que les nouveaux
      const { data: existingModules } = await supabase
        .from('system_modules')
        .select('code');
      
      const existingCodes = new Set(existingModules?.map(m => m.code) || []);
      const newModules = SYSTEM_MODULES.filter(m => !existingCodes.has(m.code));
      
      if (newModules.length > 0) {
        const { error: modulesError } = await supabase
          .from('system_modules')
          .insert(
            newModules.map(m => ({
              code: m.code,
              name: m.name,
              platform: m.platform,
              description: m.description,
              icon: m.icon,
              color: m.color,
              is_active: m.is_active,
            }))
          );

        if (modulesError) {
          updateStepStatus(0, 'error', modulesError.message);
          throw modulesError;
        }
      }

      updateStepStatus(0, 'success', `${newModules.length} nouveaux modules insérés (${existingCodes.size} existants)`);
      setProgress(25);

      // Étape 2: Insérer les services
      updateStepStatus(1, 'running');
      
      // Récupérer les IDs des modules pour les relations
      const { data: modules } = await supabase
        .from('system_modules')
        .select('id, code');
      
      const moduleMap = new Map(modules?.map(m => [m.code, m.id]) || []);
      
      // Vérifier les services existants
      const { data: existingServices } = await supabase
        .from('system_services')
        .select('code');
      
      const existingServiceCodes = new Set(existingServices?.map(s => s.code) || []);
      
      const servicesWithModuleIds = SYSTEM_SERVICES
        .filter(s => !existingServiceCodes.has(s.code))
        .map(s => ({
          code: s.code,
          name: s.name,
          module_id: moduleMap.get(s.module_code),
          description: s.description,
          is_active: s.is_active,
          requires_approval: s.requires_approval,
        }));

      if (servicesWithModuleIds.length > 0) {
        const { error: servicesError } = await supabase
          .from('system_services')
          .insert(servicesWithModuleIds);

        if (servicesError) {
          updateStepStatus(1, 'error', servicesError.message);
          throw servicesError;
        }
      }
      
      updateStepStatus(1, 'success', `${servicesWithModuleIds.length} nouveaux services insérés (${existingServiceCodes.size} existants)`);
      setProgress(50);

      // Étape 3: Insérer les permissions
      updateStepStatus(2, 'running');
      
      const { data: existingPermissions } = await supabase
        .from('workflow_permissions')
        .select('permission_name');
      
      const existingPermNames = new Set(existingPermissions?.map(p => p.permission_name) || []);
      const newPermissions = WORKFLOW_PERMISSIONS.filter(p => !existingPermNames.has(p.permission_name));
      
      if (newPermissions.length > 0) {
        const { error: permissionsError } = await supabase
          .from('workflow_permissions')
          .insert(newPermissions);

        if (permissionsError) {
          updateStepStatus(2, 'error', permissionsError.message);
          throw permissionsError;
        }
      }
      
      updateStepStatus(2, 'success', `${newPermissions.length} nouvelles permissions insérées (${existingPermNames.size} existantes)`);
      setProgress(75);

      // Étape 4: Insérer les rôles
      updateStepStatus(3, 'running');
      
      const { data: existingRoles } = await supabase
        .from('workflow_roles')
        .select('role_name');
      
      const existingRoleNames = new Set(existingRoles?.map(r => r.role_name) || []);
      const newRoles = INSCRIPTION_ADHESION_ROLES.filter(r => !existingRoleNames.has(r.role_name));
      
      if (newRoles.length > 0) {
        const { error: rolesError } = await supabase
          .from('workflow_roles')
          .insert(
            newRoles.map(r => ({
              role_name: r.role_name,
              role_level: r.role_level,
              module: r.module,
              description: r.description,
              permissions: r.permissions,
            }))
          );

        if (rolesError) {
          updateStepStatus(3, 'error', rolesError.message);
          throw rolesError;
        }
      }
      
      updateStepStatus(3, 'success', `${newRoles.length} nouveaux rôles insérés (${existingRoleNames.size} existants)`);
      setProgress(100);

      toast.success("Initialisation terminée", {
        description: "Tous les modules, services, permissions et rôles ont été initialisés avec succès.",
      });

    } catch (error: any) {
      console.error('Erreur lors de l\'initialisation:', error);
      toast.error("Erreur d'initialisation", {
        description: error.message || "Une erreur s'est produite lors de l'initialisation.",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const getStepIcon = (status: InitializationStep['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <CardTitle>Initialisation du Système</CardTitle>
        </div>
        <CardDescription>
          Initialiser les modules, services, permissions et rôles détectés dans le système
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Download className="h-4 w-4" />
          <AlertDescription>
            Cette opération va insérer ou mettre à jour {SYSTEM_MODULES.length} modules, 
            {' '}{SYSTEM_SERVICES.length} services, {WORKFLOW_PERMISSIONS.length} permissions
            {' '}et {INSCRIPTION_ADHESION_ROLES.length} rôles dans la base de données.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Modules détectés:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {SYSTEM_MODULES.slice(0, 6).map(m => (
              <div key={m.code} className="flex items-center gap-2 p-2 rounded border">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="truncate">{m.name}</span>
              </div>
            ))}
            {SYSTEM_MODULES.length > 6 && (
              <div className="p-2 text-muted-foreground">
                +{SYSTEM_MODULES.length - 6} autres...
              </div>
            )}
          </div>
        </div>

        {isInitializing && (
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 rounded border"
                >
                  <div className="flex items-center gap-2">
                    {getStepIcon(step.status)}
                    <span className="text-sm">{step.name}</span>
                  </div>
                  {step.message && (
                    <span className="text-xs text-muted-foreground">{step.message}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={initializeSystemData}
          disabled={isInitializing}
          className="w-full"
          size="lg"
        >
          {isInitializing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Initialisation en cours...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Initialiser le Système
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
