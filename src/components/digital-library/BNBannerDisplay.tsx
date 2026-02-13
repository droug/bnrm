import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface Banner {
  id: string;
  title_fr: string | null;
  title_ar: string | null;
  text_fr: string | null;
  text_ar: string | null;
  image_url: string;
  link_url: string | null;
  link_label_fr: string | null;
  link_label_ar: string | null;
  position: string | null;
}

export function BNBannerDisplay() {
  const { language } = useLanguage();

  const { data: banners = [] } = useQuery({
    queryKey: ["bn-active-banners"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("cms_bannieres")
        .select("*")
        .eq("status", "published")
        .eq("is_active", true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order("priority", { ascending: true })
        .limit(3);
      if (error) {
        console.error("Error fetching banners:", error);
        return [];
      }
      return data as Banner[];
    },
    staleTime: 60000,
  });

  if (banners.length === 0) return null;

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner, index) => {
            const title = language === "ar" ? (banner.title_ar || banner.title_fr) : banner.title_fr;
            const text = language === "ar" ? (banner.text_ar || banner.text_fr) : banner.text_fr;
            const linkLabel = language === "ar" ? (banner.link_label_ar || banner.link_label_fr) : banner.link_label_fr;

            return (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative rounded-xl overflow-hidden shadow-lg group"
              >
                <img
                  src={banner.image_url}
                  alt={title || "Bannière"}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {(title || text) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-5">
                    {title && (
                      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                    )}
                    {text && (
                      <p className="text-white/90 text-sm mb-3 line-clamp-2">{text}</p>
                    )}
                    {banner.link_url && linkLabel && (
                      <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="secondary" className="w-fit gap-2">
                          {linkLabel}
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
