import type { FireDevice } from "../types/FireDevice";
import type { MaintenanceRegisterResponse } from "../types/Maintenance";

// 重新进入页面时仍能看到新日期与每台结果：本地覆盖层 + 最近一次登记结果
const DEVICE_OVERLAY_KEY = "fire-inspect:fire-device-overlay";
const LAST_RESULTS_KEY = "fire-inspect:maintenance-last-results";

type DeviceOverlay = Record<string, Pick<FireDevice, "next_maintenance_at" | "last_maintenance_at">>;

export function loadDeviceOverlay(): DeviceOverlay {
  try {
    return JSON.parse(localStorage.getItem(DEVICE_OVERLAY_KEY) ?? "{}") as DeviceOverlay;
  } catch {
    return {};
  }
}

export function applyDeviceOverlay(devices: FireDevice[]): FireDevice[] {
  const overlay = loadDeviceOverlay();
  return devices.map((device) => {
    const patch = overlay[String(device.id)];
    return patch ? { ...device, ...patch } : device;
  });
}

export function mergeDeviceOverlay(response: MaintenanceRegisterResponse): DeviceOverlay {
  const overlay = loadDeviceOverlay();
  response.items
    .filter((item) => item.result === "REGISTERED")
    .forEach((item) => {
      overlay[String(item.device_id)] = {
        next_maintenance_at: item.next_maintenance_at,
        last_maintenance_at: item.last_maintenance_at
      };
    });
  localStorage.setItem(DEVICE_OVERLAY_KEY, JSON.stringify(overlay));
  return overlay;
}

export function loadLastMaintenanceResult(): MaintenanceRegisterResponse | null {
  try {
    const raw = localStorage.getItem(LAST_RESULTS_KEY);
    return raw ? (JSON.parse(raw) as MaintenanceRegisterResponse) : null;
  } catch {
    return null;
  }
}

export function saveLastMaintenanceResult(response: MaintenanceRegisterResponse): void {
  localStorage.setItem(LAST_RESULTS_KEY, JSON.stringify(response));
}
