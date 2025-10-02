import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Database, RefreshCw, FileCheck, Calendar, Download, Upload, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PreservationFormat {
  id: string;
  format_name: string;
  file_extension: string;
  format_stability: string;
  is_preservation_format: boolean;
}

interface PreservationAction {
  id: string;
  action_type: string;
  status: string;
  source_format?: string;
  target_format?: string;
  created_at: string;
  completed_at?: string;
}

interface PreservationBackup {
  id: string;
  resource_type: string;
  backup_type: string;
  backup_size_mb?: number;
  is_verified: boolean;
  created_at: string;
  expiry_date?: string;
}

const PreservationManager: React.FC = () => {
  const [formats, setFormats] = useState<PreservationFormat[]>([]);
  const [actions, setActions] = useState<PreservationAction[]>([]);
  const [backups, setBackups] = useState<PreservationBackup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResourceType, setSelectedResourceType] = useState<'content' | 'manuscript'>('content');
  const [selectedBackupType, setSelectedBackupType] = useState<'full' | 'incremental'>('full');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [formatsRes, actionsRes, backupsRes] = await Promise.all([
        supabase.from('preservation_formats').select('*').order('format_name'),
        supabase.from('preservation_actions').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('preservation_backups').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      if (formatsRes.error) throw formatsRes.error;
      if (actionsRes.error) throw actionsRes.error;
      if (backupsRes.error) throw backupsRes.error;

      setFormats(formatsRes.data || []);
      setActions(actionsRes.data || []);
      setBackups(backupsRes.data || []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de préservation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      const { error } = await supabase.functions.invoke('preservation-backup', {
        body: {
          resourceType: selectedResourceType,
          backupType: selectedBackupType
        }
      });

      if (error) throw error;

      toast({
        title: "Sauvegarde lancée",
        description: "La sauvegarde est en cours de traitement"
      });
      
      loadData();
    } catch (error) {
      console.error('Erreur création sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la sauvegarde",
        variant: "destructive"
      });
    }
  };

  const migrateFormat = async (sourceFormat: string, targetFormat: string) => {
    try {
      const { error } = await supabase.functions.invoke('format-migration', {
        body: {
          sourceFormat,
          targetFormat,
          resourceType: selectedResourceType
        }
      });

      if (error) throw error;

      toast({
        title: "Migration lancée",
        description: `Migration de ${sourceFormat} vers ${targetFormat} en cours`
      });
      
      loadData();
    } catch (error) {
      console.error('Erreur migration format:', error);
      toast({
        title: "Erreur",
        description: "Impossible de lancer la migration",
        variant: "destructive"
      });
    }
  };

  const verifyBackup = async (backupId: string) => {
    try {
      const { error } = await supabase.rpc('verify_backup_integrity', { backup_id: backupId });

      if (error) throw error;

      toast({
        title: "Vérification réussie",
        description: "L'intégrité de la sauvegarde a été vérifiée"
      });
      
      loadData();
    } catch (error) {
      console.error('Erreur vérification:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier la sauvegarde",
        variant: "destructive"
      });
    }
  };

  const getStabilityBadge = (stability: string) => {
    const variants = {
      stable: 'default',
      at_risk: 'secondary',
      obsolete: 'destructive'
    };
    return <Badge variant={variants[stability as keyof typeof variants] as any}>{stability}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      in_progress: 'default',
      completed: 'default',
      failed: 'destructive'
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Préservation et Conservation
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestion de la pérennité des ressources numériques
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Créer une sauvegarde
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle sauvegarde</DialogTitle>
              <DialogDescription>
                Créer une sauvegarde pour protéger vos données
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Type de ressource</Label>
                <Select value={selectedResourceType} onValueChange={(v: any) => setSelectedResourceType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="content">Contenu</SelectItem>
                    <SelectItem value="manuscript">Manuscrits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type de sauvegarde</Label>
                <Select value={selectedBackupType} onValueChange={(v: any) => setSelectedBackupType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Complète</SelectItem>
                    <SelectItem value="incremental">Incrémentale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createBackup} className="w-full">
                Créer la sauvegarde
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="formats" className="space-y-4">
        <TabsList>
          <TabsTrigger value="formats" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Formats
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Actions
          </TabsTrigger>
          <TabsTrigger value="backups" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Sauvegardes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="formats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Formats de préservation</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Format</TableHead>
                    <TableHead>Extension</TableHead>
                    <TableHead>Stabilité</TableHead>
                    <TableHead>Préservation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formats.map((format) => (
                    <TableRow key={format.id}>
                      <TableCell className="font-medium">{format.format_name}</TableCell>
                      <TableCell>{format.file_extension}</TableCell>
                      <TableCell>{getStabilityBadge(format.format_stability)}</TableCell>
                      <TableCell>
                        {format.is_preservation_format ? (
                          <Badge variant="default">Recommandé</Badge>
                        ) : (
                          <Badge variant="outline">Standard</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actions de préservation</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Format source</TableHead>
                    <TableHead>Format cible</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actions.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell className="font-medium">{action.action_type}</TableCell>
                      <TableCell>{action.source_format || '-'}</TableCell>
                      <TableCell>{action.target_format || '-'}</TableCell>
                      <TableCell>{getStatusBadge(action.status)}</TableCell>
                      <TableCell>{new Date(action.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sauvegardes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type ressource</TableHead>
                    <TableHead>Type sauvegarde</TableHead>
                    <TableHead>Taille</TableHead>
                    <TableHead>Vérifié</TableHead>
                    <TableHead>Date création</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell className="font-medium">{backup.resource_type}</TableCell>
                      <TableCell>{backup.backup_type}</TableCell>
                      <TableCell>
                        {backup.backup_size_mb ? `${backup.backup_size_mb.toFixed(2)} MB` : '-'}
                      </TableCell>
                      <TableCell>
                        {backup.is_verified ? (
                          <Badge variant="default">Vérifié</Badge>
                        ) : (
                          <Badge variant="secondary">Non vérifié</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(backup.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {!backup.is_verified && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => verifyBackup(backup.id)}
                          >
                            Vérifier
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PreservationManager;
