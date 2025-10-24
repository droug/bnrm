import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Info } from "lucide-react";

/**
 * Composant de référence pour les statuts du workflow de réservation
 * Affiche la correspondance entre les étapes, statuts internes et statuts publics
 */
export default function WorkflowStatusReference() {
  const statusMapping = [
    {
      etape: "Soumise",
      statutInterne: "À vérifier",
      internalCode: "a_verifier",
      statutPublic: "En cours",
      badgeClass: "bg-yellow-100 text-yellow-800",
    },
    {
      etape: "Validée",
      statutInterne: "Confirmée",
      internalCode: "confirmee",
      statutPublic: "Acceptée",
      badgeClass: "bg-green-100 text-green-800",
    },
    {
      etape: "Refusée",
      statutInterne: "Rejetée",
      internalCode: "rejetee",
      statutPublic: "Refusée",
      badgeClass: "bg-red-100 text-red-800",
    },
    {
      etape: "Vérification en cours",
      statutInterne: "Vérification en cours",
      internalCode: "verification_en_cours",
      statutPublic: "En cours",
      badgeClass: "bg-orange-100 text-orange-800",
    },
    {
      etape: "Contractualisée",
      statutInterne: "Contractualisée",
      internalCode: "contractualisee",
      statutPublic: "Confirmée",
      badgeClass: "bg-purple-100 text-purple-800",
    },
    {
      etape: "Facturée",
      statutInterne: "Facturée",
      internalCode: "facturee",
      statutPublic: "En attente de paiement",
      badgeClass: "bg-indigo-100 text-indigo-800",
    },
    {
      etape: "Mise à disposition",
      statutInterne: "En cours d'exécution",
      internalCode: "en_cours_execution",
      statutPublic: "En cours",
      badgeClass: "bg-cyan-100 text-cyan-800",
    },
    {
      etape: "Archivée sans suite",
      statutInterne: "Archivée",
      internalCode: "archivee",
      statutPublic: "En cours",
      badgeClass: "bg-gray-200 text-gray-600",
    },
    {
      etape: "Clôturée",
      statutInterne: "Clôturée",
      internalCode: "cloturee",
      statutPublic: "Terminée",
      badgeClass: "bg-gray-300 text-gray-700",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          <CardTitle>Référence des statuts du workflow</CardTitle>
        </div>
        <CardDescription>
          Correspondance entre les étapes du workflow, les statuts internes (backoffice) et les statuts publics (vus par les demandeurs)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead>Étape</TableHead>
                <TableHead>Statut interne (Backoffice)</TableHead>
                <TableHead>Code système</TableHead>
                <TableHead>Statut public (Demandeur)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statusMapping.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.etape}</TableCell>
                  <TableCell>
                    <Badge className={row.badgeClass}>{row.statutInterne}</Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{row.internalCode}</code>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.statutPublic}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Note importante
          </h4>
          <p className="text-sm text-blue-800">
            Le <strong>statut interne</strong> est utilisé pour la gestion dans le backoffice et reflète l'état technique du dossier.
            Le <strong>statut public</strong> est ce que voit le demandeur dans son espace et est plus simplifié pour une meilleure compréhension.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
