import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSecureRoles } from '@/hooks/useSecureRoles';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Cookie } from 'lucide-react';
import { z } from 'zod';

const cookieSettingsSchema = z.object({
  title: z.string().trim().min(1, 'Le titre est requis').max(100),
  message: z.string().trim().min(1, 'Le message est requis').max(500),
  accept_button_text: z.string().trim().min(1).max(50),
  reject_button_text: z.string().trim().min(1).max(50),
  settings_button_text: z.string().trim().min(1).max(50),
  privacy_policy_url: z.string().trim().url('URL invalide'),
  cookie_policy_url: z.string().trim().url('URL invalide'),
  enabled: z.boolean(),
  show_settings_button: z.boolean(),
  position: z.enum(['top', 'bottom']),
  theme: z.enum(['light', 'dark']),
});

export default function CookieSettingsPage() {
  const { user } = useAuth();
  const { isAdmin, loading: rolesLoading } = useSecureRoles();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: 'Nous utilisons des cookies 🍪',
    message: 'Ce site utilise des cookies pour améliorer votre expérience.',
    accept_button_text: 'Accepter tous les cookies',
    reject_button_text: 'Refuser',
    settings_button_text: 'Paramètres des cookies',
    privacy_policy_url: '/privacy-policy',
    cookie_policy_url: '/cookie-policy',
    enabled: true,
    show_settings_button: true,
    position: 'bottom' as 'top' | 'bottom',
    theme: 'light' as 'light' | 'dark',
  });

  useEffect(() => {
    if (!rolesLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, rolesLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadSettings();
    }
  }, [isAdmin]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('cookie_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettingsId(data.id);
        setFormData({
          title: data.title || formData.title,
          message: data.message || formData.message,
          accept_button_text: data.accept_button_text || formData.accept_button_text,
          reject_button_text: data.reject_button_text || formData.reject_button_text,
          settings_button_text: data.settings_button_text || formData.settings_button_text,
          privacy_policy_url: data.privacy_policy_url || formData.privacy_policy_url,
          cookie_policy_url: data.cookie_policy_url || formData.cookie_policy_url,
          enabled: data.enabled ?? formData.enabled,
          show_settings_button: data.show_settings_button ?? formData.show_settings_button,
          position: (data.position as 'top' | 'bottom') || formData.position,
          theme: (data.theme as 'light' | 'dark') || formData.theme,
        });
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les paramètres',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate data
      const validated = cookieSettingsSchema.parse(formData);

      const { error } = await supabase
        .from('cookie_settings')
        .update(validated)
        .eq('id', settingsId);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Les paramètres ont été enregistrés',
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'enregistrer les paramètres',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (rolesLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/settings')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux paramètres
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <Cookie className="h-8 w-8 text-primary" />
            Gestion du Bandeau de Cookies
          </h1>
          <p className="text-muted-foreground">
            Personnalisez le message de consentement aux cookies affiché aux visiteurs.
            Conforme au RGPD.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contenu du bandeau</CardTitle>
              <CardDescription>
                Textes affichés dans le bandeau de consentement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="message">Message principal</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.message.length}/500 caractères
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="accept">Bouton Accepter</Label>
                  <Input
                    id="accept"
                    value={formData.accept_button_text}
                    onChange={(e) => setFormData({ ...formData, accept_button_text: e.target.value })}
                    maxLength={50}
                  />
                </div>

                <div>
                  <Label htmlFor="reject">Bouton Refuser</Label>
                  <Input
                    id="reject"
                    value={formData.reject_button_text}
                    onChange={(e) => setFormData({ ...formData, reject_button_text: e.target.value })}
                    maxLength={50}
                  />
                </div>

                <div>
                  <Label htmlFor="settings">Bouton Paramètres</Label>
                  <Input
                    id="settings"
                    value={formData.settings_button_text}
                    onChange={(e) => setFormData({ ...formData, settings_button_text: e.target.value })}
                    maxLength={50}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liens et politiques</CardTitle>
              <CardDescription>
                URLs vers vos politiques de confidentialité et cookies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="privacy">URL Politique de confidentialité</Label>
                <Input
                  id="privacy"
                  type="url"
                  value={formData.privacy_policy_url}
                  onChange={(e) => setFormData({ ...formData, privacy_policy_url: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="cookie">URL Politique des cookies</Label>
                <Input
                  id="cookie"
                  type="url"
                  value={formData.cookie_policy_url}
                  onChange={(e) => setFormData({ ...formData, cookie_policy_url: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Apparence et comportement</CardTitle>
              <CardDescription>
                Personnalisez l'affichage du bandeau
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enabled">Bandeau actif</Label>
                  <p className="text-sm text-muted-foreground">
                    Afficher le bandeau aux nouveaux visiteurs
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-settings">Bouton Paramètres visible</Label>
                  <p className="text-sm text-muted-foreground">
                    Permettre aux utilisateurs de personnaliser
                  </p>
                </div>
                <Switch
                  id="show-settings"
                  checked={formData.show_settings_button}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_settings_button: checked })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value: 'top' | 'bottom') => setFormData({ ...formData, position: value })}
                  >
                    <SelectTrigger id="position">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom">En bas</SelectItem>
                      <SelectItem value="top">En haut</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="theme">Thème</Label>
                  <Select
                    value={formData.theme}
                    onValueChange={(value: 'light' | 'dark') => setFormData({ ...formData, theme: value })}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/settings')}
            >
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
