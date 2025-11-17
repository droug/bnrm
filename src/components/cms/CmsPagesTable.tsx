import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CmsPagesTableProps {
  pages: any[];
  isLoading: boolean;
  onEdit: (page: any) => void;
  onRefetch: () => void;
}

const statusColors: Record<string, string> = {
  draft: 'secondary',
  review: 'default',
  ready: 'default',
  published: 'default',
  archived: 'secondary'
};

export default function CmsPagesTable({ pages, isLoading, onEdit, onRefetch }: CmsPagesTableProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return;

    const { error } = await supabase
      .from('cms_pages')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Erreur lors de la suppression");
      return;
    }

    toast.success("Page supprimée");
    onRefetch();
  };

  if (isLoading) {
    return <div className="text-center p-8">Chargement...</div>;
  }

  if (pages.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Aucune page créée. Commencez par créer votre première page !
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titre</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Modifié</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pages.map((page) => (
          <TableRow key={page.id}>
            <TableCell className="font-medium">{page.title_fr}</TableCell>
            <TableCell>
              <code className="text-xs">/pages/{page.slug}</code>
            </TableCell>
            <TableCell>
              <Badge variant={statusColors[page.status] as any}>
                {page.status}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(page.updated_at).toLocaleDateString('fr-FR')}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(page)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(page.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
