import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  User, 
  Calendar, 
  FileText, 
  Mail, 
  Phone, 
  MapPin,
  Building,
  Hash,
  Layers,
  X,
  ExternalLink,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface RequestDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
}

export const RequestDetailsDrawer = ({ isOpen, onClose, request }: RequestDetailsDrawerProps) => {
  if (!request) return null;

  const metadata = (request.metadata as Record<string, any>) || {};
  const publication = metadata.publication || {};
  const declarant = metadata.declarant || {};
  const support = metadata.support || {};

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      attribuee: { label: "Attribuée", variant: "default" },
      validee: { label: "Validée", variant: "default" },
      approved: { label: "Approuvée", variant: "default" },
      soumise: { label: "Soumise", variant: "secondary" },
      en_cours: { label: "En cours", variant: "secondary" },
      pending_confirmation: { label: "En attente confirmation", variant: "outline" },
      brouillon: { label: "Brouillon", variant: "outline" },
      rejetee: { label: "Rejetée", variant: "destructive" },
    };
    const s = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | undefined | null }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3 py-2">
        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-medium break-words">{value}</p>
        </div>
      </div>
    );
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
      {children}
    </h3>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full sm:max-w-lg p-0">
        <SheetHeader className="p-6 pb-4 border-b bg-muted/30">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-lg font-bold">
                Détails de la demande
              </SheetTitle>
              <SheetDescription className="mt-1">
                N° {request.request_number || request.dl_number}
              </SheetDescription>
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
          <div className="flex items-center gap-2 mt-3">
            {getStatusBadge(request.status)}
            <Badge variant="outline">
              {request.deposit_type || metadata.deposit_type || 'Non spécifié'}
            </Badge>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Publication */}
            <section>
              <SectionTitle>
                <BookOpen className="h-4 w-4" />
                Publication
              </SectionTitle>
              <div className="space-y-1 bg-muted/20 rounded-lg p-4">
                <InfoRow 
                  icon={FileText} 
                  label="Titre" 
                  value={request.title || publication.title} 
                />
                <InfoRow 
                  icon={User} 
                  label="Auteur" 
                  value={request.author_name || publication.author || metadata.author} 
                />
                <InfoRow 
                  icon={Building} 
                  label="Éditeur" 
                  value={publication.publisher || metadata.publisher} 
                />
                <InfoRow 
                  icon={Calendar} 
                  label="Année de publication" 
                  value={publication.publication_year || metadata.publication_year} 
                />
                <InfoRow 
                  icon={Layers} 
                  label="Type de support" 
                  value={request.support_type || support.type} 
                />
                <InfoRow 
                  icon={Hash} 
                  label="Nombre de pages" 
                  value={publication.pages || metadata.pages} 
                />
                <InfoRow 
                  icon={FileText} 
                  label="Collection" 
                  value={publication.collection || metadata.collection} 
                />
                <InfoRow 
                  icon={FileText} 
                  label="Langue" 
                  value={publication.language || metadata.language} 
                />
              </div>
            </section>

            <Separator />

            {/* Déclarant */}
            <section>
              <SectionTitle>
                <User className="h-4 w-4" />
                Déclarant
              </SectionTitle>
              <div className="space-y-1 bg-muted/20 rounded-lg p-4">
                <InfoRow 
                  icon={User} 
                  label="Nom" 
                  value={declarant.name || request.declarant_name || metadata.declarant_name} 
                />
                <InfoRow 
                  icon={Building} 
                  label="Organisation" 
                  value={declarant.organization || metadata.organization} 
                />
                <InfoRow 
                  icon={Mail} 
                  label="Email" 
                  value={declarant.email || request.declarant_email || metadata.email} 
                />
                <InfoRow 
                  icon={Phone} 
                  label="Téléphone" 
                  value={declarant.phone || metadata.phone} 
                />
                <InfoRow 
                  icon={MapPin} 
                  label="Adresse" 
                  value={declarant.address || metadata.address} 
                />
                <InfoRow 
                  icon={MapPin} 
                  label="Ville" 
                  value={declarant.city || metadata.city} 
                />
              </div>
            </section>

            <Separator />

            {/* Numéros attribués */}
            <section>
              <SectionTitle>
                <Hash className="h-4 w-4" />
                Numéros attribués
              </SectionTitle>
              <div className="space-y-2 bg-muted/20 rounded-lg p-4">
                {metadata.isbn_assigned && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">ISBN</span>
                    <Badge variant="default" className="font-mono bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {metadata.isbn_assigned}
                    </Badge>
                  </div>
                )}
                {metadata.issn_assigned && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">ISSN</span>
                    <Badge variant="default" className="font-mono bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {metadata.issn_assigned}
                    </Badge>
                  </div>
                )}
                {metadata.ismn_assigned && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">ISMN</span>
                    <Badge variant="default" className="font-mono bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {metadata.ismn_assigned}
                    </Badge>
                  </div>
                )}
                {metadata.dl_assigned && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">N° DL</span>
                    <Badge variant="default" className="font-mono bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {metadata.dl_assigned}
                    </Badge>
                  </div>
                )}
                {!metadata.isbn_assigned && !metadata.issn_assigned && !metadata.ismn_assigned && !metadata.dl_assigned && (
                  <p className="text-sm text-muted-foreground italic">
                    Aucun numéro attribué
                  </p>
                )}
              </div>
            </section>

            <Separator />

            {/* Informations système */}
            <section>
              <SectionTitle>
                <Calendar className="h-4 w-4" />
                Informations système
              </SectionTitle>
              <div className="space-y-1 bg-muted/20 rounded-lg p-4">
                <InfoRow 
                  icon={Calendar} 
                  label="Date de soumission" 
                  value={request.created_at ? format(new Date(request.created_at), "dd MMMM yyyy 'à' HH:mm", { locale: fr }) : undefined} 
                />
                <InfoRow 
                  icon={Calendar} 
                  label="Dernière mise à jour" 
                  value={request.updated_at ? format(new Date(request.updated_at), "dd MMMM yyyy 'à' HH:mm", { locale: fr }) : undefined} 
                />
                <InfoRow 
                  icon={Hash} 
                  label="ID de la demande" 
                  value={request.id} 
                />
              </div>
            </section>

            {/* Documents joints (si présents) */}
            {(metadata.documents?.length > 0 || request.document_url) && (
              <>
                <Separator />
                <section>
                  <SectionTitle>
                    <FileText className="h-4 w-4" />
                    Documents joints
                  </SectionTitle>
                  <div className="space-y-2">
                    {metadata.documents?.map((doc: any, index: number) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        asChild
                      >
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-2" />
                          {doc.name || `Document ${index + 1}`}
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                      </Button>
                    ))}
                    {request.document_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        asChild
                      >
                        <a href={request.document_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-2" />
                          Document principal
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                      </Button>
                    )}
                  </div>
                </section>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
