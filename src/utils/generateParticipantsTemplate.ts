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

  // Définir les largeurs des colonnes
  ws['!cols'] = [
    { wch: 25 }, // Nom complet
    { wch: 25 }, // Fonction
    { wch: 30 }, // Email
    { wch: 20 }, // Téléphone
    { wch: 30 }, // Remarques
  ];

  // Ajouter un style aux en-têtes (seulement pour la première ligne)
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let C = range.s.c; C <= range.e.c; ++C) {
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
  XLSX.writeFile(wb, 'canevas_participants_formation.xlsx');
}
