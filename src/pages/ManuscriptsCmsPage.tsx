import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ManuscriptsCmsSystem from "@/components/manuscripts/ManuscriptsCmsSystem";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

export default function ManuscriptsCmsPage() {
  const { user } = useAuth();
  const { isAdmin, isLibrarian, loading } = useSecureRoles();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="p-4 rounded-2xl bg-primary/10 animate-pulse">
            <LayoutDashboard className="h-8 w-8 text-primary" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </motion.div>
      </div>
    );
  }

  if (!user || (!isAdmin && !isLibrarian)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/plateforme-manuscrits")}
            className="gap-2 hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la plateforme
          </Button>
        </motion.div>

        <ManuscriptsCmsSystem />
      </main>
      <Footer />
    </div>
  );
}
