import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  BookOpen, 
  Users, 
  Shield, 
  AlertTriangle, 
  RefreshCw, 
  Building2, 
  Library, 
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Helper to parse hash fragment error params
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
  const { user, signIn, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasTriedRecoverySession = useRef(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const hashParams = parseHashParams(location.hash);
  const authError = hashParams.error;
  const authErrorCode = hashParams.error_code;
  const authErrorDescription = hashParams.error_description?.replace(/\+/g, " ");

  const isResetFlow = searchParams.get("reset") === "true";
  // Si on vient avec un paramètre redirect, l'utiliser, sinon vérifier si on venait d'une page spécifique
  const rawRedirect = searchParams.get("redirect");
  const redirectTo = rawRedirect || (location.state as { from?: string })?.from || "/";
  const isExpiredLink = authErrorCode === "otp_expired" || authError === "access_denied";

  useEffect(() => {
    if (isResetFlow) {
      setShowResetPassword(false);
    }
  }, [isResetFlow]);

  useEffect(() => {
    if (!isResetFlow) return;
    if (hasTriedRecoverySession.current) return;

    const hp = parseHashParams(location.hash);
    const access_token = hp.access_token;
    const refresh_token = hp.refresh_token;
    const token = hp.token; // Legacy OTP token
    const token_hash = hp.token_hash; // Hashed token from generateLink
    const type = hp.type;

    // Sign out any existing session first to avoid showing wrong account
    const establishRecoverySession = async () => {
      hasTriedRecoverySession.current = true;
      setIsLoading(true);

      // Always sign out current user before establishing recovery session
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {});

      // Cas 1: Tokens de session complets (access_token + refresh_token)
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) {
          toast.error("Lien invalide ou expiré", { description: error.message });
        }
        setIsLoading(false);
        return;
      }

      // Cas 2: Token hash (recovery link from generateLink with hashed_token)
      const otpToken = token_hash || token;
      if (otpToken && type === "recovery") {
        const { data, error } = await supabase.auth.verifyOtp({ token_hash: otpToken, type: "recovery" });
        if (error) {
          console.error("OTP verification failed:", error);
          toast.error("Lien invalide ou expiré", { 
            description: "Veuillez demander un nouveau lien de réinitialisation." 
          });
        } else if (data?.session) {
          console.log("OTP verified, session established for", data.session.user?.email);
        }
        setIsLoading(false);
        return;
      }
    };

    if ((access_token && refresh_token) || ((token_hash || token) && type === "recovery")) {
      establishRecoverySession();
      return;
    }
  }, [isResetFlow, location.hash]);

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

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    });

    if (error) {
      toast.error("Erreur", { description: error.message });
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Branding panel component
  const BrandingPanel = ({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) => (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-blue-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
        <div className="mb-10">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-2xl border border-white/20">
            <Icon className="h-12 w-12" />
          </div>
          <h1 className="text-4xl font-bold text-center mb-3">{title}</h1>
          <p className="text-white/80 text-center text-lg max-w-md">{subtitle}</p>
        </div>
      </div>
    </div>
  );

  // Reset password flow
  if (isResetFlow) {
    return (
      <div className="min-h-screen flex">
        <BrandingPanel 
          icon={Shield} 
          title="Sécurisez votre compte" 
          subtitle="Créez un mot de passe sécurisé pour protéger l'accès à votre espace personnel"
        />

        {/* Right Panel - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-slate-50 to-blue-50/50">
          <Card className="w-full max-w-md border-0 shadow-2xl shadow-primary/10 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Créer votre mot de passe</h2>
                <p className="text-muted-foreground mt-2">
                  {user?.email
                    ? `Compte : ${user.email}`
                    : isLoading
                      ? "Chargement du compte..."
                      : "Lien invalide ou expiré."}
                </p>
              </div>

              {!user ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Pour des raisons de sécurité, les liens de récupération expirent. Veuillez demander un nouveau lien.
                  </p>
                  <Button
                    className="w-full h-12"
                    onClick={() => navigate("/auth", { replace: true })}
                  >
                    Retour à la connexion
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleUpdatePassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-medium">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        className="pl-10 pr-10 h-12 border-slate-200 focus:border-primary"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        className="pl-10 h-12 border-slate-200 focus:border-primary"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-12"
                      onClick={() => navigate("/auth", { replace: true })}
                      disabled={isLoading}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" className="flex-1 h-12" disabled={isLoading}>
                      {isLoading ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main login view
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-blue-900 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          {/* Logo/Icon */}
          <div className="mb-10">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-2xl border border-white/20">
              <BookOpen className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-bold text-center mb-3">Portail BNRM</h1>
            <p className="text-white/80 text-center text-lg max-w-md">
              Bibliothèque Nationale du Royaume du Maroc
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 w-full max-w-sm">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Library className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Collections numériques</h3>
                <p className="text-sm text-white/70">Accédez aux ressources patrimoniales</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Dépôt légal</h3>
                <p className="text-sm text-white/70">Services en ligne sécurisés</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Espace personnel</h3>
                <p className="text-sm text-white/70">Gérez vos demandes et documents</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-slate-50 to-blue-50/50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Portail BNRM</h1>
            <p className="text-muted-foreground text-sm">Bibliothèque Nationale du Royaume du Maroc</p>
          </div>

          <Card className="border-0 shadow-2xl shadow-primary/10 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground">Connexion</h2>
                <p className="text-muted-foreground mt-2">Accédez à votre espace personnel</p>
              </div>

              {/* Expired Link Alert */}
              {isExpiredLink && (
                <Alert variant="destructive" className="mb-6 border-destructive/50 bg-destructive/10">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Lien expiré ou invalide</AlertTitle>
                  <AlertDescription className="mt-2 space-y-3">
                    <p className="text-sm">
                      {authErrorDescription || "Le lien d'activation ou de réinitialisation a expiré."}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowResetPassword(true);
                        navigate("/auth", { replace: true });
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Demander un nouveau lien
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Login Form */}
              {!showResetPassword ? (
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="votre@email.com"
                        required
                        className="pl-10 h-12 border-slate-200 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        className="pl-10 pr-10 h-12 border-slate-200 focus:border-primary transition-colors"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm px-0 h-auto text-primary hover:text-primary/80"
                      onClick={() => setShowResetPassword(true)}
                    >
                      Mot de passe oublié ?
                    </Button>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Connexion...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Se connecter
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-4 text-muted-foreground font-medium">
                        Pas encore de compte ?
                      </span>
                    </div>
                  </div>

                  {/* Signup buttons */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-2 hover:border-primary hover:bg-primary/5 transition-all group"
                      onClick={() => navigate("/signup")}
                    >
                      <Building2 className="h-5 w-5 mr-2 text-primary" />
                      <span>Inscription professionnelle</span>
                      <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-2 hover:border-amber-500 hover:bg-amber-500/5 transition-all group"
                      onClick={() => navigate("/abonnements?platform=portal")}
                    >
                      <Library className="h-5 w-5 mr-2 text-amber-600" />
                      <span>Adhésion bibliothèque numérique</span>
                      <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </div>
                </form>
              ) : (
                /* Reset Password Form */
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Réinitialiser le mot de passe</h3>
                    <p className="text-sm text-muted-foreground">
                      Entrez votre email pour recevoir un lien de réinitialisation
                    </p>
                  </div>
                  
                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="text-sm font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="votre@email.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                          className="pl-10 h-12 border-slate-200 focus:border-primary"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-12"
                        onClick={() => {
                          setShowResetPassword(false);
                          setResetEmail("");
                        }}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 h-12"
                        disabled={isLoading}
                      >
                        {isLoading ? "Envoi..." : "Envoyer"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Trust badges */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Connexion sécurisée</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span>Données protégées</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back to home */}
          <div className="text-center mt-6">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/")}
            >
              ← Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}