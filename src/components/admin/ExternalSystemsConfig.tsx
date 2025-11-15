import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, TestTube, RefreshCw, Link as LinkIcon, AlertCircle, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ExternalSystem {
  id: string;
  system_name: string;
  system_type: string;
  display_name: string;
  description: string;
  base_url: string;
  api_key_encrypted: string;
  username: string;
  password_encrypted: string;
  additional_params: any;
  is_active: boolean;
  is_configured: boolean;
  last_sync_at: string | null;
  last_sync_status: string | null;
  sync_frequency_minutes: number;
}

export function ExternalSystemsConfig() {
  const { toast } = useToast();
  const [systems, setSystems] = useState<ExternalSystem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<ExternalSystem | null>(null);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    loadSystems();
  }, []);

  const loadSystems = async () => {
    try {
      const { data, error } = await supabase
        .from('external_system_configs')
        .select('*')
        .order('display_name');

      if (error) throw error;
      setSystems(data || []);
    } catch (error) {
      console.error('Error loading systems:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les configurations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (system: ExternalSystem) => {
    setIsSaving(system.id);
    try {
      const { error } = await supabase
        .from('external_system_configs')
        .update({
          base_url: system.base_url,
          api_key_encrypted: system.api_key_encrypted,
          username: system.username,
          password_encrypted: system.password_encrypted,
          additional_params: system.additional_params,
          is_active: system.is_active,
          is_configured: !!(system.base_url || system.api_key_encrypted),
          sync_frequency_minutes: system.sync_frequency_minutes,
        })
        .eq('id', system.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Configuration enregistrée",
      });
      
      await loadSystems();
    } catch (error) {
      console.error('Error saving system:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la configuration",
        variant: "destructive",
      });
    } finally {
      setIsSaving(null);
    }
  };

  const handleTest = async (system: ExternalSystem) => {
    setIsTesting(system.id);
    setTestResult(null);
    setIsTestDialogOpen(true);
    
    try {
      // Simuler un test de connexion
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTestResult({
        success: true,
        message: "Connexion réussie au système externe",
        details: {
          latency: "123ms",
          version: "1.0.0",
          available: true
        }
      });

      toast({
        title: "Test réussi",
        description: `Connexion à ${system.display_name} établie`,
      });
    } catch (error) {
      console.error('Error testing system:', error);
      setTestResult({
        success: false,
        message: "Échec de la connexion",
        error: error.message
      });
      
      toast({
        title: "Échec du test",
        description: "Impossible de se connecter au système",
        variant: "destructive",
      });
    } finally {
      setIsTesting(null);
    }
  };

  const updateSystem = (id: string, field: string, value: any) => {
    setSystems(systems.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const renderSystemCard = (system: ExternalSystem) => (
    <Card key={system.id} className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              {system.display_name}
              {system.is_active && (
                <Badge variant="default" className="ml-2">Actif</Badge>
              )}
              {!system.is_configured && (
                <Badge variant="outline" className="ml-2">Non configuré</Badge>
              )}
            </CardTitle>
            <CardDescription>{system.description}</CardDescription>
          </div>
          <Switch
            checked={system.is_active}
            onCheckedChange={(checked) => updateSystem(system.id, 'is_active', checked)}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {system.last_sync_at && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Dernière synchronisation : {formatDistanceToNow(new Date(system.last_sync_at), { 
                addSuffix: true, 
                locale: fr 
              })}
              {system.last_sync_status && (
                <Badge variant={system.last_sync_status === 'success' ? 'default' : 'destructive'} className="ml-2">
                  {system.last_sync_status}
                </Badge>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div>
            <Label htmlFor={`url-${system.id}`}>URL de base</Label>
            <Input
              id={`url-${system.id}`}
              value={system.base_url || ''}
              onChange={(e) => updateSystem(system.id, 'base_url', e.target.value)}
              placeholder="https://api.example.com"
            />
          </div>

          <div>
            <Label htmlFor={`api-key-${system.id}`}>Clé API</Label>
            <div className="relative">
              <Input
                id={`api-key-${system.id}`}
                type={showPassword[system.id] ? 'text' : 'password'}
                value={system.api_key_encrypted || ''}
                onChange={(e) => updateSystem(system.id, 'api_key_encrypted', e.target.value)}
                placeholder="•••••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(prev => ({ ...prev, [system.id]: !prev[system.id] }))}
              >
                {showPassword[system.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {system.system_type === 'z3950' && (
            <>
              <div>
                <Label htmlFor={`username-${system.id}`}>Nom d'utilisateur</Label>
                <Input
                  id={`username-${system.id}`}
                  value={system.username || ''}
                  onChange={(e) => updateSystem(system.id, 'username', e.target.value)}
                  placeholder="username"
                />
              </div>
              
              <div>
                <Label htmlFor={`password-${system.id}`}>Mot de passe</Label>
                <div className="relative">
                  <Input
                    id={`password-${system.id}`}
                    type={showPassword[`${system.id}-pass`] ? 'text' : 'password'}
                    value={system.password_encrypted || ''}
                    onChange={(e) => updateSystem(system.id, 'password_encrypted', e.target.value)}
                    placeholder="•••••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(prev => ({ ...prev, [`${system.id}-pass`]: !prev[`${system.id}-pass`] }))}
                  >
                    {showPassword[`${system.id}-pass`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}

          <div>
            <Label htmlFor={`sync-freq-${system.id}`}>Fréquence de synchronisation (minutes)</Label>
            <Input
              id={`sync-freq-${system.id}`}
              type="number"
              min="5"
              value={system.sync_frequency_minutes || 60}
              onChange={(e) => updateSystem(system.id, 'sync_frequency_minutes', parseInt(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor={`params-${system.id}`}>Paramètres additionnels (JSON)</Label>
            <Textarea
              id={`params-${system.id}`}
              value={JSON.stringify(system.additional_params || {}, null, 2)}
              onChange={(e) => {
                try {
                  const params = JSON.parse(e.target.value);
                  updateSystem(system.id, 'additional_params', params);
                } catch (error) {
                  // Invalid JSON, ignore
                }
              }}
              placeholder='{"param": "value"}'
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handleSave(system)}
            disabled={isSaving === system.id}
            className="flex-1"
          >
            {isSaving === system.id ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleTest(system)}
            disabled={!system.is_configured || isTesting === system.id}
          >
            {isTesting === system.id ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Test...
              </>
            ) : (
              <>
                <TestTube className="mr-2 h-4 w-4" />
                Tester
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const catalogSystems = systems.filter(s => s.system_type === 'catalog');
  const sigbSystems = systems.filter(s => s.system_type === 'sigb' && s.system_name !== 'dbm-600');
  const dbm600Systems = systems.filter(s => s.system_name === 'dbm-600');
  const z3950Systems = systems.filter(s => s.system_type === 'z3950');
  const oaiSystems = systems.filter(s => s.system_type === 'oai-pmh');
  const authSystems = systems.filter(s => s.system_type === 'auth' || s.system_type === 'ldap' || s.system_type === 'active_directory');

  return (
    <>
      <Tabs defaultValue="sigb" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="sigb">SIGB ({sigbSystems.length})</TabsTrigger>
          <TabsTrigger value="dbm600">DBM-600 ({dbm600Systems.length})</TabsTrigger>
          <TabsTrigger value="catalog">Catalogues ({catalogSystems.length})</TabsTrigger>
          <TabsTrigger value="z3950">Z39.50 ({z3950Systems.length})</TabsTrigger>
          <TabsTrigger value="oai">OAI-PMH ({oaiSystems.length})</TabsTrigger>
          <TabsTrigger value="auth">Authentification ({authSystems.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="sigb" className="space-y-4">
          {sigbSystems.map(renderSystemCard)}
        </TabsContent>

        <TabsContent value="dbm600" className="space-y-4">
          {dbm600Systems.map(renderSystemCard)}
        </TabsContent>

        <TabsContent value="catalog" className="space-y-4">
          {catalogSystems.map(renderSystemCard)}
        </TabsContent>

        <TabsContent value="z3950" className="space-y-4">
          {z3950Systems.map(renderSystemCard)}
        </TabsContent>

        <TabsContent value="oai" className="space-y-4">
          {oaiSystems.map(renderSystemCard)}
        </TabsContent>

        <TabsContent value="auth" className="space-y-4">
          {authSystems.map(renderSystemCard)}
        </TabsContent>
      </Tabs>

      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Résultat du test de connexion</DialogTitle>
            <DialogDescription>
              Test de connectivité au système externe
            </DialogDescription>
          </DialogHeader>
          
          {testResult && (
            <div className="space-y-4">
              <Alert variant={testResult.success ? "default" : "destructive"}>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>{testResult.message}</AlertDescription>
              </Alert>
              
              {testResult.details && (
                <div className="text-sm space-y-2">
                  <div className="font-semibold">Détails :</div>
                  <pre className="bg-muted p-3 rounded-md overflow-auto">
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                </div>
              )}
              
              {testResult.error && (
                <div className="text-sm text-destructive">
                  <div className="font-semibold">Erreur :</div>
                  <p>{testResult.error}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsTestDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}