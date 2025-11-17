import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CmsSectionTypeSelectorProps {
  onSelect: (type: string) => void;
  onCancel: () => void;
}

const sectionTypes = [
  {
    type: 'hero',
    icon: '🦸',
    label: 'Hero',
    description: 'Grande section d\'en-tête avec image et CTA'
  },
  {
    type: 'richtext',
    icon: '📝',
    label: 'Texte Riche',
    description: 'Contenu textuel formaté avec HTML'
  },
  {
    type: 'grid',
    icon: '📊',
    label: 'Grille',
    description: 'Disposition en grille personnalisable'
  },
  {
    type: 'cardList',
    icon: '🃏',
    label: 'Liste de Cartes',
    description: 'Cartes avec image, titre et description'
  },
  {
    type: 'banner',
    icon: '🎯',
    label: 'Bannière',
    description: 'Bannière d\'information ou de promotion'
  },
  {
    type: 'faq',
    icon: '❓',
    label: 'FAQ',
    description: 'Questions-réponses en accordéon'
  },
  {
    type: 'eventList',
    icon: '📅',
    label: 'Liste d\'Événements',
    description: 'Affichage des événements à venir'
  },
  {
    type: 'image',
    icon: '🖼️',
    label: 'Image',
    description: 'Image avec légende et attributs ALT'
  },
  {
    type: 'video',
    icon: '🎥',
    label: 'Vidéo',
    description: 'Intégration vidéo (YouTube, Vimeo, etc.)'
  },
  {
    type: 'callout',
    icon: '💡',
    label: 'Encadré',
    description: 'Zone mise en évidence pour information'
  },
  {
    type: 'statBlocks',
    icon: '📈',
    label: 'Blocs de Stats',
    description: 'Statistiques ou chiffres clés'
  }
];

export default function CmsSectionTypeSelector({ onSelect, onCancel }: CmsSectionTypeSelectorProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Choisir un type de section</CardTitle>
          <CardDescription>Sélectionnez le type de contenu à ajouter</CardDescription>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {sectionTypes.map((sectionType) => (
            <Button
              key={sectionType.type}
              type="button"
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4"
              onClick={() => onSelect(sectionType.type)}
            >
              <div className="text-3xl">{sectionType.icon}</div>
              <div className="text-left">
                <div className="font-semibold">{sectionType.label}</div>
                <div className="text-xs text-muted-foreground">
                  {sectionType.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
