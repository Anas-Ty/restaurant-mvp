import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryBarProps {
  categories: string[];
  active: string;
  onChange: (cat: string) => void;
}

export const CategoryBar = ({ categories, active, onChange }: CategoryBarProps) => {
  return (
    <nav aria-label="Menu categories" className="w-full border-b bg-background">
      <div className="container py-3 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant="pill"
              size="sm"
              onClick={() => onChange(cat)}
              className={cn(
                "px-4",
                active === cat && "bg-primary text-primary-foreground"
              )}
              aria-pressed={active === cat}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CategoryBar;
