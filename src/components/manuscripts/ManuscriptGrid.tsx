import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, User, MapPin, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LazyImage } from "./LazyImage";
import manuscrit1 from "@/assets/manuscrit-1.jpg";
import manuscrit2 from "@/assets/manuscrit-2.png";
import manuscrit3 from "@/assets/manuscrit-3.jpg";
import manuscrit6 from "@/assets/manuscrit-6.jpg";
import manuscrit7 from "@/assets/manuscrit-7.jpg";
import manuscrit8 from "@/assets/manuscrit-8.jpg";
import manuscrit9 from "@/assets/manuscrit-9.jpg";
import manuscrit10 from "@/assets/manuscrit-10.jpg";
import manuscrit11 from "@/assets/manuscrit-11.jpg";
import manuscrit12 from "@/assets/manuscrit-12.png";

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
  permalink?: string;
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
  const navigate = useNavigate();
  // Toutes les 10 photos réelles de manuscrits fournies par l'utilisateur
  const realManuscriptImages = {
    'Arabe': [manuscrit1, manuscrit3, manuscrit6, manuscrit8, manuscrit9],
    'Berbère': [manuscrit2, manuscrit7, manuscrit11],
    'Latin': [manuscrit10, manuscrit12],
    'Français': [manuscrit1, manuscrit2, manuscrit3, manuscrit6, manuscrit7, manuscrit8, manuscrit9, manuscrit10, manuscrit11, manuscrit12],
  };

  const getDefaultImage = (manuscript: Manuscript) => {
    console.log('🖼️ Getting image for manuscript:', manuscript.title, 'Language:', manuscript.language, 'Thumbnail:', manuscript.thumbnail_url);
    
    if (manuscript.thumbnail_url && !manuscript.thumbnail_url.includes('placeholder')) {
      console.log('✅ Using thumbnail_url:', manuscript.thumbnail_url);
      return manuscript.thumbnail_url;
    }
    
    // Mapper les codes de langue vers les noms complets
    const languageMap: { [key: string]: string } = {
      'ar': 'Arabe',
      'fr': 'Français',
      'amz': 'Amazighe',
      'es': 'Espagnol',
      'la': 'Latin',
      'arabe': 'Arabe',
      'français': 'Français',
      'amazighe': 'Amazighe',
      'espagnol': 'Espagnol',
      'latin': 'Latin'
    };
    
    const normalizedLang = manuscript.language?.toLowerCase() || 'ar';
    const languageKey = languageMap[normalizedLang] || 'Arabe';
    console.log('🔑 Language:', manuscript.language, '→ Key:', languageKey);
    
    const images = realManuscriptImages[languageKey as keyof typeof realManuscriptImages] || realManuscriptImages['Arabe'];
    const index = parseInt(manuscript.id.slice(-2), 16) % images.length;
    const selectedImage = images[index] || getManuscriptImage(manuscript.language, manuscript.id);
    
    console.log('📸 Selected image:', selectedImage);
    return selectedImage;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
      {manuscripts.map((manuscript) => (
        <Card 
          key={manuscript.id} 
          className={`flex flex-col overflow-hidden hover:shadow-moroccan transition-all duration-500 bg-card/50 backdrop-blur border-2 border-gold/20 hover:border-gold/40 group relative ${
            !canAccessManuscript(manuscript) ? 'opacity-60' : ''
          }`}
        >
          <div className="aspect-video overflow-hidden relative bg-gradient-mosaique">
            <LazyImage
              src={getDefaultImage(manuscript)}
              alt={manuscript.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              thumbnail={manuscript.thumbnail_url}
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
          
          <div className="p-6 flex flex-col flex-1 gap-4">
            <div className="flex-1 space-y-2">
              <h3 className="font-moroccan text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {manuscript.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{manuscript.author}</span>
              </div>
              {manuscript.institution && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
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

            <div className="pt-2">
              <Button 
                size="sm" 
                className="w-full"
                disabled={!canAccessManuscript(manuscript)}
                onClick={() => {
                  if (canAccessManuscript(manuscript)) {
                    navigate(`/manuscrit/${manuscript.permalink || manuscript.id}`);
                  }
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Consulter
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
