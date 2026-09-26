def create_maintenance_register_payload(**overrides):
    """维保登记请求 DTO 默认结构。"""
    payload = {"device_ids": [], "register_date": ""}
    payload.update(overrides)
    return payload


def create_maintenance_item_result(**overrides):
    """单台设备维保登记结果 DTO。"""
    row = {
        "device_id": 0,
        "device_code": "",
        "device_type": "EXTINGUISHER",
        "building_id": 0,
        "building_name": "",
        "floor": "",
        "location_desc": "",
        "result": "REGISTERED",
        "previous_maintenance_at": "",
        "next_maintenance_at": "",
        "last_maintenance_at": "",
        "interval_days": 0,
        "skipped_reason": "",
        "hazard_ticket_no": "",
    }
    row.update(overrides)
    return row


def create_maintenance_summary(registered=0, skipped=0):
    return {"registered": registered, "skipped": skipped, "total": registered + skipped}
