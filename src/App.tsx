import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/useLanguage";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Manuscripts from "./pages/Manuscripts";
import AccessRequest from "./pages/AccessRequest";
import Profile from "./pages/Profile";
import UserManagement from "./pages/UserManagement";
import ContentManagement from "./pages/ContentManagement";
import News from "./pages/News";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";
import WysiwygPage from "./pages/WysiwygPage";
import BNRMPortal from "./pages/BNRMPortal";
import AdminSettings from "./pages/AdminSettings";
import LegalDepositPage from "./pages/LegalDepositPage";
import ArchivingPage from "./pages/ArchivingPage";

const App = () => (
  <TooltipProvider>
    <LanguageProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/manuscripts" element={<Manuscripts />} />
        <Route path="/access-request" element={<AccessRequest />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/content" element={<ContentManagement />} />
        <Route path="/news" element={<News />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/wysiwyg" element={<WysiwygPage />} />
        <Route path="/admin/wysiwyg" element={<WysiwygPage />} />
        <Route path="/bnrm" element={<BNRMPortal />} />
        <Route path="/services-tarifs" element={<BNRMPortal />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/legal-deposit" element={<LegalDepositPage />} />
        <Route path="/admin/archiving" element={<ArchivingPage />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LanguageProvider>
  </TooltipProvider>
);

export default App;