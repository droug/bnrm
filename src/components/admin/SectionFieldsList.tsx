import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface SectionFieldsListProps {
  sectionId: string;
  sectionName: string;
}

export function SectionFieldsList({ sectionId, sectionName }: SectionFieldsListProps) {
  const queryClient = useQueryClient();

  const { data: fields, isLoading } = useQuery({
    queryKey: ["section-custom-fields-list", sectionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("section_custom_fields")
        .select("*")
        .eq("section_id", sectionId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!sectionId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (fieldId: string) => {
      const { error } = await supabase
        .from("section_custom_fields")
        .delete()
        .eq("id", fieldId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["section-custom-fields-list", sectionId] });
      toast.success("Champ supprimé avec succès");
    },
    onError: (error) => {
      console.error("Error deleting field:", error);
      toast.error("Erreur lors de la suppression du champ");
    },
  });

  const handleDelete = (fieldId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce champ ?")) {
      deleteMutation.mutate(fieldId);
    }
  };

  const getFieldTypeBadge = (fieldType: string) => {
    const colors: Record<string, string> = {
      text: "bg-blue-500",
      textarea: "bg-purple-500",
      number: "bg-green-500",
      select: "bg-orange-500",
      checkbox: "bg-pink-500",
      date: "bg-indigo-500",
      email: "bg-cyan-500",
      tel: "bg-teal-500",
    };
    
    return (
      <Badge className={colors[fieldType] || "bg-gray-500"}>
        {fieldType}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Champs personnalisés - {sectionName}</CardTitle>
            <CardDescription>
              {fields?.length || 0} champ(s) personnalisé(s) dans cette section
            </CardDescription>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un champ
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!fields || fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun champ personnalisé pour cette section.
            <br />
            Cliquez sur "Ajouter un champ" pour commencer.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ordre</TableHead>
                <TableHead>Clé</TableHead>
                <TableHead>Label (FR)</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Requis</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field: any) => (
                <TableRow key={field.id}>
                  <TableCell>{field.order_index}</TableCell>
                  <TableCell className="font-mono text-sm">{field.field_key}</TableCell>
                  <TableCell>{field.label_fr}</TableCell>
                  <TableCell>{getFieldTypeBadge(field.field_type)}</TableCell>
                  <TableCell>
                    {field.is_required ? (
                      <Badge variant="destructive">Oui</Badge>
                    ) : (
                      <Badge variant="secondary">Non</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {field.is_visible ? (
                      <Badge variant="default">Oui</Badge>
                    ) : (
                      <Badge variant="secondary">Non</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(field.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
