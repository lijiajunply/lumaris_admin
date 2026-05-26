/** 地图 POI 点位 */
export interface MapPoiModel {
  id?: number;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  description?: string;
  address?: string;
  campus?: string;
  icon?: string;
  is_active?: boolean;
  sort_order?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** 地图 POI 表单数据（用于导入） */
export interface MapPoiFormData {
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  description?: string;
  address?: string;
  campus?: string;
  icon?: string;
  is_active?: boolean;
  sort_order?: number;
}
