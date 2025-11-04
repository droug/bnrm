import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus } from "lucide-react";
import { SectionFieldsList } from "@/components/admin/SectionFieldsList";

export default function ManageSectionFields() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [selectedFormKey, setSelectedFormKey] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");

  if (!user || !profile || (profile.role !== 'admin' && profile.role !== 'librarian')) {
    return <Navigate to="/auth" replace />;
  }

  const availableForms = [
    { key: "legal_deposit_monograph", name: "Dépôt légal - Monographies" }
  ];

  // Récupérer les sections du formulaire sélectionné
  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ["form-sections", selectedFormKey],
    queryFn: async () => {
      if (!selectedFormKey) return [];
      
      const { data, error } = await (supabase as any)
        .from("form_sections")
        .select("*")
        .eq("form_key", selectedFormKey)
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (error) {
        console.error("Error fetching sections:", error);
        throw error;
      }
      console.log("Sections loaded:", data);
      return data || [];
    },
    enabled: !!selectedFormKey,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Gestion des champs personnalisés par section
            </h1>
            <p className="text-muted-foreground">
              Ajoutez des champs personnalisés aux sections des formulaires existants
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Sélectionner un formulaire et une section</CardTitle>
              <CardDescription>
                Les champs personnalisés seront affichés à la fin de la section sélectionnée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="form-select">Formulaire</Label>
                <Select value={selectedFormKey} onValueChange={(value) => {
                  setSelectedFormKey(value);
                  setSelectedSectionId("");
                }}>
                  <SelectTrigger id="form-select">
                    <SelectValue placeholder="Sélectionner un formulaire" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableForms.map((form) => (
                      <SelectItem key={form.key} value={form.key}>
                        {form.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedFormKey && (
                <div className="space-y-2">
                  <Label htmlFor="section-select">Section</Label>
                  {sectionsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
                      <SelectTrigger id="section-select">
                        <SelectValue placeholder="Sélectionner une section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections?.map((section: any) => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.section_name_fr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedSectionId && (
            <SectionFieldsList
              sectionId={selectedSectionId}
              sectionName={sections?.find((s: any) => s.id === selectedSectionId)?.section_name_fr || ""}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
