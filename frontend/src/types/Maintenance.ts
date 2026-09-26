export type MaintenanceResultStatus = "REGISTERED" | "SKIPPED";

export interface MaintenanceItemResult {
  device_id: number;
  device_code: string;
  device_type: string;
  building_id: number;
  building_name: string;
  floor: string;
  location_desc: string;
  result: MaintenanceResultStatus;
  previous_maintenance_at: string;
  next_maintenance_at: string;
  last_maintenance_at: string;
  interval_days: number;
  skipped_reason: string;
  hazard_ticket_no: string;
}

export interface MaintenanceRegisterResponse {
  register_date: string;
  summary: { registered: number; skipped: number; total: number };
  items: MaintenanceItemResult[];
  log_template?: string;
}

export interface MaintenanceRegisterPayload {
  device_ids: number[];
  register_date?: string;
}
