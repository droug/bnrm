import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from "@/hooks/use-toast";

export const generateISBNMonthlyReport = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // En-tête
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Rapport Mensuel - Agence ISBN', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Période: Mars 2024', pageWidth / 2, 30, { align: 'center' });
  doc.text('Date de génération: ' + new Date().toLocaleDateString('fr-FR'), pageWidth / 2, 37, { align: 'center' });
  
  // Statistiques globales
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Statistiques Globales', 14, 50);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('• Total ISBN attribués: 1,234', 14, 60);
  doc.text('• Nouveaux éditeurs enregistrés: 45', 14, 67);
  doc.text('• ISBN préfixes attribués: 12', 14, 74);
  doc.text('• Délai moyen de traitement: 2.3 jours', 14, 81);
  
  // Répartition par type de publication
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Répartition par Type de Publication', 14, 95);
  
  autoTable(doc, {
    startY: 100,
    head: [['Type', 'Nombre', 'Pourcentage']],
    body: [
      ['Livres', '856', '69.4%'],
      ['Périodiques', '234', '19.0%'],
      ['E-books', '89', '7.2%'],
      ['Publications multimédias', '55', '4.4%'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] }
  });
  
  // Évolution mensuelle
  const finalY = (doc as any).lastAutoTable.finalY || 140;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Évolution Mensuelle', 14, finalY + 15);
  
  autoTable(doc, {
    startY: finalY + 20,
    head: [['Mois', 'ISBN attribués', 'Variation']],
    body: [
      ['Janvier 2024', '1,089', '+12%'],
      ['Février 2024', '1,156', '+6%'],
      ['Mars 2024', '1,234', '+7%'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] }
  });
  
  // Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.text(
      `BNRM - Bibliothèque Nationale du Royaume du Maroc | Page ${i}/${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  doc.save('Rapport_ISBN_Mars_2024.pdf');
  toast({
    title: "Rapport généré",
    description: "Le rapport mensuel ISBN a été téléchargé avec succès",
  });
};

export const generateISSNReport = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // En-tête
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Rapport - Centre International ISSN', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Période: Mars 2024', pageWidth / 2, 30, { align: 'center' });
  doc.text('Date de génération: ' + new Date().toLocaleDateString('fr-FR'), pageWidth / 2, 37, { align: 'center' });
  
  // Statistiques globales
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Statistiques Globales', 14, 50);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('• Total ISSN attribués: 87', 14, 60);
  doc.text('• Nouvelles publications périodiques: 23', 14, 67);
  doc.text('• ISSN en ligne: 34', 14, 74);
  doc.text('• ISSN imprimés: 53', 14, 81);
  
  // Répartition par domaine
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Répartition par Domaine', 14, 95);
  
  autoTable(doc, {
    startY: 100,
    head: [['Domaine', 'Nombre', 'Pourcentage']],
    body: [
      ['Sciences et Technologies', '28', '32.2%'],
      ['Sciences Humaines', '22', '25.3%'],
      ['Économie et Gestion', '18', '20.7%'],
      ['Arts et Culture', '12', '13.8%'],
      ['Autres', '7', '8.0%'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [52, 152, 219] }
  });
  
  // Liste des nouvelles publications
  const finalY = (doc as any).lastAutoTable.finalY || 160;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Nouvelles Publications Enregistrées', 14, finalY + 15);
  
  autoTable(doc, {
    startY: finalY + 20,
    head: [['Titre', 'ISSN', 'Type', 'Éditeur']],
    body: [
      ['Revue Marocaine de Recherche', '2024-5678', 'Imprimé', 'Éditions Savoir'],
      ['Journal d\'Innovation Tech', '2024-5679', 'En ligne', 'Tech Media'],
      ['Bulletin Économique', '2024-5680', 'Imprimé', 'CERM'],
      ['Cahiers d\'Histoire', '2024-5681', 'Imprimé', 'Publications Hist'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [52, 152, 219] }
  });
  
  // Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.text(
      `BNRM - Bibliothèque Nationale du Royaume du Maroc | Page ${i}/${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  doc.save('Rapport_ISSN_Mars_2024.pdf');
  toast({
    title: "Rapport généré",
    description: "Le rapport ISSN a été téléchargé avec succès",
  });
};

export const generateDepositTypeStats = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // En-tête
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Statistiques de Dépôt par Type', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Période: Janvier - Mars 2024', pageWidth / 2, 30, { align: 'center' });
  doc.text('Date de génération: ' + new Date().toLocaleDateString('fr-FR'), pageWidth / 2, 37, { align: 'center' });
  
  // Vue d'ensemble
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Vue d\'Ensemble', 14, 50);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('• Total dépôts reçus: 2,847', 14, 60);
  doc.text('• Dépôts physiques: 1,823 (64%)', 14, 67);
  doc.text('• Dépôts numériques: 1,024 (36%)', 14, 74);
  doc.text('• Taux de conformité: 94.2%', 14, 81);
  
  // Détail par type de support
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Répartition Détaillée par Type de Support', 14, 95);
  
  autoTable(doc, {
    startY: 100,
    head: [['Type de Support', 'Nombre', '%', 'Conformes']],
    body: [
      ['Livres imprimés', '1,456', '51.2%', '1,398'],
      ['E-books (PDF/EPUB)', '567', '19.9%', '543'],
      ['Périodiques', '389', '13.7%', '367'],
      ['Thèses', '234', '8.2%', '228'],
      ['Publications audio', '123', '4.3%', '115'],
      ['Multimédias', '78', '2.7%', '72'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [155, 89, 182] }
  });
  
  // Évolution trimestrielle
  const finalY = (doc as any).lastAutoTable.finalY || 180;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Évolution Trimestrielle', 14, finalY + 15);
  
  autoTable(doc, {
    startY: finalY + 20,
    head: [['Mois', 'Physiques', 'Numériques', 'Total']],
    body: [
      ['Janvier 2024', '623', '312', '935'],
      ['Février 2024', '589', '345', '934'],
      ['Mars 2024', '611', '367', '978'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [155, 89, 182] }
  });
  
  // Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.text(
      `BNRM - Bibliothèque Nationale du Royaume du Maroc | Page ${i}/${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  doc.save('Statistiques_Depot_Type_T1_2024.pdf');
  toast({
    title: "Rapport généré",
    description: "Les statistiques par type ont été téléchargées avec succès",
  });
};

export const generatePublishersActivityReport = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // En-tête
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Rapport d\'Activité des Éditeurs', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Période: Mars 2024', pageWidth / 2, 30, { align: 'center' });
  doc.text('Date de génération: ' + new Date().toLocaleDateString('fr-FR'), pageWidth / 2, 37, { align: 'center' });
  
  // Synthèse
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Synthèse de l\'Activité', 14, 50);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('• Éditeurs actifs: 324', 14, 60);
  doc.text('• Nouveaux éditeurs: 45', 14, 67);
  doc.text('• Publications totales: 2,847', 14, 74);
  doc.text('• Moyenne publications/éditeur: 8.8', 14, 81);
  
  // Top 10 éditeurs
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Top 10 Éditeurs par Volume', 14, 95);
  
  autoTable(doc, {
    startY: 100,
    head: [['Rang', 'Éditeur', 'Publications', 'ISBN/ISSN']],
    body: [
      ['1', 'Éditions Savoir', '156', '142'],
      ['2', 'Dar Al Kitab', '134', '128'],
      ['3', 'Maison du Livre', '98', '94'],
      ['4', 'Nouvelles Éditions', '87', '83'],
      ['5', 'Presses Universitaires', '76', '72'],
      ['6', 'Éditions Culturelles', '65', '62'],
      ['7', 'Publications Modernes', '54', '51'],
      ['8', 'Éditions Al Amal', '48', '46'],
      ['9', 'Dar Nachr', '43', '41'],
      ['10', 'Éditions du Progrès', '39', '37'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [231, 76, 60] }
  });
  
  // Nouveaux éditeurs enregistrés
  const finalY = (doc as any).lastAutoTable.finalY || 200;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Nouveaux Éditeurs Enregistrés', 14, finalY + 15);
  
  autoTable(doc, {
    startY: finalY + 20,
    head: [['Éditeur', 'Date', 'Ville', '1ère Publication']],
    body: [
      ['Éditions Horizon', '05/03/2024', 'Casablanca', 'Guide Touristique'],
      ['Dar Al Fikr', '12/03/2024', 'Rabat', 'Essai Philosophique'],
      ['Nouvelles Impressions', '18/03/2024', 'Marrakech', 'Roman'],
      ['Maison Culturelle', '22/03/2024', 'Fès', 'Recueil de Poésie'],
      ['Éditions Al Hadith', '28/03/2024', 'Tanger', 'Étude Historique'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [231, 76, 60] }
  });
  
  // Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.text(
      `BNRM - Bibliothèque Nationale du Royaume du Maroc | Page ${i}/${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  doc.save('Rapport_Activite_Editeurs_Mars_2024.pdf');
  toast({
    title: "Rapport généré",
    description: "Le rapport d'activité des éditeurs a été téléchargé avec succès",
  });
};
