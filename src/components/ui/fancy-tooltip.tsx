import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';

interface FancyTooltipProps {
  children: React.ReactElement;
  content: string;
  description?: string;
  icon?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'default' | 'gold' | 'gradient';
}

export const FancyTooltip: React.FC<FancyTooltipProps> = ({ 
  children, 
  content,
  description,
  icon,
  side = 'right',
  variant = 'gold'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
    left: 'right-full top-1/2 -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 -translate-y-1/2 ml-3',
  };

  const arrowPositionClasses = {
    top: "bottom-[-6px] left-1/2 -translate-x-1/2",
    bottom: "top-[-6px] left-1/2 -translate-x-1/2",
    left: "right-[-6px] top-1/2 -translate-y-1/2",
    right: "left-[-6px] top-1/2 -translate-y-1/2"
  };

  const variantClasses = {
    default: "bg-slate-900 text-white border border-slate-700",
    gold: "bg-gradient-to-br from-amber-50 to-orange-50 text-slate-800 border-2 border-gold-bn-primary/30 shadow-xl shadow-gold-bn-primary/20",
    gradient: "bg-gradient-to-br from-bn-blue to-bn-blue-dark text-white border border-bn-blue-light/30"
  };

  const arrowVariantClasses = {
    default: "bg-slate-900 border-l border-b border-slate-700",
    gold: "bg-gradient-to-br from-amber-50 to-orange-50 border-l-2 border-b-2 border-gold-bn-primary/30",
    gradient: "bg-bn-blue border-l border-b border-bn-blue-light/30"
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-[9999] min-w-[220px] max-w-[280px] p-4 rounded-xl shadow-2xl pointer-events-none",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-left-2 duration-300",
            positionClasses[side],
            variantClasses[variant]
          )}
        >
          <div className="flex items-start gap-3">
            {icon && (
              <div className={cn(
                "p-2 rounded-lg shrink-0",
                variant === 'gold' && "bg-gradient-to-br from-gold-bn-primary/20 to-amber-200/30",
                variant === 'gradient' && "bg-white/10",
                variant === 'default' && "bg-slate-700"
              )}>
                <Icon name={icon} className={cn(
                  "h-5 w-5",
                  variant === 'gold' && "text-gold-bn-primary",
                  variant === 'gradient' && "text-white",
                  variant === 'default' && "text-white"
                )} />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <span className={cn(
                "font-bold text-sm leading-tight",
                variant === 'gold' && "text-slate-800",
                variant === 'gradient' && "text-white",
                variant === 'default' && "text-white"
              )}>
                {content}
              </span>
              {description && (
                <span className={cn(
                  "text-xs leading-relaxed",
                  variant === 'gold' && "text-slate-600",
                  variant === 'gradient' && "text-white/80",
                  variant === 'default' && "text-slate-300"
                )}>
                  {description}
                </span>
              )}
            </div>
          </div>
          
          {/* Decorative sparkle */}
          {variant === 'gold' && (
            <div className="absolute -top-1 -right-1 w-3 h-3">
              <div className="absolute inset-0 bg-gold-bn-primary rounded-full animate-ping opacity-40" />
              <div className="absolute inset-0.5 bg-gold-bn-primary rounded-full" />
            </div>
          )}
          
          {/* Arrow */}
          <div
            className={cn(
              "absolute w-3 h-3 transform rotate-45",
              arrowPositionClasses[side],
              arrowVariantClasses[variant]
            )}
          />
        </div>
      )}
    </div>
  );
};
