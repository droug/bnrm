import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const ScrollableDialog = DialogPrimitive.Root;
const ScrollableDialogTrigger = DialogPrimitive.Trigger;
const ScrollableDialogPortal = DialogPrimitive.Portal;
const ScrollableDialogClose = DialogPrimitive.Close;

const ScrollableDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
ScrollableDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/**
 * ScrollableDialogContent - Composant de dialogue optimisé pour les longs formulaires
 * 
 * Caractéristiques:
 * - Hauteur maximale de 85vh pour garantir la visibilité complète
 * - Structure flex pour séparer header, contenu scrollable et footer
 * - Le contenu principal scrolle indépendamment
 * - Header et footer restent fixes
 * 
 * Usage:
 * <ScrollableDialog>
 *   <ScrollableDialogContent className="max-w-2xl">
 *     <ScrollableDialogHeader>
 *       <ScrollableDialogTitle>Titre</ScrollableDialogTitle>
 *       <ScrollableDialogDescription>Description</ScrollableDialogDescription>
 *     </ScrollableDialogHeader>
 *     
 *     <ScrollableDialogBody>
 *       Contenu qui scrolle ici
 *     </ScrollableDialogBody>
 *     
 *     <ScrollableDialogFooter>
 *       Boutons d'action
 *     </ScrollableDialogFooter>
 *   </ScrollableDialogContent>
 * </ScrollableDialog>
 */
const ScrollableDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <ScrollableDialogPortal>
    <ScrollableDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%]",
        "border bg-background shadow-lg duration-200",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "sm:rounded-lg",
        "max-h-[90vh] h-auto", // Augmenté à 90vh pour plus d'espace
        "flex flex-col", // Structure flex pour layout optimal
        "overflow-hidden", // Empêche le scroll sur le container principal
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </ScrollableDialogPortal>
));
ScrollableDialogContent.displayName = DialogPrimitive.Content.displayName;

/**
 * ScrollableDialogHeader - Header fixe en haut du dialogue
 * Ne scrolle pas avec le contenu
 */
const ScrollableDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      "p-4 pb-3 flex-shrink-0", // Padding réduit
      className
    )}
    {...props}
  />
);
ScrollableDialogHeader.displayName = "ScrollableDialogHeader";

/**
 * ScrollableDialogBody - Corps scrollable du dialogue
 * Contient le contenu principal qui peut défiler
 */
const ScrollableDialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "overflow-y-auto overflow-x-hidden", // Active le scroll vertical
      "flex-1 min-h-0", // min-h-0 crucial pour permettre le scroll dans un flex container
      "px-4 py-3", // Padding réduit
      className
    )}
    {...props}
  />
);
ScrollableDialogBody.displayName = "ScrollableDialogBody";

/**
 * ScrollableDialogFooter - Footer fixe en bas du dialogue
 * Ne scrolle pas avec le contenu
 */
const ScrollableDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      "p-4 pt-3 flex-shrink-0 border-t", // Padding réduit
      "bg-background", // Background pour masquer le contenu qui scrolle en dessous
      className
    )}
    {...props}
  />
);
ScrollableDialogFooter.displayName = "ScrollableDialogFooter";

const ScrollableDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
ScrollableDialogTitle.displayName = DialogPrimitive.Title.displayName;

const ScrollableDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
ScrollableDialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  ScrollableDialog,
  ScrollableDialogPortal,
  ScrollableDialogOverlay,
  ScrollableDialogClose,
  ScrollableDialogTrigger,
  ScrollableDialogContent,
  ScrollableDialogHeader,
  ScrollableDialogBody,
  ScrollableDialogFooter,
  ScrollableDialogTitle,
  ScrollableDialogDescription,
};
