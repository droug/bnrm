import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { Fragment } from "react";

interface BreadcrumbItem {
  name: string;
  path: string;
  isLast?: boolean;
}

interface SEOBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * SEO-optimized breadcrumbs component with structured data
 */
export default function SEOBreadcrumbs({ items, className = "" }: SEOBreadcrumbsProps) {
  if (items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => (
            <Fragment key={item.path}>
              <BreadcrumbItem>
                {index === 0 ? (
                  <BreadcrumbLink href={item.path} title="Retour à l'accueil">
                    <Home className="h-4 w-4" />
                    <span className="sr-only">{item.name}</span>
                  </BreadcrumbLink>
                ) : item.isLast ? (
                  <BreadcrumbPage>{item.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.path} title={`Aller à ${item.name}`}>
                    {item.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < items.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </nav>
  );
}
