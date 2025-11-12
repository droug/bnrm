import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface SimpleTooltipProps {
  children: React.ReactElement;
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const SimpleTooltip: React.FC<SimpleTooltipProps> = ({ 
  children, 
  content, 
  side = 'top' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-[9999] px-4 py-2 text-sm text-white bg-slate-900 rounded-lg shadow-xl pointer-events-none whitespace-normal max-w-xs",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            positionClasses[side]
          )}
        >
          {content}
          <div
            className={cn(
              "absolute w-2 h-2 bg-slate-900 transform rotate-45",
              side === 'top' && "bottom-[-4px] left-1/2 -translate-x-1/2",
              side === 'bottom' && "top-[-4px] left-1/2 -translate-x-1/2",
              side === 'left' && "right-[-4px] top-1/2 -translate-y-1/2",
              side === 'right' && "left-[-4px] top-1/2 -translate-y-1/2"
            )}
          />
        </div>
      )}
    </div>
  );
};
