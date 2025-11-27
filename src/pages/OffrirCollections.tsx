import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, BookHeart, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingButtons } from "@/components/FloatingButtons";
import { useLanguage } from "@/hooks/useLanguage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OffrirCollections() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    donorType: "",
    firstName: "",
    lastName: "",
    organization: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    collectionType: "",
    collectionTitle: "",
    description: "",
    estimatedQuantity: "",
    condition: "",
    historicalValue: "",
    documents: [] as File[],
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, documents: Array.from(e.target.files) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would typically upload files to storage and save form data
      // For now, we'll just show a success message
      
      toast({
        title: language === 'ar' ? "تم الإرسال بنجاح" : "Demande envoyée avec succès",
        description: language === 'ar' 
          ? "سيتم الاتصال بك قريبًا بخصوص مجموعتك"
          : "Nous vous contacterons bientôt concernant votre collection",
      });
      
      // Reset form
      setFormData({
        donorType: "",
        firstName: "",
        lastName: "",
        organization: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        collectionType: "",
        collectionTitle: "",
        description: "",
        estimatedQuantity: "",
        condition: "",
        historicalValue: "",
        documents: [],
      });
    } catch (error: any) {
      console.error('Collection offer error:', error);
      toast({
        title: language === 'ar' ? "خطأ" : "Erreur",
        description: error.message || (language === 'ar' 
          ? "حدث خطأ أثناء معالجة طلبك"
          : "Une erreur est survenue lors du traitement de votre demande"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-20 pb-12 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === 'ar' ? 'رجوع' : 'Retour'}
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <BookHeart className="h-12 w-12 text-orange-500 fill-orange-500 mx-auto mb-4" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {language === 'ar' ? 'تقديم مجموعات' : 'Offrir des collections'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'ar' 
                  ? 'ساهم في إثراء التراث الثقافي المغربي'
                  : 'Contribuez à enrichir le patrimoine culturel marocain'}
              </p>
            </div>

            <Card className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type de donateur */}
                <div className="space-y-2">
                  <Label htmlFor="donorType">
                    {language === 'ar' ? 'نوع المتبرع *' : 'Type de donateur *'}
                  </Label>
                  <Select
                    value={formData.donorType}
                    onValueChange={(value) => setFormData({ ...formData, donorType: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'ar' ? 'اختر نوع المتبرع' : 'Sélectionnez le type'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">
                        {language === 'ar' ? 'فرد' : 'Particulier'}
                      </SelectItem>
                      <SelectItem value="institution">
                        {language === 'ar' ? 'مؤسسة' : 'Institution'}
                      </SelectItem>
                      <SelectItem value="association">
                        {language === 'ar' ? 'جمعية' : 'Association'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Informations personnelles */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {language === 'ar' ? 'معلوماتك' : 'Vos informations'}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">
                        {language === 'ar' ? 'الاسم الأول *' : 'Prénom *'}
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">
                        {language === 'ar' ? 'اسم العائلة *' : 'Nom *'}
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {(formData.donorType === "institution" || formData.donorType === "association") && (
                    <div>
                      <Label htmlFor="organization">
                        {language === 'ar' ? 'اسم المؤسسة/الجمعية *' : 'Nom de l\'organisation *'}
                      </Label>
                      <Input
                        id="organization"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        required
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="email">
                      {language === 'ar' ? 'البريد الإلكتروني *' : 'Email *'}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">
                      {language === 'ar' ? 'الهاتف *' : 'Téléphone *'}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">
                      {language === 'ar' ? 'العنوان' : 'Adresse'}
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">
                      {language === 'ar' ? 'المدينة *' : 'Ville *'}
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Informations sur la collection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {language === 'ar' ? 'معلومات المجموعة' : 'Informations sur la collection'}
                  </h3>
                  
                  <div>
                    <Label htmlFor="collectionType">
                      {language === 'ar' ? 'نوع المجموعة *' : 'Type de collection *'}
                    </Label>
                    <Select
                      value={formData.collectionType}
                      onValueChange={(value) => setFormData({ ...formData, collectionType: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ar' ? 'اختر نوع المجموعة' : 'Sélectionnez le type'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manuscripts">
                          {language === 'ar' ? 'مخطوطات' : 'Manuscrits'}
                        </SelectItem>
                        <SelectItem value="books">
                          {language === 'ar' ? 'كتب' : 'Livres'}
                        </SelectItem>
                        <SelectItem value="periodicals">
                          {language === 'ar' ? 'دوريات' : 'Périodiques'}
                        </SelectItem>
                        <SelectItem value="archives">
                          {language === 'ar' ? 'أرشيف' : 'Archives'}
                        </SelectItem>
                        <SelectItem value="photos">
                          {language === 'ar' ? 'صور فوتوغرافية' : 'Photographies'}
                        </SelectItem>
                        <SelectItem value="audiovisual">
                          {language === 'ar' ? 'سمعي بصري' : 'Audiovisuel'}
                        </SelectItem>
                        <SelectItem value="other">
                          {language === 'ar' ? 'أخرى' : 'Autre'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="collectionTitle">
                      {language === 'ar' ? 'عنوان المجموعة *' : 'Titre de la collection *'}
                    </Label>
                    <Input
                      id="collectionTitle"
                      value={formData.collectionTitle}
                      onChange={(e) => setFormData({ ...formData, collectionTitle: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">
                      {language === 'ar' ? 'الوصف *' : 'Description *'}
                    </Label>
                    <Textarea
                      id="description"
                      placeholder={language === 'ar' 
                        ? 'صف المجموعة بالتفصيل: المحتوى، الفترة الزمنية، الحالة...'
                        : 'Décrivez la collection en détail : contenu, période, état...'}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={5}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="estimatedQuantity">
                      {language === 'ar' ? 'الكمية المقدرة' : 'Quantité estimée'}
                    </Label>
                    <Input
                      id="estimatedQuantity"
                      placeholder={language === 'ar' ? 'مثال: 50 كتابًا، 20 مخطوطة...' : 'Ex: 50 livres, 20 manuscrits...'}
                      value={formData.estimatedQuantity}
                      onChange={(e) => setFormData({ ...formData, estimatedQuantity: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="condition">
                      {language === 'ar' ? 'الحالة العامة' : 'État général'}
                    </Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => setFormData({ ...formData, condition: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ar' ? 'اختر الحالة' : 'Sélectionnez l\'état'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">
                          {language === 'ar' ? 'ممتاز' : 'Excellent'}
                        </SelectItem>
                        <SelectItem value="good">
                          {language === 'ar' ? 'جيد' : 'Bon'}
                        </SelectItem>
                        <SelectItem value="fair">
                          {language === 'ar' ? 'مقبول' : 'Moyen'}
                        </SelectItem>
                        <SelectItem value="poor">
                          {language === 'ar' ? 'ضعيف' : 'Médiocre'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="historicalValue">
                      {language === 'ar' ? 'القيمة التاريخية أو الثقافية' : 'Valeur historique ou culturelle'}
                    </Label>
                    <Textarea
                      id="historicalValue"
                      placeholder={language === 'ar' 
                        ? 'أي معلومات عن الأهمية التاريخية أو الثقافية للمجموعة...'
                        : 'Toute information sur l\'importance historique ou culturelle de la collection...'}
                      value={formData.historicalValue}
                      onChange={(e) => setFormData({ ...formData, historicalValue: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="documents">
                      {language === 'ar' ? 'المستندات المرفقة (اختياري)' : 'Documents joints (optionnel)'}
                    </Label>
                    <div className="mt-2">
                      <label
                        htmlFor="documents"
                        className="flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-lg p-6 cursor-pointer hover:border-primary transition-colors"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          {language === 'ar' 
                            ? 'انقر لتحميل الصور أو قوائم الجرد'
                            : 'Cliquez pour télécharger photos ou inventaires'}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          {language === 'ar' ? 'PDF, JPG, PNG حتى 10 ميجابايت' : 'PDF, JPG, PNG jusqu\'à 10MB'}
                        </span>
                      </label>
                      <input
                        id="documents"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {formData.documents.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">
                            {formData.documents.length} {language === 'ar' ? 'ملف(ات) محددة' : 'fichier(s) sélectionné(s)'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  disabled={isSubmitting}
                >
                  <BookHeart className="mr-2 h-5 w-5 fill-white" />
                  {isSubmitting 
                    ? (language === 'ar' ? 'جاري المعالجة...' : 'Traitement en cours...') 
                    : (language === 'ar' ? 'إرسال الطلب' : 'Envoyer la proposition')}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  {language === 'ar' 
                    ? 'سيتم دراسة طلبك من قبل فريقنا وسيتم الاتصال بك في أقرب وقت ممكن'
                    : 'Votre demande sera étudiée par notre équipe et nous vous contacterons dans les plus brefs délais'}
                </p>
              </form>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
      <FloatingButtons />
    </div>
  );
}
