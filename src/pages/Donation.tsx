import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Heart, CreditCard, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingButtons } from "@/components/FloatingButtons";
import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";

export default function Donation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: "",
    customAmount: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    message: "",
    paymentMethod: "card",
  });

  const predefinedAmounts = ["100", "500", "1000", "5000"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalAmount = formData.amount === "other" ? formData.customAmount : formData.amount;

    if (!finalAmount || parseFloat(finalAmount) <= 0) {
      toast({
        title: language === 'ar' ? "خطأ" : "Erreur",
        description: language === 'ar' ? "الرجاء إدخال مبلغ صحيح" : "Veuillez entrer un montant valide",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: parseFloat(finalAmount),
          transactionType: 'donation',
          metadata: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            message: formData.message,
          }
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: language === 'ar' ? "إعادة التوجيه للدفع" : "Redirection vers le paiement",
          description: language === 'ar' ? "سيتم توجيهك إلى صفحة الدفع الآمن" : "Vous allez être redirigé vers la page de paiement sécurisée",
        });
      }
    } catch (error: any) {
      console.error('Donation error:', error);
      toast({
        title: language === 'ar' ? "خطأ" : "Erreur",
        description: error.message || (language === 'ar' 
          ? "حدث خطأ أثناء معالجة تبرعك"
          : "Une erreur est survenue lors du traitement de votre don"),
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

          <div className="max-w-3xl mx-auto">
            {/* Hero Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-gold-light to-gold-surface mb-4">
                <Heart className="h-12 w-12 text-gold-primary-dark fill-gold-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-blue-primary-dark mb-2">
                {language === 'ar' ? 'تبرع مالي' : 'Faire un don financier'}
              </h1>
              <p className="text-slate-text max-w-xl mx-auto">
                {language === 'ar' 
                  ? 'مساهمتك تساعد في الحفاظ على التراث الثقافي المغربي'
                  : 'Votre contribution aide à préserver le patrimoine culturel marocain'}
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
                    <CreditCard className="h-5 w-5" />
                    {language === 'ar' ? 'معلومات التبرع' : 'Informations de don'}
                  </CardTitle>
                  <CardDescription className="text-slate-text">
                    {language === 'ar' 
                      ? 'أكمل النموذج أدناه لإتمام تبرعك'
                      : 'Complétez le formulaire ci-dessous pour effectuer votre don'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Montant */}
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold text-blue-primary-dark">
                        {language === 'ar' ? 'مبلغ التبرع (درهم)' : 'Montant du don (MAD)'}
                      </Label>
                      <RadioGroup
                        value={formData.amount}
                        onValueChange={(value) => setFormData({ ...formData, amount: value })}
                        className="grid grid-cols-2 md:grid-cols-4 gap-3"
                      >
                        {predefinedAmounts.map((amount) => (
                          <div key={amount}>
                            <RadioGroupItem
                              value={amount}
                              id={`amount-${amount}`}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={`amount-${amount}`}
                              className="flex items-center justify-center rounded-lg border-2 border-slate-border bg-white p-4 hover:bg-blue-surface hover:border-blue-primary-light peer-data-[state=checked]:border-blue-primary peer-data-[state=checked]:bg-blue-surface peer-data-[state=checked]:text-blue-primary-dark cursor-pointer transition-all font-medium"
                            >
                              {amount} MAD
                            </Label>
                          </div>
                        ))}
                        <div>
                          <RadioGroupItem value="other" id="amount-other" className="peer sr-only" />
                          <Label
                            htmlFor="amount-other"
                            className="flex items-center justify-center rounded-lg border-2 border-slate-border bg-white p-4 hover:bg-blue-surface hover:border-blue-primary-light peer-data-[state=checked]:border-blue-primary peer-data-[state=checked]:bg-blue-surface peer-data-[state=checked]:text-blue-primary-dark cursor-pointer transition-all font-medium"
                          >
                            {language === 'ar' ? 'مبلغ آخر' : 'Autre montant'}
                          </Label>
                        </div>
                      </RadioGroup>
                      
                      {formData.amount === "other" && (
                        <Input
                          type="number"
                          placeholder={language === 'ar' ? 'أدخل المبلغ' : 'Entrez le montant'}
                          value={formData.customAmount}
                          onChange={(e) => setFormData({ ...formData, customAmount: e.target.value })}
                          min="1"
                          step="0.01"
                          required
                          className="border-slate-border focus:border-blue-primary focus:ring-blue-primary/20"
                        />
                      )}
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
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-text-dark">
                          {language === 'ar' ? 'الهاتف' : 'Téléphone'}
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="border-slate-border focus:border-blue-primary focus:ring-blue-primary/20"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
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
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-slate-text-dark">
                            {language === 'ar' ? 'المدينة' : 'Ville'}
                          </Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="border-slate-border focus:border-blue-primary focus:ring-blue-primary/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-slate-text-dark">
                        {language === 'ar' ? 'رسالة (اختياري)' : 'Message (optionnel)'}
                      </Label>
                      <Textarea
                        id="message"
                        placeholder={language === 'ar' ? 'اترك لنا رسالة...' : 'Laissez-nous un message...'}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={4}
                        className="border-slate-border focus:border-blue-primary focus:ring-blue-primary/20"
                      />
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-blue-primary-dark hover:bg-blue-deep text-white shadow-lg hover:shadow-xl transition-all"
                      disabled={isSubmitting}
                    >
                      <Heart className="mr-2 h-5 w-5 fill-white" />
                      {isSubmitting 
                        ? (language === 'ar' ? 'جاري المعالجة...' : 'Traitement en cours...') 
                        : (language === 'ar' ? 'المتابعة للدفع' : 'Procéder au paiement')}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-xs text-slate-text">
                      <Shield className="h-4 w-4 text-blue-primary" />
                      <p>
                        {language === 'ar' 
                          ? 'دفع آمن. جميع التبرعات قابلة للخصم الضريبي وفقًا للتشريع المغربي.'
                          : 'Paiement sécurisé. Tous les dons sont déductibles d\'impôts selon la législation marocaine.'}
                      </p>
                    </div>
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
