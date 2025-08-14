import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export const Header = () => {
  return (
    <header className="w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-secondary shadow-soft" aria-hidden />
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight">Appetito</span>
            <span className="text-xs text-muted-foreground">Fresh • Fast • Delicious</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Order something tasty in seconds</span>
          <Button variant="hero" className="px-5">
            <ShoppingCart className="mr-2" /> Start order
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
