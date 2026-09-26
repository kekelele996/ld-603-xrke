import { useEffect, useMemo, useState } from "react";
import { listBuilding } from "../api/Building";
import { DeviceTypeText } from "../constants/DeviceType";
import { MAINTENANCE_INTERVAL_TEXT } from "../constants/MaintenanceInterval";
import { StatusBadge } from "../components/common/StatusBadge";
import { DeviceLocationCell } from "../components/common/DeviceLocationCell";
import { EmptyState } from "../components/common/EmptyState";
import { StatCard } from "../components/common/StatCard";
import { useFireDeviceStore } from "../stores/FireDeviceStore";
import { useMaintenanceStore } from "../stores/MaintenanceStore";
import type { Building } from "../types/Building";
import type { DeviceType } from "../types/DeviceType";
import type { FireDevice } from "../types/FireDevice";
import type { MaintenanceItemResult } from "../types/Maintenance";
import { formatDay } from "../utils/formatters";
import { isDue, todayKey } from "../utils/maintenance";

type DueFilter = "all" | "due";

const deviceTypeLabel = (value: string) =>
  DeviceTypeText[value as DeviceType] ?? value;

const deviceStatusText: Record<string, string> = {
  NORMAL: "正常",
  HAZARD_PENDING: "隐患待整改",
  DISABLED: "停用"
};

function MaintenanceResultPanel({ items }: { items: MaintenanceItemResult[] }) {
  if (!items.length) return <EmptyState title="登记后，这里会逐台显示安排结果或跳过原因" />;
  return (
    <div className="result-list">
      {items.map((item) => (
        <article
          key={`${item.device_id}-${item.result}`}
          className={`result-item ${item.result === "SKIPPED" ? "skipped" : "registered"}`}
        >
          <div className="result-item-head">
            <StatusBadge value={item.result === "REGISTERED" ? "已登记" : "已跳过"} />
            <strong>{item.device_code}</strong>
            <span className="muted">{deviceTypeLabel(item.device_type)}</span>
          </div>
          {item.result === "REGISTERED" ? (
            <p className="result-detail">
              {item.building_name} {item.floor}（{item.location_desc}）已于 {item.last_maintenance_at}{" "}
              登记维保，{MAINTENANCE_INTERVAL_TEXT[item.device_type as DeviceType]}，
              下次维保日期 <strong>{item.next_maintenance_at}</strong>
              {item.previous_maintenance_at &&
                item.next_maintenance_at === item.previous_maintenance_at &&
                "（原计划日期更晚，已保留不提前）"}
            </p>
          ) : (
            <p className="result-detail warning">
              楼栋：{item.building_name}　楼层：{item.floor}　隐患单号：
              <strong>{item.hazard_ticket_no}</strong>
              <br />
              {item.skipped_reason}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}

export function DevicesPage() {
  const { rows, loading, load } = useFireDeviceStore();
  const { lastResult, submitting, register } = useMaintenanceStore();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [dueFilter, setDueFilter] = useState<DueFilter>("all");
  const [buildingFilter, setBuildingFilter] = useState<string>("all");
  const [registerDate, setRegisterDate] = useState<string>(todayKey());

  useEffect(() => {
    void load(false);
    void listBuilding().then(setBuildings);
  }, [load]);

  const buildingMap = useMemo(
    () => new Map(buildings.map((building) => [building.id, building])),
    [buildings]
  );

  const visibleRows = useMemo(() => {
    return rows.filter((device) => {
      if (dueFilter === "due" && !isDue(device.next_maintenance_at)) return false;
      if (buildingFilter !== "all" && device.building_id !== Number(buildingFilter)) return false;
      return true;
    });
  }, [rows, dueFilter, buildingFilter]);

  const dueCount = useMemo(
    () => rows.filter((device) => isDue(device.next_maintenance_at)).length,
    [rows]
  );

  const visibleIds = visibleRows.map((device) => device.id);
  const allVisibleChecked = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleChecked) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleRegister = async () => {
    if (!selected.size || submitting) return;
    await register(Array.from(selected), registerDate);
    setSelected(new Set());
    await load(dueFilter === "due");
  };

  const renderRow = (device: FireDevice) => {
    const due = isDue(device.next_maintenance_at);
    const buildingName = buildingMap.get(device.building_id)?.name ?? `楼栋${device.building_id}`;
    return (
      <tr key={device.id} className={due ? "row-due" : ""}>
        <td>
          <input
            type="checkbox"
            checked={selected.has(device.id)}
            onChange={() => toggleOne(device.id)}
            aria-label={`选择 ${device.device_code}`}
          />
        </td>
        <td>
          <strong>{device.device_code}</strong>
        </td>
        <td>{deviceTypeLabel(device.device_type)}</td>
        <td>
          <DeviceLocationCell
            title={`${buildingName} · ${device.floor}`}
            value={device.location_desc}
          />
        </td>
        <td>{deviceStatusText[device.status] ?? device.status}</td>
        <td>{formatDay(device.last_maintenance_at)}</td>
        <td className={due ? "date-due" : ""}>
          {formatDay(device.next_maintenance_at)}
          {due && <StatusBadge value="已到期" />}
        </td>
        <td>{MAINTENANCE_INTERVAL_TEXT[device.device_type as DeviceType] ?? "—"}</td>
      </tr>
    );
  };

  return (
    <section className="page devices-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">fire-inspect / devices</p>
          <h1>消防设备台账</h1>
          <p className="muted">勾选多台设备批量登记维保，按设备类型排下次维保日期；同层有未关闭隐患的设备逐台跳过。</p>
        </div>
        <StatusBadge value={dueFilter === "due" ? "已到期筛选" : "全部设备"} />
      </div>

      <section className="metrics">
        <StatCard label="设备总数" value={rows.length} />
        <StatCard label="已到期设备" value={dueCount} />
        <StatCard label="本次勾选" value={selected.size} />
      </section>

      <section className="panel">
        <div className="toolbar">
          <div className="filters">
            <label>
              到期筛选
              <select value={dueFilter} onChange={(event) => setDueFilter(event.target.value as DueFilter)}>
                <option value="all">全部设备</option>
                <option value="due">仅看已到期</option>
              </select>
            </label>
            <label>
              楼栋
              <select value={buildingFilter} onChange={(event) => setBuildingFilter(event.target.value)}>
                <option value="all">全部楼栋</option>
                {buildings.map((building) => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              维保登记日期
              <input type="date" value={registerDate} onChange={(event) => setRegisterDate(event.target.value)} />
            </label>
          </div>
          <div className="actions">
            <button type="button" className="btn" onClick={toggleAllVisible} disabled={!visibleRows.length}>
              {allVisibleChecked ? "取消全选当前" : "全选当前"}
            </button>
            <button type="button" className="btn primary" onClick={handleRegister} disabled={!selected.size || submitting}>
              {submitting ? "登记中…" : `登记维保（${selected.size} 台）`}
            </button>
          </div>
        </div>

        <div className="table-wrap">
          {loading ? (
            <EmptyState title="加载中…" />
          ) : visibleRows.length ? (
            <table className="device-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input type="checkbox" checked={allVisibleChecked} onChange={toggleAllVisible} aria-label="全选当前" />
                  </th>
                  <th>设备编号</th>
                  <th>类型</th>
                  <th>楼栋/位置</th>
                  <th>状态</th>
                  <th>上次维保</th>
                  <th>下次维保</th>
                  <th>周期</th>
                </tr>
              </thead>
              <tbody>{visibleRows.map(renderRow)}</tbody>
            </table>
          ) : (
            <EmptyState title={dueFilter === "due" ? "当前没有已到期设备" : "暂无设备"} />
          )}
        </div>
      </section>

      <section className="panel">
        <h2>
          本次登记结果
          {lastResult && (
            <span className="muted">
              {" "}
              · 登记日期 {lastResult.register_date} · 已登记 {lastResult.summary.registered} 台 · 跳过{" "}
              {lastResult.summary.skipped} 台
            </span>
          )}
        </h2>
        {lastResult ? <MaintenanceResultPanel items={lastResult.items} /> : <EmptyState title="还未登记过维保" />}
      </section>
    </section>
  );
}
