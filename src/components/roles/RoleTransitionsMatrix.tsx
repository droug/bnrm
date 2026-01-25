import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { COMPLETE_SYSTEM_ROLES, ROLE_WORKFLOW_TRANSITIONS, CompleteSystemRole } from "@/config/completeSystemRoles";
import { CheckCircle2, XCircle, Shield, ArrowRight, Edit, Trash2, Plus, Settings, GitBranch, Layers } from "lucide-react";
import { TransitionRolesEditorDialog } from "./TransitionRolesEditorDialog";
import { RolePermissionsEditorDialog } from "./RolePermissionsEditorDialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface RoleTransitionsMatrixProps {
  selectedPlatform?: string;
}

export function RoleTransitionsMatrix({ selectedPlatform = "all" }: RoleTransitionsMatrixProps) {
  const { toast } = useToast();
  const [roles, setRoles] = useState<CompleteSystemRole[]>(COMPLETE_SYSTEM_ROLES);
  const [workflowTransitions, setWorkflowTransitions] = useState(ROLE_WORKFLOW_TRANSITIONS);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTransition, setSelectedTransition] = useState<string>("");
  const [selectedTransitionRoles, setSelectedTransitionRoles] = useState<string[]>([]);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<CompleteSystemRole | null>(null);
  
  const transitions = Object.keys(workflowTransitions);
  
  const platformToModules: Record<string, string[]> = {
    all: [],
    bnrm: ['inscription', 'adhesion', 'reproduction', 'restoration', 'space_booking', 'bnrm'],
    digital_library: ['digital_library', 'cataloging', 'ged'],
    manuscripts: ['manuscripts', 'manuscripts_access'],
    cbm: ['cbm', 'cbm_network', 'cbm_adhesion', 'cbm_training', 'cbm_catalog'],
    kitab: ['legal_deposit', 'isbn_issn'],
    cultural: ['cultural_activities'],
  };
  
  const filteredRoles = selectedPlatform === "all" 
    ? roles 
    : roles.filter(role => 
        platformToModules[selectedPlatform]?.includes(role.module) || 
        role.module === 'system'
      );
  
  const rolesByModule = filteredRoles.reduce((acc, role) => {
    if (!acc[role.module]) acc[role.module] = [];
    acc[role.module].push(role);
    return acc;
  }, {} as Record<string, typeof filteredRoles>);

  const getTransitionColor = (transition: string) => {
    const colors: Record<string, string> = {
      submit: 'bg-blue-500', validate: 'bg-green-500', approve: 'bg-emerald-500',
      reject: 'bg-red-500', assign: 'bg-purple-500', complete: 'bg-cyan-500',
      cancel: 'bg-orange-500', reopen: 'bg-amber-500',
    };
    return colors[transition] || 'bg-gray-500';
  };

  const canPerformTransition = (roleName: string, transition: string): boolean => {
    const allowedRoles = workflowTransitions[transition as keyof typeof workflowTransitions];
    return allowedRoles?.includes(roleName) || false;
  };

  const handleEditTransition = (transitionName: string) => {
    setSelectedTransition(transitionName);
    setSelectedTransitionRoles(workflowTransitions[transitionName as keyof typeof workflowTransitions] || []);
    setEditDialogOpen(true);
  };

  const handleSaveTransition = (transitionName: string, newRoles: string[]) => {
    setWorkflowTransitions(prev => ({ ...prev, [transitionName]: newRoles }));
    toast({ title: "Transition mise à jour", description: `Les rôles pour "${transitionName}" ont été modifiés` });
  };

  const handleDeleteTransition = (transitionName: string) => {
    if (confirm(`Supprimer la transition "${transitionName}" ?`)) {
      const newTransitions = { ...workflowTransitions };
      delete newTransitions[transitionName as keyof typeof newTransitions];
      setWorkflowTransitions(newTransitions);
      toast({ title: "Transition supprimée", variant: "destructive" });
    }
  };

  const handleEditRolePermissions = (role: CompleteSystemRole) => {
    setSelectedRole(role);
    setPermissionsDialogOpen(true);
  };

  const handleSaveRolePermissions = (roleName: string, newPermissions: string[], canManageTransitions: boolean) => {
    setRoles(prevRoles => 
      prevRoles.map(role => 
        role.role_name === roleName
          ? { ...role, permissions: newPermissions, can_manage_transitions: canManageTransitions }
          : role
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-500/10 via-purple-400/5 to-transparent border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <GitBranch className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Matrice des Rôles et Transitions Workflow</CardTitle>
                <CardDescription>
                  Vue d'ensemble des capacités de transition pour chaque rôle
                  {selectedPlatform !== "all" && (
                    <Badge variant="outline" className="ml-2">Filtré</Badge>
                  )}
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle transition
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-background/50 rounded-lg p-3 border">
              <p className="text-2xl font-bold text-purple-600">{filteredRoles.length}</p>
              <p className="text-xs text-muted-foreground">Rôles {selectedPlatform !== "all" ? "filtrés" : "système"}</p>
            </div>
            <div className="bg-background/50 rounded-lg p-3 border">
              <p className="text-2xl font-bold text-blue-600">{Object.keys(rolesByModule).length}</p>
              <p className="text-xs text-muted-foreground">Modules</p>
            </div>
            <div className="bg-background/50 rounded-lg p-3 border">
              <p className="text-2xl font-bold text-emerald-600">{transitions.length}</p>
              <p className="text-xs text-muted-foreground">Transitions</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Transitions Legend */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Transitions disponibles:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {transitions.map((transition) => {
                const rolesCount = workflowTransitions[transition as keyof typeof workflowTransitions]?.length || 0;
                return (
                  <motion.div 
                    key={transition}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-2.5 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-white border-0", getTransitionColor(transition))}>
                        {transition}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{rolesCount}</span>
                    </div>
                    <div className="flex gap-0.5">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditTransition(transition)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteTransition(transition)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Roles Matrix by Module */}
          <ScrollArea className="h-[500px]">
            <div className="space-y-6">
              {Object.entries(rolesByModule).map(([module, moduleRoles]) => (
                <div key={module} className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold capitalize">{module.replace(/_/g, ' ')}</h3>
                    <Badge variant="secondary">{moduleRoles.length}</Badge>
                  </div>
                  
                  <div className="grid gap-3">
                    {moduleRoles.map((role, index) => (
                      <motion.div
                        key={role.role_name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="border rounded-lg p-4 bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{role.role_name}</h4>
                              <Badge variant="outline" className="text-xs">{role.role_level}</Badge>
                              {role.can_manage_transitions && (
                                <Badge className="bg-primary gap-1">
                                  <ArrowRight className="h-3 w-3" />
                                  Transitions
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditRolePermissions(role)}>
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Transitions Grid */}
                        <div className="flex flex-wrap gap-1.5">
                          {transitions.map((transition) => {
                            const canPerform = canPerformTransition(role.role_name, transition);
                            return (
                              <div 
                                key={transition}
                                className={cn(
                                  "flex items-center gap-1 px-2 py-1 rounded text-xs border",
                                  canPerform 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-muted/50 text-muted-foreground border-muted'
                                )}
                              >
                                {canPerform ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                {transition}
                              </div>
                            );
                          })}
                        </div>

                        {/* Permissions Summary */}
                        {role.permissions.length > 0 && (
                          <details className="text-xs mt-3">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              {role.permissions.length} permissions
                            </summary>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {role.permissions.slice(0, 6).map((perm) => (
                                <Badge key={perm} variant="secondary" className="text-xs font-mono">
                                  {perm}
                                </Badge>
                              ))}
                              {role.permissions.length > 6 && (
                                <Badge variant="outline" className="text-xs">
                                  +{role.permissions.length - 6}
                                </Badge>
                              )}
                            </div>
                          </details>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>

        <TransitionRolesEditorDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          transitionName={selectedTransition}
          currentRoles={selectedTransitionRoles}
          onSave={handleSaveTransition}
        />

        {selectedRole && (
          <RolePermissionsEditorDialog
            open={permissionsDialogOpen}
            onOpenChange={setPermissionsDialogOpen}
            role={selectedRole}
            onSave={handleSaveRolePermissions}
          />
        )}
      </Card>
    </motion.div>
  );
}
