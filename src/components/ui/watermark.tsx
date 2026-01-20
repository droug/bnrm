import React from "react";
import { cn } from "@/lib/utils";

interface WatermarkProps {
  text?: string;
  opacity?: number;
  className?: string;
  variant?: "subtle" | "visible" | "branded" | "library";
  position?: "center" | "corner" | "diagonal" | "pattern" | "scattered";
}

export const Watermark: React.FC<WatermarkProps> = ({
  text = "BNRM - Bibliothèque Nationale",
  opacity = 0.05,
  className,
  variant = "subtle",
  position = "center"
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "visible":
        return "text-muted-foreground/20 text-sm";
      case "branded":
        return "text-primary/10 text-lg font-bold";
      case "library":
        return "text-primary/5 text-base font-serif tracking-wider";
      default:
        return "text-muted-foreground/10 text-xs";
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case "corner":
        return "bottom-4 right-4";
      case "diagonal":
        return "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45";
      case "pattern":
        return "inset-0";
      case "scattered":
        return "inset-0";
      default:
        return "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
    }
  };

  // Scattered pattern - very subtle, library-style watermark
  if (position === "scattered") {
    return (
      <div 
        className={cn(
          "absolute inset-0 pointer-events-none select-none overflow-hidden",
          className
        )}
        style={{ opacity }}
      >
        <div className="absolute inset-0 flex flex-wrap content-start gap-y-32 gap-x-16 p-12">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center justify-center -rotate-12 whitespace-nowrap",
                getVariantStyles(),
                i % 2 === 0 ? "ml-8" : "ml-24"
              )}
              style={{ 
                opacity: 0.4 + (i % 3) * 0.2,
                fontSize: `${0.75 + (i % 2) * 0.15}rem`
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (position === "pattern") {
    return (
      <div 
        className={cn(
          "absolute inset-0 pointer-events-none select-none overflow-hidden",
          className
        )}
        style={{ opacity }}
      >
        <div className="absolute inset-0 grid grid-cols-3 gap-8 p-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center justify-center rotate-45",
                getVariantStyles()
              )}
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "absolute pointer-events-none select-none z-0",
        getPositionStyles(),
        getVariantStyles(),
        className
      )}
      style={{ opacity }}
    >
      {text}
    </div>
  );
};

interface WatermarkContainerProps {
  children: React.ReactNode;
  watermarkProps?: WatermarkProps;
  className?: string;
}

export const WatermarkContainer: React.FC<WatermarkContainerProps> = ({
  children,
  watermarkProps,
  className
}) => {
  return (
    <div className={cn("relative min-h-screen", className)}>
      <Watermark {...watermarkProps} />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};