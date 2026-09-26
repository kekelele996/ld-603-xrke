from fastapi import HTTPException
from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES
from src.services.fire_device_service import FireDeviceService
service = FireDeviceService()
def list_fire_device():
    return service.list()
def register_maintenance(payload: dict):
    try:
        device_ids = payload.get("device_ids")
        return {"results": service.register_maintenance(device_ids)}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail={"code": ERROR_CODES["VALIDATION_FAILED"], "message": str(exc)}) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail={"code": "INTERNAL_ERROR", "message": ERROR_MESSAGES.get("VALIDATION_FAILED", "internal error")}) from exc
