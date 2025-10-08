import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, Mail } from "lucide-react";

interface Party {
  id: string;
  user_id: string;
  party_role: string;
  is_initiator: boolean;
  approval_status: string;
  approval_date?: string;
  notified_at?: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export function PartiesListForRequest({ requestId }: { requestId: string }) {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParties();
  }, [requestId]);

  const fetchParties = async () => {
    try {
      const { data, error } = await supabase
        .from("legal_deposit_parties")
        .select(`
          id,
          user_id,
          party_role,
          is_initiator,
          approval_status,
          approval_date,
          notified_at
        `)
        .eq("request_id", requestId);

      if (error) throw error;

      // Fetch profile data for each party using professional_registry
      const partiesWithProfiles = await Promise.all(
        (data || []).map(async (party) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("user_id", party.user_id)
            .single();

          // Get email from professional_registry
          const { data: professionalData } = await supabase
            .from("professional_registry")
            .select("email")
            .eq("user_id", party.user_id)
            .single();

          return {
            ...party,
            profiles: {
              first_name: profileData?.first_name || "",
              last_name: profileData?.last_name || "",
              email: professionalData?.email || ""
            }
          };
        })
      );

      setParties(partiesWithProfiles);
    } catch (error) {
      console.error("Error fetching parties:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roles: { [key: string]: { label: string; variant: "default" | "secondary" | "outline" } } = {
      editor: { label: "Éditeur", variant: "default" },
      printer: { label: "Imprimeur", variant: "secondary" },
      producer: { label: "Producteur", variant: "outline" },
    };

    const roleInfo = roles[role] || { label: role, variant: "default" };
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statuses: { [key: string]: { label: string; icon: any; color: string } } = {
      pending: { label: "En attente", icon: Clock, color: "text-yellow-600" },
      approved: { label: "Approuvé", icon: CheckCircle, color: "text-green-600" },
      rejected: { label: "Rejeté", icon: XCircle, color: "text-red-600" },
    };

    const statusInfo = statuses[status] || { label: status, icon: Clock, color: "text-gray-600" };
    const Icon = statusInfo.icon;

    return (
      <span className={`flex items-center gap-1 ${statusInfo.color}`}>
        <Icon className="h-4 w-4" />
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Chargement...</div>;
  }

  if (parties.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
        Aucune partie impliquée pour le moment
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Date approbation</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {parties.map((party) => (
          <TableRow key={party.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                {party.profiles.first_name} {party.profiles.last_name}
                {party.is_initiator && (
                  <Badge variant="outline" className="text-xs">
                    Initiateur
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {party.profiles.email}
              </div>
            </TableCell>
            <TableCell>{getRoleBadge(party.party_role)}</TableCell>
            <TableCell>{getStatusBadge(party.approval_status)}</TableCell>
            <TableCell className="text-sm">
              {party.approval_date ? 
                new Date(party.approval_date).toLocaleDateString('fr-FR') : 
                '-'
              }
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
