import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Database, 
  HardDrive, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  FileText,
  Calendar,
  Archive,
  Shield
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PreservationManager: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBackup = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('preservation-backup', {
        body: {
          resourceType: 'database',
          backupType: 'full'
        }
      });

      if (error) throw error;

      toast({
        title: "Sauvegarde créée",
        description: "La sauvegarde complète a été effectuée avec succès.",
      });
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer la sauvegarde.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormatMigration = async () => {
    setIsProcessing(true);
    try {
      toast({
        title: "Migration de formats",
        description: "La migration des formats obsolètes a démarré...",
      });
      
      // Logique de migration ici
      
    } catch (error) {
      console.error('Migration error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Préservation & Conservation</h1>
          <p className="text-muted-foreground">
            Gestion de la pérennité des ressources numériques
          </p>
        </div>
        <Button onClick={handleBackup} disabled={isProcessing}>
          <HardDrive className="mr-2 h-4 w-4" />
          {isProcessing ? 'Sauvegarde en cours...' : 'Nouvelle Sauvegarde'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sauvegardes Totales
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,547</div>
            <p className="text-xs text-muted-foreground">
              +12% ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Migrations en Cours
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              15 formats obsolètes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Intégrité Vérifiée
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.7%</div>
            <p className="text-xs text-muted-foreground">
              Des ressources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Formats À Risque
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">147</div>
            <p className="text-xs text-muted-foreground">
              Nécessitent migration
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <Archive className="mr-2 h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="backups">
            <HardDrive className="mr-2 h-4 w-4" />
            Sauvegardes
          </TabsTrigger>
          <TabsTrigger value="formats">
            <FileText className="mr-2 h-4 w-4" />
            Formats
          </TabsTrigger>
          <TabsTrigger value="schedules">
            <Calendar className="mr-2 h-4 w-4" />
            Planification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>État de la Préservation</CardTitle>
              <CardDescription>
                Vue globale des actions de préservation en cours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sauvegarde Complète</span>
                  <span className="text-sm text-muted-foreground">75%</span>
                </div>
                <Progress value={75} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Migration de Formats</span>
                  <span className="text-sm text-muted-foreground">45%</span>
                </div>
                <Progress value={45} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Vérification Checksum</span>
                  <span className="text-sm text-muted-foreground">92%</span>
                </div>
                <Progress value={92} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions Récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Ressource</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Badge variant="outline">Sauvegarde</Badge>
                    </TableCell>
                    <TableCell>Manuscrit MS-2024-001</TableCell>
                    <TableCell>
                      <Badge variant="default">Complété</Badge>
                    </TableCell>
                    <TableCell>2024-01-15</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge variant="outline">Migration</Badge>
                    </TableCell>
                    <TableCell>Document DL-2024-123</TableCell>
                    <TableCell>
                      <Badge variant="secondary">En cours</Badge>
                    </TableCell>
                    <TableCell>2024-01-14</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Sauvegardes</CardTitle>
              <CardDescription>
                Liste des sauvegardes et leur état de vérification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Shield className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Sauvegarde Complète - Janvier 2024</p>
                      <p className="text-sm text-muted-foreground">2.3 GB • SHA256 vérifié</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">Vérifiée</Badge>
                    <Button variant="outline" size="sm">Restaurer</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Shield className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Sauvegarde Incrémentale - 15/01/2024</p>
                      <p className="text-sm text-muted-foreground">845 MB • En vérification</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">En cours</Badge>
                    <Button variant="outline" size="sm" disabled>Restaurer</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Formats de Préservation</CardTitle>
              <CardDescription>
                Gestion des formats stables et migration des formats obsolètes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Format</TableHead>
                    <TableHead>Extension</TableHead>
                    <TableHead>Stabilité</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">PDF/A-2</TableCell>
                    <TableCell>.pdf</TableCell>
                    <TableCell>
                      <Badge variant="default">Stable</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Recommandé</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">TIFF</TableCell>
                    <TableCell>.tiff</TableCell>
                    <TableCell>
                      <Badge variant="default">Stable</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Recommandé</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">DOC</TableCell>
                    <TableCell>.doc</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Obsolète</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={handleFormatMigration}>
                        Migrer vers PDF/A
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tâches Planifiées</CardTitle>
              <CardDescription>
                Configuration des tâches automatiques de préservation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Calendar className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Sauvegarde Quotidienne</p>
                      <p className="text-sm text-muted-foreground">
                        Tous les jours à 02:00 • Dernière: 15/01/2024
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">Active</Badge>
                    <Button variant="outline" size="sm">Modifier</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <RefreshCw className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Vérification Checksum</p>
                      <p className="text-sm text-muted-foreground">
                        Hebdomadaire • Prochaine: 22/01/2024
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">Active</Badge>
                    <Button variant="outline" size="sm">Modifier</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PreservationManager;