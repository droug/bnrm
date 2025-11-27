import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Donation() {
  const navigate = useNavigate();
  const { toast } = useToast();
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
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Call the create-payment edge function
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
          title: "Redirection vers le paiement",
          description: "Vous allez être redirigé vers la page de paiement sécurisée",
        });
      }
    } catch (error: any) {
      console.error('Donation error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du traitement de votre don",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <Heart className="h-12 w-12 text-orange-500 fill-orange-500 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Faire un don
            </h1>
            <p className="text-muted-foreground">
              Votre contribution aide à préserver le patrimoine culturel marocain
            </p>
          </div>

          <Card className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Montant */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Montant du don (MAD)</Label>
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
                        className="flex items-center justify-center rounded-lg border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
                      >
                        {amount} MAD
                      </Label>
                    </div>
                  ))}
                  <div>
                    <RadioGroupItem value="other" id="amount-other" className="peer sr-only" />
                    <Label
                      htmlFor="amount-other"
                      className="flex items-center justify-center rounded-lg border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
                    >
                      Autre montant
                    </Label>
                  </div>
                </RadioGroup>
                
                {formData.amount === "other" && (
                  <Input
                    type="number"
                    placeholder="Entrez le montant"
                    value={formData.customAmount}
                    onChange={(e) => setFormData({ ...formData, customAmount: e.target.value })}
                    min="1"
                    step="0.01"
                    required
                  />
                )}
              </div>

              {/* Informations personnelles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vos informations</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="message">Message (optionnel)</Label>
                <Textarea
                  id="message"
                  placeholder="Laissez-nous un message..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                disabled={isSubmitting}
              >
                <Heart className="mr-2 h-5 w-5 fill-white" />
                {isSubmitting ? "Traitement en cours..." : "Procéder au paiement"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Paiement sécurisé. Tous les dons sont déductibles d'impôts selon la législation marocaine.
              </p>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
