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

  // Ajouter des lignes d'exemple
  // Important: Les numéros de téléphone sont préfixés avec ' pour forcer le format texte dans Excel
  const data = [
    headers,
    ['Exemple: Ahmed BENJELLOUN', 'Bibliothécaire', 'ahmed.benjelloun@exemple.ma', '\'+212 6XX XXX XXX', ''],
    ['Exemple: Fatima ALAOUI', 'Responsable catalogage', 'fatima.alaoui@exemple.ma', '\'+212 6XX XXX XXX', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
  ];

  // Créer la feuille
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Forcer TOUTE la colonne Téléphone (colonne D, index 3) en format texte
  // Cela inclut les cellules vides pour que Excel comprenne que c'est du texte
  for (let R = 0; R <= 100; ++R) { // Format les 100 premières lignes
    const cellAddress = XLSX.utils.encode_cell({ r: R, c: 3 }); // colonne D
    if (!ws[cellAddress]) {
      ws[cellAddress] = { t: 's', v: '' }; // Créer une cellule vide en format texte
    }
    ws[cellAddress].t = 's'; // Type string
    ws[cellAddress].z = '@'; // Format texte Excel
  }

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
