import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, Trash } from "lucide-react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  onInc: (id: string) => void;
  onDec: (id: string) => void;
  onRemove: (id: string) => void;
  subtotal: number;
  notes: string;
  onNotesChange: (val: string) => void;
  onCheckout: () => void;
}

export const CartSheet = ({ open, onOpenChange, items, onInc, onDec, onRemove, subtotal, notes, onNotesChange, onCheckout }: CartSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your order</SheetTitle>
          <SheetDescription>Review items, adjust quantities, and add a note.</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          )}
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-3">
              <img src={it.image} alt={it.name} className="h-14 w-14 rounded-md object-cover" loading="lazy" />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium leading-tight">{it.name}</div>
                    <div className="text-xs text-muted-foreground">${(it.price * it.quantity).toFixed(2)}</div>
                  </div>
                  <Button variant="ghost" size="icon" aria-label={`Remove ${it.name}`} onClick={() => onRemove(it.id)}>
                    <Trash />
                  </Button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Button variant="secondary" size="circle" onClick={() => onDec(it.id)} aria-label={`Decrease ${it.name}`} disabled={it.quantity === 1}>
                    <Minus />
                  </Button>
                  <span className="min-w-6 text-center text-sm tabular-nums">{it.quantity}</span>
                  <Button variant="secondary" size="circle" onClick={() => onInc(it.id)} aria-label={`Increase ${it.name}`}>
                    <Plus />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="text-base font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          <Textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Any special requests?"
            className="min-h-24"
            aria-label="Special notes"
          />
        </div>

        <SheetFooter className="mt-4">
          <Button className="w-full" variant="hero" onClick={onCheckout} aria-label="Proceed to checkout">
            Checkout
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
