import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import KitabHeader from "@/components/KitabHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, BookPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function KitabAdmin() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Restrict access to admin only
  if (!user || !profile || profile.role !== 'admin') {
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
        <div className="grid gap-6 md:grid-cols-2">
          {/* Carte Gestion des Parutions */}
          <Card 
            className="border-kitab-primary/20 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
            onClick={() => navigate("/kitab/admin/gestion_parutions")}
          >
            <CardHeader className="border-b border-kitab-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-kitab-primary/20 to-kitab-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookPlus className="h-6 w-6 text-kitab-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-kitab-primary">
                      Gestion des Parutions
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Nouvelles parutions et à paraître
                    </CardDescription>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-kitab-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Gérez les publications Kitab : nouvelles parutions et publications à paraître
              </p>
            </CardContent>
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
