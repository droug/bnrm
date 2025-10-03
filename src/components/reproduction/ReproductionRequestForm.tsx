import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Upload, FileText, Plus, Trash2, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReproductionItem {
  id?: string;
  title: string;
  reference?: string;
  content_id?: string;
  manuscript_id?: string;
  formats: ("pdf" | "jpeg" | "tiff" | "png")[];
  pages_specification?: string;
  color_mode: string;
  resolution_dpi: number;
  quantity: number;
}

export function ReproductionRequestForm() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [modality, setModality] = useState<string>("numerique_mail");
  const [items, setItems] = useState<ReproductionItem[]>([]);
  const [userNotes, setUserNotes] = useState("");
  const [supportingDocs, setSupportingDocs] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalityOptions = [
    { value: "papier", label: language === "ar" ? "ورقي" : "Papier" },
    { value: "numerique_mail", label: language === "ar" ? "رقمي - البريد الإلكتروني" : "Numérique - Email" },
    { value: "numerique_espace", label: language === "ar" ? "رقمي - المساحة الشخصية" : "Numérique - Espace personnel" },
    { value: "support_physique", label: language === "ar" ? "دعم مادي (USB, CD)" : "Support physique (USB, CD)" },
  ];

  const addItem = (selectedDoc: any) => {
    const newItem: ReproductionItem = {
      title: selectedDoc.title,
      reference: selectedDoc.reference || "",
      content_id: selectedDoc.content_id,
      manuscript_id: selectedDoc.manuscript_id,
      formats: ["pdf"],
      pages_specification: "",
      color_mode: "couleur",
      resolution_dpi: 300,
      quantity: 1,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSupportingDocs([...supportingDocs, ...Array.from(e.target.files)]);
    }
  };

  const submitRequest = async () => {
    if (!user) {
      toast.error(language === "ar" ? "يجب تسجيل الدخول أولاً" : "Vous devez être connecté");
      return;
    }

    if (items.length === 0) {
      toast.error(language === "ar" ? "يجب إضافة عنصر واحد على الأقل" : "Veuillez ajouter au moins un élément");
      return;
    }

    setIsSubmitting(true);

    try {
      // Pour chaque item, vérifier l'institution et router la demande
      for (const item of items) {
        if (item.manuscript_id) {
          // Appeler l'edge function pour router la demande
          const { data: routingResult, error: routingError } = await supabase.functions.invoke(
            'route-reproduction-request',
            {
              body: {
                manuscript_id: item.manuscript_id,
                user_id: user.id,
                request_type: modality,
                format: item.formats[0],
                pages: item.pages_specification,
                quantity: item.quantity,
                notes: userNotes,
              }
            }
          );

          if (routingError) {
            console.error('Erreur routage:', routingError);
            throw routingError;
          }

          console.log('Résultat routage:', routingResult);

          // Si la demande nécessite une redirection vers une institution partenaire
          if (!routingResult.request_created && routingResult.redirect_url) {
            toast.info(
              language === "ar"
                ? `سيتم معالجة طلبك من قبل ${routingResult.target_service}`
                : routingResult.message
            );
            
            // Redirection après un court délai
            setTimeout(() => {
              if (routingResult.redirect_url.startsWith('http')) {
                window.location.href = routingResult.redirect_url;
              } else {
                navigate(routingResult.redirect_url);
              }
            }, 2000);
            
            setIsSubmitting(false);
            return;
          }

          // Si la demande a été créée dans le système BNRM
          if (routingResult.request_created) {
            toast.success(
              language === "ar"
                ? `تم إرسال الطلب بنجاح إلى ${routingResult.target_service}`
                : routingResult.message
            );
          }
        } else {
          // Pour les contenus non-manuscrits, utiliser le flux normal
          const { data: request, error: requestError } = await supabase
            .from("reproduction_requests")
            .insert([{
              reproduction_modality: modality,
              status: "soumise",
              submitted_at: new Date().toISOString(),
              user_notes: userNotes,
              supporting_documents: supportingDocs.map(f => ({ name: f.name, size: f.size })),
            }] as any)
            .select()
            .single();

          if (requestError) throw requestError;

          const { error: itemsError } = await supabase
            .from("reproduction_items")
            .insert([{
              request_id: request.id,
              title: item.title,
              reference: item.reference || null,
              content_id: item.content_id || null,
              formats: item.formats as any,
              pages_specification: item.pages_specification || null,
              color_mode: item.color_mode,
              resolution_dpi: item.resolution_dpi,
              quantity: item.quantity,
            }] as any);

          if (itemsError) throw itemsError;

          toast.success(
            language === "ar"
              ? `تم إرسال الطلب بنجاح. رقم الطلب: ${request.request_number}`
              : `Demande soumise avec succès. Numéro: ${request.request_number}`
          );
        }
      }

      navigate("/my-library");
    } catch (error: any) {
      console.error("Error submitting request:", error);
      toast.error(language === "ar" ? "خطأ في إرسال الطلب" : "Erreur lors de la soumission");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {language === "ar" ? "طلب استنساخ وثائق" : "Demande de reproduction de documents"}
          </CardTitle>
          <CardDescription>
            {language === "ar"
              ? "اختر الوثائق والصيغ المطلوبة"
              : "Sélectionnez les documents et les formats souhaités"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Reproduction Modality */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              {language === "ar" ? "طريقة الاستنساخ" : "Modalité de reproduction"}
            </Label>
            <RadioGroup value={modality} onValueChange={setModality}>
              {modalityOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                {language === "ar" ? "الوثائق المطلوبة" : "Documents à reproduire"}
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={() => {/* Open document selector */}}>
                <Plus className="h-4 w-4 mr-2" />
                {language === "ar" ? "إضافة وثيقة" : "Ajouter un document"}
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {language === "ar" ? "لم يتم اختيار أي وثيقة بعد" : "Aucun document sélectionné"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.title}</h4>
                          {item.reference && (
                            <p className="text-sm text-muted-foreground">Réf: {item.reference}</p>
                          )}
                          <div className="flex gap-2 mt-2">
                            {item.formats.map((format) => (
                              <Badge key={format} variant="secondary">
                                {format.toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Supporting Documents */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              {language === "ar" ? "الوثائق المرفقة" : "Documents justificatifs"}
            </Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                {language === "ar" ? "اسحب الملفات هنا أو انقر للتحميل" : "Glissez des fichiers ici ou cliquez pour télécharger"}
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById("file-upload")?.click()}>
                {language === "ar" ? "اختر الملفات" : "Choisir des fichiers"}
              </Button>
            </div>
            {supportingDocs.length > 0 && (
              <div className="space-y-2">
                {supportingDocs.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSupportingDocs(supportingDocs.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes">
              {language === "ar" ? "ملاحظات إضافية" : "Notes complémentaires"}
            </Label>
            <Textarea
              id="notes"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder={language === "ar" ? "أضف أي ملاحظات..." : "Ajoutez vos remarques..."}
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              {language === "ar" ? "إلغاء" : "Annuler"}
            </Button>
            <Button
              onClick={submitRequest}
              disabled={isSubmitting || items.length === 0}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              {isSubmitting
                ? language === "ar" ? "جاري الإرسال..." : "Envoi en cours..."
                : language === "ar" ? "إرسال الطلب" : "Soumettre la demande"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
