import { useState, useEffect } from 'react';

export interface CookieConsent {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: number;
}

const CONSENT_STORAGE_KEY = 'bnrm_cookie_consent';

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (storedConsent) {
      try {
        const parsed = JSON.parse(storedConsent);
        setConsent(parsed);
        setShowBanner(false);
        
        // Initialize analytics if consent given
        if (parsed.analytics) {
          initializeAnalytics();
        }
      } catch (error) {
        console.error('Error parsing cookie consent:', error);
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    const newConsent: CookieConsent = {
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: Date.now(),
    };
    saveConsent(newConsent);
  };

  const rejectAll = () => {
    const newConsent: CookieConsent = {
      analytics: false,
      marketing: false,
      functional: false,
      timestamp: Date.now(),
    };
    saveConsent(newConsent);
  };

  const acceptCustom = (customConsent: Partial<CookieConsent>) => {
    const newConsent: CookieConsent = {
      analytics: customConsent.analytics ?? false,
      marketing: customConsent.marketing ?? false,
      functional: customConsent.functional ?? true, // Functional always true for site operation
      timestamp: Date.now(),
    };
    saveConsent(newConsent);
  };

  const saveConsent = (newConsent: CookieConsent) => {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(newConsent));
    setConsent(newConsent);
    setShowBanner(false);

    // Initialize or disable analytics based on consent
    if (newConsent.analytics) {
      initializeAnalytics();
    } else {
      disableAnalytics();
    }

    // Save to database for audit trail
    saveConsentToDatabase(newConsent);
  };

  const resetConsent = () => {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    setConsent(null);
    setShowBanner(true);
    disableAnalytics();
  };

  return {
    consent,
    showBanner,
    acceptAll,
    rejectAll,
    acceptCustom,
    resetConsent,
  };
}

function initializeAnalytics() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
    });
  }
}

function disableAnalytics() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
    });
  }
}

async function saveConsentToDatabase(consent: CookieConsent) {
  try {
    // Generate a session ID if not exists
    let sessionId = sessionStorage.getItem('bnrm_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('bnrm_session_id', sessionId);
    }

    const { supabase } = await import('@/integrations/supabase/client');
    
    await supabase.from('cookie_consents').insert({
      session_id: sessionId,
      analytics_consent: consent.analytics,
      marketing_consent: consent.marketing,
      functional_consent: consent.functional,
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Error saving consent to database:', error);
  }
}
