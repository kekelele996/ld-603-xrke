import { create } from "zustand";
import { listFireDevice } from "../api/FireDevice";
import type { FireDevice } from "../types/FireDevice";

type State = {
  rows: FireDevice[];
  loading: boolean;
  load: (due?: boolean) => Promise<void>;
  setRows: (rows: FireDevice[]) => void;
};

export const useFireDeviceStore = create<State>((set) => ({
  rows: [],
  loading: false,
  async load(due = false) {
    set({ loading: true });
    set({ rows: await listFireDevice(due), loading: false });
  },
  setRows(rows) {
    set({ rows });
  }
}));
