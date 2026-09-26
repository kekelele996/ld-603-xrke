from src.services.maintenance_service import MaintenanceService
from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES

service = MaintenanceService()


def register_maintenance(payload: dict):
    device_ids = (payload or {}).get("device_ids")
    if not isinstance(device_ids, list) or not device_ids:
        return {
            "code": ERROR_CODES["VALIDATION_FAILED"],
            "message": ERROR_MESSAGES["VALIDATION_FAILED"],
        }
    try:
        return service.register({"device_ids": device_ids, "register_date": payload.get("register_date", "")})
    except Exception as exc:  # service/controller 分别包装，禁止全局吞异常
        return {"code": "MAINTENANCE_FAILED", "message": str(exc)}
