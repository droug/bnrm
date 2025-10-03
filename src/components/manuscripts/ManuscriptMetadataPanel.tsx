import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  User,
  BookOpen,
  Tag,
  MapPin,
  Hash,
  FileText,
  Globe,
  Clock,
  Archive,
  Shield,
  Info
} from "lucide-react";

interface Manuscript {
  id: string;
  title: string;
  author?: string;
  description?: string;
  language?: string;
  period?: string;
  genre?: string;
  subject?: string[];
  publication_year?: number;
  cote?: string;
  source?: string;
  historical_period?: string;
  material?: string;
  dimensions?: string;
  condition_notes?: string;
  inventory_number?: string;
  access_level?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  page_count?: number;
  search_keywords?: string[];
}

interface ManuscriptMetadataPanelProps {
  manuscript: Manuscript;
}

export function ManuscriptMetadataPanel({ manuscript }: ManuscriptMetadataPanelProps) {
  const renderMetadataItem = (icon: any, label: string, value: any) => {
    if (!value) return null;

    const Icon = icon;
    
    return (
      <div className="flex items-start gap-3 py-2">
        <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
          {Array.isArray(value) ? (
            <div className="flex flex-wrap gap-1">
              {value.map((item, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm">{value}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Info className="h-4 w-4" />
          Métadonnées complètes
        </CardTitle>
        <CardDescription className="text-xs">
          Informations détaillées sur le manuscrit
        </CardDescription>
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="space-y-4">
          {/* Informations principales */}
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <BookOpen className="h-3 w-3" />
              Informations principales
            </h3>
            <div className="space-y-1">
              {renderMetadataItem(FileText, "Titre", manuscript.title)}
              {renderMetadataItem(User, "Auteur", manuscript.author)}
              {renderMetadataItem(Hash, "Cote", manuscript.cote)}
              {renderMetadataItem(Archive, "N° inventaire", manuscript.inventory_number)}
            </div>
          </div>

          <Separator />

          {/* Classification */}
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Tag className="h-3 w-3" />
              Classification
            </h3>
            <div className="space-y-1">
              {renderMetadataItem(Globe, "Langue", manuscript.language)}
              {renderMetadataItem(Calendar, "Période", manuscript.period)}
              {renderMetadataItem(Clock, "Période historique", manuscript.historical_period)}
              {renderMetadataItem(BookOpen, "Genre", manuscript.genre)}
              {renderMetadataItem(Tag, "Sujets", manuscript.subject)}
              {renderMetadataItem(Tag, "Mots-clés", manuscript.search_keywords)}
            </div>
          </div>

          <Separator />

          {/* Informations physiques */}
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Archive className="h-3 w-3" />
              Description physique
            </h3>
            <div className="space-y-1">
              {renderMetadataItem(FileText, "Matériau", manuscript.material)}
              {renderMetadataItem(FileText, "Dimensions", manuscript.dimensions)}
              {renderMetadataItem(FileText, "État de conservation", manuscript.condition_notes)}
              {renderMetadataItem(Hash, "Nombre de pages", manuscript.page_count)}
            </div>
          </div>

          <Separator />

          {/* Provenance */}
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              Provenance
            </h3>
            <div className="space-y-1">
              {renderMetadataItem(MapPin, "Source", manuscript.source)}
              {renderMetadataItem(Calendar, "Année de publication", manuscript.publication_year)}
            </div>
          </div>

          <Separator />

          {/* Accès et statut */}
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Shield className="h-3 w-3" />
              Accès et statut
            </h3>
            <div className="space-y-1">
              {manuscript.access_level && (
                <div className="flex items-start gap-3 py-2">
                  <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Niveau d'accès</p>
                    <Badge
                      variant={
                        manuscript.access_level === 'public' ? 'default' :
                        manuscript.access_level === 'restricted' ? 'secondary' :
                        'destructive'
                      }
                      className="text-xs"
                    >
                      {manuscript.access_level === 'public' ? 'Public' :
                       manuscript.access_level === 'restricted' ? 'Restreint' :
                       'Confidentiel'}
                    </Badge>
                  </div>
                </div>
              )}
              {manuscript.status && (
                <div className="flex items-start gap-3 py-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Statut</p>
                    <Badge
                      variant={
                        manuscript.status === 'available' ? 'default' :
                        manuscript.status === 'digitization' ? 'secondary' :
                        'outline'
                      }
                      className="text-xs"
                    >
                      {manuscript.status === 'available' ? 'Disponible' :
                       manuscript.status === 'digitization' ? 'En numérisation' :
                       manuscript.status === 'reserved' ? 'Réservé' :
                       'Maintenance'}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {manuscript.description && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-sm mb-3">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {manuscript.description}
                </p>
              </div>
            </>
          )}

          {/* Dates système */}
          <Separator />
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Informations système
            </h3>
            <div className="space-y-1">
              {manuscript.created_at && renderMetadataItem(
                Calendar,
                "Date d'ajout",
                new Date(manuscript.created_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              )}
              {manuscript.updated_at && renderMetadataItem(
                Calendar,
                "Dernière modification",
                new Date(manuscript.updated_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              )}
            </div>
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}