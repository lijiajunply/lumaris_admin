import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { getAdminSchools, createSchool, updateSchool, deleteSchool } from "@/services/admin/school";
import type { School } from "@/types/school";
import { DataTable } from "@/components/shared/data-table";
import { SearchInput } from "@/components/shared/search-input";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function SchoolManagementPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<School | null>(null);
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formEnabled, setFormEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<School | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminSchools();
      setSchools(res.items);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setFormName("");
    setFormCode("");
    setFormEnabled(true);
    setFormOpen(true);
  };

  const openEdit = (school: School) => {
    setEditing(school);
    setFormName(school.name);
    setFormCode(school.code);
    setFormEnabled(school.enabled);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formCode.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateSchool(editing.code, {
          name: formName.trim(),
          code: formCode.trim(),
          enabled: formEnabled,
        });
        setSchools((prev) => prev.map((s) => (s.code === editing.code ? updated : s)));
        toast.success("更新成功");
      } else {
        const created = await createSchool({
          name: formName.trim(),
          code: formCode.trim(),
          enabled: formEnabled,
        });
        setSchools((prev) => [...prev, created]);
        toast.success("创建成功");
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSchool(deleteTarget.code);
      setSchools((prev) => prev.filter((s) => s.code !== deleteTarget.code));
      toast.success("删除成功");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<School, unknown>[] = [
    { accessorKey: "code", header: "代码" },
    { accessorKey: "name", header: "名称" },
    {
      accessorKey: "enabled",
      header: "状态",
      cell: ({ getValue }) => (
        <Badge variant={getValue() ? "default" : "secondary"} className="rounded-lg text-xs">
          {getValue() ? "已启用" : "未启用"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" className="rounded-lg" onClick={() => openEdit(row.original)}>
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-lg text-destructive hover:text-destructive"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">学校管理</h1>
          <p className="text-muted-foreground mt-1.5">管理学校数据</p>
        </div>
        <Button className="rounded-xl gap-2" onClick={openCreate}>
          <Plus className="size-4" />
          添加学校
        </Button>
      </div>

      <div className="mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="搜索名称或代码..."
          className="max-w-md"
        />
      </div>

      {!loading && schools.length === 0 ? (
        <EmptyState
          title="暂无学校数据"
          description="点击上方按钮添加第一个学校"
          action={
            <Button className="rounded-xl gap-2" onClick={openCreate}>
              <Plus className="size-4" />
              添加学校
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "编辑学校" : "添加学校"}</DialogTitle>
            <DialogDescription>
              {editing ? "修改学校信息" : "添加一个新的学校"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label>学校代码 *</Label>
              <Input
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="例如: xauat"
                className="rounded-xl"
                disabled={!!editing}
              />
            </div>
            <div className="space-y-1.5">
              <Label>学校名称 *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="例如: 西安建筑科技大学"
                className="rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="form-enabled"
                checked={formEnabled}
                onCheckedChange={(v) => setFormEnabled(!!v)}
                className="rounded"
              />
              <Label htmlFor="form-enabled" className="text-sm font-normal cursor-pointer">
                启用
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} className="rounded-xl">
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formName.trim() || !formCode.trim()}
              className="rounded-xl"
            >
              {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="确认删除"
        description={`确定要删除学校「${deleteTarget?.name}」吗？此操作不可撤销。`}
        confirmLabel="删除"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
