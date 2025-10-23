import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCulturalActivitiesAuth } from "@/hooks/useCulturalActivitiesAuth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, DollarSign, Tag, Settings, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/cultural-activities/shared/PageHeader";
import { FormDialog } from "@/components/cultural-activities/shared/FormDialog";
import { FormSection } from "@/components/cultural-activities/shared/FormSection";
import { TextField, TextAreaField, SelectField, SwitchField } from "@/components/cultural-activities/shared/FormField";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CulturalTariff {
  id: string;
  tariff_name: string;
  space_type: string | null;
  calculation_base: string;
  amount_ht: number;
  tva_rate: number;
  amount_ttc: number;
  is_active: boolean;
  applies_to_public: boolean;
  applies_to_private: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface ConditionalRule {
  id: string;
  tariff_id: string;
  rule_name: string;
  condition_type: string;
  condition_value: any;
  discount_type: string | null;
  discount_value: number;
  is_active: boolean;
  priority: number;
  created_at: string;
}

const CulturalTariffsManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthorized, loading: authLoading } = useCulturalActivitiesAuth();
  
  const [tariffs, setTariffs] = useState<CulturalTariff[]>([]);
  const [rules, setRules] = useState<ConditionalRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddTariffDialogOpen, setIsAddTariffDialogOpen] = useState(false);
  const [isEditTariffDialogOpen, setIsEditTariffDialogOpen] = useState(false);
  const [isAddRuleDialogOpen, setIsAddRuleDialogOpen] = useState(false);
  const [editingTariff, setEditingTariff] = useState<CulturalTariff | null>(null);
  const [selectedTariffForRule, setSelectedTariffForRule] = useState<string | null>(null);
  
  const [tariffFormData, setTariffFormData] = useState({
    tariff_name: "",
    space_type: "salle",
    calculation_base: "jour",
    amount_ht: 0,
    tva_rate: 20,
    is_active: true,
    applies_to_public: true,
    applies_to_private: true,
    description: ""
  });

  const [ruleFormData, setRuleFormData] = useState({
    rule_name: "",
    condition_type: "organisme_type",
    condition_value: {},
    discount_type: "percentage",
    discount_value: 0,
    is_active: true,
    priority: 0
  });

  useEffect(() => {
    if (!authLoading && isAuthorized) {
      fetchTariffs();
      fetchRules();
    }
  }, [authLoading, isAuthorized]);

  const fetchTariffs = async () => {
    try {
      const { data, error } = await supabase
        .from('cultural_activity_tariffs')
        .select('*')
        .order('tariff_name');

      if (error) throw error;
      setTariffs(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les tarifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('tariff_conditional_rules')
        .select('*')
        .order('priority', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les règles conditionnelles",
        variant: "destructive",
      });
    }
  };

  const handleAddTariff = async () => {
    try {
      const { error } = await supabase
        .from('cultural_activity_tariffs')
        .insert(tariffFormData);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Tarification créée avec succès",
      });

      setIsAddTariffDialogOpen(false);
      resetTariffForm();
      fetchTariffs();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditTariff = async () => {
    if (!editingTariff) return;

    try {
      const { error } = await supabase
        .from('cultural_activity_tariffs')
        .update(tariffFormData)
        .eq('id', editingTariff.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Tarification modifiée avec succès",
      });

      setIsEditTariffDialogOpen(false);
      setEditingTariff(null);
      resetTariffForm();
      fetchTariffs();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTariff = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette tarification ?")) return;

    try {
      const { error } = await supabase
        .from('cultural_activity_tariffs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Tarification supprimée avec succès",
      });

      fetchTariffs();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddRule = async () => {
    if (!selectedTariffForRule) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une tarification",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('tariff_conditional_rules')
        .insert({
          ...ruleFormData,
          tariff_id: selectedTariffForRule
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Règle conditionnelle créée avec succès",
      });

      setIsAddRuleDialogOpen(false);
      setSelectedTariffForRule(null);
      resetRuleForm();
      fetchRules();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette règle ?")) return;

    try {
      const { error } = await supabase
        .from('tariff_conditional_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Règle supprimée avec succès",
      });

      fetchRules();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (tariff: CulturalTariff) => {
    setEditingTariff(tariff);
    setTariffFormData({
      tariff_name: tariff.tariff_name,
      space_type: tariff.space_type || "salle",
      calculation_base: tariff.calculation_base,
      amount_ht: tariff.amount_ht,
      tva_rate: tariff.tva_rate,
      is_active: tariff.is_active,
      applies_to_public: tariff.applies_to_public,
      applies_to_private: tariff.applies_to_private,
      description: tariff.description || ""
    });
    setIsEditTariffDialogOpen(true);
  };

  const resetTariffForm = () => {
    setTariffFormData({
      tariff_name: "",
      space_type: "salle",
      calculation_base: "jour",
      amount_ht: 0,
      tva_rate: 20,
      is_active: true,
      applies_to_public: true,
      applies_to_private: true,
      description: ""
    });
  };

  const resetRuleForm = () => {
    setRuleFormData({
      rule_name: "",
      condition_type: "organisme_type",
      condition_value: {},
      discount_type: "percentage",
      discount_value: 0,
      is_active: true,
      priority: 0
    });
  };

  const calculateTTC = (ht: number, tva: number) => {
    return (ht * (1 + tva / 100)).toFixed(2);
  };

  const loadExampleTariffs = async () => {
    const examples = [
      {
        tariff_name: "Tarif location salle conférence journée complète",
        space_type: "salle",
        calculation_base: "jour",
        amount_ht: 3000,
        tva_rate: 20,
        is_active: true,
        applies_to_public: true,
        applies_to_private: true,
        description: "Tarif pour une journée complète (8h-20h) incluant l'accès à la salle et l'équipement de base"
      },
      {
        tariff_name: "Tarif location salle conférence demi-journée",
        space_type: "salle",
        calculation_base: "demi_jour",
        amount_ht: 1800,
        tva_rate: 20,
        is_active: true,
        applies_to_public: true,
        applies_to_private: true,
        description: "Tarif pour une demi-journée (4h) incluant l'accès à la salle et l'équipement de base"
      },
      {
        tariff_name: "Tarif exposition événementiel - Jour",
        space_type: "exposition",
        calculation_base: "jour",
        amount_ht: 2500,
        tva_rate: 20,
        is_active: true,
        applies_to_public: false,
        applies_to_private: true,
        description: "Tarif journalier pour événement dans l'espace exposition"
      },
      {
        tariff_name: "Tarif location auditorium - Heure",
        space_type: "salle",
        calculation_base: "heure",
        amount_ht: 500,
        tva_rate: 20,
        is_active: true,
        applies_to_public: true,
        applies_to_private: true,
        description: "Tarif horaire pour l'auditorium avec système de sonorisation"
      },
      {
        tariff_name: "Tarif location espace extérieur - Événement",
        space_type: "autre",
        calculation_base: "événement",
        amount_ht: 5000,
        tva_rate: 20,
        is_active: true,
        applies_to_public: false,
        applies_to_private: true,
        description: "Forfait pour événement dans l'espace extérieur"
      }
    ];

    try {
      const { error } = await supabase
        .from('cultural_activity_tariffs')
        .insert(examples);

      if (error) throw error;

      toast({
        title: "Exemples chargés",
        description: `${examples.length} tarifications d'exemple ont été ajoutées`,
      });

      fetchTariffs();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadExampleRules = async () => {
    if (tariffs.length === 0) {
      toast({
        title: "Information",
        description: "Veuillez d'abord créer ou charger des tarifications",
        variant: "default",
      });
      return;
    }

    const examples = [
      {
        tariff_id: tariffs[0].id,
        rule_name: "Réduction organismes étatiques",
        condition_type: "organisme_type",
        condition_value: { type: "etatique" },
        discount_type: "percentage",
        discount_value: 30,
        is_active: true,
        priority: 10
      },
      {
        tariff_id: tariffs[0].id,
        rule_name: "Réduction associations à but non lucratif",
        condition_type: "organisme_type",
        condition_value: { type: "association" },
        discount_type: "percentage",
        discount_value: 20,
        is_active: true,
        priority: 8
      },
      {
        tariff_id: tariffs[0].id,
        rule_name: "Supplément week-end",
        condition_type: "periode",
        condition_value: { jours: ["samedi", "dimanche"] },
        discount_type: "percentage",
        discount_value: -15,
        is_active: true,
        priority: 5
      },
      {
        tariff_id: tariffs[0].id,
        rule_name: "Réduction réservation longue durée (>3 jours)",
        condition_type: "duree",
        condition_value: { min_jours: 3 },
        discount_type: "percentage",
        discount_value: 25,
        is_active: true,
        priority: 7
      }
    ];

    try {
      const { error } = await supabase
        .from('tariff_conditional_rules')
        .insert(examples);

      if (error) throw error;

      toast({
        title: "Exemples chargés",
        description: `${examples.length} règles conditionnelles d'exemple ont été ajoutées`,
      });

      fetchRules();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-6">
          <p>Chargement...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Tarifications et Charges"
          description="Gestion des grilles tarifaires et règles conditionnelles"
          icon={<DollarSign className="h-8 w-8" />}
        />

        <Tabs defaultValue="tariffs" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="tariffs">Tarifications</TabsTrigger>
            <TabsTrigger value="rules">Règles conditionnelles</TabsTrigger>
          </TabsList>

          <TabsContent value="tariffs" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Grilles tarifaires</h2>
                    <p className="text-muted-foreground">
                      Gérez les tarifs pour les espaces et services
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={loadExampleTariffs}>
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Charger des exemples
                    </Button>
                    <Button onClick={() => { resetTariffForm(); setIsAddTariffDialogOpen(true); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter une tarification
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <p>Chargement...</p>
                ) : tariffs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucune tarification configurée
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Type d'espace</TableHead>
                        <TableHead>Base de calcul</TableHead>
                        <TableHead>Montant HT</TableHead>
                        <TableHead>TVA</TableHead>
                        <TableHead>Montant TTC</TableHead>
                        <TableHead>Applicable</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tariffs.map((tariff) => (
                        <TableRow key={tariff.id}>
                          <TableCell className="font-medium">{tariff.tariff_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{tariff.space_type}</Badge>
                          </TableCell>
                          <TableCell>{tariff.calculation_base}</TableCell>
                          <TableCell>{tariff.amount_ht.toFixed(2)} MAD</TableCell>
                          <TableCell>{tariff.tva_rate}%</TableCell>
                          <TableCell className="font-semibold">
                            {tariff.amount_ttc.toFixed(2)} MAD
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {tariff.applies_to_public && (
                                <Badge variant="secondary" className="text-xs">Public</Badge>
                              )}
                              {tariff.applies_to_private && (
                                <Badge variant="secondary" className="text-xs">Privé</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {tariff.is_active ? (
                              <Badge className="bg-green-500">Actif</Badge>
                            ) : (
                              <Badge variant="secondary">Inactif</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTariffForRule(tariff.id);
                                  setIsAddRuleDialogOpen(true);
                                }}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(tariff)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteTariff(tariff.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Règles conditionnelles</h2>
                    <p className="text-muted-foreground">
                      Définissez des réductions selon des critères spécifiques
                    </p>
                  </div>
                  <Button variant="outline" onClick={loadExampleRules}>
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Charger des exemples
                  </Button>
                </div>

                {rules.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucune règle conditionnelle configurée
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom de la règle</TableHead>
                        <TableHead>Type de condition</TableHead>
                        <TableHead>Réduction</TableHead>
                        <TableHead>Priorité</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">{rule.rule_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{rule.condition_type}</Badge>
                          </TableCell>
                          <TableCell>
                            {rule.discount_type === 'percentage'
                              ? `${rule.discount_value}%`
                              : `${rule.discount_value} MAD`}
                          </TableCell>
                          <TableCell>{rule.priority}</TableCell>
                          <TableCell>
                            {rule.is_active ? (
                              <Badge className="bg-green-500">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteRule(rule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog Ajout Tarification */}
        <FormDialog
          open={isAddTariffDialogOpen}
          onOpenChange={setIsAddTariffDialogOpen}
          title="Ajouter une nouvelle tarification"
          description="Créez une nouvelle grille tarifaire"
          onSubmit={handleAddTariff}
          maxWidth="3xl"
        >
          <FormSection title="Informations générales" icon={<Tag className="h-5 w-5" />}>
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Nom de la tarification"
                required
                value={tariffFormData.tariff_name}
                onChange={(value) => setTariffFormData({ ...tariffFormData, tariff_name: value })}
                placeholder="Ex: Tarif location salle conférence demi-journée"
              />

              <SelectField
                label="Type d'espace"
                value={tariffFormData.space_type}
                onChange={(value) => setTariffFormData({ ...tariffFormData, space_type: value })}
                options={[
                  { value: "salle", label: "Salle" },
                  { value: "esplanade", label: "Esplanade" },
                  { value: "auditorium", label: "Auditorium" },
                  { value: "exposition", label: "Exposition" },
                  { value: "autre", label: "Autre" }
                ]}
              />
            </div>

            <SelectField
              label="Base de calcul"
              required
              value={tariffFormData.calculation_base}
              onChange={(value) => setTariffFormData({ ...tariffFormData, calculation_base: value })}
              options={[
                { value: "heure", label: "À l'heure" },
                { value: "demi_journee", label: "Demi-journée" },
                { value: "jour", label: "À la journée" },
                { value: "evenement", label: "Par événement" }
              ]}
            />

            <TextAreaField
              label="Description"
              value={tariffFormData.description}
              onChange={(value) => setTariffFormData({ ...tariffFormData, description: value })}
              placeholder="Description de la tarification"
              rows={3}
            />
          </FormSection>

          <FormSection title="Montants" icon={<DollarSign className="h-5 w-5" />}>
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Montant HT (MAD)"
                required
                type="number"
                value={tariffFormData.amount_ht}
                onChange={(value) => setTariffFormData({ ...tariffFormData, amount_ht: parseFloat(value) || 0 })}
                placeholder="0.00"
                step={0.01}
              />

              <TextField
                label="TVA (%)"
                required
                type="number"
                value={tariffFormData.tva_rate}
                onChange={(value) => setTariffFormData({ ...tariffFormData, tva_rate: parseFloat(value) || 0 })}
                placeholder="20"
                step={0.01}
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Montant TTC calculé:</span>
                <span className="text-2xl font-bold text-primary">
                  {calculateTTC(tariffFormData.amount_ht, tariffFormData.tva_rate)} MAD
                </span>
              </div>
            </div>
          </FormSection>

          <FormSection title="Applicabilité">
            <div className="space-y-4">
              <SwitchField
                label="Applicable aux organismes publics"
                checked={tariffFormData.applies_to_public}
                onChange={(checked) => setTariffFormData({ ...tariffFormData, applies_to_public: checked })}
              />

              <SwitchField
                label="Applicable aux organismes privés"
                checked={tariffFormData.applies_to_private}
                onChange={(checked) => setTariffFormData({ ...tariffFormData, applies_to_private: checked })}
              />

              <SwitchField
                label="Tarification active"
                checked={tariffFormData.is_active}
                onChange={(checked) => setTariffFormData({ ...tariffFormData, is_active: checked })}
              />
            </div>
          </FormSection>
        </FormDialog>

        {/* Dialog Modification Tarification */}
        <FormDialog
          open={isEditTariffDialogOpen}
          onOpenChange={setIsEditTariffDialogOpen}
          title="Modifier la tarification"
          description="Modifiez les informations de la tarification"
          onSubmit={handleEditTariff}
          maxWidth="3xl"
        >
          <FormSection title="Informations générales" icon={<Tag className="h-5 w-5" />}>
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Nom de la tarification"
                required
                value={tariffFormData.tariff_name}
                onChange={(value) => setTariffFormData({ ...tariffFormData, tariff_name: value })}
              />

              <SelectField
                label="Type d'espace"
                value={tariffFormData.space_type}
                onChange={(value) => setTariffFormData({ ...tariffFormData, space_type: value })}
                options={[
                  { value: "salle", label: "Salle" },
                  { value: "esplanade", label: "Esplanade" },
                  { value: "auditorium", label: "Auditorium" },
                  { value: "exposition", label: "Exposition" },
                  { value: "autre", label: "Autre" }
                ]}
              />
            </div>

            <SelectField
              label="Base de calcul"
              required
              value={tariffFormData.calculation_base}
              onChange={(value) => setTariffFormData({ ...tariffFormData, calculation_base: value })}
              options={[
                { value: "heure", label: "À l'heure" },
                { value: "demi_journee", label: "Demi-journée" },
                { value: "jour", label: "À la journée" },
                { value: "evenement", label: "Par événement" }
              ]}
            />

            <TextAreaField
              label="Description"
              value={tariffFormData.description}
              onChange={(value) => setTariffFormData({ ...tariffFormData, description: value })}
              rows={3}
            />
          </FormSection>

          <FormSection title="Montants" icon={<DollarSign className="h-5 w-5" />}>
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Montant HT (MAD)"
                required
                type="number"
                value={tariffFormData.amount_ht}
                onChange={(value) => setTariffFormData({ ...tariffFormData, amount_ht: parseFloat(value) || 0 })}
                step={0.01}
              />

              <TextField
                label="TVA (%)"
                required
                type="number"
                value={tariffFormData.tva_rate}
                onChange={(value) => setTariffFormData({ ...tariffFormData, tva_rate: parseFloat(value) || 0 })}
                step={0.01}
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Montant TTC calculé:</span>
                <span className="text-2xl font-bold text-primary">
                  {calculateTTC(tariffFormData.amount_ht, tariffFormData.tva_rate)} MAD
                </span>
              </div>
            </div>
          </FormSection>

          <FormSection title="Applicabilité">
            <div className="space-y-4">
              <SwitchField
                label="Applicable aux organismes publics"
                checked={tariffFormData.applies_to_public}
                onChange={(checked) => setTariffFormData({ ...tariffFormData, applies_to_public: checked })}
              />

              <SwitchField
                label="Applicable aux organismes privés"
                checked={tariffFormData.applies_to_private}
                onChange={(checked) => setTariffFormData({ ...tariffFormData, applies_to_private: checked })}
              />

              <SwitchField
                label="Tarification active"
                checked={tariffFormData.is_active}
                onChange={(checked) => setTariffFormData({ ...tariffFormData, is_active: checked })}
              />
            </div>
          </FormSection>
        </FormDialog>

        {/* Dialog Ajout Règle Conditionnelle */}
        <FormDialog
          open={isAddRuleDialogOpen}
          onOpenChange={setIsAddRuleDialogOpen}
          title="Ajouter une règle conditionnelle"
          description="Définissez une réduction basée sur des conditions"
          onSubmit={handleAddRule}
          maxWidth="2xl"
        >
          <FormSection title="Informations de la règle">
            <TextField
              label="Nom de la règle"
              required
              value={ruleFormData.rule_name}
              onChange={(value) => setRuleFormData({ ...ruleFormData, rule_name: value })}
              placeholder="Ex: Réduction organisme étatique"
            />

            <SelectField
              label="Type de condition"
              required
              value={ruleFormData.condition_type}
              onChange={(value) => setRuleFormData({ ...ruleFormData, condition_type: value })}
              options={[
                { value: "organisme_type", label: "Type d'organisme" },
                { value: "date_range", label: "Période de dates" },
                { value: "nombre_jours", label: "Nombre de jours" },
                { value: "recurrence", label: "Réservation récurrente" }
              ]}
            />

            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Type de réduction"
                value={ruleFormData.discount_type || "percentage"}
                onChange={(value) => setRuleFormData({ ...ruleFormData, discount_type: value })}
                options={[
                  { value: "percentage", label: "Pourcentage (%)" },
                  { value: "fixed_amount", label: "Montant fixe (MAD)" }
                ]}
              />

              <TextField
                label="Valeur de la réduction"
                required
                type="number"
                value={ruleFormData.discount_value}
                onChange={(value) => setRuleFormData({ ...ruleFormData, discount_value: parseFloat(value) || 0 })}
                placeholder="10"
                step={0.01}
              />
            </div>

            <TextField
              label="Priorité"
              type="number"
              value={ruleFormData.priority}
              onChange={(value) => setRuleFormData({ ...ruleFormData, priority: parseInt(value) || 0 })}
              helpText="Plus la priorité est élevée, plus la règle sera appliquée en premier"
            />

            <SwitchField
              label="Règle active"
              checked={ruleFormData.is_active}
              onChange={(checked) => setRuleFormData({ ...ruleFormData, is_active: checked })}
            />
          </FormSection>
        </FormDialog>
      </div>

      <Footer />
    </div>
  );
};

export default CulturalTariffsManagement;
