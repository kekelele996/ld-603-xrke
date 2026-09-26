from datetime import date

from src.constants.log_templates import LOG_TEMPLATES
from src.constants.maintenance_interval import MAINTENANCE_INTERVAL_DAYS
from src.constructors.maintenance_factory import (
    create_maintenance_item_result,
    create_maintenance_summary,
)
from src.repositories.building_repository import BuildingRepository
from src.repositories.fire_device_repository import FireDeviceRepository
from src.repositories.hazard_ticket_repository import HazardTicketRepository
from src.repositories.inspection_result_repository import InspectionResultRepository
from src.utils.date_utils import add_days, format_day, later_of, parse_day
from src.utils.formatters import format_hazard_ticket_no


class MaintenanceService:
    """多台设备批量登记维保：按类型排下次日期，同层未关闭隐患逐台跳过。"""

    def __init__(self):
        self.device_repo = FireDeviceRepository()
        self.building_repo = BuildingRepository()
        self.result_repo = InspectionResultRepository()
        self.hazard_repo = HazardTicketRepository()

    def register(self, payload):
        device_ids = payload.get("device_ids") or []
        register_day = parse_day(payload.get("register_date")) or date.today()
        register_date = format_day(register_day)

        devices = self.device_repo.find_by_ids(device_ids)
        devices_by_id = {int(row["id"]): row for row in devices}
        buildings = {int(row["id"]): row for row in self.building_repo.find_all()}

        items = []
        for device_id in device_ids:
            device = devices_by_id.get(int(device_id))
            if device is None:
                continue
            items.append(self._register_one(device, buildings, register_date))

        registered = sum(1 for item in items if item["result"] == "REGISTERED")
        skipped = len(items) - registered
        return {
            "register_date": register_date,
            "summary": create_maintenance_summary(registered, skipped),
            "items": items,
            "log_template": LOG_TEMPLATES["FireDevice"][4],
        }

    def _register_one(self, device, buildings, register_date):
        building = buildings.get(int(device["building_id"]))
        building_name = building["name"] if building else f"楼栋{device['building_id']}"
        previous = str(device.get("next_maintenance_at") or "")
        open_ticket = self._find_open_hazard_on_floor(
            int(device["building_id"]), str(device["floor"])
        )

        common = {
            "device_id": int(device["id"]),
            "device_code": device["device_code"],
            "device_type": device["device_type"],
            "building_id": int(device["building_id"]),
            "building_name": building_name,
            "floor": str(device["floor"]),
            "location_desc": device.get("location_desc", ""),
            "previous_maintenance_at": previous,
            "interval_days": MAINTENANCE_INTERVAL_DAYS.get(device["device_type"], 0),
        }

        if open_ticket is not None:
            ticket_no = format_hazard_ticket_no(open_ticket)
            return create_maintenance_item_result(
                **common,
                result="SKIPPED",
                next_maintenance_at=previous,
                last_maintenance_at=str(device.get("last_maintenance_at") or ""),
                skipped_reason=(
                    f"{building_name} {device['floor']} 存在未关闭隐患单 {ticket_no}，"
                    "按规则跳过该设备，本次不登记维保"
                ),
                hazard_ticket_no=ticket_no,
            )

        interval = common["interval_days"]
        proposed = add_days(date.fromisoformat(register_date), interval)
        # 原计划更晚的不要提前：取“登记日+周期”与“原计划日期”中更晚者
        next_day = later_of(proposed, parse_day(previous))
        next_date = format_day(next_day)
        self.device_repo.update_next_maintenance(device["id"], register_date, next_date)

        return create_maintenance_item_result(
            **common,
            result="REGISTERED",
            next_maintenance_at=next_date,
            last_maintenance_at=register_date,
            skipped_reason="",
            hazard_ticket_no="",
        )

    def _find_open_hazard_on_floor(self, building_id, floor):
        device_ids = self.result_repo.find_device_ids_on_floor(building_id, floor)
        if not device_ids:
            return None
        result_ids = {
            int(row["id"])
            for row in self.result_repo.find_all()
            if int(row["device_id"]) in device_ids
        }
        open_tickets = self.hazard_repo.find_open_by_result_ids(result_ids)
        return open_tickets[0] if open_tickets else None
