import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SystemListDefinition {
  list_code: string;
  list_name: string;
  module: string;
  form_name: string;
  field_type: string;
  description: string;
  values: Array<{
    value_code: string;
    value_label: string;
    sort_order: number;
  }>;
}

// Définitions des listes système pour les 4 types de dépôt légal
const LEGAL_DEPOSIT_LISTS: SystemListDefinition[] = [
  // ========== MONOGRAPHIES ==========
  {
    list_code: "mono_type_publication",
    list_name: "Type de publication (Monographies)",
    module: "Dépôt Légal",
    form_name: "Monographies",
    field_type: "simple",
    description: "Type de publication pour les monographies",
    values: [
      { value_code: "LIV", value_label: "Livre", sort_order: 1 },
      { value_code: "THE", value_label: "Thèse", sort_order: 2 },
      { value_code: "MEM", value_label: "Mémoire", sort_order: 3 },
      { value_code: "RAP", value_label: "Rapport", sort_order: 4 },
    ],
  },
  {
    list_code: "mono_nature_publication",
    list_name: "Nature de publication (Monographies)",
    module: "Dépôt Légal",
    form_name: "Monographies",
    field_type: "simple",
    description: "Nature de la publication pour les monographies",
    values: [
      { value_code: "initial", value_label: "Initial", sort_order: 1 },
      { value_code: "reedition", value_label: "Réédition", sort_order: 2 },
      { value_code: "nouvelle_edition", value_label: "Nouvelle édition", sort_order: 3 },
    ],
  },
  {
    list_code: "mono_type_auteur",
    list_name: "Type d'auteur (Monographies)",
    module: "Dépôt Légal",
    form_name: "Monographies",
    field_type: "simple",
    description: "Type d'auteur pour les monographies",
    values: [
      { value_code: "physique", value_label: "Personne physique", sort_order: 1 },
      { value_code: "morale", value_label: "Personne morale", sort_order: 2 },
    ],
  },
  {
    list_code: "mono_genre",
    list_name: "Genre (Monographies)",
    module: "Dépôt Légal",
    form_name: "Monographies",
    field_type: "simple",
    description: "Genre de l'auteur physique",
    values: [
      { value_code: "masculin", value_label: "Masculin", sort_order: 1 },
      { value_code: "feminin", value_label: "Féminin", sort_order: 2 },
    ],
  },
  {
    list_code: "mono_statut_auteur",
    list_name: "Statut de l'auteur (Monographies)",
    module: "Dépôt Légal",
    form_name: "Monographies",
    field_type: "simple",
    description: "Statut de l'auteur moral",
    values: [
      { value_code: "association", value_label: "Association", sort_order: 1 },
      { value_code: "entreprise", value_label: "Entreprise", sort_order: 2 },
      { value_code: "institution", value_label: "Institution publique", sort_order: 3 },
      { value_code: "ong", value_label: "ONG", sort_order: 4 },
    ],
  },

  // ========== PUBLICATIONS PÉRIODIQUES ==========
  {
    list_code: "period_type_publication",
    list_name: "Type de publication (Périodiques)",
    module: "Dépôt Légal",
    form_name: "Publications périodiques",
    field_type: "simple",
    description: "Type de publication pour les périodiques",
    values: [
      { value_code: "journal", value_label: "Journal", sort_order: 1 },
      { value_code: "revue", value_label: "Revue", sort_order: 2 },
      { value_code: "monographie_simple", value_label: "Monographie simple", sort_order: 3 },
    ],
  },
  {
    list_code: "period_nature_publication",
    list_name: "Nature de publication (Périodiques)",
    module: "Dépôt Légal",
    form_name: "Publications périodiques",
    field_type: "simple",
    description: "Nature de la publication périodique",
    values: [
      { value_code: "etatique", value_label: "Étatique", sort_order: 1 },
      { value_code: "non-etatique", value_label: "Non étatique", sort_order: 2 },
    ],
  },
  {
    list_code: "period_type_support",
    list_name: "Type de support (Périodiques)",
    module: "Dépôt Légal",
    form_name: "Publications périodiques",
    field_type: "simple",
    description: "Type de support pour les périodiques",
    values: [
      { value_code: "printed", value_label: "Imprimé", sort_order: 1 },
      { value_code: "electronic", value_label: "Électronique", sort_order: 2 },
    ],
  },
  {
    list_code: "period_periodicite",
    list_name: "Périodicité (Périodiques)",
    module: "Dépôt Légal",
    form_name: "Publications périodiques",
    field_type: "simple",
    description: "Fréquence de parution des périodiques",
    values: [
      { value_code: "quotidien", value_label: "Quotidien", sort_order: 1 },
      { value_code: "hebdomadaire", value_label: "Hebdomadaire", sort_order: 2 },
      { value_code: "bimensuel", value_label: "Bimensuel", sort_order: 3 },
      { value_code: "mensuel", value_label: "Mensuel", sort_order: 4 },
      { value_code: "trimestriel", value_label: "Trimestriel", sort_order: 5 },
      { value_code: "semestriel", value_label: "Semestriel", sort_order: 6 },
      { value_code: "annuel", value_label: "Annuel", sort_order: 7 },
    ],
  },
  {
    list_code: "period_region",
    list_name: "Région (Périodiques)",
    module: "Dépôt Légal",
    form_name: "Publications périodiques",
    field_type: "simple",
    description: "Région du directeur de publication",
    values: [
      { value_code: "tanger_tetouan_hoceima", value_label: "Tanger-Tétouan-Al Hoceïma", sort_order: 1 },
      { value_code: "oriental", value_label: "L'Oriental", sort_order: 2 },
      { value_code: "fes_meknes", value_label: "Fès-Meknès", sort_order: 3 },
      { value_code: "rabat_sale_kenitra", value_label: "Rabat-Salé-Kénitra", sort_order: 4 },
      { value_code: "beni_mellal_khenifra", value_label: "Béni Mellal-Khénifra", sort_order: 5 },
      { value_code: "casablanca_settat", value_label: "Casablanca-Settat", sort_order: 6 },
      { value_code: "marrakech_safi", value_label: "Marrakech-Safi", sort_order: 7 },
      { value_code: "draa_tafilalet", value_label: "Drâa-Tafilalet", sort_order: 8 },
      { value_code: "souss_massa", value_label: "Souss-Massa", sort_order: 9 },
      { value_code: "guelmim_oued_noun", value_label: "Guelmim-Oued Noun", sort_order: 10 },
      { value_code: "laayoune_sakia_hamra", value_label: "Laâyoune-Sakia El Hamra", sort_order: 11 },
      { value_code: "dakhla_oued_eddahab", value_label: "Dakhla-Oued Ed-Dahab", sort_order: 12 },
    ],
  },

  // ========== BASES DE DONNÉES & LOGICIELS ==========
  {
    list_code: "bd_type_publication",
    list_name: "Type de publication (BD & Logiciels)",
    module: "Dépôt Légal",
    form_name: "BD & Logiciels",
    field_type: "simple",
    description: "Type de publication pour bases de données et logiciels",
    values: [
      { value_code: "database", value_label: "Base de données", sort_order: 1 },
      { value_code: "software", value_label: "Logiciel", sort_order: 2 },
      { value_code: "audiovisual", value_label: "Document audiovisuel", sort_order: 3 },
    ],
  },
  {
    list_code: "bd_nature_publication",
    list_name: "Nature de publication (BD & Logiciels)",
    module: "Dépôt Légal",
    form_name: "BD & Logiciels",
    field_type: "simple",
    description: "Nature de la publication numérique",
    values: [
      { value_code: "initial", value_label: "Initial", sort_order: 1 },
      { value_code: "mise_a_jour", value_label: "Mise à jour", sort_order: 2 },
      { value_code: "nouvelle_version", value_label: "Nouvelle version", sort_order: 3 },
    ],
  },
  {
    list_code: "bd_type_support",
    list_name: "Type de support (BD & Logiciels)",
    module: "Dépôt Légal",
    form_name: "BD & Logiciels",
    field_type: "simple",
    description: "Support de diffusion",
    values: [
      { value_code: "online", value_label: "En ligne", sort_order: 1 },
      { value_code: "cdrom", value_label: "CD-ROM", sort_order: 2 },
      { value_code: "dvd", value_label: "DVD", sort_order: 3 },
      { value_code: "usb", value_label: "Clé USB", sort_order: 4 },
    ],
  },

  // ========== COLLECTIONS SPÉCIALISÉES ==========
  {
    list_code: "coll_type_publication",
    list_name: "Type de publication (Collections Spécialisées)",
    module: "Dépôt Légal",
    form_name: "Collections Spécialisées",
    field_type: "simple",
    description: "Type de publication pour collections spécialisées",
    values: [
      { value_code: "carte", value_label: "Carte géographique", sort_order: 1 },
      { value_code: "partition", value_label: "Partition musicale", sort_order: 2 },
      { value_code: "affiche", value_label: "Affiche", sort_order: 3 },
      { value_code: "estampe", value_label: "Estampe", sort_order: 4 },
      { value_code: "photographie", value_label: "Photographie", sort_order: 5 },
    ],
  },
  {
    list_code: "coll_nature_support",
    list_name: "Nature du support (Collections Spécialisées)",
    module: "Dépôt Légal",
    form_name: "Collections Spécialisées",
    field_type: "simple",
    description: "Nature physique du support",
    values: [
      { value_code: "papier", value_label: "Papier", sort_order: 1 },
      { value_code: "toile", value_label: "Toile", sort_order: 2 },
      { value_code: "numerique", value_label: "Numérique", sort_order: 3 },
      { value_code: "autre", value_label: "Autre", sort_order: 4 },
    ],
  },

  // ========== LISTES COMMUNES ==========
  {
    list_code: "common_type_support",
    list_name: "Type de support (Commun)",
    module: "Dépôt Légal",
    form_name: "Commun",
    field_type: "simple",
    description: "Type de support utilisé pour tous les formulaires",
    values: [
      { value_code: "printed", value_label: "Imprimé", sort_order: 1 },
      { value_code: "electronic", value_label: "Électronique", sort_order: 2 },
      { value_code: "mixed", value_label: "Mixte", sort_order: 3 },
    ],
  },
];

export const SystemListsSyncButton = () => {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      let listsCreated = 0;
      let valuesCreated = 0;

      for (const listDef of LEGAL_DEPOSIT_LISTS) {
        // Vérifier si la liste existe déjà
        const { data: existingList } = await supabase
          .from("system_lists")
          .select("id")
          .eq("list_code", listDef.list_code)
          .single();

        let listId: string;

        if (existingList) {
          listId = existingList.id;
          
          // Mettre à jour les métadonnées de la liste
          await supabase
            .from("system_lists")
            .update({
              list_name: listDef.list_name,
              module: listDef.module,
              form_name: listDef.form_name,
              field_type: listDef.field_type,
              description: listDef.description,
            })
            .eq("id", listId);
        } else {
          // Créer la nouvelle liste
          const { data: newList, error: listError } = await supabase
            .from("system_lists")
            .insert({
              list_code: listDef.list_code,
              list_name: listDef.list_name,
              module: listDef.module,
              form_name: listDef.form_name,
              field_type: listDef.field_type,
              description: listDef.description,
            })
            .select("id")
            .single();

          if (listError) throw listError;
          listId = newList.id;
          listsCreated++;
        }

        // Synchroniser les valeurs
        for (const valueDef of listDef.values) {
          const { data: existingValue } = await supabase
            .from("system_list_values")
            .select("id")
            .eq("list_id", listId)
            .eq("value_code", valueDef.value_code)
            .single();

          if (existingValue) {
            // Mettre à jour la valeur existante
            await supabase
              .from("system_list_values")
              .update({
                value_label: valueDef.value_label,
                sort_order: valueDef.sort_order,
              })
              .eq("id", existingValue.id);
          } else {
            // Créer la nouvelle valeur
            const { error: valueError } = await supabase
              .from("system_list_values")
              .insert({
                list_id: listId,
                value_code: valueDef.value_code,
                value_label: valueDef.value_label,
                sort_order: valueDef.sort_order,
              });

            if (valueError) throw valueError;
            valuesCreated++;
          }
        }
      }

      toast({
        title: "✅ Synchronisation réussie",
        description: `${listsCreated} listes créées, ${valuesCreated} valeurs ajoutées`,
      });
    } catch (error: any) {
      console.error("Erreur lors de la synchronisation:", error);
      toast({
        title: "❌ Erreur de synchronisation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={syncing}
      className="w-full"
      size="lg"
    >
      <RefreshCw className={`h-5 w-5 mr-2 ${syncing ? "animate-spin" : ""}`} />
      {syncing ? "Synchronisation en cours..." : "Synchroniser toutes les listes déroulantes"}
    </Button>
  );
};
