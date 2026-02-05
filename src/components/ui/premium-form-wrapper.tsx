/**
 * Premium Form Wrapper Component
 * Provides an elegant, premium design with gradients, shadows, and depth effects
 * for all BNRM portal forms
 */

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface PremiumFormWrapperProps {
  children: ReactNode;
  title: string;
  titleAr?: string;
  subtitle?: string;
  subtitleAr?: string;
  icon?: LucideIcon;
  onBack?: () => void;
  backLabel?: string;
  className?: string;
  showDecorations?: boolean;
}

export function PremiumFormWrapper({
  children,
  title,
  titleAr,
  subtitle,
  subtitleAr,
  icon: Icon,
  onBack,
  backLabel = "Retour",
  className,
  showDecorations = true,
}: PremiumFormWrapperProps) {
  return (
    <div className={cn("relative min-h-screen", className)}>
      {/* Background decorations */}
      {showDecorations && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top gradient orb */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-accent/20 via-primary/10 to-transparent rounded-full blur-3xl" />
          {/* Bottom gradient orb */}
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-highlight/15 via-accent/10 to-transparent rounded-full blur-3xl" />
          {/* Center subtle pattern */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02]">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
        </div>
      )}

      <div className="relative z-10">
        {/* Premium Header Section */}
        <div className="relative overflow-hidden">
          {/* Gradient background for header */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-highlight/5" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
          
          <div className="relative container mx-auto px-4 pt-6 pb-8">
            {/* Back button */}
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="mb-4 group hover:bg-primary/10 transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                {backLabel}
              </Button>
            )}

            {/* Title section with premium styling */}
            <div className="flex items-start gap-4">
              {Icon && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent to-highlight rounded-2xl blur-lg opacity-40" />
                  <div className="relative p-4 bg-gradient-to-br from-accent to-highlight rounded-2xl shadow-lg">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
                  {title}
                </h1>
                {titleAr && (
                  <p className="text-xl text-muted-foreground mt-1 font-arabic" dir="rtl">
                    {titleAr}
                  </p>
                )}
                {subtitle && (
                  <p className="text-muted-foreground mt-2 text-lg">
                    {subtitle}
                  </p>
                )}
                {subtitleAr && (
                  <p className="text-muted-foreground mt-1 font-arabic" dir="rtl">
                    {subtitleAr}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Decorative wave separator */}
          <svg 
            className="absolute bottom-0 left-0 w-full h-8 text-background" 
            viewBox="0 0 1200 40" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0,20 C300,0 600,40 900,20 C1050,10 1150,25 1200,20 L1200,40 L0,40 Z" 
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Main Content Area */}
        <div className="container mx-auto px-4 py-6">
          <div className="relative">
            {/* Premium card container */}
            <div className="relative bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden">
              {/* Top gradient accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-highlight to-primary" />
              
              {/* Content */}
              <div className="p-6 md:p-8 lg:p-10">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Premium Form Section Component
 * For grouping form fields with elegant styling
 */
interface PremiumFormSectionProps {
  children: ReactNode;
  title: string;
  titleAr?: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
  collapsible?: boolean;
}

export function PremiumFormSection({
  children,
  title,
  titleAr,
  description,
  icon: Icon,
  className,
}: PremiumFormSectionProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        {Icon && (
          <div className="p-2.5 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
        <div>
          <h3 className="text-xl md:text-2xl font-semibold text-foreground">
            {title}
          </h3>
          {titleAr && (
            <p className="text-sm text-muted-foreground font-arabic" dir="rtl">
              {titleAr}
            </p>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Section content with subtle left border */}
      <div className="relative pl-4 border-l-2 border-gradient-to-b from-accent/50 to-transparent">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent/50 via-primary/30 to-transparent" />
        {children}
      </div>
    </div>
  );
}

/**
 * Premium Input Group Component
 * For styling form field groups with premium aesthetics
 */
interface PremiumInputGroupProps {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function PremiumInputGroup({
  children,
  className,
  columns = 2,
}: PremiumInputGroupProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4 md:gap-6", gridCols[columns], className)}>
      {children}
    </div>
  );
}

/**
 * Premium Divider Component
 * Elegant separator for form sections
 */
export function PremiumDivider({ className }: { className?: string }) {
  return (
    <div className={cn("relative my-8", className)}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border/50" />
      </div>
      <div className="relative flex justify-center">
        <div className="w-12 h-1 bg-gradient-to-r from-accent via-primary to-highlight rounded-full" />
      </div>
    </div>
  );
}
