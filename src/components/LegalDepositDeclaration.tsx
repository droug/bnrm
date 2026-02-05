import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InlineSelect } from "@/components/ui/inline-select";
import { SimpleEntitySelect } from "@/components/ui/simple-entity-select";
import { SimpleSelectWithTooltip } from "@/components/ui/simple-select-with-tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { DynamicHierarchicalSelect } from "@/components/ui/dynamic-hierarchical-select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, Clock, FileText, Upload, X, File, ArrowLeft, CalendarIcon, ExternalLink, Check, ChevronsUpDown, Save, Loader2 } from "lucide-react";
import { ScrollableDialog, ScrollableDialogNestedRoot, ScrollableDialogContent, ScrollableDialogHeader, ScrollableDialogTitle, ScrollableDialogDescription, ScrollableDialogFooter, ScrollableDialogBody } from "@/components/ui/scrollable-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useDynamicForm } from "@/hooks/useDynamicForm";
import { DynamicFieldRenderer } from "@/components/form-builder/DynamicFieldRenderer";
import { moroccanRegions, getCitiesByRegion } from "@/data/moroccanRegions";
import { bookDisciplines } from "@/data/bookDisciplines";
import { worldLanguages } from "@/data/worldLanguages";
import { worldCountries } from "@/data/worldCountries";
import { PhoneInput } from "@/components/ui/phone-input";
import { useSystemList } from "@/hooks/useSystemList";
import { useDependentList } from "@/hooks/useDependentList";
import { useLegalDepositStorage } from "@/hooks/useLegalDepositStorage";
import { DisciplineAutocomplete } from "@/components/ui/discipline-autocomplete";
import { LanguageAutocomplete } from "@/components/ui/language-autocomplete";
import { CountrySingleAutocomplete } from "@/components/ui/country-single-autocomplete";
import { NationalityMultiSelect } from "@/components/ui/nationality-multi-select";
import { PublisherAutocomplete } from "@/components/ui/publisher-autocomplete";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PrinterInlineForm } from "@/components/legal-deposit/PrinterInlineForm";
import { EditorInlineForm } from "@/components/legal-deposit/EditorInlineForm";
import { WatermarkContainer } from "@/components/ui/watermark";
import { MultipleAuthorsSection, Author, initializeAuthors } from "@/components/legal-deposit/MultipleAuthorsSection";

interface Publisher {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  publisher_type: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  google_maps_link: string | null;
}

interface Printer {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  google_maps_link: string | null;
}

interface Producer {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  google_maps_link: string | null;
}

interface Distributor {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  google_maps_link: string | null;
}

interface LegalDepositDeclarationProps {
  depositType: "monographie" | "periodique" | "bd_logiciels" | "collections_specialisees";
  onClose: () => void;
  initialUserType?: "editor" | "printer" | "producer";
  editId?: string | null;
}

export default function LegalDepositDeclaration({ depositType, onClose, initialUserType, editId }: LegalDepositDeclarationProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editIdFromUrl = editId || searchParams.get('edit');
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();
  const { uploadMultipleDocuments, uploading: uploadingDocuments } = useLegalDepositStorage();
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [existingRequestId, setExistingRequestId] = useState<string | null>(editIdFromUrl);
  
  // Charger les champs personnalisés - chercher aussi dans les versions non publiées en dev
  const { fields: customFields, loading: customFieldsLoading } = useDynamicForm({ 
    formKey: depositType === "monographie" ? "legal_deposit_monograph" : 
            depositType === "periodique" ? "legal_deposit_periodical" : 
            depositType === "bd_logiciels" ? "legal_deposit_bd_software" :
            depositType === "collections_specialisees" ? "legal_deposit_special_collections" :
            "",
    enabled: depositType === "monographie" || depositType === "periodique" || 
             depositType === "bd_logiciels" || depositType === "collections_specialisees"
  });

  // Debug: afficher les champs chargés
  useEffect(() => {
    if (customFields && customFields.length > 0) {
      console.log("Custom fields loaded:", customFields);
    }
  }, [customFields]);

  // Charger un brouillon existant si editId est fourni
  useEffect(() => {
    const loadDraft = async () => {
      if (!editIdFromUrl || !user) return;
      
      console.log('[DRAFT] Loading draft:', editIdFromUrl);
      
      try {
        const { data, error } = await supabase
          .from('legal_deposit_requests')
          .select('*')
          .eq('id', editIdFromUrl)
          .maybeSingle();

        if (error) {
          console.error('[DRAFT] Error loading draft:', error);
          toast.error('Erreur lors du chargement du brouillon');
          return;
        }

        if (!data) {
          console.log('[DRAFT] No draft found');
          toast.error('Brouillon introuvable');
          return;
        }

        console.log('[DRAFT] Draft loaded:', data);
        
        // Remplir les données du formulaire
        setFormData({
          title: data.title || '',
          subtitle: data.subtitle || '',
          author_name: data.author_name || '',
          language: data.language || '',
          page_count: data.page_count?.toString() || '',
          isbn: data.isbn || '',
          issn: data.issn || '',
          ismn: data.ismn || '',
          publication_date: data.publication_date || '',
          amazon_link: data.amazon_link || '',
          ...(typeof data.metadata === 'object' && data.metadata !== null ? data.metadata : {})
        });

        // Remplir les métadonnées
        const metadata = data.metadata as any || {};
        
        if (metadata.editor) setEditorData(metadata.editor);
        if (metadata.printer) setPrinterData(metadata.printer);
        if (metadata.publisher) setSelectedPublisher(metadata.publisher);
        if (metadata.publicationType) setPublicationType(metadata.publicationType);
        if (metadata.periodicity) setPeriodicity(metadata.periodicity);
        if (metadata.printRun) setPrintRun(metadata.printRun);
        if (metadata.supportType) setSupportType(metadata.supportType);
        if (metadata.customFields) setCustomFieldsData(metadata.customFields);
        if (metadata.authorGender) setAuthorGender(metadata.authorGender);
        if (metadata.editorIdentification) setEditorIdentification(metadata.editorIdentification);
        if (metadata.hasScale) setHasScale(metadata.hasScale);
        if (metadata.hasLegend) setHasLegend(metadata.hasLegend);
        if (metadata.collectionTitle) setCollectionTitle(metadata.collectionTitle);
        
        // Aller directement au formulaire
        setCurrentStep("form_filling");
        
        toast.success('Brouillon chargé');
      } catch (err) {
        console.error('[DRAFT] Error:', err);
        toast.error('Erreur lors du chargement');
      }
    };

    loadDraft();
  }, [editIdFromUrl, user]);
  
  const [customFieldsData, setCustomFieldsData] = useState<Record<string, any>>({});
  
  // Si un type initial est fourni, sauter directement à form_filling
  const [currentStep, setCurrentStep] = useState<"type_selection" | "editor_auth" | "printer_auth" | "form_filling" | "confirmation">(() => {
    if (initialUserType) {
      return "form_filling";
    }
    return "type_selection";
  });
  const [userType, setUserType] = useState<"editor" | "printer" | "producer" | "distributor" | null>(() => initialUserType || null);
  const [partnerConfirmed, setPartnerConfirmed] = useState(false);
  const [editorData, setEditorData] = useState<any>({});
  const [printerData, setPrinterData] = useState<any>({});
  const [producerData, setProducerData] = useState<any>({});
  const [distributorData, setDistributorData] = useState<any>({});
  const [formData, setFormData] = useState<any>({});
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [naturePublication, setNaturePublication] = useState<string>("");
  const [authorType, setAuthorType] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [authorGender, setAuthorGender] = useState<string>("");
  const [declarationNature, setDeclarationNature] = useState<string>("");
  const [authors, setAuthors] = useState<Author[]>(initializeAuthors());
  const [authorStatus, setAuthorStatus] = useState<string>("");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("");
  const [disciplineSearch, setDisciplineSearch] = useState<string>("");
  const [showDisciplineDropdown, setShowDisciplineDropdown] = useState<boolean>(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [languageSearch, setLanguageSearch] = useState<string>("");
  const [multipleVolumes, setMultipleVolumes] = useState<string>("");
  const [totalVolumes, setTotalVolumes] = useState<string>("");
  const [numberOfVolumes, setNumberOfVolumes] = useState<string>("");
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [publisherSearch, setPublisherSearch] = useState<string>("");
  const [publisherNature, setPublisherNature] = useState<string>("");
  const [editorIdentification, setEditorIdentification] = useState<string>("");
  const [selectedPublisher, setSelectedPublisher] = useState<Publisher | null>(null);
  const [showEditorInlineForm, setShowEditorInlineForm] = useState(false);
  const [publicationDate, setPublicationDate] = useState<Date>();
  const [publicationDateInput, setPublicationDateInput] = useState<string>("");
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [publicationType, setPublicationType] = useState<string>("");
  const [publicationTypeOther, setPublicationTypeOther] = useState<string>("");
  const [publicationTypes, setPublicationTypes] = useState<Array<{code: string, label: string}>>([]);
  const [authorPseudonym, setAuthorPseudonym] = useState<string>("");
  const [isPeriodic, setIsPeriodic] = useState<string>("");
  const [disciplineInput, setDisciplineInput] = useState<string>("");
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [specialCollectionPublicationType, setSpecialCollectionPublicationType] = useState<string>("");
  const [specialCollectionPublicationTypeOther, setSpecialCollectionPublicationTypeOther] = useState<string>("");
  const [hasScale, setHasScale] = useState<string>("");
  const [hasLegend, setHasLegend] = useState<string>("");
  const [collectionTitle, setCollectionTitle] = useState<string>("");
  const [periodicity, setPeriodicity] = useState<string>("");
  const [printRun, setPrintRun] = useState<string>("");
  const [supportType, setSupportType] = useState<string>("");
  const [targetAudience, setTargetAudience] = useState<string>("");
  const [targetAudienceOther, setTargetAudienceOther] = useState<string>("");
  const [directorType, setDirectorType] = useState<string>("");
  const [directorGender, setDirectorGender] = useState<string>("");
  const [directorPseudonym, setDirectorPseudonym] = useState<string>("");
  const [otherNationalityValue, setOtherNationalityValue] = useState<string>("");



  // Load disciplines based on publication type using dependent list hook
  const { values: disciplineValues, loading: disciplinesLoading } = useDependentList({
    listCode: 'bd_discipline',
    parentListCode: 'bd_type_publication',
    parentSelectedValue: publicationType,
    enabled: depositType === 'bd_logiciels' && !!publicationType
  });
  const [isIssnModalOpen, setIsIssnModalOpen] = useState(false);
  const [issnSubmitted, setIssnSubmitted] = useState(false);
  const [issnFormData, setIssnFormData] = useState({
    title: "",
    discipline: "",
    language: "",
    country: "",
    publisher: "",
    support: "",
    frequency: "",
    contactAddress: "",
    justificationFile: null as File | null
  });
  const [printerCountry, setPrinterCountry] = useState<string>("");
  const [openPrinterCountry, setOpenPrinterCountry] = useState(false);
  const [directorRegion, setDirectorRegion] = useState<string>("");
  const [directorCity, setDirectorCity] = useState<string>("");
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [printerSearch, setPrinterSearch] = useState<string>("");
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [showPrinterInlineForm, setShowPrinterInlineForm] = useState(false);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [producerSearch, setProducerSearch] = useState<string>("");
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [distributorSearch, setDistributorSearch] = useState<string>("");
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);

  // Load system lists for Publications Périodiques
  const { options: publicationTypePeriodicalOptions } = useSystemList('period_type_publication');

  // Fetch publication types from database
  useEffect(() => {
    const fetchPublicationTypes = async () => {
      const { data: listData, error: listError } = await supabase
        .from('system_lists')
        .select('id')
        .eq('list_code', 'TYPE_PUBLICATION')
        .single();
      
      if (listError) {
        console.error('Error fetching publication types list:', listError);
        return;
      }

      const { data, error } = await supabase
        .from('system_list_values')
        .select('value_code, value_label')
        .eq('list_id', listData.id)
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) {
        console.error('Error fetching publication types:', error);
      } else {
        setPublicationTypes(data?.map(v => ({ code: v.value_code, label: v.value_label })) || []);
      }
    };

    fetchPublicationTypes();
  }, []);

  // Fetch publishers from database (static table + approved professionals)
  useEffect(() => {
    const fetchPublishers = async () => {
      // Fetch from static publishers table - only validated and non-deleted
      const { data: staticData, error: staticError } = await supabase
        .from('publishers')
        .select('id, name, city, country, publisher_type, address, phone, email, google_maps_link')
        .eq('is_validated', true)
        .is('deleted_at', null)
        .order('name');
      
      // Fetch approved editors from professional_registration_requests
      const { data: approvedData, error: approvedError } = await supabase
        .from('professional_registration_requests')
        .select('id, company_name, registration_data')
        .eq('professional_type', 'editor')
        .eq('status', 'approved');
      
      if (staticError) {
        console.error('Error fetching publishers:', staticError);
      }
      if (approvedError) {
        console.error('Error fetching approved editors:', approvedError);
      }
      
      // Merge static publishers with approved professionals
      const staticPublishers: Publisher[] = (staticData || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        city: p.city,
        country: p.country,
        publisher_type: p.publisher_type,
        address: p.address,
        phone: p.phone,
        email: p.email,
        google_maps_link: p.google_maps_link
      }));
      
      const approvedPublishers: Publisher[] = (approvedData || []).map((p: any) => ({
        id: p.id,
        name: p.company_name || 'Éditeur inconnu',
        city: p.registration_data?.city || null,
        country: p.registration_data?.country || 'Maroc',
        publisher_type: null,
        address: p.registration_data?.address || null,
        phone: p.registration_data?.phone || null,
        email: p.registration_data?.email || null,
        google_maps_link: null
      }));
      
      // Combine and deduplicate by name (case insensitive)
      const allPublishers = [...staticPublishers, ...approvedPublishers];
      const uniquePublishers = allPublishers.reduce((acc: Publisher[], current) => {
        const exists = acc.find(p => p.name.toLowerCase() === current.name.toLowerCase());
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      uniquePublishers.sort((a, b) => a.name.localeCompare(b.name));
      setPublishers(uniquePublishers);
    };

    const fetchPrinters = async () => {
      // Fetch from static printers table - only validated and non-deleted
      const { data: staticData, error: staticError } = await supabase
        .from('printers')
        .select('id, name, city, country, address, phone, email, google_maps_link')
        .eq('is_validated', true)
        .is('deleted_at', null)
        .order('name');
      
      // Fetch approved printers from professional_registration_requests
      const { data: approvedData, error: approvedError } = await supabase
        .from('professional_registration_requests')
        .select('id, company_name, registration_data')
        .eq('professional_type', 'printer')
        .eq('status', 'approved');
      
      if (staticError) {
        console.error('Error fetching printers:', staticError);
      }
      if (approvedError) {
        console.error('Error fetching approved printers:', approvedError);
      }
      
      // Merge static printers with approved professionals
      const staticPrinters: Printer[] = (staticData || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        city: p.city,
        country: p.country,
        address: p.address,
        phone: p.phone,
        email: p.email,
        google_maps_link: p.google_maps_link
      }));
      
      const approvedPrinters: Printer[] = (approvedData || []).map((p: any) => ({
        id: p.id,
        name: p.company_name || 'Imprimeur inconnu',
        city: p.registration_data?.city || null,
        country: p.registration_data?.country || 'Maroc',
        address: p.registration_data?.address || null,
        phone: p.registration_data?.phone || null,
        email: p.registration_data?.email || null,
        google_maps_link: null
      }));
      
      // Combine and deduplicate by name (case insensitive)
      const allPrinters = [...staticPrinters, ...approvedPrinters];
      const uniquePrinters = allPrinters.reduce((acc: Printer[], current) => {
        const exists = acc.find(p => p.name.toLowerCase() === current.name.toLowerCase());
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      uniquePrinters.sort((a, b) => a.name.localeCompare(b.name));
      setPrinters(uniquePrinters);
    };

    const fetchProducers = async () => {
      // Fetch from static producers table
      const { data: staticData, error: staticError } = await supabase
        .from('producers')
        .select('id, name, address, city, country, phone, email, google_maps_link')
        .order('name');
      
      // Fetch approved producers from professional_registration_requests
      const { data: approvedData, error: approvedError } = await supabase
        .from('professional_registration_requests')
        .select('id, company_name, registration_data')
        .eq('professional_type', 'producer')
        .eq('status', 'approved');
      
      if (staticError) {
        console.error('Error fetching producers:', staticError);
      }
      if (approvedError) {
        console.error('Error fetching approved producers:', approvedError);
      }
      
      const staticProducers: Producer[] = (staticData || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        address: p.address,
        city: p.city,
        country: p.country,
        phone: p.phone,
        email: p.email,
        google_maps_link: p.google_maps_link
      }));
      
      const approvedProducers: Producer[] = (approvedData || []).map((p: any) => ({
        id: p.id,
        name: p.company_name || 'Producteur inconnu',
        address: p.registration_data?.address || null,
        city: p.registration_data?.city || null,
        country: p.registration_data?.country || 'Maroc',
        phone: p.registration_data?.phone || null,
        email: p.registration_data?.email || null,
        google_maps_link: null
      }));
      
      const allProducers = [...staticProducers, ...approvedProducers];
      const uniqueProducers = allProducers.reduce((acc: Producer[], current) => {
        const exists = acc.find(p => p.name.toLowerCase() === current.name.toLowerCase());
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      uniqueProducers.sort((a, b) => a.name.localeCompare(b.name));
      setProducers(uniqueProducers);
    };

    const fetchDistributors = async () => {
      // Fetch from static distributors table
      const { data: staticData, error: staticError } = await supabase
        .from('distributors')
        .select('id, name, address, city, country, phone, email, google_maps_link')
        .order('name');
      
      // Fetch approved distributors from professional_registration_requests
      const { data: approvedData, error: approvedError } = await supabase
        .from('professional_registration_requests')
        .select('id, company_name, registration_data')
        .eq('professional_type', 'distributor')
        .eq('status', 'approved');
      
      if (staticError) {
        console.error('Error fetching distributors:', staticError);
      }
      if (approvedError) {
        console.error('Error fetching approved distributors:', approvedError);
      }
      
      const staticDistributors: Distributor[] = (staticData || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        address: p.address,
        city: p.city,
        country: p.country,
        phone: p.phone,
        email: p.email,
        google_maps_link: p.google_maps_link
      }));
      
      const approvedDistributors: Distributor[] = (approvedData || []).map((p: any) => ({
        id: p.id,
        name: p.company_name || 'Distributeur inconnu',
        address: p.registration_data?.address || null,
        city: p.registration_data?.city || null,
        country: p.registration_data?.country || 'Maroc',
        phone: p.registration_data?.phone || null,
        email: p.registration_data?.email || null,
        google_maps_link: null
      }));
      
      const allDistributors = [...staticDistributors, ...approvedDistributors];
      const uniqueDistributors = allDistributors.reduce((acc: Distributor[], current) => {
        const exists = acc.find(p => p.name.toLowerCase() === current.name.toLowerCase());
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      uniqueDistributors.sort((a, b) => a.name.localeCompare(b.name));
      setDistributors(uniqueDistributors);
    };

    fetchPublishers();
    fetchPrinters();
    fetchProducers();
    fetchDistributors();
  }, []);

  // Auto-fill publisher if user is logged in as an approved editor
  useEffect(() => {
    const autoFillPublisher = async () => {
      if (!user || initialUserType !== 'editor' || selectedPublisher) return;
      
      console.log('[AutoFill Editor] Checking for user:', user.id, 'email:', user.email);
      
      // 1. First check in professional_registry (verified professionals)
      const { data: registryData, error: registryError } = await supabase
        .from('professional_registry')
        .select('*')
        .eq('user_id', user.id)
        .eq('professional_type', 'editeur')
        .eq('is_verified', true)
        .maybeSingle();
      
      if (registryError) {
        console.error('[AutoFill Editor] Registry error:', registryError);
      }
      
      if (registryData) {
        console.log('[AutoFill Editor] Found in professional_registry:', registryData.company_name);
        const autoPublisher: Publisher = {
          id: registryData.id,
          name: registryData.company_name || 'Mon entreprise',
          city: registryData.city || null,
          country: 'Maroc',
          publisher_type: null,
          address: registryData.address || null,
          phone: registryData.phone || null,
          email: registryData.email || null,
          google_maps_link: null
        };
        setSelectedPublisher(autoPublisher);
        setEditorData({
          name: autoPublisher.name,
          email: autoPublisher.email,
          city: autoPublisher.city,
          country: autoPublisher.country
        });
        return;
      }
      
      // 2. Check if user is an approved editor in registration requests
      const { data: editorRequest, error: requestError } = await supabase
        .from('professional_registration_requests')
        .select('id, company_name, registration_data')
        .eq('user_id', user.id)
        .eq('professional_type', 'editor')
        .eq('status', 'approved')
        .maybeSingle();
      
      if (requestError) {
        console.error('[AutoFill Editor] Request error:', requestError);
      }
      
      if (editorRequest) {
        console.log('[AutoFill Editor] Found in professional_registration_requests:', editorRequest.company_name);
        const regData = editorRequest.registration_data as Record<string, any> | null;
        const autoPublisher: Publisher = {
          id: editorRequest.id,
          name: editorRequest.company_name || 'Mon entreprise',
          city: regData?.city || null,
          country: regData?.country || 'Maroc',
          publisher_type: regData?.type || null,
          address: regData?.address || null,
          phone: regData?.phone || null,
          email: regData?.email || null,
          google_maps_link: regData?.google_maps_link || null
        };
        setSelectedPublisher(autoPublisher);
        setEditorData({
          name: autoPublisher.name,
          email: autoPublisher.email,
          city: autoPublisher.city,
          country: autoPublisher.country
        });
        return;
      }
      
      // 3. Also check in publishers table (synced from approve-professional)
      const { data: publisherData, error: publisherError } = await supabase
        .from('publishers')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();
      
      if (publisherError) {
        console.error('[AutoFill Editor] Publisher error:', publisherError);
      }
      
      if (publisherData) {
        console.log('[AutoFill Editor] Found in publishers table:', publisherData.name);
        const autoPublisher: Publisher = {
          id: publisherData.id,
          name: publisherData.name,
          city: publisherData.city,
          country: publisherData.country,
          publisher_type: publisherData.publisher_type,
          address: publisherData.address,
          phone: publisherData.phone,
          email: publisherData.email,
          google_maps_link: publisherData.google_maps_link
        };
        setSelectedPublisher(autoPublisher);
        setEditorData({
          name: autoPublisher.name,
          email: autoPublisher.email,
          city: autoPublisher.city,
          country: autoPublisher.country
        });
        return;
      }
      
      console.log('[AutoFill Editor] No editor record found for user');
    };
    
    autoFillPublisher();
  }, [user, initialUserType, selectedPublisher]);

  // Auto-fill printer if user is logged in as an approved printer
  useEffect(() => {
    const autoFillPrinter = async () => {
      if (!user || initialUserType !== 'printer' || selectedPrinter) return;
      
      console.log('[AutoFill Printer] Checking for user:', user.id, 'email:', user.email);
      
      // 1. First check in professional_registry (verified professionals)
      const { data: registryData, error: registryError } = await supabase
        .from('professional_registry')
        .select('*')
        .eq('user_id', user.id)
        .eq('professional_type', 'imprimeur')
        .eq('is_verified', true)
        .maybeSingle();
      
      if (registryError) {
        console.error('[AutoFill Printer] Registry error:', registryError);
      }
      
      if (registryData) {
        console.log('[AutoFill Printer] Found in professional_registry:', registryData.company_name);
        const autoPrinter: Printer = {
          id: registryData.id,
          name: registryData.company_name || 'Mon imprimerie',
          city: registryData.city || null,
          country: 'Maroc',
          address: registryData.address || null,
          phone: registryData.phone || null,
          email: registryData.email || null,
          google_maps_link: null
        };
        setSelectedPrinter(autoPrinter);
        setPrinterData({
          name: autoPrinter.name,
          email: autoPrinter.email,
          city: autoPrinter.city,
          country: autoPrinter.country
        });
        return;
      }
      
      // 2. Check if user is an approved printer in registration requests
      const { data: printerRequest, error: requestError } = await supabase
        .from('professional_registration_requests')
        .select('id, company_name, registration_data')
        .eq('user_id', user.id)
        .eq('professional_type', 'printer')
        .eq('status', 'approved')
        .maybeSingle();
      
      if (requestError) {
        console.error('[AutoFill Printer] Request error:', requestError);
      }
      
      if (printerRequest) {
        console.log('[AutoFill Printer] Found in professional_registration_requests:', printerRequest.company_name);
        const regData = printerRequest.registration_data as Record<string, any> | null;
        const autoPrinter: Printer = {
          id: printerRequest.id,
          name: printerRequest.company_name || 'Mon imprimerie',
          city: regData?.city || null,
          country: regData?.country || 'Maroc',
          address: regData?.address || null,
          phone: regData?.phone || null,
          email: regData?.email || null,
          google_maps_link: regData?.google_maps_link || null
        };
        setSelectedPrinter(autoPrinter);
        setPrinterData({
          name: autoPrinter.name,
          email: autoPrinter.email,
          city: autoPrinter.city,
          country: autoPrinter.country
        });
        return;
      }
      
      // 3. Also check in printers table (synced from approve-professional)
      const { data: printerTableData, error: printerError } = await supabase
        .from('printers')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();
      
      if (printerError) {
        console.error('[AutoFill Printer] Printers table error:', printerError);
      }
      
      if (printerTableData) {
        console.log('[AutoFill Printer] Found in printers table:', printerTableData.name);
        const autoPrinter: Printer = {
          id: printerTableData.id,
          name: printerTableData.name,
          city: printerTableData.city,
          country: printerTableData.country,
          address: printerTableData.address,
          phone: printerTableData.phone,
          email: printerTableData.email,
          google_maps_link: printerTableData.google_maps_link
        };
        setSelectedPrinter(autoPrinter);
        setPrinterData({
          name: autoPrinter.name,
          email: autoPrinter.email,
          city: autoPrinter.city,
          country: autoPrinter.country
        });
        return;
      }
      
      console.log('[AutoFill Printer] No printer record found for user');
    };
    
    autoFillPrinter();
  }, [user, initialUserType, selectedPrinter]);

  const depositTypeLabels = {
    monographie: "Monographies",
    periodique: "Publications Périodiques",
    bd_logiciels: "Bases de données, Logiciels et Documents audiovisuels",
    collections_specialisees: "Collections spécialisées"
  };

  const handleFileUpload = (documentType: string, file: File | null) => {
    if (!file) return;

    // Validate file type and size - All documents accept PDF, JPG, JPEG, PNG up to 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB for all documents

    if (!allowedTypes.includes(file.type)) {
      toast.error(`Type de fichier non autorisé. Types acceptés: PDF, JPG, JPEG, PNG`);
      return;
    }

    if (file.size > maxSize) {
      toast.error(`Fichier trop volumineux. Taille maximum: 10 Mo`);
      return;
    }

    setUploadedFiles(prev => ({
      ...prev,
      [documentType]: file
    }));

    toast.success(`Fichier "${file.name}" ajouté avec succès`);
  };

  const handleRemoveFile = (documentType: string) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[documentType];
      return newFiles;
    });

    // Reset the file input
    if (fileInputRefs.current[documentType]) {
      fileInputRefs.current[documentType]!.value = '';
    }

    toast.success("Fichier supprimé");
  };

  const renderFileUpload = (documentType: string, label: string, required: boolean = false, acceptedTypes: string = "*") => {
    const uploadedFile = uploadedFiles[documentType];

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={documentType} 
              checked={!!uploadedFile}
              disabled={!!uploadedFile}
            />
            <Label htmlFor={documentType} className={required ? "font-medium" : ""}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
          </div>
          {!uploadedFile && (
            <div>
              <input
                ref={(el) => {
                  if (el) fileInputRefs.current[documentType] = el;
                }}
                type="file"
                accept={acceptedTypes}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(documentType, file);
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRefs.current[documentType]?.click()}
                className="text-xs"
              >
                <Upload className="w-3 h-3 mr-1" />
                {language === 'ar' ? 'اختيار ملف' : 'Choisir fichier'}
              </Button>
            </div>
          )}
        </div>
        
        {uploadedFile && (
          <div className="flex items-center justify-between bg-green-50 p-2 rounded border border-green-200">
            <div className="flex items-center space-x-2 text-sm text-green-700">
              <File className="w-4 h-4" />
              <span className="truncate max-w-[200px]">{uploadedFile.name}</span>
              <span className="text-xs text-green-600">
                ({Math.round(uploadedFile.size / 1024)}KB)
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveFile(documentType)}
              className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  const handleIssnSubmit = async () => {
    // Validation
    if (!issnFormData.title || !issnFormData.discipline || !issnFormData.language || 
        !issnFormData.country || !issnFormData.publisher || !issnFormData.support || 
        !issnFormData.frequency || !issnFormData.contactAddress) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!user) {
      toast.error("Vous devez être connecté pour soumettre une demande ISSN");
      return;
    }

    try {
      const { error } = await supabase.from('issn_requests').insert({
        title: issnFormData.title,
        discipline: issnFormData.discipline,
        language_code: issnFormData.language,
        country_code: issnFormData.country,
        publisher: issnFormData.publisher,
        support: issnFormData.support,
        frequency: issnFormData.frequency,
        contact_address: issnFormData.contactAddress,
        user_id: user.id,
        requester_email: user.email
      });

      if (error) throw error;

      setIssnSubmitted(true);
      setIsIssnModalOpen(false);
      toast.success("✅ Demande ISSN effectuée avec succès");
    } catch (error) {
      console.error("Error submitting ISSN request:", error);
      toast.error("Erreur lors de la soumission de la demande ISSN");
    }
  };

  const renderFrenchForm = () => {
    const renderFormsByType = () => {
      if (depositType === "monographie") {
        return (
          <>
            {/* Identification de l'auteur - avec support multi-auteurs */}
            <MultipleAuthorsSection
              authors={authors}
              onAuthorsChange={setAuthors}
              customFields={customFields}
              language={language}
              maxAuthors={10}
            />

            <Separator />

            {/* Identification de la publication */}
            <div>
              <h3 className="text-2xl font-semibold mb-4">Identification de la publication</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Titre de l'ouvrage <span className="text-destructive">*</span></Label>
                  <Input 
                    placeholder="Titre de l'ouvrage" 
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Titre parallèle</Label>
                  <Input 
                    placeholder="Titre parallèle (titre dans une autre langue)" 
                    value={formData.parallelTitle || ""}
                    onChange={(e) => setFormData({ ...formData, parallelTitle: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Discipline de l'ouvrage</Label>
                  <div className="relative">
                    <Input
                      placeholder="Rechercher une discipline..."
                      value={disciplineSearch}
                      onChange={(e) => {
                        setDisciplineSearch(e.target.value);
                        setShowDisciplineDropdown(true);
                      }}
                      onFocus={() => setShowDisciplineDropdown(true)}
                      onBlur={() => {
                        // Delay to allow click on dropdown items
                        setTimeout(() => setShowDisciplineDropdown(false), 200);
                      }}
                      className="pr-10"
                    />
                    {showDisciplineDropdown && disciplineSearch && (
                      <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
                        {bookDisciplines
                          .flatMap(domain => 
                            domain.children
                              .filter(subdiscipline => 
                                domain.label.toLowerCase().includes(disciplineSearch.toLowerCase()) ||
                                subdiscipline.toLowerCase().includes(disciplineSearch.toLowerCase())
                              )
                              .map(subdiscipline => ({
                                domain: domain.label,
                                subdiscipline
                              }))
                          )
                          .map((item, index) => (
                            <button
                              key={index}
                              type="button"
                              className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                              onMouseDown={(e) => {
                                e.preventDefault(); // Prevent blur
                                const fullDiscipline = `${item.domain} → ${item.subdiscipline}`;
                                setSelectedDiscipline(fullDiscipline);
                                setDisciplineSearch(fullDiscipline);
                                setShowDisciplineDropdown(false);
                              }}
                            >
                              <div className="text-sm font-medium text-muted-foreground">
                                {item.domain}
                              </div>
                              <div className="text-base">
                                {item.subdiscipline}
                              </div>
                            </button>
                          ))}
                        {bookDisciplines
                          .flatMap(domain => 
                            domain.children
                              .filter(subdiscipline => 
                                domain.label.toLowerCase().includes(disciplineSearch.toLowerCase()) ||
                                subdiscipline.toLowerCase().includes(disciplineSearch.toLowerCase())
                              )
                          ).length === 0 && (
                            <div className="px-4 py-2 text-sm text-muted-foreground">
                              Aucune discipline trouvée
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                  {selectedDiscipline && (
                    <p className="text-sm text-muted-foreground">
                      Discipline sélectionnée : <span className="font-medium">{selectedDiscipline}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Type de support</Label>
                  <InlineSelect
                    value={supportType}
                    onChange={setSupportType}
                    placeholder="Sélectionner le type"
                    options={[
                      { value: "printed", label: "Imprimé" },
                      { value: "electronic", label: "Électronique" },
                    ]}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type de publication <span className="text-destructive">*</span></Label>
                  <InlineSelect
                    placeholder="Sélectionner le type de publication"
                    value={publicationType}
                    onChange={(value) => {
                      setPublicationType(value);
                      if (value !== "autre") {
                        setPublicationTypeOther("");
                      }
                    }}
                    options={[
                      { value: "coran", label: "Coran" },
                      { value: "traduction", label: "Traduction" },
                      ...publicationTypes
                        .filter(t => t.code.toLowerCase() !== "coran" && t.code.toLowerCase() !== "traduction")
                        .map(t => ({ value: t.code, label: t.label })),
                      { value: "autre", label: "Autre" }
                    ]}
                  />
                </div>

                {publicationType === "autre" && (
                  <div className="space-y-2 animate-fade-in">
                    <Label>Préciser le type de publication <span className="text-destructive">*</span></Label>
                    <Input 
                      placeholder="Saisir le type de publication"
                      value={publicationTypeOther}
                      onChange={(e) => setPublicationTypeOther(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Public ciblé</Label>
                  <InlineSelect
                    value={targetAudience}
                    onChange={setTargetAudience}
                    placeholder="Sélectionner le public ciblé"
                    options={[
                      { value: "general", label: "Grand public" },
                      { value: "children", label: "Enfants (6-12 ans)" },
                      { value: "teens", label: "Adolescents (13-17 ans)" },
                      { value: "adults", label: "Adultes" },
                      { value: "academic", label: "Académique/Universitaire" },
                      { value: "professional", label: "Professionnel" },
                      { value: "specialized", label: "Spécialisé" },
                      { value: "other", label: "Autre" },
                    ]}
                  />
                </div>

                {targetAudience === "other" && (
                  <div className="space-y-2">
                    <Label>Préciser le public ciblé</Label>
                    <Input 
                      placeholder="Saisir le public ciblé" 
                      value={targetAudienceOther}
                      onChange={(e) => setTargetAudienceOther(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Titre de la collection</Label>
                  <Input 
                    placeholder="Titre de la collection"
                    value={collectionTitle}
                    onChange={(e) => setCollectionTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Périodicité</Label>
                  <InlineSelect
                    placeholder="Sélectionner"
                    value={isPeriodic}
                    onChange={(value) => {
                      setIsPeriodic(value);
                      if (value === "no") {
                        setIssnSubmitted(false);
                      }
                    }}
                    options={[
                      { value: "yes", label: "Oui" },
                      { value: "no", label: "Non" },
                    ]}
                  />
                </div>

                {isPeriodic === "yes" && (
                  <>
                    <div className="space-y-2 animate-fade-in">
                      <Label>N° ISSN</Label>
                      <Input 
                        placeholder="Saisir le N° ISSN"
                        value={formData.issnNumber || ""}
                        onChange={(e) => setFormData({ ...formData, issnNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 animate-fade-in md:col-span-2">
                      <Label className="mb-1">Demande ISSN</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsIssnModalOpen(true)}
                        disabled={issnSubmitted}
                        className="w-full md:w-auto"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Lien vers Formulaire ISSN
                      </Button>
                      {issnSubmitted && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          Demande ISSN effectuée
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Présence de matériel d'accompagnement <span className="text-destructive">*</span></Label>
                  <InlineSelect
                    placeholder="Sélectionner"
                    value={formData.hasAccompanyingMaterial || ""}
                    onChange={(value) => {
                      setFormData({ 
                        ...formData, 
                        hasAccompanyingMaterial: value,
                        accompanyingMaterialType: value === "no" ? "" : formData.accompanyingMaterialType
                      });
                    }}
                    options={[
                      { value: "yes", label: "Oui" },
                      { value: "no", label: "Non" },
                    ]}
                  />
                </div>

                {formData.hasAccompanyingMaterial === "yes" && (
                  <div className="space-y-2 animate-fade-in">
                    <Label>Type de matériel d'accompagnement <span className="text-destructive">*</span></Label>
                    <InlineSelect
                      placeholder="Sélectionner le type"
                      value={formData.accompanyingMaterialType || ""}
                      onChange={(value) => setFormData({ ...formData, accompanyingMaterialType: value })}
                      options={[
                        { value: "cd", label: "CD" },
                        { value: "usb", label: "Clé USB" },
                        { value: "sd", label: "Carte SD" },
                        { value: "other", label: "Autre" },
                      ]}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Numéro dans la collection</Label>
                  <Input placeholder="Numéro dans la collection" />
                </div>

                <div className="space-y-2">
                  <Label>Langue</Label>
                  <div className="relative">
                    <Input
                      placeholder="Rechercher et sélectionner des langues..."
                      value={languageSearch}
                      onChange={(e) => setLanguageSearch(e.target.value)}
                      className="pr-10"
                    />
                    {languageSearch && (
                      <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
                        {worldLanguages
                          .filter(lang => 
                            lang.name.toLowerCase().includes(languageSearch.toLowerCase())
                          )
                          .map((lang) => (
                            <button
                              key={lang.code}
                              type="button"
                              className="w-full text-left px-4 py-2 hover:bg-accent transition-colors flex items-center justify-between"
                              onClick={() => {
                                if (!selectedLanguages.includes(lang.name)) {
                                  setSelectedLanguages([...selectedLanguages, lang.name]);
                                }
                                setLanguageSearch("");
                              }}
                            >
                              <span>{lang.name}</span>
                              {selectedLanguages.includes(lang.name) && (
                                <span className="text-primary">✓</span>
                              )}
                            </button>
                          ))}
                        {worldLanguages.filter(lang => 
                          lang.name.toLowerCase().includes(languageSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-2 text-sm text-muted-foreground">
                            Aucune langue trouvée
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {selectedLanguages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedLanguages.map((lang, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {lang}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLanguages(selectedLanguages.filter((_, i) => i !== index));
                            }}
                            className="hover:text-primary/80"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Publication en plusieurs volumes</Label>
                  <InlineSelect
                    placeholder="Sélectionner"
                    value={multipleVolumes}
                    onChange={setMultipleVolumes}
                    options={[
                      { value: "yes", label: "Oui" },
                      { value: "no", label: "Non" },
                    ]}
                  />
                </div>

                {multipleVolumes === "yes" && (
                  <>
                    <div className="space-y-2 animate-fade-in">
                      <Label>Nombre de volumes</Label>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="Nombre total de volumes" 
                        value={totalVolumes}
                        onChange={(e) => setTotalVolumes(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 animate-fade-in">
                      <Label>Numéro du volume</Label>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="Numéro du volume" 
                        value={numberOfVolumes}
                        onChange={(e) => setNumberOfVolumes(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Nombre de pages</Label>
                  <Input type="number" placeholder="Nombre de pages" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Identification de l'Éditeur */}
            <div>
              <h3 className="text-2xl font-semibold mb-4">Identification de l'Éditeur</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Éditeur <span className="text-destructive">*</span></Label>
                  {!selectedPublisher ? (
                    <div className="relative">
                      <Input
                        placeholder="Rechercher un éditeur..."
                        value={publisherSearch}
                        onChange={(e) => setPublisherSearch(e.target.value)}
                        className="pr-10"
                      />
                      {publisherSearch && (
                        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
                          {publishers
                            .filter(pub => 
                              pub.name.toLowerCase().includes(publisherSearch.toLowerCase())
                            )
                            .map((pub) => (
                              <button
                                key={pub.id}
                                type="button"
                                className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                                onClick={() => {
                                  setSelectedPublisher(pub);
                                  setPublisherSearch('');
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{pub.name}</span>
                                  {pub.city && (
                                    <span className="text-sm text-muted-foreground">
                                      {pub.city}, {pub.country}
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))}
                          {publishers.filter(pub => 
                            pub.name.toLowerCase().includes(publisherSearch.toLowerCase())
                          ).length === 0 && !showEditorInlineForm && (
                            <div className="px-4 py-3">
                              <div className="text-sm text-muted-foreground mb-2">
                                Aucun éditeur trouvé
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => setShowEditorInlineForm(true)}
                              >
                                + Ajouter un éditeur avec invitation
                              </Button>
                            </div>
                          )}
                          {showEditorInlineForm && (
                            <EditorInlineForm
                              initialName={publisherSearch}
                              onEditorAdded={(editor) => {
                                setPublishers([...publishers, editor]);
                                setSelectedPublisher(editor);
                                setPublisherSearch('');
                                setShowEditorInlineForm(false);
                              }}
                              onCancel={() => setShowEditorInlineForm(false)}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-primary/10 rounded-md flex justify-between items-start">
                      <div>
                        <p className="font-medium">{selectedPublisher.name}</p>
                        {selectedPublisher.city && (
                          <p className="text-sm text-muted-foreground">
                            {selectedPublisher.city}, {selectedPublisher.country}
                          </p>
                        )}
                        {selectedPublisher.publisher_type && (
                          <p className="text-sm text-muted-foreground">
                            Type: {selectedPublisher.publisher_type}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPublisher(null)}
                      >
                        Modifier
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Date prévue de parution</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="JJ/MM/AAAA"
                      value={publicationDateInput}
                      onChange={(e) => {
                        setPublicationDateInput(e.target.value);
                        // Parse manual input
                        const parts = e.target.value.split('/');
                        if (parts.length === 3) {
                          const day = parseInt(parts[0]);
                          const month = parseInt(parts[1]) - 1;
                          const year = parseInt(parts[2]);
                          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                            const date = new Date(year, month, day);
                            if (date.getDate() === day && date.getMonth() === month) {
                              setPublicationDate(date);
                            }
                          }
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowCalendar(!showCalendar)}
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {showCalendar && (
                    <div className="border rounded-md bg-background">
                      <Calendar
                        mode="single"
                        selected={publicationDate}
                        onSelect={(date) => {
                          setPublicationDate(date);
                          if (date) {
                            setPublicationDateInput(format(date, "dd/MM/yyyy"));
                          }
                        }}
                        className="pointer-events-auto"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {supportType !== "electronic" && (
              <>
                <Separator />

                {/* Identification de l'imprimeur */}
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Identification de l'imprimeur</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Imprimerie <span className="text-destructive">*</span></Label>
                      {!selectedPrinter ? (
                        <div className="relative">
                          <Input
                            placeholder="Rechercher une imprimerie..."
                            value={printerSearch}
                            onChange={(e) => setPrinterSearch(e.target.value)}
                            className="pr-10"
                          />
                          {printerSearch && (
                            <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
                              {printers
                                .filter(printer => 
                                  printer.name.toLowerCase().includes(printerSearch.toLowerCase())
                                )
                                .map((printer) => (
                                  <button
                                    key={printer.id}
                                    type="button"
                                    className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                                    onClick={() => {
                                      setSelectedPrinter(printer);
                                      setPrinterSearch('');
                                      setPrinterData({
                                        name: printer.name,
                                        phone: printer.phone || '',
                                        email: printer.email || '',
                                        googleMapsLink: printer.google_maps_link || '',
                                        address: printer.address || '',
                                        city: printer.city || '',
                                        country: printer.country || 'Maroc',
                                        ...printer
                                      });
                                    }}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">{printer.name}</span>
                                      {printer.city && (
                                        <span className="text-sm text-muted-foreground">
                                          {printer.city}, {printer.country}
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              {printers.filter(printer => 
                                printer.name.toLowerCase().includes(printerSearch.toLowerCase())
                              ).length === 0 && !showPrinterInlineForm && (
                                <div className="px-4 py-3">
                                  <div className="text-sm text-muted-foreground mb-2">
                                    Aucune imprimerie trouvée
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => setShowPrinterInlineForm(true)}
                                  >
                                    + Ajouter une imprimerie avec invitation
                                  </Button>
                                </div>
                              )}
                              {showPrinterInlineForm && (
                                <PrinterInlineForm
                                  initialName={printerSearch}
                                  onPrinterAdded={(printer) => {
                                    setPrinters([...printers, printer]);
                                    setSelectedPrinter(printer);
                                    setPrinterSearch('');
                                    setShowPrinterInlineForm(false);
                                  }}
                                  onCancel={() => setShowPrinterInlineForm(false)}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-primary/10 rounded-md flex justify-between items-start">
                          <div>
                            <p className="font-medium">{selectedPrinter.name}</p>
                            {selectedPrinter.city && (
                              <p className="text-sm text-muted-foreground">
                                {selectedPrinter.city}, {selectedPrinter.country}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPrinter(null)}
                          >
                            Modifier
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Nombre de tirage</Label>
                      <Input 
                        type="number" 
                        placeholder="Nombre de tirage"
                        value={printRun}
                        onChange={(e) => setPrintRun(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />
              </>
            )}
          </>
        );
      }

      if (depositType === "periodique") {
        return (
          <>
            {/* Directeur de la publication */}
            <div>
              <h3 className="text-2xl font-semibold mb-4">Directeur de la publication</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type du directeur */}
                <div className="space-y-2">
                  <Label>Type</Label>
                  <InlineSelect
                    placeholder="Sélectionner le type"
                    value={directorType}
                    onChange={setDirectorType}
                    options={[
                      { value: "personne_physique", label: "Personne physique" },
                      { value: "personne_morale", label: "Personne morale (collectivités)" }
                    ]}
                  />
                </div>

                {/* Nom */}
                <div className="space-y-2">
                  <Label>{directorType === "personne_morale" ? "Nom de la collectivité" : "Nom"} <span className="text-destructive">*</span></Label>
                  <Input 
                    placeholder={directorType === "personne_morale" ? "Nom de la collectivité" : "Nom de famille"}
                    value={formData.directorLastName || ""}
                    onChange={(e) => setFormData({ ...formData, directorLastName: e.target.value })}
                  />
                </div>

                {/* Prénom - only for Personne Physique */}
                {directorType !== "personne_morale" && (
                  <div className="space-y-2 animate-fade-in">
                    <Label>Prénom <span className="text-destructive">*</span></Label>
                    <Input 
                      placeholder="Prénom du directeur"
                      value={formData.directorFirstName || ""}
                      onChange={(e) => setFormData({ ...formData, directorFirstName: e.target.value })}
                    />
                  </div>
                )}

                {directorType === "personne_physique" && (
                  <div className="space-y-2 animate-fade-in">
                    <Label>Genre</Label>
                    <InlineSelect
                      placeholder="Sélectionner le genre"
                      value={directorGender}
                      onChange={setDirectorGender}
                      options={[
                        { value: "homme", label: "Homme" },
                        { value: "femme", label: "Femme" }
                      ]}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>{directorType === "personne_morale" ? "Sigle" : "Pseudonyme"}</Label>
                  <Input 
                    placeholder={directorType === "personne_morale" ? "Sigle" : "Pseudonyme"}
                    value={directorPseudonym}
                    onChange={(e) => setDirectorPseudonym(e.target.value)}
                  />
                </div>

                {/* Nationalité - only for Personne Physique (multi-select) */}
                {directorType !== "personne_morale" && (
                  <div className="space-y-2 animate-fade-in">
                    <Label>Nationalité(s)</Label>
                    <NationalityMultiSelect
                      value={formData.directorNationalities || []}
                      onChange={(value) => setFormData({ ...formData, directorNationalities: value })}
                      placeholder="Sélectionner nationalité(s)"
                      gender={directorGender as 'homme' | 'femme' | ''}
                      otherValue={formData.directorOtherNationality || ""}
                      onOtherValueChange={(value) => setFormData({ ...formData, directorOtherNationality: value })}
                    />
                  </div>
                )}

                {/* Informations de contact */}
                <div className="space-y-2">
                  <Label>Email <span className="text-destructive">*</span></Label>
                  <Input type="email" placeholder="Email" required />
                </div>

                <div className="space-y-2">
                  <Label>Téléphone Fixe</Label>
                  <PhoneInput
                    value={formData.directorPhoneFixed || ""}
                    onChange={(value) => setFormData({ ...formData, directorPhoneFixed: value })}
                    defaultCountry="MA"
                    placeholder="5 XX XX XX XX"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Téléphone Mobile <span className="text-destructive">*</span></Label>
                  <PhoneInput
                    value={formData.directorPhoneMobile || ""}
                    onChange={(value) => setFormData({ ...formData, directorPhoneMobile: value })}
                    defaultCountry="MA"
                    placeholder="6 XX XX XX XX"
                  />
                </div>

                {/* Informations géographiques */}
                <div className="space-y-2">
                  <Label>Région</Label>
                  <InlineSelect
                    placeholder="Sélectionner une région"
                    value={directorRegion}
                    onChange={(value) => {
                      setDirectorRegion(value);
                      setDirectorCity('');
                    }}
                    options={moroccanRegions.map(region => ({
                      value: region.name,
                      label: region.name
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ville</Label>
                  <InlineSelect
                    placeholder={directorRegion ? "Sélectionner une ville" : "Sélectionnez d'abord une région"}
                    value={directorCity}
                    onChange={setDirectorCity}
                    disabled={!directorRegion}
                    options={directorRegion ? getCitiesByRegion(directorRegion).map(city => ({
                      value: city,
                      label: city
                    })) : []}
                  />
                </div>

                {/* Champs personnalisés */}
                {customFields
                  .filter((field) => field.section_key === "director_info")
                  .map((field) => (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      language={language}
                      value={customFieldsData[field.field_key]}
                      onChange={(value) =>
                        setCustomFieldsData((prev) => ({
                          ...prev,
                          [field.field_key]: value,
                        }))
                      }
                    />
                  ))}
               </div>
             </div>

            <Separator />

            {/* Identification de la publication */}
            <div>
            <h3 className="text-2xl font-semibold mb-4">Identification de la publication</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Titre du périodique <span className="text-destructive">*</span></Label>
                  <Input 
                    placeholder="Titre du périodique" 
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type de publication</Label>
                  <InlineSelect
                    placeholder="Sélectionner le type"
                    options={publicationTypePeriodicalOptions.filter(opt => 
                      opt.label.toLowerCase() !== "monographie simple"
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Public ciblé</Label>
                  <InlineSelect
                    value={targetAudience}
                    onChange={setTargetAudience}
                    placeholder="Sélectionner le public ciblé"
                    options={[
                      { value: "general", label: "Grand public" },
                      { value: "children", label: "Enfants (6-12 ans)" },
                      { value: "teens", label: "Adolescents (13-17 ans)" },
                      { value: "adults", label: "Adultes" },
                      { value: "academic", label: "Académique/Universitaire" },
                      { value: "professional", label: "Professionnel" },
                      { value: "specialized", label: "Spécialisé" },
                      { value: "other", label: "Autre" },
                    ]}
                  />
                </div>

                {targetAudience === "other" && (
                  <div className="space-y-2">
                    <Label>Préciser le public ciblé</Label>
                    <Input 
                      placeholder="Saisir le public ciblé" 
                      value={targetAudienceOther}
                      onChange={(e) => setTargetAudienceOther(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Type de support</Label>
                  <InlineSelect
                    value={formData.supportType}
                    onChange={(value) => setFormData({ ...formData, supportType: value })}
                    placeholder="Sélectionner le type"
                    options={[
                      { value: "printed", label: "Imprimé" },
                      { value: "electronic", label: "Électronique" },
                    ]}
                  />
                </div>

                {formData.supportType === "electronic" && (
                  <div className="space-y-2">
                    <Label>URL Opérationnelle</Label>
                    <Input 
                      type="url" 
                      placeholder="https://exemple.com" 
                      value={formData.operationalUrl || ''}
                      onChange={(e) => setFormData({ ...formData, operationalUrl: e.target.value })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <DynamicHierarchicalSelect
                    source="book_disciplines"
                    value={formData.periodicalDiscipline}
                    onChange={(value) => setFormData({ ...formData, periodicalDiscipline: value })}
                    placeholder="Sélectionner une discipline"
                    label="Discipline"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fascicule N°</Label>
                  <Input placeholder="Numéro du fascicule" />
                </div>

                <div className="space-y-2">
                  <Label>Périodicité</Label>
                  <InlineSelect
                    placeholder="Sélectionner la périodicité"
                    value={periodicity}
                    onChange={setPeriodicity}
                    options={[
                      { value: "daily", label: "Quotidien" },
                      { value: "weekly", label: "Hebdomadaire" },
                      { value: "monthly", label: "Mensuel" },
                      { value: "quarterly", label: "Trimestriel" },
                      { value: "yearly", label: "Annuel" },
                    ]}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Langues</Label>
                  <div className="relative">
                    <Input
                      placeholder="Rechercher et sélectionner des langues..."
                      value={languageSearch}
                      onChange={(e) => setLanguageSearch(e.target.value)}
                      className="pr-10"
                    />
                    {languageSearch && (
                      <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
                        {worldLanguages
                          .filter(lang => 
                            lang.name.toLowerCase().includes(languageSearch.toLowerCase())
                          )
                          .map((lang) => (
                            <button
                              key={lang.code}
                              type="button"
                              className="w-full text-left px-4 py-2 hover:bg-accent transition-colors flex items-center justify-between"
                              onClick={() => {
                                if (!selectedLanguages.includes(lang.name)) {
                                  setSelectedLanguages([...selectedLanguages, lang.name]);
                                }
                                setLanguageSearch("");
                              }}
                            >
                              <span>{lang.name}</span>
                              {selectedLanguages.includes(lang.name) && (
                                <span className="text-primary">✓</span>
                              )}
                            </button>
                          ))}
                        {worldLanguages.filter(lang => 
                          lang.name.toLowerCase().includes(languageSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-2 text-sm text-muted-foreground">
                            Aucune langue trouvée
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {selectedLanguages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedLanguages.map((lang, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {lang}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLanguages(selectedLanguages.filter((_, i) => i !== index));
                            }}
                            className="hover:text-primary/80"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Champs personnalisés */}
                {customFields
                  .filter((field) => field.section_key === "publication_info")
                  .map((field) => (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      language={language}
                      value={customFieldsData[field.field_key]}
                      onChange={(value) =>
                        setCustomFieldsData((prev) => ({
                          ...prev,
                          [field.field_key]: value,
                        }))
                      }
                    />
                  ))}
               </div>
             </div>

            <Separator />

            {/* Identification de l'Éditeur */}
            <div>
              <h3 className="text-2xl font-semibold mb-4">Identification de l'Éditeur</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nature de l'éditeur</Label>
                  <SimpleEntitySelect
                    placeholder="Sélectionner la nature"
                    value={editorIdentification}
                    onChange={setEditorIdentification}
                    options={[
                      { value: "etatique", label: "Étatique" },
                      { value: "non_etatique", label: "Non étatique" },
                    ]}
                  />
                </div>

                {editorIdentification === "non_etatique" && (
                  <div className="space-y-2">
                    <Label>Décision du Tribunal</Label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload('tribunal-decision', file);
                          }
                        }}
                        ref={(el) => {
                          if (el) fileInputRefs.current['tribunal-decision'] = el;
                        }}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRefs.current['tribunal-decision']?.click()}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadedFiles['tribunal-decision'] ? uploadedFiles['tribunal-decision'].name : "Choisir un fichier PDF"}
                      </Button>
                      {uploadedFiles['tribunal-decision'] && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFile('tribunal-decision')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Identification de l'Éditeur <span className="text-destructive">*</span></Label>
                  {!selectedPublisher ? (
                    <div className="relative">
                      <Input
                        placeholder="Rechercher un éditeur..."
                        value={publisherSearch}
                        onChange={(e) => setPublisherSearch(e.target.value)}
                        className="pr-10"
                      />
                      {publisherSearch && (
                        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
                          {publishers
                            .filter(pub => 
                              pub.name.toLowerCase().includes(publisherSearch.toLowerCase())
                            )
                            .map((pub) => (
                              <button
                                key={pub.id}
                                type="button"
                                className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                                onClick={() => {
                                  setSelectedPublisher(pub);
                                  setPublisherSearch('');
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{pub.name}</span>
                                  {pub.city && (
                                    <span className="text-sm text-muted-foreground">
                                      {pub.city}, {pub.country}
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))}
                          {publishers.filter(pub => 
                            pub.name.toLowerCase().includes(publisherSearch.toLowerCase())
                          ).length === 0 && !showEditorInlineForm && (
                            <div className="px-4 py-3">
                              <div className="text-sm text-muted-foreground mb-2">
                                Aucun éditeur trouvé
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => setShowEditorInlineForm(true)}
                              >
                                + Ajouter un éditeur avec invitation
                              </Button>
                            </div>
                          )}
                          {showEditorInlineForm && (
                            <EditorInlineForm
                              initialName={publisherSearch}
                              onEditorAdded={(editor) => {
                                setPublishers([...publishers, editor]);
                                setSelectedPublisher(editor);
                                setPublisherSearch('');
                                setShowEditorInlineForm(false);
                              }}
                              onCancel={() => setShowEditorInlineForm(false)}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-primary/10 rounded-md flex justify-between items-start">
                      <div>
                        <p className="font-medium">{selectedPublisher.name}</p>
                        {selectedPublisher.city && (
                          <p className="text-sm text-muted-foreground">
                            {selectedPublisher.city}, {selectedPublisher.country}
                          </p>
                        )}
                        {selectedPublisher.publisher_type && (
                          <p className="text-sm text-muted-foreground">
                            Type: {selectedPublisher.publisher_type}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPublisher(null)}
                      >
                        Modifier
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Date prévue de parution</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="JJ/MM/AAAA"
                      value={publicationDateInput}
                      onChange={(e) => {
                        setPublicationDateInput(e.target.value);
                        // Parse manual input
                        const parts = e.target.value.split('/');
                        if (parts.length === 3) {
                          const day = parseInt(parts[0]);
                          const month = parseInt(parts[1]) - 1;
                          const year = parseInt(parts[2]);
                          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                            const date = new Date(year, month, day);
                            if (date.getDate() === day && date.getMonth() === month) {
                              setPublicationDate(date);
                            }
                          }
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowCalendar(!showCalendar)}
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {showCalendar && (
                    <div className="border rounded-md bg-background">
                      <Calendar
                        mode="single"
                        selected={publicationDate}
                        onSelect={(date) => {
                          setPublicationDate(date);
                          if (date) {
                            setPublicationDateInput(format(date, "dd/MM/yyyy"));
                          }
                        }}
                        className="pointer-events-auto"
                      />
                    </div>
                  )}
                </div>

                {/* Champs personnalisés */}
                {customFields
                  .filter((field) => field.section_key === "publisher_info")
                  .map((field) => (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      language={language}
                      value={customFieldsData[field.field_key]}
                      onChange={(value) =>
                        setCustomFieldsData((prev) => ({
                          ...prev,
                          [field.field_key]: value,
                        }))
                      }
                    />
                  ))}
               </div>
             </div>

            {formData.supportType !== "electronic" && (
              <>
                <Separator />

                {/* Identification de l'Imprimeur */}
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Identification de l'Imprimeur</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Imprimerie <span className="text-destructive">*</span></Label>
                      {!selectedPrinter ? (
                        <div className="relative">
                          <Input
                            placeholder="Rechercher une imprimerie..."
                            value={printerSearch}
                            onChange={(e) => setPrinterSearch(e.target.value)}
                            className="pr-10"
                          />
                          {printerSearch && (
                            <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
                              {printers
                                .filter(printer => 
                                  printer.name.toLowerCase().includes(printerSearch.toLowerCase())
                                )
                                .map((printer) => (
                                  <button
                                    key={printer.id}
                                    type="button"
                                    className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                                    onClick={() => {
                                      setSelectedPrinter(printer);
                                      setPrinterSearch('');
                                      setPrinterData({
                                        name: printer.name,
                                        phone: printer.phone || '',
                                        email: printer.email || '',
                                        googleMapsLink: printer.google_maps_link || '',
                                        address: printer.address || '',
                                        city: printer.city || '',
                                        country: printer.country || 'Maroc',
                                        ...printer
                                      });
                                    }}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">{printer.name}</span>
                                      {printer.city && (
                                        <span className="text-sm text-muted-foreground">
                                          {printer.city}, {printer.country}
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              {printers.filter(printer => 
                                printer.name.toLowerCase().includes(printerSearch.toLowerCase())
                              ).length === 0 && !showPrinterInlineForm && (
                                <div className="px-4 py-3">
                                  <div className="text-sm text-muted-foreground mb-2">
                                    Aucune imprimerie trouvée
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => setShowPrinterInlineForm(true)}
                                  >
                                    + Ajouter une imprimerie avec invitation
                                  </Button>
                                </div>
                              )}
                              {showPrinterInlineForm && (
                                <PrinterInlineForm
                                  initialName={printerSearch}
                                  onPrinterAdded={(printer) => {
                                    setPrinters([...printers, printer]);
                                    setSelectedPrinter(printer);
                                    setPrinterSearch('');
                                    setShowPrinterInlineForm(false);
                                  }}
                                  onCancel={() => setShowPrinterInlineForm(false)}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-primary/10 rounded-md flex justify-between items-start">
                          <div>
                            <p className="font-medium">{selectedPrinter.name}</p>
                            {selectedPrinter.city && (
                              <p className="text-sm text-muted-foreground">
                                {selectedPrinter.city}, {selectedPrinter.country}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPrinter(null)}
                          >
                            Modifier
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Nombre de tirage</Label>
                      <Input 
                        type="number" 
                        placeholder="Nombre de tirage"
                        value={printRun}
                        onChange={(e) => setPrintRun(e.target.value)}
                      />
                    </div>

                    {/* Champs personnalisés */}
                    {customFields
                      .filter((field) => field.section_key === "printer_info")
                      .map((field) => (
                        <DynamicFieldRenderer
                          key={field.id}
                          field={field}
                          language={language}
                          value={customFieldsData[field.field_key]}
                          onChange={(value) =>
                            setCustomFieldsData((prev) => ({
                              ...prev,
                              [field.field_key]: value,
                            }))
                          }
                        />
                      ))}
                  </div>
                </div>
              </>
            )}

            {/* Champs personnalisés pour la section Documents requis */}
            {customFields.filter((field) => field.section_key === "required_documents").length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Documents supplémentaires</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customFields
                      .filter((field) => field.section_key === "required_documents")
                      .map((field) => (
                        <DynamicFieldRenderer
                          key={field.id}
                          field={field}
                          language={language}
                          value={customFieldsData[field.field_key]}
                          onChange={(value) =>
                            setCustomFieldsData((prev) => ({
                              ...prev,
                              [field.field_key]: value,
                            }))
                          }
                        />
                      ))}
                  </div>
                </div>
              </>
            )}

             <Separator />
          </>
        );
      }

      if (depositType === "bd_logiciels") {
        return (
          <>
            {/* Identification de l'auteur - avec support multi-auteurs */}
            <MultipleAuthorsSection
              authors={authors}
              onAuthorsChange={setAuthors}
              customFields={customFields}
              language={language}
              maxAuthors={10}
            />

            <Separator />

            {/* Identification de la publication */}
            <div>
              <h3 className="text-2xl font-semibold mb-4">Identification de la publication</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Titre de la publication <span className="text-destructive">*</span></Label>
                  <Input 
                    placeholder="Titre de la publication" 
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type de publication</Label>
                  <InlineSelect
                    value={publicationType}
                    onChange={setPublicationType}
                    placeholder="Sélectionner le type"
                    options={[
                      { value: "database", label: "Base de données" },
                      { value: "software", label: "Logiciel" },
                      { value: "audiovisual", label: "Document audiovisuel" },
                    ]}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Public ciblé</Label>
                  <InlineSelect
                    value={targetAudience}
                    onChange={setTargetAudience}
                    placeholder="Sélectionner le public ciblé"
                    options={[
                      { value: "general", label: "Grand public" },
                      { value: "children", label: "Enfants (6-12 ans)" },
                      { value: "teens", label: "Adolescents (13-17 ans)" },
                      { value: "adults", label: "Adultes" },
                      { value: "academic", label: "Académique/Universitaire" },
                      { value: "professional", label: "Professionnel" },
                      { value: "specialized", label: "Spécialisé" },
                      { value: "other", label: "Autre" },
                    ]}
                  />
                </div>

                {targetAudience === "other" && (
                  <div className="space-y-2">
                    <Label>Préciser le public ciblé</Label>
                    <Input 
                      placeholder="Saisir le public ciblé" 
                      value={targetAudienceOther}
                      onChange={(e) => setTargetAudienceOther(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Langue</Label>
                  <div className="relative">
                    <Input
                      placeholder="Rechercher et sélectionner des langues..."
                      value={languageSearch}
                      onChange={(e) => setLanguageSearch(e.target.value)}
                      className="pr-10"
                    />
                    {languageSearch && (
                      <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
                        {worldLanguages
                          .filter(lang => 
                            lang.name.toLowerCase().includes(languageSearch.toLowerCase())
                          )
                          .map((lang) => (
                            <button
                              key={lang.code}
                              type="button"
                              className="w-full text-left px-4 py-2 hover:bg-accent transition-colors flex items-center justify-between"
                              onClick={() => {
                                if (!selectedLanguages.includes(lang.name)) {
                                  setSelectedLanguages([...selectedLanguages, lang.name]);
                                }
                                setLanguageSearch("");
                              }}
                            >
                              <span>{lang.name}</span>
                              {selectedLanguages.includes(lang.name) && (
                                <span className="text-primary">✓</span>
                              )}
                            </button>
                          ))}
                        {worldLanguages.filter(lang => 
                          lang.name.toLowerCase().includes(languageSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-2 text-sm text-muted-foreground">
                            Aucune langue trouvée
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {selectedLanguages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedLanguages.map((lang, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {lang}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLanguages(selectedLanguages.filter((_, i) => i !== index));
                            }}
                            className="hover:text-destructive"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Disciplines de la publication</Label>
                  {publicationType && (
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                      <p className="text-sm font-medium text-primary mb-1">💡 Exemples de disciplines :</p>
                      <p className="text-xs text-muted-foreground">
                        {publicationType === "database" && "Bases de données bibliographiques, scientifiques, juridiques, économiques, médicales, culturelles, historiques, géographiques..."}
                        {publicationType === "software" && "Logiciels éducatifs, de gestion, de comptabilité, scientifiques, de santé, de conception/design, d'ingénierie, multimédias..."}
                        {publicationType === "audiovisual" && "Documentaires, films éducatifs, reportages, conférences enregistrées, émissions culturelles, contenus scientifiques, archives historiques, œuvres artistiques..."}
                      </p>
                    </div>
                  )}
                  <div className="relative">
                    <Input
                      placeholder={
                        !publicationType 
                          ? "Sélectionner d'abord un type de publication..." 
                          : "Rechercher et sélectionner des disciplines..."
                      }
                      value={disciplineInput}
                      onChange={(e) => setDisciplineInput(e.target.value)}
                      disabled={!publicationType}
                      className="pr-10"
                    />
                    {disciplineInput && publicationType && (
                      <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
                        {disciplinesLoading ? (
                          <div className="px-4 py-2 text-sm text-muted-foreground">
                            Chargement des disciplines...
                          </div>
                        ) : (
                          <>
                            {disciplineValues
                              .filter(disc => 
                                disc.value_label.toLowerCase().includes(disciplineInput.toLowerCase()) &&
                                !selectedDisciplines.includes(disc.value_label)
                              )
                              .map((disc) => (
                                <button
                                  key={disc.id}
                                  type="button"
                                  className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                                  onClick={() => {
                                    setSelectedDisciplines([...selectedDisciplines, disc.value_label]);
                                    setDisciplineInput("");
                                  }}
                                >
                                  {disc.value_label}
                                </button>
                              ))}
                            {disciplineValues.filter(disc => 
                              disc.value_label.toLowerCase().includes(disciplineInput.toLowerCase()) &&
                              !selectedDisciplines.includes(disc.value_label)
                            ).length === 0 && (
                              <div className="px-4 py-2 text-sm text-muted-foreground">
                                Aucune discipline trouvée
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {selectedDisciplines.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedDisciplines.map((disc, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {disc}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDisciplines(selectedDisciplines.filter((_, i) => i !== index));
                            }}
                            className="hover:text-destructive"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Champs personnalisés */}
                {customFields
                  .filter((field) => field.section_key === "work_info")
                  .map((field) => (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      language={language}
                      value={customFieldsData[field.field_key]}
                      onChange={(value) =>
                        setCustomFieldsData((prev) => ({
                          ...prev,
                          [field.field_key]: value,
                        }))
                      }
                    />
                  ))}

              </div>
            </div>

            <Separator />

            {/* Identification du Producteur */}
            <div>
              <h3 className="text-2xl font-semibold mb-4">Identification du Producteur</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Producteur</Label>
                  {!selectedProducer ? (
                    <div className="relative">
                      <Input
                        placeholder="Rechercher un producteur..."
                        value={producerSearch}
                        onChange={(e) => setProducerSearch(e.target.value)}
                        className="pr-10"
                      />
                      {producerSearch && (
                        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
                          {producers
                            .filter(prod => 
                              prod.name.toLowerCase().includes(producerSearch.toLowerCase())
                            )
                            .map((prod) => (
                              <button
                                key={prod.id}
                                type="button"
                                className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                                onClick={() => {
                                  setSelectedProducer(prod);
                                  setProducerSearch('');
                                  setProducerData({
                                    name: prod.name,
                                    phone: prod.phone || '',
                                    email: prod.email || '',
                                    googleMapsLink: prod.google_maps_link || '',
                                    address: prod.address || '',
                                    city: prod.city || '',
                                    country: prod.country || 'Maroc',
                                    ...prod
                                  });
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{prod.name}</span>
                                  {prod.address && (
                                    <span className="text-sm text-muted-foreground">
                                      {prod.address}
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))}
                          {producers.filter(prod => 
                            prod.name.toLowerCase().includes(producerSearch.toLowerCase())
                          ).length === 0 && (
                            <div className="px-4 py-3">
                              <div className="text-sm text-muted-foreground mb-2">
                                Aucun producteur trouvé
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={async () => {
                                  const newName = producerSearch;
                                  const { data, error } = await supabase
                                    .from('producers')
                                    .insert([{ name: newName }])
                                    .select('id, name, address, city, country, phone, email, google_maps_link')
                                    .single();
                                  
                                  if (error) {
                                    toast.error('Erreur lors de l\'ajout du producteur');
                                  } else if (data) {
                                    setProducers([...producers, data as unknown as Producer]);
                                    setSelectedProducer(data as unknown as Producer);
                                    setProducerSearch('');
                                    setProducerData({
                                      name: (data as unknown as Producer).name,
                                      phone: (data as unknown as Producer).phone || '',
                                      email: (data as unknown as Producer).email || '',
                                      googleMapsLink: (data as unknown as Producer).google_maps_link || '',
                                      address: (data as unknown as Producer).address || '',
                                      city: (data as unknown as Producer).city || '',
                                      country: (data as unknown as Producer).country || 'Maroc',
                                      ...(data as unknown as Producer)
                                    });
                                    toast.success('Producteur ajouté avec succès');
                                  }
                                }}
                              >
                                Ajouter "{producerSearch}"
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg border">
                      <div className="flex-1">
                        <div className="font-medium">{selectedProducer.name}</div>
                        {selectedProducer.address && (
                          <div className="text-sm text-muted-foreground">
                            {selectedProducer.address}
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProducer(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Lien Google Maps <span className="text-destructive">*</span></Label>
                  <Input 
                    placeholder="https://maps.google.com/?q=..."
                    value={producerData.googleMapsLink || ''}
                    onChange={(e) => setProducerData({ ...producerData, googleMapsLink: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Collez le lien de localisation Google Maps
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Téléphone <span className="text-destructive">*</span></Label>
                  <Input 
                    placeholder="Numéro de téléphone"
                    value={producerData.phone || ''}
                    onChange={(e) => setProducerData({ ...producerData, phone: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Email <span className="text-destructive">*</span></Label>
                  <Input 
                    type="email" 
                    placeholder="Adresse email"
                    value={producerData.email || ''}
                    onChange={(e) => setProducerData({ ...producerData, email: e.target.value })}
                  />
                </div>

                {/* Champs personnalisés */}
                {customFields
                  .filter((field) => field.section_key === "producer_info")
                  .map((field) => (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      language={language}
                      value={customFieldsData[field.field_key]}
                      onChange={(value) =>
                        setCustomFieldsData((prev) => ({
                          ...prev,
                          [field.field_key]: value,
                        }))
                      }
                    />
                  ))}
                
                <div className="space-y-2">
                  <Label>Date prévue de parution</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="JJ/MM/AAAA"
                      value={publicationDateInput}
                      onChange={(e) => {
                        setPublicationDateInput(e.target.value);
                        // Parse manual input
                        const parts = e.target.value.split('/');
                        if (parts.length === 3) {
                          const day = parseInt(parts[0]);
                          const month = parseInt(parts[1]) - 1;
                          const year = parseInt(parts[2]);
                          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                            const date = new Date(year, month, day);
                            if (date.getDate() === day && date.getMonth() === month) {
                              setPublicationDate(date);
                            }
                          }
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowCalendar(!showCalendar)}
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {showCalendar && (
                    <div className="border rounded-md bg-background">
                      <Calendar
                        mode="single"
                        selected={publicationDate}
                        onSelect={(date) => {
                          setPublicationDate(date);
                          if (date) {
                            setPublicationDateInput(format(date, "dd/MM/yyyy"));
                          }
                        }}
                        className="pointer-events-auto"
                      />
                    </div>
                  )}
                </div>

                {/* Champs personnalisés */}
                {customFields
                  .filter((field) => field.section_key === "publisher_info")
                  .map((field) => (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      language={language}
                      value={customFieldsData[field.field_key]}
                      onChange={(value) =>
                        setCustomFieldsData((prev) => ({
                          ...prev,
                          [field.field_key]: value,
                        }))
                      }
                    />
                  ))}
              </div>
            </div>

            <Separator />
          </>
        );
      }

      if (depositType === "collections_specialisees") {
        return (
          <>
            {/* Identification de l'auteur - avec support multi-auteurs */}
            <MultipleAuthorsSection
              authors={authors}
              onAuthorsChange={setAuthors}
              customFields={customFields}
              language={language}
              maxAuthors={10}
            />

            <Separator />

            {/* Identification de la publication */}
            <div>
              <h3 className="text-2xl font-semibold mb-4">Identification de la publication</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Titre de la publication <span className="text-destructive">*</span></Label>
                  <Input 
                    placeholder="Titre de la publication" 
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type de publication</Label>
                  <SimpleSelectWithTooltip
                    value={specialCollectionPublicationType}
                    onChange={setSpecialCollectionPublicationType}
                    placeholder="Sélectionner le type"
                    options={[
                      { 
                        value: "affiches", 
                        label: "Affiches",
                        tooltip: "Feuilles imprimées destinées à être placardées"
                      },
                      { 
                        value: "cartes_geographiques", 
                        label: "Cartes géographiques",
                        tooltip: "Représentations géographiques sur support papier ou numérique"
                      },
                      { 
                        value: "photos_plans", 
                        label: "Photos et Plans",
                        tooltip: "Documents photographiques et plans techniques"
                      },
                      { 
                        value: "estampes", 
                        label: "Estampes",
                        tooltip: "Œuvres imprimées obtenues par gravure"
                      },
                      { 
                        value: "manuscrits", 
                        label: "Manuscrits",
                        tooltip: "Documents écrits à la main"
                      },
                      { 
                        value: "autre", 
                        label: "Autre",
                        tooltip: "Autre type de collection spéciale"
                      }
                    ]}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Public ciblé</Label>
                  <InlineSelect
                    value={targetAudience}
                    onChange={setTargetAudience}
                    placeholder="Sélectionner le public ciblé"
                    options={[
                      { value: "general", label: "Grand public" },
                      { value: "children", label: "Enfants (6-12 ans)" },
                      { value: "teens", label: "Adolescents (13-17 ans)" },
                      { value: "adults", label: "Adultes" },
                      { value: "academic", label: "Académique/Universitaire" },
                      { value: "professional", label: "Professionnel" },
                      { value: "specialized", label: "Spécialisé" },
                      { value: "other", label: "Autre" },
                    ]}
                  />
                </div>

                {targetAudience === "other" && (
                  <div className="space-y-2">
                    <Label>Préciser le public ciblé</Label>
                    <Input 
                      placeholder="Saisir le public ciblé" 
                      value={targetAudienceOther}
                      onChange={(e) => setTargetAudienceOther(e.target.value)}
                    />
                  </div>
                )}

                {specialCollectionPublicationType === "autre" && (
                  <div className="space-y-2">
                    <Label>Préciser le type</Label>
                    <Input 
                      placeholder="Saisir le type de publication" 
                      value={specialCollectionPublicationTypeOther}
                      onChange={(e) => setSpecialCollectionPublicationTypeOther(e.target.value)}
                    />
                  </div>
                )}

                {(specialCollectionPublicationType === "cartes_geographiques" || 
                  specialCollectionPublicationType === "photos_plans") && (
                  <>
                    <div className="space-y-2">
                      <Label>Présence échelle</Label>
                      <SimpleEntitySelect
                        value={hasScale}
                        onChange={setHasScale}
                        placeholder="Sélectionner"
                        options={[
                          { value: "oui", label: "Oui" },
                          { value: "non", label: "Non" },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Présence de légende</Label>
                      <SimpleEntitySelect
                        value={hasLegend}
                        onChange={setHasLegend}
                        placeholder="Sélectionner"
                        options={[
                          { value: "oui", label: "Oui" },
                          { value: "non", label: "Non" },
                        ]}
                      />
                    </div>
                  </>
                )}

                {specialCollectionPublicationType === "cartes_postales" && (
                  <div className="space-y-2">
                    <Label>Titre de la collection</Label>
                    <Input 
                      placeholder="Titre de la collection"
                      value={collectionTitle}
                      onChange={(e) => setCollectionTitle(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Langues</Label>
                  <div className="relative">
                    <Input
                      placeholder="Rechercher et sélectionner des langues..."
                      value={languageSearch}
                      onChange={(e) => setLanguageSearch(e.target.value)}
                      className="pr-10"
                    />
                    {languageSearch && (
                      <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
                        {worldLanguages
                          .filter(lang => 
                            lang.name.toLowerCase().includes(languageSearch.toLowerCase())
                          )
                          .map((lang) => (
                            <button
                              key={lang.code}
                              type="button"
                              className="w-full text-left px-4 py-2 hover:bg-accent transition-colors flex items-center justify-between"
                              onClick={() => {
                                if (!selectedLanguages.includes(lang.name)) {
                                  setSelectedLanguages([...selectedLanguages, lang.name]);
                                }
                                setLanguageSearch("");
                              }}
                            >
                              <span>{lang.name}</span>
                              {selectedLanguages.includes(lang.name) && (
                                <span className="text-primary">✓</span>
                              )}
                            </button>
                          ))}
                        {worldLanguages.filter(lang => 
                          lang.name.toLowerCase().includes(languageSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-2 text-sm text-muted-foreground">
                            Aucune langue trouvée
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {selectedLanguages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedLanguages.map((lang, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {lang}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLanguages(selectedLanguages.filter((_, i) => i !== index));
                            }}
                            className="hover:text-primary/80"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Disciplines de la publication</Label>
                  <Input placeholder="Disciplines de la publication" />
                </div>

                <div className="space-y-2">
                  <Label>Mots clés</Label>
                  <Input placeholder="Mots clés" />
                </div>

                {/* Champs personnalisés */}
                {customFields
                  .filter((field) => field.section_key === "collection_info")
                  .map((field) => (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      language={language}
                      value={customFieldsData[field.field_key]}
                      onChange={(value) =>
                        setCustomFieldsData((prev) => ({
                          ...prev,
                          [field.field_key]: value,
                        }))
                      }
                    />
                  ))}
              </div>
            </div>

            <Separator />

            {/* Identification de l'Éditeur */}
            <div>
              <h3 className="text-2xl font-semibold mb-4">Identification de l'Éditeur</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Éditeur <span className="text-destructive">*</span></Label>
                  {!selectedPublisher ? (
                    <div className="relative">
                      <Input
                        placeholder="Rechercher un éditeur..."
                        value={publisherSearch}
                        onChange={(e) => setPublisherSearch(e.target.value)}
                        className="pr-10"
                      />
                      {publisherSearch && (
                        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
                          {publishers
                            .filter(pub => 
                              pub.name.toLowerCase().includes(publisherSearch.toLowerCase())
                            )
                            .map((pub) => (
                              <button
                                key={pub.id}
                                type="button"
                                className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                                onClick={() => {
                                  setSelectedPublisher(pub);
                                  setPublisherSearch('');
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{pub.name}</span>
                                  {pub.city && (
                                    <span className="text-sm text-muted-foreground">
                                      {pub.city}, {pub.country}
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))}
                          {publishers.filter(pub => 
                            pub.name.toLowerCase().includes(publisherSearch.toLowerCase())
                          ).length === 0 && !showEditorInlineForm && (
                            <div className="px-4 py-3">
                              <div className="text-sm text-muted-foreground mb-2">
                                Aucun éditeur trouvé
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => setShowEditorInlineForm(true)}
                              >
                                + Ajouter un éditeur avec invitation
                              </Button>
                            </div>
                          )}
                          {showEditorInlineForm && (
                            <EditorInlineForm
                              initialName={publisherSearch}
                              onEditorAdded={(editor) => {
                                setPublishers([...publishers, editor]);
                                setSelectedPublisher(editor);
                                setPublisherSearch('');
                                setShowEditorInlineForm(false);
                              }}
                              onCancel={() => setShowEditorInlineForm(false)}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-primary/10 rounded-md flex justify-between items-start">
                      <div>
                        <p className="font-medium">{selectedPublisher.name}</p>
                        {selectedPublisher.city && (
                          <p className="text-sm text-muted-foreground">
                            {selectedPublisher.city}, {selectedPublisher.country}
                          </p>
                        )}
                        {selectedPublisher.publisher_type && (
                          <p className="text-sm text-muted-foreground">
                            Type: {selectedPublisher.publisher_type}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPublisher(null)}
                      >
                        Modifier
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Date prévue de parution</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="JJ/MM/AAAA"
                      value={publicationDateInput}
                      onChange={(e) => {
                        setPublicationDateInput(e.target.value);
                        // Parse manual input
                        const parts = e.target.value.split('/');
                        if (parts.length === 3) {
                          const day = parseInt(parts[0]);
                          const month = parseInt(parts[1]) - 1;
                          const year = parseInt(parts[2]);
                          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                            const date = new Date(year, month, day);
                            if (date.getDate() === day && date.getMonth() === month) {
                              setPublicationDate(date);
                            }
                          }
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowCalendar(!showCalendar)}
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {showCalendar && (
                    <div className="border rounded-md bg-background">
                      <Calendar
                        mode="single"
                        selected={publicationDate}
                        onSelect={(date) => {
                          setPublicationDate(date);
                          if (date) {
                            setPublicationDateInput(format(date, "dd/MM/yyyy"));
                          }
                        }}
                        className="pointer-events-auto"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Identification de l'Imprimeur */}
            <div>
              <h3 className="text-2xl font-semibold mb-4">Identification de l'Imprimeur</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Imprimerie <span className="text-destructive">*</span></Label>
                  {!selectedPrinter ? (
                    <div className="relative">
                      <Input
                        placeholder="Rechercher une imprimerie..."
                        value={printerSearch}
                        onChange={(e) => setPrinterSearch(e.target.value)}
                        className="pr-10"
                      />
                      {printerSearch && (
                        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
                          {printers
                            .filter(printer => 
                              printer.name.toLowerCase().includes(printerSearch.toLowerCase())
                            )
                            .map((printer) => (
                              <button
                                key={printer.id}
                                type="button"
                                className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                                onClick={() => {
                                  setSelectedPrinter(printer);
                                  setPrinterSearch('');
                                  setPrinterData({
                                    name: printer.name,
                                    phone: printer.phone || '',
                                    email: printer.email || '',
                                    googleMapsLink: printer.google_maps_link || '',
                                    address: printer.address || '',
                                    city: printer.city || '',
                                    country: printer.country || 'Maroc',
                                    ...printer
                                  });
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{printer.name}</span>
                                  {printer.city && (
                                    <span className="text-sm text-muted-foreground">
                                      {printer.city}, {printer.country}
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))}
                          {printers.filter(printer => 
                            printer.name.toLowerCase().includes(printerSearch.toLowerCase())
                          ).length === 0 && !showPrinterInlineForm && (
                            <div className="px-4 py-3">
                              <div className="text-sm text-muted-foreground mb-2">
                                Aucune imprimerie trouvée
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => setShowPrinterInlineForm(true)}
                              >
                                + Ajouter une imprimerie avec invitation
                              </Button>
                            </div>
                          )}
                          {showPrinterInlineForm && (
                            <PrinterInlineForm
                              initialName={printerSearch}
                              onPrinterAdded={(printer) => {
                                setPrinters([...printers, printer]);
                                setSelectedPrinter(printer);
                                setPrinterSearch('');
                                setShowPrinterInlineForm(false);
                              }}
                              onCancel={() => setShowPrinterInlineForm(false)}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-primary/10 rounded-md flex justify-between items-start">
                      <div>
                        <p className="font-medium">{selectedPrinter.name}</p>
                        {selectedPrinter.city && (
                          <p className="text-sm text-muted-foreground">
                            {selectedPrinter.city}, {selectedPrinter.country}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPrinter(null)}
                      >
                        Modifier
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Nombre de tirage</Label>
                  <Input 
                    type="number" 
                    placeholder="Nombre de tirage"
                    value={printRun}
                    onChange={(e) => setPrintRun(e.target.value)}
                  />
                </div>

                {/* Champs personnalisés */}
                {customFields
                  .filter((field) => field.section_key === "content_description")
                  .map((field) => (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      language={language}
                      value={customFieldsData[field.field_key]}
                      onChange={(value) =>
                        setCustomFieldsData((prev) => ({
                          ...prev,
                          [field.field_key]: value,
                        }))
                      }
                    />
                  ))}
              </div>
            </div>

            <Separator />
          </>
        );
      }

      return null;
    };

    return (
      <>
        {renderFormsByType()}
        
        {/* Pièces à fournir */}
        <div>
          <h3 className="text-2xl font-semibold mb-4">Pièces à fournir</h3>
          <p className="text-sm text-muted-foreground mb-4">Formats acceptés : PDF, JPG, JPEG, PNG — Taille max : 10 Mo</p>
          <div className="space-y-4">
            {renderFileUpload("cover", "Joindre la couverture ou une capture", true, "application/pdf,image/jpeg,image/jpg,image/png")}
            
            {(depositType === "monographie" || depositType === "periodique") && (
              <>
                {renderFileUpload("summary", "Joindre le sommaire", true, "application/pdf,image/jpeg,image/jpg,image/png")}
                {renderFileUpload("abstract", "Joindre résumé de l'ouvrage", true, "application/pdf,image/jpeg,image/jpg,image/png")}
              </>
            )}
            
            {depositType === "bd_logiciels" && (
              renderFileUpload("summary", "Joindre le Résumé de la publication", true, "application/pdf,image/jpeg,image/jpg,image/png")
            )}
            
            {depositType === "collections_specialisees" && (
              renderFileUpload("summary", "Joindre le Résumé de la publication ou descriptif", true, "application/pdf,image/jpeg,image/jpg,image/png")
            )}
            
            {/* Pour périodiques: masquer CNIE si personne morale */}
            {depositType === "periodique" && directorType !== "personne_morale" && (
              renderFileUpload("cin", "Joindre une copie de la CNIE du Directeur de la publication", true, "application/pdf,image/jpeg,image/jpg,image/png")
            )}
            {depositType !== "periodique" && (
              renderFileUpload("cin", "Joindre une copie de la CNIE de l'Auteur", true, "application/pdf,image/jpeg,image/jpg,image/png")
            )}
            
            {/* Pièces conditionnelles selon le type de publication */}
            {depositType === "monographie" && publicationType === "THE" && (
              renderFileUpload(
                "thesis-recommendation", 
                "Recommandation de publication (pour les thèses)", 
                true, 
                "application/pdf,image/jpeg,image/jpg,image/png"
              )
            )}
            
            {depositType === "monographie" && publicationType === "COR" && (
              renderFileUpload(
                "quran-authorization", 
                "Autorisation de publication de la Fondation Mohammed VI (pour les Corans)", 
                true, 
                "application/pdf,image/jpeg,image/jpg,image/png"
              )
            )}
            
            {/* Champs personnalisés pour documents requis */}
            {(depositType === "bd_logiciels" || depositType === "collections_specialisees") && customFields
              .filter((field) => field.section_key === "required_documents")
              .map((field) => (
                <DynamicFieldRenderer
                  key={field.id}
                  field={field}
                  language={language}
                  value={customFieldsData[field.field_key]}
                  onChange={(value) =>
                    setCustomFieldsData((prev) => ({
                      ...prev,
                      [field.field_key]: value,
                    }))
                  }
                />
              ))}
          </div>

          {/* Résumé des fichiers joints */}
          {Object.keys(uploadedFiles).length > 0 && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Documents joints :</h4>
              <div className="space-y-1">
                {Object.entries(uploadedFiles).map(([type, file]) => (
                  <div key={type} className="flex items-center text-sm text-green-700">
                    <CheckCircle className="w-3 h-3 mr-2" />
                    <span className="font-medium">{type}:</span>
                    <span className="ml-1">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 p-4 bg-accent/10 rounded-lg">
            <h4 className="font-semibold mb-2">Modalités et nombre d'exemplaires à déposer :</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Une fois le document publié, les exemplaires doivent être déposés à l'Agence Bibliographique Nationale :
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {depositType === "monographie" && (
                <>
                  <li>• 4 exemplaires pour les monographies imprimées</li>
                  <li>• 2 exemplaires pour les e-books</li>
                </>
              )}
              {depositType === "periodique" && (
                <>
                  <li>• 5 exemplaires pour les périodiques imprimés</li>
                  <li>• 4 exemplaires pour les numéros à suivre</li>
                </>
              )}
              {(depositType === "bd_logiciels" || depositType === "collections_specialisees") && (
                <li>• 2 exemplaires de format identique (CD, DVD, clés USB, etc.)</li>
              )}
            </ul>
            
            {depositType === "monographie" && (
              <div className="mt-3 p-3 bg-background/50 rounded border-l-4 border-primary">
                <h5 className="font-medium text-sm mb-1">Pour les e-books :</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Déposer deux exemplaires sur le même type de support</li>
                  <li>• Munir chaque exemplaire d'une pochette avec le titre et les numéros obtenus (DL, ISBN)</li>
                  <li>• Recommandation : utiliser des USB au format carte pour une meilleure préservation</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Clause de protection des données */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Clause de protection de données à caractère personnel
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            Les informations recueillies sur le site www.bnrm.ma font l'objet d'un traitement destiné à la Gestion des attributions 
            des numéros du Dépôt Légal et des numéros ISBN et ISSN. Le destinataire des données est le service de dépôt légal.
            Conformément à la loi n° 09-08 promulguée par le Dahir 1-09-15 du 18 février 2009, relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel, 
            vous bénéficiez d'un droit d'accès et de rectification aux informations qui vous concernent, 
            que vous pouvez exercer en vous adressant à depot.legal@bnrm.ma.
            Ce traitement a été notifié par la CNDP au titre du récépissé n°D-90/2023 du 18/01/2023.
          </p>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="privacy" 
              checked={acceptedPrivacy}
              onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)}
            />
            <Label htmlFor="privacy" className="text-sm">
              J'ai lu et j'accepte la clause de protection de données à caractère personnel
            </Label>
          </div>
        </div>
      </>
    );
  };

  const renderPrivacyClauseArabic = () => (
    <div className="bg-muted/50 p-4 rounded-lg">
      <h4 className="font-semibold mb-2 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        شرط حماية البيانات الشخصية
      </h4>
      <p className="text-sm text-muted-foreground mb-4">
        تخضع المعلومات التي تم جمعها على موقع www.bnrm.ma للمعالجة المخصصة لإدارة تخصيص أرقام الإيداع القانوني وأرقام ISBN و ISSN. 
        متلقي البيانات هو خدمة الإيداع القانوني.
        وفقا للقانون رقم 08-09 الصادر بموجب الظهير الشريف 1-09-15 المؤرخ في 18 فبراير 2009، المتعلق بحماية الأفراد فيما يتعلق بمعالجة البيانات الشخصية، 
        لك الحق في الوصول إلى المعلومات المتعلقة بك وتصحيحها، والتي يمكنك ممارستها عن طريق الاتصال بـ depot.legal@bnrm.ma.
        يمكنك أيضا معارضة معالجة البيانات المتعلقة بك، لأسباب مشروعة.
        تم إخطار CNDP بهذه المعالجة بموجب رقم الاستلام D-90/2023 بتاريخ 01/18/2023.
      </p>
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="privacy-ar" 
          checked={acceptedPrivacy}
          onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)}
        />
        <Label htmlFor="privacy-ar" className="text-sm">
          لقد قرأت وقبلت شرط حماية البيانات الشخصية
        </Label>
      </div>
    </div>
  );

  const renderMonographieArabicForm = () => (
    <>
      {/* التعريف بالمؤلف */}
      <div>
        <h3 className="text-2xl font-semibold mb-4">التعريف بالمؤلف</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>نوع المؤلف</Label>
            <InlineSelect
              value={authorType}
              onChange={setAuthorType}
              placeholder="اختر النوع"
              options={[
                { value: "physique", label: "شخص مادي" },
                { value: "morale", label: "شخص معنوي (هيئة)" },
              ]}
            />
          </div>
          
          <div className="space-y-2">
            <Label>اسم المؤلف / اسم الهيئة</Label>
            <Input placeholder="الاسم الكامل" />
          </div>

          <div className="space-y-2">
            <Label>اختصار اسم الهيئة</Label>
            <Input placeholder="اختصار اسم الهيئة" />
          </div>

          <div className="space-y-2">
            <Label>نوع المصرح</Label>
            <Input placeholder="نوع المصرح" />
          </div>

          <div className="space-y-2">
            <Label>رقم الهاتف</Label>
            <Input placeholder="رقم الهاتف" />
          </div>

          <div className="space-y-2">
            <Label>البريد الإلكتروني <span className="text-destructive">*</span></Label>
            <Input type="email" placeholder="البريد الإلكتروني" required />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>العنوان</Label>
            <Textarea placeholder="العنوان الكامل" />
          </div>
        </div>
      </div>

      <Separator />

      {/* التعريف بالوثيقة */}
      <div>
        <h3 className="text-2xl font-semibold mb-4">التعريف بالوثيقة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label>عنوان الكتاب</Label>
            <Input placeholder="عنوان الكتاب" />
          </div>

          <div className="space-y-2">
            <Label>نوع الحامل</Label>
            <InlineSelect
              value={naturePublication}
              onChange={setNaturePublication}
              placeholder="اختر نوع الحامل"
              options={[
                { value: "printed", label: "مطبوع" },
                { value: "electronic", label: "إلكتروني" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <Label>عنوان السلسلة</Label>
            <Input placeholder="عنوان السلسلة" />
          </div>

          <div className="space-y-2">
            <Label>الرقم في السلسلة</Label>
            <Input placeholder="الرقم في السلسلة" />
          </div>

          <div className="space-y-2">
            <Label>موضوع الكتاب</Label>
            <Input placeholder="موضوع الكتاب" />
          </div>

          <div className="space-y-2">
            <Label>رؤوس للمواضيع</Label>
            <Input placeholder="رؤوس للمواضيع" />
          </div>

          <div className="space-y-2">
            <Label>اللغة</Label>
            <InlineSelect
              value=""
              onChange={() => {}}
              placeholder="اختر اللغة"
              options={[
                { value: "ar", label: "العربية" },
                { value: "fr", label: "الفرنسية" },
                { value: "en", label: "الإنجليزية" },
                { value: "ber", label: "الأمازيغية" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <Label>عدد الأجزاء</Label>
            <Input type="number" placeholder="عدد الأجزاء" />
          </div>

          <div className="space-y-2">
            <Label>عدد الصفحات</Label>
            <Input type="number" placeholder="عدد الصفحات" />
          </div>

          <div className="space-y-2">
            <Label>أول طلب للردمك</Label>
            <InlineSelect
              value=""
              onChange={() => {}}
              placeholder="اختر"
              options={[
                { value: "yes", label: "نعم" },
                { value: "no", label: "لا" },
              ]}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>ملخص الكتاب</Label>
            <Textarea placeholder="ملخص الكتاب" rows={4} />
          </div>
        </div>
      </div>

      <Separator />

      {/* التعريف بالناشر */}
      <div>
        <h3 className="text-2xl font-semibold mb-4">التعريف بالناشر</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>اسم الناشر بالعربية والفرنسية</Label>
            <Input placeholder="اسم الناشر" />
          </div>

          <div className="space-y-2">
            <Label>العنوان بالعربية والفرنسية</Label>
            <Textarea placeholder="عنوان الناشر" />
          </div>

          <div className="space-y-2">
            <Label>الهاتف</Label>
            <Input placeholder="رقم هاتف الناشر" />
          </div>

          <div className="space-y-2">
            <Label>البريد الإلكتروني <span className="text-destructive">*</span></Label>
            <Input type="email" placeholder="بريد الناشر الإلكتروني" required />
          </div>

          <div className="space-y-2">
            <Label>التاريخ المتوقع للإصدار (الشهر / السنة)</Label>
            <Input type="month" />
          </div>
        </div>
      </div>

      <Separator />

      {/* التعريف بالطابع */}
      <div>
        <h3 className="text-2xl font-semibold mb-4">التعريف بالطابع</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>اسم المطبعة</Label>
            <Input placeholder="اسم المطبعة" />
          </div>

          <div className="space-y-2">
            <Label>البريد الإلكتروني <span className="text-destructive">*</span></Label>
            <Input type="email" placeholder="بريد المطبعة الإلكتروني" required />
          </div>

          <div className="space-y-2">
            <Label>الهاتف</Label>
            <Input placeholder="هاتف المطبعة" />
          </div>

          <div className="space-y-2">
            <Label>العنوان</Label>
            <Textarea placeholder="عنوان المطبعة" />
          </div>

          <div className="space-y-2">
            <Label>عدد النسخ المطبوعة</Label>
            <Input type="number" placeholder="عدد النسخ" />
          </div>
        </div>
      </div>

      <Separator />

      {/* الوثائق المطلوب تقديمها */}
      <div>
        <h3 className="text-2xl font-semibold mb-4">الوثائق المطلوب تقديمها</h3>
        <p className="text-sm text-muted-foreground mb-4">الصيغ المقبولة: PDF، JPG، JPEG، PNG — الحجم الأقصى: 10 ميجابايت</p>
        <div className="space-y-4">
          {renderFileUpload("cover", "إرفاق الغلاف", true, "application/pdf,image/jpeg,image/jpg,image/png")}
          {renderFileUpload("summary", "إرفاق الفهرس", true, "application/pdf,image/jpeg,image/jpg,image/png")}
          {renderFileUpload("cin", "إرسال نسخة من البطاقة الوطنية للمؤلف", true, "application/pdf,image/jpeg,image/jpg,image/png")}
          {renderFileUpload("thesis-recommendation", "إرسال توصية النشر (للأطروحات)", false, "application/pdf,image/jpeg,image/jpg,image/png")}
          {renderFileUpload("quran-authorization", "إرسال توصية النشر من مؤسسة محمد السادس لنشر القرآن الكريم (للمصاحف)", false, "application/pdf,image/jpeg,image/jpg,image/png")}
        </div>

        {Object.keys(uploadedFiles).length > 0 && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">الوثائق المرفقة:</h4>
            <div className="space-y-1">
              {Object.entries(uploadedFiles).map(([type, file]) => (
                <div key={type} className="flex items-center text-sm text-green-700">
                  <CheckCircle className="w-3 h-3 mr-2" />
                  <span className="font-medium">{type}:</span>
                  <span className="ml-1">{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-accent/10 rounded-lg">
          <h4 className="font-semibold mb-2">طرائق وعدد النسخ الواجب إيداعها:</h4>
          <p className="text-sm text-muted-foreground mb-2">
            بعد نشر الكتاب، يجب إيداع النسخ في الوكالة الببليوغرافية الوطنية:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 4 نسخ للكتب المطبوعة</li>
            <li>• نسختان للكتب الإلكترونية</li>
          </ul>
        </div>
      </div>

      <Separator />

      {renderPrivacyClauseArabic()}
    </>
  );

  const renderArabicForm = () => {
    if (depositType === "monographie") {
      return renderMonographieArabicForm();
    }
    // Simplified for other types for now
    return renderMonographieArabicForm();
  };

  const handleAuthentication = async (type: "editor" | "printer" | "producer" | "distributor", credentials: any) => {
    const isBDLogiciels = depositType === 'bd_logiciels';
    
    // Authentication logic - credentials NOT logged for security
    
    
    if (type === "editor" || type === "producer") {
      setEditorData(credentials);
      const successMsg = isBDLogiciels ? "Producteur authentifié avec succès" : "Éditeur authentifié avec succès";
      toast.success(successMsg);
      // Si l'utilisateur est un éditeur/producteur, passer à l'authentification de l'imprimeur/distributeur
      // Si l'utilisateur est un imprimeur/distributeur, passer au formulaire
      if (userType === "editor" || userType === "producer") {
        setCurrentStep("printer_auth");
      } else {
        setCurrentStep("form_filling");
      }
    } else {
      setPrinterData(credentials);
      const successMsg = isBDLogiciels ? "Distributeur authentifié avec succès" : "Imprimeur authentifié avec succès";
      toast.success(successMsg);
      // Si l'utilisateur est un éditeur/producteur qui remplit les infos de l'imprimeur/distributeur, passer au formulaire
      // Si l'utilisateur est un imprimeur/distributeur, passer à l'authentification de l'éditeur/producteur
      if (userType === "editor" || userType === "producer") {
        setCurrentStep("form_filling");
      } else {
        setCurrentStep("editor_auth");
      }
    }
  };

  const handlePartnerConfirmation = () => {
    setPartnerConfirmed(true);
    setCurrentStep("form_filling");
    toast.success("Confirmation réciproque validée");
  };

  // Fonction pour enregistrer un brouillon
  const handleSaveDraft = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour enregistrer un brouillon");
      return;
    }

    setIsSavingDraft(true);
    
    try {
      // Récupérer l'ID du professionnel
      let initiatorId: string | null = null;
      let isAdminUser = false;
      
      // Vérifier si l'utilisateur est admin ou super_admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');
      
      if (roleData && roleData.length > 0) {
        isAdminUser = true;
      }
      
      const { data: registryData } = await supabase
        .from('professional_registry')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (registryData) {
        initiatorId = registryData.id;
      } else {
        const { data: requestData } = await supabase
          .from('professional_registration_requests')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .maybeSingle();
        
        if (requestData) {
          initiatorId = requestData.id;
        }
      }
      
      // Autoriser les admins même sans profil professionnel
      if (!initiatorId && !isAdminUser) {
        toast.error("Vous devez être enregistré comme professionnel");
        setIsSavingDraft(false);
        return;
      }
      
      // Pour les admins sans profil professionnel, utiliser l'user_id comme initiator_id
      if (!initiatorId && isAdminUser) {
        initiatorId = user.id;
      }

      // Préparer les données du brouillon
      const draftData = {
        initiator_id: initiatorId,
        request_number: existingRequestId ? undefined : `DL-${new Date().getFullYear()}-${Date.now()}`,
        support_type: ((supportType === 'electronique' ? 'electronique' : 'imprime') as 'imprime' | 'electronique'),
        monograph_type: (depositType === 'monographie' ? 'livres' : 
                       depositType === 'periodique' ? 'periodiques' : 
                       depositType === 'collections_specialisees' ? 'beaux_livres' : 'musique') as 'livres' | 'periodiques' | 'theses' | 'corans' | 'beaux_livres' | 'musique' | 'encyclopedies' | 'ouvrages_scolaires',
        status: 'brouillon' as const,
        title: formData.title || 'Sans titre',
        subtitle: formData.subtitle || null,
        author_name: formData.author_name || '',
        language: formData.language || language || 'fr',
        publication_date: formData.publication_date || null,
        page_count: formData.page_count ? parseInt(formData.page_count) : null,
        isbn: formData.isbn || null,
        issn: formData.issn || null,
        ismn: formData.ismn || null,
        amazon_link: formData.amazon_link || null,
        metadata: {
          depositType,
          editor: editorData,
          printer: printerData,
          publisher: selectedPublisher,
          publicationType,
          periodicity,
          printRun,
          supportType,
          editorIdentification,
          authorGender,
          customFields: customFieldsData,
          hasScale,
          hasLegend,
          collectionTitle,
          ...formData
        }
      };

      let savedId: string;
      
      if (existingRequestId) {
        // Mise à jour du brouillon existant
        const { error } = await supabase
          .from('legal_deposit_requests')
          .update(draftData)
          .eq('id', existingRequestId);
        
        if (error) throw error;
        savedId = existingRequestId;
        toast.success('Brouillon mis à jour');
      } else {
        // Création d'un nouveau brouillon
        const { data, error } = await supabase
          .from('legal_deposit_requests')
          .insert([draftData])
          .select('id')
          .single();
        
        if (error) throw error;
        savedId = data.id;
        setExistingRequestId(savedId);
        toast.success('Brouillon enregistré');
      }

      console.log('[DRAFT] Saved:', savedId);
    } catch (error: any) {
      console.error('[DRAFT] Error saving:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleFormSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour soumettre une déclaration");
      return;
    }

    if (!acceptedPrivacy) {
      toast.error(language === 'ar' ? "يجب قبول شرط حماية البيانات" : "Vous devez accepter la clause de protection des données");
      return;
    }

    // Check required documents
    const requiredDocs = ['cover', 'cin'];
    if (depositType === "monographie" || depositType === "periodique") {
      requiredDocs.push('summary');
    }

    const missingDocs = requiredDocs.filter(doc => !uploadedFiles[doc]);
    if (missingDocs.length > 0) {
      toast.error(`Documents manquants requis: ${missingDocs.join(', ')}`);
      return;
    }

    try {
      // 1. Upload des documents vers Supabase Storage
      console.log('Uploading documents...', Object.keys(uploadedFiles));
      toast.loading('Upload des documents en cours...');
      
      const uploadedDocuments = await uploadMultipleDocuments(uploadedFiles, user.id);
      console.log('Documents uploaded:', uploadedDocuments);
      
      // Préparer l'objet documents_urls avec les URLs réelles
      const documentsUrls: any = {};
      Object.entries(uploadedDocuments).forEach(([key, doc]) => {
        documentsUrls[key] = {
          url: doc.url,
          path: doc.path,
          fileName: doc.fileName,
          size: doc.size,
          type: doc.type
        };
      });
      
      toast.dismiss();
      toast.loading('Création de la demande...');

      // 2. Récupérer l'ID du professionnel - chercher d'abord dans professional_registry, sinon dans professional_registration_requests
      let initiatorId: string | null = null;
      let isAdminUser = false;
      
      // Vérifier si l'utilisateur est admin
      const { data: adminRoleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');
      
      if (adminRoleData && adminRoleData.length > 0) {
        isAdminUser = true;
      }
      
      // Essayer d'abord professional_registry
      const { data: registryData, error: registryError } = await supabase
        .from('professional_registry')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (registryError) {
        console.error('[DEPOSIT] Registry query error:', registryError);
      }
      
      if (registryData) {
        initiatorId = registryData.id;
        console.log('[DEPOSIT] Found in professional_registry:', initiatorId);
      } else {
        // Sinon chercher dans professional_registration_requests (inscriptions approuvées)
        const { data: requestData, error: requestQueryError } = await supabase
          .from('professional_registration_requests')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .maybeSingle();
        
        if (requestQueryError) {
          console.error('[DEPOSIT] Request query error:', requestQueryError);
        }
        
        if (requestData) {
          initiatorId = requestData.id;
          console.log('[DEPOSIT] Found in professional_registration_requests:', initiatorId);
        }
      }
      
      // Autoriser les admins même sans profil professionnel
      if (!initiatorId && !isAdminUser) {
        toast.dismiss();
        toast.error("Vous devez être enregistré comme professionnel pour soumettre une déclaration");
        return;
      }
      
      // Pour les admins sans profil professionnel, utiliser l'user_id comme initiator_id
      if (!initiatorId && isAdminUser) {
        initiatorId = user.id;
        console.log('[DEPOSIT] Admin user, using user_id as initiator:', initiatorId);
      }

      console.log('[DEPOSIT DEBUG] User ID:', user.id);
      console.log('[DEPOSIT DEBUG] Initiator ID:', initiatorId);
      console.log('[DEPOSIT DEBUG] User type:', userType);

      // Créer la demande de dépôt légal
      const requestNumber = `DL-${new Date().getFullYear()}-${Date.now()}`;
      
      // Déterminer le monograph_type basé sur le depositType
      let monographType: 'livres' | 'periodiques' | 'theses' | 'corans' | 'beaux_livres' | 'musique' | 'encyclopedies' | 'ouvrages_scolaires' = 'livres';
      if (depositType === 'monographie') monographType = 'livres';
      else if (depositType === 'periodique') monographType = 'periodiques';
      else if (depositType === 'collections_specialisees') monographType = 'beaux_livres'; // Default for collections
      else if (depositType === 'bd_logiciels') monographType = 'musique'; // Default for BD/software
      
      const newRequest = {
        initiator_id: initiatorId,
        request_number: requestNumber,
        support_type: 'imprime' as const,
        monograph_type: monographType,
        status: 'brouillon' as const,
        title: formData.title || 'Sans titre',
        subtitle: formData.subtitle || null,
        author_name: formData.author_name || '',
        language: formData.language || language || 'fr',
        publication_date: formData.publication_date || null,
        page_count: formData.page_count ? parseInt(formData.page_count) : null,
        isbn: formData.isbn || null,
        issn: formData.issn || null,
        ismn: formData.ismn || null,
        publication_status: formData.publication_status || null,
        documents_urls: documentsUrls,
        amazon_link: formData.amazon_link || null,
        requires_amazon_validation: !!formData.amazon_link,
        metadata: {
          depositType,
          editor: editorData,
          printer: printerData,
          distributor: selectedDistributor,
          producer: selectedProducer,
          publisher: selectedPublisher,
          publicationType: publicationType,
          periodicity: periodicity,
          hasScale: hasScale,
          hasLegend: hasLegend,
          collectionTitle: collectionTitle,
          printRun: printRun,
          editorIdentification: editorIdentification,
          authorGender: authorGender,
          customFields: customFieldsData,
          ...formData
        }
      };
      
      const { data: requestData, error: requestError } = await supabase
        .from('legal_deposit_requests')
        .insert([newRequest])
        .select()
        .single();

      if (requestError) throw requestError;

      // Créer l'entrée pour l'initiateur dans legal_deposit_parties
      const isBDLogiciels = depositType === 'bd_logiciels';
      let partyRole = 'editor';
      if (userType === 'producer') partyRole = 'producer';
      else if (userType === 'printer') partyRole = 'printer';
      else if (userType === 'distributor') partyRole = 'printer'; // Distributor uses printer role in DB
      else if (userType === 'editor') partyRole = 'editor';
      
      const { error: partyError } = await supabase
        .from('legal_deposit_parties')
        .insert({
          request_id: requestData.id,
          user_id: user.id,
          party_role: partyRole,
          is_initiator: true,
          approval_status: 'approved', // L'initiateur est automatiquement approuvé
          approval_date: new Date().toISOString()
        });

      if (partyError) throw partyError;

      // Si un collaborateur a été spécifié, l'ajouter
      if (printerData && printerData.email) {
        // Trouver le professionnel par email
        const { data: collaboratorProf } = await supabase
          .from('professional_registry')
          .select('id, user_id')
          .eq('email', printerData.email)
          .single();

        if (collaboratorProf) {
          // Mettre à jour la demande avec le collaborateur
          await supabase
            .from('legal_deposit_requests')
            .update({ collaborator_id: collaboratorProf.id })
            .eq('id', requestData.id);

          // Créer l'entrée pour le collaborateur
          await supabase
            .from('legal_deposit_parties')
            .insert({
              request_id: requestData.id,
              user_id: collaboratorProf.user_id,
              party_role: 'printer',
              is_initiator: false,
              approval_status: 'pending'
            });

          // Envoyer une notification au collaborateur
          await supabase.functions.invoke('notify-deposit-party', {
            body: {
              requestId: requestData.id,
              partyUserId: collaboratorProf.user_id,
              partyRole: 'printer'
            }
          });
        }
      }

      // Vérifier si une confirmation réciproque est requise (Monographies et Périodiques uniquement, support imprimé)
      // Utiliser les données du publisher/printer sélectionnés si editorData/printerData sont vides
      const effectiveEditorEmail = editorData?.email || selectedPublisher?.email;
      const effectivePrinterEmail = printerData?.email || selectedPrinter?.email;
      
      console.log('[DEPOSIT] Checking reciprocal confirmation:', {
        depositType,
        supportType,
        effectiveEditorEmail,
        effectivePrinterEmail,
        editorDataEmail: editorData?.email,
        printerDataEmail: printerData?.email,
        selectedPublisherEmail: selectedPublisher?.email,
        selectedPrinterEmail: selectedPrinter?.email
      });
      
      // Confirmation réciproque requise pour tous les types de dépôt légal
      // quand les deux parties (éditeur et imprimeur) sont identifiées
      const requiresReciprocalConfirmation = 
        (depositType === 'monographie' || depositType === 'periodique' || 
         depositType === 'bd_logiciels' || depositType === 'collections_specialisees') && 
        effectiveEditorEmail && 
        effectivePrinterEmail;

      if (requiresReciprocalConfirmation) {
        // Mettre le statut en attente de confirmation réciproque
        // On utilise 'soumis' mais avec confirmation_status 'pending_confirmation'
        const { error: updateStatusError } = await supabase
          .from('legal_deposit_requests')
          .update({ 
            status: 'soumis',
            confirmation_status: 'pending_confirmation',
            submission_date: new Date().toISOString()
          })
          .eq('id', requestData.id);

        if (updateStatusError) throw updateStatusError;

        // Appeler l'edge function pour créer les tokens et envoyer les emails
        toast.loading('Envoi des demandes de confirmation...');
        
        const { data: confirmData, error: confirmError } = await supabase.functions.invoke('deposit-confirmation', {
          body: {
            action: 'create_tokens',
            request_id: requestData.id,
            editor_email: effectiveEditorEmail,
            editor_name: editorData?.name || selectedPublisher?.name || 'Éditeur',
            printer_email: effectivePrinterEmail,
            printer_name: printerData?.name || selectedPrinter?.name || 'Imprimeur',
            deposit_type: depositTypeLabels[depositType],
            title: formData.title || 'Sans titre',
            initiator_type: userType === 'editor' || userType === 'producer' ? 'editor' : 'printer'
          }
        });

        toast.dismiss();

        if (confirmError) {
          console.error('Confirmation workflow error:', confirmError);
          toast.warning('Demande créée mais erreur lors de l\'envoi des confirmations. Vous pouvez relancer depuis votre espace.');
        } else {
          console.log('Confirmation workflow initiated:', confirmData);
          toast.success(
            language === 'ar' 
              ? "تم إرسال التصريح. في انتظار تأكيد الطرفين" 
              : "Demande soumise. En attente de confirmation de l'éditeur et de l'imprimeur"
          );
        }
      } else {
        // Pas de confirmation réciproque requise - soumettre directement
        const { error: submitError } = await supabase
          .from('legal_deposit_requests')
          .update({ 
            status: 'soumis',
            submission_date: new Date().toISOString()
          })
          .eq('id', requestData.id);

        if (submitError) throw submitError;

        toast.dismiss();
        toast.success(language === 'ar' ? "تم إرسال التصريح بنجاح" : "Déclaration de dépôt légal soumise avec succès");
      }

      setCurrentStep("confirmation");
      
      // Rediriger vers la page des approbations après 2 secondes
      setTimeout(() => {
        navigate('/deposit-approvals');
      }, 2000);
    } catch (error: any) {
      console.error("Error submitting declaration:", error);
      toast.dismiss();
      toast.error(`Erreur lors de la soumission: ${error.message}`);
    }
  };

  // Contenu de l'étape actuelle
  const renderStepContent = () => {
    if (currentStep === "type_selection") {
      const isBDLogiciels = depositType === 'bd_logiciels';
      
      return (
        <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            {language === 'ar' ? 'نوع المستخدم' : 'Type d\'utilisateur'}
          </CardTitle>
          <CardDescription className="text-center">
            {language === 'ar' ? 
              'اختر نوع المستخدم للمتابعة' : 
              'Sélectionnez votre type d\'utilisateur pour continuer'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => {
              setUserType(isBDLogiciels ? "producer" : "editor");
              setCurrentStep("editor_auth");
            }}
            className="w-full h-20 text-lg flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <FileText className="h-8 w-8" />
            {language === 'ar' ? 
              (isBDLogiciels ? 'منتج' : 'ناشر') : 
              (isBDLogiciels ? 'Producteur' : 'Éditeur')
            }
          </Button>
          
          {!isBDLogiciels && (
            <Button 
              onClick={() => {
                setUserType("printer");
                setCurrentStep("printer_auth");
              }}
              className="w-full h-20 text-lg flex flex-col items-center justify-center gap-2"
              variant="outline"
            >
              <FileText className="h-8 w-8" />
              {language === 'ar' ? 'طابع' : 'Imprimeur'}
            </Button>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="ghost" onClick={onClose} className="w-full">
            {language === 'ar' ? 'إلغاء' : 'Annuler'}
          </Button>
        </CardFooter>
      </Card>
      );
    }

    if (currentStep === "editor_auth") {
    const isBDLogiciels = depositType === 'bd_logiciels';
    const roleLabel = isBDLogiciels ? 
      (language === 'ar' ? 'المنتج' : 'producteur') : 
      (language === 'ar' ? 'الناشر' : 'éditeur');
    const roleTitleLabel = isBDLogiciels ? 
      (language === 'ar' ? 'تحديد هوية المنتج' : 'Identification du producteur') : 
      (language === 'ar' ? 'تحديد هوية الناشر' : 'Identification de l\'éditeur');
    const roleDescLabel = isBDLogiciels ?
      (language === 'ar' ? 'يرجى تقديم معلومات المنتج للمصادقة' : 'Veuillez fournir les informations du producteur pour authentification') :
      (language === 'ar' ? 'يرجى تقديم معلومات الناشر للمصادقة' : 'Veuillez fournir les informations de l\'éditeur pour authentification');
    
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            {roleTitleLabel}
          </CardTitle>
          <CardDescription>
            {roleDescLabel}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'طبيعة الناشر' : 'Nature de l\'éditeur'}</Label>
              <InlineSelect
                value={publisherNature}
                onChange={setPublisherNature}
                placeholder={language === 'ar' ? 'اختر الطبيعة' : 'Sélectionner la nature'}
                options={[
                  { value: "publique", label: language === 'ar' ? 'عام' : 'Publique' },
                  { value: "semi-public", label: language === 'ar' ? 'شبه عام' : 'Semi-public' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الاسم' : 'Nom'} <span className="text-destructive">*</span></Label>
              {!selectedPublisher ? (
                <div className="relative">
                  <Input
                    placeholder={language === 'ar' ? `بحث عن ${roleLabel}...` : `Rechercher un ${roleLabel}...`}
                    value={publisherSearch}
                    onChange={(e) => setPublisherSearch(e.target.value)}
                    className="pr-10"
                  />
                  {publisherSearch && (
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
                      {(isBDLogiciels ? producers : publishers)
                        .filter(pub => 
                          pub.name.toLowerCase().includes(publisherSearch.toLowerCase())
                        )
                        .map((pub) => (
                          <button
                            key={pub.id}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                            onClick={() => {
                              setSelectedPublisher(pub as any);
                              setPublisherSearch('');
                              setEditorData({ 
                                name: pub.name,
                                phone: pub.phone || '',
                                email: pub.email || '',
                                googleMapsLink: (pub as any).google_maps_link || '',
                                address: pub.address || '',
                                city: pub.city || '',
                                country: pub.country || '',
                                ...pub
                              });
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{pub.name}</span>
                              {pub.city && (
                                <span className="text-sm text-muted-foreground">
                                  {pub.city}, {pub.country}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-accent transition-colors border-t font-medium"
                        onClick={() => {
                          setEditorData({ name: publisherSearch, isOther: true });
                          setSelectedPublisher({ id: 'other', name: publisherSearch } as Publisher);
                          setPublisherSearch('');
                        }}
                      >
                        {language === 'ar' ? 'آخر' : 'Autre'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-primary/10 rounded-md flex justify-between items-start">
                  <div>
                    <p className="font-medium">{selectedPublisher.name}</p>
                    {selectedPublisher.city && selectedPublisher.id !== 'other' && (
                      <p className="text-sm text-muted-foreground">
                        {selectedPublisher.city}, {selectedPublisher.country}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPublisher(null);
                      setEditorData({});
                    }}
                  >
                    {language === 'ar' ? 'تعديل' : 'Modifier'}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'رابط خرائط Google' : 'Lien Google Maps'} <span className="text-destructive">*</span></Label>
              <Input 
                placeholder={language === 'ar' ? 'https://maps.google.com/?q=...' : 'https://maps.google.com/?q=...'}
                value={editorData.googleMapsLink || ''}
                onChange={(e) => setEditorData({ ...editorData, googleMapsLink: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? 'الصق رابط موقعك على خرائط Google' : 'Collez le lien de localisation Google Maps'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الهاتف' : 'Téléphone'} <span className="text-destructive">*</span></Label>
              <Input 
                placeholder={language === 'ar' ? 'رقم الهاتف' : 'Numéro de téléphone'}
                value={editorData.phone || ''}
                onChange={(e) => setEditorData({ ...editorData, phone: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'} <span className="text-destructive">*</span></Label>
              <Input 
                type="email" 
                placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Adresse email'}
                value={editorData.email || ''}
                onChange={(e) => setEditorData({ ...editorData, email: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose} className="text-red-600 hover:text-red-700">
            {language === 'ar' ? 'إلغاء' : 'Annuler'}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setCurrentStep("type_selection")}>
              {language === 'ar' ? 'رجوع' : 'Retour'}
            </Button>
            <Button onClick={() => handleAuthentication(isBDLogiciels ? "producer" : "editor", {
              name: editorData.name || "",
              address: editorData.address || "",
              phone: editorData.phone || "",
              email: editorData.email || "",
              googleMapsLink: editorData.googleMapsLink || "",
              publicationDate: ""
            })}>
              {language === 'ar' ? 'متابعة' : 'Continuer'}
            </Button>
          </div>
        </CardFooter>
      </Card>
      );
    }

    if (currentStep === "printer_auth") {
    const isBDLogiciels = depositType === 'bd_logiciels';
    const roleLabel = isBDLogiciels ? 
      (language === 'ar' ? 'الموزع' : 'distributeur') : 
      (language === 'ar' ? 'الطابع' : 'imprimeur');
    const roleTitleLabel = isBDLogiciels ? 
      (language === 'ar' ? 'تحديد هوية الموزع' : 'Identification du distributeur') : 
      (language === 'ar' ? 'تحديد هوية الطابع' : 'Identification de l\'imprimeur');
    const firstRoleLabel = isBDLogiciels ?
      (language === 'ar' ? 'المنتج' : 'producteur') :
      (language === 'ar' ? 'الناشر' : 'éditeur');
    const isFirstRole = userType === "editor" || userType === "producer";
    
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            {roleTitleLabel}
          </CardTitle>
          <CardDescription>
            {isFirstRole ? 
              (language === 'ar' ? 
                `الآن نحتاج لمعلومات ${roleLabel}` :
                `Nous avons maintenant besoin des informations du ${roleLabel}`
              ) :
              (language === 'ar' ?
                `يرجى تقديم معلومات ${roleLabel} للمصادقة` :
                `Veuillez fournir les informations du ${roleLabel} pour authentification`
              )
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الاسم' : 'Nom'} <span className="text-destructive">*</span></Label>
              {!selectedPrinter ? (
                <div className="relative">
                  <Input
                    placeholder={language === 'ar' ? `ابحث عن ${roleLabel}...` : `Rechercher un ${roleLabel}...`}
                    value={printerSearch}
                    onChange={(e) => setPrinterSearch(e.target.value)}
                  />
                  {printerSearch && (
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
                      {(isBDLogiciels ? distributors : printers)
                        .filter(printer => 
                          printer.name.toLowerCase().includes(printerSearch.toLowerCase())
                        )
                        .map((printer) => (
                          <button
                            key={printer.id}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                            onClick={() => {
                              setSelectedPrinter(printer as any);
                              setPrinterSearch('');
                              setPrinterData({ 
                                name: printer.name,
                                phone: printer.phone || '',
                                email: printer.email || '',
                                googleMapsLink: (printer as any).google_maps_link || '',
                                address: printer.address || '',
                                city: printer.city || '',
                                country: printer.country || '',
                                ...printer
                              });
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{printer.name}</span>
                              {printer.city && (
                                <span className="text-sm text-muted-foreground">
                                  {printer.city}, {printer.country}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-primary/10 rounded-md flex justify-between items-start">
                  <div>
                    <p className="font-medium">{selectedPrinter.name}</p>
                    {selectedPrinter.city && (
                      <p className="text-sm text-muted-foreground">
                        {selectedPrinter.city}, {selectedPrinter.country}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPrinter(null);
                      setPrinterData({});
                    }}
                  >
                    {language === 'ar' ? 'تعديل' : 'Modifier'}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'رابط خرائط جوجل' : 'Lien Google Maps'} <span className="text-destructive">*</span></Label>
              <Input 
                placeholder="https://maps.google.com/?q=..."
                value={printerData.googleMapsLink || ''}
                onChange={(e) => setPrinterData({ ...printerData, googleMapsLink: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? 'الصق رابط الموقع على خرائط جوجل' : 'Collez le lien de localisation Google Maps'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الهاتف' : 'Téléphone'} <span className="text-destructive">*</span></Label>
              <Input 
                placeholder={language === 'ar' ? 'رقم الهاتف' : 'Numéro de téléphone'}
                value={printerData.phone || ''}
                onChange={(e) => setPrinterData({ ...printerData, phone: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'} <span className="text-destructive">*</span></Label>
              <Input 
                type="email" 
                placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Adresse email'}
                value={printerData.email || ''}
                onChange={(e) => setPrinterData({ ...printerData, email: e.target.value })}
              />
            </div>
          </div>

        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose} className="text-red-600 hover:text-red-700">
            {language === 'ar' ? 'إلغاء' : 'Annuler'}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setCurrentStep(isFirstRole ? "editor_auth" : "type_selection")}>
              {language === 'ar' ? 'رجوع' : 'Retour'}
            </Button>
            <Button onClick={() => handleAuthentication(isBDLogiciels ? "distributor" : "printer", {
              name: printerData.name || "",
              address: printerData.address || "",
              phone: printerData.phone || "",
              email: printerData.email || "",
              googleMapsLink: printerData.googleMapsLink || "",
              printRun: printerData.printRun || ""
            })}>
              {language === 'ar' ? 'متابعة' : 'Continuer'}
            </Button>
          </div>
        </CardFooter>
      </Card>
      );
    }

    if (currentStep === "form_filling") {
      return (
        <>
          <div className="w-full max-w-6xl mx-auto space-y-4">
          <Button
            variant="ghost"
            onClick={() => {
              // Si un type initial est fourni, fermer le formulaire; sinon retour à l'étape précédente
              if (initialUserType) {
                onClose();
              } else {
                setCurrentStep(userType === "printer" ? "printer_auth" : "editor_auth");
              }
            }}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'رجوع' : 'Retour'}
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {language === 'ar' ? 
                    `تصريح الإيداع القانوني - ${depositTypeLabels[depositType]}` :
                    `Déclaration de dépôt légal - ${depositTypeLabels[depositType]}`
                  }
                </div>
              </CardTitle>
              <CardDescription>
                {language === 'ar' ? 
                  'يرجى ملء جميع الحقول المطلوبة' :
                  'Veuillez remplir tous les champs requis'
                }
              </CardDescription>
            </CardHeader>
          
          <CardContent className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {language === 'ar' ? renderArabicForm() : renderFrenchForm()}
          </CardContent>

          <CardFooter className="flex justify-between flex-wrap gap-2">
            <Button variant="outline" onClick={onClose} className="text-red-600 hover:text-red-700">
              {language === 'ar' ? 'إلغاء' : 'Annuler'}
            </Button>
            <div className="flex gap-2 flex-wrap">
              <Button variant="ghost" onClick={() => setCurrentStep("printer_auth")}>
                {language === 'ar' ? 'رجوع' : 'Retour'}
              </Button>
              <Button 
                variant="secondary"
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
              >
                {isSavingDraft ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === 'ar' ? 'جارٍ الحفظ...' : 'Enregistrement...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {language === 'ar' ? 'حفظ' : 'Enregistrer'}
                  </>
                )}
              </Button>
              <Button 
                onClick={handleFormSubmit}
                disabled={!acceptedPrivacy}
              >
                {language === 'ar' ? 'إرسال التصريح' : 'Soumettre la demande'}
              </Button>
            </div>
          </CardFooter>
          </Card>
        </div>

        {/* Modale ISSN */}
        <ScrollableDialogNestedRoot open={isIssnModalOpen} onOpenChange={setIsIssnModalOpen}>
          <ScrollableDialogContent className="max-w-[700px]">
            <ScrollableDialogHeader>
              <ScrollableDialogTitle className="text-xl text-[#0E2D5C]">
                Demande d'ISSN – Publication périodique
              </ScrollableDialogTitle>
              <ScrollableDialogDescription>
                Veuillez remplir les informations suivantes pour votre demande d'ISSN
              </ScrollableDialogDescription>
            </ScrollableDialogHeader>

            <ScrollableDialogBody>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Titre de la publication <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="Titre de la publication"
                    value={issnFormData.title}
                    onChange={(e) => setIssnFormData({ ...issnFormData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Discipline / domaine <span className="text-destructive">*</span></Label>
                  <DisciplineAutocomplete
                    placeholder="Rechercher une discipline..."
                    value={issnFormData.discipline}
                    onChange={(value) => setIssnFormData({ ...issnFormData, discipline: value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Langue principale <span className="text-destructive">*</span></Label>
                  <LanguageAutocomplete
                    placeholder="Rechercher une langue..."
                    value={issnFormData.language}
                    onChange={(value) => setIssnFormData({ ...issnFormData, language: value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pays d'édition <span className="text-destructive">*</span></Label>
                  <CountrySingleAutocomplete
                    placeholder="Rechercher un pays..."
                    value={issnFormData.country}
                    onChange={(value) => setIssnFormData({ ...issnFormData, country: value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Éditeur <span className="text-destructive">*</span></Label>
                  <PublisherAutocomplete
                    placeholder="Rechercher un éditeur..."
                    value={issnFormData.publisher}
                    onChange={(value) => setIssnFormData({ ...issnFormData, publisher: value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Support <span className="text-destructive">*</span></Label>
                  <InlineSelect
                    placeholder="Sélectionner le support"
                    value={issnFormData.support}
                    onChange={(value) => setIssnFormData({ ...issnFormData, support: value })}
                    options={[
                      { value: "papier", label: "Papier" },
                      { value: "en_ligne", label: "En ligne" },
                      { value: "mixte", label: "Mixte" },
                    ]}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fréquence de parution <span className="text-destructive">*</span></Label>
                  <InlineSelect
                    placeholder="Sélectionner la fréquence"
                    value={issnFormData.frequency}
                    onChange={(value) => setIssnFormData({ ...issnFormData, frequency: value })}
                    options={[
                      { value: "hebdomadaire", label: "Hebdomadaire" },
                      { value: "mensuelle", label: "Mensuelle" },
                      { value: "trimestrielle", label: "Trimestrielle" },
                      { value: "annuelle", label: "Annuelle" },
                    ]}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Adresse de contact <span className="text-destructive">*</span></Label>
                  <Textarea
                    placeholder="Adresse de contact complète"
                    value={issnFormData.contactAddress}
                    onChange={(e) => setIssnFormData({ ...issnFormData, contactAddress: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fichier justificatif (exemple de couverture ou sommaire)</Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setIssnFormData({ ...issnFormData, justificationFile: file });
                      }
                    }}
                  />
                  {issnFormData.justificationFile && (
                    <p className="text-xs text-muted-foreground">
                      Fichier sélectionné : {issnFormData.justificationFile.name}
                    </p>
                  )}
                </div>
              </div>
            </ScrollableDialogBody>

            <ScrollableDialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsIssnModalOpen(false)}
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleIssnSubmit}
              >
                ✅ Soumettre la demande ISSN
              </Button>
            </ScrollableDialogFooter>
          </ScrollableDialogContent>
        </ScrollableDialogNestedRoot>
        </>
      );
    }

    if (currentStep === "confirmation") {
      return (
        <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-700">
              {language === 'ar' ? 'تم الإرسال بنجاح!' : 'Soumission réussie !'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' ? 
                'تم إرسال تصريح الإيداع القانوني بنجاح' :
                'Votre déclaration de dépôt légal a été soumise avec succès'
              }
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">
              {language === 'ar' ? 
                'ستتلقى رقم الإيداع القانوني قريباً عبر البريد الإلكتروني' :
                'Vous recevrez bientôt votre numéro de dépôt légal par email'
              }
            </p>
          </div>
          
          <div className="space-y-2">
            <Badge variant="secondary" className="mr-2">
              {language === 'ar' ? 'نوع الإيداع' : 'Type de dépôt'}: {depositTypeLabels[depositType]}
            </Badge>
            <Badge variant="secondary">
              {language === 'ar' ? 'الوثائق المرفقة' : 'Documents joints'}: {Object.keys(uploadedFiles).length}
            </Badge>
          </div>
        </CardContent>

        <CardFooter>
          <Button onClick={onClose} className="w-full">
            {language === 'ar' ? 'إغلاق' : 'Fermer'}
          </Button>
        </CardFooter>
      </Card>
      );
    }

    return null;
  };

  // Render avec Header fixe et filigrane BNRM
  return (
    <WatermarkContainer
      watermarkProps={{
        text: "BNRM - Bibliothèque Nationale du Royaume du Maroc",
        variant: "library",
        position: "scattered",
        opacity: 0.03
      }}
    >
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shadow-sm mb-6">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 shadow-md">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="text-xl md:text-2xl font-bold text-foreground">
                    Déclaration de dépôt légal - {depositTypeLabels[depositType]}
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Remplissez le formulaire ci-dessous pour soumettre votre déclaration
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          {renderStepContent()}
        </main>
        <Footer />
      </div>
    </WatermarkContainer>
  );
}
