import { MAINTENANCE_INTERVAL_DAYS } from "../constants/MaintenanceInterval";
import type { Building } from "../types/Building";
import type { FireDevice } from "../types/FireDevice";
import type { HazardTicket } from "../types/HazardTicket";
import type { InspectionResult } from "../types/InspectionResult";
import type { MaintenanceItemResult, MaintenanceRegisterResponse } from "../types/Maintenance";

export const parseDay = (value?: string): Date | null => {
  if (!value) return null;
  const text = String(value).trim().slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

export const toDayKey = (value: Date): string => {
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${value.getFullYear()}-${month}-${day}`;
};

export const todayKey = (): string => toDayKey(new Date());

export const addDays = (base: Date, days: number): Date => {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
};

/** 原计划更晚的不要提前：取“登记日+周期”与“原计划日期”中更晚者。 */
export const resolveNextMaintenance = (
  deviceType: string,
  registerDate: string,
  previous: string
): string => {
  const registerDay = parseDay(registerDate) ?? new Date();
  const interval = MAINTENANCE_INTERVAL_DAYS[deviceType as keyof typeof MAINTENANCE_INTERVAL_DAYS] ?? 0;
  const proposed = addDays(registerDay, interval);
  const previousDay = parseDay(previous);
  if (!previousDay) return toDayKey(proposed);
  return toDayKey(proposed >= previousDay ? proposed : previousDay);
};

export const isDue = (nextMaintenanceAt: string, today = todayKey()): boolean => {
  const target = parseDay(nextMaintenanceAt);
  const current = parseDay(today);
  if (!target || !current) return false;
  return target.getTime() <= current.getTime();
};

export const formatHazardTicketNo = (ticket: HazardTicket): string =>
  ticket.ticket_no || `YH-${String(ticket.id).padStart(4, "0")}`;

export const isOpenHazard = (ticket: HazardTicket): boolean =>
  ticket.rectify_status !== "CLOSED" && !ticket.closed_at;

/** 找出某楼栋某楼层未关闭隐患单（同层任一设备的异常结果触发即命中）。 */
export const findOpenHazardOnFloor = (
  devices: FireDevice[],
  results: InspectionResult[],
  tickets: HazardTicket[],
  buildingId: number,
  floor: string
): HazardTicket | null => {
  const floorDeviceIds = new Set(
    devices
      .filter((device) => device.building_id === buildingId && device.floor === floor)
      .map((device) => device.id)
  );
  const resultIds = new Set(
    results.filter((result) => floorDeviceIds.has(result.device_id)).map((result) => result.id)
  );
  return tickets.find((ticket) => resultIds.has(ticket.result_id) && isOpenHazard(ticket)) ?? null;
};

export interface LocalMaintenanceContext {
  devices: FireDevice[];
  buildings: Building[];
  results: InspectionResult[];
  tickets: HazardTicket[];
}

/** 后端离线时的本地回退实现，规则与 MaintenanceService 保持一致。 */
export const computeMaintenanceLocally = (
  deviceIds: number[],
  registerDate: string,
  context: LocalMaintenanceContext
): MaintenanceRegisterResponse => {
  const dateKey = registerDate || todayKey();
  const buildingMap = new Map(context.buildings.map((building) => [building.id, building]));
  const items: MaintenanceItemResult[] = [];

  deviceIds.forEach((deviceId) => {
    const device = context.devices.find((row) => row.id === deviceId);
    if (!device) return;
    const building = buildingMap.get(device.building_id);
    const buildingName = building?.name ?? `楼栋${device.building_id}`;
    const previous = device.next_maintenance_at ?? "";
    const interval =
      MAINTENANCE_INTERVAL_DAYS[device.device_type as keyof typeof MAINTENANCE_INTERVAL_DAYS] ?? 0;
    const openTicket = findOpenHazardOnFloor(
      context.devices,
      context.results,
      context.tickets,
      device.building_id,
      device.floor
    );

    if (openTicket) {
      const ticketNo = formatHazardTicketNo(openTicket);
      items.push({
        device_id: device.id,
        device_code: device.device_code,
        device_type: device.device_type,
        building_id: device.building_id,
        building_name: buildingName,
        floor: device.floor,
        location_desc: device.location_desc,
        result: "SKIPPED",
        previous_maintenance_at: previous,
        next_maintenance_at: previous,
        last_maintenance_at: device.last_maintenance_at ?? "",
        interval_days: interval,
        skipped_reason: `${buildingName} ${device.floor} 存在未关闭隐患单 ${ticketNo}，按规则跳过该设备，本次不登记维保`,
        hazard_ticket_no: ticketNo
      });
      return;
    }

    const next = resolveNextMaintenance(device.device_type, dateKey, previous);
    items.push({
      device_id: device.id,
      device_code: device.device_code,
      device_type: device.device_type,
      building_id: device.building_id,
      building_name: buildingName,
      floor: device.floor,
      location_desc: device.location_desc,
      result: "REGISTERED",
      previous_maintenance_at: previous,
      next_maintenance_at: next,
      last_maintenance_at: dateKey,
      interval_days: interval,
      skipped_reason: "",
      hazard_ticket_no: ""
    });
  });

  const registered = items.filter((item) => item.result === "REGISTERED").length;
  return {
    register_date: dateKey,
    summary: { registered, skipped: items.length - registered, total: items.length },
    items
  };
};
