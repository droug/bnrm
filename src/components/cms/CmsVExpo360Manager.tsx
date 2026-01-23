import CmsVExpo360HeroManager from "@/components/cms/CmsVExpo360HeroManager";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CmsVExpo360Manager() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Hero-like settings for the homepage section */}
      <CmsVExpo360HeroManager />
      
      {/* Link to full VExpo CMS */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
        <div>
          <p className="font-medium">Gestion avancée des expositions</p>
          <p className="text-sm text-muted-foreground">
            Créer, modifier et gérer les expositions virtuelles, panoramas et hotspots
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin/vexpo360")} className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Ouvrir le CMS VExpo 360°
        </Button>
      </div>
    </div>
  );
}
