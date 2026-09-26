def create_hazard_ticket_dto(**overrides):
    row = {"id":1,"result_id":1,"severity":"HIGH","owner_id":1,"deadline":"2026-09-25","rectify_status":"RECTIFYING","rectify_note":"待维保商上门试压","closed_at":"","ticket_no":"YH-2026-0001"}
    row.update(overrides)
    return row
