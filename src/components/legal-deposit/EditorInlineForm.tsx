import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Mail, Phone, Building2, Send, MessageSquare } from "lucide-react";
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
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const [notifyByPhone, setNotifyByPhone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est obligatoire";
    }

    // Email is required if notification by email is selected
    if (notifyByEmail) {
      if (!formData.email.trim()) {
        newErrors.email = "L'email est obligatoire pour la notification";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Email invalide";
      }
    }

    // Phone is required if notification by phone is selected
    if (notifyByPhone) {
      if (!formData.phone.trim()) {
        newErrors.phone = "Le téléphone est obligatoire pour la notification";
      }
    }

    // At least one notification method should be selected when adding a new editor
    if (!notifyByEmail && !notifyByPhone) {
      newErrors.notification = "Veuillez sélectionner au moins un mode de notification";
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
            email: formData.email.trim() || null,
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
      if (notifyByEmail && formData.email.trim() && editor) {
        try {
          const { error: inviteError } = await supabase.functions.invoke(
            "send-editor-invitation",
            {
              body: {
                editorEmail: formData.email.trim(),
                editorName: formData.name.trim(),
                editorPhone: formData.phone.trim() || null,
                editorId: editor.id,
                notifyByPhone: notifyByPhone,
              },
            }
          );

          if (inviteError) {
            console.error("Error sending invitation:", inviteError);
            toast.warning(
              "Éditeur ajouté, mais l'invitation par email n'a pas pu être envoyée"
            );
          } else {
            toast.success(
              "Éditeur ajouté et invitation par email envoyée avec succès"
            );
          }
        } catch (e) {
          console.error("Error calling invitation function:", e);
          toast.success("Éditeur ajouté (invitation par email en attente)");
        }
      } else if (!notifyByEmail && notifyByPhone) {
        toast.success("Éditeur ajouté avec succès");
        toast.info(
          `Veuillez contacter l'éditeur par téléphone: ${formData.phone}`,
          {
            duration: 10000,
            action: {
              label: "Copier",
              onClick: () => {
                navigator.clipboard.writeText(formData.phone);
                toast.success("Numéro copié");
              },
            },
          }
        );
      } else {
        toast.success("Éditeur ajouté avec succès");
      }

      // Show phone notification reminder if phone notification is selected
      if (notifyByPhone && formData.phone.trim()) {
        const phoneNumber = formData.phone.trim();
        const message = `Bonjour ${formData.name.trim()}, vous êtes invité(e) à vous inscrire sur la plateforme BNRM pour le dépôt légal.`;
        
        // Show a persistent notification with the phone number
        toast.info(
          <div className="space-y-2">
            <p className="font-medium">Notification téléphonique requise</p>
            <p className="text-sm">Contacter: <strong>{phoneNumber}</strong></p>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(phoneNumber);
                  toast.success("Numéro copié");
                }}
              >
                <Phone className="h-3 w-3 mr-1" />
                Copier
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(message);
                  toast.success("Message copié");
                }}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Copier message
              </Button>
            </div>
          </div>,
          { duration: 15000 }
        );
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
            Email {notifyByEmail && <span className="text-destructive">*</span>}
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
          <Label className="text-xs">
            Téléphone {notifyByPhone && <span className="text-destructive">*</span>}
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="tel"
              placeholder="+212 6XX XXX XXX"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className={`pl-10 ${errors.phone ? "border-destructive" : ""}`}
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone}</p>
          )}
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

        {/* Notification Options */}
        <div className="space-y-2 pt-2 border-t">
          <Label className="text-xs font-medium">Mode de notification pour l'inscription</Label>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notifyEditorByEmail"
              checked={notifyByEmail}
              onCheckedChange={(checked) => setNotifyByEmail(checked as boolean)}
            />
            <label
              htmlFor="notifyEditorByEmail"
              className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"
            >
              <Mail className="h-3 w-3" />
              Notification par email
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="notifyEditorByPhone"
              checked={notifyByPhone}
              onCheckedChange={(checked) => setNotifyByPhone(checked as boolean)}
            />
            <label
              htmlFor="notifyEditorByPhone"
              className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"
            >
              <Phone className="h-3 w-3" />
              Notification par téléphone
            </label>
          </div>

          {errors.notification && (
            <p className="text-xs text-destructive">{errors.notification}</p>
          )}

          {notifyByPhone && (
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
              ℹ️ Après l'ajout, vous recevrez les informations pour contacter l'éditeur par téléphone
            </p>
          )}
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
            <>
              <Send className="mr-2 h-4 w-4" />
              Ajouter et notifier
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
