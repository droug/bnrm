import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  SYSTEM_MODULES, 
  SYSTEM_SERVICES, 
  WORKFLOW_PERMISSIONS,
  INSCRIPTION_ADHESION_ROLES 
} from "@/config/systemModulesAndServices";
import { Database, Download, CheckCircle2, AlertCircle, Loader2, Zap, Box, Key, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface InitializationStep {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  icon: any;
}

export function SystemDataInitializer() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<InitializationStep[]>([
    { name: 'Modules système', status: 'pending', icon: Box },
    { name: 'Services système', status: 'pending', icon: Zap },
    { name: 'Permissions workflow', status: 'pending', icon: Key },
    { name: 'Rôles inscription/adhésion', status: 'pending', icon: Users },
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
      
      const { data: existingModules } = await supabase.from('system_modules').select('code');
      const existingCodes = new Set(existingModules?.map(m => m.code) || []);
      const newModules = SYSTEM_MODULES.filter(m => !existingCodes.has(m.code));
      
      if (newModules.length > 0) {
        const { error: modulesError } = await supabase.from('system_modules').insert(
          newModules.map(m => ({
            code: m.code, name: m.name, platform: m.platform,
            description: m.description, icon: m.icon, color: m.color, is_active: m.is_active,
          }))
        );
        if (modulesError) { updateStepStatus(0, 'error', modulesError.message); throw modulesError; }
      }
      updateStepStatus(0, 'success', `${newModules.length} nouveaux (${existingCodes.size} existants)`);
      setProgress(25);

      // Étape 2: Services
      updateStepStatus(1, 'running');
      const { data: modules } = await supabase.from('system_modules').select('id, code');
      const moduleMap = new Map(modules?.map(m => [m.code, m.id]) || []);
      const { data: existingServices } = await supabase.from('system_services').select('code');
      const existingServiceCodes = new Set(existingServices?.map(s => s.code) || []);
      
      const servicesWithModuleIds = SYSTEM_SERVICES
        .filter(s => !existingServiceCodes.has(s.code))
        .map(s => ({ code: s.code, name: s.name, module_id: moduleMap.get(s.module_code), description: s.description, is_active: s.is_active, requires_approval: s.requires_approval }));

      if (servicesWithModuleIds.length > 0) {
        const { error: servicesError } = await supabase.from('system_services').insert(servicesWithModuleIds);
        if (servicesError) { updateStepStatus(1, 'error', servicesError.message); throw servicesError; }
      }
      updateStepStatus(1, 'success', `${servicesWithModuleIds.length} nouveaux (${existingServiceCodes.size} existants)`);
      setProgress(50);

      // Étape 3: Permissions
      updateStepStatus(2, 'running');
      const { data: existingPermissions } = await supabase.from('workflow_permissions').select('permission_name');
      const existingPermNames = new Set(existingPermissions?.map(p => p.permission_name) || []);
      const newPermissions = WORKFLOW_PERMISSIONS.filter(p => !existingPermNames.has(p.permission_name));
      
      if (newPermissions.length > 0) {
        const { error: permissionsError } = await supabase.from('workflow_permissions').insert(newPermissions);
        if (permissionsError) { updateStepStatus(2, 'error', permissionsError.message); throw permissionsError; }
      }
      updateStepStatus(2, 'success', `${newPermissions.length} nouvelles (${existingPermNames.size} existantes)`);
      setProgress(75);

      // Étape 4: Rôles
      updateStepStatus(3, 'running');
      const { data: existingRoles } = await supabase.from('workflow_roles').select('role_name');
      const existingRoleNames = new Set(existingRoles?.map(r => r.role_name) || []);
      const newRoles = INSCRIPTION_ADHESION_ROLES.filter(r => !existingRoleNames.has(r.role_name));
      
      if (newRoles.length > 0) {
        const { error: rolesError } = await supabase.from('workflow_roles').insert(
          newRoles.map(r => ({ role_name: r.role_name, role_level: r.role_level, module: r.module, description: r.description, permissions: r.permissions }))
        );
        if (rolesError) { updateStepStatus(3, 'error', rolesError.message); throw rolesError; }
      }
      updateStepStatus(3, 'success', `${newRoles.length} nouveaux (${existingRoleNames.size} existants)`);
      setProgress(100);

      toast.success("Initialisation terminée avec succès");
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error("Erreur d'initialisation", { description: error.message });
    } finally {
      setIsInitializing(false);
    }
  };

  const getStepIcon = (step: InitializationStep) => {
    const Icon = step.icon;
    switch (step.status) {
      case 'running':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Icon className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-b">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Database className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Initialisation du Système</CardTitle>
              <CardDescription>
                Initialiser les modules, services, permissions et rôles détectés dans le système
              </CardDescription>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-background/50 rounded-lg p-3 border">
              <p className="text-2xl font-bold text-amber-600">{SYSTEM_MODULES.length}</p>
              <p className="text-xs text-muted-foreground">Modules</p>
            </div>
            <div className="bg-background/50 rounded-lg p-3 border">
              <p className="text-2xl font-bold text-blue-600">{SYSTEM_SERVICES.length}</p>
              <p className="text-xs text-muted-foreground">Services</p>
            </div>
            <div className="bg-background/50 rounded-lg p-3 border">
              <p className="text-2xl font-bold text-emerald-600">{WORKFLOW_PERMISSIONS.length}</p>
              <p className="text-xs text-muted-foreground">Permissions</p>
            </div>
            <div className="bg-background/50 rounded-lg p-3 border">
              <p className="text-2xl font-bold text-purple-600">{INSCRIPTION_ADHESION_ROLES.length}</p>
              <p className="text-xs text-muted-foreground">Rôles</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <Alert className="border-amber-200 bg-amber-50">
            <Download className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Cette opération va insérer ou mettre à jour les données système dans la base de données.
              Les éléments existants ne seront pas modifiés.
            </AlertDescription>
          </Alert>

          {/* Module preview */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Aperçu des modules:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {SYSTEM_MODULES.slice(0, 8).map(m => (
                <div key={m.code} className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-xs truncate">{m.name}</span>
                </div>
              ))}
              {SYSTEM_MODULES.length > 8 && (
                <div className="p-2 text-xs text-muted-foreground flex items-center">
                  +{SYSTEM_MODULES.length - 8} autres...
                </div>
              )}
            </div>
          </div>

          {/* Progress Steps */}
          {isInitializing && (
            <div className="space-y-4">
              <Progress value={progress} className="h-2" />
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors",
                      step.status === 'success' && "bg-emerald-50 border-emerald-200",
                      step.status === 'error' && "bg-red-50 border-red-200",
                      step.status === 'running' && "bg-blue-50 border-blue-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {getStepIcon(step)}
                      <span className="text-sm font-medium">{step.name}</span>
                    </div>
                    {step.message && (
                      <Badge variant="outline" className="text-xs">
                        {step.message}
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={initializeSystemData}
            disabled={isInitializing}
            className="w-full gap-2"
            size="lg"
          >
            {isInitializing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Initialisation en cours...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                Initialiser le Système
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
