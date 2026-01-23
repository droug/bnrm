/**
 * SEO utility functions for URL handling and metadata generation
 */

/**
 * Generate clean, SEO-friendly URL slugs
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .substring(0, 100); // Limit length
}

/**
 * Generate breadcrumb JSON-LD structured data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Generate Article structured data
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "datePublished": article.datePublished,
    "dateModified": article.dateModified || article.datePublished,
    ...(article.image && { "image": article.image })
  };
}

/**
 * Generate Book structured data
 */
export function generateBookSchema(book: {
  title: string;
  author: string;
  description?: string;
  isbn?: string;
  datePublished?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.title,
    "author": {
      "@type": "Person",
      "name": book.author
    },
    ...(book.description && { "description": book.description }),
    ...(book.isbn && { "isbn": book.isbn }),
    ...(book.datePublished && { "datePublished": book.datePublished }),
    ...(book.image && { "image": book.image }),
    "inLanguage": "fr"
  };
}

/**
 * Track 404 errors with referrer
 */
export function track404Error(path: string, referrer: string) {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error(`404 Error: ${path} (from: ${referrer})`);
  }
  
  // In production, send to analytics service
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_not_found', {
      page_path: path,
      referrer: referrer,
      page_title: document.title
    });
  }
}

/**
 * Generate sitemap entry
 */
export function generateSitemapEntry(
  url: string,
  lastmod?: string,
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
  priority?: number
) {
  return {
    url,
    lastmod: lastmod || new Date().toISOString().split('T')[0],
    changefreq: changefreq || 'weekly',
    priority: priority || 0.5
  };
}

/**
 * Optimize meta description length
 */
export function optimizeDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Generate keywords from text
 */
export function extractKeywords(text: string, maxKeywords: number = 10): string[] {
  const commonWords = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'mais',
    'donc', 'car', 'ni', 'pour', 'dans', 'sur', 'avec', 'sans', 'ce', 'cette',
    'ces', 'mon', 'ton', 'son', 'ma', 'ta', 'sa', 'mes', 'tes', 'ses'
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));

  const wordFreq = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

// Note: gtag types are declared globally in src/types/analytics.d.ts
