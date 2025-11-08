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

  // Ajouter des lignes d'exemple avec apostrophe pour forcer le format texte sur le téléphone
  const data = [
    headers,
    ['Exemple: Ahmed BENJELLOUN', 'Bibliothécaire', 'ahmed.benjelloun@exemple.ma', '+212 6XX XXX XXX', ''],
    ['Exemple: Fatima ALAOUI', 'Responsable catalogage', 'fatima.alaoui@exemple.ma', '+212 6XX XXX XXX', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
  ];

  // Créer la feuille
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Forcer le format texte pour la colonne Téléphone (colonne D)
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    const cellAddress = XLSX.utils.encode_cell({ r: R, c: 3 }); // colonne D (index 3)
    if (ws[cellAddress]) {
      ws[cellAddress].z = '@'; // Format texte
      ws[cellAddress].t = 's'; // Type string
    }
  }

  // Définir les largeurs des colonnes
  ws['!cols'] = [
    { wch: 25 }, // Nom complet
    { wch: 25 }, // Fonction
    { wch: 30 }, // Email
    { wch: 20 }, // Téléphone
    { wch: 30 }, // Remarques
  ];

  // Ajouter un style aux en-têtes (seulement pour la première ligne)
  const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + "1";
    if (!ws[address]) continue;
    
    // Créer un objet de style basique (XLSX ne supporte pas tous les styles dans tous les formats)
    ws[address].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "CCCCCC" } }
    };
  }

  // Ajouter la feuille au workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Liste des participants');

  // Générer le fichier
  XLSX.writeFile(wb, 'canevas_participants_formation.xlsx', { 
    bookType: 'xlsx',
    cellStyles: true 
  });
}
