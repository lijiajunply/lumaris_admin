/** 统一响应格式 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** 分页列表响应 */
export interface PaginatedData<T> {
  total: number;
  items: T[];
}
