from fastapi import APIRouter, Body
from src.controllers.fire_device_controller import list_fire_device, register_maintenance

router = APIRouter(prefix="/api/fire-device", tags=["FireDevice"])

router.get("")(list_fire_device)

def _register_maintenance(payload: dict = Body(...)):
    return register_maintenance(payload)

router.post("/maintenance")(_register_maintenance)
