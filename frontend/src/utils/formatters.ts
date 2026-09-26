export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
export const isOverdue = (value: string) => {
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time <= Date.now();
};
export const addDaysIso = (days: number, from: Date = new Date()) =>
  new Date(from.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
