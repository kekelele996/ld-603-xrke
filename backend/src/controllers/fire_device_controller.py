from src.services.fire_device_service import FireDeviceService
service = FireDeviceService()


def list_fire_device(due: bool = False):
    return service.list_due() if due else service.list()
