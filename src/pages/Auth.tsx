import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BookOpen, Users, Shield, AlertTriangle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Helper to parse hash fragment error params (e.g., #error=access_denied&error_code=otp_expired)
function parseHashParams(hash: string): Record<string, string> {
  if (!hash || hash.length <= 1) return {};
  const params = new URLSearchParams(hash.substring(1));
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export default function Auth() {
  const { user, signIn, signUp, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  // Forgot-password email form
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // Password update form (after recovery link)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Parse URL hash for auth errors (e.g., otp_expired)
  const hashParams = parseHashParams(location.hash);
  const authError = hashParams.error;
  const authErrorCode = hashParams.error_code;
  const authErrorDescription = hashParams.error_description?.replace(/\+/g, " ");

  const isResetFlow = searchParams.get("reset") === "true";
  const redirectTo = searchParams.get("redirect") || "/";

  // Show expired link UI
  const isExpiredLink = authErrorCode === "otp_expired" || authError === "access_denied";

  useEffect(() => {
    if (isResetFlow) {
      setShowResetPassword(false);
    }
  }, [isResetFlow]);

  // Redirect if already authenticated - unless we're setting a new password
  if (user && !loading && !isResetFlow) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    await signIn(email, password);
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const institution = formData.get("institution") as string;
    const researchField = formData.get("researchField") as string;
    const phone = formData.get("phone") as string;
    
    await signUp(email, password, {
      first_name: firstName,
      last_name: lastName,
      institution,
      research_field: researchField,
      phone
    });
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    });

    if (error) {
      toast.error("Erreur", {
        description: error.message,
      });
    } else {
      toast.success("Email envoyé", {
        description: "Vérifiez votre boîte email pour réinitialiser votre mot de passe.",
      });
      setShowResetPassword(false);
      setResetEmail("");
    }

    setIsLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("Mot de passe trop court", {
        description: "Utilisez au moins 8 caractères.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error("Impossible de modifier le mot de passe", {
        description: error.message,
      });
      setIsLoading(false);
      return;
    }

    toast.success("Mot de passe créé", {
      description: "Votre mot de passe a été enregistré.",
    });

    setNewPassword("");
    setConfirmPassword("");
    setIsLoading(false);

    navigate(redirectTo, { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isResetFlow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Créer votre mot de passe</CardTitle>
            <CardDescription>
              {user?.email ? `Compte : ${user.email}` : "Lien invalide ou expiré."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {!user ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Pour des raisons de sécurité, les liens de récupération expirent. Veuillez demander un nouveau lien.
                </p>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => navigate("/auth", { replace: true })}
                >
                  Retour à la connexion
                </Button>
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/auth", { replace: true })}
                    disabled={isLoading}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Portail BNRM</CardTitle>
          <CardDescription>
            Bibliothèque Nationale du Royaume du Maroc
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Expired / Invalid Link Alert */}
          {isExpiredLink && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Lien expiré ou invalide</AlertTitle>
              <AlertDescription className="mt-2 space-y-3">
                <p>
                  {authErrorDescription || "Le lien d'activation ou de réinitialisation a expiré ou a déjà été utilisé."}
                </p>
                <p className="text-sm">
                  Pour des raisons de sécurité, ces liens sont à usage unique et expirent après 1 heure.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setShowResetPassword(true);
                    // Clear the hash from URL
                    navigate("/auth", { replace: true });
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Demander un nouveau lien
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              {!showResetPassword ? (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm px-0"
                      onClick={() => setShowResetPassword(true)}
                    >
                      Mot de passe oublié ?
                    </Button>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold">Réinitialiser le mot de passe</h3>
                    <p className="text-sm text-muted-foreground">
                      Entrez votre email pour recevoir un lien de réinitialisation
                    </p>
                  </div>
                  
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setShowResetPassword(false);
                          setResetEmail("");
                        }}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Envoi..." : "Envoyer"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  <Input
                    id="institution"
                    name="institution"
                    placeholder="Université, Centre de recherche..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="researchField">Domaine de recherche</Label>
                  <Input
                    id="researchField"
                    name="researchField"
                    placeholder="Histoire, Littérature..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+212 6 12 34 56 78"
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Inscription..." : "S'inscrire"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>Sécurisé</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Accès contrôlé</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}