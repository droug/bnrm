import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AUTH_ENTRY_SNAPSHOT_KEY } from "@/auth/urlSnapshot";

/**
 * Ensures password-recovery links always land on the reset-password UI.
 *
 * In some cases, Supabase can consume/clear the recovery hash very early.
 * We therefore snapshot the initial URL in `src/auth/urlSnapshot.ts` and use it here.
 */
export function AuthRecoveryRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const parseParams = (value: string) => {
      const v = value.startsWith("#") || value.startsWith("?") ? value.slice(1) : value;
      return new URLSearchParams(v);
    };

    const isRecoveryLike = (hash: string, search: string) => {
      const hashParams = parseParams(hash);
      const searchParams = parseParams(search);
      const type = hashParams.get("type") ?? searchParams.get("type");
      return type === "recovery" || type === "invite";
    };

    const readSnapshot = () => {
      try {
        const raw = sessionStorage.getItem(AUTH_ENTRY_SNAPSHOT_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { hash?: string; search?: string; ts?: number };
        if (!parsed?.ts || Date.now() - parsed.ts > 10 * 60 * 1000) {
          sessionStorage.removeItem(AUTH_ENTRY_SNAPSHOT_KEY);
          return null;
        }
        return parsed;
      } catch {
        return null;
      }
    };

    const isAlreadyOnReset = () =>
      location.pathname === "/auth" &&
      new URLSearchParams(location.search).get("reset") === "true";

    const goToReset = () => {
      try {
        sessionStorage.removeItem(AUTH_ENTRY_SNAPSHOT_KEY);
      } catch {
        // ignore
      }
      if (isAlreadyOnReset()) return;
      navigate("/auth?reset=true", { replace: true });
    };

    const snapshot = readSnapshot();
    const recoveryLike =
      isRecoveryLike(window.location.hash, window.location.search) ||
      (snapshot ? isRecoveryLike(snapshot.hash ?? "", snapshot.search ?? "") : false);

    // If we land on any route with a recovery/invite snapshot and Supabase already has a session,
    // force the reset UI.
    if (recoveryLike && !isAlreadyOnReset()) {
      setTimeout(() => {
        supabase.auth.getSession().then(({ data }) => {
          if (data.session) goToReset();
        });
      }, 0);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const snap = readSnapshot();
      const recovery =
        isRecoveryLike(window.location.hash, window.location.search) ||
        (snap ? isRecoveryLike(snap.hash ?? "", snap.search ?? "") : false);

      // Depending on the link type / environment, Supabase can emit SIGNED_IN or
      // INITIAL_SESSION instead of PASSWORD_RECOVERY.
      const shouldRedirect =
        event === "PASSWORD_RECOVERY" ||
        (recovery && (event === "SIGNED_IN" || event === "INITIAL_SESSION"));

      if (!shouldRedirect) return;
      if (!session) return;

      setTimeout(() => {
        goToReset();
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname, location.search]);

  return null;
}
