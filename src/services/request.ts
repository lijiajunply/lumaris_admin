import axios from "axios";
import type { ApiResponse } from "../types/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://luminous.xauat.site/";

const instance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// 请求拦截：自动从 localStorage 读取 token 附加到请求头
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("lumaris-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
