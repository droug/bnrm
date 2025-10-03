import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ManuscriptFiltersProps {
  filterInstitution: string;
  setFilterInstitution: (value: string) => void;
  filterLanguage: string;
  setFilterLanguage: (value: string) => void;
  filterPeriod: string;
  setFilterPeriod: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
}

export function ManuscriptFilters({
  filterInstitution,
  setFilterInstitution,
  filterLanguage,
  setFilterLanguage,
  filterPeriod,
  setFilterPeriod,
  filterStatus,
  setFilterStatus,
}: ManuscriptFiltersProps) {
  return (
    <section className="mb-8">
      <div className="flex flex-col md:flex-row gap-4 flex-wrap">
        <Select value={filterInstitution} onValueChange={setFilterInstitution}>
          <SelectTrigger className="w-full md:w-56 h-12 border-2 border-gold/20">
            <SelectValue placeholder="Institution" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les institutions</SelectItem>
            <SelectItem value="BNRM">BNRM</SelectItem>
            <SelectItem value="Bibliothèque Al Quaraouiyine">Al Quaraouiyine</SelectItem>
            <SelectItem value="Archives Royales">Archives Royales</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterLanguage} onValueChange={setFilterLanguage}>
          <SelectTrigger className="w-full md:w-48 h-12 border-2 border-gold/20">
            <SelectValue placeholder="Langue" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les langues</SelectItem>
            <SelectItem value="arabe">Arabe</SelectItem>
            <SelectItem value="français">Français</SelectItem>
            <SelectItem value="berbère">Berbère</SelectItem>
            <SelectItem value="latin">Latin</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPeriod} onValueChange={setFilterPeriod}>
          <SelectTrigger className="w-full md:w-48 h-12 border-2 border-gold/20">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les périodes</SelectItem>
            <SelectItem value="médiéval">Médiéval</SelectItem>
            <SelectItem value="moderne">Moderne</SelectItem>
            <SelectItem value="contemporain">Contemporain</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-48 h-12 border-2 border-gold/20">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="available">Disponible</SelectItem>
            <SelectItem value="digitization">Numérisation</SelectItem>
            <SelectItem value="reserved">Réservé</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
