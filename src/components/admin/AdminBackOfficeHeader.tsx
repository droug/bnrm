import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AdminBackOfficeHeaderProps {
  title: string;
  subtitle: string;
  badgeText?: string;
}

export function AdminBackOfficeHeader({ title, subtitle, badgeText = "Administration" }: AdminBackOfficeHeaderProps) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const fullName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}` 
    : profile?.first_name || profile?.last_name || null;
  const displayName = fullName || user?.email?.split('@')[0] || 'Administrateur';
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
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">
                  {title}
                </h1>
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {badgeText}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                {subtitle}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Connecté en tant que <span className="font-medium text-foreground">{displayName}</span>
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden md:flex"
            onClick={() => navigate('/admin/settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
