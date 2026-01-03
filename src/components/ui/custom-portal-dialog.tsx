import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  modal?: boolean;
}

export const CustomDialog = ({ open, onOpenChange, children }: CustomDialogProps) => {
  if (!open) return null;

  return (
    <>
      {children}
    </>
  );
};

interface CustomDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  overlayClassName?: string;
  showOverlay?: boolean;
  position?: "fixed" | "absolute" | "sticky" | "static" | "relative";
  centered?: boolean;
  portal?: boolean;
}

export const CustomDialogContent = React.forwardRef<HTMLDivElement, CustomDialogContentProps>(
  (
    {
      className,
      overlayClassName,
      showOverlay = true,
      position = "fixed",
      centered = true,
      portal = true,
      children,
      ...props
    },
    ref
  ) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    const positionClass =
      position === "sticky"
        ? "sticky"
        : position === "fixed"
          ? "fixed"
          : position === "relative"
            ? "relative"
            : position === "static"
              ? "static"
              : "absolute";

    const centeredClass =
      centered && (position === "fixed" || position === "absolute")
        ? "left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]"
        : position === "sticky"
          ? "top-4"
          : "";

    const content = (
      <>
        {/* Overlay */}
        {showOverlay && (
          <div
            className={cn(
              "dialog-overlay fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm animate-in fade-in-0",
              overlayClassName
            )}
          />
        )}

        {/* Content */}
        <div
          ref={ref}
          role="dialog"
          aria-modal={showOverlay ? true : undefined}
          className={cn(
            "dialog-content z-[61] grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 sm:rounded-lg max-h-[90vh] overflow-y-auto",
            positionClass,
            centeredClass,
            className
          )}
          {...props}
        >
          {children}
        </div>
      </>
    );

    return portal ? createPortal(content, document.body) : content;
  }
);
CustomDialogContent.displayName = "CustomDialogContent";

export const CustomDialogHeader = ({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
CustomDialogHeader.displayName = "CustomDialogHeader";

export const CustomDialogFooter = ({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
CustomDialogFooter.displayName = "CustomDialogFooter";

interface CustomDialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CustomDialogTitle = React.forwardRef<HTMLHeadingElement, CustomDialogTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
);
CustomDialogTitle.displayName = "CustomDialogTitle";

interface CustomDialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const CustomDialogDescription = React.forwardRef<HTMLParagraphElement, CustomDialogDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
CustomDialogDescription.displayName = "CustomDialogDescription";

interface CustomDialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClose: () => void;
}

export const CustomDialogClose = ({ onClose, className, ...props }: CustomDialogCloseProps) => (
  <button
    onClick={onClose}
    className={cn(
      "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close</span>
  </button>
);
CustomDialogClose.displayName = "CustomDialogClose";
