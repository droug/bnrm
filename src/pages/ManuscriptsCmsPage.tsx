import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ManuscriptsCmsSystem from "@/components/manuscripts/ManuscriptsCmsSystem";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Scroll } from "lucide-react";
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
            <Scroll className="h-8 w-8 text-primary" />
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

      {/* Page header — same pattern as /admin/digital-library */}
      <div className="bg-gradient-to-r from-amber-900/80 to-amber-700/60 border-b">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 mb-4"
          >
            <Button
              variant="ghost"
              onClick={() => navigate("/plateforme-manuscrits")}
              className="gap-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la plateforme
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <div className="p-3 rounded-xl bg-white/10 border border-white/20">
              <Scroll className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Administration</h1>
              <p className="text-white/70 mt-1">Accès aux modules de gestion de la Plateforme Manuscrits</p>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 lg:px-8">
        <ManuscriptsCmsSystem />
      </main>
      <Footer />
    </div>
  );
}
