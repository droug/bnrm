import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BNTooltipConfig {
  // Collections
  collections_manuscripts: string;
  collections_lithography: string;
  collections_books: string;
  collections_periodicals: string;
  collections_specialized: string;
  collections_audiovisual: string;
  // Services aux lecteurs
  services_membership: string;
  services_reproduction: string;
}

const DEFAULT_TOOLTIPS: BNTooltipConfig = {
  collections_manuscripts: "Manuscrits arabes, amazighes et hébraïques numérisés",
  collections_lithography: "Ouvrages lithographiés marocains et orientaux",
  collections_books: "Livres rares, imprimés anciens et éditions patrimoniales",
  collections_periodicals: "Journaux historiques, revues scientifiques, magazines et bulletins officiels",
  collections_specialized: "Documents cartographiques, iconographiques, Objets, Images fixes, Médailles et Antiques",
  collections_audiovisual: "Enregistrements sonores, films, vidéos et archives radiophoniques",
  services_membership: "Abonnez-vous pour accéder à l'ensemble des ressources numériques",
  services_reproduction: "Demandez une copie numérique ou papier d'un document patrimonial",
};

export function useBNTooltips() {
  const { data, isLoading } = useQuery({
    queryKey: ["bn-tooltips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_portal_settings")
        .select("setting_value")
        .eq("setting_key", "bn_tooltips")
        .maybeSingle();

      if (error) {
        console.error("Error fetching BN tooltips:", error);
        return DEFAULT_TOOLTIPS;
      }

      if (!data?.setting_value) return DEFAULT_TOOLTIPS;

      const saved = data.setting_value as Record<string, string>;
      return { ...DEFAULT_TOOLTIPS, ...saved };
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    tooltips: (data || DEFAULT_TOOLTIPS) as BNTooltipConfig,
    isLoading,
  };
}

export { DEFAULT_TOOLTIPS };
