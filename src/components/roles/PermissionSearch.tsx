import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Info, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PermissionSearchProps {
  searchQuery: string;
}

export function PermissionSearch({ searchQuery }: PermissionSearchProps) {
  // Example search results (in a real app, this would come from the database)
  const mockResults = searchQuery ? [
    { permission: 'content.create', module: 'CMS', description: 'Créer du contenu' },
    { permission: 'content.publish', module: 'CMS', description: 'Publier du contenu' },
    { permission: 'users.manage', module: 'Administration', description: 'Gérer les utilisateurs' },
  ].filter(r => r.permission.toLowerCase().includes(searchQuery.toLowerCase())) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-500/10 via-slate-400/5 to-transparent border-b">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-500/10 border border-slate-500/20">
              <Search className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Recherche Avancée de Permissions</CardTitle>
              <CardDescription>
                Trouvez rapidement les permissions spécifiques à travers toutes les plateformes
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {searchQuery ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Résultats pour:</span>
                <Badge variant="secondary" className="font-mono">{searchQuery}</Badge>
              </div>
              
              {mockResults.length > 0 ? (
                <div className="space-y-2">
                  {mockResults.map((result, index) => (
                    <motion.div
                      key={result.permission}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded bg-primary/10">
                          <Search className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-mono text-sm font-medium">{result.permission}</p>
                          <p className="text-xs text-muted-foreground">{result.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{result.module}</Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Info className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Aucune permission trouvée pour "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground">
                Utilisez la barre de recherche pour trouver des permissions spécifiques
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Recherchez par nom de permission, module ou description
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
