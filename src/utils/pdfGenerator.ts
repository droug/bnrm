import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ProgramContributionFormData } from "@/schemas/programContributionSchema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const generateProgramContributionPDF = (
  data: ProgramContributionFormData,
  reference: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header avec logo et titre
  doc.setFillColor(212, 175, 55); // #D4AF37
  doc.rect(0, 0, pageWidth, 35, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("BNRM - Activités Culturelles", pageWidth / 2, 15, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Bibliothèque Nationale du Royaume du Maroc", pageWidth / 2, 25, { align: "center" });

  yPos = 45;

  // Titre du document
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Récapitulatif de Proposition d'Activité Culturelle", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 15;

  // Référence et date
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Référence : ${reference}`, 20, yPos);
  doc.text(`Date : ${format(new Date(), "dd MMMM yyyy", { locale: fr })}`, pageWidth - 20, yPos, { align: "right" });
  
  yPos += 15;

  // Section 1: Informations sur le demandeur
  doc.setFillColor(250, 249, 245); // #FAF9F5
  doc.rect(15, yPos - 5, pageWidth - 30, 10, "F");
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("1. Informations sur le demandeur", 20, yPos);
  
  yPos += 10;

  const demandeurData = [
    ["Nom complet", data.nom_complet],
    ["Type de demandeur", data.type_demandeur],
    ["Email", data.email],
    ["Téléphone", data.telephone],
    ["Organisme", data.organisme || "-"],
    ["Adresse", data.adresse || "-"],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: demandeurData,
    theme: "plain",
    styles: {
      fontSize: 10,
      cellPadding: 3,
      textColor: [51, 51, 51],
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: 120 },
    },
    margin: { left: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Section 2: Proposition d'activité
  doc.setFillColor(250, 249, 245);
  doc.rect(15, yPos - 5, pageWidth - 30, 10, "F");
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("2. Proposition d'activité", 20, yPos);
  
  yPos += 10;

  const propositionData = [
    ["Type d'activité", data.type_activite],
    ["Titre", data.titre],
    ["Public cible", data.public_cible],
    ["Langue", data.langue],
    ["Participants estimés", data.nb_participants_estime?.toString() || "-"],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: propositionData,
    theme: "plain",
    styles: {
      fontSize: 10,
      cellPadding: 3,
      textColor: [51, 51, 51],
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: 120 },
    },
    margin: { left: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 8;

  // Description et objectifs
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 51, 51);
  doc.text("Description :", 20, yPos);
  yPos += 5;
  doc.setFont("helvetica", "normal");
  const descriptionLines = doc.splitTextToSize(data.description, pageWidth - 40);
  doc.text(descriptionLines, 20, yPos);
  yPos += descriptionLines.length * 5 + 5;

  doc.setFont("helvetica", "bold");
  doc.text("Objectifs :", 20, yPos);
  yPos += 5;
  doc.setFont("helvetica", "normal");
  const objectifsLines = doc.splitTextToSize(data.objectifs, pageWidth - 40);
  doc.text(objectifsLines, 20, yPos);
  yPos += objectifsLines.length * 5 + 10;

  // Vérifier si on doit ajouter une nouvelle page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Section 3: Informations logistiques
  doc.setFillColor(250, 249, 245);
  doc.rect(15, yPos - 5, pageWidth - 30, 10, "F");
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("3. Informations logistiques", 20, yPos);
  
  yPos += 10;

  const logistiqueData = [
    ["Date proposée", format(new Date(data.date_proposee), "dd MMMM yyyy", { locale: fr })],
    ["Heure", data.heure_proposee],
    ["Durée", `${data.duree_minutes} minutes`],
    ["Espace souhaité", data.espace_souhaite],
    ["Moyens techniques", data.moyens_techniques?.join(", ") || "-"],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: logistiqueData,
    theme: "plain",
    styles: {
      fontSize: 10,
      cellPadding: 3,
      textColor: [51, 51, 51],
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: 120 },
    },
    margin: { left: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 8;

  if (data.besoins_specifiques) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Besoins spécifiques :", 20, yPos);
    yPos += 5;
    doc.setFont("helvetica", "normal");
    const besoinsLines = doc.splitTextToSize(data.besoins_specifiques, pageWidth - 40);
    doc.text(besoinsLines, 20, yPos);
    yPos += besoinsLines.length * 5 + 10;
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(212, 175, 55);
  doc.rect(0, pageHeight - 20, pageWidth, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Document généré le ${format(new Date(), "dd/MM/yyyy à HH:mm", { locale: fr })}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  // Sauvegarder le PDF
  doc.save(`BNRM_Proposition_${reference}.pdf`);
};
