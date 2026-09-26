def audit_target(kind, id):
    return f"{kind}#{id}"


def format_hazard_ticket_no(ticket):
    """隐患单号优先取 ticket_no，缺省时回退为 YH-{id:04d}。"""
    if isinstance(ticket, dict):
        number = ticket.get("ticket_no")
        if number:
            return str(number)
        return f"YH-{int(ticket.get('id', 0)):04d}"
    return str(ticket)
