import request from "./xauat-request";
import type { ApiResponse } from "../types/api";
import type { MapPoiModel } from "../types/map";

/** 获取所有 POI 点位 */
export async function getMapPois(): Promise<MapPoiModel[]> {
  const res = await request.get<ApiResponse<MapPoiModel[]>>("/api/v1/map");
  return res.data.data ?? [];
}

/** 按分类获取 POI 点位 */
export async function getMapPoisByCategory(category: string): Promise<MapPoiModel[]> {
  const res = await request.get<ApiResponse<MapPoiModel[]>>(
    `/api/v1/map/category/${encodeURIComponent(category)}`,
  );
  return res.data.data ?? [];
}

/** 按校区获取 POI 点位 */
export async function getMapPoisByCampus(campus: string): Promise<MapPoiModel[]> {
  const res = await request.get<ApiResponse<MapPoiModel[]>>(
    `/api/v1/map/campus/${encodeURIComponent(campus)}`,
  );
  return res.data.data ?? [];
}

/** 获取单个 POI 详情 */
export async function getMapPoiById(id: number): Promise<MapPoiModel | null> {
  const res = await request.get<ApiResponse<MapPoiModel>>(`/api/v1/map/${id}`);
  return res.data.data ?? null;
}

/** 按关键词搜索 POI */
export async function searchMapPois(keyword: string): Promise<MapPoiModel[]> {
  const res = await request.get<ApiResponse<MapPoiModel[]>>("/api/v1/map/search", {
    params: { keyword },
  });
  return res.data.data ?? [];
}

/** 获取所有分类列表 */
export async function getMapCategories(): Promise<string[]> {
  const res = await request.get<ApiResponse<string[]>>("/api/v1/map/categories");
  return res.data.data ?? [];
}

/** 获取所有校区列表 */
export async function getMapCampuses(): Promise<string[]> {
  const res = await request.get<ApiResponse<string[]>>("/api/v1/map/campuses");
  return res.data.data ?? [];
}

