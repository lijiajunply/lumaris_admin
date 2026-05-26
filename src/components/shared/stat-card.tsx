import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
}

export function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
          <Loader2 className="size-5 text-muted-foreground animate-spin" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-16 rounded-full bg-muted" />
          <div className="h-6 w-12 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}
