import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, Loader2, Map, Table2, FileSpreadsheet, X, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import type { ColumnDef } from "@tanstack/react-table";
import { getMapPois, getMapCategories, getMapCampuses } from "@/services/map";
import { updateMapPoi, deleteMapPoi, importMapPoi, importMapPoisBatch } from "@/services/admin/map";
import type { MapPoiModel, MapPoiFormData } from "@/types/map";
import { DataTable } from "@/components/shared/data-table";
import { SearchInput } from "@/components/shared/search-input";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { MapView } from "@/components/shared/map-view";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MapManagementPage() {
  const [pois, setPois] = useState<MapPoiModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<MapPoiModel | null>(null);
  const [editForm, setEditForm] = useState<Partial<MapPoiFormData>>({});
  const [saving, setSaving] = useState(false);

  // Import dialog
  const [importOpen, setImportOpen] = useState(false);
  const [importForm, setImportForm] = useState<MapPoiFormData>({
    name: "",
    category: "",
    latitude: 0,
    longitude: 0,
    campus: "",
  });
  const [importing, setImporting] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<MapPoiModel | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Excel batch import
  const [excelOpen, setExcelOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<MapPoiFormData[]>([]);
  const [excelErrors, setExcelErrors] = useState<string[]>([]);
  const [excelImporting, setExcelImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // View mode: table or map
  const [viewMode, setViewMode] = useState<"table" | "map">("table");

  // Filter options
  const [categories, setCategories] = useState<string[]>([]);
  const [campuses, setCampuses] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [poiData, cats, camps] = await Promise.all([
        getMapPois(),
        getMapCategories(),
        getMapCampuses(),
      ]);
      setPois(poiData);
      setCategories(cats);
      setCampuses(camps);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = pois.filter(
    (p) =>
      (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase())) ||
      (p.campus && p.campus.toLowerCase().includes(search.toLowerCase()))
  );

  const openEdit = (poi: MapPoiModel) => {
    setEditing(poi);
    setEditForm({
      name: poi.name,
      category: poi.category,
      latitude: poi.latitude,
      longitude: poi.longitude,
      description: poi.description,
      address: poi.address,
      campus: poi.campus,
      icon: poi.icon,
      is_active: poi.is_active,
      sort_order: poi.sort_order,
    });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editing?.id) return;
    setSaving(true);
    try {
      const updated = await updateMapPoi(editing.id, { ...editing, ...editForm } as MapPoiModel);
      setPois((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      toast.success("更新成功");
      setEditOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "更新失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await deleteMapPoi(deleteTarget.id);
      setPois((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success("删除成功");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeleting(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      await importMapPoi(importForm);
      toast.success("导入成功");
      setImportOpen(false);
      setImportForm({ name: "", category: "", latitude: 0, longitude: 0, campus: "" });
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "导入失败");
    } finally {
      setImporting(false);
    }
  };

  const parseExcelFile = (file: File) => {
    setExcelFile(file);
    setExcelData([]);
    setExcelErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          toast.error("文件读取失败");
          return;
        }

        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          toast.error("Excel 文件中没有工作表");
          return;
        }

        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        if (rows.length === 0) {
          toast.error("Excel 文件为空");
          return;
        }

        const pois: MapPoiFormData[] = [];
        const errors: string[] = [];

        rows.forEach((row, i) => {
          const name = String(row["名称"] ?? row["name"] ?? "").trim();
          const category = String(row["分类"] ?? row["category"] ?? "").trim();
          const latitude = Number(row["纬度"] ?? row["latitude"] ?? 0);
          const longitude = Number(row["经度"] ?? row["longitude"] ?? 0);
          const campus = String(row["校区"] ?? row["campus"] ?? "").trim();
          const address = String(row["地址"] ?? row["address"] ?? "").trim();
          const description = String(row["描述"] ?? row["description"] ?? "").trim();

          if (!name) {
            errors.push(`第 ${i + 2} 行：名称为空`);
            return;
          }
          if (!latitude || !longitude || Number.isNaN(latitude) || Number.isNaN(longitude)) {
            errors.push(`第 ${i + 2} 行「${name}」：经纬度无效`);
            return;
          }

          pois.push({ name, category, latitude, longitude, campus, address, description });
        });

        setExcelData(pois);
        setExcelErrors(errors);

        if (pois.length === 0 && errors.length === 0) {
          toast.error("未能解析到有效数据，请检查 Excel 格式");
        }
      } catch {
        setExcelErrors(["Excel 文件解析失败，请确认文件格式正确"]);
        toast.error("Excel 解析失败");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseExcelFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseExcelFile(file);
  };

  const handleExcelImport = async () => {
    if (excelData.length === 0) return;
    setExcelImporting(true);
    try {
      await importMapPoisBatch(excelData);
      toast.success(`成功导入 ${excelData.length} 条数据`);
      setExcelOpen(false);
      setExcelFile(null);
      setExcelData([]);
      setExcelErrors([]);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "批量导入失败");
    } finally {
      setExcelImporting(false);
    }
  };

  const columns: ColumnDef<MapPoiModel, unknown>[] = [
    { accessorKey: "id", header: "ID", size: 60 },
    { accessorKey: "name", header: "名称" },
    { accessorKey: "category", header: "分类" },
    { accessorKey: "campus", header: "校区" },
    {
      accessorKey: "is_active",
      header: "状态",
      cell: ({ getValue }) => (
        <Badge variant={getValue() !== false ? "default" : "secondary"} className="rounded-lg text-xs">
          {getValue() !== false ? "启用" : "禁用"}
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
          <h1 className="text-3xl font-bold tracking-tight">地图管理</h1>
          <p className="text-muted-foreground mt-1.5">管理地图兴趣点数据</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border bg-muted/50 p-0.5">
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setViewMode("table")}
            >
              <Table2 className="size-3.5" />
              表格
            </button>
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "map"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setViewMode("map")}
            >
              <Map className="size-3.5" />
              地图
            </button>
          </div>
          <Button className="rounded-xl gap-2" onClick={() => setImportOpen(true)}>
            <Plus className="size-4" />
            导入 POI
          </Button>
          <Button variant="outline" className="rounded-xl gap-2" onClick={() => setExcelOpen(true)}>
            <FileSpreadsheet className="size-4" />
            批量导入
          </Button>
        </div>
      </div>

      {viewMode === "table" && (
        <div className="mb-6">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="搜索名称、分类或校区..."
            className="max-w-md"
          />
        </div>
      )}

      {!loading && pois.length === 0 ? (
        <EmptyState
          title="暂无地图数据"
          description="点击上方按钮导入第一个兴趣点"
          action={
            <Button className="rounded-xl gap-2" onClick={() => setImportOpen(true)}>
              <Plus className="size-4" />
              导入 POI
            </Button>
          }
        />
      ) : viewMode === "map" ? (
        <MapView
          pois={filtered}
          onMarkerClick={openEdit}
          className="h-[70vh] min-h-125 rounded-2xl overflow-hidden border"
        />
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-2xl sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑 POI</DialogTitle>
            <DialogDescription>修改兴趣点的信息</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>名称</Label>
                <Input
                  value={editForm.name ?? ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>分类</Label>
                <Input
                  value={editForm.category ?? ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>纬度</Label>
                <Input
                  type="number"
                  value={editForm.latitude ?? ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, latitude: Number(e.target.value) }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>经度</Label>
                <Input
                  type="number"
                  value={editForm.longitude ?? ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, longitude: Number(e.target.value) }))}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>校区</Label>
              <Select
                value={editForm.campus ?? ""}
                onValueChange={(v) => setEditForm((f) => ({ ...f, campus: v }))}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="选择校区" />
                </SelectTrigger>
                <SelectContent>
                  {campuses.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>地址</Label>
              <Input
                value={editForm.address ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>描述</Label>
              <Textarea
                value={editForm.description ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                className="rounded-xl"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} className="rounded-xl">
              取消
            </Button>
            <Button onClick={handleEdit} disabled={saving} className="rounded-xl">
              {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>导入 POI</DialogTitle>
            <DialogDescription>添加一个新的兴趣点到地图中</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label>名称 *</Label>
              <Input
                value={importForm.name}
                onChange={(e) => setImportForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="地点名称"
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>分类</Label>
                <Select
                  value={importForm.category}
                  onValueChange={(v) => setImportForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>校区</Label>
                <Select
                  value={importForm.campus ?? ""}
                  onValueChange={(v) => setImportForm((f) => ({ ...f, campus: v }))}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="选择校区" />
                  </SelectTrigger>
                  <SelectContent>
                    {campuses.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>纬度 *</Label>
                <Input
                  type="number"
                  value={importForm.latitude || ""}
                  onChange={(e) => setImportForm((f) => ({ ...f, latitude: Number(e.target.value) }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>经度 *</Label>
                <Input
                  type="number"
                  value={importForm.longitude || ""}
                  onChange={(e) => setImportForm((f) => ({ ...f, longitude: Number(e.target.value) }))}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>地址</Label>
              <Input
                value={importForm.address ?? ""}
                onChange={(e) => setImportForm((f) => ({ ...f, address: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>描述</Label>
              <Textarea
                value={importForm.description ?? ""}
                onChange={(e) => setImportForm((f) => ({ ...f, description: e.target.value }))}
                className="rounded-xl"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)} className="rounded-xl">
              取消
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing || !importForm.name.trim()}
              className="rounded-xl gap-2"
            >
              {importing ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              导入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Excel Batch Import Dialog */}
      <Dialog open={excelOpen} onOpenChange={(open) => { if (!open) { setExcelOpen(false); setExcelFile(null); setExcelData([]); setExcelErrors([]); } }}>
        <DialogContent className="rounded-2xl sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Excel 批量导入</DialogTitle>
            <DialogDescription>
              上传 Excel 文件（.xlsx / .xls），批量导入地图兴趣点
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* File Upload Area */}
            <div
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
                dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
              } ${excelFile ? "bg-muted/30" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {excelFile ? (
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="size-8 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">{excelFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(excelFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-lg ml-2"
                    onClick={() => { setExcelFile(null); setExcelData([]); setExcelErrors([]); }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <FileSpreadsheet className="size-10 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium mb-1">拖拽 Excel 文件到此处</p>
                  <p className="text-xs text-muted-foreground mb-3">或点击下方按钮选择文件</p>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    选择文件
                  </Button>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Column Format Hint */}
            {!excelFile && (
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-sm font-medium mb-2">Excel 列格式要求</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                  <div><span className="font-mono text-foreground">名称 *</span> — 必填，地点名称</div>
                  <div><span className="font-mono text-foreground">分类</span> — 地点分类</div>
                  <div><span className="font-mono text-foreground">纬度 *</span> — 必填，如 34.23</div>
                  <div><span className="font-mono text-foreground">经度 *</span> — 必填，如 108.96</div>
                  <div><span className="font-mono text-foreground">校区</span> — 所属校区</div>
                  <div><span className="font-mono text-foreground">地址</span> — 详细地址</div>
                  <div className="col-span-2"><span className="font-mono text-foreground">描述</span> — 备注信息</div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">也支持英文列名：name, category, latitude, longitude, campus, address, description</p>
              </div>
            )}

            {/* Parse Errors */}
            {excelErrors.length > 0 && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="size-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">{excelErrors.length} 行数据存在问题</span>
                </div>
                <ul className="text-xs text-destructive/80 space-y-0.5 max-h-32 overflow-y-auto">
                  {excelErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview Table */}
            {excelData.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  预览：共 <span className="text-primary">{excelData.length}</span> 条有效数据
                </p>
                <div className="rounded-xl border overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">#</th>
                          <th className="px-3 py-2 text-left font-medium">名称</th>
                          <th className="px-3 py-2 text-left font-medium">分类</th>
                          <th className="px-3 py-2 text-left font-medium">纬度</th>
                          <th className="px-3 py-2 text-left font-medium">经度</th>
                          <th className="px-3 py-2 text-left font-medium">校区</th>
                          <th className="px-3 py-2 text-left font-medium">地址</th>
                        </tr>
                      </thead>
                      <tbody>
                        {excelData.slice(0, 100).map((poi, i) => (
                          <tr key={i} className="border-t hover:bg-muted/30">
                            <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                            <td className="px-3 py-1.5 font-medium">{poi.name}</td>
                            <td className="px-3 py-1.5">{poi.category || "-"}</td>
                            <td className="px-3 py-1.5 font-mono">{poi.latitude}</td>
                            <td className="px-3 py-1.5 font-mono">{poi.longitude}</td>
                            <td className="px-3 py-1.5">{poi.campus || "-"}</td>
                            <td className="px-3 py-1.5 max-w-40 truncate">{poi.address || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {excelData.length > 100 && (
                      <p className="text-xs text-muted-foreground text-center py-2 border-t">
                        仅显示前 100 条，共 {excelData.length} 条
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setExcelOpen(false); setExcelFile(null); setExcelData([]); setExcelErrors([]); }} className="rounded-xl">
              取消
            </Button>
            <Button
              onClick={handleExcelImport}
              disabled={excelImporting || excelData.length === 0}
              className="rounded-xl gap-2"
            >
              {excelImporting ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              导入 {excelData.length > 0 ? `${excelData.length} 条` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="确认删除"
        description={`确定要删除「${deleteTarget?.name}」吗？此操作不可撤销。`}
        confirmLabel="删除"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
