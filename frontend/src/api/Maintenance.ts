import { mockData } from "../mocks/seedData";
import type { Building } from "../types/Building";
import type { FireDevice } from "../types/FireDevice";
import type { HazardTicket } from "../types/HazardTicket";
import type { InspectionResult } from "../types/InspectionResult";
import type { MaintenanceRegisterPayload, MaintenanceRegisterResponse } from "../types/Maintenance";
import { computeMaintenanceLocally } from "../utils/maintenance";
import { applyDeviceOverlay } from "../utils/maintenanceStorage";

const endpoint = "/api/maintenance/register";

export async function registerMaintenance(
  payload: MaintenanceRegisterPayload
): Promise<MaintenanceRegisterResponse> {
  if (typeof fetch !== "undefined") {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) return (await res.json()) as MaintenanceRegisterResponse;
    } catch {
      // 后端离线时使用本地同规则实现，保证台账页可独立评审
    }
  }
  const devices: FireDevice[] = applyDeviceOverlay(mockData.fireDevice as unknown as FireDevice[]);
  return computeMaintenanceLocally(payload.device_ids, payload.register_date ?? "", {
    devices,
    buildings: mockData.building as unknown as Building[],
    results: mockData.inspectionResult as unknown as InspectionResult[],
    tickets: mockData.hazardTicket as unknown as HazardTicket[]
  });
}
