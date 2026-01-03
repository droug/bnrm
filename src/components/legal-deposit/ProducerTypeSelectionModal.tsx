import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Film } from "lucide-react";

interface ProducerTypeSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: "producteur") => void;
}

export function ProducerTypeSelectionModal({
  open,
  onOpenChange,
  onSelectType
}: ProducerTypeSelectionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Type de déclarant</DialogTitle>
          <DialogDescription>
            Confirmez votre qualité pour effectuer le dépôt légal audiovisuel
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            className="h-32 w-48 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5"
            onClick={() => onSelectType("producteur")}
          >
            <Film className="h-10 w-10 text-primary" />
            <span className="text-lg font-medium">Producteur</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
