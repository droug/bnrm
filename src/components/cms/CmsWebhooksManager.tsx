import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, TestTube, Activity, Link as LinkIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

const EVENT_TYPES = [
  { value: 'published', label: 'Publication' },
  { value: 'updated', label: 'Mise à jour' },
  { value: 'deleted', label: 'Suppression' },
  { value: 'created', label: 'Création' }
];

export default function CmsWebhooksManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<any>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [selectedWebhookLogs, setSelectedWebhookLogs] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    webhook_name: '',
    webhook_url: '',
    secret: '',
    description: '',
    trigger_events: [] as string[],
    is_active: true
  });

  const { data: webhooks, isLoading } = useQuery({
    queryKey: ['cms-webhooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_webhooks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: logs } = useQuery({
    queryKey: ['cms-webhook-logs', selectedWebhookLogs],
    queryFn: async () => {
      if (!selectedWebhookLogs) return [];
      
      const { data, error } = await supabase
        .from('cms_webhook_logs')
        .select('*')
        .eq('webhook_id', selectedWebhookLogs)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedWebhookLogs
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('cms_webhooks')
        .insert(data);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-webhooks'] });
      toast({ title: "Webhook créé avec succès" });
      resetForm();
      setShowDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase
        .from('cms_webhooks')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-webhooks'] });
      toast({ title: "Webhook mis à jour" });
      resetForm();
      setShowDialog(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cms_webhooks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-webhooks'] });
      toast({ title: "Webhook supprimé" });
    }
  });

  const testMutation = useMutation({
    mutationFn: async (webhookId: string) => {
      const response = await supabase.functions.invoke('cms-webhooks', {
        body: {
          event_type: 'test',
          entity_type: 'webhook_test',
          entity_id: webhookId,
          data: {
            message: 'Test webhook from CMS',
            timestamp: new Date().toISOString()
          }
        }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      toast({ 
        title: "Test envoyé", 
        description: `${data.summary.successful}/${data.summary.total} webhook(s) réussi(s)` 
      });
      queryClient.invalidateQueries({ queryKey: ['cms-webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['cms-webhook-logs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur lors du test",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      webhook_name: '',
      webhook_url: '',
      secret: '',
      description: '',
      trigger_events: [],
      is_active: true
    });
    setSelectedWebhook(null);
  };

  const handleEdit = (webhook: any) => {
    setSelectedWebhook(webhook);
    setFormData({
      webhook_name: webhook.webhook_name,
      webhook_url: webhook.webhook_url,
      secret: webhook.secret || '',
      description: webhook.description || '',
      trigger_events: webhook.trigger_events || [],
      is_active: webhook.is_active
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (selectedWebhook) {
      updateMutation.mutate({ id: selectedWebhook.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const toggleEventType = (eventType: string) => {
    setFormData(prev => ({
      ...prev,
      trigger_events: prev.trigger_events.includes(eventType)
        ? prev.trigger_events.filter(t => t !== eventType)
        : [...prev.trigger_events, eventType]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Webhooks</h2>
          <p className="text-muted-foreground">
            Notifications automatiques pour invalidation de cache CDN
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedWebhook ? 'Modifier le webhook' : 'Nouveau webhook'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nom</Label>
                <Input
                  value={formData.webhook_name}
                  onChange={(e) => setFormData({ ...formData, webhook_name: e.target.value })}
                  placeholder="CDN Cloudflare"
                />
              </div>

              <div>
                <Label>URL</Label>
                <Input
                  value={formData.webhook_url}
                  onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                  placeholder="https://api.example.com/webhook"
                />
              </div>

              <div>
                <Label>Secret (optionnel)</Label>
                <Input
                  type="password"
                  value={formData.secret}
                  onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                  placeholder="Clé secrète pour signature HMAC"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du webhook"
                  rows={3}
                />
              </div>

              <div>
                <Label className="mb-3 block">Types d'événements</Label>
                <div className="space-y-2">
                  {EVENT_TYPES.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.value}
                        checked={formData.trigger_events.includes(type.value)}
                        onCheckedChange={() => toggleEventType(type.value)}
                      />
                      <label htmlFor={type.value} className="text-sm cursor-pointer">
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Actif</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} disabled={!formData.webhook_name || !formData.webhook_url}>
                  {selectedWebhook ? 'Mettre à jour' : 'Créer'}
                </Button>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Événements</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks?.map((webhook) => (
              <TableRow key={webhook.id}>
                <TableCell className="font-medium">{webhook.webhook_name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <LinkIcon className="h-3 w-3" />
                    <span className="truncate max-w-xs">{webhook.webhook_url}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {webhook.trigger_events?.map((type: string) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {EVENT_TYPES.find(t => t.value === type)?.label || type}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    <div className="text-green-600">✓ {webhook.success_count}</div>
                    <div className="text-red-600">✗ {webhook.error_count}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={webhook.is_active ? "default" : "secondary"}>
                    {webhook.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedWebhookLogs(webhook.id);
                        setShowLogs(true);
                      }}
                    >
                      <Activity className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => testMutation.mutate(webhook.id)}
                      disabled={testMutation.isPending}
                    >
                      <TestTube className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(webhook)}
                    >
                      Éditer
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(webhook.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            Chargement...
          </div>
        )}

        {!isLoading && (!webhooks || webhooks.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            Aucun webhook configuré
          </div>
        )}
      </Card>

      <Dialog open={showLogs} onOpenChange={setShowLogs}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historique des appels</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Événement</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Temps</TableHead>
                <TableHead>Réponse</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs">
                    {new Date(log.triggered_at).toLocaleString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.event_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={log.status === 'success' ? "default" : "destructive"}>
                      {log.response_code}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {log.completed_at && log.triggered_at 
                      ? `${Math.round((new Date(log.completed_at).getTime() - new Date(log.triggered_at).getTime()))}ms`
                      : '-'}
                  </TableCell>
                  <TableCell className="text-xs max-w-xs truncate">
                    {log.error_message || log.response_body}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}
