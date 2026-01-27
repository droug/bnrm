import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

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
    default: "bg-slate-900 text-white border border-slate-700",
    gold: "bg-gradient-to-br from-amber-50 to-orange-50 text-slate-800 border-2 border-gold-bn-primary/30 shadow-xl shadow-gold-bn-primary/20",
    gradient: "bg-gradient-to-br from-bn-blue to-bn-blue-dark text-white border border-bn-blue-light/30"
  };

  const arrowVariantClasses = {
    default: "bg-slate-900 border-l border-b border-slate-700",
    gold: "bg-gradient-to-br from-amber-50 to-orange-50 border-l-2 border-b-2 border-gold-bn-primary/30",
    gradient: "bg-bn-blue border-l border-b border-bn-blue-light/30"
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
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        transform: getTransformStyle(),
        zIndex: 99999,
      }}
      className={cn(
        "min-w-[220px] max-w-[280px] p-4 rounded-xl shadow-2xl pointer-events-none",
        "animate-in fade-in-0 zoom-in-95 duration-300",
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
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
    </div>
  );
};
