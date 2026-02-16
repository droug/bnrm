import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SectionTitle {
  id: string;
  section_type: string;
  title_fr: string | null;
  title_ar: string | null;
  content_fr: string | null;
  content_ar: string | null;
  is_visible: boolean | null;
  order_index: number;
}

// Known section IDs from the BN homepage cms_sections
export const BN_SECTION_IDS = {
  hero: "7edb9f5d-1661-47c1-990f-b41a856ee67d",
  featuredWorks: "9decb936-332d-4206-aaa6-45869779c16c",
  latestAdditions: "b2e02da3-3ecf-48a1-a224-1ace8f5bf6ce",
  ibnBattoutaStats: "54f8558d-09c7-40be-bb11-70ec258399ef",
  news: "934b230d-3f2f-4c15-affc-8caaabd45c7b",
  virtualExhibitions: "a6190271-1cda-4690-a644-f4fe2075f8ea",
  electronicResources: "f944278d-2f47-4f08-ba25-75d974b66c13",
} as const;

/**
 * Hook to fetch BN homepage section titles from cms_sections table.
 * Uses section IDs for precise lookup since some section_types are duplicated.
 */
export function useBNSectionTitles() {
  const { data: sections = [] } = useQuery({
    queryKey: ["bn-section-titles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_sections")
        .select("id, section_type, title_fr, title_ar, content_fr, content_ar, is_visible, order_index")
        .order("order_index");
      if (error) {
        console.error("Error fetching BN section titles:", error);
        return [];
      }
      return data as SectionTitle[];
    },
    staleTime: 30000,
  });

  const sectionsById = new Map(sections.map((s) => [s.id, s]));

  /**
   * Get title for a section by its ID.
   */
  const getTitle = (
    sectionId: string,
    language: string,
    defaultFr: string,
    defaultAr?: string
  ): string => {
    const section = sectionsById.get(sectionId);
    if (!section) return language === "ar" ? (defaultAr || defaultFr) : defaultFr;
    if (language === "ar") return section.title_ar || defaultAr || section.title_fr || defaultFr;
    return section.title_fr || defaultFr;
  };

  /**
   * Get subtitle/content for a section by its ID.
   */
  const getSubtitle = (
    sectionId: string,
    language: string,
    defaultFr: string,
    defaultAr?: string
  ): string => {
    const section = sectionsById.get(sectionId);
    if (!section) return language === "ar" ? (defaultAr || defaultFr) : defaultFr;
    if (language === "ar") return section.content_ar || defaultAr || section.content_fr || defaultFr;
    return section.content_fr || defaultFr;
  };

  /**
   * Check if a section is visible (default true).
   */
  const isVisible = (sectionId: string): boolean => {
    const section = sectionsById.get(sectionId);
    if (!section) return false;
    return section.is_visible !== false;
  };

  return { sections, getTitle, getSubtitle, isVisible };
}
