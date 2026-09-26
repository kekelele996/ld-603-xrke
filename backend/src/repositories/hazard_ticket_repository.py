from src.seed import seed
from src.constants.rectify_status import RECTIFY_STATUS_CLOSED
class HazardTicketRepository:
    def find_all(self):
        return seed["hazardTicket"]
    def find_open_by_location(self, building_id, floor):
        results_by_id = {row["id"]: row for row in seed["inspectionResult"]}
        devices_by_id = {row["id"]: row for row in seed["fireDevice"]}
        tickets = []
        for ticket in seed["hazardTicket"]:
            if ticket.get("rectify_status") == RECTIFY_STATUS_CLOSED:
                continue
            result = results_by_id.get(ticket["result_id"])
            device = devices_by_id.get(result["device_id"]) if result else None
            if device and device["building_id"] == building_id and device["floor"] == floor:
                tickets.append(ticket)
        return tickets
