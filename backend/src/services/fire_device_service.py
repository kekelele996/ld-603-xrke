from datetime import datetime, timedelta, timezone
from src.constants.maintenance_cycle import MAINTENANCE_INTERVAL_DAYS
from src.constants.log_templates import LOG_TEMPLATES
from src.constants.error_messages import ERROR_MESSAGES
from src.constructors.fire_device_factory import create_maintenance_result_dto
from src.repositories.fire_device_repository import FireDeviceRepository
from src.repositories.hazard_ticket_repository import HazardTicketRepository
from src.repositories.building_repository import BuildingRepository

def _parse_iso(value):
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None

def _format_iso(value):
    return value.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

class FireDeviceService:
    def __init__(self):
        self.repo = FireDeviceRepository()
        self.hazard_repo = HazardTicketRepository()
        self.building_repo = BuildingRepository()
    def list(self):
        return self.repo.find_all()
    def register_maintenance(self, device_ids):
        if not isinstance(device_ids, list) or not device_ids:
            raise ValueError(ERROR_MESSAGES["VALIDATION_FAILED"])
        now = datetime.now(timezone.utc)
        results = []
        for device_id in device_ids:
            device = self.repo.find_by_id(device_id)
            if device is None:
                results.append(create_maintenance_result_dto(device_id=device_id, result_status="NOT_FOUND", message=ERROR_MESSAGES["DEVICE_NOT_FOUND"]))
                continue
            building = self.building_repo.find_by_id(device["building_id"])
            building_name = building["name"] if building else str(device["building_id"])
            open_hazards = self.hazard_repo.find_open_by_location(device["building_id"], device["floor"])
            if open_hazards:
                ticket_ids = [ticket["id"] for ticket in open_hazards]
                results.append(create_maintenance_result_dto(
                    device_id=device["id"],
                    device_code=device["device_code"],
                    result_status="SKIPPED_HAZARD",
                    building_id=device["building_id"],
                    building_name=building_name,
                    floor=device["floor"],
                    hazard_ticket_ids=ticket_ids,
                    previous_next_maintenance_at=device["next_maintenance_at"],
                    next_maintenance_at=device["next_maintenance_at"],
                    message=f"楼栋 {building_name} {device['floor']} 存在未关闭隐患（单号 {', '.join('#' + str(tid) for tid in ticket_ids)}），跳过该设备"
                ))
                continue
            interval = MAINTENANCE_INTERVAL_DAYS.get(device["device_type"])
            if interval is None:
                results.append(create_maintenance_result_dto(
                    device_id=device["id"],
                    device_code=device["device_code"],
                    result_status="UNKNOWN_TYPE",
                    building_id=device["building_id"],
                    building_name=building_name,
                    floor=device["floor"],
                    previous_next_maintenance_at=device["next_maintenance_at"],
                    next_maintenance_at=device["next_maintenance_at"],
                    message=f"未知设备类型 {device['device_type']}，无法计算维保周期"
                ))
                continue
            computed = now + timedelta(days=interval)
            existing = _parse_iso(device["next_maintenance_at"])
            if existing is not None and existing > computed:
                results.append(create_maintenance_result_dto(
                    device_id=device["id"],
                    device_code=device["device_code"],
                    result_status="KEPT",
                    building_id=device["building_id"],
                    building_name=building_name,
                    floor=device["floor"],
                    previous_next_maintenance_at=device["next_maintenance_at"],
                    next_maintenance_at=device["next_maintenance_at"],
                    message=f"原计划 {device['next_maintenance_at']} 更晚，保留原日期"
                ))
                continue
            next_maintenance_at = _format_iso(computed)
            previous = device["next_maintenance_at"]
            self.repo.update_next_maintenance(device["id"], next_maintenance_at)
            results.append(create_maintenance_result_dto(
                device_id=device["id"],
                device_code=device["device_code"],
                result_status="UPDATED",
                building_id=device["building_id"],
                building_name=building_name,
                floor=device["floor"],
                previous_next_maintenance_at=previous,
                next_maintenance_at=next_maintenance_at,
                message=f"已登记维保，下次维保日期 {next_maintenance_at}（周期 {interval} 天）"
            ))
        print(LOG_TEMPLATES["FireDevice"][4], device_ids)
        return results
