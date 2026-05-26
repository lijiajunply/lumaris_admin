import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Tag, Building2, Navigation } from "lucide-react";
import { toast } from "sonner";
import { getMapPoiById } from "@/services/map";
import type { MapPoiModel } from "@/types/map";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function MapDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [poi, setPoi] = useState<MapPoiModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getMapPoiById(Number(id))
      .then(setPoi)
      .catch((err) => toast.error(err instanceof Error ? err.message : "加载失败"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <LoadingSkeleton variant="detail" />
      </div>
    );
  }

  if (!poi) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <MapPin className="size-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-muted-foreground">地点未找到</h2>
        <p className="text-sm text-muted-foreground/60 mt-1">该地点可能已被删除或不存在</p>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate("/map")}>
          返回地图
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Button
        variant="ghost"
        className="mb-6 rounded-xl -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/map")}
      >
        <ArrowLeft className="size-4 mr-2" />
        返回地图
      </Button>

      <div className="rounded-3xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="aspect-[21/9] bg-gradient-to-br from-primary/10 via-primary/5 to-muted flex items-center justify-center">
          <MapPin className="size-16 text-primary/30" />
        </div>

        <div className="p-6 lg:p-8">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{poi.name}</h1>

          <div className="flex flex-wrap gap-2 mt-3">
            {poi.category && <Badge className="rounded-lg text-xs">{poi.category}</Badge>}
            {poi.campus && (
              <Badge variant="outline" className="rounded-lg text-xs">
                {poi.campus}
              </Badge>
            )}
            {poi.is_active === false && (
              <Badge variant="secondary" className="rounded-lg text-xs">
                未启用
              </Badge>
            )}
          </div>

          <div className="grid gap-4 mt-8">
            {poi.address && (
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                  <Navigation className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">地址</p>
                  <p className="text-sm mt-0.5">{poi.address}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                <MapPin className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">坐标</p>
                <p className="text-sm mt-0.5 font-mono">
                  {poi.latitude}, {poi.longitude}
                </p>
              </div>
            </div>

            {poi.category && (
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                  <Tag className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">分类</p>
                  <p className="text-sm mt-0.5">{poi.category}</p>
                </div>
              </div>
            )}

            {poi.campus && (
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                  <Building2 className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">校区</p>
                  <p className="text-sm mt-0.5">{poi.campus}</p>
                </div>
              </div>
            )}
          </div>

          {poi.description && (
            <div className="mt-8 pt-6 border-t border-border/50">
              <h3 className="text-sm font-semibold mb-2">简介</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{poi.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
