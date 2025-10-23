import jsPDF from "jspdf";
import logoHeader from "@/assets/logo-header-report.png";

/**
 * Ajoute l'en-tête officiel BNRM à un document PDF
 * @param doc - Instance jsPDF
 * @param title - Titre du document (optionnel)
 * @returns Position Y après l'en-tête
 */
export const addBNRMHeaderToPDF = (doc: jsPDF, title?: string): number => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Logo en haut
  const img = new Image();
  img.src = logoHeader;
  doc.addImage(img, 'PNG', 15, 10, 180, 30);
  
  // Ligne de séparation
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.5);
  doc.line(15, 45, pageWidth - 15, 45);
  
  let yPos = 55;
  
  // Titre du document si fourni
  if (title) {
    doc.setFontSize(18);
    doc.setTextColor(41, 128, 185);
    doc.text(title, 14, yPos);
    yPos += 15;
    
    // Réinitialiser la couleur du texte
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
  }
  
  return yPos;
};

/**
 * Ajoute un pied de page standard BNRM
 * @param doc - Instance jsPDF
 * @param pageNumber - Numéro de page
 */
export const addBNRMFooterToPDF = (doc: jsPDF, pageNumber: number): void => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  
  // Ligne de séparation en bas
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
  
  // Texte du pied de page
  doc.text(
    "Bibliothèque Nationale du Royaume du Maroc",
    pageWidth / 2,
    pageHeight - 15,
    { align: "center" }
  );
  
  doc.text(
    `Page ${pageNumber}`,
    pageWidth - 20,
    pageHeight - 15,
    { align: "right" }
  );
  
  // Réinitialiser les couleurs
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
};
