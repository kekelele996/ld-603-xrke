from src.repositories.fire_device_repository import FireDeviceRepository
from src.utils.date_utils import is_due


class FireDeviceService:
    def __init__(self):
        self.repo = FireDeviceRepository()

    def list(self):
        return self.repo.find_all()

    def list_due(self):
        return [row for row in self.repo.find_all() if is_due(row.get("next_maintenance_at"))]
