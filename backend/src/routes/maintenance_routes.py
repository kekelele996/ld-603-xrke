from fastapi import APIRouter
from src.controllers.maintenance_controller import register_maintenance

router = APIRouter(prefix="/api/maintenance", tags=["Maintenance"])
router.post("/register")(register_maintenance)
