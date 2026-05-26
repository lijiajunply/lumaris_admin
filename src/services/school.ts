import request from "./request";
import type { ApiResponse, PaginatedData } from "../types/api";
import type { School } from "../types/school";

/** 获取所有已启用学校 */
export async function getSchools(): Promise<PaginatedData<School>> {
  const res = await request.get<ApiResponse<PaginatedData<School>>>("/api/v1/schools");
  return res.data.data;
}

/** 获取指定学校详情 */
export async function getSchoolByCode(code: string): Promise<School> {
  const res = await request.get<ApiResponse<School>>(`/api/v1/schools/${encodeURIComponent(code)}`);
  return res.data.data;
}
