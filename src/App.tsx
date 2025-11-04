import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/useLanguage";
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ScrollToTop from "@/components/ScrollToTop";
import { useAutoSync } from "@/hooks/useAutoSync";
import { PerformanceOptimizer } from "@/components/seo/PerformanceOptimizer";
import { CookieBanner } from "@/components/cookies/CookieBanner";

// Always loaded (critical routes)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy-loaded routes for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const Profile = lazy(() => import("./pages/Profile"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const HelpPage = lazy(() => import("./pages/HelpPage"));
const News = lazy(() => import("./pages/News"));
const PracticalInfo = lazy(() => import("./pages/PracticalInfo"));

// Manuscripts Platform (lazy)
const Manuscripts = lazy(() => import("./pages/Manuscripts"));
const ManuscriptsPlatform = lazy(() => import("./pages/ManuscriptsPlatform"));
const ManuscriptAdvancedSearch = lazy(() => import("./pages/manuscripts/AdvancedSearch"));
const ManuscriptReader = lazy(() => import("./pages/ManuscriptReader"));
const MyManuscriptsSpace = lazy(() => import("./pages/MyManuscriptsSpace"));
const ManuscriptsHelp = lazy(() => import("./pages/ManuscriptsHelp"));
const AccessRequest = lazy(() => import("./pages/AccessRequest"));

// Admin - Manuscripts Backoffice (lazy)
const ManuscriptsBackoffice = lazy(() => import("./pages/ManuscriptsBackoffice"));
const ManuscriptsBackofficeDashboard = lazy(() => import("./pages/ManuscriptsBackofficeDashboard"));
const ManuscriptsBackofficeDocuments = lazy(() => import("./pages/ManuscriptsBackofficeDocuments"));
const ManuscriptsBackofficeUsers = lazy(() => import("./pages/ManuscriptsBackofficeUsers"));
const ManuscriptsBackofficeAnalytics = lazy(() => import("./pages/ManuscriptsBackofficeAnalytics"));
const ManuscriptsBackofficeExhibitions = lazy(() => import("./pages/ManuscriptsBackofficeExhibitions"));
const ManuscriptsBackofficeReports = lazy(() => import("./pages/ManuscriptsBackofficeReports"));
const ManuscriptsBackofficeAccess = lazy(() => import("./pages/ManuscriptsBackofficeAccess"));
const ManuscriptsBackofficeSettings = lazy(() => import("./pages/ManuscriptsBackofficeSettings"));

// Admin - General (lazy)
const UserManagement = lazy(() => import("./pages/UserManagement"));
const ContentManagement = lazy(() => import("./pages/ContentManagement"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const FormBuilder = lazy(() => import("./pages/admin/FormBuilder"));
const ImportFormFields = lazy(() => import("./pages/admin/ImportFormFields"));
const ManageSectionFields = lazy(() => import("./pages/admin/ManageSectionFields"));
const WysiwygPage = lazy(() => import("./pages/WysiwygPage"));
const ArchivingPage = lazy(() => import("./pages/ArchivingPage"));
const PreservationPage = lazy(() => import("./pages/PreservationPage"));
const CatalogMetadata = lazy(() => import("./pages/CatalogMetadata"));
const TranslationManagementPage = lazy(() => import("./pages/TranslationManagementPage"));
const AccessRequestsManagement = lazy(() => import("./pages/AccessRequestsManagement"));
const EmailManagement = lazy(() => import("./pages/EmailManagement"));
const SystemListsPage = lazy(() => import("./pages/SystemListsPage"));
const WorkflowBPM = lazy(() => import("./pages/WorkflowBPM"));
const CoteManagementPage = lazy(() => import("./pages/CoteManagementPage"));

// BNRM Portal (lazy)
const BNRMPortal = lazy(() => import("./pages/BNRMPortal"));
const BNRMTariffsPage = lazy(() => import("./pages/BNRMTariffsPage"));
const BNRMBackOffice = lazy(() => import("./pages/BNRMBackOffice"));
const ServicesCatalog = lazy(() => import("./pages/ServicesCatalog"));
const GestionReservationsOuvrages = lazy(() => import("./pages/GestionReservationsOuvrages"));

// Legal Deposit (lazy)
const LegalDepositPage = lazy(() => import("./pages/LegalDepositPage"));
const LegalDepositApprovals = lazy(() => import("./pages/LegalDepositApprovals"));
const DynamicFormPage = lazy(() => import("./pages/DynamicFormPage"));
const DepositApprovals = lazy(() => import("./pages/DepositApprovals"));
const CommitteeDashboard = lazy(() => import("./pages/CommitteeDashboard"));
const ProfessionalManagement = lazy(() => import("./pages/ProfessionalManagement"));
const ProfessionalSignup = lazy(() => import("./pages/ProfessionalSignup"));

// Digital Library (lazy)
const DigitalLibraryHome = lazy(() => import("./pages/digital-library/Home"));
const DigitalLibraryAdministration = lazy(() => import("./pages/digital-library/Administration"));
const DigitalLibraryAdminDashboard = lazy(() => import("./pages/digital-library/AdminDashboard"));
const DigitalLibraryAdminSettings = lazy(() => import("./pages/digital-library/AdminSettings"));
const BookReader = lazy(() => import("./pages/BookReader"));
const MyLibrarySpace = lazy(() => import("./pages/MyLibrarySpace"));
const DigitalLibraryBackoffice = lazy(() => import("./pages/DigitalLibraryBackoffice"));
const Collections = lazy(() => import("./pages/digital-library/Collections"));
const CollectionDetails = lazy(() => import("./pages/digital-library/CollectionDetails"));
const DocumentDetails = lazy(() => import("./pages/digital-library/DocumentDetails"));
const Themes = lazy(() => import("./pages/digital-library/Themes"));
const ThemeDetails = lazy(() => import("./pages/digital-library/ThemeDetails"));
const AdvancedSearch = lazy(() => import("./pages/digital-library/AdvancedSearch"));
const NewsEvents = lazy(() => import("./pages/digital-library/NewsEvents"));
const NewsDetails = lazy(() => import("./pages/digital-library/NewsDetails"));
const HelpFAQ = lazy(() => import("./pages/digital-library/HelpFAQ"));
const MySpace = lazy(() => import("./pages/digital-library/MySpace"));
const MyLoans = lazy(() => import("./pages/digital-library/MyLoans"));
const MyNotes = lazy(() => import("./pages/digital-library/MyNotes"));
const AccountSettings = lazy(() => import("./pages/digital-library/AccountSettings"));
const UserReservations = lazy(() => import("./pages/digital-library/UserReservations"));
const UserDigitizationRequests = lazy(() => import("./pages/digital-library/UserDigitizationRequests"));
const MyRequests = lazy(() => import("./pages/digital-library/MyRequests"));
const RequestsManagement = lazy(() => import("./pages/digital-library/RequestsManagement"));
const DigitalLibraryDocuments = lazy(() => import("./pages/DigitalLibraryDocuments"));
const DigitalLibraryUsers = lazy(() => import("./pages/DigitalLibraryUsers"));
const DigitalLibraryAnalytics = lazy(() => import("./pages/DigitalLibraryAnalytics"));
const DigitalLibraryExhibitions = lazy(() => import("./pages/DigitalLibraryExhibitions"));
const DigitalLibraryReproduction = lazy(() => import("./pages/DigitalLibraryReproduction"));
const DigitalLibraryRestrictions = lazy(() => import("./pages/DigitalLibraryRestrictions"));
const DigitalLibraryCopyright = lazy(() => import("./pages/DigitalLibraryCopyright"));
const DigitalLibraryBulkImport = lazy(() => import("./pages/DigitalLibraryBulkImport"));
const PageAccessRestrictionsBackoffice = lazy(() => import("./pages/PageAccessRestrictionsBackoffice"));
const AccessPolicies = lazy(() => import("./pages/AccessPolicies"));

// Reproduction (lazy)
const ReproductionPage = lazy(() => import("./pages/ReproductionPage"));
const ReproductionBackofficePage = lazy(() => import("./pages/ReproductionBackofficePage"));
const ReproductionDetailsPage = lazy(() => import("./pages/ReproductionDetailsPage"));
const RestorationRequest = lazy(() => import("./pages/RestorationRequest"));
const RestorationRequests = lazy(() => import("./pages/admin/RestorationRequests"));
const BankTransferInstructions = lazy(() => import("./pages/BankTransferInstructions"));
const DemandeNumerisation = lazy(() => import("./pages/DemandeNumerisation"));

// CBM Portal (lazy)
const CBMPortal = lazy(() => import("./pages/CBMPortal"));
const CBMObjectifs = lazy(() => import("./pages/CBMObjectifs"));
const CBMPlanActions = lazy(() => import("./pages/CBMPlanActions"));
const CBMOrganesGestion = lazy(() => import("./pages/CBMOrganesGestion"));
const CBMAdhesion = lazy(() => import("./pages/CBMAdhesion"));
const CBMRecherche = lazy(() => import("./pages/CBMRecherche"));
const CBMAccesRapide = lazy(() => import("./pages/CBMAccesRapide"));
const CBNRechercheAvancee = lazy(() => import("./pages/cbm/RechercheAvancee"));
const CBNNoticeExample = lazy(() => import("./pages/cbm/NoticeExample"));
const CatalogueCBN = lazy(() => import("./pages/cbm/CatalogueCBN"));
const NoticeDetaillee = lazy(() => import("./pages/cbm/NoticeDetaillee"));
const DemandeReproduction = lazy(() => import("./pages/cbn/DemandeReproduction"));
const UserBookReservations = lazy(() => import("./pages/UserBookReservations"));
const BookReservationService = lazy(() => import("./pages/BookReservationService"));
const NoticeDetail = lazy(() => import("./pages/cbn/NoticeDetail"));
const NoticeDetailReproduction = lazy(() => import("./pages/cbn/NoticeDetailReproduction"));

// Kitab Platform (lazy)
const KitabPortal = lazy(() => import("./pages/KitabPortal"));
const KitabAbout = lazy(() => import("./pages/KitabAbout"));
const KitabUpcoming = lazy(() => import("./pages/KitabUpcoming"));
const KitabNewPublications = lazy(() => import("./pages/KitabNewPublications"));
const KitabBibliography = lazy(() => import("./pages/KitabBibliography"));
const KitabFAQ = lazy(() => import("./pages/KitabFAQ"));
const KitabRepertoireEditeurs = lazy(() => import("./pages/KitabRepertoireEditeurs"));
const KitabRepertoireAuteurs = lazy(() => import("./pages/KitabRepertoireAuteurs"));
const KitabRepertoireImprimeurs = lazy(() => import("./pages/KitabRepertoireImprimeurs"));
const KitabRepertoireDistributeurs = lazy(() => import("./pages/KitabRepertoireDistributeurs"));

// Payment & Wallet (lazy)
const PaymentServices = lazy(() => import("./pages/PaymentServices"));
const Wallet = lazy(() => import("./pages/Wallet"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCanceled = lazy(() => import("./pages/PaymentCanceled"));
const CulturalActivitiesBooking = lazy(() => import("./pages/CulturalActivitiesBooking"));
const CulturalActivities = lazy(() => import("./pages/CulturalActivities"));
const CulturalActivitiesGuidedTours = lazy(() => import("./pages/CulturalActivitiesGuidedTours"));
const CulturalActivitiesPartnership = lazy(() => import("./pages/CulturalActivitiesPartnership"));
const CulturalActivitiesPartnershipConfirmation = lazy(() => import("./pages/CulturalActivitiesPartnershipConfirmation"));
const CulturalActivitiesProgramming = lazy(() => import("./pages/CulturalActivitiesProgramming"));
const ProgramContributionConfirmation = lazy(() => import("./pages/ProgramContributionConfirmation"));
const CancelBooking = lazy(() => import("./pages/CancelBooking"));
const GuidedToursBackoffice = lazy(() => import("./pages/GuidedToursBackoffice"));
const CulturalActivitiesBackoffice = lazy(() => import("./pages/CulturalActivitiesBackoffice"));
const PartnershipsBackofficePage = lazy(() => import("./pages/PartnershipsBackoffice"));
const ProgramContributionsBackofficePage = lazy(() => import("./pages/ProgramContributionsBackoffice"));
const CulturalActivitiesDashboard = lazy(() => import("./pages/cultural-activities/Dashboard"));
const CulturalActivitiesReservations = lazy(() => import("./pages/cultural-activities/Reservations"));
const CulturalActivitiesVisites = lazy(() => import("./pages/cultural-activities/Visites"));
const CulturalActivitiesPartenariats = lazy(() => import("./pages/cultural-activities/Partenariats"));
const CulturalActivitiesProgrammation = lazy(() => import("./pages/cultural-activities/Programmation"));
const CulturalActivitiesTemplates = lazy(() => import("./pages/cultural-activities/Templates"));
const CulturalSpacesManagement = lazy(() => import("./pages/CulturalSpacesManagement"));
const CulturalTariffsManagement = lazy(() => import("./pages/CulturalTariffsManagement"));
const LanguagesManagement = lazy(() => import("./pages/LanguagesManagement"));
const ActivityTypesManagement = lazy(() => import("./pages/ActivityTypesManagementPage"));
const SystemSettings = lazy(() => import("./pages/cultural-activities/SystemSettings"));
const GeneralCategories = lazy(() => import("./pages/cultural-activities/GeneralCategories"));
const SpaceGalleryPage = lazy(() => import("./pages/cultural-activities/SpaceGalleryPage"));

// Admin - Cookie Settings
const CookieSettingsPage = lazy(() => import("./pages/admin/CookieSettingsPage"));
const IntegrationsPage = lazy(() => import("./pages/admin/IntegrationsPage"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  // Synchronisation automatique des listes système au démarrage
  useAutoSync(true);
  
  return (
    <TooltipProvider>
      <LanguageProvider>
        <PerformanceOptimizer />
        <ScrollToTop />
        <Toaster />
        <Sonner />
        <Suspense fallback={<PageLoader />}>
          <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/manuscripts" element={<Manuscripts />} />
        <Route path="/manuscripts-platform" element={<ManuscriptsPlatform />} />
        <Route path="/plateforme-manuscrits" element={<ManuscriptsPlatform />} />
        <Route path="/manuscripts/search" element={<ManuscriptAdvancedSearch />} />
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
          <Route path="/practical-info" element={<PracticalInfo />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/wysiwyg" element={<WysiwygPage />} />
            <Route path="/admin/bnrm-tariffs" element={<BNRMTariffsPage />} />
            <Route path="/admin/wysiwyg" element={<WysiwygPage />} />
        <Route path="/tarifs-bnrm" element={<BNRMPortal />} />
        <Route path="/services-tarifs" element={<ServicesCatalog />} />
        <Route path="/admin/legal-deposit" element={<LegalDepositPage />} />
        <Route path="/form" element={<DynamicFormPage />} />
        <Route path="/admin/archiving" element={<ArchivingPage />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/cookie-settings" element={<CookieSettingsPage />} />
            <Route path="/admin/integrations" element={<IntegrationsPage />} />
        <Route path="/admin/form-builder" element={<FormBuilder />} />
          <Route path="/admin/import-form-fields" element={<ImportFormFields />} />
          <Route path="/admin/manage-section-fields" element={<ManageSectionFields />} />
        <Route path="/admin/cote-management" element={<CoteManagementPage />} />
        <Route path="/admin/bnrm-backoffice" element={<BNRMBackOffice />} />
        <Route path="/admin/reservations-ouvrages" element={<GestionReservationsOuvrages />} />
        <Route path="/admin/catalog-metadata" element={<CatalogMetadata />} />
        <Route path="/admin/reproduction" element={<ReproductionBackofficePage />} />
        <Route path="/admin/committee" element={<CommitteeDashboard />} />
        <Route path="/legal-deposit/approvals" element={<LegalDepositApprovals />} />
        <Route path="/depot-legal/approbations" element={<LegalDepositApprovals />} />
          <Route path="/digital-library" element={<DigitalLibraryHome />} />
          <Route path="/digital-library/collections" element={<Collections />} />
          <Route path="/digital-library/collections/:collectionId" element={<CollectionDetails />} />
          <Route path="/digital-library/document/:documentId" element={<DocumentDetails />} />
          <Route path="/digital-library/themes" element={<Themes />} />
          <Route path="/digital-library/themes/:themeId" element={<ThemeDetails />} />
          <Route path="/digital-library/search" element={<AdvancedSearch />} />
          <Route path="/digital-library/news" element={<NewsEvents />} />
          <Route path="/digital-library/news/:newsId" element={<NewsDetails />} />
          <Route path="/digital-library/help" element={<HelpFAQ />} />
          <Route path="/digital-library/my-space" element={<MySpace />} />
          <Route path="/digital-library/my-loans" element={<MyLoans />} />
          <Route path="/digital-library/my-notes" element={<MyNotes />} />
          <Route path="/digital-library/mes-reservations" element={<UserReservations />} />
          <Route path="/digital-library/mes-demandes-numerisation" element={<UserDigitizationRequests />} />
          <Route path="/digital-library/mes-demandes" element={<MyRequests />} />
          <Route path="/digital-library/account-settings" element={<AccountSettings />} />
          <Route path="/digital-library/book-reader/:id" element={<BookReader />} />
        <Route path="/reproduction" element={<ReproductionPage />} />
        <Route path="/reproduction/:action" element={<ReproductionPage />} />
        <Route path="/reproduction/details/:id" element={<ReproductionDetailsPage />} />
        <Route path="/demande-reproduction" element={<DemandeReproduction />} />
        <Route path="/demande-restauration" element={<RestorationRequest />} />
        <Route path="/demande-numerisation" element={<DemandeNumerisation />} />
        <Route path="/manuscripts" element={<Manuscripts />} />
        <Route path="/my-library-space" element={<MyLibrarySpace />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/aide" element={<HelpPage />} />
        <Route path="/admin/preservation" element={<PreservationPage />} />
          <Route path="/admin/digital-library" element={<DigitalLibraryAdministration />} />
          <Route path="/digital-library/admin" element={<DigitalLibraryAdministration />} />
          <Route path="/admin/digital-library/dashboard" element={<DigitalLibraryAdminDashboard />} />
          <Route path="/admin/digital-library/documents" element={<DigitalLibraryDocuments />} />
          <Route path="/admin/digital-library/users" element={<DigitalLibraryUsers />} />
          <Route path="/admin/digital-library/analytics" element={<DigitalLibraryAnalytics />} />
          <Route path="/admin/digital-library/exhibitions" element={<DigitalLibraryExhibitions />} />
          <Route path="/admin/digital-library/reproduction" element={<DigitalLibraryReproduction />} />
          <Route path="/admin/digital-library/restrictions" element={<DigitalLibraryRestrictions />} />
          <Route path="/admin/digital-library/copyright" element={<DigitalLibraryCopyright />} />
          <Route path="/admin/digital-library/bulk-import" element={<DigitalLibraryBulkImport />} />
          <Route path="/admin/digital-library-backoffice" element={<DigitalLibraryBackoffice />} />
          <Route path="/admin/digital-library/page-restrictions" element={<PageAccessRestrictionsBackoffice />} />
          <Route path="/admin/digital-library/settings" element={<DigitalLibraryAdminSettings />} />
          <Route path="/admin/digital-library/requests-management" element={<RequestsManagement />} />
          <Route path="/access-policies" element={<AccessPolicies />} />
          <Route path="/politiques-acces" element={<AccessPolicies />} />
          <Route path="/admin/professional-management" element={<ProfessionalManagement />} />
          <Route path="/professional-signup" element={<ProfessionalSignup />} />
          
          {/* CBM Portal Routes */}
          <Route path="/cbm" element={<CBMPortal />} />
          <Route path="/cbm/objectifs" element={<CBMObjectifs />} />
          <Route path="/cbm/plan-actions" element={<CBMPlanActions />} />
          <Route path="/cbm/organes-gestion" element={<CBMOrganesGestion />} />
          <Route path="/cbm/adhesion" element={<CBMAdhesion />} />
          <Route path="/cbm/recherche" element={<CBMRecherche />} />
          <Route path="/cbm/acces-rapide" element={<CBMAccesRapide />} />

          {/* CBN Routes */}
          <Route path="/cbm/catalogue" element={<CatalogueCBN />} />
          <Route path="/cbm/notice/:id" element={<NoticeDetaillee />} />
          <Route path="/cbm/recherche-avancee" element={<CBNRechercheAvancee />} />
          <Route path="/cbm/notice-example" element={<CBNNoticeExample />} />
          <Route path="/cbn/reserver-ouvrage" element={<BookReservationService />} />
          <Route path="/cbn/notice/:id" element={<NoticeDetail />} />
          <Route path="/cbn/notice-reproduction/:id" element={<NoticeDetailReproduction />} />
          <Route path="/user/book-reservations" element={<UserBookReservations />} />

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
          
          {/* Payment & Wallet Routes */}
          <Route path="/services-bnrm" element={<PaymentServices />} />
          <Route path="/services-paiement" element={<PaymentServices />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/portefeuille" element={<Wallet />} />
          <Route path="/e-wallet" element={<Wallet />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-canceled" element={<PaymentCanceled />} />
          
          {/* Cultural Activities Routes */}
          <Route path="/cultural-activities" element={<CulturalActivities />} />
          <Route path="/activites-culturelles" element={<CulturalActivities />} />
          <Route path="/cultural-activities/booking" element={<CulturalActivitiesBooking />} />
          <Route path="/activites-culturelles/reservation-espaces" element={<CulturalActivitiesBooking />} />
          <Route path="/cultural-activities-booking" element={<CulturalActivitiesBooking />} />
          <Route path="/reservation-activites-culturelles" element={<CulturalActivitiesBooking />} />
          <Route path="/cultural-activities/guided-tours" element={<CulturalActivitiesGuidedTours />} />
          <Route path="/activites-culturelles/visites" element={<CulturalActivitiesGuidedTours />} />
          <Route path="/cultural-activities/partnership" element={<CulturalActivitiesPartnership />} />
          <Route path="/activites-culturelles/partenariat" element={<CulturalActivitiesPartnership />} />
          <Route path="/activites-culturelles/partenariats" element={<CulturalActivitiesPartnership />} />
          <Route path="/cultural-activities/partnership/confirmation" element={<CulturalActivitiesPartnershipConfirmation />} />
          <Route path="/activites-culturelles/partenariat/confirmation" element={<CulturalActivitiesPartnershipConfirmation />} />
          <Route path="/activites-culturelles/partenariats/confirmation" element={<CulturalActivitiesPartnershipConfirmation />} />
          <Route path="/cultural-activities/programming" element={<CulturalActivitiesProgramming />} />
          <Route path="/activites-culturelles/participation" element={<CulturalActivitiesProgramming />} />
          <Route path="/activites-culturelles/participation/confirmation" element={<ProgramContributionConfirmation />} />
          <Route path="/cancel-booking" element={<CancelBooking />} />
          <Route path="/annuler-reservation" element={<CancelBooking />} />
          
          {/* Guided Tours Backoffice */}
          <Route path="/admin/guided-tours" element={<GuidedToursBackoffice />} />
          <Route path="/admin/visites-guidees" element={<GuidedToursBackoffice />} />
          <Route path="/admin/activites-culturelles" element={<CulturalActivitiesBackoffice />} />
          <Route path="/admin/activites-culturelles/dashboard" element={<CulturalActivitiesDashboard />} />
          <Route path="/admin/activites-culturelles/reservations" element={<CulturalActivitiesReservations />} />
          <Route path="/admin/activites-culturelles/visites" element={<CulturalActivitiesVisites />} />
          <Route path="/admin/activites-culturelles/partenariats" element={<CulturalActivitiesPartenariats />} />
          <Route path="/admin/activites-culturelles/programmation" element={<CulturalActivitiesProgrammation />} />
          <Route path="/admin/activites-culturelles/templates" element={<CulturalActivitiesTemplates />} />
          <Route path="/admin/activites-culturelles/espaces" element={<CulturalSpacesManagement />} />
          <Route path="/admin/activites-culturelles/tarifications" element={<CulturalTariffsManagement />} />
          <Route path="/admin/activites-culturelles/langues" element={<LanguagesManagement />} />
          <Route path="/admin/activites-culturelles/types-activites" element={<ActivityTypesManagement />} />
          <Route path="/admin/activites-culturelles/regles-systeme" element={<SystemSettings />} />
          <Route path="/admin/activites-culturelles/categories" element={<GeneralCategories />} />
          <Route path="/admin/activites-culturelles/galeries" element={<SpaceGalleryPage />} />
          <Route path="/admin/cultural-activities" element={<CulturalActivitiesBackoffice />} />
          <Route path="/admin/partenariats" element={<PartnershipsBackofficePage />} />
          <Route path="/admin/partnerships" element={<PartnershipsBackofficePage />} />
          <Route path="/admin/propositions-programmation" element={<ProgramContributionsBackofficePage />} />
          <Route path="/admin/program-contributions" element={<ProgramContributionsBackofficePage />} />

          {/* Translation Management */}
          <Route path="/admin/translations" element={<TranslationManagementPage />} />
          <Route path="/admin/traductions" element={<TranslationManagementPage />} />

          {/* Access Requests Management */}
          <Route path="/admin/access-requests" element={<AccessRequestsManagement />} />
          <Route path="/admin/demandes-acces" element={<AccessRequestsManagement />} />

          {/* Email Management */}
        <Route path="/admin/email-management" element={<EmailManagement />} />
        <Route path="/admin/gestion-emails" element={<EmailManagement />} />
        <Route path="/deposit-approvals" element={<DepositApprovals />} />
        <Route path="/approbations-depot" element={<DepositApprovals />} />

        {/* Workflow BPM */}
        <Route path="/admin/workflow-bpm" element={<WorkflowBPM />} />
        <Route path="/admin/moteur-workflows" element={<WorkflowBPM />} />

        {/* System Lists Management */}
        <Route path="/admin/system-lists" element={<SystemListsPage />} />
        <Route path="/admin/listes-systeme" element={<SystemListsPage />} />

        {/* Restoration Requests Management */}
        <Route path="/admin/restoration-requests" element={<RestorationRequests />} />
        <Route path="/bank-transfer-instructions" element={<BankTransferInstructions />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        <CookieBanner />
      </LanguageProvider>
    </TooltipProvider>
  );
};

export default App;
