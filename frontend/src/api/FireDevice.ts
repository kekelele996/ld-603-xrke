import { mockData } from "../mocks/seedData";
import type { FireDevice } from "../types/FireDevice";
import { applyDeviceOverlay } from "../utils/maintenanceStorage";

const endpoint = "/api/fire-device";

export async function listFireDevice(due = false): Promise<FireDevice[]> {
  const query = due ? "?due=true" : "";
  if (typeof fetch !== "undefined") {
    try {
      const res = await fetch(`${endpoint}${query}`);
      if (res.ok) return applyDeviceOverlay(((await res.json()) as FireDevice[]) ?? []);
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return applyDeviceOverlay([...(mockData.fireDevice as unknown as FireDevice[])]);
}

export async function saveFireDevice(payload: FireDevice) {
  console.info("save FireDevice", payload);
  return payload;
}
