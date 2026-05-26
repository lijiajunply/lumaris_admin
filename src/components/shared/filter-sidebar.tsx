import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getMapCategories, getMapCampuses } from "@/services/map";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  selectedCategories: string[];
  selectedCampuses: string[];
  onCategoriesChange: (cats: string[]) => void;
  onCampusesChange: (campuses: string[]) => void;
  className?: string;
}

export function FilterSidebar({
  selectedCategories,
  selectedCampuses,
  onCategoriesChange,
  onCampusesChange,
  className,
}: FilterSidebarProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [campuses, setCampuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [cats, camps] = await Promise.all([getMapCategories(), getMapCampuses()]);
        setCategories(cats);
        setCampuses(camps);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleCategory = (cat: string) => {
    onCategoriesChange(
      selectedCategories.includes(cat)
        ? selectedCategories.filter((c) => c !== cat)
        : [...selectedCategories, cat]
    );
  };

  const toggleCampus = (campus: string) => {
    onCampusesChange(
      selectedCampuses.includes(campus)
        ? selectedCampuses.filter((c) => c !== campus)
        : [...selectedCampuses, campus]
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h4 className="text-sm font-semibold mb-3 tracking-tight">分类</h4>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full rounded-lg" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无分类</p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat} className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${cat}`}
                  checked={selectedCategories.includes(cat)}
                  onCheckedChange={() => toggleCategory(cat)}
                  className="rounded"
                />
                <Label htmlFor={`cat-${cat}`} className="text-sm font-normal cursor-pointer">
                  {cat}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-3 tracking-tight">校区</h4>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full rounded-lg" />
            ))}
          </div>
        ) : campuses.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无校区</p>
        ) : (
          <div className="space-y-2">
            {campuses.map((campus) => (
              <div key={campus} className="flex items-center gap-2">
                <Checkbox
                  id={`campus-${campus}`}
                  checked={selectedCampuses.includes(campus)}
                  onCheckedChange={() => toggleCampus(campus)}
                  className="rounded"
                />
                <Label htmlFor={`campus-${campus}`} className="text-sm font-normal cursor-pointer">
                  {campus}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
