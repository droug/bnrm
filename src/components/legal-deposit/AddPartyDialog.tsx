import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

interface AddPartyDialogProps {
  requestId: string;
  onPartyAdded: () => void;
}

export function AddPartyDialog({ requestId, onPartyAdded }: AddPartyDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    party_role: "printer" as "editor" | "printer" | "producer",
  });

  const handleSubmit = async () => {
    if (!formData.email) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir l'email de la partie à ajouter",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Trouver l'utilisateur par email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', formData.email)
        .single();

      if (userError) {
        throw new Error("Utilisateur non trouvé avec cet email");
      }

      // Ajouter la partie
      const { error } = await supabase
        .from('legal_deposit_parties')
        .insert({
          request_id: requestId,
          user_id: userData.user_id,
          party_role: formData.party_role,
          is_initiator: false,
          approval_status: 'pending',
          notified_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Partie ajoutée avec succès. Une notification a été envoyée.",
      });

      setOpen(false);
      setFormData({ email: "", party_role: "printer" });
      onPartyAdded();
    } catch (error: any) {
      console.error('Error adding party:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      editor: "Éditeur",
      printer: "Imprimeur",
      producer: "Producteur",
    };
    return labels[role] || role;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="h-4 w-4 mr-2" />
          Ajouter une partie
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une partie au dépôt légal</DialogTitle>
          <DialogDescription>
            Invitez un éditeur, imprimeur ou producteur à participer à cette demande de dépôt légal.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email de l'utilisateur</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <Label htmlFor="party_role">Rôle</Label>
            <Select
              value={formData.party_role}
              onValueChange={(value: "editor" | "printer" | "producer") => 
                setFormData({ ...formData, party_role: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="editor">{getRoleLabel("editor")}</SelectItem>
                <SelectItem value="printer">{getRoleLabel("printer")}</SelectItem>
                <SelectItem value="producer">{getRoleLabel("producer")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Envoi..." : "Ajouter"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}