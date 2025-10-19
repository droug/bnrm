import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table";

export interface Professional {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  institution: string;
  role: string;
  is_approved: boolean;
  created_at: string;
  registration_data?: any;
}

interface ProfessionalsListTableProps {
  professionals: Professional[];
  onViewDetails: (professional: Professional) => void;
}

const getRoleBadge = (role: string) => {
  const roleMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    editor: { label: "Éditeur", variant: "default" },
    printer: { label: "Imprimeur", variant: "secondary" },
    distributor: { label: "Distributeur", variant: "outline" },
    producer: { label: "Producteur", variant: "default" },
    author: { label: "Auteur", variant: "secondary" },
  };
  const roleInfo = roleMap[role] || { label: role, variant: "outline" as const };
  return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
};

export function ProfessionalsListTable({ professionals, onViewDetails }: ProfessionalsListTableProps) {
  const columns: ColumnDef<Professional>[] = [
    {
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      id: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nom" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.first_name} {row.original.last_name}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      accessorKey: "institution",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Institution" />
      ),
      cell: ({ row }) => row.original.institution || "-",
    },
    {
      accessorKey: "role",
      header: "Rôle",
      cell: ({ row }) => getRoleBadge(row.original.role),
    },
    {
      accessorKey: "is_approved",
      header: "Statut",
      cell: ({ row }) => (
        <Badge variant={row.original.is_approved ? "default" : "secondary"}>
          {row.original.is_approved ? "Approuvé" : "En attente"}
        </Badge>
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
          Visualiser
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={professionals}
      searchKey="name"
      searchPlaceholder="Rechercher par nom, email..."
      pageSize={20}
      pageSizeOptions={[10, 20, 50, 100]}
    />
  );
}
