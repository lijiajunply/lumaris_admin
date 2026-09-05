import xauatRequest from "./xauat-request";
import flaskRequest from "./flask-request";
import type { LogEntry, LogPage, LogLevel } from "@/types/log";

interface BackendLogPage { page?: number; Page?: number; page_size?: number; PageSize?: number; total?: number; Total?: number; total_pages?: number; TotalPages?: number; items?: LogEntry[]; Items?: LogEntry[] }
export interface LogQuery { page: number; pageSize: number; level?: LogLevel; search?: string }

function normalize(data: BackendLogPage): LogPage {
  return { page: data.page ?? data.Page ?? 1, pageSize: data.page_size ?? data.PageSize ?? 50, total: data.total ?? data.Total ?? 0, totalPages: data.total_pages ?? data.TotalPages ?? 0, items: data.items ?? data.Items ?? [] };
}

export async function getEduApiLogs(query: LogQuery): Promise<LogPage> {
  const response = await xauatRequest.get<BackendLogPage>("/Logs", { params: query });
  return normalize(response.data);
}

export async function getFlaskLogs(query: LogQuery): Promise<LogPage> {
  const response = await flaskRequest.get<BackendLogPage>("/Logs", { params: query });
  return normalize(response.data);
}
