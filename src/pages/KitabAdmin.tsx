import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate, useNavigate } from "react-router-dom";
import KitabHeader from "@/components/KitabHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, BookPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function KitabAdmin() {
  const { user } = useAuth();
  const { isAdmin, loading: rolesLoading } = useSecureRoles();
  const navigate = useNavigate();

  if (rolesLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/kitab" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-kitab-primary/5 to-kitab-secondary/5">
      <KitabHeader />
      <main className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-kitab-primary to-kitab-secondary flex items-center justify-center shadow-lg">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-kitab-primary via-kitab-secondary to-kitab-accent bg-clip-text text-transparent">
                Administration Kitab
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Gestion du portail des publications marocaines
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Carte Gestion des Parutions */}
          <Card 
            className="relative overflow-hidden border-kitab-primary/30 cursor-pointer group hover:border-kitab-primary/50 transition-all duration-300"
            onClick={() => navigate("/kitab/admin/gestion_parutions")}
            style={{
              boxShadow: '0 4px 20px -4px hsl(var(--kitab-primary) / 0.25), 0 2px 8px -2px hsl(var(--kitab-accent) / 0.15)'
            }}
          >
            {/* Gradient de fond animé */}
            <div className="absolute inset-0 bg-gradient-to-br from-kitab-primary/5 via-kitab-secondary/5 to-kitab-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Pattern de fond subtil */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, hsl(var(--kitab-primary) / 0.03) 0px, hsl(var(--kitab-primary) / 0.03) 10px, transparent 10px, transparent 20px)`
              }}
            />

            <CardHeader className="relative border-b border-kitab-primary/10 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Icône avec gradient et effet glow */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-kitab-primary to-kitab-accent rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                    <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-kitab-primary via-kitab-secondary to-kitab-accent flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <BookPlus className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-kitab-primary via-kitab-secondary to-kitab-accent bg-clip-text text-transparent group-hover:scale-105 transition-transform origin-left">
                      Gestion des Parutions
                    </CardTitle>
                    <CardDescription className="text-sm flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-kitab-accent animate-pulse" />
                      Nouvelles parutions et à paraître
                    </CardDescription>
                  </div>
                </div>
                
                {/* Flèche animée */}
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-kitab-primary/10 to-kitab-accent/10 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-kitab-primary/20 group-hover:to-kitab-accent/20 transition-all">
                  <ArrowRight className="h-4 w-4 text-kitab-primary opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative pt-6 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Gérez les publications Kitab : nouvelles parutions et publications à paraître
              </p>
              
              {/* Badge indicateur */}
              <div className="flex items-center gap-2 pt-2">
                <div className="px-3 py-1 rounded-full bg-gradient-to-r from-kitab-primary/10 to-kitab-secondary/10 border border-kitab-primary/20">
                  <span className="text-xs font-medium bg-gradient-to-r from-kitab-primary to-kitab-secondary bg-clip-text text-transparent">
                    2 onglets disponibles
                  </span>
                </div>
              </div>
            </CardContent>

            {/* Barre décorative en bas */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-kitab-primary via-kitab-secondary to-kitab-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Card>

          {/* Placeholder pour futures fonctionnalités d'administration */}
          {/* 
          <Card 
            className="border-kitab-primary/20 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => navigate("/kitab/admin/autre-section")}
          >
            ...
          </Card>
          */}
        </div>
      </main>
      <Footer forceKitabStyle />
    </div>
  );
}
