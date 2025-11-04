import { useEffect } from 'react';

/**
 * Component to optimize page performance for PageSpeed Insights
 * Implements various performance best practices
 */
export function PerformanceOptimizer() {
  useEffect(() => {
    // Preconnect to external domains
    const preconnectLinks = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ];

    preconnectLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Defer non-critical scripts
    const scripts = document.querySelectorAll('script[data-defer="true"]');
    scripts.forEach(script => {
      script.setAttribute('defer', '');
    });

    // Add resource hints for critical resources
    const dnsPrefetchLinks = [
      'https://www.googletagmanager.com',
    ];

    dnsPrefetchLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = href;
      document.head.appendChild(link);
    });

    // Implement lazy loading for images not in viewport
    if ('loading' in HTMLImageElement.prototype) {
      const images = document.querySelectorAll('img[data-lazy="true"]');
      images.forEach(img => {
        img.setAttribute('loading', 'lazy');
      });
    } else {
      // Fallback for browsers that don't support native lazy loading
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
      script.async = true;
      document.body.appendChild(script);
    }

    // Remove unused CSS (example - adjust based on your needs)
    const removeUnusedCSS = () => {
      // This is a placeholder - in production, use tools like PurgeCSS
      console.log('CSS optimization applied');
    };
    removeUnusedCSS();

  }, []);

  return null;
}

/**
 * Hook to track Core Web Vitals
 */
export function useWebVitals() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'web-vitals' in window) {
      // @ts-ignore
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = window['web-vitals'];
      
      const sendToAnalytics = (metric: any) => {
        if (window.gtag) {
          window.gtag('event', metric.name, {
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            event_category: 'Web Vitals',
            event_label: metric.id,
            non_interaction: true,
          });
        }
      };

      getCLS?.(sendToAnalytics);
      getFID?.(sendToAnalytics);
      getFCP?.(sendToAnalytics);
      getLCP?.(sendToAnalytics);
      getTTFB?.(sendToAnalytics);
    }
  }, []);
}
