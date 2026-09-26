import type { DeviceType } from "../types/DeviceType";

// 维保周期（天），与 backend/src/constants/maintenance_interval.py 保持一致
export const MAINTENANCE_INTERVAL_DAYS: Record<DeviceType, number> = {
  EXTINGUISHER: 30,
  HYDRANT: 90,
  SMOKE_DETECTOR: 180,
  SPRINKLER: 365,
  EXIT_LIGHT: 365
};

export const MAINTENANCE_INTERVAL_TEXT: Record<DeviceType, string> = {
  EXTINGUISHER: "每30天",
  HYDRANT: "每90天",
  SMOKE_DETECTOR: "每180天",
  SPRINKLER: "每365天",
  EXIT_LIGHT: "每365天"
};
