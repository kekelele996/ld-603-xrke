from typing import TypedDict, NotRequired, List, Literal


class MaintenanceRegisterPayload(TypedDict):
    device_ids: List[int]
    register_date: NotRequired[str]  # YYYY-MM-DD，缺省为今天


class MaintenanceItemResult(TypedDict):
    device_id: int
    device_code: str
    device_type: str
    building_id: int
    building_name: str
    floor: str
    location_desc: str
    result: Literal["REGISTERED", "SKIPPED"]
    previous_maintenance_at: str
    next_maintenance_at: str
    last_maintenance_at: str
    interval_days: int
    skipped_reason: str
    hazard_ticket_no: str
