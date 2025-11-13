import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface LegalDepositDetailsViewProps {
  request: any;
}

export function LegalDepositDetailsView({ request }: LegalDepositDetailsViewProps) {
  const renderAuthorInfo = () => {
    if (!request.author_name && !request.author_type) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identification de l'auteur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {request.author_name && (
            <div>
              <strong>Nom:</strong> {request.author_name}
            </div>
          )}
          {request.author_type && (
            <div>
              <strong>Type d'auteur:</strong> <Badge variant="outline">{request.author_type}</Badge>
            </div>
          )}
          {request.author_nationality && (
            <div>
              <strong>Nationalité:</strong> {request.author_nationality}
            </div>
          )}
          {request.author_gender && (
            <div>
              <strong>Genre:</strong> {request.author_gender}
            </div>
          )}
          {request.representative_name && (
            <div>
              <strong>Représentant:</strong> {request.representative_name}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderEditorInfo = () => {
    if (!request.editor_name && !request.editor_type) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identification de l'éditeur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {request.editor_name && (
            <div>
              <strong>Éditeur:</strong> {request.editor_name}
            </div>
          )}
          {request.editor_type && (
            <div>
              <strong>Type d'éditeur:</strong> <Badge variant="outline">{request.editor_type}</Badge>
            </div>
          )}
          {request.editor_address && (
            <div>
              <strong>Adresse:</strong> {request.editor_address}
            </div>
          )}
          {request.editor_city && (
            <div>
              <strong>Ville:</strong> {request.editor_city}
            </div>
          )}
          {request.editor_phone && (
            <div>
              <strong>Téléphone:</strong> {request.editor_phone}
            </div>
          )}
          {request.editor_email && (
            <div>
              <strong>Email:</strong> {request.editor_email}
            </div>
          )}
          {request.expected_publication_date && (
            <div>
              <strong>Date de publication prévue:</strong> {request.expected_publication_date}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderPrinterInfo = () => {
    if (!request.printer_name && !request.printer_type) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identification de l'imprimeur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {request.printer_name && (
            <div>
              <strong>Imprimerie:</strong> {request.printer_name}
            </div>
          )}
          {request.printer_type && (
            <div>
              <strong>Type d'imprimeur:</strong> <Badge variant="outline">{request.printer_type}</Badge>
            </div>
          )}
          {request.print_run_number && (
            <div>
              <strong>Nombre de tirage:</strong> {request.print_run_number}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderDistributorInfo = () => {
    if (!request.distributor_name) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identification du distributeur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {request.distributor_name && (
            <div>
              <strong>Distributeur:</strong> {request.distributor_name}
            </div>
          )}
          {request.print_run_number && (
            <div>
              <strong>Nombre de tirage:</strong> {request.print_run_number}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderPublicationInfo = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identification de la publication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {request.title && (
            <div>
              <strong>Titre:</strong> {request.title}
            </div>
          )}
          {request.subtitle && (
            <div>
              <strong>Sous-titre:</strong> {request.subtitle}
            </div>
          )}
          {request.publication_type && (
            <div>
              <strong>Type de publication:</strong> <Badge>{request.publication_type}</Badge>
            </div>
          )}
          {request.support_type && (
            <div>
              <strong>Type de support:</strong> <Badge>{request.support_type}</Badge>
            </div>
          )}
          {request.publication_discipline && (
            <div>
              <strong>Discipline:</strong> {request.publication_discipline}
            </div>
          )}
          {request.publication_language && (
            <div>
              <strong>Langue:</strong> {request.publication_language}
            </div>
          )}
          {request.pages_count && (
            <div>
              <strong>Nombre de pages:</strong> {request.pages_count}
            </div>
          )}
          {request.format && (
            <div>
              <strong>Format:</strong> {request.format}
            </div>
          )}
          {request.edition_number && (
            <div>
              <strong>Numéro d'édition:</strong> {request.edition_number}
            </div>
          )}
          {request.multiple_volumes !== undefined && (
            <div>
              <strong>Publication en plusieurs volumes:</strong> {request.multiple_volumes ? "Oui" : "Non"}
            </div>
          )}
          {request.volume_number && (
            <div>
              <strong>Numéro du volume:</strong> {request.volume_number}
            </div>
          )}
          {request.isbn && (
            <div>
              <strong>ISBN:</strong> {request.isbn}
            </div>
          )}
          {request.issn && (
            <div>
              <strong>ISSN:</strong> {request.issn}
            </div>
          )}
          {request.operational_url && (
            <div>
              <strong>URL Opérationnelle:</strong>{" "}
              <a href={request.operational_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {request.operational_url}
              </a>
            </div>
          )}
          {request.has_scale !== undefined && (
            <div>
              <strong>Présence échelle:</strong> {request.has_scale ? "Oui" : "Non"}
            </div>
          )}
          {request.has_legend !== undefined && (
            <div>
              <strong>Présence de légende:</strong> {request.has_legend ? "Oui" : "Non"}
            </div>
          )}
          {request.collection_title && (
            <div>
              <strong>Titre de la collection:</strong> {request.collection_title}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderDocuments = () => {
    if (!request.cnie_document && !request.summary_document && !request.court_decision_document) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pièces à fournir</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {request.cnie_document && (
            <div>
              <strong>CNIE de l'auteur:</strong>{" "}
              <a href={request.cnie_document} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Télécharger
              </a>
            </div>
          )}
          {request.summary_document && (
            <div>
              <strong>Résumé de l'ouvrage:</strong>{" "}
              <a href={request.summary_document} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Télécharger
              </a>
            </div>
          )}
          {request.court_decision_document && (
            <div>
              <strong>Décision du Tribunal:</strong>{" "}
              <a href={request.court_decision_document} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Télécharger
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderAdministrativeInfo = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations administratives</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {request.request_number && (
            <div>
              <strong>N° de demande:</strong> <span className="font-mono">{request.request_number}</span>
            </div>
          )}
          {request.deposit_type && (
            <div>
              <strong>Type de dépôt:</strong> <Badge>{request.deposit_type}</Badge>
            </div>
          )}
          {request.status && (
            <div>
              <strong>Statut:</strong> <Badge variant="outline">{request.status}</Badge>
            </div>
          )}
          {request.created_at && (
            <div>
              <strong>Date de création:</strong> {format(new Date(request.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}
            </div>
          )}
          {request.submission_date && (
            <div>
              <strong>Date de soumission:</strong> {format(new Date(request.submission_date), "dd/MM/yyyy HH:mm", { locale: fr })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderMetadata = () => {
    if (!request.metadata || Object.keys(request.metadata).length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Métadonnées supplémentaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(request.metadata).map(([key, value]) => {
            // Skip null or undefined values
            if (value === null || value === undefined) return null;
            
            // Format the key to be more readable
            const formattedKey = key
              .split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            
            // Format the value based on type
            let displayValue: string = String(value);
            if (typeof value === 'boolean') {
              displayValue = value ? 'Oui' : 'Non';
            } else if (typeof value === 'object') {
              displayValue = JSON.stringify(value, null, 2);
            }
            
            return (
              <div key={key} className="border-b border-border/50 pb-2 last:border-0">
                <strong>{formattedKey}:</strong>{' '}
                {typeof value === 'object' ? (
                  <pre className="mt-1 p-2 bg-muted rounded text-sm overflow-auto">
                    {displayValue}
                  </pre>
                ) : (
                  <span>{displayValue}</span>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  const renderValidationInfo = () => {
    const hasValidation = request.validated_by_service || request.validated_by_department || request.validated_by_committee || request.rejected_by;
    
    if (!hasValidation) return null;

    return (
      <>
        {request.validated_by_service && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Validation Service DLBN</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <strong>Validé par:</strong> {request.validated_by_service}
              </div>
              {request.service_validated_at && (
                <div>
                  <strong>Date:</strong> {format(new Date(request.service_validated_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                </div>
              )}
              {request.service_validation_notes && (
                <div>
                  <strong>Notes:</strong> {request.service_validation_notes}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {request.validated_by_department && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Validation Département ABN</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <strong>Validé par:</strong> {request.validated_by_department}
              </div>
              {request.department_validated_at && (
                <div>
                  <strong>Date:</strong> {format(new Date(request.department_validated_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                </div>
              )}
              {request.department_validation_notes && (
                <div>
                  <strong>Notes:</strong> {request.department_validation_notes}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {request.validated_by_committee && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Validation Comité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <strong>Validé par:</strong> {request.validated_by_committee}
              </div>
              {request.committee_validated_at && (
                <div>
                  <strong>Date:</strong> {format(new Date(request.committee_validated_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                </div>
              )}
              {request.committee_validation_notes && (
                <div>
                  <strong>Notes:</strong> {request.committee_validation_notes}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {request.rejected_by && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-destructive">Rejet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <strong>Rejeté par:</strong> {request.rejected_by}
              </div>
              {request.rejected_at && (
                <div>
                  <strong>Date:</strong> {format(new Date(request.rejected_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                </div>
              )}
              {request.rejection_reason && (
                <div>
                  <strong>Raison:</strong> {request.rejection_reason}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {renderAdministrativeInfo()}
      
      <div className="grid grid-cols-2 gap-6">
        {renderAuthorInfo()}
        {renderEditorInfo()}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {renderPrinterInfo()}
        {renderDistributorInfo()}
      </div>

      {renderPublicationInfo()}
      {renderDocuments()}
      {renderMetadata()}
      {renderValidationInfo()}
    </div>
  );
}
