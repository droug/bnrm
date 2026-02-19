import { Gift, Star, Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const FREE_REGISTRATIONS = [
  {
    icon: Star,
    type: "Carte d'honneur",
    condition: "Sur décision de la Directrice de la BNRM",
    access: "Toutes les salles de lecture",
    color: "bg-amber-50 border-amber-200",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    iconColor: "text-amber-600",
  },
  {
    icon: Users,
    type: "Gratuité – Personnels retraités BNRM",
    condition: "Sans condition",
    access: "Toutes les salles de lecture",
    color: "bg-emerald-50 border-emerald-200",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    iconColor: "text-emerald-600",
  },
  {
    icon: Users,
    type: "Enfants du personnel BNRM (actif ou retraité)",
    condition: "Être âgé de 18 ans au moins à la date d'inscription. Accès sur justificatif d'études ou de diplôme de 3ème cycle.",
    access: "Toutes les salles de lecture, sauf la salle des chercheurs",
    color: "bg-blue-50 border-blue-200",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    iconColor: "text-blue-600",
  },
  {
    icon: Calendar,
    type: "Pass journalier",
    condition: "Accordé à toute personne non résidente à la région de Rabat et justifiant d'un âge de 16 ans ou plus",
    access: "Accès à toutes les salles, limité à 1 visite par an",
    color: "bg-violet-50 border-violet-200",
    badgeClass: "bg-violet-100 text-violet-800 border-violet-200",
    iconColor: "text-violet-600",
  },
];

export function BNRMFreeRegistrations() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-emerald-100">
          <Gift className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Inscriptions gratuites</h2>
          <p className="text-sm text-muted-foreground">
            Catégories bénéficiant d'un accès gratuit à la BNRM — Décision 2025
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {FREE_REGISTRATIONS.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index} className={`border ${item.color} shadow-none`}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md bg-white/80`}>
                      <Icon className={`h-4 w-4 ${item.iconColor}`} />
                    </div>
                    <span className="font-semibold text-sm">{item.type}</span>
                  </div>
                  <Badge variant="outline" className={`shrink-0 text-xs ${item.badgeClass}`}>
                    Gratuit
                  </Badge>
                </div>

                <div className="space-y-1.5 text-sm">
                  <div>
                    <span className="font-medium text-foreground">Condition :</span>
                    <p className="text-muted-foreground mt-0.5">{item.condition}</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Accès :</span>
                    <p className="text-muted-foreground mt-0.5">{item.access}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-right pt-1">
        Source : Décision des tarifs des services rendus par la BNRM, 2025
      </p>
    </div>
  );
}
