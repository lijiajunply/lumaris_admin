import request from "../xauat-request";
import type { ApiResponse } from "../../types/api";
import type { MapPoiFormData, MapPoiModel } from "../../types/map";

/** 导入单个 POI */
export async function importMapPoi(data: MapPoiFormData): Promise<void> {
  await request.post<ApiResponse>("/v1/map/import", data);
}

/** 批量导入 POI */
export async function importMapPoisBatch(data: MapPoiFormData[]): Promise<void> {
  await request.post<ApiResponse>("/v1/map/import/batch", data);
}

/** 清除所有 POI */
export async function clearMapPois(): Promise<void> {
  await request.delete<ApiResponse>("/v1/map/clear");
}

/** 更新 POI */
export async function updateMapPoi(id: number, data: Partial<MapPoiFormData>): Promise<MapPoiModel> {
  const res = await request.put<ApiResponse<MapPoiModel>>(`/v1/map/${id}`, data);
  return res.data.data!;
}

/** 删除单个 POI */
export async function deleteMapPoi(id: number): Promise<void> {
  await request.delete<ApiResponse>(`/v1/map/${id}`);
}
