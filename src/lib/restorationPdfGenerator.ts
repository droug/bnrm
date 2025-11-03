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
  payment_reference?: string;
  initial_condition?: string;
  works_performed?: string;
  materials_used?: string;
  techniques_applied?: string;
  final_condition?: string;
  recommendations?: string;
  actual_duration?: string;
  actual_cost?: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

const addHeader = async (doc: jsPDF, title: string) => {
  // Charger et ajouter l'image de l'en-tête BNRM
  const headerImg = new Image();
  headerImg.src = '/images/entete-bnrm.png';
  
  await new Promise((resolve) => {
    headerImg.onload = resolve;
  });
  
  // Ajouter l'image en haut du document (ajustée à la largeur)
  const imgWidth = doc.internal.pageSize.width - 40; // Marges de 20 de chaque côté
  const imgHeight = (headerImg.height * imgWidth) / headerImg.width;
  doc.addImage(headerImg, 'PNG', 20, 5, imgWidth, imgHeight);
  
  // Position du titre après l'image
  const yPosition = 5 + imgHeight + 10;
  
  // Ligne de séparation
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.8);
  doc.line(20, yPosition, doc.internal.pageSize.width - 20, yPosition);
  
  // Titre du document
  doc.setFontSize(16);
  doc.setTextColor(41, 128, 185);
  doc.setFont('helvetica', 'bold');
  doc.text(title, doc.internal.pageSize.width / 2, yPosition + 10, { align: 'center' });
  
  // Ligne sous le titre
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.5);
  doc.line(40, yPosition + 13, doc.internal.pageSize.width - 40, yPosition + 13);
};

const addFooter = (doc: jsPDF) => {
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Document genere le ${new Date().toLocaleDateString('fr-FR')}`, doc.internal.pageSize.width / 2, pageHeight - 10, { align: 'center' });
};

export const generateAuthorizationLetter = async (request: RequestData): Promise<void> => {
  const doc = new jsPDF();
  await addHeader(doc, "LETTRE D'AUTORISATION DE RESTAURATION");
  
  let y = 70;
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

export const generateReceptionDocument = async (request: RequestData): Promise<void> => {
  const doc = new jsPDF();
  await addHeader(doc, "PROCES-VERBAL DE RECEPTION D'OEUVRE");
  
  let y = 70;
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

export const generateDiagnosisReport = async (request: RequestData): Promise<void> => {
  const doc = new jsPDF();
  await addHeader(doc, 'RAPPORT DE DIAGNOSTIC');
  
  let y = 70;
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

export const generateQuoteDocument = async (request: RequestData): Promise<void> => {
  const doc = new jsPDF();
  await addHeader(doc, 'DEVIS DE RESTAURATION');
  
  let y = 70;
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

export const generateCompletionReport = async (request: RequestData): Promise<void> => {
  const doc = new jsPDF();
  await addHeader(doc, "BON DE RÉALISATION");
  
  let y = 70;
  doc.setFontSize(11);
  doc.setTextColor(0);
  
  // Informations principales
  doc.setFont('helvetica', 'bold');
  doc.text('N° de demande:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(request.request_number, 80, y);
  y += 7;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Date d\'émission:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('fr-FR'), 80, y);
  y += 15;
  
  // Informations sur le manuscrit
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('IDENTIFICATION DU MANUSCRIT', 20, y);
  y += 10;
  
  doc.setFontSize(11);
  const manuscriptInfo = [
    ['Titre', '[Texte arabe - voir demande originale]'],
    ['Cote', request.manuscript_cote],
  ];
  
  manuscriptInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', 20, y);
    doc.setFont('helvetica', 'normal');
    const valueLines = doc.splitTextToSize(value, 130);
    doc.text(valueLines, 80, y);
    y += 7 * valueLines.length;
  });
  
  y += 10;
  
  // Dates principales
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('DATES DE RÉALISATION', 20, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Date de début:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(request.submitted_at).toLocaleDateString('fr-FR'), 80, y);
  y += 7;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Date de fin:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('fr-FR'), 80, y);
  y += 7;
  
  if (request.actual_duration) {
    doc.setFont('helvetica', 'bold');
    doc.text('Durée effective:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${request.actual_duration} jours`, 80, y);
    y += 7;
  }
  
  y += 10;
  
  // Informations financières
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('INFORMATIONS FINANCIÈRES', 20, y);
  y += 10;
  
  doc.setFontSize(11);
  
  if (request.actual_cost) {
    doc.setFont('helvetica', 'bold');
    doc.text('Coût total:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${parseFloat(request.actual_cost).toLocaleString('fr-FR')} DH`, 80, y);
    y += 7;
  } else if (request.quote_amount) {
    doc.setFont('helvetica', 'bold');
    doc.text('Coût total:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${request.quote_amount.toLocaleString('fr-FR')} DH`, 80, y);
    y += 7;
  }
  
  if (request.payment_reference) {
    doc.setFont('helvetica', 'bold');
    doc.text('Référence paiement:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(request.payment_reference, 80, y);
    y += 7;
  }
  
  y += 15;
  
  // Certification
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('CERTIFICATION', 20, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const certificationText = 'Nous certifions que les travaux de restauration ont été réalisés conformément aux normes professionnelles en vigueur.';
  const certLines = doc.splitTextToSize(certificationText, 170);
  doc.text(certLines, 20, y);
  y += 7 * certLines.length + 20;
  
  // Signatures
  doc.text(`Fait à Rabat, le ${new Date().toLocaleDateString('fr-FR')}`, 20, y);
  y += 20;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Le Responsable de Restauration', 20, y);
  doc.text('Le Directeur de la BNRM', 120, y);
  
  addFooter(doc);
  doc.save(`bon_realisation_${request.request_number}.pdf`);
};

export const generateInvoice = async (request: RequestData): Promise<void> => {
  const doc = new jsPDF();
  await addHeader(doc, 'FACTURE DE RESTAURATION');
  
  let y = 70;
  doc.setFontSize(11);
  doc.setTextColor(0);
  
  // Informations de facturation
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE N°:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`FACT-${request.request_number}`, 70, y);
  y += 7;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Date d\'émission:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('fr-FR'), 70, y);
  y += 7;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Référence paiement:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(request.payment_reference || 'N/A', 70, y);
  y += 15;
  
  // Informations client
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('FACTURÉ À:', 20, y);
  y += 7;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  if (request.profiles) {
    doc.text(`${request.profiles.first_name} ${request.profiles.last_name}`, 20, y);
    y += 7;
  }
  
  y += 10;
  
  // Détails de la facture
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('DÉTAILS DE LA PRESTATION', 20, y);
  y += 10;
  
  // En-tête du tableau
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 20, y);
  doc.text('Montant (DH)', 150, y);
  y += 5;
  
  // Ligne de séparation
  doc.setDrawColor(200);
  doc.line(20, y, 190, y);
  y += 7;
  
  // Lignes de détail
  doc.setFont('helvetica', 'normal');
  const description = `Restauration du manuscrit: ${request.manuscript_title}`;
  const descLines = doc.splitTextToSize(description, 120);
  doc.text(descLines, 20, y);
  doc.text((request.quote_amount || 0).toLocaleString('fr-FR'), 150, y);
  y += 7 * descLines.length + 3;
  
  doc.text(`Cote: ${request.manuscript_cote}`, 20, y);
  y += 7;
  
  doc.text(`N° demande: ${request.request_number}`, 20, y);
  y += 10;
  
  // Ligne de séparation
  doc.line(20, y, 190, y);
  y += 7;
  
  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL HT', 20, y);
  doc.text(`${(request.quote_amount || 0).toLocaleString('fr-FR')} DH`, 150, y);
  y += 7;
  
  doc.text('TVA (0%)', 20, y);
  doc.text('0.00 DH', 150, y);
  y += 10;
  
  // Ligne double
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 1;
  doc.line(20, y, 190, y);
  y += 7;
  
  doc.setFontSize(14);
  doc.text('TOTAL TTC', 20, y);
  doc.text(`${(request.quote_amount || 0).toLocaleString('fr-FR')} DH`, 150, y);
  
  // Conditions de paiement
  y += 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDITIONS DE PAIEMENT:', 20, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.text('Paiement comptant lors de la restitution de l\'œuvre.', 20, y);
  
  // Notes
  y += 15;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  const noteText = 'Cette facture est établie conformément aux services de restauration effectués par la BNRM.';
  const noteLines = doc.splitTextToSize(noteText, 170);
  doc.text(noteLines, 20, y);
  
  addFooter(doc);
  doc.save(`facture_${request.request_number}.pdf`);
};

export const generateRestitutionReport = async (request: RequestData): Promise<void> => {
  const doc = new jsPDF();
  await addHeader(doc, "RAPPORT DE RESTAURATION");
  
  let y = 70;
  doc.setFontSize(11);
  doc.setTextColor(0);
  
  // Informations générales
  doc.setFont('helvetica', 'bold');
  doc.text('N° de demande:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(request.request_number, 70, y);
  y += 7;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Date de restitution:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('fr-FR'), 70, y);
  y += 15;
  
  // Informations sur le manuscrit
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('IDENTIFICATION DU MANUSCRIT', 20, y);
  y += 10;
  
  doc.setFontSize(11);
  const manuscriptInfo = [
    ['Titre', '[Texte arabe - voir demande originale]'],
    ['Cote', request.manuscript_cote],
    ['Date de réception', new Date(request.submitted_at).toLocaleDateString('fr-FR')],
    ['Date de restitution', new Date().toLocaleDateString('fr-FR')]
  ];
  
  manuscriptInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', 20, y);
    doc.setFont('helvetica', 'normal');
    const valueLines = doc.splitTextToSize(value, 130);
    doc.text(valueLines, 70, y);
    y += 7 * valueLines.length;
  });
  
  y += 10;
  
  // Bénéficiaire
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('BÉNÉFICIAIRE', 20, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  if (request.profiles) {
    doc.text(`Nom: ${request.profiles.first_name} ${request.profiles.last_name}`, 20, y);
    y += 7;
  }
  
  y += 10;
  
  // Synthèse des travaux de restauration
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('SYNTHÈSE DES TRAVAUX EFFECTUÉS', 20, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  // État initial
  doc.setFont('helvetica', 'bold');
  doc.text('État initial:', 20, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  if (request.initial_condition) {
    const initialLines = doc.splitTextToSize(request.initial_condition, 170);
    doc.text(initialLines, 20, y);
    y += 7 * initialLines.length + 7;
  } else {
    doc.text('[État initial non documenté]', 20, y);
    y += 14;
  }
  
  // Travaux réalisés
  doc.setFont('helvetica', 'bold');
  doc.text('Interventions réalisées:', 20, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  if (request.works_performed) {
    const worksLines = doc.splitTextToSize(request.works_performed, 170);
    doc.text(worksLines, 20, y);
    y += 7 * worksLines.length + 7;
  } else if (request.restoration_report) {
    const reportLines = doc.splitTextToSize(request.restoration_report, 170);
    doc.text(reportLines, 20, y);
    y += 7 * reportLines.length + 7;
  } else {
    doc.text('[Travaux non documentés]', 20, y);
    y += 14;
  }
  
  // État final
  doc.setFont('helvetica', 'bold');
  doc.text('État final:', 20, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  if (request.final_condition) {
    const finalLines = doc.splitTextToSize(request.final_condition, 170);
    doc.text(finalLines, 20, y);
    y += 7 * finalLines.length + 10;
  } else {
    doc.text('[État final non documenté]', 20, y);
    y += 17;
  }
  
  // Recommandations de conservation
  if (request.recommendations) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('RECOMMANDATIONS DE CONSERVATION', 20, y);
    y += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const recoLines = doc.splitTextToSize(request.recommendations, 170);
    doc.text(recoLines, 20, y);
    y += 7 * recoLines.length + 10;
  }
  
  // Informations financières
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('INFORMATIONS FINANCIÈRES', 20, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const costText = request.actual_cost 
    ? `${parseFloat(request.actual_cost).toLocaleString('fr-FR')} DH`
    : request.quote_amount 
    ? `${request.quote_amount.toLocaleString('fr-FR')} DH`
    : 'Non spécifié';
  
  doc.text('Montant total:', 20, y);
  doc.text(costText, 70, y);
  y += 7;
  
  if (request.payment_reference) {
    doc.text('Référence paiement:', 20, y);
    doc.text(request.payment_reference, 70, y);
    y += 7;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.text('Statut:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text('Paiement effectué', 70, y);
  y += 15;
  
  // Certification de restitution
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('CERTIFICATION DE RESTITUTION', 20, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const certificationText = 'Nous certifions que le manuscrit mentionné ci-dessus a été restauré conformément aux normes professionnelles et qu\'il est restitué en bon état à son bénéficiaire. Le présent rapport atteste de la bonne exécution des travaux et de la remise du bien.';
  const certLines = doc.splitTextToSize(certificationText, 170);
  doc.text(certLines, 20, y);
  y += 7 * certLines.length + 15;
  
  // Signatures
  doc.text(`Fait à Rabat, le ${new Date().toLocaleDateString('fr-FR')}`, 20, y);
  y += 20;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Le Responsable de Restauration', 20, y);
  doc.text('Le Bénéficiaire', 120, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('(signature et cachet)', 20, y);
  doc.text('(signature)', 120, y);
  
  addFooter(doc);
  doc.save(`rapport_restitution_${request.request_number}.pdf`);
};
