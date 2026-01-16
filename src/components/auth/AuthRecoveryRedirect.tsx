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
    const isRecoveryLikeLink = () => {
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
      const params = new URLSearchParams(hash);
      const type = params.get("type");
      return type === "recovery" || type === "invite";
    };

    const isAlreadyOnReset = () =>
      location.pathname === "/auth" &&
      new URLSearchParams(location.search).get("reset") === "true";

    const goToReset = () => {
      if (isAlreadyOnReset()) return;
      navigate("/auth?reset=true", { replace: true });
    };

    // If we land on / (or any route) with a recovery hash and Supabase already
    // has a session, force the reset UI.
    if (isRecoveryLikeLink() && !isAlreadyOnReset()) {
      setTimeout(() => {
        supabase.auth.getSession().then(({ data }) => {
          if (data.session) goToReset();
        });
      }, 0);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const recoveryLike = isRecoveryLikeLink();

      // Depending on the link type / environment, Supabase can emit SIGNED_IN or
      // INITIAL_SESSION instead of PASSWORD_RECOVERY.
      const shouldRedirect =
        event === "PASSWORD_RECOVERY" ||
        (recoveryLike && (event === "SIGNED_IN" || event === "INITIAL_SESSION"));

      if (!shouldRedirect) return;
      if (!session) return;

      // Navigate AFTER Supabase has processed the URL tokens.
      setTimeout(() => {
        goToReset();
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname, location.search]);

  return null;
}
