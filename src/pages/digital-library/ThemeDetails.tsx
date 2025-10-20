import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

export default function ThemeDetails() {
  const { themeId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const themeInfo: Record<string, any> = {
    history: { title: "Histoire & Patrimoine", count: "15,340", icon: "🏛️" },
    arts: { title: "Arts & Culture", count: "12,890", icon: "🎨" },
    sciences: { title: "Sciences & Techniques", count: "8,450", icon: "🔬" },
    religion: { title: "Religion & Philosophie", count: "18,670", icon: "📿" },
    literature: { title: "Littérature & Poésie", count: "22,130", icon: "✍️" },
  };

  const theme = themeInfo[themeId || "history"] || themeInfo.history;

  const documents = [
    { id: 1, title: "Les grandes dynasties du Maroc", author: "Abdelhadi Tazi", type: "Livre" },
  ];

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-5xl">{theme.icon}</span>
          <div>
            <h1 className="text-4xl font-bold">{theme.title}</h1>
            <Badge variant="secondary" className="mt-2">{theme.count} documents</Badge>
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <Input
              placeholder="Rechercher dans ce thème..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg">{doc.title}</h3>
                <p className="text-sm text-muted-foreground">{doc.author}</p>
                <Button className="mt-4" onClick={() => navigate(`/book-reader/${doc.id}`)}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Consulter
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DigitalLibraryLayout>
  );
}
