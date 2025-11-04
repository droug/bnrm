import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Hook to manage SEO-related side effects
 * - Scroll to top on route change
 * - Update last visit timestamp
 * - Track page views
 */
export function useSEO() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change for better UX
    window.scrollTo(0, 0);

    // Update page view timestamp
    sessionStorage.setItem('lastPageView', new Date().toISOString());

    // Track page view in analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname,
        page_title: document.title,
        page_location: window.location.href
      });
    }
  }, [location]);
}

/**
 * Hook to generate breadcrumb data from current route
 */
export function useBreadcrumbs() {
  const location = useLocation();
  
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: Array<{ name: string; path: string; isLast?: boolean }> = [
      { name: 'Accueil', path: '/' }
    ];
    
    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      
      // Format path name
      const name = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        name,
        path: currentPath,
        isLast: index === paths.length - 1
      });
    });
    
    return breadcrumbs;
  };

  return generateBreadcrumbs();
}
