export const MAINTENANCE_INTERVAL_DAYS: Record<string, number> = {
  EXTINGUISHER: 30,
  HYDRANT: 90,
  SMOKE_DETECTOR: 180,
  SPRINKLER: 365,
  EXIT_LIGHT: 365
};

export const MaintenanceResultStatus = ["UPDATED", "KEPT", "SKIPPED_HAZARD", "NOT_FOUND", "UNKNOWN_TYPE"] as const;
export type MaintenanceResultStatus = (typeof MaintenanceResultStatus)[number];

export const MaintenanceResultStatusText: Record<MaintenanceResultStatus, string> = {
  UPDATED: "已登记",
  KEPT: "保留原计划",
  SKIPPED_HAZARD: "已跳过",
  NOT_FOUND: "设备不存在",
  UNKNOWN_TYPE: "未知类型"
};
