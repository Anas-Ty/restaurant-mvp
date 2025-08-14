import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
};

interface MenuCardProps {
  item: MenuItem;
  quantity: number;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}

export const MenuCard = ({ item, quantity, onIncrement, onDecrement }: MenuCardProps) => {
  return (
    <article className="group rounded-lg border bg-card text-card-foreground shadow-soft hover:shadow-elegant transition-shadow">
      <div className="p-3">
        <div className="relative overflow-hidden rounded-md">
          <img
            src={item.image}
            alt={`${item.name} — appetizing ${item.category.toLowerCase()}`}
            loading="lazy"
            className="h-44 w-full object-cover"
          />
        </div>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold leading-tight">{item.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-sm font-semibold text-primary">${item.price.toFixed(2)}</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="circle"
              onClick={() => onDecrement(item.id)}
              aria-label={`Decrease ${item.name}`}
              disabled={quantity === 0}
            >
              <Minus />
            </Button>
            <span className="min-w-6 text-center tabular-nums">{quantity}</span>
            <Button
              variant="secondary"
              size="circle"
              onClick={() => onIncrement(item.id)}
              aria-label={`Increase ${item.name}`}
            >
              <Plus />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default MenuCard;
