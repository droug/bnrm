export const AUTH_ENTRY_SNAPSHOT_KEY = "bnrm:auth-entry-url:v1";

/**
 * Snapshot the initial URL (hash/search) before Supabase potentially consumes and clears
 * recovery/invite tokens from the address bar.
 *
 * This module must be imported BEFORE the Supabase client is created.
 */
(function snapshotAuthEntryUrl() {
  try {
    const href = window.location.href;
    const hash = window.location.hash ?? "";
    const search = window.location.search ?? "";

    // Only store if it looks like a Supabase recovery/invite redirect.
    const looksAuthRelated =
      href.includes("type=recovery") ||
      href.includes("type=invite") ||
      hash.includes("type=recovery") ||
      hash.includes("type=invite");

    if (!looksAuthRelated) return;

    sessionStorage.setItem(
      AUTH_ENTRY_SNAPSHOT_KEY,
      JSON.stringify({ href, hash, search, ts: Date.now() })
    );
  } catch {
    // ignore (private mode / storage disabled)
  }
})();
