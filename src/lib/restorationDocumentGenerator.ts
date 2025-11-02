import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addBNRMHeader, addBNRMFooter } from './pdfHeaderUtils';

interface RestorationRequest {
  id: string;
  request_number: string;
  manuscript_title: string;
  manuscript_cote: string;
  damage_description: string;
  urgency_level: string;
  user_notes?: string;
  submitted_at: string;
  estimated_cost?: number;
  estimated_duration_days?: number;
  director_notes?: string;
  director_approval_at?: string;
  diagnosis_report?: string;
  quote_amount?: number;
  quote_details?: string;
  restoration_report?: string;
  completion_notes?: string;
}

// Fonction utilitaire pour ajouter du texte avec gestion automatique des retours à la ligne et support de l'arabe
const addWrappedText = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number = 7,
  align: 'left' | 'right' | 'center' = 'left'
): number => {
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line: string, index: number) => {
    doc.text(line, x, y + (index * lineHeight), { align });
  });
  return y + (lines.length * lineHeight);
};

export const generateAuthorizationLetter = async (request: RestorationRequest): Promise<Blob> => {
  const doc = new jsPDF();
  
  // Ajouter l'en-tête BNRM
  const startY = await addBNRMHeader(doc);
  let currentY = startY + 10;
  
  // Titre
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('LETTRE D\'AUTORISATION DE RESTAURATION', 105, currentY, { align: 'center' });
  currentY += 15;
  
  // Informations de la demande
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.text(`N° de demande: ${request.request_number}`, 20, currentY);
  currentY += 7;
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, currentY);
  currentY += 10;
  
  // Objet
  doc.setFont('helvetica', 'bold');
  doc.text('Objet: Autorisation de restauration', 20, currentY);
  currentY += 10;
  
  // Corps de la lettre
  doc.setFont('helvetica', 'normal');
  const bodyText = `La Bibliothèque Nationale du Royaume du Maroc autorise par la présente la restauration du manuscrit suivant:`;
  currentY = addWrappedText(doc, bodyText, 20, currentY, 170, 7, 'left');
  currentY += 5;
  
  // Détails du manuscrit
  autoTable(doc, {
    startY: currentY,
    head: [['Champ', 'Information']],
    body: [
      ['Titre', request.manuscript_title],
      ['Cote', request.manuscript_cote],
      ['Description des dommages', request.damage_description],
      ['Niveau d\'urgence', request.urgency_level],
      ['Durée estimée', request.estimated_duration_days ? `${request.estimated_duration_days} jours` : 'À déterminer'],
      ['Coût estimé', request.estimated_cost ? `${request.estimated_cost.toLocaleString('fr-FR')} DH` : 'À déterminer'],
    ],
    theme: 'grid',
    styles: { 
      font: 'helvetica', 
      fontSize: 9,
      halign: 'right',
      cellPadding: 3
    },
    headStyles: { fillColor: [41, 128, 185] },
    margin: { left: 20, right: 20 },
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 15;
  
  // Notes du directeur
  if (request.director_notes) {
    doc.setFont('helvetica', 'bold');
    doc.text('Notes de la direction:', 20, currentY);
    currentY += 7;
    doc.setFont('helvetica', 'normal');
    currentY = addWrappedText(doc, request.director_notes, 20, currentY, 170, 7, 'left');
    currentY += 10;
  }
  
  // Signature
  doc.setFont('helvetica', 'bold');
  doc.text('Le Directeur', 130, currentY);
  currentY += 5;
  doc.text('Bibliothèque Nationale du Royaume du Maroc', 130, currentY);
  
  // Pied de page
  addBNRMFooter(doc, 1);
  
  return doc.output('blob');
};

export const generateReceptionDocument = async (request: RestorationRequest): Promise<Blob> => {
  const doc = new jsPDF();
  
  const startY = await addBNRMHeader(doc);
  let currentY = startY + 10;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PROCÈS-VERBAL DE RÉCEPTION D\'ŒUVRE', 105, currentY, { align: 'center' });
  currentY += 15;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const text = `Je soussigné(e), représentant de la Bibliothèque Nationale du Royaume du Maroc, certifie avoir reçu ce jour le manuscrit suivant pour restauration:`;
  currentY = addWrappedText(doc, text, 20, currentY, 170);
  currentY += 10;
  
  autoTable(doc, {
    startY: currentY,
    head: [['Champ', 'Information']],
    body: [
      ['N° de demande', request.request_number],
      ['Titre du manuscrit', request.manuscript_title],
      ['Cote', request.manuscript_cote],
      ['Date de réception', new Date().toLocaleDateString('fr-FR')],
      ['État lors de la réception', request.damage_description],
    ],
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] },
    margin: { left: 20, right: 20 },
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.text('Signature du responsable:', 20, currentY);
  currentY += 20;
  doc.text('Date: ' + new Date().toLocaleDateString('fr-FR'), 20, currentY);
  
  addBNRMFooter(doc, 1);
  
  return doc.output('blob');
};

export const generateDiagnosisReport = async (request: RestorationRequest): Promise<Blob> => {
  const doc = new jsPDF();
  
  const startY = await addBNRMHeader(doc);
  let currentY = startY + 10;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RAPPORT DE DIAGNOSTIC', 105, currentY, { align: 'center' });
  currentY += 15;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  autoTable(doc, {
    startY: currentY,
    head: [['Informations générales']],
    body: [
      ['N° de demande: ' + request.request_number],
      ['Manuscrit: ' + request.manuscript_title],
      ['Cote: ' + request.manuscript_cote],
      ['Date du diagnostic: ' + new Date().toLocaleDateString('fr-FR')],
    ],
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 9 },
    margin: { left: 20, right: 20 },
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFont('helvetica', 'bold');
  doc.text('ÉVALUATION DES DOMMAGES', 20, currentY);
  currentY += 7;
  
  doc.setFont('helvetica', 'normal');
  currentY = addWrappedText(doc, request.diagnosis_report || request.damage_description, 20, currentY, 170, 7, 'right');
  currentY += 10;
  
  doc.setFont('helvetica', 'bold');
  doc.text('RECOMMANDATIONS', 20, currentY);
  currentY += 7;
  
  doc.setFont('helvetica', 'normal');
  const recommendations = `Niveau d'urgence: ${request.urgency_level}\nDurée estimée: ${request.estimated_duration_days || 'À déterminer'} jours\nCoût estimé: ${request.estimated_cost ? request.estimated_cost.toLocaleString('fr-FR') + ' DH' : 'À déterminer'}`;
  currentY = addWrappedText(doc, recommendations, 20, currentY, 170, 7, 'left');
  
  addBNRMFooter(doc, 1);
  
  return doc.output('blob');
};

export const generateQuoteDocument = async (request: RestorationRequest): Promise<Blob> => {
  const doc = new jsPDF();
  
  const startY = await addBNRMHeader(doc);
  let currentY = startY + 10;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('DEVIS DE RESTAURATION', 105, currentY, { align: 'center' });
  currentY += 15;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.text(`N° de demande: ${request.request_number}`, 20, currentY);
  currentY += 7;
  doc.text(`Date d'émission: ${new Date().toLocaleDateString('fr-FR')}`, 20, currentY);
  currentY += 7;
  doc.text(`Validité: 30 jours`, 20, currentY);
  currentY += 15;
  
  autoTable(doc, {
    startY: currentY,
    head: [['Description', 'Montant']],
    body: [
      ['Restauration du manuscrit: ' + request.manuscript_title, `${request.quote_amount?.toLocaleString('fr-FR')} DH`],
    ],
    foot: [['TOTAL', `${request.quote_amount?.toLocaleString('fr-FR')} DH`]],
    theme: 'striped',
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] },
    footStyles: { fillColor: [41, 128, 185], fontStyle: 'bold' },
    margin: { left: 20, right: 20 },
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 10;
  
  if (request.quote_details) {
    doc.setFont('helvetica', 'bold');
    doc.text('Détails:', 20, currentY);
    currentY += 7;
    doc.setFont('helvetica', 'normal');
    currentY = addWrappedText(doc, request.quote_details, 20, currentY, 170, 7, 'right');
  }
  
  addBNRMFooter(doc, 1);
  
  return doc.output('blob');
};

export const generateCompletionCertificate = async (request: RestorationRequest): Promise<Blob> => {
  const doc = new jsPDF();
  
  const startY = await addBNRMHeader(doc);
  let currentY = startY + 10;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICAT D\'ACHÈVEMENT DE RESTAURATION', 105, currentY, { align: 'center' });
  currentY += 15;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const text = `La Bibliothèque Nationale du Royaume du Maroc certifie que les travaux de restauration du manuscrit suivant ont été menés à bien:`;
  currentY = addWrappedText(doc, text, 20, currentY, 170);
  currentY += 10;
  
  autoTable(doc, {
    startY: currentY,
    head: [['Information', 'Détail']],
    body: [
      ['N° de demande', request.request_number],
      ['Titre', request.manuscript_title],
      ['Cote', request.manuscript_cote],
      ['Date de début', new Date(request.submitted_at).toLocaleDateString('fr-FR')],
      ['Date d\'achèvement', new Date().toLocaleDateString('fr-FR')],
      ['Montant total', request.quote_amount ? `${request.quote_amount.toLocaleString('fr-FR')} DH` : 'N/A'],
    ],
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] },
    margin: { left: 20, right: 20 },
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 15;
  
  if (request.restoration_report) {
    doc.setFont('helvetica', 'bold');
    doc.text('Rapport final:', 20, currentY);
    currentY += 7;
    doc.setFont('helvetica', 'normal');
    currentY = addWrappedText(doc, request.restoration_report, 20, currentY, 170, 7, 'right');
    currentY += 10;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.text('Fait à Rabat, le ' + new Date().toLocaleDateString('fr-FR'), 20, currentY);
  currentY += 15;
  doc.text('Le Directeur de la BNRM', 130, currentY);
  
  addBNRMFooter(doc, 1);
  
  return doc.output('blob');
};

export const downloadDocument = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
