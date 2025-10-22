import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addBNRMHeader, addBNRMFooter } from '@/lib/pdfHeaderUtils';

interface Booking {
  id: string;
  booking_number: string;
  organization_name: string;
  organization_type: string;
  contact_person: string;
  phone: string;
  email: string;
  activity_type: string;
  activity_description?: string;
  start_date: string;
  end_date: string;
  duration_type: string;
  expected_attendees?: number;
  special_requirements?: string;
  total_amount: number;
  status: string;
  space_id?: string;
}

interface Space {
  name: string;
  capacity: number;
  description?: string;
  location?: string;
}

/**
 * Génère une lettre de confirmation de réservation en PDF
 */
export const generateConfirmationLetter = async (booking: Booking, space?: Space) => {
  const doc = new jsPDF();
  
  // Ajouter l'en-tête BNRM
  const yAfterHeader = await addBNRMHeader(doc);
  let yPos = yAfterHeader + 10;
  
  // Titre
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('LETTRE DE CONFIRMATION DE RÉSERVATION', 105, yPos, { align: 'center' });
  yPos += 15;
  
  // Numéro de réservation
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Référence: ${booking.booking_number}`, 20, yPos);
  yPos += 7;
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, yPos);
  yPos += 15;
  
  // Informations de l'organisme
  doc.setFont('helvetica', 'bold');
  doc.text('Organisme demandeur:', 20, yPos);
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.text(booking.organization_name, 20, yPos);
  yPos += 5;
  doc.text(`Contact: ${booking.contact_person}`, 20, yPos);
  yPos += 5;
  doc.text(`Email: ${booking.email}`, 20, yPos);
  yPos += 5;
  doc.text(`Téléphone: ${booking.phone}`, 20, yPos);
  yPos += 12;
  
  // Objet
  doc.setFont('helvetica', 'bold');
  doc.text('Objet:', 20, yPos);
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  const objectText = `Confirmation de réservation d'espace pour ${booking.activity_type}`;
  doc.text(objectText, 20, yPos);
  yPos += 12;
  
  // Corps de la lettre
  const bodyText = [
    'Madame, Monsieur,',
    '',
    `Nous avons le plaisir de vous confirmer la réservation de l'espace "${space?.name || 'Non spécifié'}"`,
    'pour votre activité dans les conditions suivantes:'
  ];
  
  doc.setFontSize(11);
  bodyText.forEach(line => {
    doc.text(line, 20, yPos);
    yPos += 6;
  });
  yPos += 5;
  
  // Tableau des détails
  autoTable(doc, {
    startY: yPos,
    head: [['Détail', 'Information']],
    body: [
      ['Espace réservé', space?.name || 'Non spécifié'],
      ['Type d\'activité', booking.activity_type],
      ['Date de début', new Date(booking.start_date).toLocaleDateString('fr-FR')],
      ['Date de fin', new Date(booking.end_date).toLocaleDateString('fr-FR')],
      ['Durée', booking.duration_type === 'demi_journee' ? 'Demi-journée' : 'Journée complète'],
      ['Participants attendus', booking.expected_attendees?.toString() || 'Non précisé'],
      ['Montant total', `${booking.total_amount.toFixed(2)} MAD`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 20, right: 20 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Besoins spéciaux
  if (booking.special_requirements) {
    doc.setFont('helvetica', 'bold');
    doc.text('Besoins spéciaux:', 20, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const splitRequirements = doc.splitTextToSize(booking.special_requirements, 170);
    doc.text(splitRequirements, 20, yPos);
    yPos += splitRequirements.length * 5 + 10;
  }
  
  // Formule de politesse
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  const closingText = [
    'Nous restons à votre disposition pour toute information complémentaire.',
    '',
    'Veuillez agréer, Madame, Monsieur, nos salutations distinguées.'
  ];
  
  closingText.forEach(line => {
    doc.text(line, 20, yPos);
    yPos += 6;
  });
  
  // Signature
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('La Direction', 20, yPos);
  doc.text('Bibliothèque Nationale du Royaume du Maroc', 20, yPos + 6);
  
  // Pied de page
  addBNRMFooter(doc, 1);
  
  doc.save(`confirmation_${booking.booking_number}.pdf`);
};

/**
 * Génère un contrat de réservation en PDF
 */
export const generateContract = async (booking: Booking, space?: Space) => {
  const doc = new jsPDF();
  
  // Ajouter l'en-tête BNRM
  const yAfterHeader = await addBNRMHeader(doc);
  let yPos = yAfterHeader + 10;
  
  // Titre
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTRAT DE RÉSERVATION D\'ESPACE', 105, yPos, { align: 'center' });
  yPos += 15;
  
  // Numéro de contrat
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Contrat N°: ${booking.booking_number}`, 20, yPos);
  yPos += 7;
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, yPos);
  yPos += 15;
  
  // Article 1 - Parties
  doc.setFont('helvetica', 'bold');
  doc.text('ENTRE LES SOUSSIGNÉS:', 20, yPos);
  yPos += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text('D\'une part,', 20, yPos);
  yPos += 6;
  doc.text('La Bibliothèque Nationale du Royaume du Maroc (BNRM)', 20, yPos);
  yPos += 5;
  doc.text('Représentée par son Directeur', 20, yPos);
  yPos += 5;
  doc.text('Ci-après dénommée "LE LOUEUR"', 20, yPos);
  yPos += 10;
  
  doc.text('Et d\'autre part,', 20, yPos);
  yPos += 6;
  doc.text(booking.organization_name, 20, yPos);
  yPos += 5;
  doc.text(`Représentée par ${booking.contact_person}`, 20, yPos);
  yPos += 5;
  doc.text('Ci-après dénommée "LE LOCATAIRE"', 20, yPos);
  yPos += 15;
  
  // Articles du contrat
  const articles = [
    {
      title: 'ARTICLE 1 - OBJET DU CONTRAT',
      content: `Le présent contrat a pour objet la mise à disposition de l'espace "${space?.name || 'Non spécifié'}" pour l'organisation de ${booking.activity_type}.`
    },
    {
      title: 'ARTICLE 2 - DURÉE',
      content: `La mise à disposition est accordée du ${new Date(booking.start_date).toLocaleDateString('fr-FR')} au ${new Date(booking.end_date).toLocaleDateString('fr-FR')}.`
    },
    {
      title: 'ARTICLE 3 - CONDITIONS FINANCIÈRES',
      content: `Le montant total de la location s'élève à ${booking.total_amount.toFixed(2)} MAD. Ce montant doit être réglé conformément aux conditions de paiement convenues.`
    },
    {
      title: 'ARTICLE 4 - OBLIGATIONS DU LOCATAIRE',
      content: 'Le locataire s\'engage à utiliser les lieux conformément à leur destination et à respecter le règlement intérieur de la BNRM. Le locataire est responsable de tous dommages causés aux locaux et équipements pendant la période de location.'
    },
    {
      title: 'ARTICLE 5 - ASSURANCE',
      content: 'Le locataire s\'engage à souscrire une assurance responsabilité civile couvrant les dommages qui pourraient être causés aux tiers et aux biens pendant la durée de la location.'
    },
    {
      title: 'ARTICLE 6 - ANNULATION',
      content: 'Toute annulation doit être notifiée par écrit au moins 15 jours avant la date prévue. En cas d\'annulation tardive, des pénalités pourront être appliquées selon les conditions générales.'
    }
  ];
  
  articles.forEach(article => {
    if (yPos > 250) {
      addBNRMFooter(doc, doc.internal.pages.length - 1);
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text(article.title, 20, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    const splitContent = doc.splitTextToSize(article.content, 170);
    doc.text(splitContent, 20, yPos);
    yPos += splitContent.length * 5 + 10;
  });
  
  // Signatures
  if (yPos > 220) {
    addBNRMFooter(doc, doc.internal.pages.length - 1);
    doc.addPage();
    yPos = 20;
  }
  
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('Fait à Rabat, le ' + new Date().toLocaleDateString('fr-FR'), 20, yPos);
  yPos += 15;
  
  doc.text('Pour la BNRM', 20, yPos);
  doc.text('Pour le Locataire', 120, yPos);
  yPos += 5;
  doc.text('Le Directeur', 20, yPos);
  doc.text(booking.contact_person, 120, yPos);
  yPos += 20;
  doc.setFont('helvetica', 'normal');
  doc.text('(Signature et cachet)', 20, yPos);
  doc.text('(Signature)', 120, yPos);
  
  // Pied de page
  addBNRMFooter(doc, doc.internal.pages.length - 1);
  
  doc.save(`contrat_${booking.booking_number}.pdf`);
};

/**
 * Génère une facture en PDF
 */
export const generateInvoice = async (booking: Booking, space?: Space) => {
  const doc = new jsPDF();
  
  // Ajouter l'en-tête BNRM
  const yAfterHeader = await addBNRMHeader(doc);
  let yPos = yAfterHeader + 10;
  
  // Titre
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', 105, yPos, { align: 'center' });
  yPos += 15;
  
  // Informations facture
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Facture N°: ${booking.booking_number}`, 20, yPos);
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 140, yPos);
  yPos += 15;
  
  // Informations client
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURÉ À:', 20, yPos);
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.text(booking.organization_name, 20, yPos);
  yPos += 5;
  doc.text(booking.contact_person, 20, yPos);
  yPos += 5;
  doc.text(booking.email, 20, yPos);
  yPos += 5;
  doc.text(booking.phone, 20, yPos);
  yPos += 15;
  
  // Calcul des montants
  const days = Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const basePrice = booking.total_amount * 0.8; // 80% du total pour le tarif de base
  const additionalCharges = booking.total_amount * 0.2; // 20% pour les charges
  const tva = booking.total_amount * 0.2; // TVA 20%
  const totalTTC = booking.total_amount + tva;
  
  // Tableau de facturation
  autoTable(doc, {
    startY: yPos,
    head: [['Désignation', 'Qté', 'Prix unitaire', 'Montant HT']],
    body: [
      [
        `Location ${space?.name || 'Espace'} - ${booking.activity_type}`,
        days.toString(),
        `${(basePrice / days).toFixed(2)} MAD`,
        `${basePrice.toFixed(2)} MAD`
      ],
      [
        'Charges additionnelles (électricité, nettoyage)',
        '1',
        `${additionalCharges.toFixed(2)} MAD`,
        `${additionalCharges.toFixed(2)} MAD`
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 20, right: 20 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Totaux
  doc.setFont('helvetica', 'normal');
  const rightAlign = 170;
  
  doc.text('Total HT:', rightAlign - 50, yPos, { align: 'right' });
  doc.text(`${booking.total_amount.toFixed(2)} MAD`, rightAlign, yPos, { align: 'right' });
  yPos += 7;
  
  doc.text('TVA (20%):', rightAlign - 50, yPos, { align: 'right' });
  doc.text(`${tva.toFixed(2)} MAD`, rightAlign, yPos, { align: 'right' });
  yPos += 7;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total TTC:', rightAlign - 50, yPos, { align: 'right' });
  doc.text(`${totalTTC.toFixed(2)} MAD`, rightAlign, yPos, { align: 'right' });
  yPos += 15;
  
  // Conditions de paiement
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDITIONS DE PAIEMENT:', 20, yPos);
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.text('Paiement à effectuer avant la date de réservation', 20, yPos);
  yPos += 5;
  doc.text('Mode de paiement: Virement bancaire ou chèque à l\'ordre de la BNRM', 20, yPos);
  yPos += 15;
  
  // Note
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Cette facture est établie conformément aux tarifs en vigueur de la BNRM.', 20, yPos);
  
  // Pied de page
  addBNRMFooter(doc, 1);
  
  doc.save(`facture_${booking.booking_number}.pdf`);
};

/**
 * Génère un état des lieux en PDF
 */
export const generateInventoryReport = async (booking: Booking, space?: Space) => {
  const doc = new jsPDF();
  
  // Ajouter l'en-tête BNRM
  const yAfterHeader = await addBNRMHeader(doc);
  let yPos = yAfterHeader + 10;
  
  // Titre
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ÉTAT DES LIEUX', 105, yPos, { align: 'center' });
  yPos += 15;
  
  // Informations
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Référence: ${booking.booking_number}`, 20, yPos);
  yPos += 7;
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, yPos);
  yPos += 7;
  doc.text(`Espace: ${space?.name || 'Non spécifié'}`, 20, yPos);
  yPos += 15;
  
  // Informations locataire
  doc.setFont('helvetica', 'bold');
  doc.text('LOCATAIRE:', 20, yPos);
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.text(booking.organization_name, 20, yPos);
  yPos += 5;
  doc.text(`Contact: ${booking.contact_person}`, 20, yPos);
  yPos += 15;
  
  // Introduction
  doc.setFont('helvetica', 'bold');
  doc.text('TYPE D\'ÉTAT DES LIEUX:', 20, yPos);
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.text('☐ État des lieux d\'entrée', 30, yPos);
  yPos += 6;
  doc.text('☐ État des lieux de sortie', 30, yPos);
  yPos += 15;
  
  // Tableau d'état des lieux
  autoTable(doc, {
    startY: yPos,
    head: [['Élément', 'État', 'Observations']],
    body: [
      ['Sols et revêtements', '☐ Bon ☐ Moyen ☐ Mauvais', ''],
      ['Murs et peintures', '☐ Bon ☐ Moyen ☐ Mauvais', ''],
      ['Plafonds', '☐ Bon ☐ Moyen ☐ Mauvais', ''],
      ['Éclairage', '☐ Bon ☐ Moyen ☐ Mauvais', ''],
      ['Climatisation/Chauffage', '☐ Bon ☐ Moyen ☐ Mauvais', ''],
      ['Mobilier', '☐ Bon ☐ Moyen ☐ Mauvais', ''],
      ['Équipements audiovisuels', '☐ Bon ☐ Moyen ☐ Mauvais', ''],
      ['Sanitaires', '☐ Bon ☐ Moyen ☐ Mauvais', ''],
      ['Issues de secours', '☐ Bon ☐ Moyen ☐ Mauvais', ''],
      ['Propreté générale', '☐ Bon ☐ Moyen ☐ Mauvais', '']
    ],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 50 },
      2: { cellWidth: 60 }
    }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Observations générales
  doc.setFont('helvetica', 'bold');
  doc.text('OBSERVATIONS GÉNÉRALES:', 20, yPos);
  yPos += 10;
  doc.setFont('helvetica', 'normal');
  
  // Lignes vides pour observations
  for (let i = 0; i < 5; i++) {
    doc.line(20, yPos, 190, yPos);
    yPos += 8;
  }
  
  // Signatures
  if (yPos > 220) {
    addBNRMFooter(doc, 1);
    doc.addPage();
    yPos = 20;
  } else {
    yPos += 10;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.text('Fait à Rabat, le ' + new Date().toLocaleDateString('fr-FR'), 20, yPos);
  yPos += 15;
  
  doc.text('Pour la BNRM', 20, yPos);
  doc.text('Pour le Locataire', 120, yPos);
  yPos += 20;
  doc.setFont('helvetica', 'normal');
  doc.text('(Signature et cachet)', 20, yPos);
  doc.text('(Signature)', 120, yPos);
  
  // Pied de page
  addBNRMFooter(doc, doc.internal.pages.length - 1);
  
  doc.save(`etat_lieux_${booking.booking_number}.pdf`);
};
