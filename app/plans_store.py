"""
Хранилище плановых показателей.

Планы (лиды / продажи / выручка) по проектам и месяцам можно
редактировать прямо в веб-панели. Здесь они сохраняются в файл
plans.json рядом с программой, чтобы не терялись между запусками.

Значения по умолчанию берутся из app/mapping.py; сохранённые в файле
планы имеют приоритет.
"""

from __future__ import annotations

import json
import os
from typing import Any

from . import mapping as M

# Файл с планами лежит в корне проекта (рядом с run.py).
_PLANS_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "plans.json")


def _load_file() -> dict[str, dict[str, dict[str, float]]]:
    if not os.path.exists(_PLANS_PATH):
        return {}
    try:
        with open(_PLANS_PATH, encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return {}


def _save_file(data: dict[str, Any]) -> None:
    with open(_PLANS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _defaults() -> dict[str, dict[str, dict[str, float]]]:
    """Планы по умолчанию из mapping.py."""
    out: dict[str, dict[str, dict[str, float]]] = {}
    for proj in M.PROJECTS:
        out[proj.name] = {
            month: {"leads": p.leads, "sales": p.sales, "revenue": p.revenue}
            for month, p in proj.plans.items()
        }
    return out


def get_all_plans() -> dict[str, dict[str, dict[str, float]]]:
    """Все планы: значения по умолчанию + сохранённые правки (правки в приоритете)."""
    merged = _defaults()
    saved = _load_file()
    for project, months in saved.items():
        merged.setdefault(project, {})
        for month, values in months.items():
            merged[project][month] = values
    return merged


def get_plan(project_name: str, month: str) -> dict[str, float]:
    """План конкретного проекта на месяц (нули, если не задан)."""
    plans = get_all_plans()
    return plans.get(project_name, {}).get(
        month, {"leads": 0, "sales": 0, "revenue": 0}
    )


def save_plan(project_name: str, month: str, leads: float, sales: float,
              revenue: float) -> None:
    """Сохранить/обновить план проекта на месяц."""
    data = _load_file()
    data.setdefault(project_name, {})
    data[project_name][month] = {
        "leads": leads,
        "sales": sales,
        "revenue": revenue,
    }
    _save_file(data)
