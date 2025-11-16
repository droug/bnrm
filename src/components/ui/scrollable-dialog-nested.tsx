import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const ScrollableDialogNested = ({ children, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) => (
  <DialogPrimitive.Root modal={false} {...props}>
    {children}
  </DialogPrimitive.Root>
);

const ScrollableDialogNestedPortal = DialogPrimitive.Portal;
const ScrollableDialogNestedClose = DialogPrimitive.Close;

const ScrollableDialogNestedOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "dialog-overlay fixed inset-0 bg-black/20 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    style={{ zIndex: 100 }}
    {...props}
  />
));
ScrollableDialogNestedOverlay.displayName = "ScrollableDialogNestedOverlay";

const ScrollableDialogNestedContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <ScrollableDialogNestedPortal>
    <ScrollableDialogNestedOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "dialog-content fixed left-[50%] top-[50%] w-full translate-x-[-50%] translate-y-[-50%]",
        "border bg-background shadow-lg duration-200",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "sm:rounded-lg",
        "max-h-[90vh] h-auto",
        "flex flex-col",
        "overflow-hidden",
        className
      )}
      style={{ zIndex: 101 }}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </ScrollableDialogNestedPortal>
));
ScrollableDialogNestedContent.displayName = "ScrollableDialogNestedContent";

const ScrollableDialogNestedHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      "p-4 pb-3 flex-shrink-0",
      className
    )}
    {...props}
  />
);
ScrollableDialogNestedHeader.displayName = "ScrollableDialogNestedHeader";

const ScrollableDialogNestedBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "overflow-y-auto overflow-x-hidden",
      "flex-1 min-h-0",
      "px-4 py-3",
      className
    )}
    {...props}
  />
);
ScrollableDialogNestedBody.displayName = "ScrollableDialogNestedBody";

const ScrollableDialogNestedFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      "p-4 pt-3 flex-shrink-0 border-t",
      "bg-background",
      className
    )}
    {...props}
  />
);
ScrollableDialogNestedFooter.displayName = "ScrollableDialogNestedFooter";

const ScrollableDialogNestedTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
ScrollableDialogNestedTitle.displayName = "ScrollableDialogNestedTitle";

const ScrollableDialogNestedDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
ScrollableDialogNestedDescription.displayName = "ScrollableDialogNestedDescription";

export {
  ScrollableDialogNested,
  ScrollableDialogNestedPortal,
  ScrollableDialogNestedOverlay,
  ScrollableDialogNestedClose,
  ScrollableDialogNestedContent,
  ScrollableDialogNestedHeader,
  ScrollableDialogNestedBody,
  ScrollableDialogNestedFooter,
  ScrollableDialogNestedTitle,
  ScrollableDialogNestedDescription,
};
