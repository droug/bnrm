import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Handshake, ChevronRight, LayoutDashboard } from "lucide-react";
import ManuscriptPartnershipsBackoffice from "@/components/manuscripts/ManuscriptPartnershipsBackoffice";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const ManuscriptsAdmin = () => {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  // Compteur demandes de partenariat en attente (table partner_collections)
  const { data: pendingPartnerships } = useQuery({
    queryKey: ["manuscripts-pending-partnerships"],
    queryFn: async () => {
      const { count } = await supabase
        .from("partner_collections")
        .select("*", { count: "exact", head: true })
        .is("is_approved", null);
      return count ?? 0;
    },
  });

  const adminCards = [
    {
      id: "partnerships",
      title: "Demandes de partenariat",
      description: "Gérez les demandes de partenariat soumises par les organismes pour la plateforme des manuscrits.",
      icon: Handshake,
      badgeCount: pendingPartnerships,
      badgeLabel: "en attente",
      color: "text-amber-600",
      bgColor: "from-amber-50 to-orange-50",
      borderColor: "border-amber-200",
      component: <ManuscriptPartnershipsBackoffice />,
    },
  ];

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-xl bg-primary/10">
          <LayoutDashboard className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Administration</h2>
          <p className="text-sm text-muted-foreground">Gestion interne de la plateforme manuscrits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.id}
              className={`border ${card.borderColor} hover:shadow-md transition-all duration-200 cursor-pointer group`}
              onClick={() => setActiveSheet(card.id)}
            >
              <CardHeader className={`bg-gradient-to-br ${card.bgColor} rounded-t-xl pb-3`}>
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl bg-white/70 ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {card.badgeCount !== undefined && card.badgeCount > 0 && (
                    <Badge className="bg-amber-500 text-white text-xs">
                      {card.badgeCount} {card.badgeLabel}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base font-semibold text-foreground mt-2">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 pb-4">
                <CardDescription className="text-sm leading-relaxed mb-3">
                  {card.description}
                </CardDescription>
                <Button
                  size="sm"
                  variant="outline"
                  className={`w-full group-hover:border-amber-400 group-hover:text-amber-700 transition-colors`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSheet(card.id);
                  }}
                >
                  Accéder
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sheet latéral pour chaque module */}
      {adminCards.map((card) => (
        <Sheet
          key={card.id}
          open={activeSheet === card.id}
          onOpenChange={(open) => !open && setActiveSheet(null)}
        >
          <SheetContent side="right" className="w-full sm:w-[90vw] max-w-5xl overflow-y-auto p-0">
            <SheetHeader className="px-6 py-4 border-b bg-gradient-to-r from-amber-50 to-orange-50 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-white/80 ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <SheetTitle className="text-lg font-bold">{card.title}</SheetTitle>
              </div>
            </SheetHeader>
            <div className="p-6">
              {card.component}
            </div>
          </SheetContent>
        </Sheet>
      ))}
    </section>
  );
};

export default ManuscriptsAdmin;
