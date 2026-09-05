export type LogLevel = "Trace" | "Debug" | "Information" | "Warning" | "Error" | "Fatal";

export interface LogEntry {
  timestamp: string;
  level: LogLevel | string;
  message: string;
  source?: string | null;
  exception?: string | null;
}

export interface LogPage {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: LogEntry[];
}
