import { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { useLanguage } from "@/hooks/useLanguage";

interface BNPageHeaderProps {
  titleKey?: string;
  title?: string;
  subtitleKey?: string;
  subtitle?: string;
  icon?: string;
  children?: ReactNode;
  compact?: boolean;
}

export function BNPageHeader({
  titleKey,
  title,
  subtitleKey,
  subtitle,
  icon = "mdi:library",
  children,
  compact = false,
}: BNPageHeaderProps) {
  const { t } = useLanguage();

  const displayTitle = titleKey ? t(titleKey) : title;
  const displaySubtitle = subtitleKey ? t(subtitleKey) : subtitle;

  return (
    <div className="relative bg-gradient-to-br from-bn-blue-primary via-bn-blue-deep to-bn-blue-primary overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gold-bn-primary rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gold-bn-primary/50 rounded-full blur-2xl" />
      </div>

      {/* Geometric patterns */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-64 h-64 border border-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 border border-gold-bn-primary/20 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className={`relative z-10 container mx-auto px-4 ${compact ? 'py-8 md:py-12' : 'py-12 md:py-16'}`}>
        <div className="text-center space-y-4">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
            <Icon icon={icon} className="w-8 h-8 text-gold-bn-primary" />
          </div>

          {/* Title */}
          {displayTitle && (
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              {displayTitle}
            </h1>
          )}

          {/* Subtitle */}
          {displaySubtitle && (
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              {displaySubtitle}
            </p>
          )}

          {/* Optional children (search box, stats, etc.) */}
          {children && (
            <div className="mt-6">
              {children}
            </div>
          )}
        </div>
      </div>

      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" className="w-full h-auto" preserveAspectRatio="none">
          <path 
            d="M0,40 C320,80 640,0 960,40 C1280,80 1440,20 1440,20 L1440,60 L0,60 Z" 
            className="fill-background"
          />
        </svg>
      </div>
    </div>
  );
}
