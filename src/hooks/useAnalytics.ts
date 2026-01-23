import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

// Analytics configuration from edge function
interface AnalyticsConfig {
  ga4: {
    measurementId: string;
    enabled: boolean;
  };
  matomo: {
    url: string;
    siteId: string;
    enabled: boolean;
  };
}

// Event types for tracking
export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  customDimensions?: Record<string, string | number>;
}

// Page view data
interface PageViewData {
  path: string;
  title: string;
  referrer?: string;
  platform?: 'portail' | 'bn' | 'manuscrits' | 'cbm' | 'kitab';
}

// Note: Global types for gtag and Matomo are declared in src/types/analytics.d.ts

/**
 * Initialize Google Analytics 4
 */
function initGA4(measurementId: string): void {
  if (!measurementId || window.gtag) return;

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag function
  const dataLayer: any[] = (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).gtag = function(...args: any[]) {
    dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false, // We'll send manually for SPA
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure',
  });

  console.log('📊 Google Analytics 4 initialized:', measurementId);
}

/**
 * Initialize Matomo Analytics
 */
function initMatomo(url: string, siteId: string): void {
  if (!url || !siteId || window._matomoLoaded) return;

  window._paq = window._paq || [];
  
  // Configure Matomo
  window._paq.push(['setTrackerUrl', `${url}/matomo.php`]);
  window._paq.push(['setSiteId', siteId]);
  window._paq.push(['enableLinkTracking']);
  window._paq.push(['enableHeartBeatTimer']);
  window._paq.push(['setSecureCookie', true]);

  // Load Matomo script
  const script = document.createElement('script');
  script.async = true;
  script.src = `${url}/matomo.js`;
  script.onload = () => {
    window._matomoLoaded = true;
    console.log('📊 Matomo initialized:', url);
  };
  document.head.appendChild(script);
}

/**
 * Track page view in both GA4 and Matomo
 */
function trackPageView(data: PageViewData): void {
  const { path, title, referrer, platform } = data;

  // GA4 page view
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
      page_referrer: referrer || document.referrer,
      platform: platform,
    });
  }

  // Matomo page view
  if (window._paq) {
    window._paq.push(['setCustomUrl', path]);
    window._paq.push(['setDocumentTitle', title]);
    if (referrer) {
      window._paq.push(['setReferrerUrl', referrer]);
    }
    if (platform) {
      window._paq.push(['setCustomDimension', 1, platform]);
    }
    window._paq.push(['trackPageView']);
  }
}

/**
 * Track custom event in both GA4 and Matomo
 */
function trackEvent(event: AnalyticsEvent): void {
  const { category, action, label, value, customDimensions } = event;

  // GA4 event
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...customDimensions,
    });
  }

  // Matomo event
  if (window._paq) {
    window._paq.push(['trackEvent', category, action, label, value]);
  }
}

/**
 * Track document/content view
 */
function trackContentView(contentId: string, contentType: string, title: string): void {
  trackEvent({
    category: 'Content',
    action: 'view',
    label: `${contentType}:${contentId}`,
    customDimensions: {
      content_id: contentId,
      content_type: contentType,
      content_title: title,
    },
  });
}

/**
 * Track search queries
 */
function trackSearch(query: string, resultsCount: number, platform: string): void {
  // GA4 search
  if (window.gtag) {
    window.gtag('event', 'search', {
      search_term: query,
      results_count: resultsCount,
      platform: platform,
    });
  }

  // Matomo site search
  if (window._paq) {
    window._paq.push(['trackSiteSearch', query, platform, resultsCount]);
  }
}

/**
 * Track file download
 */
function trackDownload(fileName: string, fileType: string, documentId?: string): void {
  trackEvent({
    category: 'Download',
    action: 'file_download',
    label: fileName,
    customDimensions: {
      file_type: fileType,
      document_id: documentId || '',
    },
  });
}

/**
 * Set user properties for authenticated users
 */
function setUserProperties(userId: string, userType: string, role?: string): void {
  // GA4 user properties
  if (window.gtag) {
    window.gtag('set', 'user_properties', {
      user_type: userType,
      user_role: role || 'visitor',
    });
    window.gtag('set', { user_id: userId });
  }

  // Matomo user ID
  if (window._paq) {
    window._paq.push(['setUserId', userId]);
    window._paq.push(['setCustomDimension', 2, userType]);
    if (role) {
      window._paq.push(['setCustomDimension', 3, role]);
    }
  }
}

/**
 * Main analytics hook
 */
export function useAnalytics() {
  const location = useLocation();
  const { user, profile } = useAuth();

  // Initialize analytics on mount
  useEffect(() => {
    const loadAnalyticsConfig = async () => {
      try {
        // Fetch config from edge function
        const response = await fetch(
          'https://safeppmznupzqkqmzjzt.supabase.co/functions/v1/analytics-service?action=config'
        );
        
        if (response.ok) {
          const config: AnalyticsConfig = await response.json();
          
          if (config.ga4.enabled && config.ga4.measurementId) {
            initGA4(config.ga4.measurementId);
          }
          
          if (config.matomo.enabled && config.matomo.url && config.matomo.siteId) {
            initMatomo(config.matomo.url, config.matomo.siteId);
          }
        }
      } catch (error) {
        console.warn('Analytics config not available, using defaults');
        // Fallback: try to init from script tags if already present
      }
    };

    loadAnalyticsConfig();
  }, []);

  // Track page views on route change
  useEffect(() => {
    const platform = detectPlatform(location.pathname);
    
    trackPageView({
      path: location.pathname + location.search,
      title: document.title,
      platform,
    });
  }, [location]);

  // Set user properties when authenticated
  useEffect(() => {
    if (user && profile) {
      setUserProperties(
        user.id,
        profile.user_type || 'registered',
        profile.role
      );
    }
  }, [user, profile]);

  // Return tracking functions
  return {
    trackEvent: useCallback(trackEvent, []),
    trackContentView: useCallback(trackContentView, []),
    trackSearch: useCallback(trackSearch, []),
    trackDownload: useCallback(trackDownload, []),
    trackPageView: useCallback(trackPageView, []),
  };
}

/**
 * Detect which platform the user is on based on URL
 */
function detectPlatform(pathname: string): PageViewData['platform'] {
  if (pathname.startsWith('/digital-library') || pathname.startsWith('/bn')) {
    return 'bn';
  }
  if (pathname.startsWith('/manuscripts') || pathname.startsWith('/plateforme-manuscrits')) {
    return 'manuscrits';
  }
  if (pathname.startsWith('/cbm') || pathname.startsWith('/catalogue-collectif')) {
    return 'cbm';
  }
  if (pathname.startsWith('/kitab')) {
    return 'kitab';
  }
  return 'portail';
}

/**
 * Component to provide analytics context
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useAnalytics();
  return children;
}
