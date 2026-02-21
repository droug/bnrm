import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useServicePageBackground() {
  return useQuery({
    queryKey: ["service-page-background"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_portal_settings")
        .select("setting_value")
        .eq("setting_key", "services_page_background")
        .maybeSingle();

      if (error) {
        console.error("Error fetching service page background:", error);
        return null;
      }

      return data?.setting_value as { image_url?: string; opacity?: number } | null;
    },
    staleTime: 5 * 60 * 1000,
  });
}
