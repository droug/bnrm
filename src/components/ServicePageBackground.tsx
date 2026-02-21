import { useServicePageBackground } from "@/hooks/useServicePageBackground";
import depotLegalBg from "@/assets/depot-legal-bg.jpg";

export function ServicePageBackground() {
  const { data: settings } = useServicePageBackground();

  const imageUrl = settings?.image_url || depotLegalBg;
  const opacity = settings?.opacity ?? 50;

  return (
    <>
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div
        className="fixed inset-0 z-0"
        style={{ backgroundColor: `hsl(var(--background) / ${opacity / 100})` }}
      />
    </>
  );
}
