import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { USAGE_TYPES } from "@/schemas/digitizationRequestSchema";

interface DigitizationRequest {
  id: string;
  document_title: string;
  document_cote: string | null;
  pages_count: number;
  usage_type: string;
  justification: string;
  status: string;
  created_at: string;
  updated_at: string;
  admin_notes: string | null;
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  en_attente: { label: "En attente", variant: "secondary" },
  en_cours: { label: "En cours", variant: "default" },
  approuve: { label: "Approuvé", variant: "default" },
  rejete: { label: "Rejeté", variant: "destructive" },
  termine: { label: "Terminé", variant: "outline" },
};

export default function UserDigitizationRequests() {
  const { session } = useAuth();
  const [requests, setRequests] = useState<DigitizationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      if (!session?.user) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("digitization_requests")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      } catch (error) {
        console.error("Error loading digitization requests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, [session]);

  if (isLoading) {
    return (
      <DigitalLibraryLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DigitalLibraryLayout>
    );
  }

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Mes Demandes de Numérisation
            </CardTitle>
            <CardDescription>
              Historique de vos demandes de numérisation de documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-lg text-muted-foreground mb-2">
                  Aucune demande de numérisation
                </p>
                <p className="text-sm text-muted-foreground">
                  Vous n'avez pas encore soumis de demande de numérisation
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Cote</TableHead>
                      <TableHead>Pages</TableHead>
                      <TableHead>Type d'utilisation</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date de demande</TableHead>
                      <TableHead>Dernière mise à jour</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium max-w-[300px]">
                          <div className="truncate" title={request.document_title}>
                            {request.document_title}
                          </div>
                        </TableCell>
                        <TableCell>
                          {request.document_cote || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>{request.pages_count}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {USAGE_TYPES[request.usage_type as keyof typeof USAGE_TYPES] || request.usage_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_LABELS[request.status]?.variant || "default"}>
                            {STATUS_LABELS[request.status]?.label || request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(request.created_at), "dd/MM/yyyy", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          {format(new Date(request.updated_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DigitalLibraryLayout>
  );
}
