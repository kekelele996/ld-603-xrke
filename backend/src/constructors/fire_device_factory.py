def create_fire_device_dto(**overrides):
    row = {"id":1,"building_id":1,"device_code":"MHQ-A1-01","device_type":"EXTINGUISHER","floor":"1F","location_desc":"一层大厅东侧","install_date":"2025-01-10","status":"NORMAL","next_maintenance_at":"2026-09-20","last_maintenance_at":"2026-08-21"}
    row.update(overrides)
    return row
