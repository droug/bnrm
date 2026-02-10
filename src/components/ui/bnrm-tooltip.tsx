import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';

interface BNRMTooltipProps {
  children: React.ReactElement;
  content: string;
  description?: string;
  icon?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'blue' | 'gold' | 'gradient';
}

export const BNRMTooltip: React.FC<BNRMTooltipProps> = ({ 
  children, 
  content,
  description,
  icon,
  side = 'bottom',
  variant = 'blue'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsVisible(true);
  }, []);

  const hideTooltip = useCallback(() => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 150);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const offset = 12;
      
      let top = 0;
      let left = 0;

      switch (side) {
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + offset;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - offset;
          break;
        case 'top':
          top = rect.top - offset;
          left = rect.left + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + offset;
          left = rect.left + rect.width / 2;
          break;
      }

      setPosition({ top, left });
    }
  }, [isVisible, side]);

  const variantClasses = {
    blue: "bg-gradient-to-br from-blue-primary-dark via-blue-deep to-blue-primary-dark text-white border border-blue-primary/30 shadow-xl shadow-blue-primary-dark/30",
    gold: "bg-gradient-to-br from-amber-50 to-orange-50 text-slate-800 border-2 border-amber-400/30 shadow-xl shadow-amber-500/20",
    gradient: "bg-gradient-to-br from-slate-900 via-blue-primary-dark to-slate-900 text-white border border-blue-primary/20"
  };

  const arrowVariantClasses = {
    blue: "bg-blue-primary-dark border-l border-b border-blue-primary/30",
    gold: "bg-gradient-to-br from-amber-50 to-orange-50 border-l-2 border-b-2 border-amber-400/30",
    gradient: "bg-slate-900 border-l border-b border-blue-primary/20"
  };

  const iconBgClasses = {
    blue: "bg-white/15",
    gold: "bg-gradient-to-br from-amber-400/20 to-amber-300/30",
    gradient: "bg-white/10"
  };

  const iconColorClasses = {
    blue: "text-white",
    gold: "text-amber-600",
    gradient: "text-white"
  };

  const getTransformStyle = () => {
    switch (side) {
      case 'right':
        return 'translateY(-50%)';
      case 'left':
        return 'translateX(-100%) translateY(-50%)';
      case 'top':
        return 'translateX(-50%) translateY(-100%)';
      case 'bottom':
        return 'translateX(-50%)';
      default:
        return '';
    }
  };

  const getArrowStyle = () => {
    switch (side) {
      case 'right':
        return { left: '-6px', top: '50%', transform: 'translateY(-50%) rotate(45deg)' };
      case 'left':
        return { right: '-6px', top: '50%', transform: 'translateY(-50%) rotate(-135deg)' };
      case 'top':
        return { bottom: '-6px', left: '50%', transform: 'translateX(-50%) rotate(-45deg)' };
      case 'bottom':
        return { top: '-6px', left: '50%', transform: 'translateX(-50%) rotate(135deg)' };
      default:
        return {};
    }
  };

  const tooltipContent = isVisible && (
    <div
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        transform: getTransformStyle(),
        zIndex: 99999,
      }}
      className={cn(
        "min-w-[240px] max-w-[320px] p-4 rounded-xl shadow-2xl",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        variantClasses[variant]
      )}
    >
      {/* Decorative corner element */}
      <div className={cn(
        "absolute top-0 right-0 w-12 h-12 opacity-20",
        variant === 'blue' && "bg-gradient-to-bl from-white/30 to-transparent rounded-tr-xl",
        variant === 'gold' && "bg-gradient-to-bl from-amber-400/40 to-transparent rounded-tr-xl",
        variant === 'gradient' && "bg-gradient-to-bl from-blue-primary/30 to-transparent rounded-tr-xl"
      )} />
      
      <div className="flex items-start gap-3 relative">
        {icon && (
          <div className={cn(
            "p-2.5 rounded-lg shrink-0",
            iconBgClasses[variant]
          )}>
            <Icon name={icon} className={cn(
              "h-5 w-5",
              iconColorClasses[variant]
            )} />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <span className={cn(
            "font-bold text-sm leading-tight",
            variant === 'gold' ? "text-slate-800" : "text-white"
          )}>
            {content}
          </span>
          {description && (
            <span className={cn(
              "text-xs leading-relaxed",
              variant === 'gold' ? "text-slate-600" : "text-white/80"
            )}>
              {description}
            </span>
          )}
        </div>
      </div>
      
      {/* Decorative sparkle for gold */}
      {variant === 'gold' && (
        <div className="absolute -top-1 -right-1 w-3 h-3">
          <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-40" />
          <div className="absolute inset-0.5 bg-amber-500 rounded-full" />
        </div>
      )}
      
      {/* Decorative sparkle for blue */}
      {variant === 'blue' && (
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5">
          <div className="absolute inset-0 bg-white rounded-full animate-pulse opacity-60" />
        </div>
      )}
      
      {/* Arrow */}
      <div
        style={getArrowStyle()}
        className={cn(
          "absolute w-3 h-3",
          arrowVariantClasses[variant]
        )}
      />
    </div>
  );

  return (
    <div 
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
    </div>
  );
};
