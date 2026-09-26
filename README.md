# 消防设施巡检维保平台

面向园区和物业公司的消防设备巡检、隐患整改、维保计划和合规台账系统。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20103>

后端健康检查：<http://localhost:21103/health>


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Material UI + Redux Toolkit |
| 后端 | FastAPI + Python 3.11 + SQLAlchemy 2.0 |
| 数据库 | PostgreSQL 15 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `fire-inspect`
- `FRONTEND_PORT`: 前端端口，默认 `20103`
- `BACKEND_PORT`: 后端端口，默认 `21103`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: fire-inspect`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-fire-inspect}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- DeviceType: constants/DeviceType、types/DeviceType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- InspectionStatus: constants/InspectionStatus、types/InspectionStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- HazardSeverity: constants/HazardSeverity、types/HazardSeverity、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- MaintenanceInterval（灭火器30/消火栓90/烟感180/喷淋365/应急灯365 天）：后端 `constants/maintenance_interval.py`、前端 `constants/MaintenanceInterval.ts`，被 `services/maintenance_service.py`、`utils/maintenance.ts`、设备台账页周期列共同引用。

## 设备维保批量登记（台账处理）

入口：消防设备台账 `/devices`，勾选多台设备后点击「登记维保」。

1. 下次维保日期按设备类型周期从登记日期顺延：灭火器 30 天、消火栓 90 天、烟感 180 天、喷淋 365 天、应急灯 365 天；原计划日期更晚时保留原计划，不提前。
2. 设备所在楼栋同层存在未关闭隐患单（`rectify_status != CLOSED` 且 `closed_at` 为空，经 `inspectionResult.device_id` 关联同层设备）时，只跳过这一台，结果中写明楼栋、楼层与隐患单号（`ticket_no`，如 YH-2026-0002），其余设备照常写入。
3. 设备页「到期筛选」可筛出已到期设备（下次维保日期 ≤ 今天）。
4. 新日期和每台登记结果通过 `POST /api/maintenance/register` 写入内存库；前端同时用 localStorage 覆盖层保存，重新进入页面仍能看到新日期和最近一次每台结果，后端离线时自动回退到同规则的本地实现。

后端触点：`constants/maintenance_interval.py`、`types/maintenance_payload.py`、`constructors/maintenance_factory.py`、`services/maintenance_service.py`、`controllers/maintenance_controller.py`、`routes/maintenance_routes.py`、`utils/date_utils.py`、`repositories/*`。
前端触点：`api/Maintenance.ts`、`stores/MaintenanceStore.ts`、`types/Maintenance.ts`、`constructors/MaintenanceConstructor.ts`、`utils/maintenance.ts`、`utils/maintenanceStorage.ts`、`pages/DevicesPage.tsx`。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
