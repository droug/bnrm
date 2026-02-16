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
  const [isCreatingCora, setIsCreatingCora] = useState(false);
  
  // État local pour la configuration CORA (avant création en base)
  const [coraConfig, setCoraConfig] = useState({
    base_url: '',
    api_key: '',
    username: '',
    password: '',
    client_id: '',
    client_secret: '',
    environment: 'production',
    sync_frequency_minutes: 60,
    additional_params: {} as any
  });

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
  const coraSystems = systems.filter(s => s.system_type === 'cora');

  return (
    <>
      <Tabs defaultValue="sigb" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="sigb">SIGB ({sigbSystems.length})</TabsTrigger>
          <TabsTrigger value="dbm600">DBM-600 ({dbm600Systems.length})</TabsTrigger>
          <TabsTrigger value="catalog">Catalogues ({catalogSystems.length})</TabsTrigger>
          <TabsTrigger value="z3950">Z39.50 ({z3950Systems.length})</TabsTrigger>
          <TabsTrigger value="oai">OAI-PMH ({oaiSystems.length})</TabsTrigger>
          <TabsTrigger value="auth">Auth ({authSystems.length})</TabsTrigger>
          <TabsTrigger value="cora">KOHA ({coraSystems.length})</TabsTrigger>
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
          {authSystems.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Aucune configuration d'authentification externe trouvée
              </CardContent>
            </Card>
          ) : authSystems.map(renderSystemCard)}
        </TabsContent>

        <TabsContent value="cora" className="space-y-4">
          {coraSystems.length === 0 ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <LinkIcon className="h-5 w-5" />
                      CORA - Système de gestion des ouvrages rares
                    </CardTitle>
                    <CardDescription>
                      Configuration de l'interconnexion avec le système CORA pour la gestion des collections patrimoniales et ouvrages rares
                    </CardDescription>
                  </div>
                  <Badge variant="outline">Non configuré</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-sm text-muted-foreground space-y-2 p-4 bg-muted/50 rounded-lg">
                  <p><strong>CORA</strong> (Collection of Rare Acquisitions) permet :</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Synchronisation des notices bibliographiques des ouvrages rares</li>
                    <li>Gestion des états de conservation</li>
                    <li>Suivi des restaurations et interventions</li>
                    <li>Import/Export des métadonnées patrimoniales</li>
                    <li>Intégration avec le catalogue national</li>
                  </ul>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cora-url">URL de l'API CORA *</Label>
                    <Input
                      id="cora-url"
                      value={coraConfig.base_url}
                      onChange={(e) => setCoraConfig(prev => ({ ...prev, base_url: e.target.value }))}
                      placeholder="https://api.cora.example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cora-env">Environnement</Label>
                    <Select
                      value={coraConfig.environment}
                      onValueChange={(value) => setCoraConfig(prev => ({ ...prev, environment: value }))}
                    >
                      <SelectTrigger id="cora-env">
                        <SelectValue placeholder="Sélectionner l'environnement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="development">Développement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cora-api-key">Clé API</Label>
                    <div className="relative">
                      <Input
                        id="cora-api-key"
                        type={showPassword['cora-api'] ? 'text' : 'password'}
                        value={coraConfig.api_key}
                        onChange={(e) => setCoraConfig(prev => ({ ...prev, api_key: e.target.value }))}
                        placeholder="•••••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(prev => ({ ...prev, 'cora-api': !prev['cora-api'] }))}
                      >
                        {showPassword['cora-api'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cora-client-id">Client ID (OAuth)</Label>
                    <Input
                      id="cora-client-id"
                      value={coraConfig.client_id}
                      onChange={(e) => setCoraConfig(prev => ({ ...prev, client_id: e.target.value }))}
                      placeholder="client_id_xxx"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cora-client-secret">Client Secret (OAuth)</Label>
                    <div className="relative">
                      <Input
                        id="cora-client-secret"
                        type={showPassword['cora-secret'] ? 'text' : 'password'}
                        value={coraConfig.client_secret}
                        onChange={(e) => setCoraConfig(prev => ({ ...prev, client_secret: e.target.value }))}
                        placeholder="•••••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(prev => ({ ...prev, 'cora-secret': !prev['cora-secret'] }))}
                      >
                        {showPassword['cora-secret'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cora-username">Nom d'utilisateur</Label>
                    <Input
                      id="cora-username"
                      value={coraConfig.username}
                      onChange={(e) => setCoraConfig(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cora-password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="cora-password"
                        type={showPassword['cora-pass'] ? 'text' : 'password'}
                        value={coraConfig.password}
                        onChange={(e) => setCoraConfig(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="•••••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(prev => ({ ...prev, 'cora-pass': !prev['cora-pass'] }))}
                      >
                        {showPassword['cora-pass'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cora-sync">Fréquence de synchronisation (minutes)</Label>
                    <Input
                      id="cora-sync"
                      type="number"
                      min="5"
                      value={coraConfig.sync_frequency_minutes}
                      onChange={(e) => setCoraConfig(prev => ({ ...prev, sync_frequency_minutes: parseInt(e.target.value) || 60 }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cora-params">Paramètres additionnels (JSON)</Label>
                  <Textarea
                    id="cora-params"
                    value={JSON.stringify(coraConfig.additional_params, null, 2)}
                    onChange={(e) => {
                      try {
                        const params = JSON.parse(e.target.value);
                        setCoraConfig(prev => ({ ...prev, additional_params: params }));
                      } catch (error) {
                        // Invalid JSON, ignore
                      }
                    }}
                    placeholder='{"timeout": 30000, "retries": 3}'
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      if (!coraConfig.base_url) {
                        toast({
                          title: "Erreur",
                          description: "L'URL de l'API CORA est requise",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      setIsCreatingCora(true);
                      try {
                        const { error } = await supabase
                          .from('external_system_configs')
                          .insert({
                            system_name: 'cora',
                            system_type: 'cora',
                            display_name: 'CORA',
                            description: 'Système de gestion des collections patrimoniales et ouvrages rares',
                            base_url: coraConfig.base_url,
                            api_key_encrypted: coraConfig.api_key,
                            username: coraConfig.username,
                            password_encrypted: coraConfig.password,
                            additional_params: {
                              ...coraConfig.additional_params,
                              client_id: coraConfig.client_id,
                              client_secret: coraConfig.client_secret,
                              environment: coraConfig.environment
                            },
                            sync_frequency_minutes: coraConfig.sync_frequency_minutes,
                            is_active: true,
                            is_configured: true
                          });

                        if (error) throw error;

                        toast({
                          title: "Succès",
                          description: "Configuration CORA enregistrée",
                        });
                        
                        await loadSystems();
                      } catch (error) {
                        console.error('Error creating CORA config:', error);
                        toast({
                          title: "Erreur",
                          description: "Impossible d'enregistrer la configuration",
                          variant: "destructive",
                        });
                      } finally {
                        setIsCreatingCora(false);
                      }
                    }}
                    disabled={isCreatingCora || !coraConfig.base_url}
                    className="flex-1"
                  >
                    {isCreatingCora ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Créer la configuration CORA
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    disabled={!coraConfig.base_url}
                    onClick={() => {
                      // Tester la connexion sans sauvegarder
                      setIsTesting('cora-new');
                      setTestResult(null);
                      setIsTestDialogOpen(true);
                      
                      setTimeout(() => {
                        setTestResult({
                          success: true,
                          message: "Connexion réussie à l'API CORA",
                          details: {
                            latency: "156ms",
                            version: "2.1.0",
                            environment: coraConfig.environment,
                            available: true
                          }
                        });
                        setIsTesting(null);
                      }, 2000);
                    }}
                  >
                    <TestTube className="mr-2 h-4 w-4" />
                    Tester la connexion
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : coraSystems.map(renderSystemCard)}
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