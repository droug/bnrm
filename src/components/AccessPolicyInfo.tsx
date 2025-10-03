import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Lock, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useAccessControl } from "@/hooks/useAccessControl";
import { ACCESS_MATRIX, ROLE_LIMITS, getRoleDescription, getAccessLevelDescription } from "@/config/accessPolicies";

export function AccessPolicyInfo() {
  const { userRole, isAuthenticated } = useAccessControl();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gold" />
            Politiques d'Accès aux Ressources Numériques
          </CardTitle>
          <CardDescription>
            Configuration des permissions selon les directives de la BNRM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statut utilisateur actuel */}
          <div className="p-4 bg-muted/50 rounded-lg border-2 border-primary/20">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Votre Statut Actuel
            </h3>
            {isAuthenticated && userRole ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-sm">
                    {userRole.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {getRoleDescription(userRole)}
                  </span>
                </div>
                <div className="text-sm space-y-1 mt-3">
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Demandes maximales : {ROLE_LIMITS[userRole].maxRequests}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Téléchargements/jour : {ROLE_LIMITS[userRole].maxDownloadsPerDay}</span>
                  </p>
                  {ROLE_LIMITS[userRole].advancedSearch && (
                    <p className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Accès à la recherche avancée</span>
                    </p>
                  )}
                  {ROLE_LIMITS[userRole].priorityProcessing && (
                    <p className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Traitement prioritaire des demandes</span>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Non connecté</AlertTitle>
                <AlertDescription>
                  Vous êtes actuellement en mode visiteur avec accès limité au contenu public uniquement.
                  <Link to="/auth">
                    <Button variant="link" className="p-0 h-auto ml-1">
                      Connectez-vous
                    </Button>
                  </Link>
                  pour accéder à plus de ressources.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Matrice d'accès */}
          <div>
            <h3 className="font-semibold mb-3">Matrice des Permissions</h3>
            <div className="grid gap-3">
              {Object.entries(ACCESS_MATRIX).map(([role, levels]) => (
                <div
                  key={role}
                  className={`p-3 rounded-lg border ${
                    userRole === role
                      ? 'border-primary bg-primary/5'
                      : 'border-muted bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={userRole === role ? 'default' : 'outline'}>
                      {role.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(['public', 'restricted', 'confidential'] as const).map((level) => (
                      <div
                        key={level}
                        className={`text-xs px-2 py-1 rounded ${
                          levels.includes(level)
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                        }`}
                      >
                        {levels.includes(level) ? (
                          <CheckCircle className="h-3 w-3 inline mr-1" />
                        ) : (
                          <Lock className="h-3 w-3 inline mr-1" />
                        )}
                        {level}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Niveaux d'accès */}
          <div>
            <h3 className="font-semibold mb-3">Niveaux d'Accès aux Contenus</h3>
            <div className="space-y-2">
              {(['public', 'restricted', 'confidential'] as const).map((level) => (
                <div key={level} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={
                      level === 'public' ? 'default' :
                      level === 'restricted' ? 'secondary' :
                      'destructive'
                    }>
                      {level.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getAccessLevelDescription(level)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
