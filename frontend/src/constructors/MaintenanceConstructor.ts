import type { MaintenanceItemResult } from "../types/Maintenance";

export const createMaintenanceItemResult = (
  overrides: Partial<MaintenanceItemResult> = {}
): MaintenanceItemResult => ({
  device_id: 0,
  device_code: "",
  device_type: "EXTINGUISHER",
  building_id: 0,
  building_name: "",
  floor: "",
  location_desc: "",
  result: "REGISTERED",
  previous_maintenance_at: "",
  next_maintenance_at: "",
  last_maintenance_at: "",
  interval_days: 30,
  skipped_reason: "",
  hazard_ticket_no: "",
  ...overrides
});
