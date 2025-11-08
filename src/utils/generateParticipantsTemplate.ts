import * as XLSX from 'xlsx';

export function generateParticipantsTemplate() {
  // Créer un nouveau workbook
  const wb = XLSX.utils.book_new();

  // Définir les en-têtes
  const headers = [
    'Nom complet *',
    'Fonction',
    'Email *',
    'Téléphone',
    'Remarques'
  ];

  // Créer une feuille vide d'abord
  const ws = XLSX.utils.aoa_to_sheet([]);
  
  // Pré-formater TOUTE la colonne Téléphone (colonne D, index 3) en format texte
  // Cela doit être fait AVANT d'ajouter les données
  const sheetRange = { s: { r: 0, c: 0 }, e: { r: 100, c: 4 } };
  ws['!ref'] = XLSX.utils.encode_range(sheetRange);
  
  for (let R = 0; R <= 100; ++R) {
    const cellAddress = XLSX.utils.encode_cell({ r: R, c: 3 }); // colonne D (Téléphone)
    ws[cellAddress] = { t: 's', v: '', z: '@' }; // Format texte
  }

  // Maintenant ajouter les données (sans apostrophe car le format est déjà texte)
  const data = [
    headers,
    ['Exemple: Ahmed BENJELLOUN', 'Bibliothécaire', 'ahmed.benjelloun@exemple.ma', '+212 6XX XXX XXX', ''],
    ['Exemple: Fatima ALAOUI', 'Responsable catalogage', 'fatima.alaoui@exemple.ma', '+212 6XX XXX XXX', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
  ];

  // Ajouter les données manuellement pour préserver le format texte
  data.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
      if (colIndex === 3) { // Colonne Téléphone
        ws[cellAddress] = { t: 's', v: cell, z: '@' };
      } else {
        ws[cellAddress] = { v: cell };
      }
    });
  });

  // Définir les largeurs des colonnes
  ws['!cols'] = [
    { wch: 25 }, // Nom complet
    { wch: 25 }, // Fonction
    { wch: 30 }, // Email
    { wch: 20 }, // Téléphone
    { wch: 30 }, // Remarques
  ];

  // Ajouter un style aux en-têtes
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + "1";
    if (!ws[address]) continue;
    
    ws[address].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "CCCCCC" } }
    };
  }

  // Ajouter la feuille au workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Liste des participants');

  // Générer le fichier avec les options pour préserver le format texte
  XLSX.writeFile(wb, 'canevas_participants_formation.xlsx', { 
    bookType: 'xlsx',
    cellStyles: true,
    bookSST: false,
    type: 'binary'
  });
}
