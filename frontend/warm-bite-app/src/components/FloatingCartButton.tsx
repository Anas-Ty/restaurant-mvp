import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface FloatingCartButtonProps {
  count: number;
  onClick: () => void;
}

export const FloatingCartButton = ({ count, onClick }: FloatingCartButtonProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button onClick={onClick} className="relative px-5 shadow-elegant hover-scale" aria-label="Open cart">
        <ShoppingCart className="mr-2" /> Cart
        {count > 0 && (
          <span className="absolute -top-2 -right-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-semibold text-destructive-foreground">
            {count}
          </span>
        )}
      </Button>
    </div>
  );
};

export default FloatingCartButton;
