from src.constants.device_type import DeviceType

# 维保周期（天），按设备类型登记下次维保日期时使用
MAINTENANCE_INTERVAL_DAYS = {
    "EXTINGUISHER": 30,
    "HYDRANT": 90,
    "SMOKE_DETECTOR": 180,
    "SPRINKLER": 365,
    "EXIT_LIGHT": 365,
}

# 供筛选器/校验引用的合法类型，顺序需与 DeviceType 保持一致
MAINTENANCE_DEVICE_TYPES = list(DeviceType)
