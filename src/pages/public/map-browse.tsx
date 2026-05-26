import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Filter, SlidersHorizontal } from "lucide-react";
import { getMapPois, getMapPoisByCategory, getMapPoisByCampus, searchMapPois } from "@/services/map";
import type { MapPoiModel } from "@/types/map";
import { SearchInput } from "@/components/shared/search-input";
import { FilterSidebar } from "@/components/shared/filter-sidebar";
import { PoiCard } from "@/components/shared/poi-card";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";

export default function MapBrowsePage() {
  const [pois, setPois] = useState<MapPoiModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCampuses, setSelectedCampuses] = useState<string[]>([]);
  const isMobile = useMediaQuery("(max-width: 1023px)");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function fetchData() {
      try {
        let result: MapPoiModel[];
        if (search.trim()) {
          result = await searchMapPois(search.trim());
        } else if (selectedCategories.length > 0) {
          const results = await Promise.all(selectedCategories.map((c) => getMapPoisByCategory(c)));
          result = results.flat();
        } else if (selectedCampuses.length > 0) {
          const results = await Promise.all(selectedCampuses.map((c) => getMapPoisByCampus(c)));
          result = results.flat();
        } else {
          result = await getMapPois();
        }

        // Apply campus filter on top of results when both categories and campuses are selected
        if (selectedCampuses.length > 0 && search.trim()) {
          result = result.filter((p) => p.campus && selectedCampuses.includes(p.campus));
        }

        if (!cancelled) setPois(result);
      } catch (err) {
        if (!cancelled) toast.error(err instanceof Error ? err.message : "加载失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [search, selectedCategories, selectedCampuses]);

  const hasFilters = selectedCategories.length > 0 || selectedCampuses.length > 0;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">地图探索</h1>
        <p className="text-muted-foreground mt-1.5">浏览和搜索校园地图中的兴趣点</p>
      </div>

      <div className="flex gap-6">
        {!isMobile && (
          <aside className="w-56 shrink-0">
            <div className="sticky top-20 rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">筛选</h3>
              </div>
              <FilterSidebar
                selectedCategories={selectedCategories}
                selectedCampuses={selectedCampuses}
                onCategoriesChange={setSelectedCategories}
                onCampusesChange={setSelectedCampuses}
              />
            </div>
          </aside>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-6">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="搜索地点名称..."
              className="flex-1 max-w-md"
            />
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant={hasFilters ? "default" : "outline"} size="icon" className="rounded-xl shrink-0">
                    <Filter className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <SlidersHorizontal className="size-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">筛选</h3>
                  </div>
                  <FilterSidebar
                    selectedCategories={selectedCategories}
                    selectedCampuses={selectedCampuses}
                    onCategoriesChange={setSelectedCategories}
                    onCampusesChange={setSelectedCampuses}
                  />
                </SheetContent>
              </Sheet>
            )}
          </div>

          {loading ? (
            <LoadingSkeleton variant="card" count={6} />
          ) : pois.length === 0 ? (
            <EmptyState
              title="没有找到地点"
              description={search || hasFilters ? "试试调整搜索关键词或筛选条件" : "暂无地图数据"}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pois.map((poi) => (
                <PoiCard key={poi.id} poi={poi} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
