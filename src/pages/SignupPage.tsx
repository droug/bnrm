import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, Printer, Clapperboard } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EditorSignupForm from "@/components/EditorSignupForm";
import PrinterSignupForm from "@/components/PrinterSignupForm";
import ProducerSignupForm from "@/components/ProducerSignupForm";
import { WatermarkContainer } from "@/components/ui/watermark";

const SignupPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string>("");
  const [prefillData, setPrefillData] = useState<{
    email?: string;
    name?: string;
    ref?: string;
  }>({});

  // Pré-sélectionner le type et extraire les données pré-remplies depuis l'URL
  useEffect(() => {
    const typeParam = searchParams.get("type");
    const emailParam = searchParams.get("email");
    const nameParam = searchParams.get("name");
    const refParam = searchParams.get("ref");
    
    if (typeParam && ["editor", "printer", "producer"].includes(typeParam)) {
      setSelectedType(typeParam);
    }
    
    // Stocker les données pré-remplies si elles existent
    if (emailParam || nameParam || refParam) {
      setPrefillData({
        email: emailParam || undefined,
        name: nameParam || undefined,
        ref: refParam || undefined,
      });
    }
  }, [searchParams]);

  const getTypeConfig = (type: string) => {
    const configs = {
      editor: {
        icon: Building,
        title: "Inscription Éditeur",
        gradient: "from-accent to-highlight",
        color: "text-accent",
      },
      printer: {
        icon: Printer,
        title: "Inscription Imprimeur",
        gradient: "from-highlight to-primary",
        color: "text-highlight",
      },
      producer: {
        icon: Clapperboard,
        title: "Inscription Producteur",
        gradient: "from-primary to-accent",
        color: "text-primary",
      },
    };
    return configs[type as keyof typeof configs];
  };

  const renderTypeSelection = () => (
    <div className="max-w-5xl mx-auto space-y-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="group hover:bg-primary/10 transition-all duration-300"
      >
        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
        Retour
      </Button>
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
          Choisir le type de compte
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Sélectionnez le type de compte qui correspond à votre activité professionnelle
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Compte éditeur */}
        <Card 
          className="relative cursor-pointer group overflow-hidden border-2 border-transparent hover:border-accent/50 transition-all duration-500 flex flex-col shadow-lg hover:shadow-2xl"
          onClick={() => setSelectedType("editor")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-highlight transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          <CardHeader className="text-center relative z-10">
            <div className="relative mx-auto mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-accent to-highlight rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative p-4 bg-gradient-to-br from-accent/10 to-highlight/10 rounded-2xl group-hover:from-accent group-hover:to-highlight transition-all duration-500">
                <Building className="h-10 w-10 text-accent group-hover:text-white transition-colors duration-500" />
              </div>
            </div>
            <CardTitle className="text-xl">Compte Éditeur</CardTitle>
            <CardDescription className="text-base">
              Pour les maisons d'édition et éditeurs
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col relative z-10">
            <ul className="text-sm text-muted-foreground space-y-3 flex-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Dépôt légal des publications
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Suivi des dépôts
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Services dédiés aux éditeurs
              </li>
            </ul>
            <Button 
              variant="outline" 
              className="w-full mt-6 group-hover:bg-gradient-to-r group-hover:from-accent group-hover:to-highlight group-hover:text-white group-hover:border-transparent transition-all duration-500"
            >
              Créer un compte éditeur
            </Button>
          </CardContent>
        </Card>

        {/* Compte imprimeur */}
        <Card 
          className="relative cursor-pointer group overflow-hidden border-2 border-transparent hover:border-highlight/50 transition-all duration-500 flex flex-col shadow-lg hover:shadow-2xl"
          onClick={() => setSelectedType("printer")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-highlight/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-highlight to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          <CardHeader className="text-center relative z-10">
            <div className="relative mx-auto mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-highlight to-primary rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative p-4 bg-gradient-to-br from-highlight/10 to-primary/10 rounded-2xl group-hover:from-highlight group-hover:to-primary transition-all duration-500">
                <Printer className="h-10 w-10 text-highlight group-hover:text-white transition-colors duration-500" />
              </div>
            </div>
            <CardTitle className="text-xl">Compte Imprimeur</CardTitle>
            <CardDescription className="text-base">
              Pour les imprimeries et prestataires d'impression
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col relative z-10">
            <ul className="text-sm text-muted-foreground space-y-3 flex-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-highlight" />
                Dépôt légal des impressions
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-highlight" />
                Gestion des partenariats
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-highlight" />
                Services aux imprimeurs
              </li>
            </ul>
            <Button 
              variant="outline" 
              className="w-full mt-6 group-hover:bg-gradient-to-r group-hover:from-highlight group-hover:to-primary group-hover:text-white group-hover:border-transparent transition-all duration-500"
            >
              Créer un compte imprimeur
            </Button>
          </CardContent>
        </Card>

        {/* Compte producteur */}
        <Card 
          className="relative cursor-pointer group overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all duration-500 flex flex-col shadow-lg hover:shadow-2xl"
          onClick={() => setSelectedType("producer")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          <CardHeader className="text-center relative z-10">
            <div className="relative mx-auto mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl group-hover:from-primary group-hover:to-accent transition-all duration-500">
                <Clapperboard className="h-10 w-10 text-primary group-hover:text-white transition-colors duration-500" />
              </div>
            </div>
            <CardTitle className="text-xl">Compte Producteur</CardTitle>
            <CardDescription className="text-base">
              Pour les producteurs de contenus éditoriaux
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col relative z-10">
            <ul className="text-sm text-muted-foreground space-y-3 flex-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Production audiovisuelle et multimédia
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Dépôt légal de productions
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Services dédiés aux producteurs
              </li>
            </ul>
            <Button 
              variant="outline" 
              className="w-full mt-6 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent group-hover:text-white group-hover:border-transparent transition-all duration-500"
            >
              Créer un compte producteur
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const config = selectedType ? getTypeConfig(selectedType) : null;
  const IconComponent = config?.icon;

  return (
    <WatermarkContainer>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        
        <main className="flex-1 relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-accent/15 via-primary/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-highlight/10 via-accent/5 to-transparent rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 container mx-auto px-4 py-8">
            {!selectedType ? (
              renderTypeSelection()
            ) : (
              <div className="space-y-6">
                {/* Premium Header Section */}
                <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-accent/5 to-highlight/5 rounded-2xl border border-border/30 p-6 md:p-8">
                  {/* Back button with animation */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedType("")}
                    className="mb-4 group hover:bg-primary/10 transition-all duration-300"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                    Retour
                  </Button>

                  {/* Title section with premium styling */}
                  <div className="flex items-start gap-4 md:gap-6">
                    {IconComponent && (
                      <div className="relative hidden sm:block">
                        <div className={`absolute inset-0 bg-gradient-to-br ${config?.gradient} rounded-2xl blur-xl opacity-50`} />
                        <div className={`relative p-4 md:p-5 bg-gradient-to-br ${config?.gradient} rounded-2xl shadow-xl`}>
                          <IconComponent className="h-8 w-8 md:h-10 md:w-10 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="flex-1">
                      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                        {config?.title}
                      </h1>
                      <p className="text-muted-foreground mt-2 text-base md:text-lg">
                        Créez votre compte professionnel pour accéder aux services de dépôt légal
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form container with premium styling */}
                <div className="relative bg-card rounded-2xl shadow-2xl border border-border/40 overflow-hidden">
                  {/* Top gradient accent line */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${config?.gradient}`} />
                  
                  {/* Content */}
                  <div className="p-4 md:p-6 lg:p-8">
                    {selectedType === "editor" && <EditorSignupForm prefillEmail={prefillData.email} prefillName={prefillData.name} />}
                    {selectedType === "printer" && <PrinterSignupForm prefillEmail={prefillData.email} prefillName={prefillData.name} />}
                    {selectedType === "producer" && <ProducerSignupForm />}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </WatermarkContainer>
  );
};

export default SignupPage;