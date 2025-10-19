import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table";

export interface LegalDepositRequest {
  id: string;
  request_number: string;
  title: string;
  author_name?: string;
  status: 'brouillon' | 'soumis' | 'en_attente_validation_b' | 'valide_par_b' | 'rejete_par_b' | 'en_cours' | 'attribue' | 'receptionne' | 'rejete' | 'en_attente_comite_validation' | 'valide_par_comite' | 'rejete_par_comite';
  support_type: 'imprime' | 'electronique';
  monograph_type: string;
  submission_date?: string;
  attribution_date?: string;
  dl_number?: string;
  isbn_assigned?: string;
  issn_assigned?: string;
  amazon_link?: string;
  requires_amazon_validation?: boolean;
  metadata?: any;
  initiator?: {
    company_name: string;
    professional_type: string;
    email: string;
  };
  collaborator?: {
    company_name: string;
    professional_type: string;
    email: string;
  };
}

interface LegalDepositRequestsTableProps {
  requests: LegalDepositRequest[];
  onViewDetails: (request: LegalDepositRequest) => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  brouillon: { label: "Brouillon", color: "bg-gray-500" },
  soumis: { label: "Soumis", color: "bg-blue-500" },
  en_attente_validation_b: { label: "En attente validation", color: "bg-yellow-500" },
  valide_par_b: { label: "Validé par collaborateur", color: "bg-green-500" },
  rejete_par_b: { label: "Rejeté par collaborateur", color: "bg-red-500" },
  en_cours: { label: "En cours de traitement", color: "bg-blue-600" },
  attribue: { label: "Numéros attribués", color: "bg-green-600" },
  receptionne: { label: "Réceptionné", color: "bg-green-700" },
  rejete: { label: "Rejeté", color: "bg-red-600" }
};

export function LegalDepositRequestsTable({ requests, onViewDetails }: LegalDepositRequestsTableProps) {
  const columns: ColumnDef<LegalDepositRequest>[] = [
    {
      accessorKey: "request_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="N° Demande" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.request_number}</span>
          {row.original.requires_amazon_validation && (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
              🔗 Amazon
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Titre" />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          {row.original.author_name && (
            <p className="text-sm text-muted-foreground">par {row.original.author_name}</p>
          )}
        </div>
      ),
    },
    {
      accessorFn: (row) => row.initiator?.company_name,
      id: "initiator",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Initiateur" />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.initiator?.company_name}</p>
          <p className="text-sm text-muted-foreground capitalize">
            {row.original.initiator?.professional_type}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "support_type",
      header: "Type",
      cell: ({ row }) => (
        <div className="space-y-1">
          <Badge variant="outline" className="capitalize">
            {row.original.support_type}
          </Badge>
          <p className="text-xs text-muted-foreground capitalize">
            {row.original.monograph_type.replace('_', ' ')}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => (
        <Badge className={`${statusConfig[row.original.status]?.color} text-white`}>
          {statusConfig[row.original.status]?.label}
        </Badge>
      ),
    },
    {
      accessorKey: "submission_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date soumission" />
      ),
      cell: ({ row }) => 
        row.original.submission_date 
          ? new Date(row.original.submission_date).toLocaleDateString('fr-FR')
          : "-",
    },
    {
      id: "numbers",
      header: "Numéros attribués",
      cell: ({ row }) => (
        <div className="space-y-1 text-sm">
          {row.original.dl_number && (
            <div><strong>DL:</strong> {row.original.dl_number}</div>
          )}
          {row.original.isbn_assigned && (
            <div><strong>ISBN:</strong> {row.original.isbn_assigned}</div>
          )}
          {row.original.issn_assigned && (
            <div><strong>ISSN:</strong> {row.original.issn_assigned}</div>
          )}
          {!row.original.dl_number && !row.original.isbn_assigned && !row.original.issn_assigned && "-"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onViewDetails(row.original)}
        >
          <Eye className="h-4 w-4 mr-1" />
          Détails
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={requests}
      searchKey="request_number"
      searchPlaceholder="Rechercher par numéro, titre, auteur..."
      pageSize={20}
      pageSizeOptions={[10, 20, 50, 100]}
    />
  );
}
