import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, CircleAlert, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getEduApiLogs, getFlaskLogs, type LogQuery } from "@/services/logs";
import type { LogEntry, LogLevel, LogPage } from "@/types/log";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const levels: Array<LogLevel | "all"> = ["all", "Trace", "Debug", "Information", "Warning", "Error", "Fatal"];
type System = "edu" | "flask";
const emptyPage: LogPage = { page: 1, pageSize: 50, total: 0, totalPages: 0, items: [] };

function levelVariant(level: string) {
  if (level === "Error" || level === "Fatal") return "destructive" as const;
  if (level === "Warning") return "secondary" as const;
  return "outline" as const;
}

function LogTable({ items }: { items: LogEntry[] }) {
  return <div className="rounded-2xl border border-border/50 overflow-hidden">
    <Table>
      <TableHeader><TableRow className="bg-muted/30 hover:bg-muted/30">
        <TableHead>时间</TableHead><TableHead>级别</TableHead><TableHead>来源</TableHead><TableHead>消息</TableHead><TableHead>异常</TableHead>
      </TableRow></TableHeader>
      <TableBody>{items.length === 0 ? <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">暂无日志</TableCell></TableRow> : items.map((item, index) => <TableRow key={`${item.timestamp}-${index}`}>
        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</TableCell>
        <TableCell><Badge variant={levelVariant(item.level)}>{item.level}</Badge></TableCell>
        <TableCell className="max-w-48 truncate text-xs">{item.source || "-"}</TableCell>
        <TableCell className="min-w-64 max-w-105 whitespace-pre-wrap break-words text-sm">{item.message}</TableCell>
        <TableCell className="max-w-80 whitespace-pre-wrap break-words text-xs text-destructive">{item.exception || "-"}</TableCell>
      </TableRow>)}</TableBody>
    </Table>
  </div>;
}

export default function LogsPage() {
  const [system, setSystem] = useState<System>("edu");
  const [pages, setPages] = useState<Record<System, LogPage>>({ edu: emptyPage, flask: emptyPage });
  const [queries, setQueries] = useState<Record<System, LogQuery>>({ edu: { page: 1, pageSize: 50 }, flask: { page: 1, pageSize: 50 } });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (target: System, query: LogQuery) => {
    setLoading(true); setError(null);
    try {
      const result = target === "edu" ? await getEduApiLogs(query) : await getFlaskLogs(query);
      setPages((current) => ({ ...current, [target]: result }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载日志失败";
      setError(message); toast.error(message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(system, queries[system]), 0);
    return () => window.clearTimeout(timer);
    // The active system controls loading; query changes are submitted explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [system, load]);
  const page = pages[system]; const query = queries[system];
  const updateQuery = (next: Partial<LogQuery>) => setQueries((current) => ({ ...current, [system]: { ...current[system], ...next } }));
  const refresh = () => void load(system, query);
  const submitSearch = (event: FormEvent) => { event.preventDefault(); const next = { ...query, page: 1 }; updateQuery(next); void load(system, next); };
  const changePage = (pageNumber: number) => { const next = { ...query, page: pageNumber }; updateQuery(next); void load(system, next); };

  return <div className="mx-auto max-w-7xl">
    <div className="mb-8"><h1 className="text-3xl font-bold tracking-tight">系统日志</h1><p className="mt-1.5 text-muted-foreground">查看两个系统的运行日志</p></div>
    <div className="mb-5 flex gap-2 border-b border-border/50">
      {([['edu', 'XAUAT EduApi'], ['flask', 'xauat_login_flask']] as const).map(([key, label]) => <button key={key} onClick={() => setSystem(key)} className={`border-b-2 px-3 py-2 text-sm font-medium ${system === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>{label}</button>)}
    </div>
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <form onSubmit={submitSearch} className="flex min-w-60 flex-1 gap-2"><Input value={query.search || ""} onChange={(event) => updateQuery({ search: event.target.value })} placeholder="搜索消息、来源或异常..." /><Button type="submit">搜索</Button></form>
      <Select value={query.level || "all"} onValueChange={(value) => { const next = { ...query, level: value === "all" ? undefined : value as LogLevel, page: 1 }; updateQuery(next); void load(system, next); }}><SelectTrigger className="w-40"><SelectValue placeholder="最低级别" /></SelectTrigger><SelectContent>{levels.map((level) => <SelectItem key={level} value={level}>{level === "all" ? "全部级别" : level}</SelectItem>)}</SelectContent></Select>
      <Button variant="outline" size="icon" onClick={refresh} disabled={loading} title="刷新"><RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} /></Button>
    </div>
    {error ? <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"><CircleAlert className="size-4" />{error}</div> : null}
    <LogTable items={page.items} />
    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground"><span>共 {page.total} 条，第 {page.totalPages ? query.page : 0}/{page.totalPages} 页</span><div className="flex gap-1"><Button variant="outline" size="icon-sm" onClick={() => changePage(query.page - 1)} disabled={loading || query.page <= 1}><ChevronLeft className="size-4" /></Button><Button variant="outline" size="icon-sm" onClick={() => changePage(query.page + 1)} disabled={loading || query.page >= page.totalPages}><ChevronRight className="size-4" /></Button></div></div>
  </div>;
}
