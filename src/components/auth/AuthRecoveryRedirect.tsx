import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Ensures password-recovery links always land on the reset-password UI.
 *
 * Some environments (or Supabase URL allowlists) can end up redirecting recovery
 * links to the site root (/) instead of /auth?reset=true.
 *
 * When Supabase detects a recovery session, it emits the PASSWORD_RECOVERY event.
 * We then route the user to /auth?reset=true to show the password creation UI.
 */
export function AuthRecoveryRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "PASSWORD_RECOVERY") return;

      const alreadyOnReset = location.pathname === "/auth" && new URLSearchParams(location.search).get("reset") === "true";
      if (alreadyOnReset) return;

      // Navigate AFTER Supabase has processed the URL tokens.
      setTimeout(() => {
        navigate("/auth?reset=true", { replace: true });
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname, location.search]);

  return null;
}
