import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: any | null;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            
            // Fetch user role from user_roles table
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .order('granted_at', { ascending: false })
              .limit(1)
              .single();
            
            // Combine profile with role
            setProfile({
              ...profileData,
              role: roleData?.role || 'visitor'
            });
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("AuthProvider - Initial session:", session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log("AuthProvider - Fetching profile for user:", session.user.id);
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          console.log("AuthProvider - Profile query result:", { profileData, error });
          
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .order('granted_at', { ascending: false })
            .limit(1)
            .single();
          
          setProfile({
            ...profileData,
            role: roleData?.role || 'visitor'
          });
        } catch (err) {
          console.error("AuthProvider - Error fetching profile:", err);
          setProfile(null);
        }
      } else {
        console.log("AuthProvider - No session, setting profile to null");
        setProfile(null);
      }
      
      setLoading(false);
    }).catch((err) => {
      console.error("AuthProvider - getSession failed:", err);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    // Validate password strength
    const { validatePassword } = await import("@/lib/passwordValidation");
    const validation = validatePassword(password);
    if (!validation.valid) {
      const message = "Le mot de passe ne respecte pas les critères requis : " + validation.errors.join(", ");
      toast.error("Mot de passe invalide", { description: message });
      return { error: { message } };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: userData
      }
    });

    if (error) {
      toast.error("Erreur d'inscription", {
        description: error.message,
      });
    } else {
      toast.success("Inscription réussie", {
        description: "Veuillez vérifier votre email pour confirmer votre compte.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Erreur de connexion", {
        description: error.message,
      });
    } else {
      toast.success("Connexion réussie", {
        description: "Bienvenue sur le portail BNRM !",
      });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion", {
      description: "Vous avez été déconnecté avec succès.",
    });
  };

  const updateProfile = async (data: any) => {
    if (!user) return { error: new Error("Non connecté") };

    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('user_id', user.id);

    if (error) {
      toast.error("Erreur de mise à jour", {
        description: error.message,
      });
    } else {
      toast.success("Profil mis à jour", {
        description: "Vos informations ont été sauvegardées.",
      });
      // Refresh profile
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      // Fetch user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .order('granted_at', { ascending: false })
        .limit(1)
        .single();
      
      // Combine profile with role
      setProfile({
        ...updatedProfile,
        role: roleData?.role || 'visitor'
      });
    }

    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      profile,
      signUp,
      signIn,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}