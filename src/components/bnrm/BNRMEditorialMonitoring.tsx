import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Mail, FileText, Calendar, Send, Settings, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import logoHeader from "@/assets/logo-header-report.png";

interface EditorialMonitoringItem {
  id: string;
  dlNumber: string;
  title: string;
  author: string;
  publisher: string;
  attributionDate: string;
  daysElapsed: number;
  status: 'pending' | 'reminded_20' | 'reminded_40' | 'claim_sent' | 'received' | 'rejected';
  lastAction: string;
  nextAction: string;
  nextActionDate: string;
}

interface NotificationSettings {
  reminder20Enabled: boolean;
  reminder40Enabled: boolean;
  claimEnabled: boolean;
  reminder20Days: number;
  reminder40Days: number;
  claimDays: number;
  emailTemplate20: string;
  emailTemplate40: string;
  autoSend: boolean;
}

export default function BNRMEditorialMonitoring() {
  const [items, setItems] = useState<EditorialMonitoringItem[]>([
    {
      id: "1",
      dlNumber: "DL-2025-001234",
      title: "Histoire du Maroc Contemporain",
      author: "Ahmed Bennani",
      publisher: "Editions Marocaines",
      attributionDate: "2025-09-15",
      daysElapsed: 23,
      status: "reminded_20",
      lastAction: "Rappel 20j envoyé",
      nextAction: "Rappel 40j",
      nextActionDate: "2025-10-25"
    },
    {
      id: "2",
      dlNumber: "DL-2025-001189",
      title: "La Littérature Amazigh",
      author: "Fatima Ouali",
      publisher: "Dar El Kitab",
      attributionDate: "2025-08-20",
      daysElapsed: 48,
      status: "reminded_40",
      lastAction: "Rappel 40j envoyé",
      nextAction: "Lettre réclamation",
      nextActionDate: "2025-10-20"
    },
    {
      id: "3",
      dlNumber: "DL-2025-001298",
      title: "Économie et Développement",
      author: "Mohamed Alaoui",
      publisher: "Presses Universitaires",
      attributionDate: "2025-07-10",
      daysElapsed: 88,
      status: "claim_sent",
      lastAction: "Lettre réclamation envoyée",
      nextAction: "Suivi juridique",
      nextActionDate: "2025-10-15"
    }
  ]);

  const [settings, setSettings] = useState<NotificationSettings>({
    reminder20Enabled: true,
    reminder40Enabled: true,
    claimEnabled: true,
    reminder20Days: 20,
    reminder40Days: 40,
    claimDays: 60,
    emailTemplate20: "Rappel du dépôt légal après 20 jours",
    emailTemplate40: "Rappel du dépôt légal après 40 jours",
    autoSend: false
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "En attente", variant: "secondary" as const, icon: Clock },
      reminded_20: { label: "Rappel 20j", variant: "default" as const, icon: Bell },
      reminded_40: { label: "Rappel 40j", variant: "default" as const, icon: AlertCircle },
      claim_sent: { label: "Réclamation", variant: "destructive" as const, icon: Mail },
      received: { label: "Reçu", variant: "default" as const, icon: CheckCircle },
      rejected: { label: "Rejeté", variant: "destructive" as const, icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const generateClaimLetter = (item: EditorialMonitoringItem) => {
    const doc = new jsPDF();

    // Add logo
    doc.addImage(logoHeader, 'PNG', 15, 10, 50, 15);

    // Header
    doc.setFontSize(10);
    doc.text("Bibliothèque Nationale du Royaume du Maroc", 15, 35);
    doc.text("Avenue Ibn Battouta, BP 1003", 15, 40);
    doc.text("Rabat, Maroc", 15, 45);

    // Date and reference
    doc.setFontSize(10);
    const today = new Date().toLocaleDateString('fr-FR');
    doc.text(`Rabat, le ${today}`, 140, 60);
    doc.text(`Réf: BNRM/DL/${item.dlNumber}`, 15, 70);

    // Recipient
    doc.setFontSize(11);
    doc.text("À l'attention de", 15, 85);
    doc.setFont(undefined, 'bold');
    doc.text(item.publisher, 15, 90);
    doc.setFont(undefined, 'normal');

    // Subject
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("Objet: Réclamation - Dépôt Légal", 15, 105);
    doc.setFont(undefined, 'normal');

    // Body
    doc.setFontSize(11);
    const bodyText = [
      "Madame, Monsieur,",
      "",
      `Nous accusons réception de votre déclaration de dépôt légal numéro ${item.dlNumber}`,
      `pour l'ouvrage intitulé "${item.title}" de ${item.author}, attribué le ${new Date(item.attributionDate).toLocaleDateString('fr-FR')}.`,
      "",
      "Conformément aux dispositions de la loi n° 67-99 relative au dépôt légal,",
      "nous constatons que les exemplaires réglementaires n'ont pas été déposés",
      "à la Bibliothèque Nationale dans les délais impartis.",
      "",
      "Malgré nos rappels précédents, aucun exemplaire n'a été reçu à ce jour.",
      "",
      "Nous vous prions de bien vouloir régulariser votre situation en déposant",
      "les exemplaires requis dans un délai de 15 jours à compter de la réception",
      "de la présente lettre.",
      "",
      "À défaut, nous nous verrons dans l'obligation de transmettre votre dossier",
      "au Service des Affaires Juridiques pour les suites appropriées.",
      "",
      "Nous vous prions d'agréer, Madame, Monsieur, l'expression de nos",
      "salutations distinguées.",
    ];

    let yPosition = 115;
    bodyText.forEach(line => {
      doc.text(line, 15, yPosition);
      yPosition += 6;
    });

    // Signature
    doc.setFont(undefined, 'bold');
    doc.text("Le Chef du Département", 15, yPosition + 10);
    doc.text("Agence Bibliographique Nationale", 15, yPosition + 15);

    // Footer
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text("Ce document est généré automatiquement par le système de gestion du dépôt légal de la BNRM", 15, 280);

    doc.save(`Reclamation_${item.dlNumber}.pdf`);
    toast.success("Lettre de réclamation générée");
  };

  const sendReminder = (item: EditorialMonitoringItem, type: '20' | '40') => {
    toast.success(`Rappel ${type} jours envoyé pour ${item.dlNumber}`);
    // Update item status
    const newStatus = type === '20' ? 'reminded_20' : 'reminded_40';
    setItems(items.map(i => 
      i.id === item.id 
        ? { ...i, status: newStatus as any, lastAction: `Rappel ${type}j envoyé` }
        : i
    ));
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.dlNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.publisher.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Veille Éditoriale</h2>
          <p className="text-muted-foreground">
            Suivi des publications non déposées après attribution du numéro DL
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Paramètres de la Veille Éditoriale</DialogTitle>
              <DialogDescription>
                Configuration des notifications et rappels automatiques
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Rappel à 20 jours</Label>
                    <p className="text-sm text-muted-foreground">
                      Envoyer un rappel après 20 jours
                    </p>
                  </div>
                  <Switch
                    checked={settings.reminder20Enabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, reminder20Enabled: checked })
                    }
                  />
                </div>

                {settings.reminder20Enabled && (
                  <div className="space-y-2 pl-4">
                    <Label>Nombre de jours</Label>
                    <Input
                      type="number"
                      value={settings.reminder20Days}
                      onChange={(e) =>
                        setSettings({ ...settings, reminder20Days: parseInt(e.target.value) })
                      }
                    />
                    <Label>Modèle d'email</Label>
                    <Textarea
                      value={settings.emailTemplate20}
                      onChange={(e) =>
                        setSettings({ ...settings, emailTemplate20: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Rappel à 40 jours</Label>
                    <p className="text-sm text-muted-foreground">
                      Envoyer un rappel après 40 jours
                    </p>
                  </div>
                  <Switch
                    checked={settings.reminder40Enabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, reminder40Enabled: checked })
                    }
                  />
                </div>

                {settings.reminder40Enabled && (
                  <div className="space-y-2 pl-4">
                    <Label>Nombre de jours</Label>
                    <Input
                      type="number"
                      value={settings.reminder40Days}
                      onChange={(e) =>
                        setSettings({ ...settings, reminder40Days: parseInt(e.target.value) })
                      }
                    />
                    <Label>Modèle d'email</Label>
                    <Textarea
                      value={settings.emailTemplate40}
                      onChange={(e) =>
                        setSettings({ ...settings, emailTemplate40: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lettre de réclamation</Label>
                    <p className="text-sm text-muted-foreground">
                      Générer après 2 mois (60 jours)
                    </p>
                  </div>
                  <Switch
                    checked={settings.claimEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, claimEnabled: checked })
                    }
                  />
                </div>

                {settings.claimEnabled && (
                  <div className="space-y-2 pl-4">
                    <Label>Nombre de jours</Label>
                    <Input
                      type="number"
                      value={settings.claimDays}
                      onChange={(e) =>
                        setSettings({ ...settings, claimDays: parseInt(e.target.value) })
                      }
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label>Envoi automatique</Label>
                  <p className="text-sm text-muted-foreground">
                    Envoyer automatiquement les rappels et réclamations
                  </p>
                </div>
                <Switch
                  checked={settings.autoSend}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoSend: checked })
                  }
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="monitoring" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monitoring">Suivi</TabsTrigger>
          <TabsTrigger value="statistics">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publications en attente de dépôt</CardTitle>
              <CardDescription>
                Liste des publications ayant reçu un numéro DL mais dont les exemplaires n'ont pas été déposés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Rechercher par numéro DL, titre, auteur ou éditeur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="reminded_20">Rappel 20j</SelectItem>
                    <SelectItem value="reminded_40">Rappel 40j</SelectItem>
                    <SelectItem value="claim_sent">Réclamation</SelectItem>
                    <SelectItem value="received">Reçu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° DL</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead>Auteur</TableHead>
                      <TableHead>Éditeur</TableHead>
                      <TableHead>Attribution</TableHead>
                      <TableHead>Jours écoulés</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Dernière action</TableHead>
                      <TableHead>Prochaine action</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.dlNumber}</TableCell>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>{item.author}</TableCell>
                        <TableCell>{item.publisher}</TableCell>
                        <TableCell>{new Date(item.attributionDate).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>
                          <Badge variant={item.daysElapsed > 60 ? "destructive" : item.daysElapsed > 40 ? "default" : "secondary"}>
                            {item.daysElapsed}j
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.lastAction}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{item.nextAction}</div>
                            <div className="text-muted-foreground text-xs">{new Date(item.nextActionDate).toLocaleDateString('fr-FR')}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {item.daysElapsed >= 20 && item.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => sendReminder(item, '20')}
                              >
                                <Bell className="h-3 w-3 mr-1" />
                                Rappel 20j
                              </Button>
                            )}
                            {item.daysElapsed >= 40 && item.status === 'reminded_20' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => sendReminder(item, '40')}
                              >
                                <Bell className="h-3 w-3 mr-1" />
                                Rappel 40j
                              </Button>
                            )}
                            {item.daysElapsed >= 60 && ['reminded_40', 'claim_sent'].includes(item.status) && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => generateClaimLetter(item)}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                Réclamation
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total en attente</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {items.filter(i => i.status !== 'received').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rappels 20j</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {items.filter(i => i.status === 'reminded_20').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rappels 40j</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {items.filter(i => i.status === 'reminded_40').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Réclamations</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {items.filter(i => i.status === 'claim_sent').length}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
