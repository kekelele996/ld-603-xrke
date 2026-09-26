export interface MaintenanceResult {
  device_id: number;
  device_code: string;
  result_status: string;
  building_id: number;
  building_name: string;
  floor: string;
  hazard_ticket_ids: number[];
  previous_next_maintenance_at: string;
  next_maintenance_at: string;
  message: string;
}
