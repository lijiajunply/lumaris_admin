import axios from "axios";
import type { ApiResponse } from "../types/api";

const XAUAT_BASE_URL = import.meta.env.VITE_XAUAT_API_BASE_URL ?? "https://xauatapi.xauat.site/";

const xauatRequest = axios.create({
  baseURL: XAUAT_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

xauatRequest.interceptors.request.use((config) => {
  const token = localStorage.getItem("lumaris-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

xauatRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const body = error.response.data as ApiResponse;
      return Promise.reject(new Error(body?.message || `请求失败 (${error.response.status})`));
    }
    return Promise.reject(error);
  },
);

export default xauatRequest;
