import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, BookHeart, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingButtons } from "@/components/FloatingButtons";
import { useLanguage } from "@/hooks/useLanguage";
import { SimpleSelect } from "@/components/ui/simple-select";
import { motion } from "framer-motion";

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
      toast({
        title: language === 'ar' ? "تم الإرسال بنجاح" : "Demande envoyée avec succès",
        description: language === 'ar' 
          ? "سيتم الاتصال بك قريبًا بخصوص مجموعتك"
          : "Nous vous contacterons bientôt concernant votre collection",
      });
      
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
    <div className="min-h-screen bg-slate-surface">
      <Header />
      
      <div className="pt-20 pb-12 bg-gradient-to-b from-blue-surface to-slate-surface">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6 text-slate-text-dark hover:text-blue-primary-dark hover:bg-blue-surface"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === 'ar' ? 'رجوع' : 'Retour'}
          </Button>

          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-gold-light to-gold-surface mb-4">
                <BookHeart className="h-12 w-12 text-gold-primary-dark fill-gold-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-blue-primary-dark mb-2">
                {language === 'ar' ? 'تقديم مجموعات' : 'Offrir des collections'}
              </h1>
              <p className="text-slate-text max-w-xl mx-auto">
                {language === 'ar' 
                  ? 'ساهم في إثراء التراث الثقافي المغربي'
                  : 'Contribuez à enrichir le patrimoine culturel marocain'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-slate-border shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-surface to-slate-surface border-b border-slate-border">
                  <CardTitle className="text-blue-primary-dark flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {language === 'ar' ? 'نموذج اقتراح التبرع' : 'Formulaire de proposition de don'}
                  </CardTitle>
                  <CardDescription className="text-slate-text">
                    {language === 'ar' 
                      ? 'أكمل المعلومات أدناه لتقديم مجموعتك'
                      : 'Remplissez les informations ci-dessous pour proposer votre collection'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Type de donateur */}
                    <div className="space-y-2">
                      <Label className="text-slate-text-dark font-medium">
                        {language === 'ar' ? 'نوع المتبرع *' : 'Type de donateur *'}
                      </Label>
                      <SimpleSelect
                        options={[
                          { value: "individual", label: language === 'ar' ? 'فرد' : 'Particulier' },
                          { value: "institution", label: language === 'ar' ? 'مؤسسة' : 'Institution' },
                          { value: "association", label: language === 'ar' ? 'جمعية' : 'Association' },
                        ]}
                        value={formData.donorType}
                        onChange={(value) => setFormData({ ...formData, donorType: value })}
                        placeholder={language === 'ar' ? 'اختر نوع المتبرع' : 'Sélectionnez le type'}
                        required
                      />
                    </div>

                    {/* Informations personnelles */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-blue-primary-dark border-b border-slate-border pb-2">
                        {language === 'ar' ? 'معلوماتك' : 'Vos informations'}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-slate-text-dark">
                            {language === 'ar' ? 'الاسم الأول *' : 'Prénom *'}
                          </Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            required
                            className="border-slate-border focus:border-blue-primary focus:ring-blue-primary/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-slate-text-dark">
                            {language === 'ar' ? 'اسم العائلة *' : 'Nom *'}
                          </Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            required
                            className="border-slate-border focus:border-blue-primary focus:ring-blue-primary/20"
                          />
                        </div>
                      </div>

                      {(formData.donorType === "institution" || formData.donorType === "association") && (
                        <div className="space-y-2">
                          <Label htmlFor="organization" className="text-slate-text-dark">
                            {language === 'ar' ? 'اسم المؤسسة/الجمعية *' : 'Nom de l\'organisation *'}
                          </Label>
                          <Input
                            id="organization"
                            value={formData.organization}
                            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                            required
                            className="border-slate-border focus:border-blue-primary focus:ring-blue-primary/20"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-text-dark">
                          {language === 'ar' ? 'البريد الإلكتروني *' : 'Email *'}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="border-slate-border focus:border-blue-primary focus:ring-blue-primary/20"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-slate-text-dark">
                            {language === 'ar' ? 'الهاتف *' : 'Téléphone *'}
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                            className="border-slate-border focus:border-blue-primary focus:ring-blue-primary/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-slate-text-dark">
                            {language === 'ar' ? 'المدينة *' : 'Ville *'}
                          </Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            required
                            className="border-slate-border focus:border-blue-primary focus:ring-blue-primary/20"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-slate-text-dark">
                          {language === 'ar' ? 'العنوان' : 'Adresse'}
                        </Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="border-slate-border focus:border-blue-primary focus:ring-blue-primary/20"
                        />
                      </div>
                    </div>

                    {/* Informations sur la collection */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-blue-primary-dark border-b border-slate-border pb-2">
                        {language === 'ar' ? 'معلومات المجموعة' : 'Informations sur la collection'}
                      </h3>
                      
                      <div className="space-y-2">
                        <Label className="text-slate-text-dark">
                          {language === 'ar' ? 'نوع المجموعة *' : 'Type de collection *'}
                        </Label>
                        <SimpleSelect
                          options={[
                            { value: "manuscripts", label: language === 'ar' ? 'مخطوطات' : 'Manuscrits' },
                            { value: "books", label: language === 'ar' ? 'كتب' : 'Livres' },
                            { value: "periodicals", label: language === 'ar' ? 'دوريات' : 'Périodiques' },
                            { value: "archives", label: language === 'ar' ? 'أرشيف' : 'Archives' },
                            { value: "photos", label: language === 'ar' ? 'صور فوتوغرافية' : 'Photographies' },
                            { value: "audiovisual", label: language === 'ar' ? 'سمعي بصري' : 'Audiovisuel' },
                            { value: "other", label: language === 'ar' ? 'أخرى' : 'Autre' },
                          ]}
                          value={formData.collectionType}
                          onChange={(value) => setFormData({ ...formData, collectionType: value })}
                          placeholder={language === 'ar' ? 'اختر نوع المجموعة' : 'Sélectionnez le type'}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="collectionTitle" className="text-slate-text-dark">
                          {language === 'ar' ? 'عنوان المجموعة *' : 'Titre de la collection *'}
                        </Label>
                        <Input
                          id="collectionTitle"
                          value={formData.collectionTitle}
                          onChange={(e) => setFormData({ ...formData, collectionTitle: e.target.value })}
                          required
                          className="border-slate-border focus:border-blue-primary focus:ring-blue-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-slate-text-dark">
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
                          className="border-slate-border focus:border-blue-primary focus:ring-blue-primary/20"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="estimatedQuantity" className="text-slate-text-dark">
                            {language === 'ar' ? 'الكمية المقدرة' : 'Quantité estimée'}
                          </Label>
                          <Input
                            id="estimatedQuantity"
                            placeholder={language === 'ar' ? 'مثال: 50 كتابًا، 20 مخطوطة...' : 'Ex: 50 livres, 20 manuscrits...'}
                            value={formData.estimatedQuantity}
                            onChange={(e) => setFormData({ ...formData, estimatedQuantity: e.target.value })}
                            className="border-slate-border focus:border-blue-primary focus:ring-blue-primary/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-text-dark">
                            {language === 'ar' ? 'الحالة العامة' : 'État général'}
                          </Label>
                          <SimpleSelect
                            options={[
                              { value: "excellent", label: language === 'ar' ? 'ممتاز' : 'Excellent' },
                              { value: "good", label: language === 'ar' ? 'جيد' : 'Bon' },
                              { value: "fair", label: language === 'ar' ? 'مقبول' : 'Moyen' },
                              { value: "poor", label: language === 'ar' ? 'ضعيف' : 'Médiocre' },
                            ]}
                            value={formData.condition}
                            onChange={(value) => setFormData({ ...formData, condition: value })}
                            placeholder={language === 'ar' ? 'اختر الحالة' : 'Sélectionnez l\'état'}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="historicalValue" className="text-slate-text-dark">
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
                          className="border-slate-border focus:border-blue-primary focus:ring-blue-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-text-dark">
                          {language === 'ar' ? 'المستندات المرفقة (اختياري)' : 'Documents joints (optionnel)'}
                        </Label>
                        <div className="mt-2">
                          <label
                            htmlFor="documents"
                            className="flex flex-col items-center justify-center border-2 border-dashed border-slate-border rounded-lg p-6 cursor-pointer hover:border-blue-primary hover:bg-blue-surface/50 transition-colors"
                          >
                            <Upload className="h-8 w-8 text-slate-text mb-2" />
                            <span className="text-sm text-slate-text-dark">
                              {language === 'ar' 
                                ? 'انقر لتحميل الصور أو قوائم الجرد'
                                : 'Cliquez pour télécharger photos ou inventaires'}
                            </span>
                            <span className="text-xs text-slate-text mt-1">
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
                            <div className="mt-2 p-2 bg-blue-surface rounded-lg">
                              <p className="text-sm text-blue-primary-dark">
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
                      className="w-full bg-blue-primary-dark hover:bg-blue-deep text-white shadow-lg hover:shadow-xl transition-all"
                      disabled={isSubmitting}
                    >
                      <BookHeart className="mr-2 h-5 w-5 fill-white" />
                      {isSubmitting 
                        ? (language === 'ar' ? 'جاري المعالجة...' : 'Traitement en cours...') 
                        : (language === 'ar' ? 'إرسال الطلب' : 'Envoyer la proposition')}
                    </Button>

                    <p className="text-xs text-slate-text text-center">
                      {language === 'ar' 
                        ? 'سيتم دراسة طلبك من قبل فريقنا وسيتم الاتصال بك في أقرب وقت ممكن'
                        : 'Votre demande sera étudiée par notre équipe et nous vous contacterons dans les plus brefs délais'}
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
      
      <Footer />
      <FloatingButtons />
    </div>
  );
}
