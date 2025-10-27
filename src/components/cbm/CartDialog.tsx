import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CartItem {
  id: string;
  title: string;
  author: string;
  cote: string;
}

interface CartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export function CartDialog({ isOpen, onClose, items, onRemoveItem, onClearCart }: CartDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Mon panier de réservations
          </DialogTitle>
          <DialogDescription>
            {items.length === 0 
              ? "Votre panier est vide"
              : `${items.length} ouvrage${items.length > 1 ? 's' : ''} dans votre panier`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun ouvrage dans le panier</p>
              <p className="text-sm mt-2">Parcourez le catalogue pour ajouter des ouvrages</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                <BookOpen className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{item.author}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{item.cote}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveItem(item.id)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {items.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={onClearCart}
                className="w-full sm:w-auto"
              >
                Vider le panier
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  navigate("/user/book-reservations");
                }}
                className="w-full sm:w-auto"
              >
                Réserver tous les ouvrages
              </Button>
            </>
          )}
          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Continuer mes recherches
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
