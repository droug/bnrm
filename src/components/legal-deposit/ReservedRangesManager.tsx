import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Newspaper, 
  FileText,
  Plus,
  Edit,
  Trash2,
  User,
  AlertCircle,
  CheckCircle,
  Ban
} from "lucide-react";

interface ReservedRange {
  id: string;
  requester_id: string;
  requester_name?: string;
  requester_email?: string;
  deposit_type: string;
  number_type: 'isbn' | 'issn' | 'dl';
  range_start: string;
  range_end: string;
  current_position: string;
  total_numbers: number;
  used_numbers: number;
  status: 'active' | 'exhausted' | 'cancelled';
  notes?: string;
  created_at: string;
}

export const ReservedRangesManager = () => {
  const { toast } = useToast();
  const [reservedRanges, setReservedRanges] = useState<ReservedRange[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<ReservedRange | null>(null);

  const [formData, setFormData] = useState({
    requester_id: '',
    deposit_type: '',
    number_type: 'isbn' as 'isbn' | 'issn' | 'dl',
    quantity: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch reserved ranges with user info
      const { data: rangesData, error: rangesError } = await supabase
        .from('reserved_number_ranges')
        .select(`
          *,
          requester:requester_id (
            id,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (rangesError) throw rangesError;

      // Fetch users (profiles)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .order('first_name');

      if (profilesError) throw profilesError;

      // Map ranges with user names
      const rangesWithNames = (rangesData || []).map((range: any) => ({
        ...range,
        requester_email: range.requester?.email,
        requester_name: profilesData?.find(p => p.user_id === range.requester_id)
          ? `${profilesData.find(p => p.user_id === range.requester_id)?.first_name} ${profilesData.find(p => p.user_id === range.requester_id)?.last_name}`
          : range.requester?.email
      }));

      setReservedRanges(rangesWithNames);
      setUsers(profilesData || []);

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateRange = (numberType: string, depositType: string, quantity: number) => {
    const now = new Date();
    const year = now.getFullYear();
    const timestamp = Date.now().toString().slice(-6);

    if (numberType === 'isbn') {
      const start = `978-9981-${timestamp}-00-0`;
      const endNum = parseInt(timestamp) + quantity - 1;
      const end = `978-9981-${endNum.toString().padStart(6, '0')}-99-9`;
      return { range_start: start, range_end: end };
    } else if (numberType === 'issn') {
      const start = `2550-${timestamp}`;
      const endNum = parseInt(timestamp) + quantity - 1;
      const end = `2550-${endNum.toString().padStart(4, '0')}`;
      return { range_start: start, range_end: end };
    } else {
      const start = `DL-${year}-${timestamp}`;
      const endNum = parseInt(timestamp) + quantity - 1;
      const end = `DL-${year}-${endNum.toString().padStart(6, '0')}`;
      return { range_start: start, range_end: end };
    }
  };

  const handleAddRange = async () => {
    try {
      const quantity = parseInt(formData.quantity);
      if (!formData.requester_id || !formData.deposit_type || !quantity) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        });
        return;
      }

      const { range_start, range_end } = calculateRange(
        formData.number_type,
        formData.deposit_type,
        quantity
      );

      const { error } = await supabase
        .from('reserved_number_ranges')
        .insert([{
          requester_id: formData.requester_id,
          deposit_type: formData.deposit_type,
          number_type: formData.number_type,
          range_start,
          range_end,
          current_position: range_start,
          total_numbers: quantity,
          used_numbers: 0,
          status: 'active',
          notes: formData.notes,
          reserved_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Tranche réservée avec succès"
      });

      setIsAddDialogOpen(false);
      resetForm();
      fetchData();

    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de réserver la tranche",
        variant: "destructive"
      });
    }
  };

  const handleCancelRange = async (rangeId: string) => {
    try {
      const { error } = await supabase
        .from('reserved_number_ranges')
        .update({ status: 'cancelled' })
        .eq('id', rangeId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Tranche annulée"
      });

      fetchData();

    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'annuler la tranche",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      requester_id: '',
      deposit_type: '',
      number_type: 'isbn',
      quantity: '',
      notes: ''
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Actif</Badge>;
      case 'exhausted':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Épuisé</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800"><Ban className="w-3 h-3 mr-1" />Annulé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getNumberTypeIcon = (type: string) => {
    switch (type) {
      case 'isbn': return BookOpen;
      case 'issn': return Newspaper;
      case 'dl': return FileText;
      default: return FileText;
    }
  };

  const getProgressPercentage = (range: ReservedRange) => {
    return (range.used_numbers / range.total_numbers) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tranches Réservées par Demandeur</h2>
          <p className="text-muted-foreground">
            Gestion des plages de numéros réservées pour des demandeurs spécifiques
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Réserver une tranche
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {reservedRanges.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-32">
                <p className="text-muted-foreground">Aucune tranche réservée</p>
              </CardContent>
            </Card>
          ) : (
            reservedRanges.map((range) => {
              const Icon = getNumberTypeIcon(range.number_type);
              return (
                <Card key={range.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-6 w-6 text-primary" />
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {range.number_type.toUpperCase()}
                            <Badge variant="outline">{range.deposit_type}</Badge>
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <User className="h-3 w-3" />
                            {range.requester_name || range.requester_email}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(range.status)}
                        {range.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelRange(range.id)}
                          >
                            <Ban className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Début de plage</p>
                        <p className="font-medium font-mono">{range.range_start}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fin de plage</p>
                        <p className="font-medium font-mono">{range.range_end}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Position actuelle</p>
                        <p className="font-medium font-mono">{range.current_position}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Utilisation</span>
                        <span className="font-medium">
                          {range.used_numbers} / {range.total_numbers} numéros
                        </span>
                      </div>
                      <Progress value={getProgressPercentage(range)} className="h-2" />
                    </div>

                    {range.notes && (
                      <div className="text-sm p-3 bg-muted rounded-md">
                        <p className="font-medium mb-1">Notes:</p>
                        <p className="text-muted-foreground">{range.notes}</p>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Créé le {new Date(range.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Dialog pour réserver une tranche */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Réserver une tranche de numéros</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Demandeur *</Label>
                <Select
                  value={formData.requester_id}
                  onValueChange={(value) => setFormData({ ...formData, requester_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un demandeur" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id}>
                        {user.first_name} {user.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Type de dépôt *</Label>
                <Select
                  value={formData.deposit_type}
                  onValueChange={(value) => setFormData({ ...formData, deposit_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monographie">Monographie</SelectItem>
                    <SelectItem value="periodique">Publication périodique</SelectItem>
                    <SelectItem value="non-livre">Non-livre</SelectItem>
                    <SelectItem value="numerique">Numérique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type de numéro *</Label>
                <Select
                  value={formData.number_type}
                  onValueChange={(value) => setFormData({ ...formData, number_type: value as 'isbn' | 'issn' | 'dl' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="isbn">ISBN</SelectItem>
                    <SelectItem value="issn">ISSN</SelectItem>
                    <SelectItem value="dl">Dépôt Légal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nombre de numéros à réserver *</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Ex: 100"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (optionnel)</Label>
              <Textarea
                placeholder="Informations complémentaires sur cette réservation..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm font-medium text-blue-900 mb-2">Information importante:</p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Cette tranche sera réservée exclusivement pour ce demandeur</li>
                <li>Elle ne pourra pas être utilisée pour d'autres demandes</li>
                <li>La plage sera générée automatiquement selon le type de numéro</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddRange} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Réserver
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};