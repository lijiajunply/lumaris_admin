export type Feature =
  | "timetable"
  | "grade_query"
  | "gpa_calculation"
  | "course_schedule"
  | "exam_schedule"
  | "login"
  | "bus_schedule"
  | "program"
  | "study_progress"
  | "electricity"
  | "payment"
  | "map";

export const FEATURE_LABELS: Record<Feature, string> = {
  timetable: "日历",
  grade_query: "成绩查询",
  gpa_calculation: "GPA计算",
  course_schedule: "课程显示",
  exam_schedule: "考试安排",
  login: "登录",
  bus_schedule: "校车时刻表",
  program: "培养方案",
  study_progress: "学业进度",
  electricity: "电费查询",
  payment: "校园卡",
  map: "校园地图",
};

export const ALL_FEATURES: Feature[] = Object.keys(FEATURE_LABELS) as Feature[];

export interface School {
  code: string;
  name: string;
  website: string;
  features: Feature[];
  enabled: boolean;
  created_at: string;
  updated_at: string;
}
