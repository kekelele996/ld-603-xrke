import { create } from "zustand";
import { registerMaintenance } from "../api/Maintenance";
import type { MaintenanceRegisterResponse } from "../types/Maintenance";
import {
  loadLastMaintenanceResult,
  mergeDeviceOverlay,
  saveLastMaintenanceResult
} from "../utils/maintenanceStorage";

type State = {
  lastResult: MaintenanceRegisterResponse | null;
  submitting: boolean;
  register: (deviceIds: number[], registerDate?: string) => Promise<MaintenanceRegisterResponse>;
};

export const useMaintenanceStore = create<State>((set) => ({
  // 重新进入页面时仍能看到每台设备的登记结果
  lastResult: loadLastMaintenanceResult(),
  submitting: false,
  async register(deviceIds, registerDate) {
    set({ submitting: true });
    const response = await registerMaintenance({ device_ids: deviceIds, register_date: registerDate });
    mergeDeviceOverlay(response);
    saveLastMaintenanceResult(response);
    set({ lastResult: response, submitting: false });
    return response;
  }
}));
