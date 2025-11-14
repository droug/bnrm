import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Image, File as FileIcon, Download, ExternalLink } from "lucide-react";
import { useState } from "react";

interface LegalDepositDetailsViewProps {
  request: any;
}

export function LegalDepositDetailsView({ request }: LegalDepositDetailsViewProps) {
  const [previewDocument, setPreviewDocument] = useState<{ label: string; url: string; type: string } | null>(null);
  const renderAuthorInfo = () => {
    const metadata = request.metadata || {};
    const customFields = metadata.customFields || {};
    
    // Check if we have any author information
    const hasAuthorInfo = request.author_name || 
                         customFields.author_name || 
                         customFields.author_type || 
                         metadata.authorGender ||
                         customFields.author_nationality ||
                         customFields.author_phone ||
                         customFields.author_email ||
                         customFields.author_region ||
                         customFields.author_city ||
                         customFields.author_address;

    if (!hasAuthorInfo) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identification de l'auteur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(customFields.author_name || request.author_name) && (
            <div>
              <strong>Nom de l'auteur:</strong> {customFields.author_name || request.author_name}
            </div>
          )}
          {customFields.author_type && (
            <div>
              <strong>Type d'auteur:</strong> <Badge variant="outline">{customFields.author_type}</Badge>
            </div>
          )}
          {metadata.authorGender && (
            <div>
              <strong>Genre:</strong> {metadata.authorGender === 'homme' ? 'Homme' : 'Femme'}
            </div>
          )}
          {customFields.author_nationality && (
            <div>
              <strong>Nationalité:</strong> {customFields.author_nationality}
            </div>
          )}
          {customFields.author_region && (
            <div>
              <strong>Région:</strong> {customFields.author_region}
            </div>
          )}
          {customFields.author_city && (
            <div>
              <strong>Ville:</strong> {customFields.author_city}
            </div>
          )}
          {customFields.author_address && (
            <div>
              <strong>Adresse:</strong> {customFields.author_address}
            </div>
          )}
          {customFields.author_phone && (
            <div>
              <strong>Téléphone:</strong> {customFields.author_phone}
            </div>
          )}
          {customFields.author_email && (
            <div>
              <strong>Email:</strong> {customFields.author_email}
            </div>
          )}
          {metadata.representative_name && (
            <div>
              <strong>Représentant:</strong> {metadata.representative_name}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderEditorInfo = () => {
    const metadata = request.metadata || {};
    const publisher = metadata.publisher || {};
    const editor = metadata.editor || {};
    
    // Check if we have any editor/publisher information
    const hasEditorInfo = publisher.name || 
                         editor.name || 
                         publisher.city || 
                         publisher.country ||
                         publisher.publisher_type ||
                         editor.address ||
                         editor.phone ||
                         editor.email ||
                         editor.publicationDate ||
                         metadata.editorIdentification;

    if (!hasEditorInfo) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identification de l'éditeur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(publisher.name || editor.name) && (
            <div>
              <strong>Éditeur:</strong> {publisher.name || editor.name}
            </div>
          )}
          {publisher.publisher_type && (
            <div>
              <strong>Type d'éditeur:</strong> <Badge variant="outline">{publisher.publisher_type}</Badge>
            </div>
          )}
          {metadata.editorIdentification && (
            <div>
              <strong>Identification de l'éditeur:</strong> <Badge>{metadata.editorIdentification}</Badge>
            </div>
          )}
          {publisher.city && (
            <div>
              <strong>Ville:</strong> {publisher.city}
            </div>
          )}
          {publisher.country && (
            <div>
              <strong>Pays:</strong> {publisher.country}
            </div>
          )}
          {(editor.address || publisher.address) && (
            <div>
              <strong>Adresse:</strong> {editor.address || publisher.address}
            </div>
          )}
          {(editor.phone || publisher.phone) && (
            <div>
              <strong>Téléphone:</strong> {editor.phone || publisher.phone}
            </div>
          )}
          {(editor.email || publisher.email) && (
            <div>
              <strong>Email:</strong> {editor.email || publisher.email}
            </div>
          )}
          {editor.publicationDate && (
            <div>
              <strong>Date de publication prévue:</strong> {editor.publicationDate}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderPrinterInfo = () => {
    const metadata = request.metadata || {};
    const customFields = metadata.customFields || {};
    const printer = metadata.printer || {};
    
    // Vérifier toutes les sources possibles pour les données de l'imprimeur
    const printerName = printer.name || customFields.printer_name || customFields.printerName || '';
    const printerAddress = printer.address || customFields.printer_address || customFields.printerAddress || '';
    const printerPhone = printer.phone || customFields.printer_phone || customFields.printerPhone || '';
    const printerEmail = printer.email || customFields.printer_email || customFields.printerEmail || '';
    const printerCity = customFields.printer_city || customFields.printerCity || '';
    const printerCountry = customFields.printer_country || customFields.printerCountry || '';
    const printRun = metadata.printRun || printer.printRun || customFields.printer_printRun || '';
    
    // Check if we have any printer information from various sources
    const hasPrinterInfo = printerName || 
                          printerAddress ||
                          printerPhone ||
                          printerEmail ||
                          printRun ||
                          printerCity ||
                          printerCountry;

    if (!hasPrinterInfo) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identification de l'imprimeur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {printerName && (
            <div>
              <strong>Imprimerie:</strong> {printerName}
            </div>
          )}
          {printRun && (
            <div>
              <strong>Nombre de tirage:</strong> {printRun}
            </div>
          )}
          {printerCountry && (
            <div>
              <strong>Pays:</strong> {printerCountry}
            </div>
          )}
          {printerCity && (
            <div>
              <strong>Ville:</strong> {printerCity}
            </div>
          )}
          {printerAddress && (
            <div>
              <strong>Adresse:</strong> {printerAddress}
            </div>
          )}
          {printerPhone && (
            <div>
              <strong>Téléphone:</strong> {printerPhone}
            </div>
          )}
          {printerEmail && (
            <div>
              <strong>Email:</strong> {printerEmail}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderDistributorInfo = () => {
    const metadata = request.metadata || {};
    const distributor = metadata.distributor;

    if (!distributor) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identification du distributeur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {distributor.name && (
            <div>
              <strong>Distributeur:</strong> {distributor.name}
            </div>
          )}
          {distributor.printRun && (
            <div>
              <strong>Nombre de tirage:</strong> {distributor.printRun}
            </div>
          )}
          {distributor.address && (
            <div>
              <strong>Adresse:</strong> {distributor.address}
            </div>
          )}
          {distributor.phone && (
            <div>
              <strong>Téléphone:</strong> {distributor.phone}
            </div>
          )}
          {distributor.email && (
            <div>
              <strong>Email:</strong> {distributor.email}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderPublicationInfo = () => {
    const metadata = request.metadata || {};
    
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
          {metadata.publicationType && (
            <div>
              <strong>Type de publication:</strong> <Badge>{metadata.publicationType}</Badge>
            </div>
          )}
          {request.support_type && (
            <div>
              <strong>Type de support:</strong> <Badge>{request.support_type}</Badge>
            </div>
          )}
          {request.monograph_type && (
            <div>
              <strong>Type de monographie:</strong> <Badge>{request.monograph_type}</Badge>
            </div>
          )}
          {metadata.publicationDiscipline && (
            <div>
              <strong>Discipline:</strong> {metadata.publicationDiscipline}
            </div>
          )}
          {(request.language || metadata.language) && (
            <div>
              <strong>Langue:</strong> {request.language || metadata.language}
            </div>
          )}
          {request.page_count && (
            <div>
              <strong>Nombre de pages:</strong> {request.page_count}
            </div>
          )}
          {metadata.format && (
            <div>
              <strong>Format:</strong> {metadata.format}
            </div>
          )}
          {metadata.editionNumber && (
            <div>
              <strong>Numéro d'édition:</strong> {metadata.editionNumber}
            </div>
          )}
          {metadata.multipleVolumes !== undefined && (
            <div>
              <strong>Publication en plusieurs volumes:</strong> {metadata.multipleVolumes === 'oui' ? "Oui" : "Non"}
            </div>
          )}
          {metadata.volumeNumber && (
            <div>
              <strong>Numéro du volume:</strong> {metadata.volumeNumber}
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
          {request.ismn && (
            <div>
              <strong>ISMN:</strong> {request.ismn}
            </div>
          )}
          {metadata.operationalUrl && (
            <div>
              <strong>URL Opérationnelle:</strong>{" "}
              <a href={metadata.operationalUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {metadata.operationalUrl}
              </a>
            </div>
          )}
          {metadata.hasScale !== undefined && (
            <div>
              <strong>Présence échelle:</strong> {metadata.hasScale === 'oui' ? "Oui" : "Non"}
            </div>
          )}
          {metadata.hasLegend !== undefined && (
            <div>
              <strong>Présence de légende:</strong> {metadata.hasLegend === 'oui' ? "Oui" : "Non"}
            </div>
          )}
          {(metadata.collectionTitle || request.collection_title) && (
            <div>
              <strong>Titre de la collection:</strong> {metadata.collectionTitle || request.collection_title}
            </div>
          )}
          {metadata.periodicity && (
            <div>
              <strong>Périodicité:</strong> {metadata.periodicity}
            </div>
          )}
          {metadata.hasAccompanyingMaterial !== undefined && (
            <div>
              <strong>Matériel d'accompagnement:</strong> {metadata.hasAccompanyingMaterial === 'yes' ? "Oui" : "Non"}
            </div>
          )}
          {metadata.accompanyingMaterialType && (
            <div>
              <strong>Type de matériel d'accompagnement:</strong> {metadata.accompanyingMaterialType}
            </div>
          )}
          {request.publication_date && (
            <div>
              <strong>Date de publication:</strong> {format(new Date(request.publication_date), "dd/MM/yyyy", { locale: fr })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="h-4 w-4" />;
    } else if (['pdf'].includes(extension || '')) {
      return <FileText className="h-4 w-4" />;
    }
    return <FileIcon className="h-4 w-4" />;
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'image';
    } else if (['pdf'].includes(extension || '')) {
      return 'pdf';
    }
    return 'file';
  };

  const renderDocuments = () => {
    const documents: Array<{ label: string; url: string; fileName?: string; type?: string }> = [];
    const metadata = request.metadata || {};
    const documentsUrls = request.documents_urls || {};
    
    // Mapping pour les labels en français
    const documentLabels: Record<string, string> = {
      'cin': 'CNIE de l\'auteur',
      'cnie': 'CNIE de l\'auteur',
      'summary': 'Résumé du document',
      'cover': 'Couverture',
      'abstract': 'Résumé/Abstract',
      'court_decision': 'Décision du Tribunal',
      'court-decision': 'Décision du Tribunal',
      'tribunal-decision': 'Décision du Tribunal',
      'thesis-recommendation': 'Recommandation de soutenance de thèse',
      'thesis_recommendation': 'Recommandation de soutenance de thèse',
      'quran-authorization': 'Autorisation de publication Coran',
      'quran_authorization': 'Autorisation de publication Coran',
      'supporting_document': 'Document justificatif',
      'additional_document': 'Document additionnel',
      'isbn_request': 'Demande ISBN',
      'issn_request': 'Demande ISSN',
      'periodical_cover': 'Couverture du périodique',
      'periodical_sample': 'Exemplaire du périodique',
      'software_manual': 'Manuel du logiciel',
      'database_documentation': 'Documentation de la base de données'
    };
    
    // Documents from documents_urls field - parcourir toutes les clés
    if (documentsUrls && typeof documentsUrls === 'object') {
      Object.entries(documentsUrls).forEach(([key, value]: [string, any]) => {
        let url = null;
        let fileName = '';
        let type = '';
        
        // Gérer différents formats de stockage
        if (typeof value === 'string' && value.trim()) {
          url = value;
          fileName = value.split('/').pop() || key;
        } else if (value && typeof value === 'object') {
          // Si c'est un objet File (depuis le formulaire)
          if (value.name && value.size) {
            // C'est un objet File, on ne peut pas l'afficher directement
            // mais on peut montrer qu'il existe
            fileName = value.name;
            type = value.type || '';
            url = `file://${value.name}`; // URL symbolique pour indiquer qu'il y a un fichier
          } else {
            // Si c'est un objet avec url/path
            url = value.url || value.path || value.file_url;
            fileName = value.name || url?.split('/').pop() || key;
          }
        }
        
        if (url || fileName) {
          const label = documentLabels[key] || key.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          documents.push({ label, url: url || '', fileName, type });
        }
      });
    }

    // Documents from direct fields
    if (request.cnie_document) {
      documents.push({ label: 'CNIE de l\'auteur', url: request.cnie_document });
    }
    if (request.summary_document) {
      documents.push({ label: 'Résumé du document', url: request.summary_document });
    }
    if (request.court_decision_document) {
      documents.push({ label: 'Décision du Tribunal', url: request.court_decision_document });
    }

    // Documents from metadata - parcourir tous les champs possibles
    const metadataDocumentFields = [
      'cnie_document', 'cin_document', 'cin', 'cnie',
      'summary_document', 'summary', 'abstract',
      'court_decision_document', 'court_decision', 'courtDecision',
      'supporting_document', 'supportingDocument',
      'additional_document', 'additionalDocument',
      'cover', 'cover_document', 'coverDocument',
      'thesis_recommendation', 'thesisRecommendation', 'thesis-recommendation',
      'quran_authorization', 'quranAuthorization', 'quran-authorization',
      'isbn_request', 'isbnRequest', 'isbn-request',
      'issn_request', 'issnRequest', 'issn-request',
      'periodical_cover', 'periodicalCover', 'periodical-cover',
      'periodical_sample', 'periodicalSample', 'periodical-sample',
      'software_manual', 'softwareManual', 'software-manual',
      'database_documentation', 'databaseDocumentation', 'database-documentation'
    ];

    metadataDocumentFields.forEach(field => {
      if (metadata[field]) {
        let url = null;
        const value = metadata[field];
        
        if (typeof value === 'string' && value.trim()) {
          url = value;
        } else if (value && typeof value === 'object') {
          url = value.url || value.path || value.file_url;
        }
        
        if (url) {
          const label = documentLabels[field] || field.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          documents.push({ label, url });
        }
      }
    });

    // Remove duplicates and filter out valid documents
    const uniqueDocuments = documents.filter((doc, index, self) => 
      (doc.url || doc.fileName) && index === self.findIndex((d) => d.url === doc.url || d.fileName === doc.fileName)
    );

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Pièces fournies ({uniqueDocuments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {uniqueDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucune pièce fournie pour cette demande</p>
            </div>
          ) : (
            uniqueDocuments.map((doc, index) => {
            const isValidUrl = doc.url && !doc.url.startsWith('file://');
            const fileType = getFileType(doc.fileName || doc.url || '');
            
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-muted-foreground">
                    {getFileIcon(doc.fileName || doc.url || '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.label}</p>
                    {doc.fileName && (
                      <p className="text-xs text-muted-foreground truncate">{doc.fileName}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-2">
                  {isValidUrl ? (
                    <>
                      {fileType === 'image' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewDocument({ label: doc.label, url: doc.url, type: fileType })}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" download>
                          <Download className="h-4 w-4 mr-1" />
                          Télécharger
                        </a>
                      </Button>
                    </>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      En attente d'upload
                    </Badge>
                  )}
                </div>
              </div>
            );
          })
          )}
          
          {previewDocument && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewDocument(null)}>
              <div className="bg-background rounded-lg max-w-4xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
                  <h3 className="font-semibold">{previewDocument.label}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setPreviewDocument(null)}>
                    ✕
                  </Button>
                </div>
                <div className="p-4">
                  {previewDocument.type === 'image' && (
                    <img src={previewDocument.url} alt={previewDocument.label} className="max-w-full h-auto" />
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderAdministrativeInfo = () => {
    const metadata = request.metadata || {};
    const depositTypeLabels: Record<string, string> = {
      'monographie': 'Livres',
      'periodique': 'Périodiques',
      'bd_logiciels': 'Audio-visuel & Logiciels',
      'collections_specialisees': 'Collections Spécialisées'
    };
    
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
          {metadata.depositType && (
            <div>
              <strong>Type de dépôt:</strong>{" "}
              <Badge variant="secondary">
                {depositTypeLabels[metadata.depositType] || metadata.depositType}
              </Badge>
            </div>
          )}
          {request.status && (
            <div>
              <strong>Statut:</strong> <Badge variant="outline">{request.status}</Badge>
            </div>
          )}
          {request.dl_number && (
            <div>
              <strong>Numéro DL:</strong> <span className="font-mono">{request.dl_number}</span>
            </div>
          )}
          {request.isbn_assigned && (
            <div>
              <strong>ISBN attribué:</strong> <span className="font-mono">{request.isbn_assigned}</span>
            </div>
          )}
          {request.issn_assigned && (
            <div>
              <strong>ISSN attribué:</strong> <span className="font-mono">{request.issn_assigned}</span>
            </div>
          )}
          {request.ismn_assigned && (
            <div>
              <strong>ISMN attribué:</strong> <span className="font-mono">{request.ismn_assigned}</span>
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
          {request.attribution_date && (
            <div>
              <strong>Date d'attribution:</strong> {format(new Date(request.attribution_date), "dd/MM/yyyy HH:mm", { locale: fr })}
            </div>
          )}
          {request.reception_date && (
            <div>
              <strong>Date de réception:</strong> {format(new Date(request.reception_date), "dd/MM/yyyy HH:mm", { locale: fr })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderMetadata = () => {
    if (!request.metadata || Object.keys(request.metadata).length === 0) return null;

    const metadata = request.metadata;
    const sections = [];

    // Section: Informations sur le type de dépôt
    if (metadata.depositType) {
      const depositTypeLabels: Record<string, string> = {
        'monographie': 'Livres',
        'periodique': 'Périodiques',
        'bd_logiciels': 'Audio-visuel & Logiciels',
        'collections_specialisees': 'Collections Spécialisées'
      };
      
      sections.push(
        <Card key="deposit-type">
          <CardHeader>
            <CardTitle className="text-base">Type de dépôt</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-base px-3 py-1">
              {depositTypeLabels[metadata.depositType] || metadata.depositType}
            </Badge>
          </CardContent>
        </Card>
      );
    }

    // Section: Informations sur l'auteur supplémentaires (depuis metadata)
    const authorMetadata = [];
    if (metadata.author_region) authorMetadata.push(['Région', metadata.author_region]);
    if (metadata.author_city) authorMetadata.push(['Ville', metadata.author_city]);
    if (metadata.author_address) authorMetadata.push(['Adresse', metadata.author_address]);
    if (metadata.author_phone) authorMetadata.push(['Téléphone', metadata.author_phone]);
    if (metadata.author_email) authorMetadata.push(['Email', metadata.author_email]);

    if (authorMetadata.length > 0) {
      sections.push(
        <Card key="author-metadata">
          <CardHeader>
            <CardTitle className="text-base">Coordonnées de l'auteur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {authorMetadata.map(([label, value]) => (
              <div key={label}>
                <strong>{label}:</strong> {value}
              </div>
            ))}
          </CardContent>
        </Card>
      );
    }

    // Section: Informations complémentaires sur la publication
    const publicationMetadata = [];
    if (metadata.publication_periodicity) publicationMetadata.push(['Périodicité', metadata.publication_periodicity]);
    if (metadata.publication_nature) publicationMetadata.push(['Nature de la publication', metadata.publication_nature]);
    if (metadata.collection_title) publicationMetadata.push(['Titre de la collection', metadata.collection_title]);
    if (metadata.has_scale !== undefined) publicationMetadata.push(['Présence échelle', metadata.has_scale ? 'Oui' : 'Non']);
    if (metadata.has_legend !== undefined) publicationMetadata.push(['Présence de légende', metadata.has_legend ? 'Oui' : 'Non']);

    if (publicationMetadata.length > 0) {
      sections.push(
        <Card key="publication-metadata">
          <CardHeader>
            <CardTitle className="text-base">Informations complémentaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {publicationMetadata.map(([label, value]) => (
              <div key={label}>
                <strong>{label}:</strong> {value}
              </div>
            ))}
          </CardContent>
        </Card>
      );
    }

    return sections.length > 0 ? <>{sections}</> : null;
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
