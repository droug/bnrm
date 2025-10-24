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
 * Génère une lettre de confirmation de réservation en PDF selon le modèle officiel BNRM
 */
export const generateConfirmationLetter = async (booking: Booking, space?: Space) => {
  const doc = new jsPDF();
  
  // Ajouter l'en-tête BNRM
  const yAfterHeader = await addBNRMHeader(doc);
  let yPos = yAfterHeader + 5;
  
  // Département et Date/Lieu
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Département des activités Culturelles et de la Communication', 105, yPos, { align: 'center' });
  yPos += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Rabat, le ${new Date().toLocaleDateString('fr-FR')}`, 20, yPos);
  yPos += 10;
  
  // Destinataire
  doc.setFont('helvetica', 'bold');
  doc.text(`A l'Attention de ${booking.contact_person}`, 20, yPos);
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(booking.organization_name, 20, yPos);
  yPos += 10;
  
  // Objet
  doc.setFont('helvetica', 'bold');
  doc.text(`Objet : Confirmation d'occupation de ${space?.name || 'l\'espace'}`, 20, yPos);
  yPos += 10;
  
  // Référence
  const refMonth = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Réf DR: ${booking.booking_number}/suite/${refMonth}`, 20, yPos);
  yPos += 15;
  
  // Corps de la lettre
  doc.text('Madame/Monsieur,', 20, yPos);
  yPos += 10;
  
  const startDate = new Date(booking.start_date).toLocaleDateString('fr-FR');
  const endDate = new Date(booking.end_date).toLocaleDateString('fr-FR');
  
  const bodyLines = [
    `En réponse à votre demande datée du ${startDate}, la Bibliothèque Nationale du Royaume du Maroc`,
    `met à votre disposition ${space?.name || 'l\'espace'} pour la période du ${startDate} au ${endDate}.`,
    '',
    'Nous vous prions de bien vouloir vous présenter au siège de la BNRM – Département des Activités',
    'culturelles et de la Communication, muni de cette confirmation et de la fiche de renseignement',
    'dûment remplie pour la signature du contrat, au plus tard, 72h avant la date de la manifestation.',
    'A défaut, votre réservation sera annulée.'
  ];
  
  bodyLines.forEach(line => {
    doc.text(line, 20, yPos);
    yPos += 5;
  });
  yPos += 10;
  
  // Section Devis
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Devis :', 20, yPos);
  yPos += 10;
  
  // Calcul des valeurs
  const days = Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const unitPrice = booking.total_amount / days;
  
  // Tableau du devis
  autoTable(doc, {
    startY: yPos,
    head: [['Désignation', 'Prix unitaire', 'Nombre de jours', 'Montant']],
    body: [
      [
        `${space?.name || 'Espace'} / ${booking.duration_type === 'demi_journee' ? 'Demi-journée' : 'Journée'}`,
        `${unitPrice.toFixed(2)} MAD`,
        days.toString(),
        `${booking.total_amount.toFixed(2)} MAD`
      ]
    ],
    theme: 'grid',
    headStyles: { 
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineWidth: 0.5,
      lineColor: [0, 0, 0]
    },
    bodyStyles: {
      lineWidth: 0.5,
      lineColor: [0, 0, 0]
    },
    margin: { left: 20, right: 20 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Charges et frais annexes
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Charges et frais annexes', 20, yPos);
  yPos += 10;
  
  // TOTAL A PAYER
  doc.setFontSize(13);
  doc.text(`TOTAL A PAYER : ${booking.total_amount.toFixed(2)} MAD`, 20, yPos);
  yPos += 15;
  
  // Signature
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('M. Brahim IGHLANE', 130, yPos);
  yPos += 5;
  doc.text('Département des Activités Culturelles', 130, yPos);
  yPos += 5;
  doc.text('et de la Communication', 130, yPos);
  
  // Note en bas
  yPos = 270;
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Notre règlement d\'utilisation des espaces est consultable sur le site BNRM : www.bnrm.ma', 105, yPos, { align: 'center' });
  
  // Pied de page page 1
  addBNRMFooter(doc, 1);
  
  // ========== PAGE 2 : FORMULAIRE DE RENSEIGNEMENTS ==========
  doc.addPage();
  yPos = 20;
  
  // En-tête page 2
  await addBNRMHeader(doc);
  yPos = 50;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  const introText = [
    'Veuillez aussi compléter les renseignements concernant l\'événement dans la partie réservée à cet effet,',
    'et apporter le justificatif correspondant à votre catégorie.'
  ];
  
  introText.forEach(line => {
    doc.text(line, 20, yPos);
    yPos += 5;
  });
  yPos += 10;
  
  // Section Informations de l'organisme
  doc.setFont('helvetica', 'bold');
  doc.text('Nom ou raison sociale :', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(booking.organization_name, 80, yPos);
  yPos += 7;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Secteur :', 20, yPos);
  doc.setFont('helvetica', 'normal');
  const secteur = booking.organization_type === 'public' ? '☑ public    ☐ privé' : '☐ public    ☑ privé';
  doc.text(secteur, 45, yPos);
  yPos += 10;
  
  // Catégories
  doc.setFont('helvetica', 'bold');
  doc.text('Catégorie :', 20, yPos);
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const categories = [
    '☐ ONG non gouvernementale nationale ou internationale œuvrant dans des domaines d\'intérêt public',
    '☐ Associations à but non lucratif',
    '☐ Représentations diplomatiques accréditées au Maroc',
    '☐ Organisations internationales',
    '☐ Ministères et établissements publics',
    '☐ Autres (précisez) : _______________________'
  ];
  
  categories.forEach(cat => {
    doc.text(cat, 25, yPos);
    yPos += 5;
  });
  yPos += 5;
  
  // Contact
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Adresse :', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text('_________________________________________________________________', 45, yPos);
  yPos += 7;
  
  doc.setFont('helvetica', 'bold');
  doc.text('N° téléphone :', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(booking.phone, 50, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text('E-mail :', 100, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(booking.email, 120, yPos);
  yPos += 10;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Nom et qualité du représentant légal :', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(booking.contact_person, 95, yPos);
  yPos += 10;
  
  // Détails de la manifestation
  doc.setFont('helvetica', 'bold');
  doc.text('Désignation de la manifestation :', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(booking.activity_type, 85, yPos);
  yPos += 7;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Thématique :', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(booking.activity_description || '', 50, yPos);
  yPos += 7;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Date de manifestation :', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`Du ${new Date(booking.start_date).toLocaleDateString('fr-FR')} au ${new Date(booking.end_date).toLocaleDateString('fr-FR')}`, 70, yPos);
  yPos += 10;
  
  // Tableau des espaces
  doc.setFont('helvetica', 'bold');
  doc.text('Espace(s) mis à la disposition :', 20, yPos);
  yPos += 7;
  
  autoTable(doc, {
    startY: yPos,
    head: [['ESPACES', 'CAPACITÉ MAXIMALE', 'Choix']],
    body: [
      ['AUDITORIUM', '289 places', space?.name === 'Auditorium' ? '☑' : '☐'],
      ['SALLE DE CONFÉRENCES', '100 places', space?.name === 'Salle de Conférences' ? '☑' : '☐'],
      ['ATELIER DE FORMATION', '40 places', space?.name === 'Atelier de Formation' ? '☑' : '☐'],
      ['SALLE DE SÉMINAIRES', '40 places', space?.name === 'Salle de Séminaires' ? '☑' : '☐'],
      ['SALLE DE RÉUNION DE L\'ANNEXE', '80 places', space?.name === 'Salle de Réunion' ? '☑' : '☐'],
      ['ESPLANADE', 'Ouvert', space?.name === 'Esplanade' ? '☑' : '☐'],
      ['ESPACE D\'EXPOSITIONS', '---', space?.name === 'Espace d\'Expositions' ? '☑' : '☐']
    ],
    theme: 'grid',
    headStyles: { 
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 9
    },
    margin: { left: 20, right: 20 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 7;
  
  // Informations complémentaires
  doc.setFont('helvetica', 'bold');
  doc.text('Nombre de personnes attendues :', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(booking.expected_attendees?.toString() || '___', 85, yPos);
  yPos += 7;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Type de manifestation :', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Conférence - Congrès - Colloque - Séminaire - Formation - Exposition - Activité artistiques', 20, yPos + 5);
  yPos += 12;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Pause Café :', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text('☐ Oui    ☐ Non', 45, yPos);
  yPos += 7;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Couverture médiatique :', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text('☐ Oui    ☐ Non', 70, yPos);
  yPos += 10;
  
  // Signatures
  doc.setFont('helvetica', 'normal');
  doc.text('Signature du demandeur', 20, yPos);
  doc.text('M. Brahim IGHLANE', 130, yPos);
  yPos += 5;
  doc.text('ou de son représentant légal', 20, yPos);
  doc.text('Département des Activités Culturelles', 130, yPos);
  yPos += 5;
  doc.text('', 20, yPos);
  doc.text('et de la Communication', 130, yPos);
  
  // Note en bas page 2
  yPos = 270;
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text('¹ Pour ce secteur, toute dérogation de paiement différé doit faire l\'objet d\'une demande justifiée.', 20, yPos);
  yPos += 5;
  doc.text('Notre règlement d\'utilisation des espaces est consultable sur le site BNRM : www.bnrm.ma', 105, yPos, { align: 'center' });
  
  // Pied de page page 2
  addBNRMFooter(doc, 2);
  
  doc.save(`confirmation_${booking.booking_number}.pdf`);
};

/**
 * Génère une lettre de refus en PDF
 */
export const generateRejectionLetter = async (booking: Booking, space?: Space, rejectionReason?: string) => {
  const doc = new jsPDF();
  
  // Ajouter l'en-tête BNRM
  const yAfterHeader = await addBNRMHeader(doc);
  let yPos = yAfterHeader + 10;
  
  // Titre
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('LETTRE DE REFUS DE RÉSERVATION', 105, yPos, { align: 'center' });
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
  const objectText = `Refus de réservation d'espace pour ${booking.activity_type}`;
  doc.text(objectText, 20, yPos);
  yPos += 12;
  
  // Corps de la lettre
  const bodyText = [
    'Madame, Monsieur,',
    '',
    `Nous accusons réception de votre demande de réservation de l'espace "${space?.name || 'Non spécifié'}"`,
    `pour la période du ${new Date(booking.start_date).toLocaleDateString('fr-FR')} au ${new Date(booking.end_date).toLocaleDateString('fr-FR')}.`,
    '',
    'Après étude de votre dossier, nous sommes au regret de vous informer que nous ne pouvons',
    'donner suite favorable à votre demande pour les raisons suivantes:',
    ''
  ];
  
  doc.setFontSize(11);
  bodyText.forEach(line => {
    doc.text(line, 20, yPos);
    yPos += 6;
  });
  
  // Raison du refus
  if (rejectionReason) {
    const splitReason = doc.splitTextToSize(rejectionReason, 170);
    doc.text(splitReason, 25, yPos);
    yPos += splitReason.length * 6 + 10;
  } else {
    const defaultReason = [
      '- Indisponibilité de l\'espace pour les dates demandées',
      '- Non-conformité de l\'activité proposée avec le règlement intérieur',
      '- Dossier incomplet'
    ];
    defaultReason.forEach(reason => {
      doc.text(reason, 25, yPos);
      yPos += 6;
    });
    yPos += 10;
  }
  
  // Formule de politesse
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }
  
  const closingText = [
    'Nous vous remercions de l\'intérêt que vous portez à notre établissement et restons',
    'à votre disposition pour toute autre demande.',
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
  
  doc.save(`refus_${booking.booking_number}.pdf`);
};

/**
 * Génère un contrat de réservation en PDF
 */
export const generateContract = async (booking: Booking, space?: Space, contractNumber?: string) => {
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
  doc.text(`Contrat N°: ${contractNumber || booking.booking_number}`, 20, yPos);
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
  
  doc.save(`contrat_${contractNumber || booking.booking_number}.pdf`);
};

/**
 * Génère une facture en PDF
 */
export const generateInvoice = async (booking: Booking, space?: Space, invoiceNumber?: string) => {
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
  doc.text(`Facture N°: ${invoiceNumber || booking.booking_number}`, 20, yPos);
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
  
  doc.save(`facture_${invoiceNumber || booking.booking_number}.pdf`);
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
  
  // Éléments communs pour les deux tableaux
  const elements = [
    'Sols et revêtements',
    'Murs et peintures',
    'Plafonds',
    'Éclairage',
    'Climatisation/Chauffage',
    'Mobilier',
    'Équipements audiovisuels',
    'Sanitaires',
    'Issues de secours',
    'Propreté générale'
  ];
  
  // Fonction pour dessiner une case à cocher
  const drawCheckbox = (x: number, y: number) => {
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.rect(x, y, 4, 4);
  };
  
  // Tableau État des lieux d'entrée
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text("ÉTAT DES LIEUX D'ENTRÉE", 20, yPos);
  yPos += 7;
  
  const startYEntree = yPos;
  autoTable(doc, {
    startY: yPos,
    head: [['Élément', 'Bon', 'Moyen', 'Mauvais', 'Observations']],
    body: elements.map(element => [element, '', '', '', '']),
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: 'center' },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 60 }
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index >= 1 && data.column.index <= 3) {
        const cellCenter = data.cell.x + data.cell.width / 2;
        const cellMiddle = data.cell.y + data.cell.height / 2;
        drawCheckbox(cellCenter - 2, cellMiddle - 2);
      }
    }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Vérifier si on doit ajouter une nouvelle page
  if (yPos > 200) {
    addBNRMFooter(doc, 1);
    doc.addPage();
    const yAfterHeader2 = await addBNRMHeader(doc);
    yPos = yAfterHeader2 + 10;
  }
  
  // Tableau État des lieux de sortie
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text("ÉTAT DES LIEUX DE SORTIE", 20, yPos);
  yPos += 7;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Élément', 'Bon', 'Moyen', 'Mauvais', 'Observations']],
    body: elements.map(element => [element, '', '', '', '']),
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: 'center' },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 60 }
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index >= 1 && data.column.index <= 3) {
        const cellCenter = data.cell.x + data.cell.width / 2;
        const cellMiddle = data.cell.y + data.cell.height / 2;
        drawCheckbox(cellCenter - 2, cellMiddle - 2);
      }
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
