import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { useState } from "react";

export function CreateTestDepositButton() {
  const [loading, setLoading] = useState(false);

  const createTestUsersAndDeposits = async () => {
    setLoading(true);
    
    const testUsers = [
      {
        email: 'editeur.test@bnrm.ma',
        password: 'TestBNRM2025!',
        role: 'editor',
        firstName: 'Ahmed',
        lastName: 'Alami',
        institution: 'Éditions Dar Al Kitab'
      },
      {
        email: 'imprimeur.test@bnrm.ma',
        password: 'TestBNRM2025!',
        role: 'printer',
        firstName: 'Fatima',
        lastName: 'Benani',
        institution: 'Imprimerie Nationale'
      },
      {
        email: 'producteur.test@bnrm.ma',
        password: 'TestBNRM2025!',
        role: 'producer',
        firstName: 'Youssef',
        lastName: 'Fassi',
        institution: 'Productions Atlas Média'
      }
    ];

    try {
      for (const user of testUsers) {
        // Vérifier si l'utilisateur existe déjà
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('first_name', user.firstName)
          .eq('last_name', user.lastName)
          .single();

        if (existingProfile) {
          console.log(`User ${user.email} already exists, skipping...`);
          continue;
        }

        // Créer l'utilisateur via signup
        const { data: authData, error: signupError } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              first_name: user.firstName,
              last_name: user.lastName,
              institution: user.institution
            }
          }
        });

        if (signupError) {
          console.error(`Error creating user ${user.email}:`, signupError);
          continue;
        }

        if (authData.user) {
          // Mettre à jour le profil
          await supabase
            .from('profiles')
            .update({
              institution: user.institution,
              is_approved: true
            })
            .eq('user_id', authData.user.id);

          // Attribuer le rôle
          await supabase
            .from('user_roles')
            .insert([{
              user_id: authData.user.id,
              role: user.role as any
            }]);
        }
      }

      toast.success(
        <div className="space-y-2">
          <p className="font-semibold">Utilisateurs de test créés !</p>
          <div className="text-sm space-y-1">
            {testUsers.map((u) => (
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
