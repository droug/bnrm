export const moroccanRegions = [
  {
    name: "Tanger-Tétouan-Al Hoceïma",
    cities: [
      "Tanger", "Tétouan", "Al Hoceïma", "Larache", "Ksar El Kébir",
      "Asilah", "Chefchaouen", "Ouezzane", "Fnideq", "M'diq"
    ]
  },
  {
    name: "Oriental",
    cities: [
      "Oujda", "Nador", "Berkane", "Taourirt", "Jerada",
      "Guercif", "Driouch", "Zaïo", "Ahfir"
    ]
  },
  {
    name: "Fès-Meknès",
    cities: [
      "Fès", "Meknès", "Ifrane", "Sefrou", "Taza",
      "El Hajeb", "Moulay Yacoub", "Azrou", "Imouzzer Kandar"
    ]
  },
  {
    name: "Rabat-Salé-Kénitra",
    cities: [
      "Rabat", "Salé", "Kénitra", "Témara", "Skhirat",
      "Khémisset", "Sidi Kacem", "Sidi Slimane", "Tiflet"
    ]
  },
  {
    name: "Béni Mellal-Khénifra",
    cities: [
      "Béni Mellal", "Khénifra", "Khouribga", "Fquih Ben Salah",
      "Azilal", "Kasba Tadla", "Ouled Ayad", "Zaouiat Cheikh"
    ]
  },
  {
    name: "Casablanca-Settat",
    cities: [
      "Casablanca", "Mohammedia", "El Jadida", "Settat", "Berrechid",
      "Benslimane", "Mediouna", "Sidi Bennour", "Nouaceur", "Bouskoura"
    ]
  },
  {
    name: "Marrakech-Safi",
    cities: [
      "Marrakech", "Safi", "Essaouira", "El Kelaa des Sraghna",
      "Youssoufia", "Chichaoua", "Rehamna", "Tamanar"
    ]
  },
  {
    name: "Drâa-Tafilalet",
    cities: [
      "Errachidia", "Ouarzazate", "Midelt", "Tinghir", "Zagora",
      "Goulmima", "Kelaat M'Gouna", "Boumalne Dadès"
    ]
  },
  {
    name: "Souss-Massa",
    cities: [
      "Agadir", "Inezgane", "Tiznit", "Taroudant", "Ouled Teïma",
      "Ait Melloul", "Biougra", "Taliouine", "Massa"
    ]
  },
  {
    name: "Guelmim-Oued Noun",
    cities: [
      "Guelmim", "Tan-Tan", "Sidi Ifni", "Assa", "Zag",
      "Bouizakarne", "Aouinet Lahna"
    ]
  },
  {
    name: "Laâyoune-Sakia El Hamra",
    cities: [
      "Laâyoune", "Boujdour", "Tarfaya", "El Marsa"
    ]
  },
  {
    name: "Dakhla-Oued Ed-Dahab",
    cities: [
      "Dakhla", "Aousserd", "Lagouira"
    ]
  }
];

export const getAllCities = () => {
  return moroccanRegions.flatMap(region => region.cities).sort();
};

export const getCitiesByRegion = (regionName: string) => {
  const region = moroccanRegions.find(r => r.name === regionName);
  return region ? region.cities : [];
};
