import jsPDF from 'jspdf';

interface RequestData {
  request_number: string;
  manuscript_title: string;
  manuscript_cote: string;
  damage_description: string;
  urgency_level: string;
  estimated_cost?: number;
  estimated_duration?: number;
  director_approval_notes?: string;
  diagnosis_report?: string;
  quote_amount?: number;
  quote_details?: string;
  restoration_report?: string;
  submitted_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

const addHeader = (doc: jsPDF, title: string) => {
  // En-tête officiel BNRM
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text('ROYAUME DU MAROC', doc.internal.pageSize.width / 2, 10, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Ministere de la Jeunesse, de la Culture et de la Communication', doc.internal.pageSize.width / 2, 16, { align: 'center' });
  
  doc.setFont('helvetica', 'bold');
  doc.text('BIBLIOTHEQUE NATIONALE DU ROYAUME DU MAROC', doc.internal.pageSize.width / 2, 22, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Avenue Ibn Batouta, B.P. 1003, Rabat - Maroc', doc.internal.pageSize.width / 2, 27, { align: 'center' });
  doc.text('Tel: +212 (0)5 37 27 15 23 / Fax: +212 (0)5 37 27 46 88', doc.internal.pageSize.width / 2, 32, { align: 'center' });
  
  // Ligne de séparation
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.8);
  doc.line(20, 37, doc.internal.pageSize.width - 20, 37);
  
  // Titre du document
  doc.setFontSize(16);
  doc.setTextColor(41, 128, 185);
  doc.setFont('helvetica', 'bold');
  doc.text(title, doc.internal.pageSize.width / 2, 47, { align: 'center' });
  
  // Ligne sous le titre
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.5);
  doc.line(40, 50, doc.internal.pageSize.width - 40, 50);
};

const addFooter = (doc: jsPDF) => {
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Document genere le ${new Date().toLocaleDateString('fr-FR')}`, doc.internal.pageSize.width / 2, pageHeight - 10, { align: 'center' });
};

export const generateAuthorizationLetter = (request: RequestData): void => {
  const doc = new jsPDF();
  addHeader(doc, "LETTRE D'AUTORISATION DE RESTAURATION");
  
  let y = 40;
  doc.setFontSize(11);
  doc.setTextColor(0);
  
  doc.text(`N° de demande: ${request.request_number}`, 20, y);
  y += 7;
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, y);
  y += 15;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Objet: Autorisation de restauration', 20, y);
  y += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const introText = 'La Bibliotheque Nationale du Royaume du Maroc autorise par la presente la restauration du manuscrit suivant:';
  const introLines = doc.splitTextToSize(introText, 170);
  doc.text(introLines, 20, y);
  y += 7 * introLines.length + 10;
  
  const tableData = [
    ['Titre (Arabic)', '[Texte arabe - voir demande originale]'],
    ['Cote', request.manuscript_cote],
    ['Description (Arabic)', '[Texte arabe - voir demande originale]'],
    ['Niveau d\'urgence', request.urgency_level],
    ['Duree estimee', request.estimated_duration ? `${request.estimated_duration} jours` : 'A determiner'],
    ['Cout estime', request.estimated_cost ? `${request.estimated_cost.toLocaleString('fr-FR')} DH` : 'A determiner']
  ];
  
  tableData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', 20, y);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(value, 130);
    doc.text(lines, 70, y);
    y += 7 * lines.length;
  });
  
  if (request.director_approval_notes) {
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Notes de la direction:', 20, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(request.director_approval_notes, 170);
    doc.text(notesLines, 20, y);
  }
  
  y += 20;
  doc.text('Le Directeur', 150, y);
  y += 5;
  doc.text('BNRM', 160, y);
  
  addFooter(doc);
  doc.save(`autorisation_${request.request_number}.pdf`);
};

export const generateReceptionDocument = (request: RequestData): void => {
  const doc = new jsPDF();
  addHeader(doc, "PROCES-VERBAL DE RECEPTION D'OEUVRE");
  
  let y = 40;
  doc.setFontSize(11);
  doc.setTextColor(0);
  
  const introText = 'Je soussigne, representant de la BNRM, certifie avoir recu ce jour le manuscrit suivant pour restauration:';
  const introLines = doc.splitTextToSize(introText, 170);
  doc.text(introLines, 20, y);
  y += 7 * introLines.length + 10;
  
  const tableData = [
    ['N° de demande', request.request_number],
    ['Titre (Arabic)', '[Texte arabe - voir demande originale]'],
    ['Cote', request.manuscript_cote],
    ['Date de reception', new Date().toLocaleDateString('fr-FR')],
    ['Etat', '[Texte arabe - voir demande originale]']
  ];
  
  tableData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', 20, y);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(value, 130);
    doc.text(lines, 70, y);
    y += 7 * lines.length;
  });
  
  y += 30;
  doc.text('Signature du responsable:', 20, y);
  y += 30;
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, y);
  
  addFooter(doc);
  doc.save(`reception_${request.request_number}.pdf`);
};

export const generateDiagnosisReport = (request: RequestData): void => {
  const doc = new jsPDF();
  addHeader(doc, 'RAPPORT DE DIAGNOSTIC');
  
  let y = 60;
  doc.setFontSize(11);
  doc.setTextColor(0);
  
  doc.text(`N° de demande: ${request.request_number}`, 20, y);
  y += 7;
  doc.text(`Manuscrit: [Texte arabe - voir demande originale]`, 20, y);
  y += 7;
  doc.text(`Cote: ${request.manuscript_cote}`, 20, y);
  y += 7;
  doc.text(`Date du diagnostic: ${new Date().toLocaleDateString('fr-FR')}`, 20, y);
  y += 15;
  
  doc.setFont('helvetica', 'bold');
  doc.text('EVALUATION DES DOMMAGES', 20, y);
  y += 10;
  doc.setFont('helvetica', 'normal');
  
  const diagnosisText = request.diagnosis_report || '[Texte arabe - voir demande originale]';
  const diagnosisLines = doc.splitTextToSize(diagnosisText, 170);
  doc.text(diagnosisLines, 20, y);
  y += 7 * diagnosisLines.length + 15;
  
  doc.setFont('helvetica', 'bold');
  doc.text('RECOMMANDATIONS', 20, y);
  y += 10;
  doc.setFont('helvetica', 'normal');
  
  doc.text(`Niveau d'urgence: ${request.urgency_level}`, 20, y);
  y += 7;
  doc.text(`Duree estimee: ${request.estimated_duration || 'A determiner'} jours`, 20, y);
  y += 7;
  doc.text(`Cout estime: ${request.estimated_cost ? request.estimated_cost.toLocaleString('fr-FR') + ' DH' : 'A determiner'}`, 20, y);
  
  addFooter(doc);
  doc.save(`diagnostic_${request.request_number}.pdf`);
};

export const generateQuoteDocument = (request: RequestData): void => {
  const doc = new jsPDF();
  addHeader(doc, 'DEVIS DE RESTAURATION');
  
  let y = 40;
  doc.setFontSize(11);
  doc.setTextColor(0);
  
  doc.text(`N° de demande: ${request.request_number}`, 20, y);
  y += 7;
  doc.text(`Date d'emission: ${new Date().toLocaleDateString('fr-FR')}`, 20, y);
  y += 7;
  doc.text('Validite: 30 jours', 20, y);
  y += 15;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 20, y);
  doc.text('Montant', 150, y);
  y += 10;
  
  doc.setFont('helvetica', 'normal');
  const descLines = doc.splitTextToSize(`Restauration du manuscrit: [Texte arabe]`, 120);
  doc.text(descLines, 20, y);
  doc.text(`${request.quote_amount?.toLocaleString('fr-FR')} DH`, 150, y);
  y += 7 * descLines.length + 10;
  
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', 20, y);
  doc.text(`${request.quote_amount?.toLocaleString('fr-FR')} DH`, 150, y);
  y += 15;
  
  if (request.quote_details) {
    doc.setFont('helvetica', 'bold');
    doc.text('Details:', 20, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    const detailsLines = doc.splitTextToSize(request.quote_details, 170);
    doc.text(detailsLines, 20, y);
  }
  
  addFooter(doc);
  doc.save(`devis_${request.request_number}.pdf`);
};

export const generateCompletionCertificate = (request: RequestData): void => {
  const doc = new jsPDF();
  addHeader(doc, "CERTIFICAT D'ACHEVEMENT DE RESTAURATION");
  
  let y = 40;
  doc.setFontSize(11);
  doc.setTextColor(0);
  
  const introText = 'La BNRM certifie que les travaux de restauration du manuscrit suivant ont ete menes a bien:';
  const introLines = doc.splitTextToSize(introText, 170);
  doc.text(introLines, 20, y);
  y += 7 * introLines.length + 10;
  
  const tableData = [
    ['N° de demande', request.request_number],
    ['Titre', '[Texte arabe - voir demande originale]'],
    ['Cote', request.manuscript_cote],
    ['Date de debut', new Date(request.submitted_at).toLocaleDateString('fr-FR')],
    ['Date d\'achevement', new Date().toLocaleDateString('fr-FR')],
    ['Montant total', request.quote_amount ? `${request.quote_amount.toLocaleString('fr-FR')} DH` : 'N/A']
  ];
  
  tableData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 70, y);
    y += 7;
  });
  
  if (request.restoration_report) {
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Rapport final:', 20, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    const reportLines = doc.splitTextToSize(request.restoration_report, 170);
    doc.text(reportLines, 20, y);
    y += 7 * reportLines.length;
  }
  
  y += 20;
  doc.text(`Fait a Rabat, le ${new Date().toLocaleDateString('fr-FR')}`, 20, y);
  y += 15;
  doc.text('Le Directeur de la BNRM', 140, y);
  
  addFooter(doc);
  doc.save(`achevement_${request.request_number}.pdf`);
};
