from src.seed import seed


class HazardTicketRepository:
    def find_all(self):
        return seed["hazardTicket"]

    def find_open_by_result_ids(self, result_ids):
        """根据巡检结果 id 集合找出未关闭隐患单。"""
        wanted = {int(value) for value in result_ids}
        return [
            row
            for row in seed["hazardTicket"]
            if int(row["result_id"]) in wanted and not self._is_closed(row)
        ]

    @staticmethod
    def _is_closed(row):
        return str(row.get("rectify_status", "")).upper() == "CLOSED" or bool(row.get("closed_at"))
