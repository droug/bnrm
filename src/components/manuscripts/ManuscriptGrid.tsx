import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Download, Calendar, User, MapPin, Lock } from "lucide-react";
import manuscriptPage1 from "@/assets/manuscript-page-1.jpg";
import manuscriptPage2 from "@/assets/manuscript-page-2.jpg";
import manuscriptPage3 from "@/assets/manuscript-page-3.jpg";
import manuscriptPage4 from "@/assets/manuscript-page-4.jpg";
import manuscript1 from "@/assets/manuscript-1.jpg";
import manuscript2 from "@/assets/manuscript-2.jpg";
import manuscript3 from "@/assets/manuscript-3.jpg";

interface Manuscript {
  id: string;
  title: string;
  author: string;
  description: string;
  language: string;
  period: string;
  material: string;
  dimensions: string;
  condition_notes: string;
  inventory_number: string;
  digital_copy_url: string;
  thumbnail_url: string;
  access_level: 'public' | 'restricted' | 'confidential';
  status: 'available' | 'digitization' | 'reserved' | 'maintenance';
  institution?: string;
  created_at: string;
}

interface ManuscriptGridProps {
  manuscripts: Manuscript[];
  canAccessManuscript: (manuscript: Manuscript) => boolean;
  getManuscriptImage: (language: string, id: string) => string;
  getStatusColor: (status: string) => "default" | "destructive" | "outline" | "secondary";
  getAccessLevelColor: (level: string) => "default" | "destructive" | "outline" | "secondary";
  getStatusLabel: (status: string) => string;
  getAccessLabel: (level: string) => string;
}

export function ManuscriptGrid({
  manuscripts,
  canAccessManuscript,
  getManuscriptImage,
  getStatusColor,
  getAccessLevelColor,
  getStatusLabel,
  getAccessLabel,
}: ManuscriptGridProps) {
  // Photos réelles de manuscrits par langue
  const realManuscriptImages = {
    'Arabe': [manuscriptPage1, manuscriptPage2, manuscriptPage3, manuscriptPage4, manuscript1],
    'Berbère': [manuscript2, manuscript3],
    'Latin': [manuscriptPage3, manuscriptPage4],
    'Français': [manuscript1, manuscriptPage1],
  };

  const getDefaultImage = (manuscript: Manuscript) => {
    if (manuscript.thumbnail_url) return manuscript.thumbnail_url;
    
    // Normaliser la langue pour correspondre aux clés
    const languageKey = manuscript.language.charAt(0).toUpperCase() + manuscript.language.slice(1).toLowerCase();
    const images = realManuscriptImages[languageKey as keyof typeof realManuscriptImages] || realManuscriptImages['Arabe'];
    const index = parseInt(manuscript.id.slice(-2), 16) % images.length;
    return images[index] || getManuscriptImage(manuscript.language, manuscript.id);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
      {manuscripts.map((manuscript) => (
        <Card 
          key={manuscript.id} 
          className={`overflow-hidden hover:shadow-moroccan transition-all duration-500 bg-card/50 backdrop-blur border-2 border-gold/20 hover:border-gold/40 group relative ${
            !canAccessManuscript(manuscript) ? 'opacity-60' : ''
          }`}
        >
          <div className="aspect-video overflow-hidden relative bg-gradient-mosaique">
            <img
              src={getDefaultImage(manuscript)}
              alt={manuscript.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {!canAccessManuscript(manuscript) && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-center text-white">
                  <Lock className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm font-medium">Accès restreint</p>
                </div>
              </div>
            )}
            <div className="absolute top-2 right-2 flex gap-2">
              <Badge variant={getStatusColor(manuscript.status)}>
                {getStatusLabel(manuscript.status)}
              </Badge>
              <Badge variant={getAccessLevelColor(manuscript.access_level)}>
                {getAccessLabel(manuscript.access_level)}
              </Badge>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-moroccan text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {manuscript.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <User className="h-4 w-4" />
                <span>{manuscript.author}</span>
              </div>
              {manuscript.institution && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{manuscript.institution}</span>
                </div>
              )}
              <p className="text-sm text-muted-foreground line-clamp-3">
                {manuscript.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                📖 {manuscript.language}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {manuscript.period}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {manuscript.material}
              </Badge>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                className="flex-1"
                disabled={!canAccessManuscript(manuscript)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Consulter
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                disabled={!canAccessManuscript(manuscript)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
