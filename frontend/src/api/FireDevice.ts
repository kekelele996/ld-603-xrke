import { mockData } from "../mocks/seedData";
import { MAINTENANCE_INTERVAL_DAYS } from "../constants/MaintenanceCycle";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { createMaintenanceResult } from "../constructors/FireDeviceConstructor";
import { addDaysIso } from "../utils/formatters";
import type { FireDevice } from "../types/FireDevice";
import type { MaintenanceResult } from "../types/MaintenanceResult";

const endpoint = "/api/fire-device";

// Mutable local copy so the offline fallback behaves like the backend ledger.
let localDevices: FireDevice[] = (mockData.fireDevice as unknown as FireDevice[]).map((row) => ({ ...row }));

export async function listFireDevice(): Promise<FireDevice[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return localDevices.map((row) => ({ ...row }));
}

function localRegisterMaintenance(deviceIds: number[]): MaintenanceResult[] {
  const resultsById = new Map(mockData.inspectionResult.map((row) => [row.id, row]));
  const openHazards = mockData.hazardTicket.filter((ticket) => ticket.rectify_status !== "CLOSED");
  const buildingName = (id: number) => mockData.building.find((row) => row.id === id)?.name ?? String(id);
  console.info(LOG_TEMPLATES.FireDevice[4], deviceIds);
  return deviceIds.map((deviceId) => {
    const device = localDevices.find((row) => row.id === deviceId);
    if (!device) {
      return createMaintenanceResult({ device_id: deviceId, result_status: "NOT_FOUND", message: ERROR_MESSAGES.DEVICE_NOT_FOUND });
    }
    const hazardIds = openHazards
      .filter((ticket) => {
        const result = resultsById.get(ticket.result_id);
        const hazardDevice = localDevices.find((row) => row.id === result?.device_id);
        return hazardDevice?.building_id === device.building_id && hazardDevice?.floor === device.floor;
      })
      .map((ticket) => ticket.id);
    if (hazardIds.length > 0) {
      return createMaintenanceResult({
        device_id: device.id,
        device_code: device.device_code,
        result_status: "SKIPPED_HAZARD",
        building_id: device.building_id,
        building_name: buildingName(device.building_id),
        floor: device.floor,
        hazard_ticket_ids: [...hazardIds],
        previous_next_maintenance_at: device.next_maintenance_at,
        next_maintenance_at: device.next_maintenance_at,
        message: `楼栋 ${buildingName(device.building_id)} ${device.floor} 存在未关闭隐患（单号 ${hazardIds.map((id) => "#" + id).join(", ")}），跳过该设备`
      });
    }
    const interval = MAINTENANCE_INTERVAL_DAYS[device.device_type];
    const computed = addDaysIso(interval ?? 0);
    if (interval === undefined || new Date(device.next_maintenance_at).getTime() > new Date(computed).getTime()) {
      return createMaintenanceResult({
        device_id: device.id,
        device_code: device.device_code,
        result_status: interval === undefined ? "UNKNOWN_TYPE" : "KEPT",
        building_id: device.building_id,
        building_name: buildingName(device.building_id),
        floor: device.floor,
        previous_next_maintenance_at: device.next_maintenance_at,
        next_maintenance_at: device.next_maintenance_at,
        message: interval === undefined ? `未知设备类型 ${device.device_type}` : `原计划 ${device.next_maintenance_at} 更晚，保留原日期`
      });
    }
    const previous = device.next_maintenance_at;
    device.next_maintenance_at = computed;
    return createMaintenanceResult({
      device_id: device.id,
      device_code: device.device_code,
      result_status: "UPDATED",
      building_id: device.building_id,
      building_name: buildingName(device.building_id),
      floor: device.floor,
      previous_next_maintenance_at: previous,
      next_maintenance_at: computed,
      message: `已登记维保，下次维保日期 ${computed}（周期 ${interval} 天）`
    });
  });
}

export async function registerMaintenance(deviceIds: number[]): Promise<MaintenanceResult[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(`${endpoint}/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_ids: deviceIds })
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.results as MaintenanceResult[];
      }
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return localRegisterMaintenance(deviceIds);
}

export async function saveFireDevice(payload: FireDevice) {
  console.info("save FireDevice", payload);
  return payload;
}
