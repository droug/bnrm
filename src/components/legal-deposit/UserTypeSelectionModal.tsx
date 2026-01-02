import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, Printer } from "lucide-react";

interface UserTypeSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: "editeur" | "imprimeur") => void;
}

export function UserTypeSelectionModal({
  open,
  onOpenChange,
  onSelectType
}: UserTypeSelectionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Type de déclarant</DialogTitle>
          <DialogDescription>
            Sélectionnez votre qualité pour effectuer le dépôt légal
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5"
            onClick={() => onSelectType("editeur")}
          >
            <Building2 className="h-10 w-10 text-primary" />
            <span className="text-lg font-medium">Éditeur</span>
          </Button>

          <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5"
            onClick={() => onSelectType("imprimeur")}
          >
            <Printer className="h-10 w-10 text-primary" />
            <span className="text-lg font-medium">Imprimeur</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
