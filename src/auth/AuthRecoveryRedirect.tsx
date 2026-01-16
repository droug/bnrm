import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AUTH_ENTRY_SNAPSHOT_KEY } from "./urlSnapshot";

/**
 * AuthRecoveryRedirect listens for PASSWORD_RECOVERY events from Supabase
 * and redirects users to the password creation page.
 * 
 * This component should be mounted at the app root level to catch recovery events
 * before any other routing logic processes them.
 */
export function AuthRecoveryRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we have a snapshot from the entry URL
    try {
      const snapshot = sessionStorage.getItem(AUTH_ENTRY_SNAPSHOT_KEY);
      if (snapshot) {
        const parsed = JSON.parse(snapshot);
        const isRecovery = 
          parsed.href?.includes("type=recovery") || 
          parsed.hash?.includes("type=recovery");
        
        if (isRecovery && location.pathname !== "/auth") {
          // Clear the snapshot so we don't redirect again
          sessionStorage.removeItem(AUTH_ENTRY_SNAPSHOT_KEY);
          navigate("/auth?reset=true", { replace: true });
          return;
        }
      }
    } catch {
      // Ignore parsing errors
    }

    // Also check current URL for recovery tokens
    const hash = window.location.hash;
    const href = window.location.href;
    
    if (
      (hash.includes("type=recovery") || href.includes("type=recovery")) &&
      location.pathname !== "/auth"
    ) {
      navigate("/auth?reset=true", { replace: true });
      return;
    }

    // Listen for PASSWORD_RECOVERY event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // Redirect to password reset page
        navigate("/auth?reset=true", { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return null;
}
