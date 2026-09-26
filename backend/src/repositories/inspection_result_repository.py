from src.seed import seed


class InspectionResultRepository:
    def find_all(self):
        return seed["inspectionResult"]

    def find_device_ids_on_floor(self, building_id, floor):
        """返回同楼栋同层、且产生过巡检结果的设备 id。"""
        floor_device_ids = {
            int(device["id"])
            for device in seed["fireDevice"]
            if int(device["building_id"]) == int(building_id) and str(device["floor"]) == str(floor)
        }
        return {
            int(row["device_id"])
            for row in seed["inspectionResult"]
            if int(row["device_id"]) in floor_device_ids
        }
