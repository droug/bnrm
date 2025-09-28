import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, Clock, FileText, Upload, X, File } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

interface LegalDepositDeclarationProps {
  depositType: "monographie" | "periodique" | "bd_logiciels" | "collections_specialisees";
  onClose: () => void;
}

export default function LegalDepositDeclaration({ depositType, onClose }: LegalDepositDeclarationProps) {
  const { language, isRTL } = useLanguage();
  const [currentStep, setCurrentStep] = useState<"type_selection" | "editor_auth" | "printer_auth" | "form_filling" | "confirmation">("type_selection");
  const [userType, setUserType] = useState<"editor" | "printer" | null>(null);
  const [partnerConfirmed, setPartnerConfirmed] = useState(false);
  const [editorData, setEditorData] = useState<any>({});
  const [printerData, setPrinterData] = useState<any>({});
  const [formData, setFormData] = useState<any>({});
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const depositTypeLabels = {
    monographie: "Monographies",
    periodique: "Publications Périodiques",
    bd_logiciels: "Bases de données, Logiciels et Documents audiovisuels",
    collections_specialisees: "Collections spécialisées"
  };

  const handleFileUpload = (documentType: string, file: File | null) => {
    if (!file) return;

    // Validate file type and size
    const allowedTypes = {
      cover: ['image/jpeg', 'image/jpg'],
      summary: ['application/pdf'],
      cin: ['image/jpeg', 'image/jpg', 'application/pdf'],
      'court-decision': ['application/pdf'],
      'thesis-recommendation': ['application/pdf'],
      'quran-authorization': ['application/pdf']
    };

    const maxSizes = {
      cover: 1 * 1024 * 1024, // 1MB
      summary: 2 * 1024 * 1024, // 2MB
      cin: 2 * 1024 * 1024, // 2MB
      'court-decision': 5 * 1024 * 1024, // 5MB
      'thesis-recommendation': 5 * 1024 * 1024, // 5MB
      'quran-authorization': 5 * 1024 * 1024 // 5MB
    };

    const allowedTypesForDoc = allowedTypes[documentType as keyof typeof allowedTypes] || [];
    const maxSize = maxSizes[documentType as keyof typeof maxSizes] || 5 * 1024 * 1024;

    if (!allowedTypesForDoc.includes(file.type)) {
      toast.error(`Type de fichier non autorisé pour ${documentType}. Types acceptés: ${allowedTypesForDoc.join(', ')}`);
      return;
    }

    if (file.size > maxSize) {
      toast.error(`Fichier trop volumineux. Taille maximum: ${Math.round(maxSize / 1024 / 1024)}MB`);
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
        <h3 className="text-lg font-semibold mb-4">التعريف بالمؤلف</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>نوع المؤلف</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="اختر النوع" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="physique">شخص مادي</SelectItem>
                <SelectItem value="morale">شخص معنوي (هيئة)</SelectItem>
              </SelectContent>
            </Select>
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
            <Label>البريد الإلكتروني</Label>
            <Input type="email" placeholder="البريد الإلكتروني" />
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
        <h3 className="text-lg font-semibold mb-4">التعريف بالوثيقة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label>عنوان الكتاب</Label>
            <Input placeholder="عنوان الكتاب" />
          </div>

          <div className="space-y-2">
            <Label>نوع الحامل</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الحامل" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="printed">مطبوع</SelectItem>
                <SelectItem value="electronic">إلكتروني</SelectItem>
              </SelectContent>
            </Select>
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
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="اختر اللغة" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="fr">الفرنسية</SelectItem>
                <SelectItem value="en">الإنجليزية</SelectItem>
                <SelectItem value="ber">الأمازيغية</SelectItem>
              </SelectContent>
            </Select>
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
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="اختر" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="yes">نعم</SelectItem>
                <SelectItem value="no">لا</SelectItem>
              </SelectContent>
            </Select>
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
        <h3 className="text-lg font-semibold mb-4">التعريف بالناشر</h3>
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
            <Label>البريد الإلكتروني</Label>
            <Input type="email" placeholder="بريد الناشر الإلكتروني" />
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
        <h3 className="text-lg font-semibold mb-4">التعريف بالطابع</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>اسم المطبعة</Label>
            <Input placeholder="اسم المطبعة" />
          </div>

          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input type="email" placeholder="بريد المطبعة الإلكتروني" />
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
        <h3 className="text-lg font-semibold mb-4">الوثائق المطلوب تقديمها</h3>
        <div className="space-y-4">
          {renderFileUpload("cover", "إرفاق الغلاف (Format « jpg » moins de 1 MO)", true, "image/jpeg")}
          {renderFileUpload("summary", "إرفاق الفهرس (Format « PDF » moins de 2 MO)", true, "application/pdf")}
          {renderFileUpload("cin", "إرسال نسخة من البطاقة الوطنية للمؤلف", true, "image/jpeg,application/pdf")}
          {renderFileUpload("thesis-recommendation", "إرسال توصية النشر (للأطروحات)", false, "application/pdf")}
          {renderFileUpload("quran-authorization", "إرسال توصية النشر من مؤسسة محمد السادس لنشر القرآن الكريم (للمصاحف)", false, "application/pdf")}
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

        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-semibold mb-2">عنوان الإرسال:</h4>
          <p className="text-sm text-muted-foreground">
            يجب إرسال الوثائق إلى العنوان الإلكتروني التالي: <strong>depot.legal@bnrm.ma</strong>
          </p>
        </div>

        <div className="mt-4 p-4 bg-accent/10 rounded-lg">
          <h4 className="font-semibold mb-2">الشروط وعدد النسخ الواجب إرسالها:</h4>
          <p className="text-sm text-muted-foreground mb-2">
            بمجرد نشر العمل، يجب إيداع النسخ لدى الوكالة البيبليوغرافية الوطنية:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 4 نسخ للكتب المطبوعة</li>
            <li>• 2 نسخ للكتب الإلكترونية</li>
          </ul>
          
          <div className="mt-3 p-3 bg-background/50 rounded border-l-4 border-primary">
            <h5 className="font-medium text-sm mb-1">للكتب الإلكترونية:</h5>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• إيداع نسختين متطابقتين بنفس نوعية الحامل</li>
              <li>• إيداع كل نسخة في غلاف خاص بها مع إظهار العنوان والأرقام التي تم الحصول عليها</li>
              <li>• تضمين الملخص بصيغة نصية داخل النسخة المقدمة</li>
              <li>• ملحوظة: يوصى باستخدام حامل وسائط على شكل بطاقة بشكل أفضل لضمان حفظ المحتوى على المدى الطويل</li>
            </ul>
          </div>
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

  const renderFrenchForm = () => (
    <>
      {/* Section Auteur/Directeur selon le type */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {depositType === "periodique" ? "Directeur de la publication" : "Identification de l'auteur"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {depositType !== "periodique" && (
            <div className="space-y-2">
              <Label>Type de l'auteur</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="physique">Personne physique</SelectItem>
                  <SelectItem value="morale">Personne morale (collectivités)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>
              {depositType === "periodique" ? "Nom et prénom" : 
               depositType === "bd_logiciels" ? "Nom de la collectivité / Nom de l'Auteur" :
               "Nom de la collectivité / Nom de l'auteur"}
            </Label>
            <Input placeholder="Nom complet" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Pièces à fournir */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Pièces à fournir</h3>
        <div className="space-y-4">
          {renderFileUpload("cover", "Joindre la couverture (format « jpg » moins de 1 MO)", true, "image/jpeg")}
          
          {(depositType === "monographie" || depositType === "periodique") && (
            renderFileUpload("summary", "Joindre le sommaire (format « PDF » moins de 2 MO)", true, "application/pdf")
          )}
          
          {renderFileUpload("cin", "Envoyer une copie de la CIN de l'auteur", true, "image/jpeg,application/pdf")}
          
          {depositType === "periodique" && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                Pour les périodiques dont l'éditeur n'est pas étatique, il est nécessaire d'envoyer la décision du tribunal de première instance, 
                dont le délai de réception ne doit pas excéder une année.
              </p>
              {renderFileUpload("court-decision", "Décision du tribunal (pour les périodiques non étatiques)", false, "application/pdf")}
            </div>
          )}

          {depositType === "monographie" && (
            <>
              {renderFileUpload(
                "thesis-recommendation", 
                "Recommandation de publication (pour les thèses)", 
                false, 
                "application/pdf"
              )}
              {renderFileUpload(
                "quran-authorization", 
                "Autorisation de publication de la Fondation Mohammed VI (pour les Corans)", 
                false, 
                "application/pdf"
              )}
            </>
          )}
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

        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-semibold mb-2">Adresse d'envoi :</h4>
          <p className="text-sm text-muted-foreground">
            Les pièces doivent être envoyées à l'adresse e-mail suivante : <strong>depot.legal@bnrm.ma</strong>
          </p>
        </div>

        <div className="mt-4 p-4 bg-accent/10 rounded-lg">
          <h4 className="font-semibold mb-2">Modalités et nombre d'exemplaires à déposer :</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Une fois l'ouvrage publié, les exemplaires doivent être déposés à l'Agence Bibliographique Nationale :
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {depositType === "monographie" && (
              <>
                <li>• 4 exemplaires pour les monographies imprimées</li>
                <li>• 2 exemplaires pour les e-books</li>
              </>
            )}
            {depositType === "periodique" && (
              <li>• 4 exemplaires pour les périodiques imprimés</li>
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
                <li>• Inclure le résumé sous format texte (Word par exemple)</li>
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

  const handleAuthentication = async (type: "editor" | "printer", credentials: any) => {
    // Simulate authentication
    console.log(`Authenticating ${type}:`, credentials);
    
    if (type === "editor") {
      setEditorData(credentials);
    } else {
      setPrinterData(credentials);
    }
    
    toast.success(`${type === "editor" ? "Éditeur" : "Imprimeur"} authentifié avec succès`);
    
    if (userType === "editor") {
      setCurrentStep("printer_auth");
    } else {
      setCurrentStep("form_filling");
    }
  };

  const handlePartnerConfirmation = () => {
    setPartnerConfirmed(true);
    setCurrentStep("form_filling");
    toast.success("Confirmation réciproque validée");
  };

  const handleFormSubmit = async () => {
    if (!acceptedPrivacy) {
      toast.error(language === 'ar' ? "يجب قبول شرط حماية البيانات" : "Vous devez accepter la clause de protection des données");
      return;
    }

    if (!partnerConfirmed) {
      toast.error(language === 'ar' ? "تأكيد الشراكة مطلوب" : "La confirmation réciproque entre éditeur et imprimeur est requise");
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

    // Submit form data with files
    console.log("Submitting declaration:", {
      type: depositType,
      editor: editorData,
      printer: printerData,
      declaration: formData,
      documents: Object.keys(uploadedFiles).map(key => ({
        type: key,
        file: uploadedFiles[key],
        name: uploadedFiles[key].name,
        size: uploadedFiles[key].size
      }))
    });

    toast.success(language === 'ar' ? "تم إرسال التصريح بنجاح" : "Déclaration de dépôt légal soumise avec succès");
    setCurrentStep("confirmation");
  };

  if (currentStep === "type_selection") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'تحديد نوع المستخدم' : 'Identification du Type d\'Utilisateur'}</CardTitle>
          <CardDescription>
            {language === 'ar' 
              ? 'اختر ملفك الشخصي لتصريح الإيداع القانوني'
              : 'Sélectionnez votre profil pour la déclaration de dépôt légal'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full h-20 flex flex-col items-center justify-center space-y-2"
            onClick={() => {
              setUserType("editor");
              setCurrentStep("editor_auth");
            }}
          >
            <FileText className="h-6 w-6" />
            <span>{language === 'ar' ? 'أنا ناشر' : 'Je suis un Éditeur'}</span>
          </Button>
          <Button
            variant="outline"
            className="w-full h-20 flex flex-col items-center justify-center space-y-2"
            onClick={() => {
              setUserType("printer");
              setCurrentStep("printer_auth");
            }}
          >
            <FileText className="h-6 w-6" />
            <span>{language === 'ar' ? 'أنا طابع' : 'Je suis un Imprimeur'}</span>
          </Button>
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
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'مصادقة الناشر' : 'Authentification Éditeur'}</CardTitle>
          <CardDescription>
            {language === 'ar' 
              ? 'يرجى تحديد هويتك كناشر'
              : 'Veuillez vous identifier en tant qu\'éditeur'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editor-name">{language === 'ar' ? 'اسم الناشر' : 'Nom de l\'éditeur'}</Label>
            <Input id="editor-name" placeholder={language === 'ar' ? 'اسم الناشر' : 'Nom de l\'éditeur'} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editor-address">{language === 'ar' ? 'العنوان' : 'Adresse'}</Label>
            <Textarea id="editor-address" placeholder={language === 'ar' ? 'العنوان الكامل' : 'Adresse complète'} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editor-phone">{language === 'ar' ? 'الهاتف' : 'Téléphone'}</Label>
              <Input id="editor-phone" placeholder={language === 'ar' ? 'رقم الهاتف' : 'Numéro de téléphone'} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editor-email">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
              <Input id="editor-email" type="email" placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email'} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="publication-date">{language === 'ar' ? 'تاريخ النشر المتوقع' : 'Date prévue de parution'}</Label>
            <Input id="publication-date" type="date" />
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep("type_selection")}
          >
            {language === 'ar' ? 'رجوع' : 'Retour'}
          </Button>
          <Button
            onClick={() => handleAuthentication("editor", {
              name: (document.getElementById("editor-name") as HTMLInputElement)?.value,
              address: (document.getElementById("editor-address") as HTMLTextAreaElement)?.value,
              phone: (document.getElementById("editor-phone") as HTMLInputElement)?.value,
              email: (document.getElementById("editor-email") as HTMLInputElement)?.value,
              publicationDate: (document.getElementById("publication-date") as HTMLInputElement)?.value,
            })}
            className="flex-1"
          >
            {language === 'ar' ? 'تأكيد التحديد' : 'Confirmer l\'identification'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (currentStep === "printer_auth") {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>
            {depositType === "bd_logiciels" ? 
              (language === 'ar' ? 'مصادقة الموزع' : 'Authentification Distributeur') : 
              (language === 'ar' ? 'مصادقة الطابع' : 'Authentification Imprimeur')
            }
          </CardTitle>
          <CardDescription>
            {userType === "editor" ? 
              (language === 'ar' ? 
                `في انتظار تحديد ${depositType === "bd_logiciels" ? "الموزع" : "الطابع"} الشريك` : 
                `En attente de l'identification du ${depositType === "bd_logiciels" ? "distributeur" : "imprimeur"} partenaire`
              ) : 
              (language === 'ar' ? 
                `يرجى تحديد هويتك كـ${depositType === "bd_logiciels" ? "موزع" : "طابع"}` : 
                `Veuillez vous identifier en tant que ${depositType === "bd_logiciels" ? "distributeur" : "imprimeur"}`
              )
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userType === "editor" ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {language === 'ar' ? 
                  `في انتظار تأكيد ${depositType === "bd_logiciels" ? "الموزع" : "الطابع"} الشريك...` :
                  `En attente de la confirmation du ${depositType === "bd_logiciels" ? "distributeur" : "imprimeur"} partenaire...`
                }
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={handlePartnerConfirmation}
              >
                {language === 'ar' ? 
                  `محاكاة تأكيد ${depositType === "bd_logiciels" ? "الموزع" : "الطابع"}` :
                  `Simuler la confirmation du ${depositType === "bd_logiciels" ? "distributeur" : "imprimeur"}`
                }
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="printer-name">
                  {depositType === "bd_logiciels" ? 
                    (language === 'ar' ? 'اسم الموزع' : 'Nom de distributeur') : 
                    (language === 'ar' ? 'اسم المطبعة' : 'Nom de l\'imprimerie')
                  }
                </Label>
                <Input id="printer-name" placeholder={depositType === "bd_logiciels" ? 
                  (language === 'ar' ? 'اسم الموزع' : 'Nom de distributeur') : 
                  (language === 'ar' ? 'اسم المطبعة' : 'Nom de l\'imprimerie')
                } />
              </div>
              <div className="space-y-2">
                <Label htmlFor="printer-address">{language === 'ar' ? 'العنوان' : 'Adresse'}</Label>
                <Textarea id="printer-address" placeholder={language === 'ar' ? 'العنوان الكامل' : 'Adresse complète'} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="printer-phone">{language === 'ar' ? 'الهاتف' : 'Téléphone'}</Label>
                  <Input id="printer-phone" placeholder={language === 'ar' ? 'رقم الهاتف' : 'Numéro de téléphone'} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="printer-email">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                  <Input id="printer-email" type="email" placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email'} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="print-run">{language === 'ar' ? 'عدد النسخ' : 'Chiffre de tirage'}</Label>
                <Input id="print-run" type="number" placeholder={language === 'ar' ? 'عدد النسخ' : 'Nombre d\'exemplaires'} />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep(userType === "editor" ? "editor_auth" : "type_selection")}
          >
            {language === 'ar' ? 'رجوع' : 'Retour'}
          </Button>
          {userType === "printer" && (
            <Button
              onClick={() => handleAuthentication("printer", {
                name: (document.getElementById("printer-name") as HTMLInputElement)?.value,
                address: (document.getElementById("printer-address") as HTMLTextAreaElement)?.value,
                phone: (document.getElementById("printer-phone") as HTMLInputElement)?.value,
                email: (document.getElementById("printer-email") as HTMLInputElement)?.value,
                printRun: (document.getElementById("print-run") as HTMLInputElement)?.value,
              })}
              className="flex-1"
            >
              {language === 'ar' ? 'تأكيد التحديد' : 'Confirmer l\'identification'}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  if (currentStep === "form_filling") {
    return (
      <Card className={`w-full max-w-6xl mx-auto max-h-[90vh] overflow-y-auto ${isRTL ? 'rtl' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            {language === 'ar' ? 'تصريح بالإيداع القانوني' : 'Déclaration de Dépôt Légal'} - {depositTypeLabels[depositType]}
          </CardTitle>
          <CardDescription>
            {language === 'ar' 
              ? 'املأ نموذج التصريح للحصول على رقم الإيداع القانوني'
              : 'Remplissez le formulaire de déclaration pour obtenir le numéro de dépôt légal'
            }
          </CardDescription>
          <div className="flex gap-2 mt-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {language === 'ar' ? 'ناشر مؤكد' : 'Éditeur confirmé'}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {depositType === "bd_logiciels" ? 
                (language === 'ar' ? 'موزع مؤكد' : 'Distributeur confirmé') : 
                (language === 'ar' ? 'طابع مؤكد' : 'Imprimeur confirmé')
              }
            </Badge>
            {partnerConfirmed && (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {language === 'ar' ? 'تأكيد متبادل' : 'Confirmation réciproque'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {language === 'ar' ? renderArabicForm() : renderFrenchForm()}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={() => setCurrentStep("printer_auth")}>
            {language === 'ar' ? 'رجوع' : 'Retour'}
          </Button>
          <Button onClick={handleFormSubmit} disabled={!acceptedPrivacy || !partnerConfirmed}>
            {language === 'ar' ? 'إرسال التصريح' : 'Soumettre la déclaration'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (currentStep === "confirmation") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <CardTitle>{language === 'ar' ? 'تم إرسال التصريح بنجاح' : 'Déclaration soumise avec succès'}</CardTitle>
          <CardDescription>
            {language === 'ar' 
              ? 'تم تسجيل تصريح الإيداع القانوني الخاص بك. ستتلقى تأكيداً عبر البريد الإلكتروني مع رقم الإيداع القانوني المخصص.'
              : 'Votre déclaration de dépôt légal a été enregistrée. Vous recevrez une confirmation par email avec le numéro de dépôt légal attribué.'
            }
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={onClose} className="w-full">
            {language === 'ar' ? 'إغلاق' : 'Fermer'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return null;
}