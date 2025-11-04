import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

interface SEOLinkProps {
  href: string;
  children: React.ReactNode;
  title?: string;
  rel?: "nofollow" | "noopener" | "noreferrer" | "sponsored" | "ugc";
  className?: string;
  external?: boolean;
  ariaLabel?: string;
}

/**
 * SEO-optimized link component with proper attributes
 * - title: Descriptive title for accessibility and SEO
 * - rel: Relationship attributes for link type control
 * - aria-label: Accessibility label for screen readers
 */
export default function SEOLink({
  href,
  children,
  title,
  rel,
  className = "",
  external = false,
  ariaLabel
}: SEOLinkProps) {
  // Determine if link is external
  const isExternal = external || href.startsWith("http") || href.startsWith("//");
  
  // Build rel attribute
  const relAttributes = [];
  if (rel) relAttributes.push(rel);
  if (isExternal && !rel?.includes("noopener")) relAttributes.push("noopener");
  if (isExternal && !rel?.includes("noreferrer")) relAttributes.push("noreferrer");
  
  const finalRel = relAttributes.length > 0 ? relAttributes.join(" ") : undefined;

  if (isExternal) {
    return (
      <a
        href={href}
        title={title}
        rel={finalRel}
        className={`inline-flex items-center gap-1 ${className}`}
        target="_blank"
        aria-label={ariaLabel || title}
      >
        {children}
        <ExternalLink className="h-3 w-3" />
      </a>
    );
  }

  return (
    <Link
      to={href}
      title={title}
      rel={finalRel}
      className={className}
      aria-label={ariaLabel || title}
    >
      {children}
    </Link>
  );
}
