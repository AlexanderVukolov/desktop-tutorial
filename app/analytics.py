"""
Агрегация финансовых данных из сделок amoCRM в отчёт «План-Факт».

Здесь считаются показатели, которые вы ведёте в Google Таблицах:
лиды (план/факт), квал-лиды, продажи, выручка, деньги в кассу,
рассрочка, предоплата, конверсия, средний чек — по проектам и менеджерам.
"""

from __future__ import annotations

from collections import defaultdict
from typing import Any

from .amocrm_client import Deal, Pipeline
from . import mapping as M


# --------------------------------------------------------------------------- #
#  Извлечение денежных показателей из сделки                                   #
# --------------------------------------------------------------------------- #
def _num(value: Any) -> float:
    """Аккуратно превратить значение поля в число."""
    if value is None or value == "":
        return 0.0
    try:
        return float(str(value).replace(" ", "").replace(",", "."))
    except (TypeError, ValueError):
        return 0.0


def _cash(d: Deal) -> float:
    """Деньги в кассу по сделке."""
    return _num(d.custom.get(M.FIELD_CASH))


def _installment(d: Deal) -> float:
    return _num(d.custom.get(M.FIELD_INSTALLMENT))


def _prepayment(d: Deal) -> float:
    return _num(d.custom.get(M.FIELD_PREPAYMENT))


def _manager(d: Deal, users: dict[int, str]) -> str:
    """Имя менеджера: из поля сделки или из ответственного пользователя."""
    val = d.custom.get(M.FIELD_MANAGER)
    if val:
        return str(val)
    if d.responsible_user_id and d.responsible_user_id in users:
        return users[d.responsible_user_id]
    return "—"


def _is_qualified(d: Deal) -> bool:
    """Является ли лид квалифицированным."""
    val = d.custom.get(M.FIELD_QUALIFIED)
    if val is not None and str(val).strip().lower() in M.QUALIFIED_TRUE_VALUES:
        return True
    if d.status_id in M.STATUS_QUALIFIED_IDS:
        return True
    return False


# --------------------------------------------------------------------------- #
#  Отчёт «План-Факт» по проектам                                              #
# --------------------------------------------------------------------------- #
def plan_fact_report(
    deals: list[Deal],
    pipelines: dict[int, Pipeline],
    users: dict[int, str],
    period_month: str | None = None,
) -> dict[str, Any]:
    """
    Собрать отчёт «План-Факт».

    period_month — месяц в формате "ГГГГ-ММ" для сопоставления с планом
    (если не задан, берётся месяц последней сделки).
    """
    projects_out: list[dict[str, Any]] = []
    grand = _empty_bucket()

    for proj in M.PROJECTS:
        proj_deals = [d for d in deals if d.pipeline_id == proj.pipeline_id]
        bucket = _fill_bucket(proj_deals, users)

        plan = proj.plans.get(period_month or "", M.MonthlyPlan())
        projects_out.append(
            {
                "name": proj.name,
                "pipeline_id": proj.pipeline_id,
                "fact": _bucket_to_dict(bucket),
                "plan": {
                    "leads": plan.leads,
                    "sales": plan.sales,
                    "revenue": plan.revenue,
                },
                "completion": {
                    "leads": _pct(bucket["leads"], plan.leads),
                    "sales": _pct(bucket["sales"], plan.sales),
                    "revenue": _pct(bucket["cash"], plan.revenue),
                },
                "by_manager": _by_manager(proj_deals, users),
            }
        )
        _merge(grand, bucket)

    # Сводный план по двум проектам = сумма планов проектов за месяц.
    total_plan_leads = sum(
        p.plans.get(period_month or "", M.MonthlyPlan()).leads for p in M.PROJECTS
    )
    total_plan_sales = sum(
        p.plans.get(period_month or "", M.MonthlyPlan()).sales for p in M.PROJECTS
    )
    total_plan_revenue = sum(
        p.plans.get(period_month or "", M.MonthlyPlan()).revenue for p in M.PROJECTS
    )

    total_dict = _bucket_to_dict(grand)
    return {
        "period": period_month,
        "total": total_dict,
        "total_plan": {
            "leads": total_plan_leads,
            "sales": total_plan_sales,
            "revenue": total_plan_revenue,
        },
        "total_completion": {
            "leads": _pct(grand["leads"], total_plan_leads),
            "sales": _pct(grand["sales"], total_plan_sales),
            "revenue": _pct(grand["cash"], total_plan_revenue),
        },
        "projects": projects_out,
        "by_source": _by_source(deals),
        "by_month": _by_month(deals),
    }


def _empty_bucket() -> dict[str, float]:
    return {
        "leads": 0.0, "qualified": 0.0, "sales": 0.0,
        "revenue": 0.0, "cash": 0.0, "installment": 0.0, "prepayment": 0.0,
    }


def _fill_bucket(deals: list[Deal], users: dict[int, str]) -> dict[str, float]:
    b = _empty_bucket()
    for d in deals:
        b["leads"] += 1
        if _is_qualified(d):
            b["qualified"] += 1
        if d.is_won:
            b["sales"] += 1
            b["revenue"] += d.price
        b["cash"] += _cash(d)
        b["installment"] += _installment(d)
        b["prepayment"] += _prepayment(d)
    return b


def _merge(dst: dict[str, float], src: dict[str, float]) -> None:
    for k, v in src.items():
        dst[k] += v


def _bucket_to_dict(b: dict[str, float]) -> dict[str, Any]:
    sales = b["sales"]
    leads = b["leads"]
    return {
        "leads": int(leads),
        "qualified": int(b["qualified"]),
        "sales": int(sales),
        "revenue": round(b["revenue"], 2),
        "cash": round(b["cash"], 2),
        "installment": round(b["installment"], 2),
        "prepayment": round(b["prepayment"], 2),
        "conversion": round((sales / leads * 100) if leads else 0, 1),
        "avg_check": round((b["cash"] / sales) if sales else 0, 2),
    }


def _pct(fact: float, plan: float) -> float:
    return round((fact / plan * 100), 1) if plan else 0.0


def _by_manager(deals: list[Deal], users: dict[int, str]) -> list[dict[str, Any]]:
    buckets: dict[str, dict[str, float]] = defaultdict(_empty_bucket)
    for d in deals:
        name = _manager(d, users)
        b = buckets[name]
        b["leads"] += 1
        if _is_qualified(d):
            b["qualified"] += 1
        if d.is_won:
            b["sales"] += 1
            b["revenue"] += d.price
        b["cash"] += _cash(d)
        b["installment"] += _installment(d)
        b["prepayment"] += _prepayment(d)

    rows = []
    for name, b in buckets.items():
        row = _bucket_to_dict(b)
        row["manager"] = name
        rows.append(row)
    rows.sort(key=lambda r: r["cash"], reverse=True)
    return rows


def _by_source(deals: list[Deal]) -> list[dict[str, Any]]:
    buckets: dict[str, dict[str, float]] = defaultdict(
        lambda: {"leads": 0.0, "sales": 0.0, "cash": 0.0}
    )
    for d in deals:
        src = str(d.custom.get(M.FIELD_SOURCE) or "Не указан")
        b = buckets[src]
        b["leads"] += 1
        if d.is_won:
            b["sales"] += 1
        b["cash"] += _cash(d)
    rows = [
        {
            "source": src,
            "leads": int(b["leads"]),
            "sales": int(b["sales"]),
            "cash": round(b["cash"], 2),
        }
        for src, b in buckets.items()
    ]
    rows.sort(key=lambda r: r["cash"], reverse=True)
    return rows


def _by_month(deals: list[Deal]) -> list[dict[str, Any]]:
    buckets: dict[str, dict[str, float]] = defaultdict(
        lambda: {"leads": 0.0, "sales": 0.0, "cash": 0.0}
    )
    for d in deals:
        if not d.created_at:
            continue
        key = d.created_at.strftime("%Y-%m")
        b = buckets[key]
        b["leads"] += 1
        if d.is_won:
            b["sales"] += 1
        b["cash"] += _cash(d)
    rows = [
        {
            "month": m,
            "leads": int(b["leads"]),
            "sales": int(b["sales"]),
            "cash": round(b["cash"], 2),
        }
        for m, b in buckets.items()
    ]
    rows.sort(key=lambda r: r["month"])
    return rows


def available_months(deals: list[Deal]) -> list[str]:
    months = {d.created_at.strftime("%Y-%m") for d in deals if d.created_at}
    return sorted(months, reverse=True)
