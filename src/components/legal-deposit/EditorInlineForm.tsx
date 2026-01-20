import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Mail, Phone, Building2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Publisher {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  publisher_type: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  google_maps_link: string | null;
}

interface EditorInlineFormProps {
  initialName: string;
  onEditorAdded: (editor: Publisher) => void;
  onCancel: () => void;
}

export const EditorInlineForm = ({
  initialName,
  onEditorAdded,
  onCancel,
}: EditorInlineFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialName,
    email: "",
    phone: "",
    city: "",
  });
  const [sendInvitation, setSendInvitation] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est obligatoire";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est obligatoire pour l'invitation";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // 1. Insert the editor into the publishers table
      const { data: editor, error: insertError } = await supabase
        .from("publishers")
        .insert([
          {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || null,
            city: formData.city.trim() || null,
            country: "Maroc",
          },
        ])
        .select("id, name, city, country, publisher_type, address, phone, email, google_maps_link")
        .single();

      if (insertError) {
        console.error("Error inserting editor:", insertError);
        toast.error("Erreur lors de l'ajout de l'éditeur");
        return;
      }

      // 2. Send invitation email if requested
      if (sendInvitation && editor) {
        try {
          const { error: inviteError } = await supabase.functions.invoke(
            "send-editor-invitation",
            {
              body: {
                editorEmail: formData.email.trim(),
                editorName: formData.name.trim(),
                editorId: editor.id,
              },
            }
          );

          if (inviteError) {
            console.error("Error sending invitation:", inviteError);
            toast.warning(
              "Éditeur ajouté, mais l'invitation n'a pas pu être envoyée"
            );
          } else {
            toast.success(
              "Éditeur ajouté et invitation envoyée avec succès"
            );
          }
        } catch (e) {
          console.error("Error calling invitation function:", e);
          toast.success("Éditeur ajouté (invitation en attente)");
        }
      } else {
        toast.success("Éditeur ajouté avec succès");
      }

      // 3. Callback with the new editor
      onEditorAdded(editor as Publisher);
    } catch (error) {
      console.error("Error adding editor:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 border-t bg-muted/30">
      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        <Building2 className="h-4 w-4" />
        <span>Ajouter un nouvel éditeur</span>
      </div>

      <div className="space-y-3">
        {/* Nom */}
        <div className="space-y-1">
          <Label className="text-xs">
            Nom de l'éditeur <span className="text-destructive">*</span>
          </Label>
          <Input
            placeholder="Nom de l'éditeur"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label className="text-xs">
            Email <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="email@editeur.ma"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <Label className="text-xs">Téléphone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="tel"
              placeholder="+212 6XX XXX XXX"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="pl-10"
            />
          </div>
        </div>

        {/* City */}
        <div className="space-y-1">
          <Label className="text-xs">Ville</Label>
          <Input
            placeholder="Ville"
            value={formData.city}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, city: e.target.value }))
            }
          />
        </div>

        {/* Send Invitation Checkbox */}
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="sendEditorInvitation"
            checked={sendInvitation}
            onCheckedChange={(checked) => setSendInvitation(checked as boolean)}
          />
          <label
            htmlFor="sendEditorInvitation"
            className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"
          >
            <Send className="h-3 w-3" />
            Envoyer une invitation à s'inscrire
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          Annuler
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ajout...
            </>
          ) : (
            "Ajouter"
          )}
        </Button>
      </div>
    </div>
  );
};
