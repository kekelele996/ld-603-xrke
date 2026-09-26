from src.seed import seed


class FireDeviceRepository:
    def find_all(self):
        return seed["fireDevice"]

    def find_by_ids(self, device_ids):
        wanted = {int(value) for value in device_ids}
        return [row for row in seed["fireDevice"] if int(row["id"]) in wanted]

    def update_next_maintenance(self, device_id, register_date, next_date):
        for row in seed["fireDevice"]:
            if int(row["id"]) == int(device_id):
                row["last_maintenance_at"] = register_date
                row["next_maintenance_at"] = next_date
                return row
        return None
