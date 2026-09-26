def create_fire_device_dto(**overrides):
    row = {"id":1,"building_id":1,"device_code":"device code 1","device_type":"HYDRANT","floor":"floor 1","location_desc":"location desc 1","install_date":"2026-06-11T09:00:00Z","status":"IN_PROGRESS","next_maintenance_at":"2026-06-11T09:00:00Z"}
    row.update(overrides)
    return row

def create_maintenance_result_dto(**overrides):
    row = {"device_id":0,"device_code":"","result_status":"UPDATED","building_id":0,"building_name":"","floor":"","hazard_ticket_ids":[],"previous_next_maintenance_at":"","next_maintenance_at":"","message":""}
    row.update(overrides)
    return row
