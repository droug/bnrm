import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const subscriptionPlans = [
  {
    id: "basic",
    name: "Adhésion Standard",
    icon: Star,
    price: "200 MAD",
    period: "/ an",
    description: "Pour les lecteurs réguliers",
    features: [
      "Accès aux ressources restreintes",
      "Consultation sur place",
      "10 téléchargements par mois",
      "Réservation d'ouvrages",
      "Support par email"
    ],
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  {
    id: "researcher",
    name: "Adhésion Chercheur",
    icon: Sparkles,
    price: "500 MAD",
    period: "/ an",
    description: "Pour la recherche académique",
    popular: true,
    features: [
      "Tout de l'adhésion Standard",
      "20 téléchargements par mois",
      "Accès aux archives numériques",
      "Recherche avancée illimitée",
      "Espace de travail dédié",
      "Support prioritaire"
    ],
    color: "text-primary",
    bgColor: "bg-primary/5",
    borderColor: "border-primary"
  },
  {
    id: "premium",
    name: "Adhésion Premium",
    icon: Crown,
    price: "1000 MAD",
    period: "/ an",
    description: "Pour les professionnels",
    features: [
      "Tout de l'adhésion Chercheur",
      "Téléchargements illimités",
      "Accès aux collections confidentielles",
      "Reproduction haute résolution",
      "Consultation à distance",
      "Service de recherche personnalisé",
      "Support 24/7"
    ],
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  }
];

export function SubscriptionDialog({ isOpen, onClose }: SubscriptionDialogProps) {
  const navigate = useNavigate();

  const handleSelectPlan = (planId: string) => {
    onClose();
    navigate("/subscription", { state: { selectedPlan: planId } });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choisissez votre adhésion</DialogTitle>
          <DialogDescription>
            Débloquez l'accès complet aux collections numériques de la BNRM
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {subscriptionPlans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.id} 
                className={`relative hover:shadow-lg transition-all ${
                  plan.popular ? 'ring-2 ring-primary scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Plus populaire
                  </Badge>
                )}
                <CardHeader className={`${plan.bgColor} border-b ${plan.borderColor}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-6 w-6 ${plan.color}`} />
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </div>
                  <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={() => handleSelectPlan(plan.id)}
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full"
                  >
                    Choisir cette offre
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            💡 Toutes les adhésions incluent un accès gratuit aux événements culturels et aux ateliers de la BNRM
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
