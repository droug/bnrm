import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Landmark, Palette, Microscope, BookOpen, Feather, Sparkles } from "lucide-react";

export default function Themes() {
  const navigate = useNavigate();

  const themes = [
    {
      id: "history",
      title: "Histoire & Patrimoine",
      icon: Landmark,
      count: "15,340",
      description: "Histoire du Maroc, dynasties, événements historiques, personnalités",
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      id: "arts",
      title: "Arts & Culture",
      icon: Palette,
      count: "12,890",
      description: "Arts visuels, architecture, musique, traditions culturelles marocaines",
      color: "text-pink-700",
      bgColor: "bg-pink-50",
      gradient: "from-pink-500 to-rose-600",
    },
    {
      id: "sciences",
      title: "Sciences & Techniques",
      icon: Microscope,
      count: "8,450",
      description: "Sciences naturelles, médecine traditionnelle, astronomie, mathématiques",
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      id: "religion",
      title: "Religion & Philosophie",
      icon: BookOpen,
      count: "18,670",
      description: "Textes religieux, philosophie islamique, soufisme, études coraniques",
      color: "text-green-700",
      bgColor: "bg-green-50",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      id: "literature",
      title: "Littérature & Poésie",
      icon: Feather,
      count: "22,130",
      description: "Poésie classique et moderne, romans, nouvelles, essais littéraires",
      color: "text-purple-700",
      bgColor: "bg-purple-50",
      gradient: "from-purple-500 to-indigo-600",
    },
    {
      id: "other",
      title: "Autres thématiques",
      icon: Sparkles,
      count: "9,240",
      description: "Droit, économie, géographie, linguistique et autres domaines",
      color: "text-slate-700",
      bgColor: "bg-slate-50",
      gradient: "from-slate-500 to-gray-600",
    },
  ];

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Explorer par Thème</h1>
          <p className="text-lg text-muted-foreground">
            Parcourez nos collections organisées par grands domaines de connaissance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <Card
              key={theme.id}
              className="group relative overflow-hidden hover:shadow-xl transition-all cursor-pointer border-2 hover:border-primary/40"
              onClick={() => navigate(`/digital-library/themes/${theme.id}`)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <CardHeader className="relative">
                <div className={`p-6 rounded-2xl ${theme.bgColor} w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <theme.icon className={`h-10 w-10 ${theme.color}`} />
                </div>
                <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                  {theme.title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {theme.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {theme.count} documents
                  </span>
                  <span className="text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                    Explorer →
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
