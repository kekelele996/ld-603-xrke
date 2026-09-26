import { useEffect, useMemo, useState } from "react";
import { useFireDeviceStore } from "../stores/FireDeviceStore";
import { useBuildingStore } from "../stores/BuildingStore";
import { DeviceTypeText } from "../constants/DeviceType";
import { MAINTENANCE_INTERVAL_DAYS, MaintenanceResultStatusText } from "../constants/MaintenanceCycle";
import { formatDate, isOverdue } from "../utils/formatters";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";

export function DevicesPage() {
  const { rows, loading, maintenanceResults, load, register } = useFireDeviceStore();
  const buildings = useBuildingStore((state) => state.rows);
  const loadBuildings = useBuildingStore((state) => state.load);
  const [selected, setSelected] = useState<number[]>([]);
  const [overdueOnly, setOverdueOnly] = useState(false);

  useEffect(() => {
    load();
    loadBuildings();
  }, []);

  const buildingName = (id: number) => buildings.find((row) => row.id === id)?.name ?? `#${id}`;
  const visible = useMemo(
    () => (overdueOnly ? rows.filter((row) => isOverdue(row.next_maintenance_at)) : rows),
    [rows, overdueOnly]
  );
  const allChecked = visible.length > 0 && visible.every((row) => selected.includes(row.id));

  const toggle = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  const toggleAll = () =>
    setSelected((prev) => {
      const visibleIds = visible.map((row) => row.id);
      return allChecked ? prev.filter((id) => !visibleIds.includes(id)) : [...new Set([...prev, ...visibleIds])];
    });
  const submit = async () => {
    await register(selected);
    setSelected([]);
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">fire-inspect</p>
          <h1>消防设备台账</h1>
        </div>
        <StatusBadge value={loading ? "LOADING" : "READY"} />
      </section>

      <section className="panel wide">
        <div className="toolbar">
          <div className="filters">
            <button className={overdueOnly ? "" : "active"} onClick={() => setOverdueOnly(false)}>全部设备</button>
            <button className={overdueOnly ? "active" : ""} onClick={() => setOverdueOnly(true)}>已到期</button>
          </div>
          <button className="primary" disabled={selected.length === 0 || loading} onClick={submit}>
            登记维保（已选 {selected.length} 台）
          </button>
        </div>
        {visible.length === 0 ? (
          <EmptyState title={overdueOnly ? "暂无已到期设备" : "暂无设备"} />
        ) : (
          <table className="device-table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={allChecked} onChange={toggleAll} /></th>
                <th>设备编号</th>
                <th>类型</th>
                <th>维保周期</th>
                <th>楼栋 / 楼层</th>
                <th>下次维保日期</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => {
                const overdue = isOverdue(row.next_maintenance_at);
                return (
                  <tr key={row.id} className={overdue ? "overdue" : ""}>
                    <td><input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggle(row.id)} /></td>
                    <td>{row.device_code}</td>
                    <td>{DeviceTypeText[row.device_type as keyof typeof DeviceTypeText] ?? row.device_type}</td>
                    <td>{MAINTENANCE_INTERVAL_DAYS[row.device_type] ?? "-"} 天</td>
                    <td>{buildingName(row.building_id)} / {row.floor}</td>
                    <td>{formatDate(row.next_maintenance_at)}</td>
                    <td><StatusBadge value={overdue ? "OVERDUE" : row.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className="panel wide">
        <h2>维保登记结果</h2>
        {maintenanceResults.length === 0 ? (
          <EmptyState title="勾选设备后点击“登记维保”，每台设备的处理结果会显示在这里" />
        ) : (
          <div className="table">
            {maintenanceResults.map((result) => (
              <article key={result.device_id} className="row result-row">
                <strong>{result.device_code || `设备 #${result.device_id}`}</strong>
                <StatusBadge value={result.result_status} />
                <span>
                  {MaintenanceResultStatusText[result.result_status as keyof typeof MaintenanceResultStatusText] ?? result.result_status}
                  {" · "}
                  {result.message}
                </span>
                {result.result_status === "SKIPPED_HAZARD" && (
                  <span className="hazard-ref">
                    楼栋 {result.building_name} · 楼层 {result.floor} · 隐患单号 {result.hazard_ticket_ids.map((id) => `#${id}`).join(", ")}
                  </span>
                )}
                {result.result_status !== "SKIPPED_HAZARD" && result.next_maintenance_at && (
                  <span className="hazard-ref">下次维保：{formatDate(result.next_maintenance_at)}</span>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
