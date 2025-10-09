import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Users } from "lucide-react";
import { useState } from "react";

export function CreateTestDepositButton() {
  const [loading, setLoading] = useState(false);

  const createTestUsersAndDeposits = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-test-users');

      if (error) throw error;

      if (data.success) {
        toast.success(
          <div className="space-y-2">
            <p className="font-semibold">Utilisateurs et dépôts de test créés !</p>
            <div className="text-sm space-y-1">
              {data.users.map((u: any) => (
                <div key={u.email} className="font-mono text-xs">
                  <div><strong>{u.role}:</strong> {u.email}</div>
                  <div className="text-muted-foreground">Mot de passe: {u.password}</div>
                </div>
              ))}
            </div>
          </div>,
          { duration: 10000 }
        );
        
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (error) {
      console.error("Error creating test users:", error);
      toast.error("Erreur lors de la création des utilisateurs de test");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={createTestUsersAndDeposits} 
      variant="outline" 
      size="sm"
      disabled={loading}
    >
      <Users className="h-4 w-4 mr-2" />
      {loading ? "Création en cours..." : "Créer utilisateurs & dépôts de test"}
    </Button>
  );
}
