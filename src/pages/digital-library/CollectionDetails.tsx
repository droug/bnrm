import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Download, Heart, Eye } from "lucide-react";

export default function CollectionDetails() {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const collectionInfo: Record<string, any> = {
    books: { title: "Livres numériques", count: "45,670" },
    periodicals: { title: "Revues et périodiques", count: "8,320" },
    manuscripts: { title: "Manuscrits numérisés", count: "12,450" },
    photos: { title: "Photographies et cartes", count: "15,890" },
    audiovisual: { title: "Archives audiovisuelles", count: "2,890" },
  };

  const collection = collectionInfo[collectionId || "books"] || collectionInfo.books;

  const documents = [
    { id: 1, title: "Histoire du Maroc", author: "Mohammed Kenbib", year: 2005, views: 5234 },
  ];

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">{collection.title}</h1>
        <Badge variant="secondary" className="mb-8">{collection.count} documents</Badge>
        
        <Card className="mb-8">
          <CardContent className="pt-6">
            <Input
              placeholder="Rechercher..."
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
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => navigate(`/book-reader/${doc.id}`)}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Consulter
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DigitalLibraryLayout>
  );
}
