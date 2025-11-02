import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Edit, GitBranch } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { WorkflowBuilderDialog } from "./WorkflowBuilderDialog";

interface WorkflowModel {
  id: string;
  name: string;
  workflow_type: string;
  module: string;
  version: number;
  is_active: boolean;
  updated_at: string;
  description?: string;
}

export function WorkflowModelsManager() {
  const [models, setModels] = useState<WorkflowModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<WorkflowModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModule, setFilterModule] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    filterModels();
  }, [models, searchQuery, filterModule, filterType]);

  const loadModels = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_definitions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setModels(data || []);
    } catch (error) {
      console.error('Error loading models:', error);
      toast.error("Erreur lors du chargement des modèles");
    } finally {
      setLoading(false);
    }
  };

  const filterModels = () => {
    let filtered = [...models];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.workflow_type.toLowerCase().includes(query) ||
          m.module.toLowerCase().includes(query)
      );
    }

    if (filterModule !== "all") {
      filtered = filtered.filter((m) => m.module === filterModule);
    }

    if (filterType !== "all") {
      filtered = filtered.filter((m) => m.workflow_type === filterType);
    }

    setFilteredModels(filtered);
  };

  const handleEditModel = (modelId: string) => {
    setSelectedModel(modelId);
    setBuilderOpen(true);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-500">Actif</Badge>
    ) : (
      <Badge variant="outline">Inactif</Badge>
    );
  };

  if (loading) {
    return <div className="text-center p-8">Chargement...</div>;
  }

  const modules = Array.from(new Set(models.map((m) => m.module)));
  const types = Array.from(new Set(models.map((m) => m.workflow_type)));

  // Pagination
  const totalPages = Math.ceil(filteredModels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedModels = filteredModels.slice(startIndex, endIndex);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Modèles de Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filtres */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Rechercher par nom, type ou module..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterModule} onValueChange={setFilterModule}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les modules</SelectItem>
                  {modules.map((module) => (
                    <SelectItem key={module} value={module}>
                      {module}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table des modèles */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {filteredModels.length} modèle(s) trouvé(s)
                </p>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom du modèle</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Dernière MAJ</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedModels.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell className="font-medium">{model.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{model.workflow_type}</Badge>
                      </TableCell>
                      <TableCell>{model.module}</TableCell>
                      <TableCell>v{model.version}</TableCell>
                      <TableCell>
                        {format(new Date(model.updated_at), "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell>{getStatusBadge(model.is_active)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditModel(model.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedModels.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground"
                      >
                        {filteredModels.length === 0
                          ? "Aucun modèle trouvé"
                          : "Aucun résultat sur cette page"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Précédent
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 7) {
                        pageNum = i + 1;
                      } else if (currentPage <= 4) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        pageNum = totalPages - 6 + i;
                      } else {
                        pageNum = currentPage - 3 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <WorkflowBuilderDialog
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        workflowId={selectedModel}
        onSaved={loadModels}
      />
    </>
  );
}