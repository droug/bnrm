import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from "@/hooks/use-toast";
import { addBNRMHeader, addBNRMFooter } from '@/lib/pdfHeaderUtils';

// Fonction helper pour dessiner un graphique en barres
const drawBarChart = (doc: jsPDF, x: number, y: number, width: number, height: number, data: {label: string, value: number, color: number[]}[]) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = width / data.length - 10;
  const chartHeight = height - 30;
  
  // Dessiner les axes
  doc.setDrawColor(100);
  doc.line(x, y + chartHeight, x + width, y + chartHeight); // Axe X
  doc.line(x, y, x, y + chartHeight); // Axe Y
  
  // Dessiner les barres
  data.forEach((item, index) => {
    const barHeight = (item.value / maxValue) * chartHeight;
    const barX = x + (index * (barWidth + 10)) + 5;
    const barY = y + chartHeight - barHeight;
    
    // Barre colorée
    doc.setFillColor(item.color[0], item.color[1], item.color[2]);
    doc.rect(barX, barY, barWidth, barHeight, 'F');
    
    // Bordure de la barre
    doc.setDrawColor(0);
    doc.rect(barX, barY, barWidth, barHeight);
    
    // Valeur au-dessus de la barre
    doc.setFontSize(8);
    doc.setTextColor(0);
    doc.text(item.value.toString(), barX + barWidth / 2, barY - 2, { align: 'center' });
    
    // Label sous la barre
    doc.setFontSize(7);
    const labelLines = doc.splitTextToSize(item.label, barWidth);
    doc.text(labelLines, barX + barWidth / 2, y + chartHeight + 5, { align: 'center' });
  });
};

// Fonction helper pour dessiner un graphique circulaire (camembert)
const drawPieChart = (doc: jsPDF, centerX: number, centerY: number, radius: number, data: {label: string, value: number, color: number[]}[]) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -Math.PI / 2; // Commencer en haut
  
  data.forEach((item) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    
    // Dessiner la part
    doc.setFillColor(item.color[0], item.color[1], item.color[2]);
    doc.setDrawColor(255);
    
    // Créer le chemin de la part
    const startX = centerX + radius * Math.cos(currentAngle);
    const startY = centerY + radius * Math.sin(currentAngle);
    
    // Approximation avec des lignes pour créer l'arc
    const segments = 20;
    doc.moveTo(centerX, centerY);
    for (let i = 0; i <= segments; i++) {
      const angle = currentAngle + (sliceAngle * i / segments);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      if (i === 0) {
        doc.lines([[x - centerX, y - centerY]], centerX, centerY);
      } else {
        doc.line(centerX + radius * Math.cos(currentAngle + (sliceAngle * (i-1) / segments)), 
                 centerY + radius * Math.sin(currentAngle + (sliceAngle * (i-1) / segments)),
                 x, y);
      }
    }
    
    // Tracer une version simplifiée avec des triangles
    const middleAngle = currentAngle + sliceAngle / 2;
    const x1 = centerX;
    const y1 = centerY;
    const x2 = centerX + radius * Math.cos(currentAngle);
    const y2 = centerY + radius * Math.sin(currentAngle);
    const x3 = centerX + radius * Math.cos(currentAngle + sliceAngle);
    const y3 = centerY + radius * Math.sin(currentAngle + sliceAngle);
    
    doc.triangle(x1, y1, x2, y2, x3, y3, 'FD');
    
    // Ajouter le pourcentage
    const percentage = ((item.value / total) * 100).toFixed(1);
    const labelX = centerX + (radius * 0.6) * Math.cos(middleAngle);
    const labelY = centerY + (radius * 0.6) * Math.sin(middleAngle);
    doc.setFontSize(8);
    doc.setTextColor(255);
    doc.text(percentage + '%', labelX, labelY, { align: 'center' });
    
    currentAngle += sliceAngle;
  });
};

// Fonction helper pour dessiner une légende
const drawLegend = (doc: jsPDF, x: number, y: number, data: {label: string, color: number[]}[]) => {
  doc.setFontSize(9);
  data.forEach((item, index) => {
    const legendY = y + (index * 8);
    
    // Carré de couleur
    doc.setFillColor(item.color[0], item.color[1], item.color[2]);
    doc.rect(x, legendY - 3, 5, 5, 'F');
    
    // Label
    doc.setTextColor(0);
    doc.text(item.label, x + 8, legendY);
  });
};

export const generateISBNMonthlyReport = async () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Ajouter l'en-tête officiel BNRM
  let yPos = await addBNRMHeader(doc);
  yPos += 10;
  
  // Titre du rapport
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Rapport Mensuel - Agence ISBN', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Période: Mars 2024', pageWidth / 2, yPos, { align: 'center' });
  yPos += 7;
  doc.text('Date de génération: ' + new Date().toLocaleDateString('fr-FR'), pageWidth / 2, yPos, { align: 'center' });
  yPos += 13;
  
  // Statistiques globales
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Statistiques Globales', 14, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('• Total ISBN attribués: 1,234', 14, yPos);
  yPos += 7;
  doc.text('• Nouveaux éditeurs enregistrés: 45', 14, yPos);
  yPos += 7;
  doc.text('• ISBN préfixes attribués: 12', 14, yPos);
  yPos += 7;
  doc.text('• Délai moyen de traitement: 2.3 jours', 14, yPos);
  yPos += 14;
  
  // Répartition par type de publication
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Répartition par Type de Publication', 14, yPos);
  yPos += 5;
  
  autoTable(doc, {
    startY: yPos,
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
  
  const tableEndY = (doc as any).lastAutoTable.finalY || yPos + 50;
  yPos = tableEndY + 15;
  
  // Graphique en barres de la répartition
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Visualisation Graphique', 14, yPos);
  yPos += 10;
  
  const barChartData = [
    { label: 'Livres', value: 856, color: [41, 128, 185] },
    { label: 'Périodiques', value: 234, color: [52, 152, 219] },
    { label: 'E-books', value: 89, color: [93, 173, 226] },
    { label: 'Multimédias', value: 55, color: [133, 193, 233] }
  ];
  
  drawBarChart(doc, 20, yPos, 170, 60, barChartData);
  yPos += 75;
  
  // Nouvelle page pour l'évolution mensuelle
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }
  
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
  
  // Pied de page avec numéros de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addBNRMFooter(doc, i);
  }
  
  doc.save('Rapport_ISBN_Mars_2024.pdf');
  toast({
    title: "Rapport généré",
    description: "Le rapport mensuel ISBN a été téléchargé avec succès",
  });
};

export const generateISSNReport = async () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Ajouter l'en-tête officiel BNRM
  let yPos = await addBNRMHeader(doc);
  yPos += 10;
  
  // Titre du rapport
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Rapport - Centre International ISSN', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Période: Mars 2024', pageWidth / 2, yPos, { align: 'center' });
  yPos += 7;
  doc.text('Date de génération: ' + new Date().toLocaleDateString('fr-FR'), pageWidth / 2, yPos, { align: 'center' });
  yPos += 13;
  
  // Statistiques globales
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Statistiques Globales', 14, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('• Total ISSN attribués: 87', 14, yPos);
  yPos += 7;
  doc.text('• Nouvelles publications périodiques: 23', 14, yPos);
  yPos += 7;
  doc.text('• ISSN en ligne: 34', 14, yPos);
  yPos += 7;
  doc.text('• ISSN imprimés: 53', 14, yPos);
  yPos += 14;
  
  // Répartition par domaine
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Répartition par Domaine', 14, yPos);
  yPos += 5;
  
  autoTable(doc, {
    startY: yPos,
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
  
  const tableEndY = (doc as any).lastAutoTable.finalY || yPos + 60;
  yPos = tableEndY + 15;
  
  // Graphique circulaire de la répartition par domaine
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Répartition Visuelle par Domaine', 14, yPos);
  yPos += 10;
  
  const pieChartData = [
    { label: 'Sciences et Tech', value: 28, color: [52, 152, 219] },
    { label: 'Sciences Humaines', value: 22, color: [46, 204, 113] },
    { label: 'Économie', value: 18, color: [241, 196, 15] },
    { label: 'Arts et Culture', value: 12, color: [155, 89, 182] },
    { label: 'Autres', value: 7, color: [149, 165, 166] }
  ];
  
  drawPieChart(doc, 70, yPos + 30, 30, pieChartData);
  drawLegend(doc, 120, yPos + 10, pieChartData.map(d => ({ label: d.label, color: d.color })));
  yPos += 75;
  
  // Nouvelle page si nécessaire
  if (yPos > 210) {
    doc.addPage();
    yPos = 20;
  }
  
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
  
  // Pied de page avec numéros de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addBNRMFooter(doc, i);
  }
  
  doc.save('Rapport_ISSN_Mars_2024.pdf');
  toast({
    title: "Rapport généré",
    description: "Le rapport ISSN a été téléchargé avec succès",
  });
};

export const generateDepositTypeStats = async () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Ajouter l'en-tête officiel BNRM
  let yPos = await addBNRMHeader(doc);
  yPos += 10;
  
  // Titre du rapport
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Statistiques de Dépôt par Type', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Période: Janvier - Mars 2024', pageWidth / 2, yPos, { align: 'center' });
  yPos += 7;
  doc.text('Date de génération: ' + new Date().toLocaleDateString('fr-FR'), pageWidth / 2, yPos, { align: 'center' });
  yPos += 13;
  
  // Vue d'ensemble
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Vue d\'Ensemble', 14, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('• Total dépôts reçus: 2,847', 14, yPos);
  yPos += 7;
  doc.text('• Dépôts physiques: 1,823 (64%)', 14, yPos);
  yPos += 7;
  doc.text('• Dépôts numériques: 1,024 (36%)', 14, yPos);
  yPos += 7;
  doc.text('• Taux de conformité: 94.2%', 14, yPos);
  yPos += 14;
  
  // Détail par type de support
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Répartition Détaillée par Type de Support', 14, yPos);
  yPos += 5;
  
  autoTable(doc, {
    startY: yPos,
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
  
  const tableEndY = (doc as any).lastAutoTable.finalY || yPos + 70;
  yPos = tableEndY + 15;
  
  // Graphique en barres comparatif
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Comparaison Visuelle par Type', 14, yPos);
  yPos += 10;
  
  const depositBarData = [
    { label: 'Livres', value: 1456, color: [155, 89, 182] },
    { label: 'E-books', value: 567, color: [142, 68, 173] },
    { label: 'Périodiques', value: 389, color: [125, 60, 152] },
    { label: 'Thèses', value: 234, color: [108, 52, 131] },
    { label: 'Audio', value: 123, color: [91, 44, 111] },
    { label: 'Multi', value: 78, color: [74, 35, 90] }
  ];
  
  drawBarChart(doc, 15, yPos, 180, 55, depositBarData);
  yPos += 70;
  
  // Nouvelle page pour l'évolution
  if (yPos > 210) {
    doc.addPage();
    yPos = 20;
  }
  
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
  
  // Pied de page avec numéros de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addBNRMFooter(doc, i);
  }
  
  doc.save('Statistiques_Depot_Type_T1_2024.pdf');
  toast({
    title: "Rapport généré",
    description: "Les statistiques par type ont été téléchargées avec succès",
  });
};

export const generatePublishersActivityReport = async () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Ajouter l'en-tête officiel BNRM
  let yPos = await addBNRMHeader(doc);
  yPos += 10;
  
  // Titre du rapport
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Rapport d\'Activité des Éditeurs', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Période: Mars 2024', pageWidth / 2, yPos, { align: 'center' });
  yPos += 7;
  doc.text('Date de génération: ' + new Date().toLocaleDateString('fr-FR'), pageWidth / 2, yPos, { align: 'center' });
  yPos += 13;
  
  // Synthèse
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Synthèse de l\'Activité', 14, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('• Éditeurs actifs: 324', 14, yPos);
  yPos += 7;
  doc.text('• Nouveaux éditeurs: 45', 14, yPos);
  yPos += 7;
  doc.text('• Publications totales: 2,847', 14, yPos);
  yPos += 7;
  doc.text('• Moyenne publications/éditeur: 8.8', 14, yPos);
  yPos += 14;
  
  // Top 10 éditeurs
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Top 10 Éditeurs par Volume', 14, yPos);
  yPos += 5;
  
  autoTable(doc, {
    startY: yPos,
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
  
  // Pied de page avec numéros de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addBNRMFooter(doc, i);
  }
  
  doc.save('Rapport_Activite_Editeurs_Mars_2024.pdf');
  toast({
    title: "Rapport généré",
    description: "Le rapport d'activité des éditeurs a été téléchargé avec succès",
  });
};
