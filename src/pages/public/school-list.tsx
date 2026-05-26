import { useEffect, useState } from "react";
import { toast } from "sonner";
import { School, Search } from "lucide-react";
import { getSchools } from "@/services/school";
import type { School as SchoolType } from "@/types/school";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function SchoolListPage() {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getSchools()
      .then((res) => setSchools(res.items))
      .catch((err) => toast.error(err instanceof Error ? err.message : "加载失败"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">学校目录</h1>
        <p className="text-muted-foreground mt-1.5">浏览已注册的学校列表</p>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索学校名称或代码..."
          className="rounded-xl pl-9 h-11"
        />
      </div>

      {loading ? (
        <LoadingSkeleton variant="card" count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="size-16" />}
          title="没有找到学校"
          description={search ? "试试调整搜索关键词" : "暂无已注册的学校"}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((school) => (
            <div
              key={school.code}
              className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm card-hover"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <School className="size-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-base truncate">{school.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5 font-mono">{school.code}</p>
                </div>
                <Badge
                  variant={school.enabled ? "default" : "secondary"}
                  className="rounded-lg text-xs shrink-0 ml-auto"
                >
                  {school.enabled ? "已启用" : "未启用"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
