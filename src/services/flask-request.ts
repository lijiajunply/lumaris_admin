import axios from "axios";
import type { ApiResponse } from "../types/api";

const flaskRequest = axios.create({
  baseURL: import.meta.env.VITE_FLASK_API_BASE_URL ?? "http://localhost:6173/",
  headers: { "Content-Type": "application/json" },
});

flaskRequest.interceptors.request.use((config) => {
  const token = localStorage.getItem("lumaris-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

flaskRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const body = error.response.data as ApiResponse;
      return Promise.reject(new Error(body?.message || `请求失败 (${error.response.status})`));
    }
    return Promise.reject(error);
  },
);

export default flaskRequest;
