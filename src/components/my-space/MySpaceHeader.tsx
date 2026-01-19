import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface MySpaceHeaderProps {
  profile?: {
    first_name?: string | null;
    last_name?: string | null;
  } | null;
}

export function MySpaceHeader({ profile }: MySpaceHeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const fullName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}` 
    : profile?.first_name || profile?.last_name || null;
  const displayName = fullName || user?.email?.split('@')[0] || 'Utilisateur';
  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    : displayName.substring(0, 2).toUpperCase();

  return (
    <Card className="border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-md">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Bienvenue, {displayName}
                </h1>
                <Badge variant="secondary" className="text-xs">
                  Membre
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Gérez vos demandes et suivez votre activité
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden md:flex"
            onClick={() => navigate('/profile')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Mon profil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
