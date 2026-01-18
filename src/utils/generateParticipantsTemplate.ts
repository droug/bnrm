import * as XLSX from "xlsx";

export async function generateParticipantsTemplate() {
  const headers = [
    "Nom complet *",
    "Fonction",
    "Email *",
    "Téléphone",
    "Remarques",
  ];

  const exampleRows: (string | number)[][] = [
    [
      "Exemple: Ahmed BENJELLOUN",
      "Bibliothécaire",
      "ahmed.benjelloun@exemple.ma",
      612345678,
      "",
    ],
    [
      "Exemple: Fatima ALAOUI",
      "Responsable catalogage",
      "fatima.alaoui@exemple.ma",
      687654321,
      "",
    ],
  ];

  const emptyRows: (string | number)[][] = Array.from({ length: 50 }, () => [
    "",
    "",
    "",
    "",
    "",
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...exampleRows, ...emptyRows]);

  // Largeurs de colonnes (approx. similaire à ExcelJS)
  ws["!cols"] = [
    { wch: 25 },
    { wch: 25 },
    { wch: 30 },
    { wch: 20 },
    { wch: 30 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Liste des participants");

  // Téléchargement
  XLSX.writeFile(wb, "canevas_participants_formation.xlsx");
}
