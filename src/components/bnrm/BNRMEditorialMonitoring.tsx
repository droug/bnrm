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
import logoOfficiel from "@/assets/logo-bnrm-officiel.png";

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
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // En-tête avec logo officiel centré
    const logoWidth = 180;
    const logoHeight = 25;
    const logoX = (pageWidth - logoWidth) / 2;
    doc.addImage(logoOfficiel, 'PNG', logoX, 10, logoWidth, logoHeight);

    // Ligne de séparation décorative
    doc.setDrawColor(139, 0, 0); // Couleur bordeaux
    doc.setLineWidth(0.5);
    doc.line(15, 40, pageWidth - 15, 40);

    // Informations de l'expéditeur (à gauche)
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text("Royaume du Maroc", 15, 50);
    doc.text("Ministère de la Jeunesse, de la Culture", 15, 55);
    doc.text("et de la Communication", 15, 60);
    doc.text("Département de la Culture", 15, 65);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text("Bibliothèque Nationale du Royaume du Maroc", 15, 72);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text("Avenue Ibn Battouta, BP 1003", 15, 77);
    doc.text("Rabat - Agdal, Maroc", 15, 82);
    doc.text("Tél: +212 (0)5 37 77 18 74", 15, 87);

    // Date et référence (à droite)
    const today = new Date().toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Rabat, le ${today}`, pageWidth - 15, 50, { align: 'right' });
    doc.setFont(undefined, 'bold');
    doc.setTextColor(139, 0, 0);
    doc.text(`Réf: BNRM/ABN/DL/${item.dlNumber}`, pageWidth - 15, 58, { align: 'right' });

    // Cadre pour le destinataire
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(15, 95, 90, 25, 2, 2, 'FD');
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text("À l'attention de", 20, 102);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(item.publisher, 20, 108);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(`Concernant: "${item.title}"`, 20, 114);

    // Objet de la lettre - encadré
    doc.setDrawColor(139, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(15, 130, pageWidth - 15, 130);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(139, 0, 0);
    doc.text("OBJET : RÉCLAMATION - DÉPÔT LÉGAL", pageWidth / 2, 138, { align: 'center' });
    doc.line(15, 143, pageWidth - 15, 143);

    // Corps de la lettre avec formatage amélioré
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(40, 40, 40);
    
    let yPos = 155;
    const lineHeight = 6;
    const marginLeft = 15;
    const marginRight = 15;
    const maxWidth = pageWidth - marginLeft - marginRight;

    // Salutation
    doc.text("Madame, Monsieur,", marginLeft, yPos);
    yPos += lineHeight * 1.5;

    // Paragraphe 1 - Contexte
    const para1 = `Nous accusons réception de votre déclaration de dépôt légal portant le numéro ${item.dlNumber}, concernant l'ouvrage intitulé "${item.title}" de ${item.author}, pour lequel un numéro de dépôt légal vous a été attribué en date du ${new Date(item.attributionDate).toLocaleDateString('fr-FR')}.`;
    const para1Lines = doc.splitTextToSize(para1, maxWidth);
    doc.text(para1Lines, marginLeft, yPos);
    yPos += para1Lines.length * lineHeight + 4;

    // Paragraphe 2 - Constat
    doc.setFont(undefined, 'bold');
    const para2 = "Conformément aux dispositions de la loi n° 67-99 relative au dépôt légal et de ses textes d'application, nous constatons avec regret que les exemplaires réglementaires n'ont pas été déposés à la Bibliothèque Nationale dans les délais légalement impartis.";
    const para2Lines = doc.splitTextToSize(para2, maxWidth);
    doc.text(para2Lines, marginLeft, yPos);
    doc.setFont(undefined, 'normal');
    yPos += para2Lines.length * lineHeight + 4;

    // Paragraphe 3 - Rappels précédents
    const para3 = `Malgré nos rappels successifs en date des ${new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')} et ${new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}, aucun exemplaire n'a été reçu à ce jour par nos services.`;
    const para3Lines = doc.splitTextToSize(para3, maxWidth);
    doc.text(para3Lines, marginLeft, yPos);
    yPos += para3Lines.length * lineHeight + 4;

    // Encadré avec demande - fond coloré
    doc.setFillColor(255, 248, 240);
    doc.setDrawColor(255, 140, 0);
    doc.setLineWidth(0.5);
    doc.roundedRect(marginLeft, yPos - 2, maxWidth, 20, 2, 2, 'FD');
    
    doc.setFont(undefined, 'bold');
    doc.setTextColor(139, 0, 0);
    const para4 = "Par conséquent, nous vous prions instamment de bien vouloir régulariser votre situation en déposant les exemplaires requis dans un délai maximum de QUINZE (15) jours à compter de la réception de la présente lettre.";
    const para4Lines = doc.splitTextToSize(para4, maxWidth - 4);
    doc.text(para4Lines, marginLeft + 2, yPos + 4);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(40, 40, 40);
    yPos += 24;

    // Paragraphe 5 - Conséquences
    doc.setFont(undefined, 'italic');
    const para5 = "À défaut de régularisation dans les délais impartis, nous nous verrons dans l'obligation de transmettre votre dossier au Service des Affaires Juridiques pour les suites légales appropriées, conformément aux sanctions prévues par la loi.";
    const para5Lines = doc.splitTextToSize(para5, maxWidth);
    doc.text(para5Lines, marginLeft, yPos);
    doc.setFont(undefined, 'normal');
    yPos += para5Lines.length * lineHeight + 6;

    // Formule de politesse
    const closing = "Nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.";
    const closingLines = doc.splitTextToSize(closing, maxWidth);
    doc.text(closingLines, marginLeft, yPos);
    yPos += closingLines.length * lineHeight + 10;

    // Signature
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 51, 102);
    doc.text("Le Chef du Département", pageWidth - 15, yPos, { align: 'right' });
    doc.text("Agence Bibliographique Nationale", pageWidth - 15, yPos + 6, { align: 'right' });
    
    // Cachet (simulé)
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.5);
    doc.circle(pageWidth - 35, yPos + 18, 12, 'S');
    doc.setFontSize(7);
    doc.text("BNRM", pageWidth - 35, yPos + 17, { align: 'center' });
    doc.text("ABN", pageWidth - 35, yPos + 20, { align: 'center' });

    // Ligne de séparation footer
    doc.setDrawColor(139, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(15, pageHeight - 25, pageWidth - 15, pageHeight - 25);

    // Footer avec informations de contact
    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text("Bibliothèque Nationale du Royaume du Maroc - Avenue Ibn Battouta, BP 1003, Rabat-Agdal", pageWidth / 2, pageHeight - 20, { align: 'center' });
    doc.text("Tél: +212 (0)5 37 77 18 74 | Fax: +212 (0)5 37 77 19 79 | Email: contact@bnrm.ma | www.bnrm.ma", pageWidth / 2, pageHeight - 15, { align: 'center' });
    doc.setFont(undefined, 'italic');
    doc.setFontSize(6);
    doc.text("Document généré automatiquement par le système de gestion du dépôt légal - Ne nécessite pas de signature manuscrite", pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`Reclamation_DL_${item.dlNumber}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("Lettre de réclamation générée avec succès");
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
