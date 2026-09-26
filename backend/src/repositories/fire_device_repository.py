from src.seed import seed
class FireDeviceRepository:
    def find_all(self):
        return seed["fireDevice"]
    def find_by_id(self, device_id):
        for row in seed["fireDevice"]:
            if row["id"] == device_id:
                return row
        return None
    def update_next_maintenance(self, device_id, next_maintenance_at):
        row = self.find_by_id(device_id)
        if row is None:
            return None
        row["next_maintenance_at"] = next_maintenance_at
        return row
