from src.seed import seed
class BuildingRepository:
    def find_all(self):
        return seed["building"]
    def find_by_id(self, building_id):
        for row in seed["building"]:
            if row["id"] == building_id:
                return row
        return None
