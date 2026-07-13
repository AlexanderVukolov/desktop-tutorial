"""
Демо-данные для запуска программы без подключения к amoCRM.

Позволяют посмотреть интерфейс и убедиться, что всё работает,
ещё до того, как вы вставите реальный токен amoCRM.
Включаются переменной DEMO_MODE=1 в файле .env.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from .amocrm_client import Deal, Pipeline

# Две воронки = два проекта, как в ваших таблицах.
DEMO_PIPELINES: dict[int, Pipeline] = {
    101: Pipeline(
        id=101,
        name="Нутрициология",
        statuses={
            1: "Первичный контакт",
            2: "Переговоры",
            3: "Выставлен счёт",
            142: "Оплачено",
            143: "Отказ",
        },
    ),
    102: Pipeline(
        id=102,
        name="Фитнес",
        statuses={
            4: "Заявка",
            5: "Пробное занятие",
            6: "Выставлен счёт",
            142: "Оплачено",
            143: "Отказ",
        },
    ),
}


def _dt(days_ago: int) -> datetime:
    return datetime.now(tz=timezone.utc) - timedelta(days=days_ago)


def _make(idx: int, pipeline_id: int, status_id: int, price: float, days_ago: int,
          manager: str, qualified: bool = True, installment: float = 0.0,
          prepayment: float = 0.0) -> Deal:
    is_won = status_id == 142
    # По выигранной сделке деньги в кассу ≈ цена минус комиссия (демо: 3,5%).
    cash = round(price * 0.965) if is_won else 0.0
    return Deal(
        id=idx,
        name=f"Ученик №{idx}",
        price=price,
        pipeline_id=pipeline_id,
        status_id=status_id,
        responsible_user_id=1 if manager == "Анна" else 2,
        created_at=_dt(days_ago),
        updated_at=_dt(max(days_ago - 3, 0)),
        closed_at=_dt(max(days_ago - 5, 0)) if status_id in (142, 143) else None,
        is_won=is_won,
        is_lost=status_id == 143,
        custom={
            "Менеджер": manager,
            "Источник": "Instagram" if idx % 2 else "Сайт",
            "Квал": "да" if qualified else "нет",
            "Деньги в кассу": cash,
            "Рассрочка": installment,
            "Предоплата": prepayment,
        },
    )


# Небольшой, но реалистичный набор сделок по двум проектам.
DEMO_DEALS: list[Deal] = [
    _make(1, 101, 142, 45000, 40, "Анна"),
    _make(2, 101, 142, 45000, 35, "Анна"),
    _make(3, 101, 3, 45000, 20, "Анна"),
    _make(4, 101, 2, 45000, 12, "Пётр"),
    _make(5, 101, 143, 45000, 30, "Пётр"),
    _make(6, 101, 1, 45000, 4, "Анна"),
    _make(7, 101, 142, 90000, 60, "Пётр"),
    _make(8, 102, 142, 30000, 50, "Пётр"),
    _make(9, 102, 142, 30000, 45, "Анна"),
    _make(10, 102, 6, 30000, 18, "Пётр"),
    _make(11, 102, 5, 30000, 9, "Анна"),
    _make(12, 102, 143, 30000, 25, "Пётр"),
    _make(13, 102, 4, 30000, 3, "Анна"),
    _make(14, 102, 142, 60000, 70, "Анна"),
    _make(15, 102, 142, 30000, 15, "Пётр"),
]

DEMO_USERS: dict[int, str] = {1: "Анна", 2: "Пётр"}
