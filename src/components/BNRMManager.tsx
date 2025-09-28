import React, { useState, useEffect } from 'react';
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Plus, History, Eye, Trash2 } from "lucide-react";

interface BNRMService {
  id_service: string;
  categorie: string;
  nom_service: string;
  description: string;
  public_cible: string;
  reference_legale: string;
  created_at: string;
  updated_at: string;
}

interface BNRMTarif {
  id_tarif: string;
  id_service: string;
  montant: number;
  devise: string;
  condition_tarif: string;
  periode_validite: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  bnrm_services?: BNRMService;
}

interface BNRMParametre {
  parametre: string;
  valeur: string;
  commentaire: string;
  created_at: string;
  updated_at: string;
}

interface TarifHistorique {
  id: string;
  id_tarif: string;
  ancienne_valeur: number | null;
  nouvelle_valeur: number | null;
  date_modification: string;
  action: string;
  commentaire: string;
}

export const BNRMManager = () => {
  const { t } = useLanguage();
  const [services, setServices] = useState<BNRMService[]>([]);
  const [tarifs, setTarifs] = useState<BNRMTarif[]>([]);
  const [parametres, setParametres] = useState<BNRMParametre[]>([]);
  const [historique, setHistorique] = useState<TarifHistorique[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTarif, setEditingTarif] = useState<BNRMTarif | null>(null);
  const [editingParametre, setEditingParametre] = useState<BNRMParametre | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les services
      const { data: servicesData, error: servicesError } = await supabase
        .from('bnrm_services')
        .select('*')
        .order('id_service');
      
      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Charger les tarifs avec les services
      const { data: tarifsData, error: tarifsError } = await supabase
        .from('bnrm_tarifs')
        .select(`
          *,
          bnrm_services (*)
        `)
        .order('id_tarif');
      
      if (tarifsError) throw tarifsError;
      setTarifs(tarifsData || []);

      // Charger les paramètres
      const { data: parametresData, error: parametresError } = await supabase
        .from('bnrm_parametres')
        .select('*')
        .order('parametre');
      
      if (parametresError) throw parametresError;
      setParametres(parametresData || []);

      // Charger l'historique des tarifs
      const { data: historiqueData, error: historiqueError } = await supabase
        .from('bnrm_tarifs_historique')
        .select('*')
        .order('date_modification', { ascending: false })
        .limit(50);
      
      if (historiqueError) throw historiqueError;
      setHistorique(historiqueData || []);

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données BNRM",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTarif = async (tarif: BNRMTarif) => {
    try {
      const { error } = await supabase
        .from('bnrm_tarifs')
        .update({
          montant: tarif.montant,
          devise: tarif.devise,
          condition_tarif: tarif.condition_tarif,
          periode_validite: tarif.periode_validite,
          is_active: tarif.is_active
        })
        .eq('id_tarif', tarif.id_tarif);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Tarif mis à jour avec historisation automatique",
      });

      loadData(); // Recharger pour voir l'historique
      setEditingTarif(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le tarif",
        variant: "destructive",
      });
    }
  };

  const updateParametre = async (parametre: BNRMParametre) => {
    try {
      const { error } = await supabase
        .from('bnrm_parametres')
        .update({
          valeur: parametre.valeur,
          commentaire: parametre.commentaire
        })
        .eq('parametre', parametre.parametre);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Paramètre mis à jour",
      });

      loadData();
      setEditingParametre(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le paramètre",
        variant: "destructive",
      });
    }
  };

  const getCategorieColor = (categorie: string) => {
    const colors: Record<string, string> = {
      'Inscription': 'bg-blue-100 text-blue-800',
      'Reproduction': 'bg-green-100 text-green-800',
      'Location': 'bg-purple-100 text-purple-800',
      'Formation': 'bg-orange-100 text-orange-800',
    };
    return colors[categorie] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion Portail BNRM</h1>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Bibliothèque Nationale du Royaume du Maroc
        </Badge>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="services">{t('tabs.services')}</TabsTrigger>
          <TabsTrigger value="tarifs">{t('tabs.tariffs')}</TabsTrigger>
          <TabsTrigger value="parametres">{t('tabs.parameters')}</TabsTrigger>
          <TabsTrigger value="historique">{t('tabs.history')}</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Services BNRM</CardTitle>
              <CardDescription>
                Gestion des services de la Bibliothèque Nationale selon la Loi 67-99 et Décision 2014
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Public Cible</TableHead>
                    <TableHead>Référence Légale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id_service}>
                      <TableCell className="font-mono">{service.id_service}</TableCell>
                      <TableCell>
                        <Badge className={getCategorieColor(service.categorie)}>
                          {service.categorie}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{service.nom_service}</TableCell>
                      <TableCell className="max-w-xs truncate">{service.description}</TableCell>
                      <TableCell className="text-sm">{service.public_cible}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{service.reference_legale}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tarifs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tarifs Paramétrables</CardTitle>
              <CardDescription>
                Gestion des tarifs avec historisation automatique des modifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tarifs.map((tarif) => (
                    <TableRow key={tarif.id_tarif}>
                      <TableCell className="font-mono">{tarif.id_tarif}</TableCell>
                      <TableCell className="font-medium">
                        {tarif.bnrm_services?.nom_service}
                      </TableCell>
                      <TableCell className="font-mono">
                        {tarif.montant} {tarif.devise}
                      </TableCell>
                      <TableCell className="text-sm">{tarif.condition_tarif}</TableCell>
                      <TableCell>{tarif.periode_validite}</TableCell>
                      <TableCell>
                        <Badge variant={tarif.is_active ? "default" : "secondary"}>
                          {tarif.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTarif(tarif)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parametres" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres Généraux</CardTitle>
              <CardDescription>
                Configuration générale du système BNRM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paramètre</TableHead>
                    <TableHead>Valeur</TableHead>
                    <TableHead>Commentaire</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parametres.map((parametre) => (
                    <TableRow key={parametre.parametre}>
                      <TableCell className="font-medium">{parametre.parametre}</TableCell>
                      <TableCell className="font-mono">{parametre.valeur}</TableCell>
                      <TableCell className="text-sm">{parametre.commentaire}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingParametre(parametre)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historique" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Modifications</CardTitle>
              <CardDescription>
                Traçabilité complète des modifications de tarifs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Tarif</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Ancienne Valeur</TableHead>
                    <TableHead>Nouvelle Valeur</TableHead>
                    <TableHead>Commentaire</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historique.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm">
                        {new Date(entry.date_modification).toLocaleString('fr-FR')}
                      </TableCell>
                      <TableCell className="font-mono">{entry.id_tarif}</TableCell>
                      <TableCell>
                        <Badge variant={
                          entry.action === 'CREATE' ? 'default' :
                          entry.action === 'UPDATE' ? 'secondary' : 'destructive'
                        }>
                          {entry.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {entry.ancienne_valeur ? `${entry.ancienne_valeur} DH` : '-'}
                      </TableCell>
                      <TableCell className="font-mono">
                        {entry.nouvelle_valeur ? `${entry.nouvelle_valeur} DH` : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.commentaire}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog pour modifier un tarif */}
      <Dialog open={!!editingTarif} onOpenChange={(open) => !open && setEditingTarif(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le Tarif {editingTarif?.id_tarif}</DialogTitle>
            <DialogDescription>
              Toute modification sera automatiquement historisée
            </DialogDescription>
          </DialogHeader>
          {editingTarif && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="montant">Montant</Label>
                <Input
                  id="montant"
                  type="number"
                  step="0.01"
                  value={editingTarif.montant}
                  onChange={(e) => setEditingTarif({
                    ...editingTarif,
                    montant: parseFloat(e.target.value)
                  })}
                />
              </div>
              <div>
                <Label htmlFor="devise">Devise</Label>
                <Input
                  id="devise"
                  value={editingTarif.devise}
                  onChange={(e) => setEditingTarif({
                    ...editingTarif,
                    devise: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="condition">Condition</Label>
                <Textarea
                  id="condition"
                  value={editingTarif.condition_tarif || ''}
                  onChange={(e) => setEditingTarif({
                    ...editingTarif,
                    condition_tarif: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="periode">Période de Validité</Label>
                <Input
                  id="periode"
                  value={editingTarif.periode_validite}
                  onChange={(e) => setEditingTarif({
                    ...editingTarif,
                    periode_validite: e.target.value
                  })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="actif"
                  checked={editingTarif.is_active}
                  onChange={(e) => setEditingTarif({
                    ...editingTarif,
                    is_active: e.target.checked
                  })}
                />
                <Label htmlFor="actif">Tarif actif</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingTarif(null)}>
                  Annuler
                </Button>
                <Button onClick={() => updateTarif(editingTarif)}>
                  Enregistrer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog pour modifier un paramètre */}
      <Dialog open={!!editingParametre} onOpenChange={(open) => !open && setEditingParametre(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le Paramètre</DialogTitle>
            <DialogDescription>
              {editingParametre?.parametre}
            </DialogDescription>
          </DialogHeader>
          {editingParametre && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="valeur">Valeur</Label>
                <Input
                  id="valeur"
                  value={editingParametre.valeur}
                  onChange={(e) => setEditingParametre({
                    ...editingParametre,
                    valeur: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="commentaire">Commentaire</Label>
                <Textarea
                  id="commentaire"
                  value={editingParametre.commentaire || ''}
                  onChange={(e) => setEditingParametre({
                    ...editingParametre,
                    commentaire: e.target.value
                  })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingParametre(null)}>
                  Annuler
                </Button>
                <Button onClick={() => updateParametre(editingParametre)}>
                  Enregistrer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};