"""
Клиент для работы с API amoCRM (версия v4).

Отвечает за подключение к вашему аккаунту amoCRM и получение данных:
воронок, этапов и сделок (с суммами, статусами и датами).

Документация API: https://www.amocrm.ru/developers/content/crm_platform/api-reference
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Iterable

import requests


class AmoCRMError(Exception):
    """Ошибка при обращении к amoCRM (неверный токен, сеть, лимиты и т.п.)."""


@dataclass
class AmoCRMConfig:
    """Настройки подключения. Обычно заполняются из файла .env."""

    subdomain: str
    access_token: str
    domain: str = "amocrm.ru"

    @property
    def base_url(self) -> str:
        return f"https://{self.subdomain}.{self.domain}"


@dataclass
class Pipeline:
    """Воронка продаж и её этапы."""

    id: int
    name: str
    # Соответствие: id этапа -> название этапа
    statuses: dict[int, str] = field(default_factory=dict)


@dataclass
class Deal:
    """Одна сделка amoCRM, приведённая к удобному виду."""

    id: int
    name: str
    price: float
    pipeline_id: int | None
    status_id: int | None
    responsible_user_id: int | None
    created_at: datetime | None
    updated_at: datetime | None
    closed_at: datetime | None
    is_won: bool
    is_lost: bool
    # Кастомные поля: название поля -> значение
    custom: dict[str, Any] = field(default_factory=dict)


def _ts_to_dt(ts: int | None) -> datetime | None:
    """Unix-время amoCRM -> datetime (или None)."""
    if not ts:
        return None
    return datetime.fromtimestamp(int(ts), tz=timezone.utc)


class AmoCRMClient:
    """
    Тонкая обёртка над REST API amoCRM.

    Пример:
        cfg = AmoCRMConfig(subdomain="myschool", access_token="...")
        client = AmoCRMClient(cfg)
        pipelines = client.get_pipelines()
        deals = client.get_deals()
    """

    # amoCRM ограничивает частоту запросов; между страницами делаем паузу.
    _REQUEST_PAUSE_SEC = 0.2
    _PAGE_LIMIT = 250  # максимум объектов на страницу в API v4

    def __init__(self, config: AmoCRMConfig, timeout: int = 30):
        self.config = config
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update(
            {
                "Authorization": f"Bearer {config.access_token}",
                "Content-Type": "application/json",
            }
        )

    # ------------------------------------------------------------------ #
    #  Базовый запрос                                                     #
    # ------------------------------------------------------------------ #
    def _get(self, path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        url = f"{self.config.base_url}{path}"
        try:
            resp = self.session.get(url, params=params, timeout=self.timeout)
        except requests.RequestException as exc:
            raise AmoCRMError(f"Не удалось связаться с amoCRM: {exc}") from exc

        if resp.status_code == 401:
            raise AmoCRMError(
                "amoCRM отклонил токен (401). Проверьте AMOCRM_ACCESS_TOKEN — "
                "возможно, он неверный или устарел."
            )
        if resp.status_code == 403:
            raise AmoCRMError(
                "amoCRM запретил доступ (403). Проверьте поддомен и права интеграции."
            )
        if resp.status_code == 204:
            # Нет содержимого — обычно значит «данные закончились».
            return {}
        if not resp.ok:
            raise AmoCRMError(
                f"amoCRM вернул ошибку {resp.status_code}: {resp.text[:300]}"
            )

        try:
            return resp.json()
        except ValueError:
            return {}

    def _get_all_pages(
        self, path: str, params: dict[str, Any], entity_key: str
    ) -> Iterable[dict[str, Any]]:
        """Проходит все страницы списочного метода API (пагинация _links.next)."""
        page = 1
        params = dict(params)
        params["limit"] = self._PAGE_LIMIT
        while True:
            params["page"] = page
            data = self._get(path, params)
            if not data:
                break
            items = data.get("_embedded", {}).get(entity_key, [])
            if not items:
                break
            yield from items
            # Есть ли следующая страница?
            if not data.get("_links", {}).get("next"):
                break
            page += 1
            time.sleep(self._REQUEST_PAUSE_SEC)

    # ------------------------------------------------------------------ #
    #  Проверка подключения                                              #
    # ------------------------------------------------------------------ #
    def ping(self) -> dict[str, Any]:
        """Проверить, что токен рабочий. Возвращает данные аккаунта."""
        return self._get("/api/v4/account")

    # ------------------------------------------------------------------ #
    #  Воронки и этапы                                                   #
    # ------------------------------------------------------------------ #
    def get_pipelines(self) -> dict[int, Pipeline]:
        """Все воронки продаж вместе с этапами."""
        data = self._get("/api/v4/leads/pipelines")
        result: dict[int, Pipeline] = {}
        for p in data.get("_embedded", {}).get("pipelines", []):
            statuses = {
                s["id"]: s["name"]
                for s in p.get("_embedded", {}).get("statuses", [])
            }
            result[p["id"]] = Pipeline(id=p["id"], name=p["name"], statuses=statuses)
        return result

    # ------------------------------------------------------------------ #
    #  Пользователи (менеджеры)                                          #
    # ------------------------------------------------------------------ #
    def get_users(self) -> dict[int, str]:
        """Соответствие: id пользователя -> имя (для колонки «менеджер»)."""
        users: dict[int, str] = {}
        for u in self._get_all_pages("/api/v4/users", {}, "users"):
            users[u["id"]] = u.get("name", str(u["id"]))
        return users

    # ------------------------------------------------------------------ #
    #  Сделки                                                            #
    # ------------------------------------------------------------------ #
    def get_deals(
        self,
        created_from: datetime | None = None,
        created_to: datetime | None = None,
        pipeline_id: int | None = None,
    ) -> list[Deal]:
        """
        Получить сделки (лиды). Можно ограничить периодом создания и воронкой.

        created_from / created_to — границы по дате создания сделки.
        pipeline_id — если нужен только один проект/воронка.
        """
        params: dict[str, Any] = {"with": "loss_reason"}
        if created_from:
            params["filter[created_at][from]"] = int(created_from.timestamp())
        if created_to:
            params["filter[created_at][to]"] = int(created_to.timestamp())
        if pipeline_id:
            params["filter[pipeline_id]"] = pipeline_id

        deals: list[Deal] = []
        for raw in self._get_all_pages("/api/v4/leads", params, "leads"):
            deals.append(self._parse_deal(raw))
        return deals

    @staticmethod
    def _parse_deal(raw: dict[str, Any]) -> Deal:
        # В amoCRM «выигранная» сделка — этап с типом 142, «проигранная» — 143.
        status_id = raw.get("status_id")
        is_won = status_id == 142
        is_lost = status_id == 143

        custom: dict[str, Any] = {}
        for cf in raw.get("custom_fields_values") or []:
            name = cf.get("field_name") or str(cf.get("field_id"))
            values = cf.get("values") or []
            if not values:
                continue
            if len(values) == 1:
                custom[name] = values[0].get("value")
            else:
                custom[name] = [v.get("value") for v in values]

        return Deal(
            id=raw["id"],
            name=raw.get("name") or f"Сделка #{raw['id']}",
            price=float(raw.get("price") or 0),
            pipeline_id=raw.get("pipeline_id"),
            status_id=status_id,
            responsible_user_id=raw.get("responsible_user_id"),
            created_at=_ts_to_dt(raw.get("created_at")),
            updated_at=_ts_to_dt(raw.get("updated_at")),
            closed_at=_ts_to_dt(raw.get("closed_at")),
            is_won=is_won,
            is_lost=is_lost,
            custom=custom,
        )
