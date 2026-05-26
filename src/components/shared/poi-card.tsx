import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MapPoiModel } from "@/types/map";
import { cn } from "@/lib/utils";

interface PoiCardProps {
  poi: MapPoiModel;
  className?: string;
}

export function PoiCard({ poi, className }: PoiCardProps) {
  return (
    <Link
      to={`/map/${poi.id}`}
      className={cn(
        "group block rounded-2xl border border-border/50 bg-card p-5 shadow-sm card-hover",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MapPin className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
            {poi.name}
          </h3>
          {poi.address && (
            <p className="text-sm text-muted-foreground mt-0.5 truncate">{poi.address}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {poi.category && (
              <Badge variant="secondary" className="rounded-lg text-xs font-normal">
                {poi.category}
              </Badge>
            )}
            {poi.campus && (
              <Badge variant="outline" className="rounded-lg text-xs font-normal">
                {poi.campus}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
