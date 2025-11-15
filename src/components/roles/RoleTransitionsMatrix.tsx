import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { COMPLETE_SYSTEM_ROLES, ROLE_WORKFLOW_TRANSITIONS } from "@/config/completeSystemRoles";
import { CheckCircle2, XCircle, Shield, ArrowRight } from "lucide-react";

interface RoleTransitionsMatrixProps {
  selectedPlatform?: string;
}

/**
 * Matrice des rôles et leurs capacités de transition dans les workflows
 */
export function RoleTransitionsMatrix({ selectedPlatform = "all" }: RoleTransitionsMatrixProps) {
  const transitions = Object.keys(ROLE_WORKFLOW_TRANSITIONS);
  
  // Mapper les plateformes aux modules
  const platformToModules: Record<string, string[]> = {
    all: [], // Tous les modules
    bnrm: ['inscription', 'adhesion', 'reproduction', 'restoration', 'space_booking', 'bnrm'],
    digital_library: ['digital_library', 'cataloging', 'ged'],
    manuscripts: ['manuscripts', 'manuscripts_access'],
    cbm: ['cbm', 'cbm_network', 'cbm_adhesion', 'cbm_training', 'cbm_catalog'],
    kitab: ['legal_deposit', 'isbn_issn'],
    cultural: ['cultural_activities'],
  };
  
  // Filtrer les rôles selon la plateforme sélectionnée
  const filteredRoles = selectedPlatform === "all" 
    ? COMPLETE_SYSTEM_ROLES 
    : COMPLETE_SYSTEM_ROLES.filter(role => 
        platformToModules[selectedPlatform]?.includes(role.module) || 
        role.module === 'system' // Toujours inclure les rôles système
      );
  
  // Grouper les rôles filtrés par module
  const rolesByModule = filteredRoles.reduce((acc, role) => {
    if (!acc[role.module]) {
      acc[role.module] = [];
    }
    acc[role.module].push(role);
    return acc;
  }, {} as Record<string, typeof filteredRoles>);

  const getTransitionColor = (transition: string) => {
    const colors: Record<string, string> = {
      submit: 'bg-blue-500',
      validate: 'bg-green-500',
      approve: 'bg-emerald-500',
      reject: 'bg-red-500',
      assign: 'bg-purple-500',
      complete: 'bg-cyan-500',
      cancel: 'bg-orange-500',
      reopen: 'bg-amber-500',
    };
    return colors[transition] || 'bg-gray-500';
  };

  const canPerformTransition = (roleName: string, transition: string): boolean => {
    const allowedRoles = ROLE_WORKFLOW_TRANSITIONS[transition as keyof typeof ROLE_WORKFLOW_TRANSITIONS];
    return allowedRoles?.includes(roleName) || false;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <CardTitle>Matrice des Rôles et Transitions Workflow</CardTitle>
        </div>
        <CardDescription>
          Vue d'ensemble des capacités de transition pour chaque rôle dans les workflows du système
          {selectedPlatform !== "all" && (
            <span className="block mt-1 text-primary font-medium">
              Filtré par plateforme
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Légende des transitions */}
          <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium mr-2">Transitions:</span>
            {transitions.map((transition) => (
              <Badge 
                key={transition}
                variant="outline"
                className={`${getTransitionColor(transition)} text-white border-0`}
              >
                {transition}
              </Badge>
            ))}
          </div>

          {/* Matrice par module */}
          <ScrollArea className="h-[600px]">
            <div className="space-y-6">
              {Object.entries(rolesByModule).map(([module, roles]) => (
                <div key={module} className="space-y-3">
                  <h3 className="font-semibold text-lg capitalize border-b pb-2">
                    Module: {module.replace(/_/g, ' ')}
                  </h3>
                  
                  <div className="space-y-2">
                    {roles.map((role) => (
                      <div 
                        key={role.role_name}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{role.role_name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {role.role_level}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {role.description}
                            </p>
                          </div>
                          
                          {/* Indicateur de gestion de transitions */}
                          {role.can_manage_transitions && (
                            <Badge className="bg-primary">
                              <ArrowRight className="h-3 w-3 mr-1" />
                              Transitions
                            </Badge>
                          )}
                        </div>

                        {/* Transitions disponibles */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t">
                          {transitions.map((transition) => {
                            const canPerform = canPerformTransition(role.role_name, transition);
                            return (
                              <div 
                                key={transition}
                                className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                                  canPerform 
                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                    : 'bg-gray-50 text-gray-400 border border-gray-200'
                                }`}
                              >
                                {canPerform ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                                <span>{transition}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Permissions */}
                        {role.permissions.length > 0 && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              {role.permissions.length} permissions
                            </summary>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {role.permissions.slice(0, 8).map((perm) => (
                                <Badge 
                                  key={perm} 
                                  variant="secondary" 
                                  className="text-xs font-mono"
                                >
                                  {perm}
                                </Badge>
                              ))}
                              {role.permissions.length > 8 && (
                                <Badge variant="outline" className="text-xs">
                                  +{role.permissions.length - 8} autres
                                </Badge>
                              )}
                            </div>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Statistiques */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {filteredRoles.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Rôles {selectedPlatform !== "all" ? "filtrés" : "système"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Object.keys(rolesByModule).length}
              </div>
              <div className="text-xs text-muted-foreground">Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {transitions.length}
              </div>
              <div className="text-xs text-muted-foreground">Transitions</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
