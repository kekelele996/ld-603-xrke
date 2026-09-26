// 本地种子数据：后端离线时由 api 层回退使用，结构与 backend/src/seed.py 保持一致。
export const mockData = {
  "building": [
    { "id": 1, "name": "1号研发楼", "campus": "云溪科技园", "floor_count": 8, "fire_grade": "一级", "manager_id": 1, "address_code": "330106" },
    { "id": 2, "name": "2号综合楼", "campus": "云溪科技园", "floor_count": 6, "fire_grade": "二级", "manager_id": 2, "address_code": "330106" },
    { "id": 3, "name": "3号仓储楼", "campus": "云溪科技园", "floor_count": 3, "fire_grade": "二级", "manager_id": 3, "address_code": "330108" }
  ],
  "fireDevice": [
    { "id": 1, "building_id": 1, "device_code": "MHQ-A1-01", "device_type": "EXTINGUISHER", "floor": "1F", "location_desc": "一层大厅东侧", "install_date": "2025-01-10", "status": "NORMAL", "next_maintenance_at": "2026-09-20", "last_maintenance_at": "2026-08-21" },
    { "id": 2, "building_id": 1, "device_code": "XHS-A3-02", "device_type": "HYDRANT", "floor": "3F", "location_desc": "三层电梯厅西侧", "install_date": "2024-05-18", "status": "NORMAL", "next_maintenance_at": "2026-10-10", "last_maintenance_at": "2026-07-12" },
    { "id": 3, "building_id": 1, "device_code": "YG-A5-03", "device_type": "SMOKE_DETECTOR", "floor": "5F", "location_desc": "五层走道吊顶", "install_date": "2024-11-02", "status": "NORMAL", "next_maintenance_at": "2027-01-15", "last_maintenance_at": "2026-07-19" },
    { "id": 4, "building_id": 1, "device_code": "PL-A2-04", "device_type": "SPRINKLER", "floor": "2F", "location_desc": "二层办公区管网", "install_date": "2023-09-01", "status": "NORMAL", "next_maintenance_at": "2027-03-01", "last_maintenance_at": "2026-03-01" },
    { "id": 5, "building_id": 2, "device_code": "XHS-B2-01", "device_type": "HYDRANT", "floor": "2F", "location_desc": "二层会议室旁", "install_date": "2024-06-30", "status": "HAZARD_PENDING", "next_maintenance_at": "2026-09-15", "last_maintenance_at": "2026-06-17" },
    { "id": 6, "building_id": 2, "device_code": "YJD-B1-02", "device_type": "EXIT_LIGHT", "floor": "1F", "location_desc": "一层疏散通道口", "install_date": "2025-02-14", "status": "NORMAL", "next_maintenance_at": "2026-09-01", "last_maintenance_at": "2025-09-01" },
    { "id": 7, "building_id": 2, "device_code": "MHQ-B4-03", "device_type": "EXTINGUISHER", "floor": "4F", "location_desc": "四层茶水间门口", "install_date": "2025-08-08", "status": "NORMAL", "next_maintenance_at": "2026-11-30", "last_maintenance_at": "2026-11-01" },
    { "id": 8, "building_id": 3, "device_code": "YG-C1-01", "device_type": "SMOKE_DETECTOR", "floor": "1F", "location_desc": "仓库出入口", "install_date": "2024-03-20", "status": "NORMAL", "next_maintenance_at": "2026-08-25", "last_maintenance_at": "2026-02-25" },
    { "id": 9, "building_id": 3, "device_code": "PL-C1-02", "device_type": "SPRINKLER", "floor": "1F", "location_desc": "货架区湿式管网", "install_date": "2023-12-12", "status": "HAZARD_PENDING", "next_maintenance_at": "2026-12-12", "last_maintenance_at": "2025-12-12" },
    { "id": 10, "building_id": 3, "device_code": "MHQ-C2-03", "device_type": "EXTINGUISHER", "floor": "2F", "location_desc": "二层分拣区立柱", "install_date": "2025-05-05", "status": "NORMAL", "next_maintenance_at": "2026-09-10", "last_maintenance_at": "2026-08-11" }
  ],
  "inspectionTask": [
    { "id": 1, "building_id": 1, "inspector_id": 1, "plan_date": "2026-09-05", "task_type": "HYDRANT", "status": "REVIEWED", "checklist_version": "v2.1", "finished_at": "2026-09-05" },
    { "id": 2, "building_id": 2, "inspector_id": 2, "plan_date": "2026-09-12", "task_type": "EXIT_LIGHT", "status": "REVIEWED", "checklist_version": "v2.1", "finished_at": "2026-09-12" },
    { "id": 3, "building_id": 3, "inspector_id": 3, "plan_date": "2026-09-18", "task_type": "SPRINKLER", "status": "SUBMITTED", "checklist_version": "v2.1", "finished_at": "2026-09-18" }
  ],
  "inspectionResult": [
    { "id": 1, "task_id": 1, "device_id": 1, "item_code": "PRESSURE", "result_status": "OK", "measured_value": "1.3MPa", "photo_url": "/mock/result-1.png", "note": "压力正常" },
    { "id": 2, "task_id": 1, "device_id": 2, "item_code": "VALVE", "result_status": "ABNORMAL", "measured_value": "锈蚀", "photo_url": "/mock/result-2.png", "note": "阀门轻微锈蚀，已开单" },
    { "id": 3, "task_id": 2, "device_id": 5, "item_code": "WATER_PRESSURE", "result_status": "ABNORMAL", "measured_value": "0.18MPa", "photo_url": "/mock/result-3.png", "note": "静压不足，开单整改" },
    { "id": 4, "task_id": 2, "device_id": 6, "item_code": "BATTERY", "result_status": "OK", "measured_value": "92%", "photo_url": "/mock/result-4.png", "note": "电池容量正常" },
    { "id": 5, "task_id": 3, "device_id": 9, "item_code": "PIPE", "result_status": "ABNORMAL", "measured_value": "渗漏", "photo_url": "/mock/result-5.png", "note": "接口渗漏，开单整改" }
  ],
  "hazardTicket": [
    { "id": 1, "result_id": 2, "severity": "LOW", "owner_id": 2, "deadline": "2026-09-30", "rectify_status": "CLOSED", "rectify_note": "已除锈刷漆", "closed_at": "2026-09-08", "ticket_no": "YH-2026-0001" },
    { "id": 2, "result_id": 3, "severity": "HIGH", "owner_id": 2, "deadline": "2026-09-25", "rectify_status": "RECTIFYING", "rectify_note": "待维保商上门试压", "closed_at": "", "ticket_no": "YH-2026-0002" },
    { "id": 3, "result_id": 5, "severity": "MEDIUM", "owner_id": 3, "deadline": "2026-09-28", "rectify_status": "RECTIFYING", "rectify_note": "接口配件采购中", "closed_at": "", "ticket_no": "YH-2026-0003" }
  ]
} as const;
