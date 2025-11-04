import { Helmet } from "react-helmet";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
  structuredData?: object;
  author?: string;
  lang?: string;
}

export default function SEOHead({
  title,
  description,
  keywords = [],
  canonical,
  ogType = "website",
  ogImage = "https://lovable.dev/opengraph-image-p98pqg.png",
  noindex = false,
  structuredData,
  author = "Bibliothèque Nationale du Royaume du Maroc",
  lang = "fr"
}: SEOHeadProps) {
  const fullTitle = `${title} | BNRM - Bibliothèque Nationale du Royaume du Maroc`;
  const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href : '');
  const keywordsMeta = keywords.length > 0 
    ? keywords.join(", ") 
    : "bibliothèque, maroc, patrimoine, culture, recherche";

  // Ensure description is under 160 characters
  const metaDescription = description.length > 160 
    ? description.substring(0, 157) + "..." 
    : description;

  return (
    <Helmet htmlAttributes={{ lang }}>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={keywordsMeta} />
      <meta name="author" content={author} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Bibliothèque Nationale du Royaume du Maroc" />
      <meta property="og:locale" content="fr_MA" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="French" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Schema.org JSON-LD */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* Default Organization Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Library",
          "name": "Bibliothèque Nationale du Royaume du Maroc",
          "alternateName": "BNRM",
          "url": "https://www.bnrm.ma",
          "logo": ogImage,
          "description": "Gardienne du patrimoine écrit marocain et porte d'accès au savoir universel",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "MA",
            "addressLocality": "Rabat"
          },
          "sameAs": []
        })}
      </script>
    </Helmet>
  );
}
