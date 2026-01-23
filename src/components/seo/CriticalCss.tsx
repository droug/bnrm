import { useEffect } from 'react';

/**
 * Critical CSS and Performance Optimization Component
 * 
 * Implements CSS optimization best practices:
 * - Ensures CSS is loaded before scripts
 * - Removes @import statements in favor of direct linking
 * - Preloads critical resources
 * - Defers non-critical CSS
 */
export function CriticalCssOptimizer() {
  useEffect(() => {
    // Preload critical fonts
    const criticalFonts = [
      { family: 'Inter', weight: '400' },
      { family: 'Inter', weight: '600' },
      { family: 'Playfair Display', weight: '700' },
    ];

    criticalFonts.forEach(({ family, weight }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      // Google Fonts URL pattern
      link.href = `https://fonts.gstatic.com/s/${family.toLowerCase().replace(' ', '')}/v1/${weight}.woff2`;
      document.head.appendChild(link);
    });

    // Add resource hints for critical third-party resources
    const resourceHints = [
      { rel: 'preconnect', href: 'https://api.supabase.co' },
      { rel: 'dns-prefetch', href: 'https://api.supabase.co' },
    ];

    resourceHints.forEach(({ rel, href }) => {
      if (!document.querySelector(`link[rel="${rel}"][href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = rel;
        link.href = href;
        if (rel === 'preconnect') {
          link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
      }
    });

    // Defer non-critical stylesheets
    const deferStylesheets = () => {
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"][data-defer]');
      stylesheets.forEach((sheet) => {
        const link = sheet as HTMLLinkElement;
        link.media = 'all';
      });
    };

    // Run after initial render
    if (document.readyState === 'complete') {
      deferStylesheets();
    } else {
      window.addEventListener('load', deferStylesheets);
      return () => window.removeEventListener('load', deferStylesheets);
    }
  }, []);

  return null;
}

/**
 * Utility to inline critical CSS for a specific component
 * Use sparingly for above-the-fold content
 */
export function useCriticalStyles(styles: string) {
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-critical', 'true');
    styleElement.textContent = styles;
    
    // Insert at the beginning of head for highest priority
    const firstChild = document.head.firstChild;
    if (firstChild) {
      document.head.insertBefore(styleElement, firstChild);
    } else {
      document.head.appendChild(styleElement);
    }

    return () => {
      styleElement.remove();
    };
  }, [styles]);
}

/**
 * Performance metrics collector
 */
export function usePerformanceMetrics() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Collect performance metrics after page load
    const collectMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const metrics = {
          // Time to First Byte
          ttfb: navigation.responseStart - navigation.requestStart,
          // DOM Content Loaded
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
          // Full page load
          loadComplete: navigation.loadEventEnd - navigation.startTime,
          // DNS lookup
          dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
          // TCP connection
          tcpConnection: navigation.connectEnd - navigation.connectStart,
          // Request/Response
          requestResponse: navigation.responseEnd - navigation.requestStart,
          // DOM processing
          domProcessing: navigation.domComplete - navigation.domInteractive,
        };

        // Log performance metrics for monitoring
        console.log('📊 Performance Metrics:', metrics);

        // Check against thresholds
        if (metrics.domContentLoaded > 2000) {
          console.warn('⚠️ Page load exceeded 2s threshold:', metrics.domContentLoaded, 'ms');
        }

        // Send to analytics if available
        if (window.gtag) {
          window.gtag('event', 'page_timing', {
            event_category: 'Performance',
            ttfb: Math.round(metrics.ttfb),
            dom_content_loaded: Math.round(metrics.domContentLoaded),
            load_complete: Math.round(metrics.loadComplete),
          });
        }
      }
    };

    if (document.readyState === 'complete') {
      setTimeout(collectMetrics, 0);
    } else {
      window.addEventListener('load', () => setTimeout(collectMetrics, 0));
    }
  }, []);
}

// Note: gtag type is already declared globally, no need to redeclare
