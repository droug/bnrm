import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/useLanguage";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import Manuscripts from "./pages/Manuscripts";
import ManuscriptsPlatform from "./pages/ManuscriptsPlatform";
import ManuscriptsBackoffice from "./pages/ManuscriptsBackoffice";
import ManuscriptsBackofficeDashboard from "./pages/ManuscriptsBackofficeDashboard";
import ManuscriptsBackofficeDocuments from "./pages/ManuscriptsBackofficeDocuments";
import ManuscriptsBackofficeUsers from "./pages/ManuscriptsBackofficeUsers";
import ManuscriptsBackofficeAnalytics from "./pages/ManuscriptsBackofficeAnalytics";
import ManuscriptsBackofficeExhibitions from "./pages/ManuscriptsBackofficeExhibitions";
import ManuscriptsBackofficeReports from "./pages/ManuscriptsBackofficeReports";
import ManuscriptsBackofficeAccess from "./pages/ManuscriptsBackofficeAccess";
import ManuscriptsBackofficeSettings from "./pages/ManuscriptsBackofficeSettings";
import ManuscriptReader from "./pages/ManuscriptReader";
import MyManuscriptsSpace from "./pages/MyManuscriptsSpace";
import ManuscriptsHelp from "./pages/ManuscriptsHelp";
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
import AccessPolicies from "./pages/AccessPolicies";
import CBMPortal from "./pages/CBMPortal";
import CBMObjectifs from "./pages/CBMObjectifs";
import CBMPlanActions from "./pages/CBMPlanActions";
import CBMOrganesGestion from "./pages/CBMOrganesGestion";
import CBMAdhesion from "./pages/CBMAdhesion";
import CBMRecherche from "./pages/CBMRecherche";
import CBMAccesRapide from "./pages/CBMAccesRapide";
import KitabPortal from "./pages/KitabPortal";
import KitabAbout from "./pages/KitabAbout";
import KitabUpcoming from "./pages/KitabUpcoming";
import KitabNewPublications from "./pages/KitabNewPublications";
import KitabBibliography from "./pages/KitabBibliography";
import KitabFAQ from "./pages/KitabFAQ";
import KitabRepertoireEditeurs from "./pages/KitabRepertoireEditeurs";
import KitabRepertoireAuteurs from "./pages/KitabRepertoireAuteurs";
import KitabRepertoireImprimeurs from "./pages/KitabRepertoireImprimeurs";
import KitabRepertoireDistributeurs from "./pages/KitabRepertoireDistributeurs";


const App = () => (
  <TooltipProvider>
    <LanguageProvider>
      <ScrollToTop />
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
        <Route path="/manuscripts/help" element={<ManuscriptsHelp />} />
        <Route path="/aide-manuscrits" element={<ManuscriptsHelp />} />
        <Route path="/admin/manuscripts-backoffice" element={<ManuscriptsBackoffice />} />
        <Route path="/admin/manuscripts-backoffice/dashboard" element={<ManuscriptsBackofficeDashboard />} />
        <Route path="/admin/manuscripts-backoffice/documents" element={<ManuscriptsBackofficeDocuments />} />
        <Route path="/admin/manuscripts-backoffice/users" element={<ManuscriptsBackofficeUsers />} />
        <Route path="/admin/manuscripts-backoffice/analytics" element={<ManuscriptsBackofficeAnalytics />} />
        <Route path="/admin/manuscripts-backoffice/exhibitions" element={<ManuscriptsBackofficeExhibitions />} />
        <Route path="/admin/manuscripts-backoffice/reports" element={<ManuscriptsBackofficeReports />} />
        <Route path="/admin/manuscripts-backoffice/access" element={<ManuscriptsBackofficeAccess />} />
        <Route path="/admin/manuscripts-backoffice/settings" element={<ManuscriptsBackofficeSettings />} />
        <Route path="/manuscrit/:id" element={<ManuscriptReader />} />
        <Route path="/manuscript/:id" element={<ManuscriptReader />} />
        <Route path="/mon-espace-manuscrits" element={<MyManuscriptsSpace />} />
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
          <Route path="/access-policies" element={<AccessPolicies />} />
          <Route path="/politiques-acces" element={<AccessPolicies />} />
          
          {/* CBM Portal Routes */}
          <Route path="/cbm" element={<CBMPortal />} />
          <Route path="/cbm/objectifs" element={<CBMObjectifs />} />
          <Route path="/cbm/plan-actions" element={<CBMPlanActions />} />
          <Route path="/cbm/organes-gestion" element={<CBMOrganesGestion />} />
          <Route path="/cbm/adhesion" element={<CBMAdhesion />} />
          <Route path="/cbm/recherche" element={<CBMRecherche />} />
          <Route path="/cbm/acces-rapide" element={<CBMAccesRapide />} />

          {/* Kitab Platform Routes */}
          <Route path="/kitab" element={<KitabPortal />} />
          <Route path="/kitab/about" element={<KitabAbout />} />
          <Route path="/kitab/upcoming" element={<KitabUpcoming />} />
          <Route path="/kitab/new-publications" element={<KitabNewPublications />} />
          <Route path="/kitab/bibliography" element={<KitabBibliography />} />
          <Route path="/kitab/faq" element={<KitabFAQ />} />
          <Route path="/kitab/repertoire-editeurs" element={<KitabRepertoireEditeurs />} />
          <Route path="/kitab/repertoire-auteurs" element={<KitabRepertoireAuteurs />} />
          <Route path="/kitab/repertoire-imprimeurs" element={<KitabRepertoireImprimeurs />} />
          <Route path="/kitab/repertoire-distributeurs" element={<KitabRepertoireDistributeurs />} />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LanguageProvider>
  </TooltipProvider>
);

export default App;