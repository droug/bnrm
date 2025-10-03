import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/useLanguage";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import Manuscripts from "./pages/Manuscripts";
import ManuscriptsPlatform from "./pages/ManuscriptsPlatform";
import AccessRequest from "./pages/AccessRequest";
import Profile from "./pages/Profile";
import UserManagement from "./pages/UserManagement";
import ContentManagement from "./pages/ContentManagement";
import News from "./pages/News";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";
import WysiwygPage from "./pages/WysiwygPage";
import BNRMPortal from "./pages/BNRMPortal";
import BNRMTariffsPage from "./pages/BNRMTariffsPage";
import AdminSettings from "./pages/AdminSettings";
import LegalDepositPage from "./pages/LegalDepositPage";
import ArchivingPage from "./pages/ArchivingPage";
import BNRMBackOffice from "./pages/BNRMBackOffice";
import SearchResults from "./pages/SearchResults";
import DigitalLibrary from "./pages/DigitalLibrary";
import BookReader from "./pages/BookReader";
import MyLibrarySpace from "./pages/MyLibrarySpace";
import CatalogMetadata from "./pages/CatalogMetadata";
import ReproductionPage from "./pages/ReproductionPage";
import ReproductionBackofficePage from "./pages/ReproductionBackofficePage";
import ReproductionDetailsPage from "./pages/ReproductionDetailsPage";
import HelpPage from "./pages/HelpPage";
import PreservationPage from "./pages/PreservationPage";
import DigitalLibraryBackoffice from "./pages/DigitalLibraryBackoffice";
import DigitalLibraryDocuments from "./pages/DigitalLibraryDocuments";
import DigitalLibraryUsers from "./pages/DigitalLibraryUsers";
import DigitalLibraryAnalytics from "./pages/DigitalLibraryAnalytics";
import DigitalLibraryExhibitions from "./pages/DigitalLibraryExhibitions";
import DigitalLibraryReproduction from "./pages/DigitalLibraryReproduction";


const App = () => (
  <TooltipProvider>
    <LanguageProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/manuscripts" element={<Manuscripts />} />
        <Route path="/manuscripts-platform" element={<ManuscriptsPlatform />} />
        <Route path="/plateforme-manuscrits" element={<ManuscriptsPlatform />} />
        <Route path="/access-request" element={<AccessRequest />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/content" element={<ContentManagement />} />
        <Route path="/news" element={<News />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/wysiwyg" element={<WysiwygPage />} />
            <Route path="/admin/bnrm-tariffs" element={<BNRMTariffsPage />} />
            <Route path="/admin/wysiwyg" element={<WysiwygPage />} />
        <Route path="/bnrm" element={<BNRMPortal />} />
        <Route path="/services-tarifs" element={<BNRMPortal />} />
        <Route path="/admin/legal-deposit" element={<LegalDepositPage />} />
        <Route path="/admin/archiving" element={<ArchivingPage />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/bnrm-backoffice" element={<BNRMBackOffice />} />
        <Route path="/admin/catalog-metadata" element={<CatalogMetadata />} />
        <Route path="/admin/reproduction" element={<ReproductionBackofficePage />} />
        <Route path="/digital-library" element={<DigitalLibrary />} />
        <Route path="/digital-library/:category" element={<DigitalLibrary />} />
        <Route path="/book-reader/:id" element={<BookReader />} />
        <Route path="/reproduction" element={<ReproductionPage />} />
        <Route path="/reproduction/:action" element={<ReproductionPage />} />
        <Route path="/reproduction/details/:id" element={<ReproductionDetailsPage />} />
        <Route path="/demande-reproduction" element={<ReproductionPage />} />
        <Route path="/manuscripts" element={<Manuscripts />} />
        <Route path="/my-library-space" element={<MyLibrarySpace />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/aide" element={<HelpPage />} />
        <Route path="/admin/preservation" element={<PreservationPage />} />
          <Route path="/admin/digital-library" element={<DigitalLibraryBackoffice />} />
          <Route path="/admin/digital-library/documents" element={<DigitalLibraryDocuments />} />
          <Route path="/admin/digital-library/users" element={<DigitalLibraryUsers />} />
          <Route path="/admin/digital-library/analytics" element={<DigitalLibraryAnalytics />} />
          <Route path="/admin/digital-library/exhibitions" element={<DigitalLibraryExhibitions />} />
          <Route path="/admin/digital-library/reproduction" element={<DigitalLibraryReproduction />} />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LanguageProvider>
  </TooltipProvider>
);

export default App;