from datetime import date, timedelta

DATE_FMT = "%Y-%m-%d"


def parse_day(value):
    """把 ISO/日期字符串归一化为 date，无法解析时返回 None。"""
    if not value:
        return None
    text = str(value).strip()
    if not text:
        return None
    try:
        return date.fromisoformat(text[:10])
    except ValueError:
        return None


def format_day(value):
    return value.strftime(DATE_FMT) if isinstance(value, date) else str(value)


def add_days(base, days):
    return base + timedelta(days=int(days))


def later_of(left, right):
    """原计划更晚时不得提前：取两个日期中更晚的一个。"""
    if left is None:
        return right
    if right is None:
        return left
    return left if left >= right else right


def is_due(next_maintenance_at, today=None):
    """到期判定：下次维保日期早于或等于今天即为已到期。"""
    target = parse_day(next_maintenance_at)
    if target is None:
        return False
    return target <= (today or date.today())
