import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { BNPageHeader } from "@/components/digital-library/shared";
import { Icon } from "@iconify/react";

export default function Themes() {
  const navigate = useNavigate();

  const themes = [
    {
      id: "history",
      title: "Histoire & Patrimoine",
      icon: "mdi:landmark",
      count: "15,340",
      description: "Histoire du Maroc, dynasties, événements historiques, personnalités",
      bgColor: "from-amber-500/10 to-orange-500/5",
      borderColor: "border-amber-500/20 hover:border-amber-500/40",
      iconColor: "text-amber-600",
    },
    {
      id: "arts",
      title: "Arts & Culture",
      icon: "mdi:palette",
      count: "12,890",
      description: "Arts visuels, architecture, musique, traditions culturelles marocaines",
      bgColor: "from-pink-500/10 to-rose-500/5",
      borderColor: "border-pink-500/20 hover:border-pink-500/40",
      iconColor: "text-pink-600",
    },
    {
      id: "sciences",
      title: "Sciences & Techniques",
      icon: "mdi:microscope",
      count: "8,450",
      description: "Sciences naturelles, médecine traditionnelle, astronomie, mathématiques",
      bgColor: "from-blue-500/10 to-cyan-500/5",
      borderColor: "border-blue-500/20 hover:border-blue-500/40",
      iconColor: "text-blue-600",
    },
    {
      id: "religion",
      title: "Religion & Philosophie",
      icon: "mdi:book-open-variant",
      count: "18,670",
      description: "Textes religieux, philosophie islamique, soufisme, études coraniques",
      bgColor: "from-green-500/10 to-emerald-500/5",
      borderColor: "border-green-500/20 hover:border-green-500/40",
      iconColor: "text-green-600",
    },
    {
      id: "literature",
      title: "Littérature & Poésie",
      icon: "mdi:feather",
      count: "22,130",
      description: "Poésie classique et moderne, romans, nouvelles, essais littéraires",
      bgColor: "from-purple-500/10 to-indigo-500/5",
      borderColor: "border-purple-500/20 hover:border-purple-500/40",
      iconColor: "text-purple-600",
    },
    {
      id: "other",
      title: "Autres thématiques",
      icon: "mdi:sparkles",
      count: "9,240",
      description: "Droit, économie, géographie, linguistique et autres domaines",
      bgColor: "from-slate-500/10 to-gray-500/5",
      borderColor: "border-slate-500/20 hover:border-slate-500/40",
      iconColor: "text-slate-600",
    },
  ];

  return (
    <DigitalLibraryLayout>
      <BNPageHeader
        title="Explorer par Thème"
        subtitle="Parcourez nos collections organisées par grands domaines de connaissance"
        icon="mdi:shape-outline"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <Card
              key={theme.id}
              className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border bg-gradient-to-br ${theme.bgColor} ${theme.borderColor}`}
              onClick={() => navigate(`/digital-library/themes/${theme.id}`)}
            >
              <CardHeader className="relative">
                <div className={`p-5 rounded-2xl bg-white/80 dark:bg-card/80 shadow-sm w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon icon={theme.icon} className={`h-10 w-10 ${theme.iconColor}`} />
                </div>
                <CardTitle className="text-2xl group-hover:text-bn-blue-primary transition-colors">
                  {theme.title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {theme.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground bg-white/60 dark:bg-card/60 px-3 py-1 rounded-full">
                    {theme.count} documents
                  </span>
                  <span className="text-sm font-medium text-bn-blue-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Explorer
                    <Icon icon="mdi:arrow-right" className="h-4 w-4" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DigitalLibraryLayout>
  );
}
