import { useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const HISTORY_KEY = "bnrm_nav_history";
const MAX_HISTORY_LENGTH = 50;

interface NavigationHistoryEntry {
  path: string;
  timestamp: number;
}

/**
 * Hook to manage navigation history within the session.
 * Provides reliable "back" navigation even when browser history is unavailable.
 */
export function useNavigationHistory() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get current history from sessionStorage
  const getHistory = useCallback((): NavigationHistoryEntry[] => {
    try {
      const stored = sessionStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // Save history to sessionStorage
  const setHistory = useCallback((history: NavigationHistoryEntry[]) => {
    try {
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // Storage full or unavailable
    }
  }, []);

  // Track current page on location change
  useEffect(() => {
    const history = getHistory();
    const currentPath = location.pathname + location.search;
    
    // Don't add duplicate consecutive entries
    if (history.length > 0 && history[history.length - 1].path === currentPath) {
      return;
    }

    // Add new entry
    const newEntry: NavigationHistoryEntry = {
      path: currentPath,
      timestamp: Date.now(),
    };

    const newHistory = [...history, newEntry].slice(-MAX_HISTORY_LENGTH);
    setHistory(newHistory);
  }, [location.pathname, location.search, getHistory, setHistory]);

  /**
   * Get the default fallback path based on current location
   */
  const getDefaultFallback = useCallback((): string => {
    const path = location.pathname;

    // Digital Library section
    if (path.startsWith("/admin/digital-library")) {
      return "/admin/digital-library/documents";
    }
    if (path.startsWith("/digital-library") || path.startsWith("/bibliotheque-numerique")) {
      return "/digital-library";
    }

    // Manuscripts section
    if (path.startsWith("/admin/manuscripts")) {
      return "/admin/manuscripts-backoffice";
    }
    if (path.startsWith("/manuscripts") || path.startsWith("/plateforme-manuscrits")) {
      return "/plateforme-manuscrits";
    }

    // CBM section
    if (path.startsWith("/cbm/admin")) {
      return "/cbm/admin";
    }
    if (path.startsWith("/cbm")) {
      return "/cbm";
    }

    // Admin sections
    if (path.startsWith("/admin")) {
      return "/dashboard";
    }

    // User space
    if (path.startsWith("/my-space") || path.startsWith("/mon-espace")) {
      return "/my-space";
    }

    // Default to home
    return "/";
  }, [location.pathname]);

  /**
   * Navigate back in session history, or to fallback if no history
   */
  const goBack = useCallback((fallbackPath?: string) => {
    const history = getHistory();
    
    // Remove current page from history
    if (history.length > 0) {
      const currentPath = location.pathname + location.search;
      if (history[history.length - 1].path === currentPath) {
        history.pop();
      }
    }

    // Find previous page that's different from current
    const currentPath = location.pathname + location.search;
    let previousPath: string | null = null;
    
    while (history.length > 0) {
      const entry = history.pop();
      if (entry && entry.path !== currentPath) {
        previousPath = entry.path;
        break;
      }
    }

    // Update history
    setHistory(history);

    // Navigate
    if (previousPath) {
      navigate(previousPath);
    } else {
      navigate(fallbackPath || getDefaultFallback());
    }
  }, [getHistory, setHistory, navigate, location.pathname, location.search, getDefaultFallback]);

  /**
   * Check if there's history to go back to
   */
  const canGoBack = useCallback((): boolean => {
    const history = getHistory();
    const currentPath = location.pathname + location.search;
    
    // Check if there's at least one different page in history
    return history.some(entry => entry.path !== currentPath);
  }, [getHistory, location.pathname, location.search]);

  /**
   * Clear navigation history
   */
  const clearHistory = useCallback(() => {
    sessionStorage.removeItem(HISTORY_KEY);
  }, []);

  /**
   * Get the previous page path without navigating
   */
  const getPreviousPath = useCallback((): string | null => {
    const history = getHistory();
    const currentPath = location.pathname + location.search;
    
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].path !== currentPath) {
        return history[i].path;
      }
    }
    
    return null;
  }, [getHistory, location.pathname, location.search]);

  return {
    goBack,
    canGoBack,
    clearHistory,
    getPreviousPath,
    getDefaultFallback,
  };
}
