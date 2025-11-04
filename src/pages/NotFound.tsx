import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Home, Search, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { track404Error } from "@/utils/seoUtils";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    // Track 404 error with referrer
    const referrer = document.referrer || "direct";
    track404Error(location.pathname, referrer);
  }, [location]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Page non trouvée - 404"
        description="La page que vous recherchez n'existe pas ou a été déplacée. Retournez à l'accueil ou utilisez la recherche pour trouver ce que vous cherchez."
        noindex={true}
      />
      
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 text-6xl font-bold text-primary">404</div>
            <CardTitle className="text-3xl">Page non trouvée</CardTitle>
            <CardDescription className="text-lg mt-2">
              Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Vous avez peut-être suivi un lien obsolète ou tapé une URL incorrecte.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button asChild size="lg">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Retour à l'accueil
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg">
                <Link to="/search">
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher
                </Link>
              </Button>
              
              <Button 
                variant="ghost" 
                size="lg"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Page précédente
              </Button>
            </div>

            <div className="mt-8 pt-8 border-t">
              <h2 className="text-lg font-semibold mb-4">Pages populaires :</h2>
              <ul className="space-y-2">
                <li>
                  <Link to="/digital-library" className="text-primary hover:underline">
                    Bibliothèque Numérique
                  </Link>
                </li>
                <li>
                  <Link to="/manuscripts-platform" className="text-primary hover:underline">
                    Plateforme des Manuscrits
                  </Link>
                </li>
                <li>
                  <Link to="/kitab" className="text-primary hover:underline">
                    Kitab - Publications Marocaines
                  </Link>
                </li>
                <li>
                  <Link to="/cbm" className="text-primary hover:underline">
                    Catalogue Collectif des Bibliothèques Marocaines
                  </Link>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
