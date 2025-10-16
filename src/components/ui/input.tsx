import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-input bg-white px-4 py-2.5 text-[15px] font-normal transition-all duration-200",
          "text-foreground placeholder:text-muted-foreground/60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary",
          "hover:border-primary/40",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "shadow-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
