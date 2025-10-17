import jsPDF from 'jspdf';
import logoHeader from "@/assets/logo-header-report.png";

/**
 * Ajoute l'en-tête officiel BNRM à un document PDF
 * @param doc - Instance jsPDF
 * @param yPosition - Position Y où placer l'en-tête (par défaut: 10)
 * @returns Promise qui se résout avec la hauteur de l'en-tête ajouté
 */
export const addBNRMHeader = (doc: jsPDF, yPosition: number = 10): Promise<number> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const headerHeight = 30; // Hauteur fixe pour l'en-tête
      const headerWidth = 180; // Largeur de l'en-tête
      const xPosition = (pageWidth - headerWidth) / 2; // Centrer l'en-tête
      
      doc.addImage(img, 'PNG', xPosition, yPosition, headerWidth, headerHeight);
      resolve(headerHeight + yPosition + 5); // Retourne la position Y après l'en-tête + marge
    };
    img.onerror = () => {
      console.error('Erreur lors du chargement de l\'en-tête BNRM');
      resolve(yPosition); // Continuer même si l'image ne charge pas
    };
    img.src = logoHeader;
  });
};

/**
 * Ajoute un pied de page avec le numéro de page
 * @param doc - Instance jsPDF
 * @param pageNumber - Numéro de la page
 */
export const addBNRMFooter = (doc: jsPDF, pageNumber: number) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(
    `Page ${pageNumber}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
  
  // Ligne de séparation
  doc.setDrawColor(200);
  doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);
};
