import { Helmet } from "react-helmet";
import { useLanguage } from "@/hooks/useLanguage";

export interface SEOHeadProps {
  // Basic meta
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  keywords?: string[];
  keywordsAr?: string[];
  
  // OpenGraph
  ogType?: 'website' | 'article' | 'product' | 'profile';
  ogImage?: string;
  ogUrl?: string;
  
  // Technical SEO
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  
  // Article specific
  articleAuthor?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleSection?: string;
  articleTags?: string[];
  
  // Structured Data
  structuredData?: object;
  
  // Alternate languages
  alternateLanguages?: {
    hrefLang: string;
    href: string;
  }[];
  
  // Author
  author?: string;
}

const SITE_NAME = "Bibliothèque Nationale du Royaume du Maroc";
const SITE_NAME_AR = "المكتبة الوطنية للمملكة المغربية";
const DEFAULT_OG_IMAGE = "https://bnrm.lovable.app/og-image.png";
const SITE_URL = "https://bnrm.lovable.app";

export default function SEOHead({
  title,
  titleAr,
  description,
  descriptionAr,
  keywords = [],
  keywordsAr = [],
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
  ogUrl,
  canonical,
  noindex = false,
  nofollow = false,
  articleAuthor,
  articlePublishedTime,
  articleModifiedTime,
  articleSection,
  articleTags = [],
  structuredData,
  alternateLanguages = [],
  author = SITE_NAME
}: SEOHeadProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  // Language-aware content
  const displayTitle = isArabic && titleAr ? titleAr : title;
  const displayDescription = isArabic && descriptionAr ? descriptionAr : description;
  const displayKeywords = isArabic && keywordsAr.length > 0 ? keywordsAr : keywords;
  const siteName = isArabic ? SITE_NAME_AR : SITE_NAME;
  
  const fullTitle = `${displayTitle} | ${siteName}`;
  const canonicalUrl = canonical || ogUrl || (typeof window !== 'undefined' ? window.location.href : SITE_URL);
  
  // Ensure description is under 160 characters
  const metaDescription = displayDescription.length > 160 
    ? displayDescription.substring(0, 157) + "..." 
    : displayDescription;
  
  const keywordsMeta = displayKeywords.length > 0 
    ? displayKeywords.join(", ") 
    : "bibliothèque, maroc, patrimoine, culture, recherche, manuscrits, dépôt légal";
  
  // Build robots meta
  const robotsDirectives = [];
  if (noindex) robotsDirectives.push('noindex');
  else robotsDirectives.push('index');
  if (nofollow) robotsDirectives.push('nofollow');
  else robotsDirectives.push('follow');
  const robotsContent = robotsDirectives.join(', ');
  
  // Default organization schema
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "Library",
    "name": SITE_NAME,
    "alternateName": ["BNRM", SITE_NAME_AR],
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.png`,
    "description": "Gardienne du patrimoine écrit marocain et porte d'accès au savoir universel",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Avenue Ibn Khaldoun",
      "addressLocality": "Rabat",
      "postalCode": "10000",
      "addressCountry": "MA"
    },
    "telephone": "+212-537-77-18-40",
    "sameAs": [
      "https://www.facebook.com/BNRM.Officiel",
      "https://twitter.com/BNRM_Officiel"
    ]
  };

  return (
    <Helmet htmlAttributes={{ lang: isArabic ? 'ar' : 'fr', dir: isArabic ? 'rtl' : 'ltr' }}>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={keywordsMeta} />
      <meta name="author" content={author} />
      <meta name="robots" content={robotsContent} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Alternate Languages - hreflang tags */}
      <link rel="alternate" hrefLang="fr" href={`${SITE_URL}${canonical || ''}`} />
      <link rel="alternate" hrefLang="ar" href={`${SITE_URL}${canonical || ''}?lang=ar`} />
      <link rel="alternate" hrefLang="en" href={`${SITE_URL}${canonical || ''}?lang=en`} />
      <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${canonical || ''}`} />
      {alternateLanguages.map((alt) => (
        <link key={alt.hrefLang} rel="alternate" hrefLang={alt.hrefLang} href={alt.href} />
      ))}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={displayTitle} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={isArabic ? "ar_MA" : "fr_MA"} />
      <meta property="og:locale:alternate" content={isArabic ? "fr_MA" : "ar_MA"} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@BNRM_Officiel" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Article Meta Tags */}
      {ogType === 'article' && articleAuthor && <meta property="article:author" content={articleAuthor} />}
      {ogType === 'article' && articlePublishedTime && <meta property="article:published_time" content={articlePublishedTime} />}
      {ogType === 'article' && articleModifiedTime && <meta property="article:modified_time" content={articleModifiedTime} />}
      {ogType === 'article' && articleSection && <meta property="article:section" content={articleSection} />}
      {ogType === 'article' && articleTags.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      
      {/* Technical SEO */}
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content={isArabic ? "Arabic" : "French"} />
      <meta name="revisit-after" content="7 days" />
      <meta name="theme-color" content="#1e3a5f" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
    </Helmet>
  );
}

// Article SEO component for news/blog posts
export function ArticleSEO({
  title,
  titleAr,
  description,
  descriptionAr,
  author,
  publishedTime,
  modifiedTime,
  category,
  tags,
  image,
  url,
}: {
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  category?: string;
  tags?: string[];
  image?: string;
  url: string;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": image || DEFAULT_OG_IMAGE,
    "author": {
      "@type": "Organization",
      "name": SITE_NAME
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`
      }
    },
    "datePublished": publishedTime,
    "dateModified": modifiedTime || publishedTime,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    }
  };

  return (
    <SEOHead
      title={title}
      titleAr={titleAr}
      description={description}
      descriptionAr={descriptionAr}
      ogType="article"
      ogImage={image}
      ogUrl={url}
      canonical={url}
      articleAuthor={author}
      articlePublishedTime={publishedTime}
      articleModifiedTime={modifiedTime}
      articleSection={category}
      articleTags={tags}
      structuredData={structuredData}
    />
  );
}

// Event SEO component
export function EventSEO({
  name,
  nameAr,
  description,
  descriptionAr,
  startDate,
  endDate,
  location,
  image,
  url,
}: {
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  startDate: string;
  endDate: string;
  location?: string;
  image?: string;
  url: string;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": name,
    "description": description,
    "startDate": startDate,
    "endDate": endDate,
    "location": {
      "@type": "Place",
      "name": location || SITE_NAME,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Avenue Ibn Khaldoun",
        "addressLocality": "Rabat",
        "postalCode": "10000",
        "addressCountry": "MA"
      }
    },
    "image": image || DEFAULT_OG_IMAGE,
    "organizer": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": SITE_URL
    }
  };

  return (
    <SEOHead
      title={name}
      titleAr={nameAr}
      description={description}
      descriptionAr={descriptionAr}
      ogImage={image}
      ogUrl={url}
      canonical={url}
      structuredData={structuredData}
    />
  );
}

// Breadcrumb structured data
export function BreadcrumbSEO({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}

// FAQ structured data
export function FAQSeo({
  questions,
}: {
  questions: { question: string; answer: string }[];
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map((q) => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}
