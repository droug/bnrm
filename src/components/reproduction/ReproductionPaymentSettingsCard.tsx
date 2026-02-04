import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CreditCard, Landmark, Store, Save, Loader2 } from "lucide-react";

type ReproductionPaymentSettings = {
  stripe: {
    enabled: boolean;
  };
  virement: {
    enabled: boolean;
    bank_name: string;
    rib: string;
    proof_email: string;
    object_prefix: string;
  };
  espece: {
    enabled: boolean;
    address: string;
    hours: string;
  };
};

const DEFAULT_SETTINGS: ReproductionPaymentSettings = {
  stripe: { enabled: true },
  virement: {
    enabled: true,
    bank_name: "Trésorerie Générale du Royaume",
    rib: "310 780 1001 0009 7500 0000 01",
    proof_email: "reproduction@bnrm.ma",
    object_prefix: "Reproduction",
  },
  espece: {
    enabled: true,
    address: "Avenue Ibn Khaldoun, Rabat",
    hours: "Du lundi au vendredi, 9h00 - 16h00",
  },
};

const PARAM_KEY = "reproduction_payment_settings";

function safeParseSettings(raw: unknown): ReproductionPaymentSettings {
  if (typeof raw !== "string" || raw.trim() === "") return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw);
    return {
      stripe: { enabled: !!parsed?.stripe?.enabled },
      virement: {
        enabled: parsed?.virement?.enabled !== false,
        bank_name: String(parsed?.virement?.bank_name ?? DEFAULT_SETTINGS.virement.bank_name),
        rib: String(parsed?.virement?.rib ?? DEFAULT_SETTINGS.virement.rib),
        proof_email: String(parsed?.virement?.proof_email ?? DEFAULT_SETTINGS.virement.proof_email),
        object_prefix: String(parsed?.virement?.object_prefix ?? DEFAULT_SETTINGS.virement.object_prefix),
      },
      espece: {
        enabled: parsed?.espece?.enabled !== false,
        address: String(parsed?.espece?.address ?? DEFAULT_SETTINGS.espece.address),
        hours: String(parsed?.espece?.hours ?? DEFAULT_SETTINGS.espece.hours),
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function ReproductionPaymentSettingsCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ReproductionPaymentSettings>(DEFAULT_SETTINGS);

  const settingsJson = useMemo(() => JSON.stringify(settings), [settings]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("bnrm_parametres")
          .select("valeur")
          .eq("parametre", PARAM_KEY)
          .maybeSingle();

        if (error) throw error;
        if (!mounted) return;
        setSettings(safeParseSettings(data?.valeur));
      } catch (e) {
        console.error("Error loading reproduction payment settings:", e);
        toast.error("Erreur lors du chargement des paramètres de paiement");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("bnrm_parametres")
        .upsert(
          {
            parametre: PARAM_KEY,
            valeur: settingsJson,
            commentaire: `Paramètres paiement reproduction - ${new Date().toISOString()}`,
          } as any,
          { onConflict: "parametre" }
        );

      if (error) throw error;
      toast.success("Paramètres de paiement enregistrés");
    } catch (e) {
      console.error("Error saving reproduction payment settings:", e);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Paramétrage du service de paiement
        </CardTitle>
        <CardDescription>
          Configurez les options affichées dans l'email « En attente de paiement » (carte, virement, sur place).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement des paramètres…
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-medium">
                    <CreditCard className="h-4 w-4" /> Carte (Stripe)
                  </div>
                  <p className="text-xs text-muted-foreground">Lien « Payer maintenant »</p>
                </div>
                <Switch
                  checked={settings.stripe.enabled}
                  onCheckedChange={(checked) =>
                    setSettings((s) => ({ ...s, stripe: { ...s.stripe, enabled: checked } }))
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-medium">
                    <Landmark className="h-4 w-4" /> Virement
                  </div>
                  <p className="text-xs text-muted-foreground">RIB + email justificatif</p>
                </div>
                <Switch
                  checked={settings.virement.enabled}
                  onCheckedChange={(checked) =>
                    setSettings((s) => ({ ...s, virement: { ...s.virement, enabled: checked } }))
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-medium">
                    <Store className="h-4 w-4" /> Sur place
                  </div>
                  <p className="text-xs text-muted-foreground">Adresse + horaires</p>
                </div>
                <Switch
                  checked={settings.espece.enabled}
                  onCheckedChange={(checked) =>
                    setSettings((s) => ({ ...s, espece: { ...s.espece, enabled: checked } }))
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Banque (virement)</Label>
                  <Input
                    value={settings.virement.bank_name}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        virement: { ...s.virement, bank_name: e.target.value },
                      }))
                    }
                    placeholder="Nom de la banque"
                  />
                </div>

                <div className="space-y-2">
                  <Label>RIB</Label>
                  <Input
                    value={settings.virement.rib}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        virement: { ...s.virement, rib: e.target.value },
                      }))
                    }
                    placeholder="RIB"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email justificatif (virement)</Label>
                  <Input
                    type="email"
                    value={settings.virement.proof_email}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        virement: { ...s.virement, proof_email: e.target.value },
                      }))
                    }
                    placeholder="reproduction@bnrm.ma"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Préfixe objet (virement)</Label>
                  <Input
                    value={settings.virement.object_prefix}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        virement: { ...s.virement, object_prefix: e.target.value },
                      }))
                    }
                    placeholder="Reproduction"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Adresse (paiement sur place)</Label>
                  <Textarea
                    value={settings.espece.address}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        espece: { ...s.espece, address: e.target.value },
                      }))
                    }
                    rows={3}
                    placeholder="Adresse"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Horaires (paiement sur place)</Label>
                  <Textarea
                    value={settings.espece.hours}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        espece: { ...s.espece, hours: e.target.value },
                      }))
                    }
                    rows={3}
                    placeholder="Horaires"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={save} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
