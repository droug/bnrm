import * as ExcelJS from 'exceljs';

export async function generateParticipantsTemplate() {
  // Créer un nouveau workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Liste des participants');

  // Définir les en-têtes avec style
  const headerRow = worksheet.addRow([
    'Nom complet *',
    'Fonction',
    'Email *',
    'Téléphone',
    'Remarques'
  ]);

  // Style pour les en-têtes
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFCCCCCC' }
  };

  // IMPORTANT: Définir TOUTE la colonne D (Téléphone) comme format texte
  const phoneColumn = worksheet.getColumn(4);
  phoneColumn.numFmt = '@'; // Format texte pour toute la colonne
  
  // Définir les largeurs des colonnes
  worksheet.getColumn(1).width = 25; // Nom complet
  worksheet.getColumn(2).width = 25; // Fonction
  worksheet.getColumn(3).width = 30; // Email
  worksheet.getColumn(4).width = 20; // Téléphone
  worksheet.getColumn(5).width = 30; // Remarques

  // Ajouter des lignes d'exemple - AVEC apostrophe pour forcer le format texte
  const row1 = worksheet.addRow(['Exemple: Ahmed BENJELLOUN', 'Bibliothécaire', 'ahmed.benjelloun@exemple.ma', "'0612345678", '']);
  const row2 = worksheet.addRow(['Exemple: Fatima ALAOUI', 'Responsable catalogage', 'fatima.alaoui@exemple.ma', "'0687654321", '']);
  
  // Ajouter 50 lignes vides - chaque cellule de téléphone commence par une apostrophe
  for (let i = 0; i < 50; i++) {
    const row = worksheet.addRow(['', '', '', "'", '']);
    const phoneCell = row.getCell(4);
    phoneCell.numFmt = '@';
  }

  // Générer et télécharger le fichier
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'canevas_participants_formation.xlsx';
  link.click();
  window.URL.revokeObjectURL(url);
}
