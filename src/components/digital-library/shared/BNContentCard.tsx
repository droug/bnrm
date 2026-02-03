import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface BNContentCardProps {
  title?: string;
  description?: string;
  icon?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  noPadding?: boolean;
  variant?: "default" | "premium" | "glass";
}

export function BNContentCard({
  title,
  description,
  icon,
  children,
  className,
  headerClassName,
  noPadding = false,
  variant = "default",
}: BNContentCardProps) {
  const variantStyles = {
    default: "bg-card border-border shadow-lg",
    premium: "bg-gradient-to-br from-card via-card to-muted/30 border-gold-bn-primary/20 shadow-xl",
    glass: "bg-white/80 dark:bg-card/80 backdrop-blur-sm border-white/20 shadow-lg",
  };

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-xl",
      variantStyles[variant],
      className
    )}>
      {(title || description) && (
        <CardHeader className={cn("pb-4", headerClassName)}>
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-bn-blue-primary/10 to-gold-bn-primary/10 border border-bn-blue-primary/20">
                <Icon icon={icon} className="w-5 h-5 text-bn-blue-primary" />
              </div>
            )}
            <div>
              {title && (
                <CardTitle className="text-xl font-semibold text-foreground">
                  {title}
                </CardTitle>
              )}
              {description && (
                <CardDescription className="text-muted-foreground mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(noPadding && "p-0")}>
        {children}
      </CardContent>
    </Card>
  );
}
