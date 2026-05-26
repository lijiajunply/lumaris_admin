import axios from "axios";
import type { ApiResponse } from "../types/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

const instance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/** 设置 Admin 接口所需的 Bearer token */
export function setAdminToken(token: string): void {
  instance.defaults.headers.common.Authorization = `Bearer ${token}`;
}

/** 清除 Admin token */
export function clearAdminToken(): void {
  delete instance.defaults.headers.common.Authorization;
}

// 响应拦截：统一处理错误
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const body = error.response.data as ApiResponse;
      return Promise.reject(new Error(body?.message || `请求失败 (${error.response.status})`));
    }
    return Promise.reject(error);
  },
);

export default instance;
