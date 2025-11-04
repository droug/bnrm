import { Helmet } from "react-helmet";

interface StructuredDataScriptProps {
  data: object | object[];
}

/**
 * Component to inject JSON-LD structured data into the page
 * Supports single object or array of objects
 */
export function StructuredDataScript({ data }: StructuredDataScriptProps) {
  const structuredData = Array.isArray(data) ? data : [data];

  return (
    <Helmet>
      {structuredData.map((item, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
}

/**
 * Generate WebSite structured data
 */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Bibliothèque Nationale du Royaume du Maroc",
    "alternateName": "BNRM",
    "url": "https://www.bnrm.ma",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.bnrm.ma/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Library",
    "name": "Bibliothèque Nationale du Royaume du Maroc",
    "alternateName": "BNRM",
    "url": "https://www.bnrm.ma",
    "logo": "https://www.bnrm.ma/logo.png",
    "description": "Gardienne du patrimoine écrit marocain et porte d'accès au savoir universel",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "MA",
      "addressLocality": "Rabat",
      "addressRegion": "Rabat-Salé-Kénitra"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+212-XXX-XXXXXX",
      "contactType": "Customer Service",
      "availableLanguage": ["French", "Arabic"]
    },
    "sameAs": [
      "https://www.facebook.com/bnrm",
      "https://twitter.com/bnrm",
      "https://www.linkedin.com/company/bnrm"
    ]
  };
}
