import { create } from "zustand";
import { listFireDevice, registerMaintenance } from "../api/FireDevice";
import type { FireDevice } from "../types/FireDevice";
import type { MaintenanceResult } from "../types/MaintenanceResult";

const STORAGE_KEY = "fire-inspect.maintenance-results";

function restoreResults(): MaintenanceResult[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as MaintenanceResult[];
  } catch {
    return [];
  }
}

type State = {
  rows: FireDevice[];
  loading: boolean;
  maintenanceResults: MaintenanceResult[];
  load: () => Promise<void>;
  register: (deviceIds: number[]) => Promise<void>;
};

export const useFireDeviceStore = create<State>((set) => ({
  rows: [],
  loading: false,
  maintenanceResults: restoreResults(),
  async load() {
    set({ loading: true });
    set({ rows: await listFireDevice(), loading: false });
  },
  async register(deviceIds) {
    set({ loading: true });
    const maintenanceResults = await registerMaintenance(deviceIds);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(maintenanceResults));
    } catch {
      // Storage may be unavailable; the in-memory state still covers re-entry.
    }
    set({ maintenanceResults, rows: await listFireDevice(), loading: false });
  }
}));
