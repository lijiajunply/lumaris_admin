import request from "../request";
import type { ApiResponse, PaginatedData } from "../../types/api";
import type { School } from "../../types/school";

export interface SchoolFormData {
  code: string;
  name: string;
  enabled?: boolean;
}

/** 列出所有学校（含未启用） */
export async function getAdminSchools(): Promise<PaginatedData<School>> {
  const res = await request.get<ApiResponse<PaginatedData<School>>>("/api/v1/admin/schools");
  return res.data.data;
}

/** 新增学校 */
export async function createSchool(data: SchoolFormData): Promise<School> {
  const res = await request.post<ApiResponse<School>>("/api/v1/admin/schools", data);
  return res.data.data;
}

/** 更新学校（部分更新） */
export async function updateSchool(code: string, data: Partial<SchoolFormData>): Promise<School> {
  const res = await request.put<ApiResponse<School>>(
    `/api/v1/admin/schools/${encodeURIComponent(code)}`,
    data,
  );
  return res.data.data;
}

/** 删除学校 */
export async function deleteSchool(code: string): Promise<void> {
  await request.delete<ApiResponse<null>>(`/api/v1/admin/schools/${encodeURIComponent(code)}`);
}
