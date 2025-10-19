import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * 
 * This function uses DOMPurify to clean HTML content before rendering it with dangerouslySetInnerHTML.
 * It allows only safe HTML tags and attributes while removing potentially malicious content.
 * 
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 * 
 * @example
 * ```tsx
 * <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userContent) }} />
 * ```
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Configure DOMPurify to allow common formatting tags for search highlights
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['mark', 'span', 'strong', 'em', 'b', 'i', 'u', 'br', 'p'],
    ALLOWED_ATTR: ['class', 'style'],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  });
}

/**
 * Create a safe HTML object for use with dangerouslySetInnerHTML
 * 
 * @param html - The HTML string to sanitize
 * @returns Object with __html property containing sanitized HTML
 * 
 * @example
 * ```tsx
 * <div {...createSafeHtml(userContent)} />
 * ```
 */
export function createSafeHtml(html: string): { __html: string } {
  return { __html: sanitizeHtml(html) };
}
