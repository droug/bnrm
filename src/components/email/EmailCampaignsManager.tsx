import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Send, Plus, Trash2, Eye, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Campaign {
  id: string;
  name: string;
  description: string;
  subject: string;
  from_name: string;
  from_email: string;
  recipient_type: string;
  status: string;
  total_recipients: number;
  total_sent: number;
  total_failed: number;
  created_at: string;
  sent_at: string | null;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  template_type: string;
}

export function EmailCampaignsManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subject: "",
    from_name: "BNRM",
    from_email: "notifications@bnrm.ma",
    recipient_type: "all_subscribers",
    template_id: "none",
    custom_recipients: "",
  });

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
  }, []);

  const fetchCampaigns = async () => {
    const { data, error } = await supabase
      .from("email_campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching campaigns:", error);
      return;
    }

    setCampaigns(data || []);
  };

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from("email_templates")
      .select("id, name, subject, template_type")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching templates:", error);
      return;
    }

    setTemplates(data || []);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.subject) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("email_campaigns")
        .insert([{
          name: formData.name,
          description: formData.description,
          subject: formData.subject,
          from_name: formData.from_name,
          from_email: formData.from_email,
          recipient_type: formData.recipient_type,
          template_id: formData.template_id === "none" ? null : formData.template_id,
          custom_recipients: formData.custom_recipients ? formData.custom_recipients.split(",").map(e => e.trim()) : null,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Campagne créée avec succès",
      });

      setIsCreating(false);
      setFormData({
        name: "",
        description: "",
        subject: "",
        from_name: "BNRM",
        from_email: "notifications@bnrm.ma",
        recipient_type: "all_subscribers",
        template_id: "none",
        custom_recipients: "",
      });
      fetchCampaigns();
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (campaignId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir envoyer cette campagne ?")) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-mass-email", {
        body: { campaignId },
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Campagne envoyée avec succès. ${data.totalSent} emails envoyés, ${data.totalFailed} échecs.`,
      });

      fetchCampaigns();
    } catch (error: any) {
      console.error("Error sending campaign:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (campaignId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette campagne ?")) {
      return;
    }

    const { error } = await supabase
      .from("email_campaigns")
      .delete()
      .eq("id", campaignId);

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Succès",
      description: "Campagne supprimée",
    });

    fetchCampaigns();
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      draft: "secondary",
      sending: "default",
      sent: "outline",
      failed: "destructive",
    };

    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Campagnes Email</h2>
          <p className="text-muted-foreground">
            Créez et gérez vos campagnes de mailing de masse
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Campagne
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouvelle Campagne Email</DialogTitle>
              <DialogDescription>
                Créez une nouvelle campagne de mailing de masse
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de la campagne *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Newsletter Janvier 2025"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de la campagne"
                />
              </div>
              <div>
                <Label htmlFor="subject">Objet de l'email *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Nouveautés de janvier"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from_name">Nom de l'expéditeur</Label>
                  <Input
                    id="from_name"
                    value={formData.from_name}
                    onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="from_email">Email de l'expéditeur</Label>
                  <Input
                    id="from_email"
                    type="email"
                    value={formData.from_email}
                    onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="recipient_type">Type de destinataires</Label>
                <Select
                  value={formData.recipient_type}
                  onValueChange={(value) => setFormData({ ...formData, recipient_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_subscribers">Tous les abonnés</SelectItem>
                    <SelectItem value="publishers">Éditeurs</SelectItem>
                    <SelectItem value="printers">Imprimeurs</SelectItem>
                    <SelectItem value="researchers">Chercheurs</SelectItem>
                    <SelectItem value="custom">Liste personnalisée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.recipient_type === "custom" && (
                <div>
                  <Label htmlFor="custom_recipients">Emails (séparés par des virgules)</Label>
                  <Textarea
                    id="custom_recipients"
                    value={formData.custom_recipients}
                    onChange={(e) => setFormData({ ...formData, custom_recipients: e.target.value })}
                    placeholder="email1@example.com, email2@example.com"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="template">Modèle d'email (optionnel)</Label>
                <Select
                  value={formData.template_id}
                  onValueChange={(value) => setFormData({ ...formData, template_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un modèle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun modèle</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} ({template.template_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreate} disabled={isLoading}>
                  {isLoading ? "Création..." : "Créer"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campagnes</CardTitle>
          <CardDescription>
            Liste de toutes vos campagnes de mailing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Objet</TableHead>
                <TableHead>Destinataires</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Envoyés</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{campaign.subject}</TableCell>
                  <TableCell>{campaign.recipient_type}</TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell>
                    {campaign.total_sent} / {campaign.total_recipients}
                    {campaign.total_failed > 0 && (
                      <span className="text-destructive ml-2">
                        ({campaign.total_failed} échecs)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {campaign.sent_at
                      ? format(new Date(campaign.sent_at), "dd/MM/yyyy HH:mm")
                      : format(new Date(campaign.created_at), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {campaign.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => handleSend(campaign.id)}
                          disabled={isLoading}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(campaign.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {campaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Aucune campagne
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
